# Technical

## 1. 技术栈

- 游戏：BOBA RUSH
- 类型：simulation
- 简述：UMe 珍珠奶茶小铺 — 放置经营，招聘店员，走向星际
- 框架 / 语言 / 构建：React, TypeScript, Vite, Less
- 渲染方式：Canvas/WebGL
- 依赖摘录：@types/react@^18.2.0, @types/react-dom@^18.2.0, @vitejs/plugin-react@^4.2.1, less@^4.2.0, react@^18.2.0, react-dom@^18.2.0, typescript@^5.3.3, vite@^5.1.0
- 平台元信息：meta.title=BOBA RUSH；cover_url=/poster.png；category=simulation；uuid=e899ae8a-f80f-4336-aff0-c98c93e0a787

## 2. 目录结构

- `index.html`：Vite/浏览器入口，挂载根节点和基础 meta。
- `package.json`：定义 npm 脚本、依赖和工程名称。
- `vite.config.ts`：配置构建、插件和相对路径 base。
- `meta.json`：平台发布元信息，包含标题和封面。
- `src/App.tsx`：React 组件和交互界面。
- `src/main.tsx`：React 组件和交互界面。
- `src/shared.d.ts`：游戏源码模块。
- `src/vite-env.d.ts`：游戏源码模块。
- `src/App.less`：视觉样式、布局、动画和响应式规则。
- `src/game-id.ts`：游戏源码模块。
- `src/UmeBoba/guideLines.ts`：游戏源码模块。
- `src/UmeBoba/types.ts`：游戏源码模块。
- `src/UmeBoba/constants.ts`：游戏源码模块。
- `src/UmeBoba/UmeBoba.tsx`：React 组件和交互界面。
- `src/UmeBoba/index.ts`：游戏源码模块。
- `src/UmeBoba/tutorial.ts`：游戏源码模块。
- `src/UmeBoba/UmeBoba.less`：视觉样式、布局、动画和响应式规则。
- `src/UmeBoba/utils/sounds.ts`：游戏源码模块。

关键源码模块：

- `src/App.tsx`
- `src/main.tsx`
- `src/shared.d.ts`
- `src/vite-env.d.ts`
- `src/App.less`
- `src/game-id.ts`
- `src/UmeBoba/guideLines.ts`
- `src/UmeBoba/types.ts`
- `src/UmeBoba/constants.ts`
- `src/UmeBoba/UmeBoba.tsx`
- `src/UmeBoba/index.ts`
- `src/UmeBoba/tutorial.ts`
- `src/UmeBoba/UmeBoba.less`
- `src/UmeBoba/utils/sounds.ts`
- `src/UmeBoba/components/Leaderboard.tsx`
- `src/UmeBoba/components/SplashScreen.tsx`
- `src/UmeBoba/components/Leaderboard.less`
- `src/UmeBoba/components/TutorialLayer.tsx`
- `src/UmeBoba/components/TutorialLayer.less`
- `src/UmeBoba/components/HelpPanel.less`
- `src/UmeBoba/components/StartScreen.less`
- `src/UmeBoba/components/ShopView.tsx`
- `src/UmeBoba/components/ShopView.less`
- `src/UmeBoba/components/StartScreen.tsx`

## 3. 核心模块

- 状态管理与主循环：通过 React 状态/引用配合 `requestAnimationFrame` 推进游戏帧。
- 渲染方式：Canvas/WebGL，样式由 CSS/Less 和组件结构共同完成。
- 碰撞 / 更新：源码包含命中、距离、边界或重叠判断，结果会影响得分、生命或阶段。
- 音频：包含程序化音频或音频文件播放，按交互事件触发。
- 多语言：包含 i18n / locale 检测或 `t()` 文案函数。
- 存储：使用 localStorage、useGameSave 或 persist 保存分数、收藏、墙数据或本地状态。
- Aigram 运行时：接入 `@shared/runtime` 或平台桥接能力，用于用户、资料页、分享、通知或平台 API。
- 排行榜：源码包含分数提交、排名或榜单展示逻辑。

## 4. 扩展点

- 改玩法参数：优先查找 `src/` 内大写常量、hooks、主组件顶部配置或关卡数组。
- 换素材：替换 `public/`、`src/img/` 或源码 import 的图片/音频文件，并保持相对路径。
- 调视觉：修改主样式文件中的颜色、间距、动画时长、网格尺寸和响应式规则。
- 改文案：修改 i18n 字典、组件内标题按钮文案，保持 zh/en 同步。
- 加平台能力：在已有 `@shared/runtime`、useGameSave、排行榜、墙或通知调用附近扩展，避免另起一套存储。
