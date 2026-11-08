/* =========================================================
   Component/site.js — 站点通用交互
   - 移动端菜单切换
   - 随机背景图加载
   - 所有页面都应引用
   ========================================================= */
(function() {
    'use strict';

    // 移动端菜单
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            var icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // 随机背景图
    var bg = document.getElementById('bgImage');
    if (bg) {
        var img = new Image();
        img.src = 'https://uapis.cn/api/v1/random/image';
        img.onload = function() {
            bg.style.backgroundImage = 'url(' + img.src + ')';
            bg.classList.add('loaded');
        };
        // 加载失败不影响，渐变层始终可见
    }
})();
