export const seo = {
  title: "谈嘉昌's Blog",
  description:
    '我是谈嘉昌。一个前端开发者，欢迎来到我的空间。这里是我的个人博客，记录了我在技术、生活的零碎思考。欢迎留下你的想法和我交流。',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://mywebsite-eight-delta.vercel.app/'
      : 'http://localhost:3000'
  ),
} as const
