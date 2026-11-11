import { getDress } from '../../api/dress';
import { dictLabel, dictColor } from '../../utils/dict';
import { parseAlbum } from '../../utils/common';
import { mediaUrl } from '../../utils/media';

const DRESS_PLACEHOLDER = '/images/dress-default.png';

Page({
  data: {
    dressId: '',
    dress: {},
    cover: DRESS_PLACEHOLDER,
    album: [],
    statusLabel: '',
    statusColor: '',
    styleLabel: '',
    loaded: false,
  },

  onLoad(opt) {
    this.setData({ dressId: opt.id });
    this.loadDetail();
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
        const cover = mediaUrl(dress.coverImg) || DRESS_PLACEHOLDER;
        // 下方图册只展示 album,不把封面再塞进去,避免与顶部主图重复
        const album = parseAlbum(dress.album, '').map(mediaUrl).filter(Boolean);
        this.setData({
          dress,
          cover,
          album,
          statusLabel: dictLabel('hf_dress_status', dress.status),
          statusColor: dictColor('hf_dress_status', dress.status),
          styleLabel: dictLabel('hf_dress_style', dress.style),
          loaded: true,
        });
      })
      .catch(() => {});
  },

  previewCover() {
    const urls = this.data.album.length ? this.data.album : [this.data.cover];
    wx.previewImage({ urls, current: this.data.cover });
  },

  previewAlbum(e) {
    const idx = e.currentTarget.dataset.idx;
    wx.previewImage({
      urls: this.data.album,
      current: this.data.album[idx],
    });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index' });
  },

  goStore() {
    wx.navigateTo({ url: '/pages/store/index' });
  },
});
