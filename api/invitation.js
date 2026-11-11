import request from '../utils/request';

/** 管理端请柬列表 */
export const listInvitationAdmin = () =>
  request({ url: '/happyflower/app/merchant/invitation/list', method: 'GET', useMerchantToken: true });

/** 管理端请柬详情 */
export const getInvitationAdmin = (invitationId) =>
  request({ url: `/happyflower/app/merchant/invitation/${invitationId}`, method: 'GET', useMerchantToken: true });

/** 新增请柬 */
export const addInvitation = (data) =>
  request({ url: '/happyflower/app/merchant/invitation', method: 'POST', data, useMerchantToken: true });

/** 修改请柬 */
export const updateInvitation = (data) =>
  request({ url: '/happyflower/app/merchant/invitation', method: 'PUT', data, useMerchantToken: true });

/** 发布/下架 */
export const updateInvitationStatus = (invitationId, status) =>
  request({
    url: `/happyflower/app/merchant/invitation/${invitationId}/status`,
    method: 'PUT',
    data: { status },
    useMerchantToken: true,
  });

/** 删除请柬 */
export const removeInvitation = (invitationIds) =>
  request({
    url: `/happyflower/app/merchant/invitation/${invitationIds}`,
    method: 'DELETE',
    useMerchantToken: true,
  });

/** C 端请柬详情(已发布,无需登录) */
export const getInvitation = (invitationId) =>
  request({ url: `/happyflower/app/invitation/${invitationId}`, method: 'GET', isToken: false });
