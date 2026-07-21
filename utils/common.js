/** 通用工具 */

/** 解析婚纱/作品图册(JSON 数组字符串或逗号分隔),失败则回退封面 */
export const parseAlbum = (album, cover) => {
  const list = [];
  if (album) {
    try {
      const arr = JSON.parse(album);
      if (Array.isArray(arr)) list.push(...arr.filter(Boolean));
    } catch (e) {
      album.split(',').forEach((s) => s && list.push(s.trim()));
    }
  }
  if (list.length === 0 && cover) list.push(cover);
  return list;
};

/** 把逗号/中文逗号分隔的标签串解析为数组 */
export const parseTags = (tags) => {
  if (!tags) return [];
  return String(tags)
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
};
