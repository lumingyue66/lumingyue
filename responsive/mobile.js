(function () {
  'use strict';
  var root = document.documentElement;
  var embedded = window.parent !== window;
  var intro = document.getElementById('1:9648');
  var standalone = document.getElementById('4402:339');
  if (intro) { intro.setAttribute('data-mobile-canvas', ''); intro.setAttribute('data-mobile-intro', ''); }
  if (standalone && !document.querySelector('.screen')) standalone.setAttribute('data-mobile-canvas', '');
  function fit() {
    root.style.setProperty('--canvas-fit', String(Math.min(1, root.clientWidth / 1440)));
    // At phone widths the introduction's children flow independently.
    if (intro) intro.style.setProperty('zoom', root.clientWidth <= 767 ? '1' : '');
    reportHeight();
  }
  function reportHeight() {
    if (!embedded || !intro) return;
    window.parent.postMessage({type:'portfolio:height',height:Math.ceil(intro.getBoundingClientRect().height)},location.origin === 'null' ? '*' : location.origin);
  }
  var frame = document.querySelector('.panel[data-panel="about"] iframe');
  if (frame) window.addEventListener('message', function(e) {
    if (e.source !== frame.contentWindow || e.origin !== location.origin || !e.data || e.data.type !== 'portfolio:height') return;
    var height = Number(e.data.height);
    if (!Number.isFinite(height) || height < 100 || height > 100000) return;
    frame.dataset.contentHeight = String(height);
    if (root.clientWidth < 1440) frame.style.height = height + 'px';
  });
  window.addEventListener('resize', function() {
    fit();
    if (frame) frame.style.height = root.clientWidth < 1440 && frame.dataset.contentHeight ? frame.dataset.contentHeight+'px' : '100vh';
  }, {passive:true});
  if (intro && window.ResizeObserver) new ResizeObserver(reportHeight).observe(intro);
  window.addEventListener('load', reportHeight);
  fit();

  // Detail viewer keeps screenshots legible while the page stays fitted.
  var dialog, returnFocus, previousOverflow;
  function closeViewer() {
    dialog.close();document.body.style.overflow=previousOverflow;
    if(returnFocus && returnFocus.focus) returnFocus.focus();
  }
  function showImage(image) {
    if (!dialog) {
      dialog=document.createElement('dialog');dialog.className='mobile-image-dialog';dialog.setAttribute('aria-label','截图详情');
      dialog.innerHTML='<div class="image-toolbar"><span>截图详情</span><button type="button" data-detail>原尺寸</button><button type="button" data-close>关闭</button></div><div class="image-scroll"><img alt=""></div>';
      document.body.appendChild(dialog);
      dialog.querySelector('[data-close]').addEventListener('click',closeViewer);
      function toggle(){var on=dialog.classList.toggle('is-detail');dialog.querySelector('[data-detail]').textContent=on?'适应屏宽':'原尺寸';}
      dialog.querySelector('[data-detail]').addEventListener('click',toggle);
      dialog.querySelector('img').addEventListener('click',toggle);
      dialog.addEventListener('cancel',function(e){e.preventDefault();closeViewer();});
    }
    returnFocus=document.activeElement;previousOverflow=document.body.style.overflow;
    var copy=dialog.querySelector('img');copy.src=image.currentSrc||image.src;copy.alt=image.alt||'作品截图';
    dialog.classList.remove('is-detail');dialog.querySelector('[data-detail]').textContent='原尺寸';
    document.body.style.overflow='hidden';dialog.showModal();dialog.querySelector('[data-close]').focus();
  }
  document.addEventListener('click', function(e) {
    if (root.clientWidth >= 1440 || !window.HTMLDialogElement) return;
    var image=e.target.closest('img');
    if (!image || image.closest('.mobile-image-dialog, a, button, .cm-overlay, [role="button"], .card-bjh, .card-dxx, .card-dujia, .card-mcn')) return;
    if (image.naturalWidth < 240 || image.naturalHeight < 160) return;
    showImage(image);
  });
})();
