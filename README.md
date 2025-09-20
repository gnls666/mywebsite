## 个人博客网站

个人博客网站的源代码。

需要其他服务商的环境变量才能正常运行，所以如果你想要在本地运行，需要自己配置。

可查看 `.env.example` 文件，里面包含了所有需要的环境变量。

### 技术栈

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Clerk](https://clerk.com/)
- [Neon](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Sanity](https://www.sanity.io/)
- [React Email](https://react.email)
- [Resend](https://resend.com/)

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

通过 [Vercel](https://vercel.com/) 一键部署。

### Activity 状态同步

站点的 Activity 组件会从 Upstash Redis 读取以下键值：

| 键名 | 类型 | 说明 |
| --- | --- | --- |
| `activity:app` | `string` | 当前前台应用的标识，用于选择 `/public/apps/` 下对应的图标 |
| `activity:track` | `object \| null` | 当前播放的音轨信息，字段包含 `title`、可选的 `artist`、`app`、`artwork` |
| `activity:updatedAt` | `string` | ISO 8601 时间戳，记录最近一次同步时间 |

可以通过脚本 `pnpm activity:update` 快速写入这些键，脚本会读取如下环境变量：

- `ACTIVITY_APP`
- `ACTIVITY_TRACK_TITLE`
- `ACTIVITY_TRACK_ARTIST`
- `ACTIVITY_TRACK_APP`
- `ACTIVITY_TRACK_ARTWORK`
- `ACTIVITY_CLEAR_TRACK`（可选，设置为 `true` 可清空曲目状态）

脚本会自动更新时间戳 `activity:updatedAt`，并在缺省 `ACTIVITY_TRACK_APP` 时回落到 `ACTIVITY_APP` 或 `now-playing`。请确保新添加的应用或状态在 `public/apps/` 中有同尺寸的 PNG 图标。
