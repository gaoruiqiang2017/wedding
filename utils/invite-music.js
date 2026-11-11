/**
 * 请柬内置背景音乐(可不选)。
 * key 用于编辑页选中态; url 为站点静态资源路径。
 */
export const INVITE_MUSIC = [
  {
    key: 'warm',
    value: '/photos/invite-bgm/warm.wav',
    label: '温柔时光',
    desc: '柔和暖调',
  },
  {
    key: 'classic',
    value: '/photos/invite-bgm/classic.wav',
    label: '典雅仪式',
    desc: '沉稳庄重',
  },
  {
    key: 'poetic',
    value: '/photos/invite-bgm/poetic.wav',
    label: '诗意漫步',
    desc: '轻盈飘逸',
  },
  {
    key: 'light',
    value: '/photos/invite-bgm/light.wav',
    label: '清欢浅唱',
    desc: '明亮轻快',
  },
];

export function musicUrlByKey(key) {
  const hit = INVITE_MUSIC.find((m) => m.key === key);
  return hit ? hit.value : '';
}

export function musicKeyByUrl(url) {
  if (!url) return 'none';
  const hit = INVITE_MUSIC.find((m) => m.value === url);
  return hit ? hit.key : 'custom';
}

export function isBuiltinMusic(url) {
  return INVITE_MUSIC.some((m) => m.value === url);
}
