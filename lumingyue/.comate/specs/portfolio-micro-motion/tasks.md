# 作品集页面微动效增强任务计划（portfolio-micro-motion）

- [x] Task 1: 追加微动效 CSS 样式
    - 1.1: 在 `<head>` 内既有 `<style>`（第14–22行区域）末尾追加动效样式块
    - 1.2: 定义 `[data-reveal]` 初始态与 `.is-revealed` 显现态（opacity + translateY，终态 transform:none）
    - 1.3: 定义 `data-reveal-delay` 错峰延迟、`[data-reveal="hero"]` 大幅上浮
    - 1.4: 定义 `[data-hover-lift]` hover 上浮、`.pf-card` 过渡缓动（同选择器补充 transition，不覆盖原属性）
    - 1.5: 添加 `prefers-reduced-motion` 降级规则

- [x] Task 2: 给顶层区块追加 `data-reveal` 入场钩子
    - 2.1: Hero(`1:9650`) 加 `data-reveal="hero"`
    - 2.2: 依次给 `1:9657`/`1:9723`/`1:9777`/`1:9849` 加 `data-reveal`
    - 2.3: 依次给三个 Case `1:9881`/`1:10064`/`1:10166` 加 `data-reveal`
    - 2.4: 依次给 `1:10319`/`1:10385`/`1:10472`/`1:10514`/`1:10535` 加 `data-reveal`
    - 2.5: 仅追加属性，保持原有 class/id/坐标不变

- [x] Task 3: 新增微动效 JS 脚本
    - 3.1: 在现有 coverflow IIFE 之后、`</body>` 之前新增独立 `<script>` IIFE
    - 3.2: 实现 IntersectionObserver 滚动入场（进入视口加 `.is-revealed` 后解绑，仅播一次）
    - 3.3: 实现 `prefers-reduced-motion` 与不支持 IO 的降级（直接显示终态）
    - 3.4: 实现背景水印 `1:9649` 的 scroll 视差（rAF 节流，幅度≤40px，不改 opacity）

- [x] Task 4: 局部增强（数字统计 count-up + 卡片 hover）
    - 4.1: 给 About 区数字统计块加 `data-countup`，JS 实现进入视口后数字滚动、解析失败则保留原文本
    - 4.2: 给资料卡片组与 coverflow 卡片加 `data-hover-lift`
    - 4.3: 确认 hover 与 coverflow 每帧 transform 不冲突

- [x] Task 5: 验证与降级测试
    - 5.1: 浏览器打开检查各区块入场、hover、count-up、视差表现
    - 5.2: 开启「减少动态效果」偏好，确认页面与原设计稿完全一致
    - 5.3: 确认未改动任何配色/圆角/透明度/坐标等设计取值
