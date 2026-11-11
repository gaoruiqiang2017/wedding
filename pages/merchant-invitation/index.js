import {
  listInvitationAdmin,
  updateInvitationStatus,
  removeInvitation,
} from '../../api/invitation';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';

import { INVITE_STYLE_MAP } from '../../utils/invite-styles';
const STYLE_MAP = INVITE_STYLE_MAP;

function formatTime(v) {
  if (!v) return '';
  const s = String(v).replace('T', ' ');
  return s.length >= 16 ? s.slice(0, 16) : s;
}

Page({
  data: { list: [], loading: false },

  onShow() {
    if (!this.guard()) return;
    this.load();
  },

  onShareAppMessage(e) {
    const id = (e && e.target && e.target.dataset && e.target.dataset.id) || this._shareId;
    const title = (e && e.target && e.target.dataset && e.target.dataset.title) || '婚礼请柬';
    if (!id) return { title: '花田喜事 · 婚礼请柬', path: '/pages/home/home' };
    return {
      title: title || '婚礼请柬',
      path: `/pages/invitation/index?id=${id}`,
    };
  },

  guard() {
    if (isMerchantLogin()) return true;
    wx.switchTab({ url: '/pages/about/index' });
    return false;
  },

  load() {
    this.setData({ loading: true });
    listInvitationAdmin()
      .then((res) => {
        const list = (res.data || []).map((it) => ({
          ...it,
          coverUrl: mediaUrl(it.coverImg),
          styleLabel: STYLE_MAP[it.style] || it.style || '花田',
          weddingTimeText: formatTime(it.weddingTime),
        }));
        this.setData({ list, loading: false });
      })
      .catch(() => this.setData({ loading: false }));
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/merchant-invitation/edit' });
  },

  goEdit(e) {
    wx.navigateTo({ url: `/pages/merchant-invitation/edit?id=${e.currentTarget.dataset.id}` });
  },

  shareItem(e) {
    this._shareId = e.currentTarget.dataset.id;
    wx.showShareMenu({ withShareTicket: true });
    wx.showToast({ title: '请点右上角分享给好友', icon: 'none' });
  },

  toggleStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const next = status === '1' ? '0' : '1';
    const tip = next === '1' ? '确定发布该请柬吗？发布后可通过微信分享给宾客。' : '确定下架该请柬吗？';
    wx.showModal({
      title: '提示',
      content: tip,
      success: (r) => {
        if (!r.confirm) return;
        wx.showLoading({ title: '处理中', mask: true });
        updateInvitationStatus(id, next)
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: next === '1' ? '已发布' : '已下架', icon: 'success' });
            this.load();
          })
          .catch(() => {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
      },
    });
  },

  removeItem(e) {
    const { id, title } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: `确定删除「${title || '该请柬'}」吗？此操作不可恢复`,
      success: (r) => {
        if (!r.confirm) return;
        wx.showLoading({ title: '删除中', mask: true });
        removeInvitation(id)
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            this.load();
          })
          .catch(() => {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
      },
    });
  },
});
