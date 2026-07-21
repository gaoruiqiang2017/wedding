/**
 * 内容管理图片上传(需管理 token)
 * POST /happyflower/app/merchant/upload  multipart field=file -> R<String>(返回相对 URL,如 /photos/...)
 */
import config from '../config/index';
import { getMerchantToken, getShop } from './auth';

/** 选择并上传单张图片,resolve 后端返回的相对 URL */
export function chooseAndUpload() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (r) => {
        const file = r.tempFiles && r.tempFiles[0];
        if (!file) {
          reject(new Error('未选择图片'));
          return;
        }
        uploadFile(file.tempFilePath).then(resolve).catch(reject);
      },
      fail: reject,
    });
  });
}

/** 上传本地临时文件路径,resolve 相对 URL */
export function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const shop = getShop();
    const tenantId = (shop && shop.tenantId) || config.tenantId;
    const header = { clientid: config.clientId };
    if (tenantId) header.tenantId = tenantId;
    const token = getMerchantToken();
    if (token) header.Authorization = 'Bearer ' + token;

    wx.uploadFile({
      url: config.baseUrl + '/happyflower/app/merchant/upload',
      filePath,
      name: 'file',
      header,
      success: (res) => {
        let body = res.data;
        try {
          body = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
          reject(new Error('上传返回解析失败'));
          return;
        }
        if (body && body.code === 200 && body.data) {
          const url = typeof body.data === 'string' ? body.data : body.data.url;
          if (url) {
            resolve(url);
            return;
          }
        }
        reject(new Error((body && body.msg) || '上传失败'));
      },
      fail: reject,
    });
  });
}
