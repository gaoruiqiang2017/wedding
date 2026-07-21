import request from '../utils/request';

/**
 * 公开评价列表(游客可读),按 dressId / staffId 过滤
 * GET /happyflower/app/review/list -> TableDataInfo<HfReviewVo>
 */
export const listReview = (params) =>
  request({ url: '/happyflower/app/review/list', method: 'GET', isToken: false, params });
