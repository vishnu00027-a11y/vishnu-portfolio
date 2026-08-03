# clone-website

A Claude Code skill that clones any live website 1:1 (layout, typography, assets, scroll animations, stateful interactions) from nothing but its URL, and proves the fidelity with a scored benchmark instead of claiming it.

The method in one sentence: treat the live site as ground truth you can query, not a picture you eyeball. Pull the real DOM, real CSS tokens, real keyframes, real fonts, and real config data out of the running page, rebuild from those facts, then run the same measurement probe on original and clone and diff the numbers until they converge.

Battle-tested on arc.net, town.com, wisprflow.ai, landonorris.com, creativemarketing.peachweb.io.

## Install

```bash
git clone https://github.com/braxtonROSE4/clone-any-website.git ~/.claude/skills/clone-website
```

The skill loads on its own when you ask for a clone. Trigger phrases include "clone this website", "rebuild this landing page pixel-perfect", "how does this site do that scroll effect", "复刻这个落地页".

## Runtime dependency

Every live-page operation runs as `ego-browser nodejs <<'EOF' ... EOF`, using the ego lite browser's preloaded `page`, `browser`, and `taskSpaces` facades. ego lite is at https://lite.ego.app/ (macOS); `scripts/install-ego-browser.sh` downloads and installs it, then you finish first-run onboarding in the app, which registers the `ego-browser` CLI.

The runtime is not swappable for Playwright or a plain headless Chrome, and the skill is written to refuse the substitution. Three reasons: the pixel-level loop needs the identical probe in the identical runtime on both sides or the diff numbers mean nothing; the correction loop needs task spaces, so the agent probes in its own isolated space while you browse the original and the clone in yours without either side stealing the browser; and every probe script and environment caveat in this skill is calibrated against this runtime's measured behavior.

## What the workflow does

| 阶段 | 做什么 |
|------|--------|
| Phase 0, setup | 建 `reference/{dom,css,js,screenshots}/` 收侦察产物，后台起固定端口 dev server；探测克隆前先断言 `document.title` 对得上，curl 通不等于浏览器 tab 显示的是你的页面 |
| Phase 1, static capture | 一次调用抓完 DOM、section 轮廓、CSS/字体/JS 资源清单、scroll-0 全页截图；design token 从 CSS 里 grep，不从截图估；`@font-face` 常由 JS 运行时注入，只能在活页面上用 `document.fonts` + styleSheets 走查取；产品 UI 的假数据去编译后的 JS chunk 里找 config 对象 |
| Phase 2, motion reverse | 从最便宜的手段开始：先 grep CSS 找 `animation-timeline`，再 `getAnimations({subtree:true})` 拿关键帧和 timeline 类型，再 MutationObserver + 真实滚轮滚动，最后对 sticky 状态机做多深度双向采样 |
| Phase 3, rebuild | 按站点类型选路线。Webflow/Framer 这类静态导出站用 raw-HTML 镜像（curl 水合前的服务端 HTML 当骨架），Next.js/Remix 这类框架站按 section 拆组件重建 |
| Phase 4, verify + benchmark | 探针迭代到收敛后跑打分 eval，八个维度对固定阈值，总分低于 90 或任一维度不及格就不算完成 |
| Phase 5, whole-site | 爬 nav/footer + sitemap 拿页面清单，公共骨架只侦察一次，逐页复刻逐页打分 |
| Phase 6, publishing | `reference/` 全部排除出仓库，README 写归属声明；公开推送前必须警告商用字体和图片视频的再分发风险 |

## The benchmark

```bash
bash scripts/run_eval.sh https://original.example http://localhost:3400 ./eval-out
```

同一个探针跑原站和克隆站，产出 `scorecard.json` + `report.md`，八个维度打分：几何、排版、颜色、资源、字体、动画、mock 内容、视觉相似度。退出码 0 代表通过。需要 `ego-browser` 在 PATH 上、克隆站 dev server 在跑、Pillow 已装（缺了就跳过视觉维度并重新归一总分）。

两条测量纪律写死在协议里：原站每天都在漂，跑分只对当天探到的那份 `original.json` 有意义，回归掉分先查原站动没动；无限循环动画（GSAP `repeat:-1`、marquee、轮播 auto-scroll）采样前必须相位归一化，否则两侧停在随机循环相位上，探针抖动会被报成 50-2879px 的位置误差。

## Repo layout

| 路径 | 内容 |
|------|------|
| `SKILL.md` | 主工作流：执行模型纪律、六个阶段、可证伪的 Correctness rules、探针环境 Caveats 表 |
| `references/probes.md` | 每个阶段的 ego-browser 探针脚本，直接复制粘贴改 URL 就能跑 |
| `references/eval.md` | 打分协议：八个维度的算法、阈值、测量条件 |
| `references/install.md` | ego lite 安装引导 |
| `references/tool-design-template.md` | 往 `tools/` 里加新工具时的设计模板 |
| `tools/` | 类型化工具层，`manifest.json` 注册 capture_static / inventory_animations / sample_scroll_states / eval_probe |
| `scripts/` | `run_eval.sh` 跑分入口、`eval_score.py` 打分器、`slice.py` 按 DOM rect 切全页截图、`install-ego-browser.sh` |
| `learnings/<site>/` | 具体站点的复刻笔记（选择器、坑、config 对象位置），下次复刻同一个站直接热启动 |

## 用之前先想清楚的事

复刻出来的东西里，设计、文案、图片、字体的权利都还在原站作者手上。这个 skill 的用途是学习实现方式、做技术研究、复现自己已有权利的页面。公开发布克隆站之前：`reference/` 里抓下来的 DOM/CSS/JS 一律不要进仓库，README 写清楚归属，商用字体文件和原站图片视频要么换开源近似字体、要么 gitignore 掉。字体是最现实的 DMCA 风险点，"非商用" 在仓库或帖子给产品导流时不构成保护。
