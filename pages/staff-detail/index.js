import { getStaff } from '../../api/staff';
import { dictLabel } from '../../utils/dict';
import { parseAlbum, parseTags } from '../../utils/common';
import { mediaUrl } from '../../utils/media';

const STAFF_PLACEHOLDER = '/images/staff-default.png';

Page({
  data: {
    staffId: '',
    staff: {},
    levelLabel: '',
    tagList: [],
    portfolioList: [],
    gallery: [],
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
        const avatar = mediaUrl(staff.avatar) || STAFF_PLACEHOLDER;
        const portfolioList = parseAlbum(staff.portfolio, '').map(mediaUrl).filter(Boolean);
        const gallery = portfolioList.length ? portfolioList : [avatar];
        this.setData({
          staff,
          levelLabel: dictLabel('hf_staff_level', staff.level),
          tagList: parseTags(staff.tags),
          portfolioList,
          gallery,
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
