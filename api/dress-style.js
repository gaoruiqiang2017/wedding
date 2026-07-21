import request from '../utils/request';

/**
 * 婚纱风格(基于后端字典 hf_dress_style)
 * 列表为公开只读;增删需管理 token。
 */

/** 风格列表(公开) GET /happyflower/app/dress/styles -> R<List<SysDictDataVo>> */
export const listDressStyles = () =>
  request({ url: '/happyflower/app/dress/styles', method: 'GET' });

/** 新增风格(管理) POST /happyflower/app/merchant/dress-style body:{ name } */
export const addDressStyle = (name) =>
  request({
    url: '/happyflower/app/merchant/dress-style',
    method: 'POST',
    data: { name },
    useMerchantToken: true,
  });

/** 重命名风格(管理) PUT /happyflower/app/merchant/dress-style/{dictCode} body:{ name } */
export const renameDressStyle = (dictCode, name) =>
  request({
    url: `/happyflower/app/merchant/dress-style/${dictCode}`,
    method: 'PUT',
    data: { name },
    useMerchantToken: true,
  });

/** 删除风格(管理) DELETE /happyflower/app/merchant/dress-style/{dictCode} */
export const removeDressStyle = (dictCode) =>
  request({
    url: `/happyflower/app/merchant/dress-style/${dictCode}`,
    method: 'DELETE',
    useMerchantToken: true,
  });
