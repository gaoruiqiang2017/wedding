import config from '../config/index';

/**
 * 将后端返回的图片地址规范为可加载的 src。
 * - 完整 http(s) URL / data / wxfile:原样返回
 * - /photos/... 相对路径:拼到 API 源站(小程序需 HTTPS 绝对地址)
 */
export function mediaUrl(url) {
  if (url == null || url === '') return '';
  const u = String(url).trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('wxfile:')) {
    return u;
  }
  const path = u.startsWith('/') ? u : '/' + u.replace(/^\/+/, '');
  const base = resolveApiOrigin();
  return base ? base + path : path;
}

function resolveApiOrigin() {
  const baseUrl = config.baseUrl || '';
  const m = baseUrl.match(/^https?:\/\/[^/]+/i);
  return m ? m[0] : '';
}
