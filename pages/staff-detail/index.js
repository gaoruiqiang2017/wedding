import { getStaff } from '../../api/staff';
import { dictLabel } from '../../utils/dict';
import { parseAlbum, parseTags } from '../../utils/common';
import { mediaUrl } from '../../utils/media';

const STAFF_PLACEHOLDER = '/images/staff-default.png';

Page({
  data: {
    staffId: '',
    staff: {},
    avatar: STAFF_PLACEHOLDER,
    levelLabel: '',
    tagList: [],
    portfolioList: [],
    loaded: false,
  },

  onLoad(opt) {
    this.setData({ staffId: opt.id });
    this.loadDetail();
  },

  onShareAppMessage() {
    return {
      title: this.data.staff.staffName || '花田喜事 · 化妆造型',
      path: `/pages/staff-detail/index?id=${this.data.staffId}`,
    };
  },

  loadDetail() {
    getStaff(this.data.staffId)
      .then((res) => {
        const staff = res.data || {};
        // 顶部展示头像,作品集单独在下方展示,避免上下两块图片重复
        const avatar = mediaUrl(staff.avatar) || STAFF_PLACEHOLDER;
        const portfolioList = parseAlbum(staff.portfolio, '').map(mediaUrl).filter(Boolean);
        this.setData({
          staff,
          avatar,
          levelLabel: dictLabel('hf_staff_level', staff.level),
          tagList: parseTags(staff.tags),
          portfolioList,
          loaded: true,
        });
      })
      .catch(() => {});
  },

  preview(e) {
    wx.previewImage({
      urls: this.data.portfolioList,
      current: this.data.portfolioList[e.currentTarget.dataset.idx],
    });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index' });
  },

  goStore() {
    wx.navigateTo({ url: '/pages/store/index' });
  },
});
