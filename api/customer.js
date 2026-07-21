import request from '../utils/request';

/**
 * 更新当前登录顾客昵称(展示名):将微信昵称写入 hf_customer.customerName
 * PUT /happyflower/app/customer/nickname  body: { nickName }
 */
export const updateCustomerNickname = (nickName) =>
  request({ url: '/happyflower/app/customer/nickname', method: 'PUT', data: { nickName } });
