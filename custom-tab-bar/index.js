import TabMenu from './data';

Component({
  data: {
    active: 0,
    list: TabMenu,
  },

  // 组件挂载即按当前路由定位高亮,首帧渲染前就位,避免切换时闪烁
  lifetimes: {
    attached() {
      this.init();
    },
  },

  // 每次所在 tab 页显示时同步高亮(如返回某个 tab)
  pageLifetimes: {
    show() {
      this.init();
    },
  },

  methods: {
    onChange(event) {
      const index = event.currentTarget.dataset.index;
      // 点击当前 tab 不重复跳转(与微信原生一致)
      if (index === this.data.active) return;
      this.setData({ active: index });
      wx.switchTab({ url: this.data.list[index].url });
    },

    init() {
      const page = getCurrentPages().pop();
      const route = page ? '/' + page.route.split('?')[0] : '';
      const active = this.data.list.findIndex((item) => item.url === route);
      if (active >= 0 && active !== this.data.active) {
        this.setData({ active });
      }
    },
  },
});
