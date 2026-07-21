import request from '../utils/request';
import config from '../config/index';
import { getTenantId } from '../utils/auth';

/**
 * 门店解析(无需 token):按门店标识 shopCode 解析所属租户
 * GET /happyflower/app/auth/shop?shopCode=xxx -> R<{ tenantId, shopName }>
 */
export const resolveShop = (shopCode) =>
  request({
    url: '/happyflower/app/auth/shop',
    method: 'GET',
    isToken: false,
    params: { shopCode },
  });

/**
 * 微信小程序登录(静默登录,无需授权弹窗、个人主体可用)
 * 前端 wx.login 取 code → 本接口(后端 jscode2session 换 openid,查找/建档并签发 token)
 * POST /happyflower/app/auth/wxMiniLogin  body: { code, tenantId, clientId }
 * -> R<{ accessToken, customerId, customerName, phone }>
 * 注意:后端需配置小程序 WX_XCX_APPID / WX_XCX_SECRET。
 */
export const wxMiniLogin = ({ code, tenantId }) =>
  request({
    url: '/happyflower/app/auth/wxMiniLogin',
    method: 'POST',
    isToken: false,
    data: { code, tenantId: tenantId || getTenantId(), clientId: config.clientId },
  });

/**
 * 统一账号密码登录(手机号 + 密码,无需 token)
 * 后端按手机号优先匹配 sys_user(员工/商家):命中则返回 accountType='merchant' + roles/permissions;
 * 否则按顾客签发。用于「商家/员工登录」入口。
 * POST /happyflower/app/auth/login  body: { phone, password, tenantId, clientId }
 */
export const login = ({ phone, password, tenantId }) =>
  request({
    url: '/happyflower/app/auth/login',
    method: 'POST',
    isToken: false,
    data: { phone, password, tenantId: tenantId || getTenantId(), clientId: config.clientId },
  });

/**
 * 绑定小程序 openid 到当前登录管理账号(需管理 token)
 * 绑定后,后续 wxMiniLogin 静默登录即按 openid 识别为管理身份。
 * POST /happyflower/app/auth/bindMiniWechat  body: { code }
 */
export const bindMiniWechat = ({ code }) =>
  request({ url: '/happyflower/app/auth/bindMiniWechat', method: 'POST', data: { code }, useMerchantToken: true });

/**
 * 更新管理账号昵称(需管理 token):将微信昵称写入 sys_user.nickName
 * POST /happyflower/app/auth/merchant/nickname  body: { nickName }
 */
export const updateMerchantNickName = (nickName) =>
  request({ url: '/happyflower/app/auth/merchant/nickname', method: 'POST', data: { nickName }, useMerchantToken: true });

/** 退出登录(需登录态) POST /happyflower/app/auth/logout */
export const logout = () => request({ url: '/happyflower/app/auth/logout', method: 'POST' });
