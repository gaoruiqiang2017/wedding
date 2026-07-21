/**
 * 门店解析(shopCode → 租户)
 * - 小程序扫码进入:options.query.shopCode 或 scene(形如 "shopCode=000000")
 * - 解析到 shopCode 后调后端换取 { tenantId, shopName } 并本地存储
 * - 无 shopCode 或解析失败时回退兜底默认租户
 */
import config from '../config/index';
import { getShop, setShop } from './auth';
import { resolveShop } from '../api/auth';

export function parseShopCode(options) {
  const query = (options && options.query) || {};
  if (query.shopCode) return String(query.shopCode).trim();
  if (query.scene) {
    const scene = decodeURIComponent(String(query.scene));
    const m = scene.match(/shopCode=([^&]+)/);
    return (m ? m[1] : scene).trim();
  }
  return '';
}

export function ensureShop(options) {
  const shopCode = parseShopCode(options);
  if (!shopCode) {
    const existing = getShop();
    if (existing && existing.tenantId) return Promise.resolve(existing);
    return Promise.resolve(fallbackShop());
  }
  return resolveShop(shopCode)
    .then((res) => {
      const data = res.data || {};
      const shop = { tenantId: data.tenantId, shopName: data.shopName || '' };
      setShop(shop);
      return shop;
    })
    .catch(() => fallbackShop());
}

function fallbackShop() {
  const shop = { tenantId: config.tenantId, shopName: '' };
  setShop(shop);
  return shop;
}
