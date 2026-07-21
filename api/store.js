import request from '../utils/request';

/**
 * 当前门店信息(C 端只读,游客可访问)
 * GET /happyflower/app/store/info -> R<HfStoreVo>
 * 返回 { storeName, address, phone, businessHours, wechat, longitude, latitude, notice }
 */
export const getStoreInfo = () =>
  request({ url: '/happyflower/app/store/info', method: 'GET' });

/**
 * 管理端:读取门店信息(需管理 token)
 * GET /happyflower/app/merchant/store/info -> R<HfStoreVo>
 */
export const getMerchantStore = () =>
  request({ url: '/happyflower/app/merchant/store/info', method: 'GET', useMerchantToken: true });

/**
 * 管理端:保存门店信息(需管理 token)
 * PUT /happyflower/app/merchant/store/info  body: HfStoreBo
 */
export const saveMerchantStore = (data) =>
  request({ url: '/happyflower/app/merchant/store/info', method: 'PUT', data, useMerchantToken: true });
