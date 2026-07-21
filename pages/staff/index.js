import { listStaff } from '../../api/staff';
import { dictLabel } from '../../utils/dict';
import { parseTags } from '../../utils/common';
import { mediaUrl } from '../../utils/media';

const STAFF_PLACEHOLDER = '/images/staff-default.png';

Page({
  data: {
    list: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    finished: false,
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  onPullDownRefresh() {
    this.refresh(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadMore();
  },

  onShareAppMessage() {
    return { title: '花田喜事 · 化妆造型', path: '/pages/staff/index' };
  },

  mapRows(rows) {
    return (rows || []).map((it) => ({
      ...it,
      avatar: mediaUrl(it.avatar) || STAFF_PLACEHOLDER,
      levelLabel: dictLabel('hf_staff_level', it.level),
      tagList: parseTags(it.tags),
    }));
  },

  refresh(done) {
    this.setData({ pageNum: 1, finished: false, loading: true });
    listStaff({ pageNum: 1, pageSize: this.data.pageSize })
      .then((res) => {
        const list = this.mapRows(res.rows);
        const total = res.total || 0;
        this.setData({ list, total, finished: list.length >= total });
      })
      .catch(() => {})
      .then(() => {
        this.setData({ loading: false });
        done && done();
      });
  },

  loadMore() {
    if (this.data.loading || this.data.finished) return;
    const pageNum = this.data.pageNum + 1;
    this.setData({ pageNum, loading: true });
    listStaff({ pageNum, pageSize: this.data.pageSize })
      .then((res) => {
        const list = this.data.list.concat(this.mapRows(res.rows));
        this.setData({ list, finished: list.length >= (res.total || 0) });
      })
      .catch(() => this.setData({ pageNum: pageNum - 1 }))
      .then(() => this.setData({ loading: false }));
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/staff-detail/index?id=${e.currentTarget.dataset.id}` });
  },
});
