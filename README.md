# 👋 嗨，这是我的小破站

一个完全靠 **txt/ini/md** 文件支撑的静态网站。  
不用数据库、不用后端，直接在文件夹里扔点东西就能更新博客和项目。

**在线蹲人**：[https://firefairyzz.github.io](https://firefairyzz.github.io)

---

## 🤔 为什么搞这个？

就是想有个地方能放自己的东西——  
写写项目复盘、记点技术笔记、偶尔碎碎念两句。  
不追求多厉害，能把做过的事攒下来，以后回头看能笑一笑就挺好。

---

## 🧊 大概长这样

- 全部页面都是毛玻璃风（自己觉得还挺好看的）
- 项目列表和博客列表会**自动读取文件夹里的配置文件**，不用手写 HTML
- 博客和项目详情直接用 Markdown 写，还整了几个好玩的快捷标记
- 背景图每次刷新会换一张，用了一个随机图片 API
- 手机端也能看（虽然偶尔会排歪，但凑合能用）

---

## 📁 目录结构（给自己看的）
.
├── index.html # 首页（啥也没有，就一个欢迎）
├── projects.html # 项目列表
├── blog.html # 博客列表
├── about.html # 关于我
├── images/ # 头像什么的
│
├── Project/ # 项目们
│ ├── Project.txt # 放项目名，一行一个，决定顺序
│ └── World_Editor/ # 比如这个项目
│ ├── index.html # 项目详情模板（复制就行）
│ ├── Intro.ini # 名称、介绍、标签
│ ├── header_image.png
│ └── World_Editor.md # 详细的介绍
│
├── Blog/ # 博客们
│ ├── Blog.txt # 同理，放文章名
│ └── Welcome/ # 欢迎文章
│ ├── index.html # 博客详情模板（也是复制）
│ ├── Intro.ini # 标题、日期、摘要、封面图
│ └── Welcome.md # 正文
│
└── README.md # 就你在看的这个

text

---

## 🚀 怎么用

### 第一步：让它在本地跑起来
因为用了 `fetch` 读文件，**不能直接双击 HTML**，得用服务器打开。

随便选一个：
- VS Code 装 **Live Server** 插件，右键 `index.html`
- 命令行：`npx serve .`
- Python：`python -m http.server 8000`

然后浏览器打开 `http://localhost:3000`（或提示的端口）就行。

### 第二步：添加新项目
1. 在 `Project/` 下新建文件夹，名字就是项目名
2. 把 `Project/World_Editor/index.html` 复制进去（不用改）
3. 创建 `Intro.ini` 和 `xxx.md`，再塞一张封面图（可选）
4. 在 `Project/Project.txt` 最后加一行项目名

### 第三步：写新博客
1. 在 `Blog/` 下建文件夹，名字随意
2. 复制 `Blog/Welcome/index.html` 进去
3. 创建 `Intro.ini` 和 `xxx.md`
4. 在 `Blog/Blog.txt` 加一行

---

## ✍️ 自定义标记（省事小玩意儿）

在 `.md` 里写这些，会自动变成好看的样式：

| 标记 | 会变成啥 |
|------|----------|
| `[githublink]查看源码[/githublink](链接)` | 一个深灰色的 GitHub 按钮 |
| `[afdian]请我喝咖啡[/afdian](链接)` | 紫色爱发电按钮，带官方小图标 |
| `[icon]图标名;颜色[/icon]{内容}` | 左边图标，右边文字（图标用 Font Awesome 4.7） |
| `[frame]技术\描述|技术\描述[/frame]` | 技术栈小方格 |

图标可以写简称，比如 `write`、`branch`、`paintbrush`、`earth`，会自动转成合适的图标。

---

## 🖼️ 背景图

每次刷新会从 `https://uapis.cn/api/v1/random/image` 拉一张随机图。  
如果它挂了，会自动换 `picsum.photos` 顶上来。  
（想换别的 API 直接改代码里的 `loadBackground` 函数）

---

## 📦 扔上 GitHub Pages

1. 把整个文件夹推到一个 GitHub 仓库
2. 在仓库 Settings → Pages → Source 选 `main` 分支，根目录
3. 等几分钟，就能在 `https://你的用户名.github.io` 打开了

---

## 🙇‍♂️ 最后的碎碎念

这个网站是我边学边写的，bug 肯定不少，代码也不优雅。  
如果你正好看到了，觉得还有点意思，欢迎给个 star 或者来唠两句。  
就算没有，我也还是会继续往里面塞东西的 😂

**GitHub**：[firefairyZz](https://github.com/firefairyZz)  
**爱发电**：https://afdian.net/@你的ID （要是真有人投喂我会感动哭）

---

MIT License. 随便改，随便用，能帮到你就太好了。