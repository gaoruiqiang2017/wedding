import { getStoreInfo } from '../../api/store';
import { mediaUrl } from '../../utils/media';

Page({
  data: {
    qrUrl: '/images/wechat-qr.jpg',
  },

  onLoad() {
    getStoreInfo()
      .then((res) => {
        const url = mediaUrl((res.data || {}).wechatQr);
        if (url) this.setData({ qrUrl: url });
      })
      .catch(() => {});
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  onShareAppMessage() {
    return { title: '花田喜事 · 联系咨询', path: '/pages/contact/index' };
  },

  goStore() {
    wx.navigateTo({ url: '/pages/store/index' });
  },

  openUrl(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' }),
    });
  },
});
