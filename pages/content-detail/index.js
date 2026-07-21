import { getContent, likeContent } from '../../api/content';
import { mediaUrl } from '../../utils/media';

const CAT_MAP = { '1': '案例', '2': '穿搭', '3': '攻略' };

Page({
  data: {
    data: {},
    coverUrl: '',
    catLabel: '',
    liked: false,
    loaded: false,
  },

  onLoad(opt) {
    this.load(opt.id);
  },

  onShareAppMessage() {
    return {
      title: this.data.data.title || '花田喜事 · 备婚指南',
      path: `/pages/content-detail/index?id=${this.data.data.contentId}`,
    };
  },

  load(id) {
    getContent(id)
      .then((res) => {
        const data = res.data || {};
        this.setData({
          data,
          coverUrl: mediaUrl(data.coverImg),
          catLabel: CAT_MAP[data.category] || '',
          loaded: true,
        });
      })
      .catch(() => {});
  },

  goDress() {
    if (!this.data.data.dressId) return;
    wx.navigateTo({ url: `/pages/dress-detail/index?id=${this.data.data.dressId}` });
  },

  doLike() {
    if (this.data.liked) return;
    likeContent(this.data.data.contentId)
      .then(() => {
        this.setData({
          'data.likeCount': (this.data.data.likeCount || 0) + 1,
          liked: true,
        });
      })
      .catch(() => {});
  },
});
