import {
  getInvitationAdmin,
  addInvitation,
  updateInvitation,
} from '../../api/invitation';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';

import { INVITE_STYLES } from '../../utils/invite-styles';

const MAX_ALBUM = 9;
const STYLE_OPTIONS = INVITE_STYLES;

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
    styleOptions: STYLE_OPTIONS,
    styleIndex: 0,
    saving: false,
  },

  onLoad(opt) {
    if (!isMerchantLogin()) {
      wx.switchTab({ url: '/pages/about/index' });
      return;
    }
    if (opt.id) {
      this.setData({ invitationId: opt.id });
      this.load(opt.id);
    }
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
          STYLE_OPTIONS.findIndex((s) => s.value === d.style),
        );
        this.setData({
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
          styleIndex: styleIndex < 0 ? 0 : styleIndex,
        });
      })
      .catch(() => {})
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

  previewPage() {
    if (!this.data.invitationId) return;
    wx.navigateTo({ url: `/pages/invitation/index?id=${this.data.invitationId}&preview=1` });
  },

  save() {
    if (this.data.saving) return;
    const { form, datePart, timePart, styleIndex, album, coverImg, invitationId, coordText } = this.data;
    if (!form.groomName.trim() || !form.brideName.trim()) {
      wx.showToast({ title: '请填写新郎与新娘姓名', icon: 'none' });
      return;
    }
    if (!datePart) {
      wx.showToast({ title: '请选择婚礼日期', icon: 'none' });
      return;
    }
    let latitude = null;
    let longitude = null;
    if (coordText.trim()) {
      const latN = Number(form.latitude);
      const lngN = Number(form.longitude);
      if (Number.isNaN(latN) || Number.isNaN(lngN)) {
        wx.showToast({ title: '坐标格式不正确', icon: 'none' });
        return;
      }
      latitude = latN;
      longitude = lngN;
    }
    const payload = {
      title: form.title.trim(),
      groomName: form.groomName.trim(),
      brideName: form.brideName.trim(),
      weddingTime: `${datePart} ${timePart || '12:00'}:00`,
      venueName: form.venueName.trim(),
      venueAddress: form.venueAddress.trim(),
      welcomeText: form.welcomeText.trim(),
      coverImg,
      album: JSON.stringify(album),
      style: STYLE_OPTIONS[styleIndex].value,
      latitude,
      longitude,
    };
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
        setTimeout(() => wx.navigateBack(), 600);
      })
      .catch(() => {
        this.setData({ saving: false });
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
  },
});
