import { listDress } from '../../api/dress';
import { listDressStyles } from '../../api/dress-style';
import { dictLabel, dictColor } from '../../utils/dict';
import { mediaUrl } from '../../utils/media';

const DRESS_PLACEHOLDER = '/images/dress-default.png';
// 数据中实际存储的为中文/字母字面值(非字典码),故筛选项直接用数据出现的值。
// 默认内置一份,进入页面后再从风格字典动态刷新。
const STYLE_OPTIONS = ['鱼尾', '赫本', '蓬蓬裙', 'A字', '直身', '大拖尾', '秀禾'];
const COLOR_OPTIONS = ['白色', '香槟色', '红色', '粉色'];
const SIZE_OPTIONS = ['S', 'M', 'L'];

const emptyFilter = () => ({ style: '', color: '', dressSize: '' });
const splitColumns = (list) => {
  const left = [];
  const right = [];
  list.forEach((it, i) => (i % 2 === 0 ? left : right).push(it));
  return { left, right };
};

Page({
  data: {
    keyword: '',
    filters: emptyFilter(),
    draft: emptyFilter(),
    sortKey: '',
    showFilter: false,
    styleOptions: STYLE_OPTIONS,
    colorOptions: COLOR_OPTIONS,
    sizeOptions: SIZE_OPTIONS,
    list: [],
    listLeft: [],
    listRight: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    finished: false,
    hasFilter: false,
    filterCount: 0,
  },

  onLoad() {
    this.loadStyles();
    this.consumeFilter();
    this.refresh();
  },

  loadStyles() {
    listDressStyles()
      .then((res) => {
        const rows = res.data || [];
        if (rows.length) this.setData({ styleOptions: rows.map((r) => r.dictLabel) });
      })
      .catch(() => {});
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
    if (this._loaded && this.consumeFilter()) {
      this.refresh();
    }
    this._loaded = true;
  },

  onPullDownRefresh() {
    this.refresh(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadMore();
  },

  onShareAppMessage() {
    return { title: '花田喜事 · 婚纱', path: '/pages/dress/index' };
  },

  consumeFilter() {
    let filter = null;
    try {
      filter = wx.getStorageSync('hf_dress_filter');
      if (filter) wx.removeStorageSync('hf_dress_filter');
    } catch (e) {}
    if (!filter) return false;
    const filters = emptyFilter();
    filters.style = filter.style ? dictLabel('hf_dress_style', filter.style) : '';
    this.setData({ keyword: filter.dressName || '', filters });
    this.updateFilterFlags();
    return true;
  },

  updateFilterFlags() {
    const f = this.data.filters;
    let n = 0;
    ['style', 'color', 'dressSize'].forEach((k) => {
      if (f[k]) n++;
    });
    this.setData({ hasFilter: n > 0, filterCount: n });
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  clearKeyword() {
    this.setData({ keyword: '' });
    this.refresh();
  },

  setSort(e) {
    this.setData({ sortKey: e.currentTarget.dataset.sort });
    this.refresh();
  },

  // 顶部风格快捷筛选
  onStyleChip(e) {
    const val = e.currentTarget.dataset.val;
    const filters = { ...this.data.filters, style: this.data.filters.style === val ? '' : val };
    this.setData({ filters });
    this.updateFilterFlags();
    this.refresh();
  },

  toggleFilterPanel() {
    if (!this.data.showFilter) {
      this.setData({ draft: { ...this.data.filters } });
    }
    this.setData({ showFilter: !this.data.showFilter });
  },

  toggle(e) {
    const { field, val } = e.currentTarget.dataset;
    const draft = { ...this.data.draft };
    draft[field] = draft[field] === val ? '' : val;
    this.setData({ draft });
  },

  applyFilter() {
    this.setData({ filters: { ...this.data.draft }, showFilter: false });
    this.updateFilterFlags();
    this.refresh();
  },

  resetFilter() {
    this.setData({ draft: emptyFilter() });
  },

  resetAll() {
    this.setData({
      keyword: '',
      filters: emptyFilter(),
      draft: emptyFilter(),
      sortKey: '',
    });
    this.updateFilterFlags();
    this.refresh();
  },

  onSearch() {
    this.refresh();
  },

  buildParams() {
    const f = this.data.filters;
    const p = { pageNum: this.data.pageNum, pageSize: this.data.pageSize };
    if (this.data.keyword) p.dressName = this.data.keyword;
    if (f.style) p.style = f.style;
    if (f.color) p.color = f.color;
    if (f.dressSize) p.dressSize = f.dressSize;
    if (this.data.sortKey === 'hot') {
      p.orderByColumn = 'rentCount';
      p.isAsc = 'desc';
    }
    return p;
  },

  mapRows(rows) {
    return (rows || []).map((it) => ({
      ...it,
      cover: mediaUrl(it.coverImg) || DRESS_PLACEHOLDER,
      statusLabel: dictLabel('hf_dress_status', it.status),
      statusColor: dictColor('hf_dress_status', it.status),
    }));
  },

  applyList(list) {
    const { left, right } = splitColumns(list);
    this.setData({ list, listLeft: left, listRight: right });
  },

  refresh(done) {
    this.setData({ pageNum: 1, finished: false, loading: true });
    return listDress(this.buildParams())
      .then((res) => {
        const list = this.mapRows(res.rows);
        const total = res.total || 0;
        this.applyList(list);
        this.setData({ total, finished: list.length >= total });
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
    listDress(this.buildParams())
      .then((res) => {
        const list = this.data.list.concat(this.mapRows(res.rows));
        this.applyList(list);
        this.setData({ finished: list.length >= (res.total || 0) });
      })
      .catch(() => this.setData({ pageNum: pageNum - 1 }))
      .then(() => this.setData({ loading: false }));
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/dress-detail/index?id=${e.currentTarget.dataset.id}` });
  },
});
