import request from '../utils/request';

/**
 * 化妆师管理(需管理 token 与 hf:staff:* 权限)
 * 复用后台管理端接口 /happyflower/staff/**;均显式携带管理 token。
 */

/** 分页列表 GET /happyflower/staff/list -> TableDataInfo<HfStaffVo> */
export const listStaffAdmin = (params) =>
  request({ url: '/happyflower/staff/list', method: 'GET', params, useMerchantToken: true });

/** 详情 GET /happyflower/staff/{staffId} -> R<HfStaffVo> */
export const getStaffAdmin = (staffId) =>
  request({ url: `/happyflower/staff/${staffId}`, method: 'GET', useMerchantToken: true });

/** 新增 POST /happyflower/staff  body: HfStaffBo */
export const addStaff = (data) =>
  request({ url: '/happyflower/staff', method: 'POST', data, useMerchantToken: true });

/** 修改 PUT /happyflower/staff  body: HfStaffBo(含 staffId) */
export const updateStaff = (data) =>
  request({ url: '/happyflower/staff', method: 'PUT', data, useMerchantToken: true });

/** 删除 DELETE /happyflower/staff/{staffIds} */
export const removeStaff = (staffIds) =>
  request({ url: `/happyflower/staff/${staffIds}`, method: 'DELETE', useMerchantToken: true });
