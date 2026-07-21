import request from '../utils/request';

/**
 * 首页轮播 Banner 列表(C 端只读,游客可访问)
 * GET /happyflower/app/banner/list -> R<HfBannerVo[]>
 * 每项 { bannerId, title, imageUrl, linkType, linkValue, sortNo }
 */
export const listBanner = () =>
  request({ url: '/happyflower/app/banner/list', method: 'GET' });
