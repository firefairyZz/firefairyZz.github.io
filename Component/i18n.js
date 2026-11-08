/* =========================================================
   Component/i18n.js — 极简前端国际化
   
   工作方式：
   - 语言检测：从 URL 前缀 /zh_CN/ 或 /en/ 获取（server.js 已保证）
   - 切换语言：剥掉 URL 前缀 → server.js 根据 cookie 重定向到新语言
   - 运行时翻译：data-i18n 属性 → 翻译表查找替换
   - 永远不会产生双重前缀
   ========================================================= */
(function(global) {
    'use strict';

    var COOKIE = 'lang';
    var SUPPORTED = ['zh_CN', 'en'];

    // --- 翻译表（只放 nav/footer/按钮 等固定文本 ---
    var T = {
        zh_CN: {
            // 导航
            'nav.home': '首页',
            'nav.projects': '项目',
            'nav.blog': '博客',
            'nav.about': '关于',
            'nav.contact': '联系我',
            'nav.menu': '菜单',
            // 按钮
            'btn.contact': '联系我',
            'btn.go_home': '返回首页',
            'btn.go_back': '后退一步',
            // 通用
            'loading': '加载中...',
            'loading_failed': '加载失败',
            'loading_detail_fail': '加载失败',
            'no_cover': '暂无封面',
            // 页脚
            'footer.rights': '设计与开发',
            'footer.practice': '练习作品',
            // 404
            '404.title': '页面走丢了',
            '404.desc': '你访问的页面不存在，可能已被移除或地址输入有误。',
            // 语言按钮
            'lang.switch': '切换语言',
            // 首页
            'home.tagline': '热爱生活 · 追求卓越',
            'home.intro_1': '大家好！我是 <strong>FirefairyZz</strong>，欢迎来到我的个人网站。我热爱生活、追求卓越，愿意在自己的领域发光发热。',
            'home.intro_2': '我专注于每个领域，热衷于发现未知。通过这个网站，我希望能够分享我的作品、想法和经验，与更多志同道合的朋友交流学习。',
            'home.intro_3': '无论是工作合作还是兴趣交流，都欢迎通过"联系我"取得联系。感谢您的访问！',
            // 项目列表
            'projects.title': '项目',
            'projects.subtitle': '一些我做过的东西',
            'projects.empty': '还没有添加项目',
            'projects.none_avail': '暂无可用项目',
            'projects.view_detail': '查看详情',
            // 博客列表
            'blog.title': '博客',
            'blog.subtitle': '偶尔写写，记录一些学习路上的碎碎念 📝',
            'blog.empty': '还没有文章',
            'blog.none_avail': '暂无可用文章',
            'blog.read_more': '阅读更多',
            'blog.no_date': '未标注日期',
        },
        en: {
            'nav.home': 'Home',
            'nav.projects': 'Projects',
            'nav.blog': 'Blog',
            'nav.about': 'About',
            'nav.contact': 'Contact',
            'nav.menu': 'Menu',
            'btn.contact': 'Contact',
            'btn.go_home': 'Go Home',
            'btn.go_back': 'Go Back',
            'loading': 'Loading...',
            'loading_failed': 'Failed',
            'loading_detail_fail': 'Failed to load',
            'no_cover': 'No Cover',
            'footer.rights': 'Designed & Developed by',
            'footer.practice': 'Practice Project',
            '404.title': 'Page Not Found',
            '404.desc': "The page you requested doesn't exist — it may have been removed or the URL is wrong.",
            'lang.switch': 'Language',
            'home.tagline': 'Love Life · Pursuit of Excellence',
            'home.intro_1': 'Hi there! I\'m <strong>FirefairyZz</strong>, welcome to my personal website. I love life, pursue excellence, and shine in my own field.',
            'home.intro_2': 'I focus on every area and am passionate about discovering the unknown. Through this site, I hope to share my works, ideas, and experiences, and connect with more like-minded friends.',
            'home.intro_3': 'Whether for work collaboration or hobby exchange, feel free to reach out via "Contact". Thanks for visiting!',
            'projects.title': 'Projects',
            'projects.subtitle': "Some things I've built",
            'projects.empty': 'No projects added yet',
            'projects.none_avail': 'No projects available',
            'projects.view_detail': 'View Details',
            'blog.title': 'Blog',
            'blog.subtitle': 'Occasional writings. Notes from my learning journey 📝',
            'blog.empty': 'No articles yet',
            'blog.none_avail': 'No articles available',
            'blog.read_more': 'Read More',
            'blog.no_date': 'No date',
        }
    };

    // --- Cookie ---
    function getCookie(name) {
        var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[-.]/g, '\\$&') + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }
    function setCookie(name, value) {
        document.cookie = name + '=' + encodeURIComponent(value) + '; Path=/; Max-Age=31536000';
    }

    // --- 语言检测：从 URL 前缀取 ---
    function detectLang() {
        var parts = location.pathname.split('/').filter(Boolean);
        if (parts.length > 0 && SUPPORTED.indexOf(parts[0]) >= 0) return parts[0];
        // URL 没有前缀 → 从 cookie 取 → 这是 server.js 兜底前的临时状态
        var c = getCookie(COOKIE);
        if (c && SUPPORTED.indexOf(c) >= 0) return c;
        return 'zh_CN';
    }

    // --- 翻译函数 ---
    function t(key) {
        var dict = T[currentLang] || T.zh_CN;
        return dict[key] !== undefined ? dict[key] : key;
    }

    // --- 翻译页面所有 data-i18n 元素 ---
    function translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            if (el.hasAttribute('data-i18n-attr')) return; // 由属性翻译处理
            var key = el.getAttribute('data-i18n');
            var v = t(key);
            if (v && v !== key) el.innerHTML = v;
        });
        document.querySelectorAll('[data-i18n-attr]').forEach(function(el) {
            var attr = el.getAttribute('data-i18n-attr');
            var key = el.getAttribute('data-i18n-attr-key') || el.getAttribute('data-i18n');
            if (attr && key) {
                var v = t(key);
                if (v && v !== key) el.setAttribute(attr, v);
            }
        });
    }

    // --- 切换语言（核心！绝对不能产生双重前缀）---
    function setLanguage(lang) {
        if (SUPPORTED.indexOf(lang) < 0) return;
        setCookie(COOKIE, lang);

        // 关键：剥掉现有语言前缀，跳到无前缀路径
        // server.js 会根据 cookie 自动重定向到新语言
        var parts = location.pathname.split('/').filter(Boolean);
        if (parts.length > 0 && SUPPORTED.indexOf(parts[0]) >= 0) {
            parts.shift();
        }
        var base = '/' + parts.join('/');
        var qs = location.search || '';
        location.href = base + qs;
    }

    // --- 语言切换按钮：全局绑定 ---
    function bindLangButtons() {
        document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                setLanguage(btn.getAttribute('data-lang-btn'));
            });
        });
        // 高亮当前语言
        document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
            var target = btn.getAttribute('data-lang-btn');
            if (target === currentLang) btn.classList.add('is-active');
        });
    }

    // --- 暴露 ---
    var currentLang = detectLang();
    global.currentLang = currentLang;
    global.i18n = {
        detectLang: detectLang,
        setLanguage: setLanguage,
        t: t,
        translatePage: translatePage,
        bindLangButtons: bindLangButtons,
        _TRANSLATIONS: T
    };

    // DOM 就绪后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            translatePage();
            bindLangButtons();
        });
    } else {
        translatePage();
        bindLangButtons();
    }
})(window);
