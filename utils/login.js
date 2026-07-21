/**
 * 微信小程序静默登录
 * wx.login 取 code → 后端 wxMiniLogin 换 token(无授权弹窗,个人主体可用)
 *
 * 角色分流:后端 wxMiniLogin 返回 accountType(customer/merchant)。
 * - merchant:该微信 openid 已绑定管理账号(sys_user),写入管理态,解锁「内容管理」;
 * - 否则:写入浏览态(顾客)。
 * 浏览态与管理态相互独立、可并存:浏览请求走顾客 token,管理请求走管理 token。
 */
import { wxMiniLogin, login as apiLogin, bindMiniWechat } from '../api/auth';
import {
  setToken,
  setCustomer,
  getToken,
  getCustomer,
  setMerchantToken,
  setMerchant,
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
 * 内容管理账号密码登录
 * 手机号+密码 → 统一登录接口;若该账号具备管理身份(accountType=merchant)则写入管理态,
 * 并用 wx.login 的 code 绑定小程序 openid(便于以后静默登录按 openid 直接识别为管理身份)。
 * 返回登录数据;无管理权限的账号会以 Error('NOT_MERCHANT') reject。
 */
export function merchantPasswordLogin(phone, password) {
  return apiLogin({ phone, password }).then((res) => {
    const data = res.data || {};
    if (data.accountType !== 'merchant') {
      // 无管理权限:不落地管理态
      throw new Error('NOT_MERCHANT');
    }
    applyUnifiedLogin(data);
    // 绑定小程序 openid(失败不阻断登录)
    return bindMiniOpenid()
      .catch(() => {})
      .then(() => data);
  });
}

/** 取 wx.login code 并绑定当前管理账号的小程序 openid */
function bindMiniOpenid() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (r) => {
        if (!r.code) {
          reject(new Error('wx.login 未返回 code'));
          return;
        }
        bindMiniWechat({ code: r.code }).then(resolve).catch(reject);
      },
      fail: reject,
    });
  });
}
