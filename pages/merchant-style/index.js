import { listDressStyles, addDressStyle, renameDressStyle, removeDressStyle } from '../../api/dress-style';
import { isMerchantLogin } from '../../utils/auth';

Page({
  data: {
    styles: [],
    input: '',
    loading: false,
    saving: false,
  },

  onLoad() {
    if (!isMerchantLogin()) {
      wx.redirectTo({ url: '/pages/merchant-login/index' });
      return;
    }
    this.load();
  },

  load() {
    this.setData({ loading: true });
    listDressStyles()
      .then((res) => this.setData({ styles: res.data || [] }))
      .catch(() => {})
      .then(() => this.setData({ loading: false }));
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  add() {
    const name = (this.data.input || '').trim();
    if (!name) {
      wx.showToast({ title: '请输入风格名称', icon: 'none' });
      return;
    }
    if (this.data.saving) return;
    this.setData({ saving: true });
    addDressStyle(name)
      .then(() => {
        this.setData({ input: '', saving: false });
        wx.showToast({ title: '已添加', icon: 'success' });
        this.load();
      })
      .catch(() => this.setData({ saving: false }));
  },

  rename(e) {
    const { code, label } = e.currentTarget.dataset;
    wx.showModal({
      title: '改名',
      editable: true,
      placeholderText: '输入新的风格名称',
      content: label,
      success: (r) => {
        if (!r.confirm) return;
        const name = (r.content || '').trim();
        if (!name) {
          wx.showToast({ title: '名称不能为空', icon: 'none' });
          return;
        }
        if (name === label) return;
        renameDressStyle(code, name)
          .then(() => {
            wx.showToast({ title: '已更新', icon: 'success' });
            this.load();
          })
          .catch(() => {});
      },
    });
  },

  remove(e) {
    const { code, label } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除风格',
      content: `确定删除「${label}」?已使用该风格的婚纱不受影响,但它将不再作为筛选项。`,
      success: (r) => {
        if (!r.confirm) return;
        removeDressStyle(code)
          .then(() => {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.load();
          })
          .catch(() => {});
      },
    });
  },
});
