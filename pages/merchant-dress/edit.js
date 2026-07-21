import { getDressAdmin, addDress, updateDress } from '../../api/dress-admin';
import { listDressStyles } from '../../api/dress-style';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { dictOptions } from '../../utils/dict';

const STATUS_OPTIONS = [
  { value: '0', label: '可租' },
  { value: '2', label: '清洗中' },
  { value: '3', label: '维修中' },
  { value: '9', label: '已下线' },
];
// 后端 hf_dress.style 存的是中文风格名(如"鱼尾"),而非字典码,故选项以名称作为值。
// 优先动态读取风格字典,请求失败时回退到内置字典。
const STYLE_OPTIONS = dictOptions('hf_dress_style').map((o) => ({ value: o.label, label: o.label }));
const MAX_ALBUM = 9;

Page({
  data: {
    isEdit: false,
    dressId: null,
    styleOptions: STYLE_OPTIONS,
    statusOptions: STATUS_OPTIONS,
    styleIndex: -1,
    statusIndex: 0,
    coverImg: '',
    coverUrl: '',
    album: [],
    albumUrls: [],
    form: {
      dressNo: '',
      dressName: '',
      color: '',
      dressSize: '',
      brand: '',
      rentPrice: '',
      deposit: '',
      remark: '',
    },
    saving: false,
  },

  onLoad(options) {
    if (!isMerchantLogin()) {
      wx.redirectTo({ url: '/pages/merchant-login/index' });
      return;
    }
    const isEdit = !!(options && options.dressId);
    if (isEdit) {
      this.setData({ isEdit: true, dressId: options.dressId });
      wx.setNavigationBarTitle({ title: '编辑婚纱' });
    } else {
      wx.setNavigationBarTitle({ title: '新增婚纱' });
    }
    // 先拉取风格选项,确保编辑回显时能按名称正确匹配到选中项
    this.loadStyles().then(() => {
      if (isEdit) this.loadDetail(options.dressId);
    });
  },

  loadStyles() {
    return listDressStyles()
      .then((res) => {
        const rows = res.data || [];
        if (rows.length) {
          this.setData({ styleOptions: rows.map((r) => ({ value: r.dictLabel, label: r.dictLabel })) });
        }
      })
      .catch(() => {});
  },

  loadDetail(dressId) {
    wx.showLoading({ title: '加载中' });
    getDressAdmin(dressId)
      .then((res) => {
        wx.hideLoading();
        const d = res.data || {};
        let album = [];
        try {
          album = d.album ? JSON.parse(d.album) : [];
        } catch (e) {
          album = [];
        }
        const styleOptions = this.data.styleOptions;
        const styleIndex = styleOptions.findIndex((o) => o.value === (d.style == null ? '' : String(d.style)));
        const statusIndex = Math.max(0, STATUS_OPTIONS.findIndex((o) => o.value === String(d.status)));
        this.setData({
          coverImg: d.coverImg || '',
          coverUrl: mediaUrl(d.coverImg),
          album,
          albumUrls: album.map((u) => mediaUrl(u)),
          styleIndex,
          statusIndex,
          form: {
            dressNo: d.dressNo || '',
            dressName: d.dressName || '',
            color: d.color || '',
            dressSize: d.dressSize || '',
            brand: d.brand || '',
            rentPrice: d.rentPrice != null ? String(d.rentPrice) : '',
            deposit: d.deposit != null ? String(d.deposit) : '',
            remark: d.remark || '',
          },
        });
      })
      .catch(() => wx.hideLoading());
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
  onStyle(e) {
    this.setData({ styleIndex: Number(e.detail.value) });
  },
  onStatus(e) {
    this.setData({ statusIndex: Number(e.detail.value) });
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
      wx.showToast({ title: `最多 ${MAX_ALBUM} 张`, icon: 'none' });
      return;
    }
    const { chooseAndUpload } = require('../../utils/upload');
    chooseAndUpload()
      .then((url) => {
        const album = this.data.album.concat(url);
        this.setData({ album, albumUrls: album.map((u) => mediaUrl(u)) });
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
    this.setData({ album, albumUrls: album.map((u) => mediaUrl(u)) });
  },
  previewAlbum(e) {
    const idx = e.currentTarget.dataset.index;
    wx.previewImage({ current: this.data.albumUrls[idx], urls: this.data.albumUrls });
  },

  save() {
    if (this.data.saving) return;
    const { form, dressId, isEdit, styleIndex, statusIndex, album, styleOptions } = this.data;
    if (!form.dressNo.trim()) {
      wx.showToast({ title: '请填写婚纱编号', icon: 'none' });
      return;
    }
    if (!form.dressName.trim()) {
      wx.showToast({ title: '请填写款式名称', icon: 'none' });
      return;
    }
    const payload = {
      dressNo: form.dressNo.trim(),
      dressName: form.dressName.trim(),
      style: styleIndex >= 0 ? styleOptions[styleIndex].value : '',
      color: form.color,
      dressSize: form.dressSize,
      brand: form.brand,
      coverImg: this.data.coverImg,
      status: STATUS_OPTIONS[statusIndex].value,
      remark: form.remark,
      rentPrice: Number(form.rentPrice) || 0,
      deposit: Number(form.deposit) || 0,
      album: JSON.stringify(album),
    };
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中', mask: true });
    const req = isEdit ? updateDress({ ...payload, dressId }) : addDress(payload);
    req
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
