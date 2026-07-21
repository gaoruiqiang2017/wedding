import { listContent } from '../../api/content';
import { mediaUrl } from '../../utils/media';

const CONTENT_PLACEHOLDER = '/images/dress-default.png';
const CAT_MAP = { '1': '案例', '2': '穿搭', '3': '攻略' };

Page({
  data: {
    cats: [
      { label: '全部', value: '' },
      { label: '案例', value: '1' },
      { label: '穿搭', value: '2' },
      { label: '攻略', value: '3' },
    ],
    category: '',
    dressId: '',
    list: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    finished: false,
  },

  onLoad(opt) {
    if (opt && opt.dressId) this.setData({ dressId: opt.dressId });
    if (opt && opt.category) this.setData({ category: opt.category });
    this.refresh();
  },

  onPullDownRefresh() {
    this.refresh(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadMore();
  },

  onShareAppMessage() {
    return { title: '花田喜事 · 备婚指南', path: '/pages/content/index' };
  },

  buildParams(pageNum) {
    const p = { pageNum, pageSize: this.data.pageSize };
    if (this.data.category) p.category = this.data.category;
    if (this.data.dressId) p.dressId = this.data.dressId;
    return p;
  },

  mapRows(rows) {
    return (rows || []).map((it) => ({
      ...it,
      cover: mediaUrl(it.coverImg) || CONTENT_PLACEHOLDER,
      catLabel: CAT_MAP[it.category] || '',
    }));
  },

  switchCat(e) {
    const value = e.currentTarget.dataset.value;
    if (this.data.category === value) return;
    this.setData({ category: value });
    this.refresh();
  },

  refresh(done) {
    this.setData({ pageNum: 1, finished: false, loading: true });
    listContent(this.buildParams(1))
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
    listContent(this.buildParams(pageNum))
      .then((res) => {
        const list = this.data.list.concat(this.mapRows(res.rows));
        this.setData({ list, finished: list.length >= (res.total || 0) });
      })
      .catch(() => this.setData({ pageNum: pageNum - 1 }))
      .then(() => this.setData({ loading: false }));
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/content-detail/index?id=${e.currentTarget.dataset.id}` });
  },
});
