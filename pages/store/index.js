import { getStoreInfo } from '../../api/store';
import { getShopName } from '../../utils/auth';
import { mediaUrl } from '../../utils/media';

const QR_PLACEHOLDER = '/images/wechat-qr.jpg';

Page({
  data: {
    store: {},
    shopName: '',
    hasGeo: false,
    markers: [],
    qrUrl: QR_PLACEHOLDER,
    services: [
      {
        title: '婚纱礼服租赁',
        desc: '门店提供婚纱、出门纱及中式礼服等租赁服务，具体可租款式与情况请到店或联系客服确认。',
      },
      {
        title: '到店试纱',
        desc: '可联系客服预约到店试纱时间。试纱与租赁相关安排以门店当面沟通为准。',
      },
      {
        title: '化妆造型咨询',
        desc: '门店可提供化妆造型相关咨询说明，具体项目与安排请到店或联系客服沟通。',
      },
    ],
  },

  onLoad() {
    this.setData({ shopName: getShopName() });
    this.load();
  },

  onShareAppMessage() {
    return { title: '花田喜事 · 门店信息', path: '/pages/store/index' };
  },

  load() {
    getStoreInfo()
      .then((res) => {
        const store = res.data || {};
        const lat = Number(store.latitude);
        const lng = Number(store.longitude);
        const hasGeo = !!(lat && lng && !Number.isNaN(lat) && !Number.isNaN(lng));
        if (hasGeo) {
          store.latitude = lat;
          store.longitude = lng;
        }
        const markers = hasGeo
          ? [
              {
                id: 1,
                latitude: lat,
                longitude: lng,
                iconPath: '/images/map-pin.png',
                width: 30,
                height: 38,
                anchor: { x: 0.5, y: 1 },
                callout: {
                  content: store.storeName || this.data.shopName || '门店',
                  color: '#2b2622',
                  fontSize: 12,
                  borderRadius: 10,
                  borderWidth: 0,
                  padding: 8,
                  bgColor: '#ffffff',
                  display: 'ALWAYS',
                },
              },
            ]
          : [];
        this.setData({ store, hasGeo, markers, qrUrl: mediaUrl(store.wechatQr) || QR_PLACEHOLDER });
      })
      .catch(() => {});
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index' });
  },

  copy(e) {
    const { text, tip } = e.currentTarget.dataset;
    if (!text) return;
    wx.setClipboardData({
      data: String(text),
      success: () => wx.showToast({ title: tip || '已复制', icon: 'none' }),
    });
  },

  openLocation() {
    if (!this.data.hasGeo) return;
    const store = this.data.store;
    wx.openLocation({
      latitude: Number(store.latitude),
      longitude: Number(store.longitude),
      name: store.storeName || '门店',
      address: store.address || '',
    });
  },
});
