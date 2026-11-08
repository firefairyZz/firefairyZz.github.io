/* =========================================================
   server.js — 极简语言路由服务器
   
   规则：
   1. /zh_CN/xxx → 直接 serve xxx（原文件就是中文的）
   2. /en/xxx    → 先查 xxx.en.html / xxx.en.md / xxx.en.ini，没有就 serve xxx
   3. /xxx（无前缀）→ 静态资源直接 serve；HTML 根据 cookie/浏览器语言重定向
   4. 永远不会产生双重前缀
   ========================================================= */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const SUPPORTED = ['zh_CN', 'en'];
const DEFAULT_LANG = 'zh_CN';
const LANG_RE = /^\/(zh_CN|en)\/(.*)$/s;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.ini': 'text/plain; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
};

const STATIC_EXTS = ['.js', '.css', '.md', '.ini', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.json', '.txt'];

function mime(p) {
    return MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
}

function parseCookie(h) {
    if (!h) return null;
    const m = h.match(/(?:^|;\s*)lang=(zh_CN|en)/);
    return m ? m[1] : null;
}

function detectBrowser(h) {
    if (!h) return DEFAULT_LANG;
    if (/zh/i.test(h)) return 'zh_CN';
    if (/en/i.test(h)) return 'en';
    return DEFAULT_LANG;
}

function send(res, code, file, langCookie) {
    const headers = { 'Content-Type': mime(file) };
    if (langCookie) headers['Set-Cookie'] = `lang=${langCookie}; Path=/; Max-Age=31536000`;
    fs.readFile(file, (e, data) => {
        if (e) { res.writeHead(500, { 'Content-Type': 'text/plain' }); res.end('Server Error'); return; }
        res.writeHead(code, headers);
        res.end(data);
    });
}

function serveNotFound(res, lang) {
    // 返回 404.html 或 404.en.html
    const en404 = path.join(ROOT, '404.en.html');
    const zh404 = path.join(ROOT, '404.html');
    let target = zh404;
    if (lang === 'en' && fs.existsSync(en404)) target = en404;
    else if (fs.existsSync(zh404)) target = zh404;
    else { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404 Not Found'); return; }
    send(res, 404, target, lang);
}

function resolveFile(innerPath, lang) {
    try {
        // innerPath 已经剥掉了语言前缀
        let relPath = innerPath;
        if (relPath === '/' || relPath === '') relPath = '/index.html';

        // 对 en 语言，尝试 .en 版本
        if (lang === 'en') {
            const enPath = relPath.replace(/\.(html|md|ini)$/i, '.en.$1');
            const fullEn = path.join(ROOT, enPath);
            if (fs.existsSync(fullEn)) {
                if (fs.statSync(fullEn).isDirectory()) {
                    const idx = path.join(fullEn, 'index.html');
                    if (fs.existsSync(idx)) return idx;
                }
                return fullEn;
            }
        }

        // fallback 到原版
        const full = path.join(ROOT, relPath);
        if (!fs.existsSync(full)) return null;
        if (fs.statSync(full).isDirectory()) {
            const idx = path.join(full, 'index.html');
            return fs.existsSync(idx) ? idx : null;
        }
        return full;
    } catch (e) {
        console.error('resolveFile error:', e.message);
        return null;
    }
}

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '') urlPath = '/';

    // ===== 情况 1：URL 已有语言前缀 =====
    const m = urlPath.match(LANG_RE);
    if (m) {
        const lang = m[1];
        const innerPath = '/' + m[2];
        const file = resolveFile(innerPath, lang);
        if (!file) { serveNotFound(res, lang); return; }
        send(res, 200, file, lang);
        return;
    }

    // ===== 情况 2：URL 无语言前缀 =====
    const ext = path.extname(urlPath).toLowerCase();
    const isStatic = STATIC_EXTS.includes(ext) || urlPath.startsWith('/Component/') || urlPath.startsWith('/image/');

    if (isStatic) {
        // 静态资源：直接 serve，不重定向，不加 cookie
        const filePath = path.join(ROOT, urlPath);
        if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isDirectory()) { serveNotFound(res); return; }
            send(res, 200, filePath, null);
        } else {
            serveNotFound(res);
        }
        return;
    }

    // HTML 页面：重定向到对应语言前缀
    const cookieLang = parseCookie(req.headers['cookie']);
    const lang = cookieLang || detectBrowser(req.headers['accept-language']);
    const redirectUrl = '/' + lang + (urlPath === '/' ? '/index.html' : urlPath);
    res.writeHead(302, {
        'Location': redirectUrl,
        'Set-Cookie': `lang=${lang}; Path=/; Max-Age=31536000`
    });
    res.end();
});

server.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
    console.log(`   中文: http://localhost:${PORT}/zh_CN/index.html`);
    console.log(`   英文: http://localhost:${PORT}/en/index.html`);
    console.log(`   无 cookie 访问 / 会自动重定向`);
});
