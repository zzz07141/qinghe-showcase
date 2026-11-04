# 青禾集 · 班级作品展

一个给老师用的静态作品展示网站：左边读作文，右边看画。没有框架、没有构建步骤，改一个数据文件就能换成自己班级的内容。

当前示例内容为「青禾小学 · 六年级（3）班 · 2026 秋季展」，共 7 篇作文、8 幅绘画，8 位小作者。

## 本地预览

在项目目录打开终端：

```bash
cd projects/essay-art-showcase
python -m http.server 8123 --bind 0.0.0.0
```

浏览器访问 <http://127.0.0.1:8123/>。

`--bind 0.0.0.0` 表示同一局域网的其他电脑也能访问。对方电脑要用这台电脑的局域网 IPv4 地址，例如 `http://192.168.1.23:8123/`，不能用 `127.0.0.1`（那是对方电脑自己）。

查看本机局域网地址：

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' }
```

如果同网段仍打不开，检查 Windows 防火墙是否放行 Python / TCP 8123；校园网若做了终端隔离，需要改用公网静态托管。

也可以直接双击 `index.html` 打开；不过用本地服务器预览，路径和字体表现会更接近正式发布。

## 页面结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页：展览引言、本期主题、精选作文、精选画作、老师的话 |
| `essays.html` | 作文馆：分类筛选、关键词搜索、全文阅读器 |
| `gallery.html` | 画笔画廊：材料筛选、作品灯箱、上一幅/下一幅 |
| `about.html` | 关于展览：展览主张、缘起、做法、老师与说明 |
| `assets/js/data.js` | **唯一内容源**：学校信息、作文、绘画 |
| `assets/art/` | 绘画作品图片 |
| `assets/css/style.css` | 全站视觉与响应式样式 |
| `assets/js/site.js` | 渲染、筛选、搜索、阅读器、灯箱、动效 |
| `tools/make_art.py` | 生成示例绘画（可选，替换真实作品后不再需要） |
| `tools/shoot.js` | 本地截图验收脚本（可选） |

## 改成自己班级的内容

### 1. 学校、班级、老师、展期

打开 `assets/js/data.js`，只改最上面的 `SITE`：

```js
const SITE = {
  name: "青禾集",              // 展览名，会出现在页头、页脚、浏览器标题
  mark: "青禾",                // 印章上的两个字
  english: "QINGHE COLLECTION",// 页头英文小字
  className: "六年级（3）班",
  term: "2026 秋季",           // 关于页、页脚用
  termShort: "2026 秋",        // 页头右上角用，短一点
  teacher: "林老师",
  school: "青禾小学",
  email: "hello@qinghe.class",
  intro: "这里收藏着孩子们的句子和颜色……",
  themeTitle: "生长",          // 本期主题
};
```

保存后刷新页面即可。`name`、`mark`、`school`、`className`、`term`、`termShort`、`teacher`、`email` 会自动同步到四个页面的相关文字，不需要逐页改 HTML。

### 2. 增加或替换作文

在 `ESSAYS` 数组里复制一段，改字段：

```js
{
  id: "essay-new",             // 唯一，不要和别的重复；会用于 #essay-new 深链
  type: "essay",
  title: "题目",
  author: "作者",
  age: "11岁",
  category: "记事",            // 会生成筛选按钮，建议保持 4–6 类
  tags: ["亲情", "四季"],       // 卡片右下角的小标签
  date: "2026-10-20",          // 用于排序，新的在前
  featured: true,              // 是否上首页（首页取前 3 篇）
  readTime: 4,                 // 可选，不填会按正文长度估算
  excerpt: "卡片上的一句话。",
  quote: "文中的金句，可选。",
  comment: "老师批注，可选。",
  body: [
    "第一段。",
    "第二段。",
  ],
},
```

- 首页只显示 `featured: true` 的前 3 篇，所以建议把最想推荐的 3 篇设为 `true`。
- 正文每一段一个字符串，阅读器会自动排版；引用会插在第 3 段之后（有 `quote` 时）。
- `category` 决定筛选按钮，新增分类会自动出现，不需要改 JS。
- 搜索会匹配标题、作者、正文、标签。

### 3. 增加或替换绘画

把图片放进 `assets/art/`，然后在 `ARTWORKS` 数组里复制一段：

```js
{
  id: "art-new",               // 唯一
  type: "art",
  title: "作品名",
  author: "作者",
  age: "11岁",
  category: "水彩",            // 会生成材料筛选按钮
  medium: "水彩 · 彩铅",       // 卡片和灯箱里的材料说明
  size: "38 × 52 cm",
  year: "2026",
  date: "2026-10-20",
  featured: true,              // 是否上首页（首页取前 4 幅）
  orientation: "portrait",     // portrait 竖幅 / landscape 横幅
  src: "assets/art/new.jpg",   // 相对路径，注意大小写
  excerpt: "卡片上的一句短说明。",
  description: "灯箱里的作品介绍。",
  comment: "老师批注，可选。",
},
```

- 图片建议长边 1200–1600px、单张 500KB 以内；JPG / PNG / WebP / SVG 都可以。
- 不要求统一比例，画廊会自动按图片高度排布。
- `src` 路径相对于项目根目录，不要写 `D:\...` 这类本机绝对路径。
- 首页只显示 `featured: true` 的前 4 幅。

### 4. 作品数量

页面上的「15 件作品 · 8 位小作者」「共 07 篇」「共 08 幅」等数字由脚本按数组自动计算，**不需要手改**。新增或删除作品后刷新即可。

## 发布

这是纯静态网站，不需要 Node、数据库或后端。把整个 `essay-art-showcase` 文件夹上传到任意静态托管即可：

- GitHub Pages
- Netlify / Vercel 的静态站点
- 学校自己的 Web 服务器 / 对象存储
- 内网共享目录（配合一个静态文件服务）

保持 `index.html` 在站点根目录，`assets/` 的相对位置不变即可。页面内所有链接和图片都使用相对路径，部署在子目录也能正常工作。

## 交互与细节

- 作文卡、画作卡整张可点；阅读器和灯箱支持 `Esc` 关闭。
- 阅读器支持 `←` / `→` 切换上一篇、下一篇；灯箱同样支持左右方向键。
- 深链：`essays.html#essay-yard` 直接打开某篇作文，`gallery.html#art-spring` 直接打开某幅画。
- 移动端菜单、筛选条、搜索框、阅读器都做了 390px 适配。
- 支持 `prefers-reduced-motion`；打印页面时会隐藏交互控件。
- 图片使用 `loading="lazy"`，首屏只预加载前两张。

## 常见问题

**改了 `SITE` 但页面没变？**  
先强制刷新（`Ctrl/Cmd + Shift + R`）。如果改的是 `SITE` 没有覆盖的句子，需要直接改对应 HTML。

**新增作品不显示？**  
检查 `id` 是否重复、`src` 路径大小写是否正确、`featured` 是否为 `true`（首页）、当前筛选是否把它排除了。

**绘画图片空白？**  
优先换 JPG/PNG 测试；如果是 SVG，确认文件能被浏览器直接打开。示例 SVG 由脚本生成，已做 XML 校验。

**想换配色或字体？**  
`assets/css/style.css` 顶部的 `:root` 里有 `--paper`、`--ink`、`--terra`、`--gold` 和字体栈，改这几个变量就能整体换气质。

**示例内容可以直接发布吗？**  
示例作文和绘画都是虚构的，发布前请替换为班级真实作品，并确认作者署名方式。
