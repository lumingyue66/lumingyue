(function () {
  'use strict';
  var root = document.documentElement;
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var frame = document.querySelector('.panel[data-panel="about"] iframe');
  var canvas = document.getElementById('1:9648');
  var embedded = window.parent !== window;
  if (embedded) {
    try { root.classList.toggle('portfolio-embedded', window.parent.document.documentElement.clientWidth < 1440); } catch (_) {}
    window.addEventListener('message',function(e) {
      if (e.source === window.parent && e.origin === location.origin && e.data && e.data.type === 'portfolio:scaled') root.classList.toggle('portfolio-embedded',!!e.data.scaled);
    });
  }
  var stages = [];
  var scheduled = false;
  // One transform per complete panel. Never move individual text or image blocks.
  panels.forEach(function(panel) {
    if (panel.dataset.panel === 'contact') return;
    var stage = document.createElement('div');
    stage.className = 'portfolio-scale-stage';
    while (panel.firstChild) stage.appendChild(panel.firstChild);
    panel.appendChild(stage);
    stages.push({panel:panel,stage:stage});
  });
  function measure() {
    scheduled = false;
    var mobile = root.clientWidth < 1440;
    var ratio = Math.min(1,root.clientWidth / 1440);
    root.style.setProperty('--canvas-fit',String(ratio));
    if (frame) {
      frame.contentWindow.postMessage({type:'portfolio:scaled',scaled:mobile},location.origin==='null'?'*':location.origin);
      frame.style.width = mobile ? '1440px' : '100%';
      frame.style.height = mobile ? (frame.dataset.contentHeight || '14915')+'px' : '100vh';
      frame.setAttribute('scrolling',mobile ? 'no' : 'auto');
    }
    stages.forEach(function(item) {
      if (!mobile) {
        item.stage.style.cssText='';item.panel.style.height='';return;
      }
      item.stage.style.width='1440px';
      item.stage.style.transform='scale('+ratio+')';
      if (!item.panel.classList.contains('is-on')) return;
      var height=Math.max(item.stage.offsetHeight,item.stage.scrollHeight);
      item.panel.style.height=Math.ceil(height*ratio)+'px';
    });
    if (embedded && canvas) {
      var h=Math.ceil(Math.max(canvas.offsetHeight,canvas.scrollHeight));
      window.parent.postMessage({type:'portfolio:height',height:h},location.origin==='null'?'*':location.origin);
    }
  }
  function schedule() {if (!scheduled) {scheduled=true;requestAnimationFrame(measure);}}
  if (frame) {
    window.addEventListener('message',function(e) {
      if(e.source!==frame.contentWindow || e.origin!==location.origin || !e.data || e.data.type!=='portfolio:height') return;
      var h=Number(e.data.height);
      if(Number.isFinite(h) && h>=100 && h<=100000) {frame.dataset.contentHeight=String(h);schedule();}
    });
    frame.addEventListener('load',schedule);
  }
  if (window.ResizeObserver) {
    var resize=new ResizeObserver(schedule);
    stages.forEach(function(item){resize.observe(item.stage);});
    if(canvas) resize.observe(canvas);
  }
  if (window.MutationObserver) {
    var mutation=new MutationObserver(schedule);
    panels.forEach(function(panel){mutation.observe(panel,{attributes:true,attributeFilter:['class']});});
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule);
  window.addEventListener('pageshow',schedule);
  if (window.visualViewport) window.visualViewport.addEventListener('resize',schedule,{passive:true});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule).catch(function() {});
  var nav = document.querySelector('.topnav');
  if (nav) nav.addEventListener('click',schedule);
  window.addEventListener('load',schedule);
  document.addEventListener('load',schedule,true);
  measure();

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
    if (!image) { var figure=e.target.closest('.mobile-gallery figure'); if (figure) image=figure.querySelector('img'); }
    if (!image || image.closest('.mobile-image-dialog, a, button, .cm-overlay, [role="button"], .card-bjh, .card-dxx, .card-dujia, .card-mcn')) return;
    if (image.closest('.jd-privacy-blur')) return;
    if (!image.closest('.mobile-gallery') && (image.naturalWidth < 240 || image.naturalHeight < 160)) return;
    showImage(image);
  });
})();
