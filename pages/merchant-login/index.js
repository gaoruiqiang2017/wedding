import { merchantPasswordLogin } from '../../utils/login';

Page({
  data: {
    phone: '',
    password: '',
    submitting: false,
  },

  onPhone(e) {
    this.setData({ phone: e.detail.value.trim() });
  },
  onPassword(e) {
    this.setData({ password: e.detail.value });
  },

  submit() {
    const { phone, password, submitting } = this.data;
    if (submitting) return;
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    wx.showLoading({ title: '登录中', mask: true });
    merchantPasswordLogin(phone, password)
      .then(() => {
        wx.hideLoading();
        this.setData({ submitting: false });
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => wx.redirectTo({ url: '/pages/merchant/index' }), 600);
      })
      .catch((err) => {
        wx.hideLoading();
        this.setData({ submitting: false });
        const msg = err && err.message === 'NOT_MERCHANT'
          ? '该账号无管理权限'
          : '登录失败，请检查手机号或密码';
        wx.showToast({ title: msg, icon: 'none' });
      });
  },
});
