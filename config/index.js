/**
 * 全局配置(花田喜事门店展示小程序,对接后端 C 端只读接口 /happyflower/app/**)
 *
 * baseUrl 说明:
 * - 正式域名 https://happyflower.com.cn(需已完成 ICP 备案),接口经 nginx 反代到后端,
 *   前缀 /prod-api;需在「微信公众平台 → 开发管理 → 服务器域名」的 request 合法域名中
 *   登记 https://happyflower.com.cn。
 * - 若本地联调本机后端,可临时改为 http://localhost:9090,并在开发者工具
 *   「详情 → 本地设置 → 不校验合法域名」中放开。
 */
const config = {
  baseUrl: 'https://happyflower.com.cn/prod-api',

  // C 端客户端 ID(对应后端 sys_client 中 C 端登录默认 clientId)
  clientId: '428a8310cd442757ae699df5d894f051',

  // 多租户兜底默认租户:未扫码带 shopCode 或门店解析失败时使用
  tenantId: '000000',

  // 本地存储 key(顾客态)
  tokenKey: 'hf_customer_token',
  customerKey: 'hf_customer_info',
  shopKey: 'hf_shop',

  // 管理态(sys_user)token 与信息 key(与浏览态隔离,互不串号)
  merchantTokenKey: 'hf_merchant_token',
  merchantKey: 'hf_merchant_info',
};

export default config;
