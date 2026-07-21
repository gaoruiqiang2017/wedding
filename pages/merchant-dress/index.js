import { listDressAdmin, updateDress, removeDress } from '../../api/dress-admin';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { dictLabel, dictColor } from '../../utils/dict';

const PAGE_SIZE = 15;
const STATUS_TABS = [
  { value: '', label: '全部' },
  { value: '0', label: '可租' },
  { value: '2', label: '清洗中' },
  { value: '3', label: '维修中' },
  { value: '9', label: '已下线' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    status: '',
    keyword: '',
    list: [],
    pageNum: 1,
    total: 0,
    loading: false,
    finished: false,
  },

  onShow() {
    if (!this.guard()) return;
    this.reload();
  },

  guard() {
    if (isMerchantLogin()) return true;
    wx.redirectTo({ url: '/pages/merchant-login/index' });
    return false;
  },

  reload() {
    this.setData({ pageNum: 1, list: [], finished: false }, () => this.fetch());
  },

  fetch() {
    if (this.data.loading || this.data.finished) return;
    this.setData({ loading: true });
    const { keyword, status, pageNum } = this.data;
    const params = {
      pageNum,
      pageSize: PAGE_SIZE,
      status: status || undefined,
      orderByColumn: 'createTime',
      isAsc: 'desc',
    };
    const kw = keyword.trim();
    if (kw) {
      if (/^[A-Za-z0-9-]+$/.test(kw)) params.dressNo = kw;
      else params.dressName = kw;
    }
    listDressAdmin(params)
      .then((res) => {
        const rows = (res.rows || []).map((d) => ({
          ...d,
          cover: mediaUrl(d.coverImg),
          statusLabel: dictLabel('hf_dress_status', d.status),
          statusColor: dictColor('hf_dress_status', d.status),
        }));
        const list = this.data.list.concat(rows);
        this.setData({
          list,
          total: res.total || 0,
          loading: false,
          finished: list.length >= (res.total || 0),
          pageNum: this.data.pageNum + 1,
        });
      })
      .catch(() => this.setData({ loading: false }));
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
  },
  doSearch() {
    this.reload();
  },
  switchTab(e) {
    const status = e.currentTarget.dataset.value;
    if (status === this.data.status) return;
    this.setData({ status }, () => this.reload());
  },

  toggleOnline(e) {
    const d = e.currentTarget.dataset.item;
    const toOffline = d.status === '0';
    const targetStatus = toOffline ? '9' : '0';
    wx.showModal({
      title: '提示',
      content: toOffline ? '确定下线该婚纱吗?' : '确定重新上架该婚纱吗?',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中', mask: true });
        updateDress({
          dressId: d.dressId,
          dressNo: d.dressNo,
          dressName: d.dressName,
          rentPrice: d.rentPrice || 0,
          deposit: d.deposit || 0,
          status: targetStatus,
        })
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: '操作成功', icon: 'success' });
            this.reload();
          })
          .catch(() => wx.hideLoading());
      },
    });
  },

  remove(e) {
    const d = e.currentTarget.dataset.item;
    wx.showModal({
      title: '删除确认',
      content: `确定删除「${d.dressName}」吗?此操作不可恢复`,
      confirmColor: '#f5222d',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中', mask: true });
        removeDress(d.dressId)
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            this.reload();
          })
          .catch(() => wx.hideLoading());
      },
    });
  },

  goEdit(e) {
    wx.navigateTo({ url: `/pages/merchant-dress/edit?dressId=${e.currentTarget.dataset.id}` });
  },
  goAdd() {
    wx.navigateTo({ url: '/pages/merchant-dress/edit' });
  },

  onPullDownRefresh() {
    this.reload();
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    this.fetch();
  },
});
