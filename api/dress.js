import request from '../utils/request';

/**
 * 婚纱列表(分页,C 端只读)
 * GET /happyflower/app/dress/list -> TableDataInfo<HfDressVo>{ rows, total }
 * 支持参数: pageNum,pageSize,dressName(like),style,color,dressSize,status,orderByColumn,isAsc
 */
export const listDress = (params) =>
  request({ url: '/happyflower/app/dress/list', method: 'GET', params });

/**
 * 婚纱详情(C 端只读)
 * GET /happyflower/app/dress/{dressId} -> R<HfDressVo>
 */
export const getDress = (dressId) =>
  request({ url: `/happyflower/app/dress/${dressId}`, method: 'GET' });
