import { getDress } from '../../api/dress';
import { listContent } from '../../api/content';
import { dictLabel, dictColor } from '../../utils/dict';
import { parseAlbum } from '../../utils/common';
import { mediaUrl } from '../../utils/media';

const CONTENT_PLACEHOLDER = '/images/dress-default.png';

Page({
  data: {
    dressId: '',
    dress: {},
    album: [],
    statusLabel: '',
    statusColor: '',
    styleLabel: '',
    relatedContents: [],
    loaded: false,
  },

  onLoad(opt) {
    this.setData({ dressId: opt.id });
    this.loadDetail();
    this.loadRelated();
  },

  onShareAppMessage() {
    return {
      title: this.data.dress.dressName || '花田喜事 · 婚纱款式',
      path: `/pages/dress-detail/index?id=${this.data.dressId}`,
    };
  },

  loadDetail() {
    getDress(this.data.dressId)
      .then((res) => {
        const dress = res.data || {};
        const album = parseAlbum(dress.album, dress.coverImg).map(mediaUrl).filter(Boolean);
        this.setData({
          dress,
          album,
          statusLabel: dictLabel('hf_dress_status', dress.status),
          statusColor: dictColor('hf_dress_status', dress.status),
          styleLabel: dictLabel('hf_dress_style', dress.style),
          loaded: true,
        });
      })
      .catch(() => {});
  },

  loadRelated() {
    listContent({ dressId: this.data.dressId, pageNum: 1, pageSize: 10 })
      .then((res) => {
        const relatedContents = (res.rows || []).map((c) => ({
          ...c,
          cover: mediaUrl(c.coverImg) || CONTENT_PLACEHOLDER,
        }));
        this.setData({ relatedContents });
      })
      .catch(() => {});
  },

  goContent(e) {
    wx.navigateTo({ url: `/pages/content-detail/index?id=${e.currentTarget.dataset.id}` });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index' });
  },

  goStore() {
    wx.navigateTo({ url: '/pages/store/index' });
  },
});
