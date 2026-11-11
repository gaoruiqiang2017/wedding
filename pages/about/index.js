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
import { wxLoginOnce, ensureMerchantLogin } from '../../utils/login';
import { logout as apiLogout, updateMerchantNickName } from '../../api/auth';
import { updateCustomerNickname } from '../../api/customer';

const PROFILE_KEY = 'hf_profile';
const DEFAULT_AVATAR = '/images/staff-default.png';

/** 后端自动建档的占位名(如 微信用户xxxxxxxx),不算真实昵称 */
function isPlaceholderName(name) {
  const n = (name || '').trim();
  return !n || n === '微信用户' || n.startsWith('微信用户');
}

/** 取当前登录身份下应展示/保存的昵称字段 */
function resolveStoredName() {
  if (isMerchantLogin()) {
    const m = getMerchant() || {};
    return m.nickName || '';
  }
  const c = getCustomer() || {};
  return c.customerName || '';
}

Page({
  data: {
    shopName: '',
    version: '1.0.0',
    loggedIn: false,
    isMerchant: false,
    nickName: '',
    showNickPanel: false,
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
    // 顶部卡片以"浏览态(顾客)或管理态任一存在"判断是否已登录
    // 占位名不展示,引导用户用 type=nickname 填写真实微信昵称
    const raw = resolveStoredName();
    const nickName = isPlaceholderName(raw) ? '' : raw;
    this.setData({
      isMerchant: isMerchantLogin(),
      loggedIn: isLogin() || isMerchantLogin(),
      nickName,
      profile: wx.getStorageSync(PROFILE_KEY) || { avatar: '' },
    });
  },

  login() {
    wx.showLoading({ title: '登录中', mask: true });
    wxLoginOnce()
      .then(() => {
        wx.hideLoading();
        this.syncLoginState();
        // 微信静默登录拿不到昵称,无真实昵称时弹出填写面板
        if (!this.data.nickName) {
          this.setData({ showNickPanel: true });
          wx.showToast({ title: '登录成功，请填写昵称', icon: 'none' });
        } else {
          wx.showToast({ title: '登录成功', icon: 'success' });
        }
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
        removeMerchantToken();
        removeMerchant();
        this.setData({ showNickPanel: false });
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

  skipNick() {
    this.setData({ showNickPanel: false });
  },

  noop() {},

  // 微信昵称填写能力:用户点选昵称后写回后端(管理员→nickName,顾客→customerName)
  onNickname(e) {
    const nickName = (e.detail.value || '').trim();
    if (!nickName || isPlaceholderName(nickName)) return;
    if (nickName === this.data.nickName) {
      this.setData({ showNickPanel: false });
      return;
    }
    this.saveNickname(nickName);
  },

  saveNickname(nickName) {
    const isMerchant = isMerchantLogin();
    // 若同时有顾客态,顾客名也一并更新,避免只更管理员侧
    const tasks = [];
    if (isMerchant) {
      tasks.push(
        updateMerchantNickName(nickName).then(() => {
          setMerchant({ ...(getMerchant() || {}), nickName });
        }),
      );
    }
    if (isLogin()) {
      tasks.push(
        updateCustomerNickname(nickName).then(() => {
          setCustomer({ ...(getCustomer() || {}), customerName: nickName });
        }),
      );
    }
    // 理论上至少有一侧登录;兜底按当前展示角色保存
    if (!tasks.length) {
      const save = isMerchant ? updateMerchantNickName(nickName) : updateCustomerNickname(nickName);
      tasks.push(
        save.then(() => {
          if (isMerchant) setMerchant({ ...(getMerchant() || {}), nickName });
          else setCustomer({ ...(getCustomer() || {}), customerName: nickName });
        }),
      );
    }

    wx.showLoading({ title: '保存中', mask: true });
    Promise.all(tasks)
      .then(() => {
        this.setData({ nickName, showNickPanel: false });
        wx.hideLoading();
        wx.showToast({ title: '昵称已保存', icon: 'success' });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      });
  },

  goManage() {
    // 每次进入都静默刷新管理 token(避免服务重启后本地旧 token 失效却仍跳过登录)
    wx.showLoading({ title: '正在识别', mask: true });
    ensureMerchantLogin()
      .then(() => {
        wx.hideLoading();
        this.syncLoginState();
        if (!this.data.nickName) this.setData({ showNickPanel: true });
        wx.navigateTo({ url: '/pages/merchant/index' });
      })
      .catch(() => {
        wx.hideLoading();
        this.syncLoginState();
        wx.showToast({ title: '当前账号无法操作内容管理', icon: 'none' });
      });
  },

  goStore() {
    wx.navigateTo({ url: '/pages/store/index' });
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
