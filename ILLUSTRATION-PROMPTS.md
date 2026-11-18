# 风禾有章 · 配图提示词与工作流

17 篇习作的配图均由本机 ComfyUI 生成。统一为 3:2 横幅、768 × 512，适合文章卡片与阅读器内嵌。

## 统一工作流

| 项目 | 设置 |
| --- | --- |
| ComfyUI | 0.42.0，本机 `127.0.0.1:8188` |
| 模型 | `dreamshaper_8.safetensors`（SD 1.5） |
| 尺寸 | 768 × 512（3:2），batch 1 |
| 采样 | `dpmpp_2m` + `karras`，28 steps，CFG 7.0，denoise 1.0 |
| 节点 | CheckpointLoaderSimple → CLIPTextEncode ×2 → EmptyLatentImage → KSampler → VAEDecode → SaveImage |
| 后期 | 轻微降饱和、提对比、暖纸色叠加，统一成纸感调性 |

### 通用正向风格尾缀

```text
Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 通用负向提示词

```text
text, letters, Chinese characters, watermark, logo, signature, frame, border, UI, photorealistic, 3d render, CGI, neon, oversaturated, high contrast, anime, cartoon, chibi, people, human faces, hands, deformed, extra limbs, low quality, blurry, cluttered
```

> 说明：DreamShaper 8 对“插画/水彩”提示仍会保留一定写实质感；负向主要用于压掉文字、边框、人物畸变与过曝。最终统一靠构图、冷绿/暖褐调色和纸感后期。

## 逐篇提示词

### 01. 窗外的那棵树（生长）

- 文件：`assets/img/essays/essay-window-tree.jpg`
- 种子：`4101`

场景提示词：

```text
a tall old tree outside a classroom window, wind stripping the leaves, bare dark branches, scattered leaves on the windowsill, an empty wooden desk with a blank sheet of paper in the foreground, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 02. 雨后的窗外（心绪）

- 文件：`assets/img/essays/essay-after-rain.jpg`
- 种子：`4202`

场景提示词：

```text
close-up of rain-covered green leaves after a storm, sunlight breaking through, sparkling droplets, one fallen pale leaf on wet stone, fresh cool atmosphere, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 03. 晴日的鸟巢（心绪）

- 文件：`assets/img/essays/essay-bird-nest.jpg`
- 种子：`4303`

场景提示词：

```text
two small brown birds perched on a leafy branch, one bird holding a thin twig in its beak, dappled spring sunlight, soft green leaves, no people, no basket, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

附加负向：

```text
woman, girl, man, boy, human figure, person, portrait, basket, hands, face
```

### 04. 夏日枝桠（风物）

- 文件：`assets/img/essays/essay-summer-branches.jpg`
- 种子：`4204`

场景提示词：

```text
dense summer tree canopy filling the frame, a cicada clinging to rough bark, strong sunlight filtering through deep green leaves, lively summer, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 05. 风中的银杏（心绪）

- 文件：`assets/img/essays/essay-ginkgo-wind.jpg`
- 种子：`4205`

场景提示词：

```text
golden ginkgo leaves swirling in cold wind, bare dark branches, pale grey sky, drifting leaves, lonely muted atmosphere, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 06. 窗外的战士（风物）

- 文件：`assets/img/essays/essay-window-soldiers.jpg`
- 种子：`4206`

场景提示词：

```text
a row of tall trees standing along a quiet schoolyard, strong vertical trunks, sunlight on fresh leaves, birds and cicadas, a living symphony of green and gold, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 07. 一片枯叶的夏天（生长）

- 文件：`assets/img/essays/essay-dry-leaf.jpg`
- 种子：`4107`

场景提示词：

```text
a single dry golden leaf with delicate veins resting on an open notebook by a window, blurred old tree in the background, late summer turning to autumn, warm ochre light, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 08. 它陪我们走过四季（生长）

- 文件：`assets/img/essays/essay-four-seasons.jpg`
- 种子：`4108`

场景提示词：

```text
one tall tree beside a school window across the seasons, spring buds and summer green on one side, golden autumn leaves and a few snow-touched twigs on the other, gentle transition, morning light, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 09. 小树，大树（心绪）

- 文件：`assets/img/essays/essay-small-tree.jpg`
- 种子：`4109`

场景提示词：

```text
a tiny sapling in the foreground and a large leafy tree behind it, strong contrast of scale, shade on a quiet schoolyard, soft afternoon light, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 10. 翠色与树影（风物）

- 文件：`assets/img/essays/essay-green-shadows.jpg`
- 种子：`4210`

场景提示词：

```text
layered translucent green leaves close up, sunlight passing through, dappled shadows falling on a pale wall and ground, quiet abstract nature study, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 11. 披着金光的外衣（心绪）

- 文件：`assets/img/essays/essay-golden-coat.jpg`
- 种子：`4111`

场景提示词：

```text
a tree bathed in golden late afternoon sunlight, leaves glowing like small wind chimes, soft warm halo, gentle breeze, serene, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 12. 树在唱歌（风物）

- 文件：`assets/img/essays/essay-tree-singing.jpg`
- 种子：`4312`

场景提示词：

```text
a lush green tree canopy swaying in strong wind after rain, wet leaves and sparkling droplets, dynamic sweeping branches, fresh grey-green light, sense of sound and motion, no water, no river, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

附加负向：

```text
river, lake, water, snow, winter, still, calm
```

### 13. 雾散之后（风物）

- 文件：`assets/img/essays/essay-after-mist.jpg`
- 种子：`4113`

场景提示词：

```text
a misty morning outside a window, dew on leaves, sunlight breaking through the fog, soft light spots on the floor, wet branches and distant birds, ethereal, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 14. 花间（风物）

- 文件：`assets/img/essays/essay-among-flowers.jpg`
- 种子：`4214`

场景提示词：

```text
small wildflowers blooming beneath a tree, butterflies and bees moving between petals, sunbeams through leaves, petals on grass, joyful quiet, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 15. 桂花树（心绪）

- 文件：`assets/img/essays/essay-osmanthus.jpg`
- 种子：`4315`

场景提示词：

```text
close-up of an osmanthus branch covered in tiny golden blossoms, glossy dark green leaves, warm afternoon sunlight, soft golden light, plain soft background, no text, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

附加负向：

```text
Chinese calligraphy, calligraphy, writing, characters, letters, text, ink lettering, paper scroll
```

### 16. 村野晨昏（风物）

- 文件：`assets/img/essays/essay-village-days.jpg`
- 种子：`4116`

场景提示词：

```text
a rural village among fields at dawn or dusk, white walls and tiled roofs, cooking smoke rising, winding field paths, distant trees in blue-green haze, wide tranquil panorama, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

### 17. 窗外的那棵树（心绪）

- 文件：`assets/img/essays/essay-chen-window-tree.jpg`
- 种子：`4402`

场景提示词：

```text
a tall osmanthus tree covered in tiny golden blossoms just outside a classroom window, branches close to the glass, several tiny flowers drifting onto the wooden windowsill, warm autumn afternoon light, gentle breeze, quiet nostalgic atmosphere, a sense of home, no people, no text, no vase, Chinese literary editorial illustration, muted ink wash and soft gouache, sage green, umber, warm paper beige, gentle natural light, quiet poetic atmosphere, painterly paper grain, delicate, no text, 3:2
```

附加负向：

```text
Chinese calligraphy, calligraphy, writing, characters, letters, text, ink lettering, paper scroll, person, woman, hands, face, vase, pot, bouquet, flower arrangement, still life
```

## 复现方式

```bash
cd projects/essay-art-showcase
python tools/make_essay_illustrations.py
# 只重跑某几篇：
python tools/make_essay_illustrations.py --only essay-after-rain,essay-village-days --force
```

任务清单在 `tools/essay_illustration_tasks.json`。脚本会先把所有待生成图片一次性排队，再逐张下载，避免被其他 ComfyUI 任务插队。生成源图保存在 `.tmp/fenghe_src/`，最终图在 `assets/img/essays/`。
