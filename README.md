# 风禾有章 · 习作集

中高一体部 · 高一（1）班 高一（3）班习作集。  
**迎风生长，落笔成章。**

收录 16 篇以「窗外的那棵树」为起点的随笔，按 **风物 / 心绪 / 生长** 三种风格编入索引。

- **线上地址**：<https://zzz07141.github.io/qinghe-showcase/>
- **源码仓库**：<https://github.com/zzz07141/qinghe-showcase>

## 本地预览

```bash
cd projects/essay-art-showcase
python -m http.server 8123
```

浏览器打开 <http://127.0.0.1:8123/>。这是纯静态站，也可以直接双击 `index.html`。

## 页面结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 卷首：标语、简介、摘句、三篇选读、风格索引、编者的话 |
| `essays.html` | 习作集：16 篇全文、风格筛选、关键词搜索、阅读器 |
| `gallery.html` | 分类索引：风物 / 心绪 / 生长，按风格列篇目 |
| `about.html` | 关于：编选原则、缘起、编辑过程、习作集信息 |
| `assets/js/data.js` | 内容源：站点信息、16 篇习作、风格与作者班级 |
| `assets/img/essays/` | 每篇习作的 ComfyUI 配图 |
| `ILLUSTRATION-PROMPTS.md` | 16 篇配图的提示词、种子与工作流 |
| `assets/css/style.css` | 全站视觉与响应式样式 |
| `assets/js/site.js` | 渲染、筛选、搜索、阅读器、分类索引、移动菜单 |

## 改内容

### 1. 站点名、副题、主题

编辑 `assets/js/data.js` 顶部的 `SITE`：

```js
const SITE = {
  name: "风禾有章",
  mark: "风禾",
  english: "FENGHE ANTHOLOGY",
  tagline: "迎风生长，落笔成章",
  className: "高一（1）班 · 高一（3）班",
  term: "2026 秋",
  teacher: "中高一体部语文组",
  school: "中高一体部",
  intro: "这里收录同学们写下的随笔片段……",
  themeTitle: "窗外的那棵树",
  themeSeal: "窗外",
};
```

`name`、`mark`、`school`、`className`、`term`、`teacher` 会同步到页面上的相关固定文字；`intro` 控制首页简介，`themeTitle` 控制“本期主题”，`themeSeal` 控制引言区的竖排小印。

### 2. 增加或替换习作

在 `ESSAYS` 数组里复制一段：

```js
{
  id: "essay-new",             // 唯一，用于 #essay-new 深链
  type: "essay",
  order: 17,                   // 卷内顺序
  title: "题目",
  author: "作者",
  className: "高一（1）班",    // 或高一（3）班
  category: "风物",             // 风物 / 心绪 / 生长
  tags: ["树", "雨后"],
  featured: false,             // 首页取前 3 篇 featured
  excerpt: "卡片上的一句摘录。",
  quote: "文中的金句，可选；阅读器会自动判断是否与正文重复。",
  body: [
    "第一段。",
    "第二段。",
  ],
},
```

- `category` 决定筛选按钮与分类索引；新增分类会自动出现，但 `STYLE_ORDER` 和 `STYLE_NOTES` 在 `assets/js/site.js` 顶部，若想固定顺序和分类说明可一并修改。
- `image` 指向 `assets/img/essays/` 下的配图；卡片会显示横幅，阅读器会显示 3:2 大图。
- `imageAlt` 是配图的无障碍说明。
- `featured: true` 的篇目按数组顺序取前 3 篇上首页。
- `order` 控制习作集列表顺序。
- `quote` 可选；阅读器会在正文中找一个位置插入，若正文已包含该句则不再重复。
- 不需要手改“16 篇 / 16 位作者”等数字，页面会自动统计。

### 3. 修改分类说明

`assets/js/site.js` 顶部：

```js
const STYLE_ORDER = ["风物", "心绪", "生长"];
const STYLE_NOTES = {
  风物: "目光停在枝叶、光影、雨雾与村庄的晨昏里。",
  心绪: "树影与心事互相照见，风一吹，句子就有了温度。",
  生长: "由树及人，写时间、陪伴，也写少年自己的成长。",
};
```

### 4. 题图与装饰

本版不再使用绘画图片，卷首摘句卡、分类索引和印章都由 HTML/CSS 生成。若以后要加入图片，可在 `assets/` 下新建目录并在页面中引用；若不需要，不要恢复旧的 `assets/art` 引用。

## 发布与更新

当前项目根目录已经关联 GitHub 仓库并启用 GitHub Pages。修改后提交、推送即可自动更新线上版：

```bash
cd projects/essay-art-showcase
git add index.html essays.html gallery.html about.html assets README.md
git commit -m "Update Fenghe anthology"
git push origin main
```

推送后约 1 分钟，刷新 <https://zzz07141.github.io/qinghe-showcase/> 即可。`tools/` 是本机生成和验收脚本，已通过 `.gitignore` 排除，不会发布。

## 交互与细节

- 习作卡整张可点，打开阅读器；支持 `Esc` 关闭、`←` / `→` 切换上下篇。
- 筛选 `风物 / 心绪 / 生长`，搜索标题、作者、班级、标签或摘录。
- 深链示例：`essays.html?style=风物#essay-window-tree` 会先筛到风物，再打开对应篇目。
- 分类索引页按三种风格列出全部篇目，点篇名直接进入阅读。
- 移动端 390px 适配；阅读器、筛选条、移动菜单都已实测。
- 支持 `prefers-reduced-motion` 和打印样式。

## 配图

16 张配图全部由本机 **ComfyUI** 生成（DreamShaper 8 / SD 1.5，768×512，3:2），统一做了轻微降饱和、提对比和暖纸色后期。每篇的英文提示词、种子、通用风格尾缀与负向词见 [ILLUSTRATION-PROMPTS.md](<ILLUSTRATION-PROMPTS.md>)。

重新生成某几篇：

```bash
python tools/make_essay_illustrations.py --only essay-after-rain,essay-village-days --force
```

## 内容说明

篇目来自本次收到的《风禾有章——窗外的那棵树》文档，保留原句原意，仅对分段和明显标点笔误做了整理。原文档多数篇目只有正文、没有单独标题，站内标题是按内容拟的，可以在 `data.js` 里随时改成作者认可的题目。

正式对外发布前，请确认作者署名、班级信息与篇目授权。
