/* 完整重写 lightbox.js — 用事件委托，彻底解决绑定时机问题 */
(function(global) {
    'use strict';

    var overlay = null;
    var lbImg = null;
    var scale = 1, tx = 0, ty = 0;
    var dragging = false, dragStart = null;

    function dist(touches) {
        var dx = touches[0].clientX - touches[1].clientX;
        var dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx*dx + dy*dy);
    }

    function zoom(factor) {
        scale = Math.max(0.1, Math.min(10, scale * factor));
        applyTransform();
    }
    function reset() { scale = 1; tx = 0; ty = 0; applyTransform(); }
    function applyTransform() {
        if (lbImg) lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    }

    function initLightbox() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = '<span class="lightbox-close">&times;</span><img alt="放大查看"><div class="lightbox-caption"></div>';
        document.body.appendChild(overlay);
        lbImg = overlay.querySelector('img');
        var closeBtn = overlay.querySelector('.lightbox-close');

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target === closeBtn) close();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') close();
            else if (e.key === '+' || e.key === '=') zoom(1.2);
            else if (e.key === '-') zoom(0.8);
            else if (e.key === '0') reset();
        });
        overlay.addEventListener('wheel', function(e) {
            e.preventDefault();
            zoom(e.deltaY < 0 ? 1.1 : 0.9);
        }, { passive: false });

        lbImg.addEventListener('mousedown', function(e) {
            dragging = true;
            dragStart = { x: e.clientX - tx, y: e.clientY - ty };
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            tx = e.clientX - dragStart.x;
            ty = e.clientY - dragStart.y;
            applyTransform();
        });
        document.addEventListener('mouseup', function() { dragging = false; });

        var touchDist = 0;
        lbImg.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) { touchDist = dist(e.touches); }
            else if (e.touches.length === 1) {
                dragging = true;
                dragStart = { x: e.touches[0].clientX - tx, y: e.touches[0].clientY - ty };
            }
        });
        lbImg.addEventListener('touchmove', function(e) {
            e.preventDefault();
            if (e.touches.length === 2) { zoom(dist(e.touches) / touchDist); touchDist = dist(e.touches); }
            else if (dragging && e.touches.length === 1) {
                tx = e.touches[0].clientX - dragStart.x;
                ty = e.touches[0].clientY - dragStart.y;
                applyTransform();
            }
        }, { passive: false });
        lbImg.addEventListener('touchend', function() { dragging = false; });
    }

    function open(src, cap) {
        initLightbox();
        scale = 1; tx = 0; ty = 0;
        lbImg.src = src;
        applyTransform();
        var capEl = overlay.querySelector('.lightbox-caption');
        capEl.textContent = cap || '';
        capEl.style.display = cap ? 'block' : 'none';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* =========================================================
       事件委托：在 document 上监听所有图片的点击
       不管 DOM 什么时候变，只要点到下面这些图片就触发 lightbox
       ========================================================= */
    document.addEventListener('click', function(e) {
        // 找到被点击的元素是不是我们关心的图片
        var img = e.target;
        if (img.tagName !== 'IMG') return;

        // 在允许的容器内
        var container = img.closest('.project-content, .md-image-wrap, #project-detail, #projects-list, #blog-list, article, main');
        if (!container) return;

        e.preventDefault();
        e.stopPropagation();

        // 找注释
        var cap = '';
        var wrap = img.closest('.md-image-wrap');
        if (wrap) {
            var capEl = wrap.querySelector('.md-image-caption');
            if (capEl) cap = capEl.textContent;
        }

        open(img.src, cap);
    });

    // 暴露全局（留着防止有人调用）
    global.bindLightbox = function() { /* 事件委托不需要手动绑定 */ };
    global.openLightbox = open;

})(window);
