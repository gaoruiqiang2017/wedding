import { getMerchantStore, saveMerchantStore } from '../../api/store';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';

Page({
  data: {
    form: {
      storeName: '',
      address: '',
      phone: '',
      businessHours: '',
      wechat: '',
      notice: '',
      latitude: '',
      longitude: '',
    },
    coordText: '',
    wechatQr: '',
    wechatQrUrl: '',
    saving: false,
  },

  onLoad() {
    if (!isMerchantLogin()) {
      wx.redirectTo({ url: '/pages/merchant-login/index' });
      return;
    }
    this.load();
  },

  load() {
    wx.showLoading({ title: '加载中' });
    getMerchantStore()
      .then((res) => {
        const s = res.data || {};
        const lat = s.latitude !== undefined && s.latitude !== null ? String(s.latitude) : '';
        const lng = s.longitude !== undefined && s.longitude !== null ? String(s.longitude) : '';
        this.setData({
          form: {
            storeName: s.storeName || '',
            address: s.address || '',
            phone: s.phone || '',
            businessHours: s.businessHours || '',
            wechat: s.wechat || '',
            notice: s.notice || '',
            latitude: lat,
            longitude: lng,
          },
          coordText: lat && lng ? `${lat},${lng}` : '',
          wechatQr: s.wechatQr || '',
          wechatQrUrl: mediaUrl(s.wechatQr),
        });
      })
      .catch(() => {})
      .then(() => wx.hideLoading());
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value });
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

  chooseQr() {
    const { chooseAndUpload } = require('../../utils/upload');
    chooseAndUpload()
      .then((url) => this.setData({ wechatQr: url, wechatQrUrl: mediaUrl(url) }))
      .catch((err) => {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: '上传失败', icon: 'none' });
      });
  },

  removeQr() {
    this.setData({ wechatQr: '', wechatQrUrl: '' });
  },

  previewQr() {
    if (this.data.wechatQrUrl) wx.previewImage({ urls: [this.data.wechatQrUrl] });
  },

  save() {
    if (this.data.saving) return;
    const { form, wechatQr, coordText } = this.data;
    if (!form.storeName.trim()) {
      wx.showToast({ title: '请填写门店名称', icon: 'none' });
      return;
    }
    let latitude = null;
    let longitude = null;
    if (coordText.trim()) {
      const latN = Number(form.latitude);
      const lngN = Number(form.longitude);
      if (!(latN && lngN && !Number.isNaN(latN) && !Number.isNaN(lngN))) {
        wx.showToast({ title: '坐标格式应为:纬度,经度', icon: 'none' });
        return;
      }
      latitude = latN;
      longitude = lngN;
    }
    const payload = { ...form, storeName: form.storeName.trim(), wechatQr, latitude, longitude };
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中', mask: true });
    saveMerchantStore(payload)
      .then(() => {
        wx.hideLoading();
        this.setData({ saving: false });
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 600);
      })
      .catch(() => {
        wx.hideLoading();
        this.setData({ saving: false });
      });
  },
});
