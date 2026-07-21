import updateManager from './common/updateManager';
import { ensureShop } from './utils/shop';

App({
  globalData: {},

  onLaunch(options) {
    // 解析门店(扫码带 shopCode 时切换租户,否则回退默认租户)
    ensureShop(options);
  },

  onShow() {
    updateManager();
  },
});
