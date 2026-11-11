/**
 * 微信小程序静默登录
 * wx.login 取 code → 后端 wxMiniLogin 换 token(无授权弹窗,个人主体可用)
 *
 * 角色分流:后端 wxMiniLogin 返回 accountType(customer/merchant)。
 * - merchant:该微信 openid 已绑定管理账号(sys_user),写入管理态,解锁「内容管理」;
 * - 否则:写入浏览态(顾客)。
 * 浏览态与管理态相互独立、可并存:浏览请求走顾客 token,管理请求走管理 token。
 */
import { wxMiniLogin } from '../api/auth';
import {
  setToken,
  setCustomer,
  getToken,
  getCustomer,
  setMerchantToken,
  setMerchant,
  removeMerchantToken,
  removeMerchant,
} from './auth';

/** 按后端返回的 accountType 写入对应登录态(不清除另一态),返回登录数据 */
function applyUnifiedLogin(data) {
  if (data.accountType === 'merchant') {
    // 管理态:仅写管理 token/信息,解锁内容管理
    if (data.accessToken) setMerchantToken(data.accessToken);
    setMerchant({
      userId: data.userId,
      userName: data.userName,
      nickName: data.nickName,
      deptId: data.deptId,
      deptName: data.deptName,
      roles: data.roles || [],
      permissions: data.permissions || [],
      openid: data.openid || '',
    });
  } else {
    // 浏览态:写顾客 token/信息
    if (data.accessToken) setToken(data.accessToken);
    setCustomer({
      customerId: data.customerId,
      customerName: data.customerName,
      phone: data.phone,
    });
  }
  return data;
}

/** 执行一次登录,成功后按角色写入登录态,返回后端登录数据 */
export function wxLoginOnce() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (r) => {
        if (!r.code) {
          reject(new Error('wx.login 未返回 code'));
          return;
        }
        wxMiniLogin({ code: r.code })
          .then((res) => resolve(applyUnifiedLogin(res.data || {})))
          .catch(reject);
      },
      fail: reject,
    });
  });
}

/** 确保已登录:已登录直接返回本地客户信息,否则触发登录 */
export function ensureLogin() {
  if (getToken()) return Promise.resolve(getCustomer());
  return wxLoginOnce();
}

/**
 * 进入内容管理前强制静默刷新管理态。
 * 服务重启后 Redis 会话失效时,本地仍可能残留旧 merchant token;
 * 每次进入都重新 wxMiniLogin,避免「能进菜单但接口认证失败」。
 */
export function ensureMerchantLogin() {
  return wxLoginOnce().then((data) => {
    if (data.accountType !== 'merchant') {
      removeMerchantToken();
      removeMerchant();
      return Promise.reject(new Error('not merchant'));
    }
    return data;
  });
}

