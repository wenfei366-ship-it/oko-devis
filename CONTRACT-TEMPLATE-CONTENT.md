# OKO Contract Template Content

Last updated: 2026-04-13

## 1. 这份文档是干什么的

这份文档是给设计和开发合同模板用的。

它基于当前实际在用的合同生成器：

- `/Users/zhangxiaonan/Downloads/contract-generator/index.html`

目的只有一个：

- 把当前合同模板的内容整理清楚
- 明确哪些是固定正文
- 明确哪些是要填写的内容
- 方便交给 Claude Code 继续做新版合同模板

---

## 2. 当前合同模板的本质

当前这份合同，不是一个“完全动态拼装”的合同系统。

它本质上是：

- 一份固定的标准合同正文
- 插入少量客户信息
- 插入客户选择的套餐摘要
- 插入一个最终成交总价
- 插入特殊条款 / 备注

也就是说：

- 正文的大部分条款是固定的
- 客户信息是变量
- 套餐选择是变量
- 最终价格是变量
- 特殊备注是变量

---

## 3. 当前合同的完整结构

当前合同正文顺序如下：

1. 合同标题
2. 双方信息
3. Article 1：合同目的 / 服务内容
4. Article 2：期限
5. Article 3：服务执行
6. Article 4：解约和违约
7. Article 5：数据返还
8. Article 6：参考案例
9. Article 7：价格和计费
10. Article 8：特殊条款和备注
11. 签署说明
12. 日期与地点
13. 双方签字区

---

## 4. 当前模板里固定不变的内容

下面这些内容，当前模板里基本是写死的。

### 4.1 OKO 公司信息

当前模板里固定写的是：

- 公司名：`SAS OKO`
- 地址：`31 boulevard de Magenta, 75010 Paris`
- 注册号：`881 648 323 00015`
- 代表人：`M. Shengmao KE`
- 身份：`président`

这一段属于固定模板内容，不需要业务人员每次手动填写。

### 4.2 合同条款结构

下面这些条款，在当前模板里是固定正文：

- 引言
- Article 2：期限
- Article 3：服务执行
- Article 4：解约和违约
- Article 5：数据返还
- Article 6：参考案例
- Article 7：固定价格表说明
- Article 8 的标题
- 底部“本合同一式两份”
- OKO 签字区

### 4.3 Article 1 的固定服务条款

当前 Article 1 里，服务条款是整段固定列出来的，不是根据勾选内容自动精简。

当前固定服务内容包括：

- 网站的创建和管理
- 网站在线预订服务、外卖和配送服务
- 在 Google、TripAdvisor、Yelp、Facebook 上创建餐厅页面
- OKO Pro 移动应用
- OKO Pro 的子功能列表
- 餐桌二维码设计
- 营销套件
- 网络形象 / 声誉优化
- 转盘游戏

### 4.4 Article 7 的固定价格表

当前价格说明也是固定写死的。

固定价格内容包括：

- 网站创建费：100 €
- 网站：30 €/月 或 300 €/年
- 地理定位系统：50 €/月 或 500 €/年
- 在线订购：50 €/月 或 500 €/年
- 店内点餐：50 €/月 或 500 €/年
- 网络形象 / 声誉：50 €/月 或 500 €/年
- 转盘游戏：50 €/月 或 500 €/年

也就是说：

- 固定价格表先整段列出
- 然后再单独显示“客户这次实际选择了什么”

---

## 5. 当前模板里需要填写的内容

下面这些是当前模板里真正会变的内容。

### 5.1 客户公司名

字段名：

- `clientCompany`

说明：

- 客户公司或餐厅名称

例子：

- `Restaurant Le Soleil`

### 5.2 客户地址

字段名：

- `clientAddress`

说明：

- 公司注册地址或营业地址

例子：

- `15 rue de la Paix, 75001 Paris`

### 5.3 客户代表人

字段名：

- `clientRepresentative`

说明：

- 客户签约代表人

例子：

- `M. Jean Dupont`

### 5.4 合同日期

字段名：

- `contractDate`

说明：

- 合同签署日期

### 5.5 付款方式

字段名：

- `paymentMode`

可选值：

- `monthly`
- `annual`

说明：

- 决定总价显示是按月还是按年
- 也决定套餐摘要里的价格显示方式

### 5.6 客户选择的服务 / 套餐

当前可选字段包括：

- `forfait_creation`
- `forfait_web`
- `forfait_geo`
- `forfait_online`
- `forfait_salle`
- `forfait_reputation`
- `forfait_roulette`

这些字段会影响：

- “客户选择的套餐”摘要框
- 小计显示

### 5.7 最终成交总价

字段名：

- `finalTotal`

说明：

- 当前模板允许人工直接填写最终成交价
- 不是强制用套餐小计直接作为合同成交价

这个逻辑非常重要，建议保留。

原因：

- 实际业务里可能有折扣
- 可能有赠送
- 可能有特殊谈判价格

### 5.8 特殊条款 / 备注

字段名：

- `specialConditions`

说明：

- 用来填写特别约定
- 用来填写赠送和优惠
- 用来填写额外备注

当前法语默认示例是：

- `Paiement mensuel avec un mois de jeu de roue offert.`

---

## 6. 当前模板里的变量插入位置

如果按模板插槽来理解，当前模板主要有这些插入位置。

### 插槽 1：客户公司名

出现在双方信息里的客户部分。

### 插槽 2：客户地址

出现在双方信息里的客户部分。

### 插槽 3：客户代表人

出现在双方信息里的客户部分。

### 插槽 4：合同日期

出现在底部签署日期里。

### 插槽 5：客户所选套餐

出现在 Article 7 的套餐摘要框里。

### 插槽 6：最终成交总价

出现在 Article 7 的总价位置里。

### 插槽 7：特殊条款

出现在 Article 8。

---

## 7. 当前合同的法语正文结构

下面是当前模板的真实法语正文结构整理。

这部分很重要，Claude Code 做新版模板时，应该以它为基础整理。

### 标题

- `Contrat de prestations de services`

### 引言部分

结构是：

- 双方签约说明
- 先写客户
- 再写 OKO
- 然后写“双方达成如下协议”

客户部分模板结构：

- `La société [clientCompany]`
- `dont le siège social est situé au [clientAddress]`
- `représentée par [clientRepresentative]`
- `ci-après désignée « Le Client »`

OKO 部分模板结构：

- `La société SAS OKO`
- 固定地址
- 固定注册号
- 固定代表人
- `ci-après dénommée le Prestataire`

### Article 1：Objet du contrat

当前正文含义是：

- 本合同服务内容包括以下项目
- 然后列出完整服务清单

当前服务清单包括：

- 网站创建和管理
- 在线预订、外卖、配送
- Google / TripAdvisor / Yelp / Facebook 页面创建
- OKO Pro 应用
- OKO Pro 子功能明细
- 餐桌二维码
- 营销物料
- 网络声誉优化
- 转盘游戏

### Article 2：Durée

当前固定正文是：

- 合同原则上为无固定期限

### Article 3：Exécution de la prestation

当前固定正文包括：

- 服务商承诺按专业规范完成服务
- 客户要配合提供信息
- 客户要指定联系人
- 首次扣款在网站验收后进行

### Article 4：Résiliation et sanctions

当前固定正文包括：

- 没有强制绑定期限
- 客户可以随时终止
- 但要提前一个月发邮件到 `support@joinoko.com`

### Article 5：Restitution des données

当前固定正文包括：

- 合同结束后，客户可要求返还部分数据

返还内容包括：

- 域名转移码
- 客户档案数据
- 网站图片和文字

### Article 6：Référencement

当前固定正文包括：

- 客户同意 OKO 可以把相关项目作为参考案例展示

### Article 7：Facturation et prix

这一条分成两部分：

第一部分：

- 固定价格表

第二部分：

- 客户本次实际选择的套餐
- 最终成交总价

然后还有固定说明：

- 可按月或按年付款
- 如果按年付款，提前解约不退款

### Article 8：Conditions spécifiques et remarques

这里是变量区。

当前内容来源于：

- `specialConditions`

也就是业务人员手填的特殊条款和备注。

### 底部说明

当前模板固定有：

- 本合同一式两份，双方各执一份
- 签署日期
- 签署地点：巴黎

### 签字区

当前模板有两边：

- OKO 一侧
- 客户一侧

OKO 一侧会直接放固定签名图：

- `signature.jpg`

客户一侧留空。

---

## 8. 当前模板的多语言情况

当前模板支持以下语言：

- `fr`
- `zh`
- `it`
- `de`
- `es`

这说明合同模板本身就是多语言合同，不是只做法语。

新版模板也必须继续支持这 5 种输出语言：

- 法语
- 中文
- 意大利语
- 德语
- 西班牙语

但是从业务和法律角度看，仍然需要保留下面这条规则：

- 法语版是最重要的主版本

建议 Claude Code 做新版模板时：

1. 合同模板一开始就按多语言结构设计
2. 所有标题、正文、按钮、签署文案都要有 5 种语言版本
3. 法语版作为法律依据版本
4. 其他语言版作为对外阅读版本

### 多语言模板规则

请按下面规则理解：

- 合同必须能输出 `fr / zh / it / de / es`
- 同一份合同在不同语言下，结构必须一致
- 只是文案翻译不同，合同结构不能乱
- 变量字段位置必须一致
- 法语版是法律基准版本

### 法律说明建议

如果输出的不是法语版，建议在合同底部保留一条小字说明，类似：

- 如发生争议，以本合同法文版本为准

法语可写成类似：

- `La version française du présent contrat fait foi en cas de litige.`

---

## 9. 我们建议新版模板保留的逻辑

Claude Code 在做新版模板时，建议保留下面这些逻辑。

### 要保留

- 固定合同正文框架
- OKO 固定公司信息
- 客户信息变量
- 套餐选择摘要
- 最终成交总价手填
- 特殊条款变量
- 双方签字区

### 为什么保留最终成交总价手填

因为真实业务里：

- 套餐原价不一定等于成交价
- 可能有折扣
- 可能有赠送
- 可能有单独谈好的价格

所以：

- 小计可以自动算
- 但合同总价仍然要允许人工输入

---

## 10. 我们建议新版模板补充的字段

当前模板虽然能用，但不够完整。

建议 Claude Code 在新版模板里补这些字段。

### 合同信息字段

- `contractNumber`
- `devisNumber`
- `contractDate`
- `signingPlace`
- `language`

### 客户信息字段

- `clientCompany`
- `clientAddress`
- `clientPostalCode`
- `clientCity`
- `clientRepresentative`
- `clientEmail`
- `clientPhone`

### 商务信息字段

- `paymentMode`
- `selectedServices`
- `subtotalDisplay`
- `finalTotal`
- `totalUnit`

### 备注字段

- `specialConditions`

---

## 11. 推荐给 Claude Code 的新版模板结构

建议 Claude Code 按下面这个结构做新版合同模板。

### 1. 标题区

建议包含：

- 合同标题
- 合同编号
- 报价单编号
- 日期

### 2. 双方信息

建议包含：

- 客户公司名
- 客户地址
- 客户联系人
- OKO 固定信息

### 3. Article 1：合同目的

保留当前标准正文逻辑。

### 4. Article 2：期限

保留当前固定正文。

### 5. Article 3：服务执行

保留当前固定正文。

### 6. Article 4：解约和违约

保留当前固定正文。

### 7. Article 5：数据返还

保留当前固定正文。

### 8. Article 6：参考案例

保留当前固定正文。

### 9. Article 7：价格和计费

建议分成三层：

- 固定价格表
- 客户所选套餐摘要
- 最终成交总价

### 10. Article 8：特殊条款

插入：

- `specialConditions`

### 11. 底部签署区

建议包含：

- 签署地点
- 签署日期
- OKO 签字
- 客户签字位

---

## 12. 推荐给 Claude Code 的工作原则

Claude Code 做新版模板时，请遵守下面这些原则。

### 原则 1

不要把合同做成一个完全自由编辑器。

### 原则 2

合同应该是：

- 固定模板
- 少量变量
- 少量可填

### 原则 3

不要把套餐小计直接当作最终合同价。

### 原则 4

保留“特殊条款 / 备注”这个区块。

### 原则 5

合同必须从一开始就按多语言模板设计，不是后面再补翻译。

---

## 13. 给 Claude Code 的一句话任务总结

请基于当前 `/Users/zhangxiaonan/Downloads/contract-generator/index.html` 中正在实际使用的合同内容，整理并设计一个新版合同模板。

目标是：

- 保留当前合同的固定正文逻辑
- 明确变量字段
- 做出更清晰、更正式、更适合接入 `oko-devis` 的合同模板
- 保留“客户信息 + 套餐摘要 + 最终成交价 + 特殊条款”的核心结构
- 同时支持 `fr / zh / it / de / es`
- 法语版作为法律依据版本

---

## 14. 最后一句最重要的话

当前这份合同，本质上不是“完全动态合同”。

它本质上是：

**标准合同正文 + 客户变量 + 套餐摘要 + 最终成交总价 + 特殊条款**

Claude Code 做新版模板时，应该延续这个核心思路，而不是完全推翻。
