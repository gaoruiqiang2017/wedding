import { getStaffAdmin, addStaff, updateStaff } from '../../api/staff-admin';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { dictOptions } from '../../utils/dict';

const TYPE_OPTIONS = dictOptions('hf_staff_type');
const LEVEL_OPTIONS = dictOptions('hf_staff_level');
const STATUS_OPTIONS = dictOptions('hf_staff_status');
const MAX_PORTFOLIO = 9;

Page({
  data: {
    isEdit: false,
    staffId: null,
    typeOptions: TYPE_OPTIONS,
    levelOptions: LEVEL_OPTIONS,
    statusOptions: STATUS_OPTIONS,
    typeIndex: 0,
    levelIndex: LEVEL_OPTIONS.length - 1,
    statusIndex: 0,
    avatar: '',
    avatarUrl: '',
    portfolio: [],
    portfolioUrls: [],
    form: {
      staffName: '',
      phone: '',
      yearsExp: '',
      tags: '',
      intro: '',
    },
    saving: false,
  },

  onLoad(options) {
    if (!isMerchantLogin()) {
      wx.redirectTo({ url: '/pages/merchant-login/index' });
      return;
    }
    if (options && options.staffId) {
      this.setData({ isEdit: true, staffId: options.staffId });
      wx.setNavigationBarTitle({ title: '编辑化妆师' });
      this.loadDetail(options.staffId);
    } else {
      wx.setNavigationBarTitle({ title: '新增化妆师' });
    }
  },

  loadDetail(staffId) {
    wx.showLoading({ title: '加载中' });
    getStaffAdmin(staffId)
      .then((res) => {
        wx.hideLoading();
        const s = res.data || {};
        let portfolio = [];
        try {
          portfolio = s.portfolio ? JSON.parse(s.portfolio) : [];
        } catch (e) {
          portfolio = [];
        }
        const findIdx = (opts, v, dft) => {
          const i = opts.findIndex((o) => o.value === String(v));
          return i >= 0 ? i : dft;
        };
        this.setData({
          avatar: s.avatar || '',
          avatarUrl: mediaUrl(s.avatar),
          portfolio,
          portfolioUrls: portfolio.map((u) => mediaUrl(u)),
          typeIndex: findIdx(TYPE_OPTIONS, s.staffType, 0),
          levelIndex: findIdx(LEVEL_OPTIONS, s.level, LEVEL_OPTIONS.length - 1),
          statusIndex: findIdx(STATUS_OPTIONS, s.status, 0),
          form: {
            staffName: s.staffName || '',
            phone: s.phone || '',
            yearsExp: s.yearsExp != null ? String(s.yearsExp) : '',
            tags: s.tags || '',
            intro: s.intro || '',
          },
        });
      })
      .catch(() => wx.hideLoading());
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value });
  },
  onType(e) {
    this.setData({ typeIndex: Number(e.detail.value) });
  },
  onLevel(e) {
    this.setData({ levelIndex: Number(e.detail.value) });
  },
  onStatus(e) {
    this.setData({ statusIndex: Number(e.detail.value) });
  },

  chooseAvatar() {
    const { chooseAndUpload } = require('../../utils/upload');
    chooseAndUpload()
      .then((url) => this.setData({ avatar: url, avatarUrl: mediaUrl(url) }))
      .catch((err) => {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: '上传失败', icon: 'none' });
      });
  },

  addPortfolio() {
    if (this.data.portfolio.length >= MAX_PORTFOLIO) {
      wx.showToast({ title: `最多 ${MAX_PORTFOLIO} 张`, icon: 'none' });
      return;
    }
    const { chooseAndUpload } = require('../../utils/upload');
    chooseAndUpload()
      .then((url) => {
        const portfolio = this.data.portfolio.concat(url);
        this.setData({ portfolio, portfolioUrls: portfolio.map((u) => mediaUrl(u)) });
      })
      .catch((err) => {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: '上传失败', icon: 'none' });
      });
  },
  removePortfolio(e) {
    const idx = e.currentTarget.dataset.index;
    const portfolio = this.data.portfolio.slice();
    portfolio.splice(idx, 1);
    this.setData({ portfolio, portfolioUrls: portfolio.map((u) => mediaUrl(u)) });
  },
  previewPortfolio(e) {
    const idx = e.currentTarget.dataset.index;
    wx.previewImage({ current: this.data.portfolioUrls[idx], urls: this.data.portfolioUrls });
  },

  save() {
    if (this.data.saving) return;
    const { form, staffId, isEdit, typeIndex, levelIndex, statusIndex, portfolio } = this.data;
    if (!form.staffName.trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    if (form.phone && !/^1\d{10}$/.test(form.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }
    const payload = {
      staffName: form.staffName.trim(),
      staffType: TYPE_OPTIONS[typeIndex].value,
      level: LEVEL_OPTIONS[levelIndex].value,
      status: STATUS_OPTIONS[statusIndex].value,
      phone: form.phone,
      tags: form.tags,
      intro: form.intro,
      avatar: this.data.avatar,
      portfolio: JSON.stringify(portfolio),
    };
    if (form.yearsExp !== '') payload.yearsExp = Number(form.yearsExp);
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中', mask: true });
    const req = isEdit ? updateStaff({ ...payload, staffId }) : addStaff(payload);
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
