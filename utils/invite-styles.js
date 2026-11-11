/** 婚礼请柬 13 套风格(门店增值展示模板) */
export const INVITE_STYLES = [
  { value: 'floral', label: '花田暖金', desc: '奶油金棕，门店同款气质' },
  { value: 'classic', label: '典雅红韵', desc: '酒红点缀，中式仪式感' },
  { value: 'modern', label: '极简黑金', desc: '干净黑白，现代婚礼' },
  { value: 'poetic', label: '诗意长卷', desc: '图文穿插，长页阅读' },
  { value: 'dual', label: '双帧叙事', desc: '上下双图，短句告白' },
  { value: 'calendar', label: '日历纪念', desc: '婚礼日日历高亮' },
  { value: 'mapfocus', label: '地图恭候', desc: '场地信息+导航为主' },
  { value: 'story', label: '好久不见', desc: '大字排版，故事感邀请' },
  { value: 'collage', label: '与你同在', desc: '拼贴双图，甜蜜氛围' },
  { value: 'vertical', label: '眼里有光', desc: '竖排英文+主视觉' },
  { value: 'rose', label: '玫瑰誓言', desc: '诗句与单图对仗' },
  { value: 'seastory', label: '月升故事', desc: '双图夹心，简短标题' },
  { value: 'beside', label: '你在身旁', desc: '左右分栏，温柔收尾' },
];

export const INVITE_STYLE_MAP = INVITE_STYLES.reduce((m, s) => {
  m[s.value] = s.label;
  return m;
}, {});

export const INVITE_STYLE_VALUES = INVITE_STYLES.map((s) => s.value);
