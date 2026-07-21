import request from '../utils/request';

/**
 * 化妆造型师列表(分页,C 端只读)
 * GET /happyflower/app/staff/list -> TableDataInfo<HfStaffVo>{ rows, total }
 * 支持参数: pageNum,pageSize,staffName(like)
 */
export const listStaff = (params) =>
  request({ url: '/happyflower/app/staff/list', method: 'GET', params });

/**
 * 化妆师详情(C 端只读,含 intro/portfolio/tags)
 * GET /happyflower/app/staff/{staffId} -> R<HfStaffVo>
 * 注意:staffId 为雪花 ID,需以字符串传递
 */
export const getStaff = (staffId) =>
  request({ url: `/happyflower/app/staff/${staffId}`, method: 'GET' });
