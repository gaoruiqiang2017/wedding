import config from '../config/index';

export const getToken = () => wx.getStorageSync(config.tokenKey) || '';
export const setToken = (token) => wx.setStorageSync(config.tokenKey, token);
export const removeToken = () => wx.removeStorageSync(config.tokenKey);

/** 是否已登录 */
export const isLogin = () => !!getToken();

/** 登录客户信息(登录返回 { customerId, customerName, phone }) */
export const getCustomer = () => wx.getStorageSync(config.customerKey) || null;
export const setCustomer = (customer) => wx.setStorageSync(config.customerKey, customer);
export const removeCustomer = () => wx.removeStorageSync(config.customerKey);

/* ===================== 管理态(sys_user,独立于浏览态) ===================== */
// 浏览与管理相互独立:浏览请求走顾客 token(可空,游客),管理请求显式走管理 token。
// 二者可并存,管理员仍以普通身份浏览同一套页面,只是额外具备管理能力。

/** 管理 token */
export const getMerchantToken = () => wx.getStorageSync(config.merchantTokenKey) || '';
export const setMerchantToken = (token) => wx.setStorageSync(config.merchantTokenKey, token);
export const removeMerchantToken = () => wx.removeStorageSync(config.merchantTokenKey);

/** 管理账号信息 { userId, userName, nickName, deptId, deptName, roles, permissions } */
export const getMerchant = () => wx.getStorageSync(config.merchantKey) || null;
export const setMerchant = (merchant) => wx.setStorageSync(config.merchantKey, merchant);
export const removeMerchant = () => wx.removeStorageSync(config.merchantKey);

/** 是否具备管理身份(存在管理 token 即可进入内容管理) */
export const isMerchantLogin = () => !!getMerchantToken();

/** 门店信息(门店解析结果 { tenantId, shopName }) */
export const getShop = () => wx.getStorageSync(config.shopKey) || null;
export const setShop = (shop) => wx.setStorageSync(config.shopKey, shop);
export const removeShop = () => wx.removeStorageSync(config.shopKey);

/** 当前生效租户:优先门店解析结果,缺失时回退兜底默认租户 */
export const getTenantId = () => {
  const shop = getShop();
  return (shop && shop.tenantId) || config.tenantId;
};

/** 当前门店名(未解析到时为空串) */
export const getShopName = () => {
  const shop = getShop();
  return (shop && shop.shopName) || '';
};
