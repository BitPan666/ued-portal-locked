# 设计需求表同步方案（V2）

本方案用于把 360Teams 在线表格中的本月项目同步到 QFIN Design 资源平台。

> 本文与示例代码只存在于 `version/resource-sync-v2` 分支，不修改原版页面与原版分支。

## 推荐架构

```text
360Teams 设计需求表
        │
        │ OAuth / 企业开放 API / 内部导出接口
        ▼
项目同步任务（内网服务或定时任务）
        │
        │ 数据清洗、按月份过滤、字段脱敏
        ▼
data/projects.json 或内部数据库
        │
        ▼
QFIN Design 网站
```

网站不应直接使用设计师的浏览器 Cookie 登录 360Teams，也不应把 `client_secret`、访问令牌或完整表格内容写入前端代码。

## 同步频率

推荐每 30 分钟同步一次，并保留“立即同步”能力。

- 正常状态：网站读取最近一次成功生成的缓存数据。
- 同步失败：保留旧数据，不清空页面，并记录失败原因。
- 页面展示：显示 `lastSyncedAt`，让用户知道数据新鲜度。
- 重大更新：管理员可以手动触发同步。

项目进度不需要秒级实时，因此定时同步比每次打开页面直接请求表格更稳定。

## 数据范围

只同步网站需要公开展示的字段：

- 业务分类
- 项目名称
- 当前状态
- 更新时间
- Confluence 链接
- Figma 链接
- 蓝湖链接

默认不对外同步负责人、备注、账号、内部密码、未公开需求细节等信息。

## 数据协议

同步程序将上游数据标准化为：

```json
{
  "schemaVersion": 1,
  "month": "2026-10",
  "lastSyncedAt": "2026-10-28T10:30:00+08:00",
  "categories": [
    {
      "id": "borrow",
      "name": "借条",
      "projects": [
        {
          "name": "贷后双11红包抽奖活动",
          "status": "待设计",
          "updatedAt": "2026-10-30",
          "links": {
            "confluence": "",
            "figma": "",
            "lanhu": ""
          }
        }
      ]
    }
  ]
}
```

## 接入步骤

1. 由企业管理员确认 360Teams/亿方云开放平台是否提供在线表格单元格读取接口，申请应用并获得只读权限。
2. 将开放接口响应转换为 `sync/examples/source.example.json` 所示结构；如果真实接口字段不同，只需要修改适配层。
3. 在服务器安全配置中保存：
   - `SYNC_SOURCE_URL`
   - `SYNC_ACCESS_TOKEN`
   - `SYNC_MONTH`（可选）
4. 执行 `node sync/sync-projects.mjs`，生成 `data/projects.json`。
5. 网站读取 `data/projects.json`；上线前增加登录校验或内网访问控制。

## 部署选择

### 方案 A：公司内网服务（推荐）

同步程序部署在能够访问 360Teams 的内网服务器，定时写入数据库或对象存储。网站从内部接口读取数据。

适合内部项目数据，权限和网络边界最清晰。

### 方案 B：GitHub Actions

仓库包含 `.github/workflows/sync-projects.yml.example` 模板。只有当 GitHub Runner 能访问 360Teams，并且仓库是受控私有仓库时才建议启用。

启用前需要：

- 将模板改名为 `sync-projects.yml`。
- 在 GitHub Secrets 中配置访问令牌。
- 确认生成的 `data/projects.json` 不含敏感字段。
- 确认自动提交行为符合团队代码管理规范。

若 360Teams 仅能从公司内网访问，应使用 self-hosted runner 或方案 A。

## 后续需要确认

- 360Teams 表格是否具备官方单元格读取 API。
- 企业是否允许申请 OAuth 应用以及只读权限。
- 数据只在内网展示，还是允许发布到公网。
- 项目链接是否需要按用户身份鉴权。
