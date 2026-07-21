import { listReview } from '../../api/review';

Component({
  properties: {
    dressId: { type: null, value: null, observer: 'reload' },
    staffId: { type: null, value: null, observer: 'reload' },
    title: { type: String, value: '用户评价' },
  },
  data: {
    loading: false,
    list: [],
    total: 0,
    stars: [1, 2, 3, 4, 5],
  },
  lifetimes: {
    attached() {
      this.reload();
    },
  },
  methods: {
    reload() {
      const dressId = this.data.dressId;
      const staffId = this.data.staffId;
      if (!dressId && !staffId) return;
      this.setData({ loading: true });
      listReview({
        dressId: dressId || undefined,
        staffId: staffId || undefined,
        pageNum: 1,
        pageSize: 20,
      })
        .then((res) => {
          const list = (res.rows || []).map((r) => ({
            ...r,
            imgs: this.parseImgs(r.images),
          }));
          this.setData({ list, total: res.total || 0 });
        })
        .catch(() => {})
        .then(() => this.setData({ loading: false }));
    },
    parseImgs(images) {
      if (!images) return [];
      try {
        const arr = JSON.parse(images);
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    },
    preview(e) {
      const { urls, idx } = e.currentTarget.dataset;
      wx.previewImage({ urls, current: urls[idx] });
    },
  },
});
