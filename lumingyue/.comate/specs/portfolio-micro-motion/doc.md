# 作品集页面微动效增强设计文档（portfolio-micro-motion）

## 1. 需求场景与目标

给 `个人作品集-LuMingYue/index.html` 增加一层「微动效（micro-interaction / micro-motion）」，让静态设计稿在浏览时更有高级感、更有呼吸感，但**不改变任何设计稿的静态视觉结果**。

核心原则（对齐记忆约束「严格对齐设计稿、不自行发挥」）：

- 动效必须是**纯附加**：动画的终态 = 设计稿原本的样子（位置、配色、圆角、透明度不变）。
- **不修改**任何 `top-[N px]`、`left`、颜色值、`rounded-[N]`、`opacity-[N]` 等设计取值。
- 只新增：滚动入场动画、极克制的 hover 反馈、数字滚动、装饰性视差、以及已有 coverflow 的过渡平滑化。
- 全程支持 `prefers-reduced-motion`，用户系统开启「减少动态效果」时自动降级为无动画（直接呈现设计稿终态）。

## 2. 技术方案与架构

保持零第三方库（页面当前仅用本地 Tailwind + 少量原生 JS），继续用**原生 CSS + 原生 JS（IntersectionObserver + requestAnimationFrame）**实现，避免引入 GSAP/AOS 等依赖。

实现分三块：

1. **CSS 层**：在 `<head>` 内既有 `<style>` 中追加动效相关的 class（初始态 / 显现态 / 关键帧 / hover 过渡），全部用新增 class，不覆盖 Tailwind 生成的原有样式。
2. **标记层**：给需要入场动画的顶层区块和局部元素加一个 `data-reveal` 属性（或新增 class），作为动画钩子。**不删改原有 class 与 id**。
3. **JS 层**：在文件末尾（现有 coverflow IIFE 之后、`</body>` 之前）新增一个独立 IIFE，负责：
   - IntersectionObserver 监听带 `data-reveal` 的元素，进入视口时加 `.is-revealed`；
   - 数字统计的 count-up；
   - 背景巨型水印 `LUMINGYUE` 的轻微视差；
   - 现有 coverflow 卡片增加 CSS transition 让 transform 过渡更顺滑。

## 3. 涉及文件

| 文件 | 修改类型 | 说明 |
|---|---|---|
| `/Users/a66/Documents/产品机会挖掘Agent系统/设计规范生成/个人作品集-LuMingYue/index.html` | 修改（追加为主） | 唯一改动文件。① `<head>` 内 `<style>`（第14–22行区域）追加动效样式；② 给若干顶层区块 `<div>` 追加 `data-reveal` 钩子属性；③ 末尾 `</body>` 前新增一个 `<script>` IIFE。 |

**不新增任何文件**，不引入外部资源。

## 4. 实现细节

### 4.1 CSS 追加（`<head>` 内 `<style>`）

```css
/* ===== 微动效样式（新增，纯附加，终态=设计稿原样）===== */

/* 入场：默认略下移+透明，进入视口后归位。transform 终态为 none，不影响绝对定位坐标 */
[data-reveal]{
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .7s cubic-bezier(.22,.61,.36,1),
              transform .7s cubic-bezier(.22,.61,.36,1);
  will-change: opacity, transform;
}
[data-reveal].is-revealed{
  opacity: 1;
  transform: none;
}
/* 子元素错峰延迟（stagger）：给同一区块内元素加 data-reveal-delay */
[data-reveal][data-reveal-delay="1"]{ transition-delay:.08s; }
[data-reveal][data-reveal-delay="2"]{ transition-delay:.16s; }
[data-reveal][data-reveal-delay="3"]{ transition-delay:.24s; }
[data-reveal][data-reveal-delay="4"]{ transition-delay:.32s; }

/* Hero 大标题：柔和上浮显现（幅度略大） */
[data-reveal="hero"]{ transform: translateY(40px); }

/* 卡片 hover 微反馈：仅在有 data-hover-lift 的元素上，轻微上浮，transform 复位=原样 */
[data-hover-lift]{
  transition: transform .35s cubic-bezier(.22,.61,.36,1);
  will-change: transform;
}
[data-hover-lift]:hover{ transform: translateY(-6px); }

/* coverflow 卡片过渡平滑（原脚本每帧写 transform，这里补一层过渡缓动） */
.pf-card{ transition: transform .18s ease-out, opacity .18s ease-out; }

/* 尊重系统「减少动态效果」：全部降级为无动画、直接显示终态 */
@media (prefers-reduced-motion: reduce){
  [data-reveal]{ opacity:1 !important; transform:none !important; transition:none !important; }
  [data-hover-lift]{ transition:none !important; }
  .pf-card{ transition:none !important; }
}
```

> 说明：`.pf-card` 已在原 style 定义过 `scroll-snap-align / will-change`，此处**新增一条 transition 声明**（同选择器补充属性，不覆盖原有属性），不改动原始规则。

### 4.2 标记钩子（给顶层区块加 `data-reveal`）

给以下顶层区块根节点追加 `data-reveal`（在既有 `class="..."` 之外追加属性，class/id 完全不动）：

| 区块 | id | 钩子 |
|---|---|---|
| Hero | `1:9650` | `data-reveal="hero"` |
| About + 导航/统计 | `1:9657` | `data-reveal` |
| MY EVOLUTION 卡片 | `1:9723` | `data-reveal` |
| WHAT I DO | `1:9777` | `data-reveal` |
| 项目引言 | `1:9849` | `data-reveal` |
| Case 01 | `1:9881` | `data-reveal` |
| Case 02 | `1:10064` | `data-reveal` |
| Case 03 | `1:10166` | `data-reveal` |
| 资料/名片卡片组 | `1:10319` | `data-reveal` |
| Product Foundation | `1:10385` | `data-reveal` |
| What I Left Behind | `1:10472` | `data-reveal` |
| What I Believe | `1:10514` | `data-reveal` |
| After All / 页脚 | `1:10535` | `data-reveal` |

（背景水印 `1:9649` 不做入场，改为视差；Hero 内部标题行可按需加 `data-reveal-delay` 做错峰。）

可选局部增强（在确认后决定是否加）：
- 资料卡片组、coverflow 卡片加 `data-hover-lift`（鼠标悬停轻微上浮）。
- About 区数字统计块（第211行起）加 `data-countup` 做数字滚动。

### 4.3 JS 追加（`</body>` 前新增 `<script>`）

```html
<script>
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) 滚动入场
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduce) {
    reveals.forEach(function(el){ el.classList.add('is-revealed'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('is-revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('is-revealed'); });
  }

  // 2) 数字 count-up（对 [data-countup] 元素，读取其文本中的数字目标）
  //    仅动画数字部分，保留原有前后缀文本；进入视口后触发一次。

  // 3) 背景水印视差（对 #1:9649，随 scroll 轻微位移，幅度 <= 40px，不改 opacity）

})();
</script>
```

## 5. 边界与异常处理

- **不支持 IntersectionObserver 的旧浏览器**：降级为直接显示（全部加 `.is-revealed`），无动画但内容完整。
- **`prefers-reduced-motion: reduce`**：CSS + JS 双重降级，直接呈现设计稿终态。
- **绝对定位安全性**：入场只用 `opacity` + `transform: translateY`，终态 `transform:none`，不触碰 `top/left`，不改变最终排版坐标；`overflow-hidden` 的 `<main>` 下 translateY(28px) 起始位不会造成横向溢出。
- **与现有 coverflow 脚本隔离**：新脚本为独立 IIFE，不引用/覆盖原脚本变量；`.pf-card` 仅追加 transition，不改原 JS 每帧写入的 transform 值。
- **count-up 异常**：若元素文本无法解析出数字则跳过，保留原文本。

## 6. 数据流

滚动/加载 → IntersectionObserver 检测区块进入视口 → 添加 `.is-revealed` → CSS transition 驱动 opacity/transform 归位 → 动画结束停在设计稿终态（observer 解绑，仅播一次）。
数字统计：区块进入视口 → rAF 逐帧插值 → 到目标值停止。
水印视差：scroll 事件（rAF 节流）→ 更新 translateY。

## 7. 预期结果

- 页面向下滚动时，各区块柔和淡入上浮，Hero 有轻微错峰入场，整体更有层次与高级感。
- 卡片 hover（如启用）有克制的上浮反馈。
- coverflow 横滑更顺滑。
- 关闭动态效果偏好或旧浏览器下，页面与当前设计稿**完全一致**，无任何视觉差异。
- 除动画过程外，任何静态截图都与原设计稿逐像素一致（不改配色/圆角/透明度/坐标）。
