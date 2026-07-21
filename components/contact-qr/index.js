Component({
  properties: {
    compact: { type: Boolean, value: false },
    title: { type: String, value: '扫码添加客服咨询' },
    tip: { type: String, value: '试纱与租赁请到店或联系客服确认' },
    remark: { type: String, value: '添加时备注「试纱咨询」或「婚纱咨询」' },
    qr: { type: String, value: '/images/wechat-qr.jpg' },
  },
  methods: {
    previewQr() {
      if (!this.data.qr) return;
      wx.previewImage({ urls: [this.data.qr] });
    },
  },
});
