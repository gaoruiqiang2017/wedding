/**
 * 内容管理(婚纱照片 / 化妆师 的增删改查入口)
 * 需已登录管理账号(具备管理权限)方可进入,否则跳转登录页。
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

  /** 未登录管理账号则跳转登录 */
  guard() {
    if (isMerchantLogin()) return true;
    wx.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => wx.redirectTo({ url: '/pages/merchant-login/index' }), 800);
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
});
