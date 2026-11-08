/* =========================================================
   Component/detail.js — 博客 / 项目详情页公共渲染器
   用法（详情页只保留一个空壳）：
     <script src="../../Component/detail.js" data-type="blog"></script>
     <script src="../../Component/detail.js" data-type="project"></script>
   目录名即文章 / 项目名：/Blog/World_Editor/ → World_Editor
   正文数据仍来自同目录的 Intro.ini 与 <目录名>.md，不会被改动
   ========================================================= */
(function () {
    'use strict';

    var scriptEl = document.currentScript;
    var isBlog = scriptEl && scriptEl.getAttribute('data-type') === 'blog';
    // 由本脚本地址推导站点根目录，兼容 /zh_CN/ 之类的语言前缀
    var ROOT = new URL('../', scriptEl.src).href;

    var CFG = isBlog ? {
        containerId: 'article-detail',
        backHref: 'blog.html',
        backText: '返回博客列表',
        navActive: 'blog',
        listTitle: '博客',
        footerText: '练习作品'
    } : {
        containerId: 'project-detail',
        backHref: 'projects.html',
        backText: '返回项目列表',
        navActive: 'projects',
        listTitle: '项目',
        footerText: '设计与开发'
    };

    function currentName() {
        var parts = location.pathname.split('/').filter(Boolean);
        var i = parts.length - 1;
        if (parts[i] === 'index.html') i--;
        return parts[i] || '';
    }

    function parseINI(text) {
        var info = { title: '', date: '', summary: '', image: '', show_image: false, full_image: false, tags: [] };
        var section = '';
        text.split('\n').forEach(function (raw) {
            var line = raw.trim();
            if (!line || line.charAt(0) === ';' || line.charAt(0) === '#') return;
            var sec = line.match(/^\[(.+)\]$/);
            if (sec) { section = sec[1].trim(); return; }
            var kv = line.match(/^([^=]+)=(.*)$/);
            if (!kv) return;
            var key = kv[1].trim();
            var val = kv[2].trim();
            if (section === 'Info' || section === 'Project') {
                if (key === 'title' || key === 'name') info.title = val;
                else if (key === 'date') info.date = val;
                else if (key === 'summary' || key === 'intro') info.summary = val;
                else if (key === 'image') info.image = val;
                else if (key === 'show_image') info.show_image = val.toLowerCase() === 'true';
                else if (key === 'full_image') info.full_image = val.toLowerCase() === 'true';
            } else if (section === 'Tags') {
                if (/^\d+$/.test(key)) info.tags.push(val);
            }
        });
        return info;
    }

    function navLink(href, text, active) {
        return '<a href="' + href + '" class="nav-link' + (active ? ' active' : '') + ' text-sm">' + text + '</a>';
    }

    function buildShell() {
        var home = ROOT + 'index.html';
        var projects = ROOT + 'projects.html';
        var blog = ROOT + 'blog.html';
        var about = ROOT + 'about.html';
        var contact = ROOT + 'contact.html';
        var avatar = ROOT + 'images/face.jpg';

        var nav = '' +
            '<div class="flex items-center justify-between h-16 px-5 sm:px-8 max-w-6xl mx-auto">' +
                '<a href="' + home + '" class="flex items-center gap-3 no-underline">' +
                    '<div class="avatar-ring">' +
                        '<img src="' + avatar + '" alt="头像" class="relative w-9 h-9 rounded-full object-cover border-2 border-white" onerror="this.src=\'' + avatar + '\'">' +
                    '</div>' +
                    '<span class="text-lg font-semibold text-gray-800 tracking-tight">FirefairyZz</span>' +
                '</a>' +
                '<div class="hidden md:flex items-center gap-8">' +
                    navLink(home, '首页', false) +
                    navLink(projects, '项目', CFG.navActive === 'projects') +
                    navLink(blog, '博客', CFG.navActive === 'blog') +
                    navLink(about, '关于', false) +
                '</div>' +
                '<div class="hidden md:block"><a href="' + contact + '" class="btn-primary text-sm">联系我</a></div>' +
                '<button class="md:hidden text-gray-600 text-xl p-1" id="menuBtn"><i class="fa fa-bars"></i></button>' +
            '</div>' +
            '<div class="md:hidden hidden mx-4 mb-3 mobile-menu overflow-hidden" id="mobileMenu">' +
                '<div class="flex flex-col">' +
                    '<a href="' + home + '" class="nav-link block px-4 py-3 text-sm border-b border-black/5">首页</a>' +
                    '<a href="' + projects + '" class="nav-link' + (CFG.navActive === 'projects' ? ' active' : '') + ' block px-4 py-3 text-sm border-b border-black/5">项目</a>' +
                    '<a href="' + blog + '" class="nav-link' + (CFG.navActive === 'blog' ? ' active' : '') + ' block px-4 py-3 text-sm border-b border-black/5">博客</a>' +
                    '<a href="' + about + '" class="nav-link block px-4 py-3 text-sm border-b border-black/5">关于</a>' +
                    '<a href="' + contact + '" class="block px-4 py-3 text-sm text-primary font-medium">联系我</a>' +
                '</div>' +
            '</div>';

        document.body.innerHTML = '' +
            '<div class="bg-gradient-layer"></div>' +
            '<div class="bg-image-layer" id="bgImage"></div>' +
            '<nav class="nav-blur fixed top-0 left-0 right-0 z-50">' + nav + '</nav>' +
            '<main class="min-h-screen px-5 sm:px-8 pt-28 pb-24">' +
                '<div class="max-w-4xl mx-auto">' +
                    '<a href="' + ROOT + CFG.backHref + '" class="back-link mb-8">' +
                        '<i class="fa fa-arrow-left" style="font-size:0.8rem"></i> ' + CFG.backText +
                    '</a>' +
                    '<div id="' + CFG.containerId + '">' +
                        '<div class="text-center text-gray-400 py-20"><i class="fa fa-spinner fa-pulse"></i> 加载中...</div>' +
                    '</div>' +
                '</div>' +
            '</main>' +
            '<footer class="fixed bottom-0 left-0 right-0 py-3 text-center text-gray-400 text-xs">' +
                '<p>&copy; 2024 FirefairyZz &mdash; ' + CFG.footerText + '</p>' +
            '</footer>';

        bindInteractions();
    }

    function bindInteractions() {
        var menuBtn = document.getElementById('menuBtn');
        var mobileMenu = document.getElementById('mobileMenu');
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', function () {
                mobileMenu.classList.toggle('hidden');
                var icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });
        }

        var bg = document.getElementById('bgImage');
        if (bg) {
            var img = new Image();
            img.src = 'https://uapis.cn/api/v1/random/image';
            img.onload = function () {
                bg.style.backgroundImage = 'url(' + img.src + ')';
                bg.classList.add('loaded');
            };
        }
    }

    function coverHTML(info) {
        if (!info.image) return '';
        if (isBlog && !info.show_image) return '';
        var fit = info.full_image ? 'contain' : 'cover';
        var bgColor = info.full_image ? '#f0f0f0' : '#e8ecf2';
        return '<div class="detail-card overflow-hidden mb-8">' +
            '<img src="' + info.image + '" alt="' + (info.title || '') + ' 封面" class="w-full h-48 sm:h-72"' +
            ' style="object-fit:' + fit + ';background:' + bgColor + '"' +
            ' onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div class=&quot;w-full h-48 sm:h-72 bg-gray-200 flex items-center justify-center text-gray-400&quot;>暂无封面</div>\'">' +
            '</div>';
    }

    function cardHTML(info, bodyHTML) {
        var tags = (info.tags || []).map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
        var dateHTML = info.date ? '<p class="text-gray-400 text-sm mb-6">' + info.date + '</p>' : '';
        var headClass = isBlog ? 'mb-2' : 'mb-4';
        return '<div class="detail-card p-6 sm:p-10">' +
            '<div class="flex flex-wrap items-center gap-2 mb-3">' + tags + '</div>' +
            '<h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight ' + headClass + '">' + (info.title || '') + '</h1>' +
            dateHTML +
            '<div class="project-content">' + bodyHTML + '</div>' +
            '</div>';
    }

    async function render() {
        buildShell();
        var container = document.getElementById(CFG.containerId);
        var name = currentName();
        var label = isBlog ? '文章' : '项目名';

        if (!name) {
            container.innerHTML = '<p class="text-red-400 text-center py-10">无法识别' + label + '</p>';
            return;
        }

        try {
            var iniRes = await fetch('Intro.ini');
            if (!iniRes.ok) throw new Error('找不到 Intro.ini');
            var info = parseINI(await iniRes.text());

            var mdRes = await fetch(name + '.md');
            if (!mdRes.ok) throw new Error('找不到 ' + name + '.md');
            var mdText = await mdRes.text();

            if (typeof window.preprocessCustomTags === 'function') {
                mdText = window.preprocessCustomTags(mdText, window.currentLang || document.documentElement.lang || 'zh_CN');
            }
            var bodyHTML = marked.parse(mdText);

            if (!info.title) info.title = name;
            document.title = info.title + ' - FirefairyZz';

            container.innerHTML = coverHTML(info) + cardHTML(info, bodyHTML);

            if (window.bindLightbox) window.bindLightbox();
            if (window.i18n && window.i18n.translatePage) window.i18n.translatePage();
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="text-red-400 text-center py-10">加载失败：' + error.message + '</p>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
