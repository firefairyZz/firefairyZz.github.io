/* =========================================================
   Component/markdown.js — INI 解析 + Markdown 自定义标签处理

   暴露全局：
   - parseProjectINI(text) → { displayName, intro, image, tags, full_image, name_en, intro_en }
   - parseBlogINI(text) → 同上 + title, date, summary, show_image
   - preprocessCustomTags(md, lang) → 处理所有自定义标签
   - 需要 marked.js (CDN) 来完成最终渲染

   支持的自定义标签（完整列表见 SYNTAX.md）：
   - [header_image] [tag] — 元数据，移除
   - [githublink] [afdian] [win64] [android] — 按钮
   - [icon] — 图标功能块
   - [frame] — 技术栈网格
   - [lang=zh]/[lang=en] — 多语言块过滤
   - 图片扩展语法 ![alt {:size;caption}](url)
   ========================================================= */
(function(global) {
    'use strict';

    // --- INI 解析（Projects）---
    function parseProjectINI(text) {
        var r = {
            displayName: '', intro: '', image: '', tags: [], full_image: false,
            name_en: '', intro_en: '', date: '', summary: '', show_image: false
        };
        if (!text) return r;
        var lines = text.split('\n');
        var section = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line.charAt(0) === ';' || line.charAt(0) === '#') continue;
            var sec = line.match(/^\[(.+)\]$/);
            if (sec) { section = sec[1].trim(); continue; }
            var kv = line.match(/^([^=]+)=(.*)$/);
            if (!kv) continue;
            var key = kv[1].trim();
            var val = kv[2].trim();
            if (section === 'Project' || section === 'Blog' || section === 'Info') {
                if (key === 'name' || key === 'title') r.displayName = val;
                else if (key === 'intro' || key === 'summary') r.intro = val;
                else if (key === 'name_en') r.name_en = val;
                else if (key === 'intro_en') r.intro_en = val;
                else if (key === 'image') r.image = val;
                else if (key === 'full_image') r.full_image = (val.toLowerCase() === 'true');
                else if (key === 'show_image') r.show_image = (val.toLowerCase() === 'true');
                else if (key === 'date') r.date = val;
            } else if (section === 'Tags') {
                r.tags.push(val);
            }
        }
        if (!r.image) r.image = 'https://picsum.photos/800/400';
        return r;
    }

    function parseBlogINI(text) {
        var r = parseProjectINI(text);
        r.title = r.displayName;
        return r;
    }

    // --- 图片路径修正 ---
    // ![](/image/pic.png) → 去掉前导 /
    // ![](project/xxx/image/pic.png) → 提取为 image/pic.png
    // ![](相对路径) → 保持
    function fixImagePath(path) {
        if (!path) return path;
        // 在线 URL 不动
        if (/^https?:\/\//.test(path)) return path;
        // 前导 / 去掉
        if (path.charAt(0) === '/') path = path.substring(1);
        // project/项目名/... → 去掉 project/项目名/
        var pm = path.match(/^project\/[^\/]+\/(.+)$/i);
        if (pm) path = pm[1];
        return path;
    }

    // --- Markdown 自定义标签预处理（完整版）---
    function preprocessCustomTags(md, lang) {
        if (!md) return '';
        lang = lang || 'zh_CN';

        // 0. 多语言块过滤 [lang=xx]内容[/lang]
        md = md.replace(/\[lang=(\w+)\]([\s\S]*?)\[\/lang\]/g, function(m, targetLang, content) {
            return targetLang === lang ? content : '';
        });

        // 1. 移除顶部元数据标签
        md = md.replace(/\[header_image\].*?\[\/header_image\]\s*/gs, '');
        md = md.replace(/\[tag\].*?\[\/tag\]\s*/gs, '');

        // 2. GitHub 按钮
        md = md.replace(/\[githublink\](.*?)\[\/githublink\]\((.*?)\)/g,
            '<a href="$2" target="_blank" class="github-btn"><i class="fa fa-github"></i> $1</a>');

        // 3. 爱发电按钮
        md = md.replace(/\[afdian\](.*?)\[\/afdian\]\((.*?)\)/g,
            '<a href="$2" target="_blank" class="afdian-btn"><img src="https://static.afdiancdn.com/static/img/logo/logo.png" alt="爱发电" class="afdian-icon"> $1</a>');

        // 4. Windows 下载按钮（蓝色）
        md = md.replace(/\[win64\](.*?)\[\/win64\]\((.*?)\)/g,
            '<a href="$2" target="_blank" class="win64-btn"><i class="fa fa-windows"></i> $1</a>');

        // 5. Android 下载按钮（绿色）
        md = md.replace(/\[android\](.*?)\[\/android\]\((.*?)\)/g,
            '<a href="$2" target="_blank" class="android-btn"><i class="fa fa-android"></i> $1</a>');

        // 6. [icon]params[/icon]{content} → 图标功能块
        md = md.replace(/\[icon\](.*?)\[\/icon\]\s*\{([\s\S]*?)\}/g, function(m, params, content) {
            var parts = params.split(';');
            var icon = (parts[0] || 'star').trim();
            var iconMap = {
                'write': 'pencil-square-o', 'branch': 'code-fork',
                'paintbrush': 'paint-brush', 'earth': 'globe',
                'code': 'code', 'file': 'file-text-o',
                'lightbulb': 'lightbulb-o', 'pencil-square': 'pencil-square-o',
                'language': 'language', 'puzzle-piece': 'puzzle-piece',
                'moon-o': 'moon-o', 'rocket': 'rocket', 'cog': 'cog', 'check': 'check'
            };
            icon = iconMap[icon] || icon;
            var color = (parts[1] || '#ef4444').trim();
            // 按行解析 content
            var lines = content.trim().split('\n');
            var parsedLines = lines.map(function(line) {
                if (global.marked) return global.marked.parseInline(line.trim());
                return line.trim();
            });
            var parsedContent = parsedLines.join('<br>');
            return '<div class="icon-feature">' +
                '<div class="feature-icon" style="background:' + color + '20; color:' + color + '">' +
                '<i class="fa fa-' + icon + '"></i></div>' +
                '<div>\n' + parsedContent + '\n</div></div>';
        });

        // 7. [frame]name\desc|name\desc[/frame] → 技术栈网格
        md = md.replace(/\[frame\](.*?)\[\/frame\]/gs, function(m, content) {
            var items = content.split('|').map(function(s) { return s.trim(); });
            var html = '<div class="tech-frame">';
            for (var i = 0; i < items.length; i++) {
                var pair = items[i].split('\\').map(function(s) { return s.trim(); });
                html += '<div class="tech-item"><div class="tech-name">' + pair[0] + '</div>' +
                    (pair[1] ? '<div class="tech-desc">' + pair[1] + '</div>' : '') + '</div>';
            }
            html += '</div>';
            return html;
        });

        // 8. 图片扩展语法：![alt {:size;caption}](url)  — opts 在 ] 之前！
        //    也处理标准 ![alt](url) 和 ![alt](url "title")
        md = md.replace(/!\[([^\]]*?)\s*(?:\{([^}]*)\})?\s*\]\s*\(([^)]+)\)/g, function(m, alt, opts, urlPart) {
            // 分离 URL 和可选的 "title"
            var url = urlPart.trim().replace(/\s+"[^"]*"$/, '');
            var titleMatch = urlPart.match(/"([^"]*)"$/);
            var title = titleMatch ? titleMatch[1] : '';
            url = fixImagePath(url);

            var size = '', caption = '';
            if (opts) {
                // opts 格式：":500px;启程界面" — 第一个字段是 size（前面可能有 :），第二个是 caption
                var optParts = opts.split(';');
                var first = (optParts[0] || '').trim();
                if (first.charAt(0) === ':') first = first.substring(1).trim();
                if (first) size = first;
                if (optParts[1]) caption = optParts[1].trim();
            }
            if (!caption && title) caption = title;

            var style = '';
            if (size && size !== 'none') {
                style = ' style="width:' + size + ';max-width:100%;"';
            }

            var html = '<div class="md-image-wrap">';
            html += '<img src="' + url + '" alt="' + alt + '"' + style + '>';
            if (caption) {
                html += '<span class="md-image-caption">' + caption + '</span>';
            }
            html += '</div>';
            return html;
        });

        return md;
    }

    // --- 暴露 ---
    global.parseProjectINI = parseProjectINI;
    global.parseBlogINI = parseBlogINI;
    global.preprocessCustomTags = preprocessCustomTags;

})(window);
