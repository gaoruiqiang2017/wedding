import request from '../utils/request';

/**
 * 婚纱照片管理(需管理 token 与 hf:dress:* 权限)
 * 复用后台管理端接口 /happyflower/dress/**;均显式携带管理 token。
 */

/** 分页列表 GET /happyflower/dress/list -> TableDataInfo<HfDressVo> */
export const listDressAdmin = (params) =>
  request({ url: '/happyflower/dress/list', method: 'GET', params, useMerchantToken: true });

/** 详情 GET /happyflower/dress/{dressId} -> R<HfDressVo> */
export const getDressAdmin = (dressId) =>
  request({ url: `/happyflower/dress/${dressId}`, method: 'GET', useMerchantToken: true });

/** 新增 POST /happyflower/dress  body: HfDressBo */
export const addDress = (data) =>
  request({ url: '/happyflower/dress', method: 'POST', data, useMerchantToken: true });

/** 修改 PUT /happyflower/dress  body: HfDressBo(含 dressId) */
export const updateDress = (data) =>
  request({ url: '/happyflower/dress', method: 'PUT', data, useMerchantToken: true });

/** 删除 DELETE /happyflower/dress/{dressIds} */
export const removeDress = (dressIds) =>
  request({ url: `/happyflower/dress/${dressIds}`, method: 'DELETE', useMerchantToken: true });
