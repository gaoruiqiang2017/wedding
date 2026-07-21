import request from '../utils/request';

/**
 * 已发布内容列表(category 可空:1 案例 2 穿搭 3 攻略)
 * GET /happyflower/app/content/list -> TableDataInfo<HfContentVo>
 * 支持参数: pageNum,pageSize,category,dressId
 */
export const listContent = (params) =>
  request({ url: '/happyflower/app/content/list', method: 'GET', params });

/**
 * 内容详情(浏览量 +1)
 * GET /happyflower/app/content/{contentId} -> R<HfContentVo>
 */
export const getContent = (contentId) =>
  request({ url: `/happyflower/app/content/${contentId}`, method: 'GET' });

/**
 * 点赞
 * POST /happyflower/app/content/like/{contentId} -> R<Void>
 */
export const likeContent = (contentId) =>
  request({ url: `/happyflower/app/content/like/${contentId}`, method: 'POST' });
