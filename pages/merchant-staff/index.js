import { listStaffAdmin, updateStaff, removeStaff } from '../../api/staff-admin';
import { isMerchantLogin } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';
import { dictLabel, dictColor } from '../../utils/dict';

const PAGE_SIZE = 15;
const STATUS_TABS = [
  { value: '', label: '全部' },
  { value: '0', label: '在职' },
  { value: '1', label: '请假' },
  { value: '9', label: '离职' },
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
    wx.switchTab({ url: '/pages/about/index' });
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
      staffName: keyword.trim() || undefined,
      orderByColumn: 'createTime',
      isAsc: 'desc',
    };
    listStaffAdmin(params)
      .then((res) => {
        const rows = (res.rows || []).map((s) => ({
          ...s,
          avatarUrl: mediaUrl(s.avatar),
          typeLabel: dictLabel('hf_staff_type', s.staffType),
          levelLabel: dictLabel('hf_staff_level', s.level),
          statusLabel: dictLabel('hf_staff_status', s.status),
          statusColor: dictColor('hf_staff_status', s.status),
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

  toggleStatus(e) {
    const s = e.currentTarget.dataset.item;
    const toOff = s.status === '0';
    const targetStatus = toOff ? '9' : '0';
    wx.showModal({
      title: '提示',
      content: toOff ? '确定停用该化妆师吗?' : '确定启用该化妆师吗?',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中', mask: true });
        updateStaff({ staffId: s.staffId, staffName: s.staffName, status: targetStatus })
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
    const s = e.currentTarget.dataset.item;
    wx.showModal({
      title: '删除确认',
      content: `确定删除「${s.staffName}」吗?此操作不可恢复`,
      confirmColor: '#f5222d',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中', mask: true });
        removeStaff(s.staffId)
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
    wx.navigateTo({ url: `/pages/merchant-staff/edit?staffId=${e.currentTarget.dataset.id}` });
  },
  goAdd() {
    wx.navigateTo({ url: '/pages/merchant-staff/edit' });
  },

  onPullDownRefresh() {
    this.reload();
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    this.fetch();
  },
});
