import {
  getShopName,
  isLogin,
  getCustomer,
  setCustomer,
  removeToken,
  removeCustomer,
  isMerchantLogin,
  getMerchant,
  setMerchant,
  removeMerchantToken,
  removeMerchant,
} from '../../utils/auth';
import { wxLoginOnce } from '../../utils/login';
import { logout as apiLogout, updateMerchantNickName } from '../../api/auth';
import { updateCustomerNickname } from '../../api/customer';

const PROFILE_KEY = 'hf_profile';
const DEFAULT_AVATAR = '/images/staff-default.png';

Page({
  data: {
    shopName: '',
    version: '1.0.0',
    loggedIn: false,
    isMerchant: false,
    nickName: '',
    profile: { avatar: '' },
    defaultAvatar: DEFAULT_AVATAR,
  },

  onShow() {
    this.setData({ shopName: getShopName() });
    this.syncLoginState();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  onShareAppMessage() {
    return { title: '花田喜事门店展示', path: '/pages/home/home' };
  },

  syncLoginState() {
    // 顶部卡片以"浏览态(顾客)或管理态任一存在"判断是否已登录:
    // 登录后仅展示 nickName(管理态取 sys_user 昵称,浏览态取顾客名)。
    const customer = getCustomer() || {};
    const merchant = getMerchant() || {};
    this.setData({
      isMerchant: isMerchantLogin(),
      loggedIn: isLogin() || isMerchantLogin(),
      nickName: merchant.nickName || customer.customerName || '微信用户',
      profile: wx.getStorageSync(PROFILE_KEY) || { avatar: '' },
    });
  },

  login() {
    wx.showLoading({ title: '登录中', mask: true });
    wxLoginOnce()
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '登录成功', icon: 'success' });
        this.syncLoginState();
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (!res.confirm) return;
        apiLogout().catch(() => {});
        removeToken();
        removeCustomer();
        // 顶部卡片代表整体登录态,退出时一并清除管理态
        removeMerchantToken();
        removeMerchant();
        this.syncLoginState();
        wx.showToast({ title: '已退出', icon: 'none' });
      },
    });
  },

  onChooseAvatar(e) {
    const profile = { avatar: e.detail.avatarUrl };
    wx.setStorageSync(PROFILE_KEY, profile);
    this.setData({ profile });
  },

  // 微信昵称填写:拿到微信昵称后按角色写回后端(管理员→nickName,顾客→customerName)
  onNickname(e) {
    const nickName = (e.detail.value || '').trim();
    if (!nickName || nickName === this.data.nickName) return;
    const isMerchant = this.data.isMerchant;
    wx.showLoading({ title: '保存中', mask: true });
    const save = isMerchant
      ? updateMerchantNickName(nickName)
      : updateCustomerNickname(nickName);
    save
      .then(() => {
        if (isMerchant) {
          setMerchant({ ...(getMerchant() || {}), nickName });
        } else {
          setCustomer({ ...(getCustomer() || {}), customerName: nickName });
        }
        this.setData({ nickName });
        wx.hideLoading();
        wx.showToast({ title: '已更新', icon: 'success' });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      });
  },

  goManage() {
    // 已具备管理身份→直接进内容管理
    if (this.data.isMerchant) {
      wx.navigateTo({ url: '/pages/merchant/index' });
      return;
    }
    // 未识别→先静默微信登录探测:openid 已绑定管理账号则直接进入,无需手机号密码
    wx.showLoading({ title: '正在进入', mask: true });
    wxLoginOnce()
      .then((data) => {
        wx.hideLoading();
        this.syncLoginState();
        if (data && data.accountType === 'merchant') {
          wx.navigateTo({ url: '/pages/merchant/index' });
        } else {
          // 非管理员(或首次尚未绑定)→ 走手机号密码登录
          wx.navigateTo({ url: '/pages/merchant-login/index' });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.navigateTo({ url: '/pages/merchant-login/index' });
      });
  },

  goStore() {
    wx.navigateTo({ url: '/pages/store/index' });
  },

  goContent() {
    wx.navigateTo({ url: '/pages/content/index' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index' });
  },

  openUrl(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' }),
    });
  },
});
