import { getInvitation, getInvitationAdmin } from '../../api/invitation';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { parseAlbum } from '../../utils/common';
import { INVITE_STYLE_VALUES } from '../../utils/invite-styles';

const PLACEHOLDER = '/images/dress-default.png';
const CARD_STYLES = new Set(['floral', 'classic', 'modern']);
const PREVIEW_DRAFT_KEY = 'hf_invitation_preview_draft';

function formatTime(v) {
  if (!v) return '';
  const s = String(v).replace('T', ' ');
  return s.length >= 16 ? s.slice(0, 16) : s;
}

function splitWelcome(text) {
  if (!text) return [];
  return String(text)
    .split(/\n|\\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCalendar(weddingTime) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = weddingTime ? new Date(String(weddingTime).replace(/-/g, '/')) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const first = new Date(year, month - 1, 1).getDay();
  const total = new Date(year, month, 0).getDate();
  const days = [];
  for (let i = 0; i < first; i++) days.push(0);
  for (let i = 1; i <= total; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(0);
  return { year, month, day, weekdays, days };
}

function resolveLayout(style) {
  if (CARD_STYLES.has(style)) return 'card';
  return style;
}

Page({
  data: {
    invitationId: '',
    invitation: {},
    style: 'floral',
    layout: 'card',
    coverUrl: PLACEHOLDER,
    albumUrls: [],
    welcomeLines: [],
    timeText: '',
    hasGeo: false,
    markers: [],
    cal: { year: '', month: '', day: '', weekdays: [], days: [] },
    loaded: false,
    loadError: false,
    preview: false,
    draft: false,
    musicUrl: '',
    musicPlaying: false,
    hasMusic: false,
  },

  onLoad(opt) {
    const draft = opt.draft === '1';
    const preview = opt.preview === '1' || draft;
    this.setData({
      invitationId: opt.id || '',
      preview,
      draft,
    });
    if (draft) {
      this.loadDraft();
      return;
    }
    this.loadDetail();
  },

  onShow() {
    if (this._wantMusic && this.audioCtx && this.data.hasMusic) {
      this.audioCtx.play();
    }
  },

  onHide() {
    if (this.audioCtx && this.data.musicPlaying) {
      this._wantMusic = true;
      this.audioCtx.pause();
    } else {
      this._wantMusic = false;
    }
  },

  onUnload() {
    this.destroyMusic();
  },

  onShareAppMessage() {
    // 未保存草稿预览不可分享真实链接
    if (this.data.draft || !this.data.invitationId) {
      return {
        title: '花田喜事 · 婚礼请柬',
        path: '/pages/home/home',
      };
    }
    const inv = this.data.invitation || {};
    return {
      title: inv.title || `${inv.groomName || ''} & ${inv.brideName || ''} 的婚礼邀请`,
      path: `/pages/invitation/index?id=${this.data.invitationId}`,
    };
  },

  loadDraft() {
    let invitation = null;
    try {
      invitation = wx.getStorageSync(PREVIEW_DRAFT_KEY);
    } catch (e) {
      invitation = null;
    }
    if (!invitation || !invitation.groomName) {
      this.setData({ loaded: true, loadError: true });
      wx.showToast({ title: '预览数据已失效，请返回重试', icon: 'none' });
      return;
    }
    this.applyInvitation(invitation);
  },

  loadDetail() {
    const id = this.data.invitationId;
    if (!id) {
      this.setData({ loaded: true, loadError: true });
      wx.showToast({ title: '请柬不存在', icon: 'none' });
      return;
    }
    const req =
      this.data.preview && isMerchantLogin() ? getInvitationAdmin(id) : getInvitation(id);
    req
      .then((res) => {
        this.applyInvitation(res.data || {});
      })
      .catch(() => {
        // request 已 toast;结束加载态,展示空态而非永久「加载中」
        this.destroyMusic();
        this.setData({ loaded: true, loadError: true, hasMusic: false });
      });
  },

  applyInvitation(invitation) {
    const style = INVITE_STYLE_VALUES.includes(invitation.style) ? invitation.style : 'floral';
    const lat = Number(invitation.latitude);
    const lng = Number(invitation.longitude);
    const hasGeo = !!(lat && lng && !Number.isNaN(lat) && !Number.isNaN(lng));
    if (hasGeo) {
      invitation.latitude = lat;
      invitation.longitude = lng;
    }
    const albumUrls = parseAlbum(invitation.album, '').map(mediaUrl).filter(Boolean);
    const markers = hasGeo
      ? [
          {
            id: 1,
            latitude: lat,
            longitude: lng,
            width: 24,
            height: 24,
            callout: {
              content: invitation.venueName || '婚礼场地',
              display: 'ALWAYS',
              padding: 8,
              borderRadius: 8,
            },
          },
        ]
      : [];
    const musicUrl = mediaUrl(invitation.musicUrl);
    this.setData({
      invitation,
      style,
      layout: resolveLayout(style),
      coverUrl: mediaUrl(invitation.coverImg) || PLACEHOLDER,
      albumUrls,
      welcomeLines: splitWelcome(invitation.welcomeText),
      timeText: formatTime(invitation.weddingTime),
      hasGeo,
      markers,
      cal: buildCalendar(invitation.weddingTime),
      musicUrl,
      hasMusic: !!musicUrl,
      loaded: true,
      loadError: false,
    });
    if (invitation.title) wx.setNavigationBarTitle({ title: invitation.title });
    if (musicUrl) this.setupMusic(musicUrl);
  },

  setupMusic(src) {
    this.destroyMusic();
    const audio = wx.createInnerAudioContext();
    audio.loop = true;
    audio.obeyMuteSwitch = false;
    audio.src = src;
    audio.onPlay(() => this.setData({ musicPlaying: true }));
    audio.onPause(() => this.setData({ musicPlaying: false }));
    audio.onStop(() => this.setData({ musicPlaying: false }));
    audio.onEnded(() => this.setData({ musicPlaying: false }));
    audio.onError(() => {
      this.setData({ musicPlaying: false });
    });
    this.audioCtx = audio;
    this._wantMusic = true;
    // 尽量自动播放;若被系统拦截,用户点右上角音符即可开播
    try {
      audio.play();
    } catch (e) {
      /* ignore */
    }
  },

  destroyMusic() {
    this._wantMusic = false;
    if (this.audioCtx) {
      try {
        this.audioCtx.stop();
        this.audioCtx.destroy();
      } catch (e) {
        /* ignore */
      }
      this.audioCtx = null;
    }
    this.setData({ musicPlaying: false });
  },

  toggleMusic() {
    if (!this.audioCtx || !this.data.hasMusic) return;
    if (this.data.musicPlaying) {
      this._wantMusic = false;
      this.audioCtx.pause();
    } else {
      this._wantMusic = true;
      this.audioCtx.play();
    }
  },

  backToEdit() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/merchant-invitation/edit' }),
    });
  },

  previewCover() {
    const urls = this.data.albumUrls.length ? this.data.albumUrls : [this.data.coverUrl];
    wx.previewImage({ urls, current: this.data.coverUrl });
  },

  previewAlbum(e) {
    const idx = e.currentTarget.dataset.idx || 0;
    const urls = this.data.albumUrls.length ? this.data.albumUrls : [this.data.coverUrl];
    wx.previewImage({ urls, current: urls[idx] || urls[0] });
  },

  openLocation() {
    const inv = this.data.invitation;
    wx.openLocation({
      latitude: Number(inv.latitude),
      longitude: Number(inv.longitude),
      name: inv.venueName || '婚礼场地',
      address: inv.venueAddress || '',
    });
  },
});
