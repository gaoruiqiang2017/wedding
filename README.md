# 花田喜事 · 门店展示小程序

「花田喜事」婚纱礼服门店的微信小程序，定位为**门店信息展示 + 微信引流**平台：浏览门店礼服款式、化妆造型与备婚指南，扫码加微信到店咨询预约。

> 本小程序仅作门店信息与款式展示，**不提供在线交易、在线支付与下单**。费用与档期一律引导到店或微信沟通确认。

## 功能页面

原生小程序（WXML / WXSS / JS），内容优先、极简导航，底部 4 个 Tab：

| Tab | 路径 | 说明 |
|-----|------|------|
| 首页 | `pages/home/home` | 品牌头 + 搜索、运营轮播、精选婚纱(瀑布流)、明星化妆师、门店一览 |
| 婚纱 | `pages/dress/index` | 置顶搜索 + 风格 chips + 筛选、双列瀑布流大图、下拉刷新、上拉加载 |
| 化妆师 | `pages/staff/index` | 化妆师双列图墙(封面/擅长风格/标签) |
| 我的 | `pages/about/index` | 用户卡、关于门店、门店信息 / 联系咨询 / 备婚指南 / 内容管理入口 |

二级页面（非 Tab）：

| 路径 | 说明 |
|------|------|
| `pages/dress-detail/index` | 婚纱详情：沉浸画廊、属性、相关穿搭、用户评价、底部悬浮咨询栏 |
| `pages/staff-detail/index` | 化妆师详情：画廊、简介、作品集、底部悬浮咨询栏 |
| `pages/store/index` | 门店信息：营业时间、地址、地图 + 导航、门店服务、联系咨询 |
| `pages/contact/index` | 联系咨询：客服二维码、门店地址、跳转门店信息 |
| `pages/content/index` `pages/content-detail/index` | 备婚指南列表 / 详情（分类、富文本、点赞、关联婚纱） |

## 目录结构

```
happyflower/
├── app.js / app.json / app.wxss    # 入口与全局配置
├── config/index.js                 # 后端地址、租户、clientId 等配置
├── api/                            # 后端只读接口封装
│   ├── auth.js  banner.js  content.js
│   ├── dress.js review.js  staff.js  store.js
├── utils/                          # 工具库
│   ├── request.js  auth.js  media.js
│   ├── dict.js     common.js shop.js
├── components/                     # 公共组件
│   ├── contact-qr/                 # 微信扫码咨询卡片
│   └── review-list/                # 用户评价列表
├── custom-tab-bar/                 # 自定义底部 tabBar(emoji 图标)
├── common/updateManager.js         # 小程序版本更新检测
├── images/                         # 本地图片(logo、微信二维码、默认占位)
└── pages/                          # 页面
```

## 数据来源

对接后端 C 端只读接口 `/happyflower/app/**`（婚纱、轮播、门店、化妆师、备婚指南、评价），
多租户由门店解析（扫码携带 `shopCode`）得到，游客可直接浏览、无需登录。

- 接口基址在 `config/index.js` 的 `baseUrl` 配置，当前为 `https://happyflower.com.cn/prod-api`。
- 图片地址由 `utils/media.js` 统一处理：完整 URL 原样使用，`/photos/**` 相对路径拼到源站。

## 构建运行

1. 用微信开发者工具导入本项目（AppID 见 `project.config.json`）。
2. 无第三方 npm 依赖，无需「构建 npm」，直接编译预览即可。
3. 本地联调本机后端时，把 `config/index.js` 的 `baseUrl` 临时改为 `http://localhost:9090`，
   并在开发者工具「详情 → 本地设置 → 不校验合法域名」中放开。

## 发布前配置清单

- **服务器域名**：微信公众平台 → 开发管理 → 服务器域名，request 合法域名添加 `https://happyflower.com.cn`（域名需已完成 ICP 备案）。
- **小程序备案**：完成微信小程序备案，并把页面底部备案号替换为实际备案信息。
- **微信二维码**：`images/wechat-qr.jpg` 已为门店真实二维码，如有更换请替换同名文件。
- **门店数据**：婚纱、轮播、门店、化妆师、备婚指南等内容由后端管理端维护。
- **类目**：个人主体小程序类目受限，提交时请选择可用的展示类目，确保内容为纯展示、无交易入口。

## 代码风格

`eslint` + `prettier`（配置见 `.eslintrc` / `package.json`）。
