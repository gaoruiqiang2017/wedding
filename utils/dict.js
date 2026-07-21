/**
 * 字典本地映射(取自后端 sql/happyflower_init.sql 中的字典数据)
 * C 端为只读展示,直接内置 label 映射,避免额外依赖 dict 接口。
 */
export const DICT = {
  hf_dress_status: {
    '0': { label: '可租', type: 'success' },
    '1': { label: '在租', type: 'primary' },
    '2': { label: '清洗中', type: 'warning' },
    '3': { label: '维修中', type: 'info' },
    '9': { label: '报废', type: 'danger' },
  },
  hf_dress_style: {
    '1': { label: '鱼尾' }, '2': { label: '赫本' }, '3': { label: '蓬蓬裙' },
    '4': { label: 'A字' }, '5': { label: '直身' }, '6': { label: '大拖尾' }, '7': { label: '秀禾' },
  },
  hf_staff_level: {
    '1': { label: '总监' }, '2': { label: '资深' }, '3': { label: '普通' },
  },
  hf_staff_type: {
    '1': { label: '化妆师' }, '2': { label: '摄影师' }, '3': { label: '跟妆师' },
  },
  hf_staff_status: {
    '0': { label: '在职', type: 'success' }, '1': { label: '请假', type: 'warning' }, '9': { label: '离职', type: 'danger' },
  },
};

/** 由字典生成 picker 选项 [{ value, label }] */
export const dictOptions = (type) =>
  Object.keys(DICT[type] || {}).map((k) => ({ value: k, label: DICT[type][k].label }));

/** 颜色对应的展示色值(用于自定义 tag) */
export const TYPE_COLORS = {
  success: '#52c41a',
  primary: '#c89b6d',
  warning: '#fa8c16',
  info: '#8c8c8c',
  danger: '#f5222d',
  default: '#8c8c8c',
};

export const dictLabel = (type, value) => {
  const v = value === null || value === undefined ? '' : String(value);
  const item = DICT[type] && DICT[type][v];
  return item ? item.label : v;
};

export const dictColor = (type, value) => {
  const v = value === null || value === undefined ? '' : String(value);
  const item = DICT[type] && DICT[type][v];
  return TYPE_COLORS[(item && item.type) || 'default'];
};

/** 婚纱风格列表(用于分类/筛选) */
export const dressStyleOptions = Object.keys(DICT.hf_dress_style).map((k) => ({
  value: k,
  label: DICT.hf_dress_style[k].label,
}));
