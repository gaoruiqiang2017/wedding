/**
 * 内容管理(婚纱照片 / 化妆师 / 婚礼请柬 入口)
 * 需已登录管理账号(具备管理权限)方可进入,否则返回「我的」。
 */
import { isMerchantLogin, getMerchant, removeMerchantToken, removeMerchant } from '../../utils/auth';

Page({
  data: {
    name: '',
  },

  onShow() {
    if (!this.guard()) return;
    const m = getMerchant() || {};
    this.setData({ name: m.nickName || m.userName || '管理员' });
  },

  /** 未登录管理账号则返回「我的」 */
  guard() {
    if (isMerchantLogin()) return true;
    wx.showToast({ title: '当前账号无法操作内容管理', icon: 'none' });
    setTimeout(() => wx.switchTab({ url: '/pages/about/index' }), 800);
    return false;
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出内容管理吗？',
      success: (res) => {
        if (!res.confirm) return;
        removeMerchantToken();
        removeMerchant();
        wx.showToast({ title: '已退出', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 600);
      },
    });
  },

  goDressAdmin() {
    wx.navigateTo({ url: '/pages/merchant-dress/index' });
  },
  goStaffAdmin() {
    wx.navigateTo({ url: '/pages/merchant-staff/index' });
  },
  goStyleAdmin() {
    wx.navigateTo({ url: '/pages/merchant-style/index' });
  },
  goStore() {
    wx.navigateTo({ url: '/pages/merchant-store/index' });
  },
  goInvitationAdmin() {
    wx.navigateTo({ url: '/pages/merchant-invitation/index' });
  },
});
