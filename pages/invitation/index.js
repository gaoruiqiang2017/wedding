import { getInvitation, getInvitationAdmin } from '../../api/invitation';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { parseAlbum } from '../../utils/common';
import { INVITE_STYLE_VALUES } from '../../utils/invite-styles';

const PLACEHOLDER = '/images/dress-default.png';
const CARD_STYLES = new Set(['floral', 'classic', 'modern']);

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
    preview: false,
  },

  onLoad(opt) {
    this.setData({ invitationId: opt.id || '', preview: opt.preview === '1' });
    this.loadDetail();
  },

  onShareAppMessage() {
    const inv = this.data.invitation || {};
    return {
      title: inv.title || `${inv.groomName || ''} & ${inv.brideName || ''} 的婚礼邀请`,
      path: `/pages/invitation/index?id=${this.data.invitationId}`,
    };
  },

  loadDetail() {
    const id = this.data.invitationId;
    if (!id) {
      wx.showToast({ title: '请柬不存在', icon: 'none' });
      return;
    }
    const req =
      this.data.preview && isMerchantLogin() ? getInvitationAdmin(id) : getInvitation(id);
    req
      .then((res) => {
        const invitation = res.data || {};
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
          loaded: true,
        });
        if (invitation.title) wx.setNavigationBarTitle({ title: invitation.title });
      })
      .catch(() => wx.showToast({ title: '请柬不存在或未发布', icon: 'none' }));
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
