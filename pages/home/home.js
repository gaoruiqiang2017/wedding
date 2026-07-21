import { listDress } from '../../api/dress';
import { listStaff } from '../../api/staff';
import { dictLabel } from '../../utils/dict';
import { getShopName } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';

const DRESS_PLACEHOLDER = '/images/dress-default.png';
const STAFF_PLACEHOLDER = '/images/staff-default.png';

Page({
  data: {
    shopName: '',
    keyword: '',
    dressLeft: [],
    dressRight: [],
    dressLoading: false,
    staffList: [],
  },

  onLoad() {
    this.loadFeatured();
    this.loadStaff();
  },

  onShow() {
    this.setData({ shopName: getShopName() });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  onPullDownRefresh() {
    Promise.all([this.loadFeatured(), this.loadStaff()])
      .then(() => wx.stopPullDownRefresh())
      .catch(() => wx.stopPullDownRefresh());
  },

  onShareAppMessage() {
    return { title: '花田喜事 · 门店礼服款式展示', path: '/pages/home/home' };
  },

  loadFeatured() {
    this.setData({ dressLoading: true });
    return listDress({ pageNum: 1, pageSize: 8 })
      .then((res) => {
        const rows = (res.rows || []).map((it) => ({
          ...it,
          cover: mediaUrl(it.coverImg) || DRESS_PLACEHOLDER,
        }));
        const left = [];
        const right = [];
        rows.forEach((it, i) => (i % 2 === 0 ? left : right).push(it));
        this.setData({ dressLeft: left, dressRight: right });
      })
      .catch(() => {})
      .then(() => this.setData({ dressLoading: false }));
  },

  loadStaff() {
    return listStaff({ pageNum: 1, pageSize: 8 })
      .then((res) => {
        const rows = (res.rows || []).map((s) => ({
          ...s,
          cover: mediaUrl(s.avatar) || STAFF_PLACEHOLDER,
          levelLabel: dictLabel('hf_staff_level', s.level),
        }));
        this.setData({ staffList: rows });
      })
      .catch(() => {});
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.goDressHall({ dressName: this.data.keyword });
  },

  // switchTab 无法携带 query,首页向婚纱馆传搜索条件用本地存储
  goDressHall(filter) {
    if (filter && filter.dressName) {
      wx.setStorageSync('hf_dress_filter', { dressName: filter.dressName, style: '' });
    } else {
      wx.removeStorageSync('hf_dress_filter');
    }
    wx.switchTab({ url: '/pages/dress/index' });
  },

  goStaff() {
    wx.switchTab({ url: '/pages/staff/index' });
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/dress-detail/index?id=${e.currentTarget.dataset.id}` });
  },

  goStaffDetail(e) {
    wx.navigateTo({ url: `/pages/staff-detail/index?id=${e.currentTarget.dataset.id}` });
  },

  openUrl(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' }),
    });
  },
});
