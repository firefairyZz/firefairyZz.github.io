# SYNTAX — 网站语法 & 架构参考

本文档记录网站所有自定义语法、组件架构和多语言规范。

---

## 目录

- [组件架构](#组件架构)
  - [Component 目录](#component-目录)
  - [新增一个详情页](#新增一个详情页)
  - [修改样式 / 按钮 / 功能](#修改样式--按钮--功能)
- [多语言](#多语言)
  - [URL 规则](#url-规则)
  - [Cookie 偏好](#cookie-偏好)
  - [界面文本国际化](#界面文本国际化)
  - [Markdown 内容](#markdown-内容)
- [Markdown 扩展语法](#markdown-扩展语法)
  - [自定义标签](#自定义标签)
  - [自定义按钮](#自定义按钮)
  - [图片扩展语法](#图片扩展语法)

---

## 组件架构

### Component 目录

所有共享的样式和脚本都放在根目录的 `Component/` 下，页面只需引入即可。

| 文件 | 作用 | 引入路径 |
|------|------|----------|
| `Component/styles.css` | 所有共享 CSS（布局、按钮、内容排版、Lightbox 等） | `../../Component/styles.css` |
| `Component/site.js` | 移动端菜单切换 + 随机背景图 + 语言切换按钮 | `../../Component/site.js` |
| `Component/markdown.js` | `preprocessCustomTags()` + `parseProjectINI()` + `parseBlogINI()` | `../../Component/markdown.js` |
| `Component/lightbox.js` | 图片预览功能（缩放、拖动、键盘、触摸） | `../../Component/lightbox.js` |
| `Component/i18n.js` | 多语言（cookie 读写、浏览器语言检测、`t()` 翻译函数） | `../../Component/i18n.js` |

**页面引入顺序**（`<head>` 和 `<body>` 底部）：
```html
<!-- head 中 -->
<link rel="stylesheet" href="../../Component/styles.css">

<!-- body 底部，按依赖顺序 -->
<script src="../../Component/i18n.js"></script>
<script src="../../Component/site.js"></script>
<script src="../../Component/markdown.js"></script>
<script src="../../Component/lightbox.js"></script>
```

### 新增一个详情页

**项目详情页**（以 `Project/World_Editor/` 为模板）：

1. 在 `Project/` 下新建目录，如 `Project/MyNewProject/`
2. 创建 `index.html`（复制自 `Project/World_Editor/index.html`，不改组件引入）
3. 创建 `Intro.ini`（项目元信息）：
   ```ini
   [Project]
   name=我的新项目
   intro=一段简介
   image=cover.png
   full_image=false
   
   [Tags]
   0=JavaScript
   1=HTML
   ```
4. 创建 `MyNewProject.md`（Markdown 正文）
5. 如需本地图片，放在 `Project/MyNewProject/image/` 下

**博客详情页**（以 `Blog/Welcome/` 为模板）：

1. 在 `Blog/` 下新建目录
2. 创建 `index.html`（复制自 `Blog/Welcome/index.html`）
3. 创建 `Intro.ini`：
   ```ini
   [Info]
   title=我的博客标题
   date=2026-08-31
   summary=一句话摘要
   show_image=true
   image=cover.png
   full_image=false
   
   [Tags]
   0=随笔
   ```
4. 创建 `目录名.md`（如 `Welcome.md`）

### 修改样式 / 按钮 / 功能

**只改一个文件即可全站生效**：

| 想改什么 | 编辑文件 |
|----------|----------|
| 按钮颜色 / 高度 / 图标 | `Component/styles.css` 中的 `.github-btn` / `.afdian-btn` / `.android-btn` / `.win64-btn` |
| 新增一个按钮类型 | 在 `styles.css` 加样式 + `markdown.js` 加正则 |
| 排版样式（标题、图片、代码块等） | `Component/styles.css` 中的 `.project-content` 部分 |
| Lightbox 预览行为（缩放步进、键盘快捷键等） | `Component/lightbox.js` |
| Markdown 语法扩展 | `Component/markdown.js` 中的 `preprocessCustomTags()` |
| 语言切换按钮样式 / 位置 | `Component/styles.css` + `Component/site.js` |
| 翻译文本 | `Component/i18n.js` 中的 `TRANSLATIONS` 对象 |

---

## 多语言

### URL 规则

```
URL 模式                         实际读取的物理文件
─────────────────────────────────────────────────────────
/                               → index.html（语言检测入口）
/zh_CN/index.html               → index.html（中文界面）
/en/index.html                  → index.html（英文界面）
/zh_CN/Project/World_Editor/    → Project/World_Editor/index.html（中文界面）
/en/Project/World_Editor/       → Project/World_Editor/index.html（英文界面）
/Project/World_Editor/          → 自动根据 cookie 重定向
```

### Cookie 偏好

- Cookie 名称：`lang`
- 可选值：`zh_CN`（默认）、`en`
- 有效期：1 年（31536000 秒）
- 路径：`/`

**重定向逻辑**（server.js 处理）：

1. 请求无语言前缀 → 读取 Cookie
2. Cookie 存在且为 `zh_CN` 或 `en` → 重定向到对应前缀路径
3. Cookie 不存在 → 检测 `Accept-Language` 请求头：
   - 优先 `zh-CN` / `zh` → `zh_CN`
   - 包含 `en` → `en`
   - 其他 → `zh_CN`（默认）
4. 设置 Cookie → 重定向

**手动切换**：点击导航栏的 `EN` / `中` 按钮 → `i18n.setLanguage('en')` → 写入 Cookie → 页面刷新

### 界面文本国际化

页面 HTML 中需要翻译的文本加 `data-i18n="key"` 属性：

```html
<!-- Before -->
<a href="../../index.html" class="nav-link text-sm">首页</a>

<!-- After -->
<a href="../../index.html" class="nav-link text-sm" data-i18n="nav.home">首页</a>
```

`Component/i18n.js` 中的翻译表：

```javascript
const TRANSLATIONS = {
    zh_CN: {
        'nav.home': '首页',
        'nav.projects': '项目',
        'nav.blog': '博客',
        'nav.about': '关于',
        'nav.contact': '联系我',
        'nav.back_to_projects': '返回项目列表',
        'nav.back_to_blog': '返回博客列表',
        'footer.rights': '设计与开发',
        // ...
    },
    en: {
        'nav.home': 'Home',
        'nav.projects': 'Projects',
        'nav.blog': 'Blog',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.back_to_projects': 'Back to Projects',
        'nav.back_to_blog': 'Back to Blog',
        'footer.rights': 'Designed & Developed by',
        // ...
    }
};
```

页面加载时，`i18n.js` 会扫描所有 `[data-i18n]` 元素并替换文本。

### Markdown 内容

**当前阶段**：Markdown 文件只支持单一语言。如需双语，可在 `.md` 文件中使用以下约定：

```markdown
<!-- 中文内容 -->
# 我的项目

[lang=zh]这是中文描述[/lang]

[lang=en]This is English description[/lang]
```

`preprocessCustomTags()` 会根据当前语言过滤 `[lang=xx]...[/lang]` 块。

---

## Markdown 扩展语法

### 自定义标签

#### header_image
```
[header_image]路径[/header_image]
```
项目封面图（通常在 `Intro.ini` 中配置，Markdown 中会被忽略）。

#### tag
```
[tag]标签1|标签2|标签3[/tag]
```
项目标签（通常在 `Intro.ini` 中配置，Markdown 中会被忽略）。

#### icon
```
[icon]图标名;颜色[/icon]{**加粗标题**
描述内容（支持 Markdown）}
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| 图标名 | Font Awesome 图标名（不含 `fa-` 前缀） | `star` |
| 颜色 | 图标颜色（十六进制或颜色名） | `#ef4444` |

**图标名示例**：`pencil-square-o`、`code-fork`、`paint-brush`、`globe`、`star`、`cog`、`check`、`rocket`

#### frame
```
[frame]名称\描述|名称\描述|名称\描述[/frame]
```
技术栈/框架展示卡片。使用 `|` 分隔条目，`\` 分隔名称和描述。

### 自定义按钮

#### GitHub 按钮
```
[githublink]查看源码[/githublink](https://github.com/用户名/仓库)
```
深灰底白字按钮，带 GitHub 图标。

#### 爱发电按钮
```
[afdian]支持作者[/afdian](https://ifdian.net/)
```
白底紫边按钮，带爱发电 logo。

#### Android 下载按钮
```
[android]安卓下载[/android](https://example.com/app.apk)
```
绿色按钮，带 Android 机器人图标。

#### Windows 下载按钮
```
[win64]Windows 安装包[/win64](https://example.com/app.exe)
```
蓝色按钮，带 Windows 图标。

### 图片扩展语法

#### 本地图片路径

| 写法 | 示例 | 说明 |
|------|------|------|
| 相对路径 | `![](image/pic.png)` | 相对于当前 Markdown 文件目录 |
| 带前导斜杠 | `![](/image/pic.png)` | 自动去掉 `/`，转为相对路径 |
| project 前缀 | `![](project/项目名/image/pic.png)` | 自动提取相对路径 |
| 在线 URL | `![](https://example.com/pic.png)` | 直接使用 |

#### 图片大小与注释

```
![alt {:<大小>;<注释>}](图片URL)
```

**大小参数**：
- `300px` — 固定像素宽度
- `50%` — 容器百分比宽度
- `none` — 默认大小（最大 100%，保持原始比例）
- 省略 — 默认大小

**注释参数**：
- 任意文本 — 显示在图片下方的灰色斜体注释
- 省略 — 不显示注释

**完整示例**：

```markdown
![界面截图 {:none;这是主界面}](image/main.png)
![功能截图 {:400px;核心功能展示}](image/feature.png)
![小图 {:200px}](image/thumb.png)
![流程图 {:;数据流向图}](image/flow.png)
![大屏截图 {:80%}](image/bigscreen.png)
![启程](image/start.png)
```

---

## 完整示例

```markdown
# 我的项目

[header_image]images/cover.png[/header_image]
[tag]Electron|JavaScript[/tag]

## 下载
[win64]Windows 安装包[/win64](https://example.com/app.exe)
[android]Android 下载[/android](https://example.com/app.apk)

## 查看
[githublink]查看源码[/githublink](https://github.com/user/repo)

## 核心功能
[icon]pencil-square-o;#ef4444[/icon]{**编辑器**
基于 Quill 的富文本编辑器}

## 界面预览
![主界面截图 {:600px;应用主界面}](image/screenshot.png)

## 技术栈
[frame]Electron\桌面框架|JavaScript\渲染引擎|CSS\样式系统[/frame]
```