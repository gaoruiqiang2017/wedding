/**
 * 统一请求封装(基于 wx.request)
 * - 自动拼接 baseUrl 与 GET 查询参数
 * - 自动携带 clientid、租户 tenantId,以及可选 token
 * - 统一处理后端返回结构 R{code,msg,data} / TableDataInfo{code,rows,total}
 */
import config from '../config/index';
import {
  getShop,
  getToken,
  getMerchantToken,
  removeToken,
  removeCustomer,
  removeMerchantToken,
  removeMerchant,
} from './auth';

const toQuery = (params) => {
  const parts = [];
  Object.keys(params || {}).forEach((key) => {
    const val = params[key];
    if (val === null || val === undefined || val === '') return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
  });
  return parts.join('&');
};

/**
 * @param {Object} options
 * @param {string} options.url 接口路径(不含 baseUrl)
 * @param {string} [options.method=GET]
 * @param {Object} [options.data] 请求体
 * @param {Object} [options.params] GET 查询参数
 * @param {Object} [options.headers] 额外请求头
 * @param {boolean} [options.isToken=true] 是否携带 token
 * @param {boolean} [options.useMerchantToken=false] 是否使用管理 token(管理接口专用);
 *        默认使用浏览态(顾客)token,可为空即游客访问
 */
const request = (options) => {
  let url = config.baseUrl + options.url;
  const method = (options.method || 'GET').toUpperCase();

  if (options.params) {
    const qs = toQuery(options.params);
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const headers = {
    'Content-Type': 'application/json;charset=utf-8',
    clientid: config.clientId,
    ...(options.headers || {}),
  };

  // 门店租户:游客浏览时后端据此做多租户隔离
  const shop = getShop();
  const tenantId = (shop && shop.tenantId) || config.tenantId;
  if (tenantId && headers.tenantId === undefined) headers.tenantId = tenantId;

  if (options.isToken !== false) {
    // 浏览走顾客 token(可空=游客);管理接口显式走管理 token
    const token = options.useMerchantToken ? getMerchantToken() : getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      header: headers,
      data: options.data || {},
      success: (res) => {
        const body = res.data;
        const code = body && body.code !== undefined ? body.code : 200;
        // 后端 Sa-Token 鉴权失败常返回 HTTP 200 + body.code=401
        if (res.statusCode === 401 || code === 401) {
          // 只清除本次请求所用的那套登录态,避免误伤另一态
          if (options.useMerchantToken) {
            removeMerchantToken();
            removeMerchant();
          } else {
            removeToken();
            removeCustomer();
          }
          wx.showToast({ title: '登录已过期，请重新进入内容管理', icon: 'none' });
          reject(new Error('未登录'));
          return;
        }
        if (res.statusCode !== 200) {
          const msg = (body && body.msg) || `请求失败(${res.statusCode})`;
          wx.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
          return;
        }
        if (code === 200) {
          resolve(body);
        } else {
          const msg = (body && body.msg) || '请求出错';
          wx.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络异常,请检查后端服务', icon: 'none' });
        reject(err);
      },
    });
  });
};

export default request;
