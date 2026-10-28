# Project Sync

这是 QFIN Design V2 的项目同步骨架，不包含真实访问凭证。

## 本地验证

```bash
node sync/sync-projects.mjs \
  --input sync/examples/source.example.json \
  --output data/projects.json \
  --month 2026-10
```

## 接口模式

```bash
SYNC_SOURCE_URL="https://internal.example/api/design-projects" \
SYNC_ACCESS_TOKEN="***" \
SYNC_MONTH="2026-10" \
node sync/sync-projects.mjs
```

真实令牌只应存放在服务器密钥管理或 GitHub Secrets 中，不能提交到仓库。
