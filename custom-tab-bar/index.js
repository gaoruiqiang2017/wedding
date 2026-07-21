import TabMenu from './data';

Component({
  data: {
    active: 0,
    list: TabMenu,
  },

  methods: {
    onChange(event) {
      const index = event.currentTarget.dataset.index;
      this.setData({ active: index });
      wx.switchTab({ url: this.data.list[index].url });
    },

    init() {
      const page = getCurrentPages().pop();
      const route = page ? '/' + page.route.split('?')[0] : '';
      const active = this.data.list.findIndex((item) => item.url === route);
      this.setData({ active: active < 0 ? 0 : active });
    },
  },
});
