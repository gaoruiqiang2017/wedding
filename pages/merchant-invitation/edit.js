import {
  getInvitationAdmin,
  addInvitation,
  updateInvitation,
} from '../../api/invitation';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { INVITE_STYLES } from '../../utils/invite-styles';
import {
  INVITE_MUSIC,
  musicKeyByUrl,
  musicUrlByKey,
} from '../../utils/invite-music';

const MAX_ALBUM = 9;
const PREVIEW_DRAFT_KEY = 'hf_invitation_preview_draft';

function splitDateTime(v) {
  if (!v) return { datePart: '', timePart: '12:00' };
  const s = String(v).replace('T', ' ');
  const datePart = s.slice(0, 10);
  const timePart = s.length >= 16 ? s.slice(11, 16) : '12:00';
  return { datePart, timePart };
}

Page({
  data: {
    invitationId: '',
    form: {
      title: '',
      groomName: '',
      brideName: '',
      venueName: '',
      venueAddress: '',
      welcomeText: '',
      latitude: '',
      longitude: '',
    },
    datePart: '',
    timePart: '12:00',
    coordText: '',
    coverImg: '',
    coverUrl: '',
    album: [],
    albumUrls: [],
    musicUrl: '',
    musicKey: 'none',
    musicOptions: INVITE_MUSIC,
    styleOptions: INVITE_STYLES,
    styleIndex: 0,
    saving: false,
  },

  onLoad(opt) {
    if (!isMerchantLogin()) {
      wx.showToast({ title: '请先进入内容管理', icon: 'none' });
      setTimeout(() => wx.switchTab({ url: '/pages/about/index' }), 500);
      return;
    }
    if (opt && opt.id) {
      this.load(opt.id);
    }
  },

  onUnload() {
    this.stopPreviewMusic();
  },

  onHide() {
    this.stopPreviewMusic();
  },

  load(id) {
    wx.showLoading({ title: '加载中' });
    getInvitationAdmin(id)
      .then((res) => {
        const d = res.data || {};
        let album = [];
        try {
          album = d.album ? JSON.parse(d.album) : [];
        } catch (e) {
          album = [];
        }
        if (!Array.isArray(album)) album = [];
        const { datePart, timePart } = splitDateTime(d.weddingTime);
        const lat = d.latitude != null ? String(d.latitude) : '';
        const lng = d.longitude != null ? String(d.longitude) : '';
        const styleIndex = Math.max(
          0,
          INVITE_STYLES.findIndex((s) => s.value === d.style),
        );
        const musicUrl = d.musicUrl || '';
        this.setData({
          invitationId: String(id),
          form: {
            title: d.title || '',
            groomName: d.groomName || '',
            brideName: d.brideName || '',
            venueName: d.venueName || '',
            venueAddress: d.venueAddress || '',
            welcomeText: d.welcomeText || '',
            latitude: lat,
            longitude: lng,
          },
          datePart,
          timePart,
          coordText: lat && lng ? `${lat},${lng}` : '',
          coverImg: d.coverImg || '',
          coverUrl: mediaUrl(d.coverImg),
          album,
          albumUrls: album.map(mediaUrl),
          musicUrl,
          musicKey: musicKeyByUrl(musicUrl),
          styleIndex: styleIndex < 0 ? 0 : styleIndex,
        });
      })
      .catch(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) wx.navigateBack();
        else wx.redirectTo({ url: '/pages/merchant-invitation/index' });
      })
      .then(() => wx.hideLoading());
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value });
  },
  onDate(e) {
    this.setData({ datePart: e.detail.value });
  },
  onTime(e) {
    this.setData({ timePart: e.detail.value });
  },
  onStyleTap(e) {
    this.setData({ styleIndex: Number(e.currentTarget.dataset.index) || 0 });
  },
  onCoordInput(e) {
    const raw = e.detail.value || '';
    const parts = raw.split(/[,，\s]+/).filter((v) => v !== '');
    this.setData({
      coordText: raw,
      'form.latitude': parts[0] || '',
      'form.longitude': parts[1] || '',
    });
  },

  chooseCover() {
    const { chooseAndUpload } = require('../../utils/upload');
    chooseAndUpload()
      .then((url) => this.setData({ coverImg: url, coverUrl: mediaUrl(url) }))
      .catch((err) => {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: '上传失败', icon: 'none' });
      });
  },

  addAlbum() {
    if (this.data.album.length >= MAX_ALBUM) {
      wx.showToast({ title: '最多 9 张', icon: 'none' });
      return;
    }
    const { chooseAndUpload } = require('../../utils/upload');
    chooseAndUpload()
      .then((url) => {
        const album = this.data.album.concat(url);
        this.setData({ album, albumUrls: album.map(mediaUrl) });
      })
      .catch((err) => {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: '上传失败', icon: 'none' });
      });
  },

  removeAlbum(e) {
    const idx = e.currentTarget.dataset.index;
    const album = this.data.album.slice();
    album.splice(idx, 1);
    this.setData({ album, albumUrls: album.map(mediaUrl) });
  },

  previewAlbum(e) {
    wx.previewImage({
      current: this.data.albumUrls[e.currentTarget.dataset.index],
      urls: this.data.albumUrls,
    });
  },

  onMusicTap(e) {
    const key = String((e.currentTarget.dataset && e.currentTarget.dataset.key) || 'none');
    if (key === 'none') {
      this.stopPreviewMusic();
      this.setData({ musicKey: 'none', musicUrl: '' });
      return;
    }
    const musicUrl = musicUrlByKey(key);
    this.setData({ musicKey: key, musicUrl });
    if (musicUrl) this.previewBuiltinMusic(musicUrl);
  },

  previewBuiltinMusic(relUrl) {
    this.stopPreviewMusic();
    const src = mediaUrl(relUrl);
    if (!src) return;
    const audio = wx.createInnerAudioContext();
    audio.src = src;
    audio.obeyMuteSwitch = false;
    audio.onError(() => {
      wx.showToast({ title: '试听失败', icon: 'none' });
    });
    this._previewAudio = audio;
    try {
      audio.play();
    } catch (err) {
      /* ignore */
    }
  },

  stopPreviewMusic() {
    if (!this._previewAudio) return;
    try {
      this._previewAudio.stop();
      this._previewAudio.destroy();
    } catch (err) {
      /* ignore */
    }
    this._previewAudio = null;
  },

  chooseMusic() {
    const { chooseAndUploadAudio } = require('../../utils/upload');
    wx.showLoading({ title: '上传中', mask: true });
    chooseAndUploadAudio()
      .then((url) => {
        wx.hideLoading();
        this.stopPreviewMusic();
        this.setData({ musicUrl: url, musicKey: 'custom' });
        wx.showToast({ title: '音乐已上传', icon: 'success' });
      })
      .catch((err) => {
        wx.hideLoading();
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: (err && err.message) || '上传失败', icon: 'none' });
      });
  },

  buildPayload() {
    const { form, datePart, timePart, styleIndex, album, coverImg, musicUrl, coordText } = this.data;
    if (!form.groomName.trim() || !form.brideName.trim()) {
      wx.showToast({ title: '请填写新郎与新娘姓名', icon: 'none' });
      return null;
    }
    if (!datePart) {
      wx.showToast({ title: '请选择婚礼日期', icon: 'none' });
      return null;
    }
    let latitude = null;
    let longitude = null;
    if (coordText.trim()) {
      const latN = Number(form.latitude);
      const lngN = Number(form.longitude);
      if (Number.isNaN(latN) || Number.isNaN(lngN)) {
        wx.showToast({ title: '坐标格式不正确', icon: 'none' });
        return null;
      }
      latitude = latN;
      longitude = lngN;
    }
    const groomName = form.groomName.trim();
    const brideName = form.brideName.trim();
    const style = (INVITE_STYLES[styleIndex] && INVITE_STYLES[styleIndex].value) || 'floral';
    return {
      title: form.title.trim() || `${groomName} & ${brideName}`,
      groomName,
      brideName,
      weddingTime: `${datePart} ${timePart || '12:00'}:00`,
      venueName: form.venueName.trim(),
      venueAddress: form.venueAddress.trim(),
      welcomeText: form.welcomeText.trim(),
      coverImg,
      album: JSON.stringify(album),
      musicUrl: musicUrl || '',
      style,
      latitude,
      longitude,
      status: '0',
    };
  },

  previewPage() {
    const payload = this.buildPayload();
    if (!payload) return;
    this.stopPreviewMusic();
    try {
      wx.setStorageSync(PREVIEW_DRAFT_KEY, payload);
    } catch (e) {
      wx.showToast({ title: '预览数据过大，请精简图集后再试', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/invitation/index?preview=1&draft=1' });
  },

  save() {
    if (this.data.saving) return;
    const payload = this.buildPayload();
    if (!payload) return;
    const { invitationId } = this.data;
    this.setData({ saving: true });
    const req = invitationId
      ? updateInvitation({ ...payload, invitationId })
      : addInvitation(payload);
    req
      .then((res) => {
        this.setData({ saving: false });
        wx.showToast({ title: '已保存', icon: 'success' });
        if (!invitationId && res.data) {
          this.setData({ invitationId: String(res.data) });
        }
        try {
          wx.removeStorageSync(PREVIEW_DRAFT_KEY);
        } catch (e) {
          /* ignore */
        }
        setTimeout(() => wx.navigateBack(), 600);
      })
      .catch(() => {
        this.setData({ saving: false });
      });
  },
});
