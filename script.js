(() => {
    const CONFIG = {
        dataPath: './data/resources.json',
        linksPath: './data/links.json',
        musicPath: './data/music.json',
        defaultReadme: 'data/rm/root.md',
        icons: ['🌐', '📦', '📁', '📄', '🎵', '🎬', '🖼️', '📱', '⚙️', '🚀', '🔥'],
        defaultIcon: { folder: '📁', file: '📄' },
        maxConsecutiveMusicFailures: 5,
        searchDebounceMs: 200,
        downloadRedirectHintMs: 1400,
        enablePressRipple: true,
        enableShineOnClick: true,
        enableHoverSpotlight: true,
        enableHeaderParallax: true,
        storageKeys: { theme: 'theme', glass: 'glassEnabled', animation: 'animationEnabled', music: 'musicEnabled', musicIndex: 'musicIndex' }
    };
    const Storage = {
        get(k, f = null) { try { const v = localStorage.getItem(k); return v !== null ? v : f; } catch { return f; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch {} },
        getBool(k, f = true) { const v = this.get(k, null); return v === null ? f : v === 'true'; },
        setBool(k, v) { this.set(k, v.toString()); }
    };
    const State = {
        data: [], folderStack: [], currentFolder: null, currentPath: [],
        isSearchActive: false, searchKeyword: '',
        downloadUrl: '', downloadName: '', downloadIcon: '',
        lastTabId: 'resource', lastTabBtn: null,
        audio: new Audio(), musicList: [], currentMusicIndex: 0,
        musicEnabled: false, consecutiveMusicFailures: 0,
        readmeTextCache: new Map(), readmeFetching: new Map(),
        tabIndicator: null, dom: {}
    };
    const escapeHtml = t => { const d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; };
    const triggerReflow = el => void el.offsetWidth;
    const animateClass = (el, cn) => { if (!el) return; el.classList.remove(cn); triggerReflow(el); el.classList.add(cn); };
    const debounce = (fn, ms) => {
        let t = null; const run = (...a) => { if (t) clearTimeout(t); t = setTimeout(() => fn.apply(null, a), ms); };
        run.flush = () => { if (t) { clearTimeout(t); fn(); } }; return run;
    };
    const safeCopyText = async text => {
        if (navigator.clipboard && window.isSecureContext) { try { await navigator.clipboard.writeText(text); return true; } catch {} }
        try {
            const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
            document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta);
            if (ok) return true;
        } catch {}
        try { window.prompt('请手动复制以下链接：', text); return true; } catch { return false; }
    };
    const toast = (msg, ms = 1600) => {
        let el = document.getElementById('__guiwowxx_toast');
        if (!el) {
            el = document.createElement('div'); el.id = '__guiwowxx_toast'; el.setAttribute('aria-live', 'polite');
            Object.assign(el.style, {
                position: 'fixed', left: '50%', bottom: '80px', transform: 'translateX(-50%) translateY(18px)',
                padding: '10px 20px', borderRadius: '14px', background: 'rgba(40,40,42,0.9)', color: '#fff',
                fontSize: '15px', fontWeight: '500', zIndex: '99999', pointerEvents: 'none', opacity: '0',
                transition: 'opacity .3s cubic-bezier(.25,.1,.25,1), transform .3s cubic-bezier(.25,.1,.25,1)',
                backdropFilter: 'saturate(220%) blur(20px)', WebkitBackdropFilter: 'saturate(220%) blur(20px)',
                border: '0.5px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            });
            document.body.appendChild(el);
        }
        el.textContent = msg;
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(0)'; });
        clearTimeout(el.__t);
        el.__t = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(18px)'; }, ms);
    };
    const renderReadmeHtml = (raw, title = '资源介绍') => {
        let body;
        if (typeof marked !== 'undefined' && marked.parse) {
            try { body = marked.parse(raw || ''); }
            catch { body = `<pre style="white-space:pre-wrap;word-break:break-all;">${escapeHtml(raw || '')}</pre>`; }
        } else body = `<pre style="white-space:pre-wrap;word-break:break-all;">${escapeHtml(raw || '')}</pre>`;
        return `<h3>${escapeHtml(title)}</h3><div class="markdown">${body}</div>`;
    };

    const SHINE_SELECTOR = '.card, .notice, .tabs, .tabs button, .download-buttons button, #links a, #search, #themeSelect, #breadcrumb, #readme, .download-readme, .download-window, #list';
    const ensureEnhanceLayers = el => {
        if (!el || el.nodeType !== 1) return;
        if (!el.querySelector(':scope > .__shine-layer')) {
            const s = document.createElement('span'); s.className = '__shine-layer'; s.setAttribute('aria-hidden', 'true'); el.appendChild(s);
        }
        if (CONFIG.enableHoverSpotlight && el.classList.contains('resource-card') && !el.querySelector(':scope > .__spotlight')) {
            const sp = document.createElement('span'); sp.className = '__spotlight'; sp.setAttribute('aria-hidden', 'true'); el.appendChild(sp);
        }
    };
    const fireShineAndRipple = (el, cx, cy) => {
        if (!el) return;
        if (CONFIG.enableShineOnClick) {
            ensureEnhanceLayers(el); el.classList.remove('is-shining'); void el.offsetWidth; el.classList.add('is-shining');
            setTimeout(() => el.classList.remove('is-shining'), 3600);
        }
        if (CONFIG.enablePressRipple) {
            const r = el.getBoundingClientRect();
            const x = (cx ?? r.left + r.width / 2) - r.left;
            const y = (cy ?? r.top + r.height / 2) - r.top;
            const rp = document.createElement('span'); rp.className = '__press-ripple';
            rp.style.left = x + 'px'; rp.style.top = y + 'px'; rp.setAttribute('aria-hidden', 'true');
            el.appendChild(rp);
            rp.addEventListener('animationend', () => rp.remove(), { once: true });
            setTimeout(() => rp.remove(), 1200);
        }
    };

    const applyTheme = theme => document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
    const initTheme = () => {
        const sel = State.dom.themeSelect;
        let saved = Storage.get(CONFIG.storageKeys.theme, null);
        if (!saved) saved = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        applyTheme(saved);
        if (sel) {
            sel.value = saved;
            sel.addEventListener('change', () => {
                const v = sel.value === 'light' ? 'light' : 'dark'; applyTheme(v); Storage.set(CONFIG.storageKeys.theme, v);
                toast(`已切换到${v === 'light' ? '浅色' : '深色'}模式`);
            });
        }
        if (Storage.get(CONFIG.storageKeys.theme, null) === null && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', e => applyTheme(e.matches ? 'light' : 'dark'));
        }
    };

    const renderBreadcrumb = () => {
        const { breadcrumb } = State.dom; if (!breadcrumb) return;
        const prefix = State.isSearchActive ? `🔍 ${escapeHtml(State.searchKeyword)}` : '🏠 首页';
        const path = State.currentPath.length ? ` › ${State.currentPath.map(escapeHtml).join(' › ')}` : '';
        breadcrumb.innerHTML = prefix + path;
        ensureEnhanceLayers(breadcrumb);
    };
    const getIconFor = item => {
        if (typeof item.icon === 'number') return CONFIG.icons[item.icon] || CONFIG.icons[0];
        if (typeof item.icon === 'string' && item.icon.length > 0) return item.icon;
        return item.type === 'folder' ? CONFIG.defaultIcon.folder : CONFIG.defaultIcon.file;
    };
    const rebuildStackFromPath = sp => {
        const stack = []; let node = { children: State.data, readme: CONFIG.defaultReadme }; stack.push(node);
        for (let i = 0; i < sp.length - 1; i++) {
            const next = node.children?.find(x => x?.name === sp[i] && x.type === 'folder');
            if (!next) break;
            stack.push(next); node = next;
        }
        State.folderStack = stack;
    };

    const renderFolder = () => {
        const { list } = State.dom; if (!list) return;
        list.innerHTML = ''; animateClass(list, 'folder-animation'); renderBreadcrumb();

        if (State.folderStack.length > 0 || State.isSearchActive) {
            const back = document.createElement('div');
            back.className = 'card resource-card folder-item';
            back.setAttribute('role', 'button'); back.setAttribute('tabindex', '0');
            back.innerHTML = `<span class="sf-icon" style="background:rgba(10,132,255,0.15);color:var(--blue);">←</span>
                              <div class="text-wrap"><h2 style="color:var(--blue);">返回</h2></div>
                              <span class="chevron">›</span>`;
            const goBack = () => {
                if (State.folderStack.length > 0) {
                    const parent = State.folderStack.pop(); State.currentFolder = parent; State.currentPath.pop();
                    if (State.folderStack.length === 0 && State.isSearchActive) {
                        State.currentFolder = { children: searchAll(State.data, State.searchKeyword), readme: null, _searchResult: true };
                    } else if (State.folderStack.length === 0) {
                        State.isSearchActive = false; State.searchKeyword = '';
                        if (State.dom.search) State.dom.search.value = '';
                        State.currentFolder = { children: State.data, readme: CONFIG.defaultReadme }; State.currentPath = [];
                    }
                } else if (State.isSearchActive) {
                    State.isSearchActive = false; State.searchKeyword = '';
                    if (State.dom.search) State.dom.search.value = '';
                    State.currentFolder = { children: State.data, readme: CONFIG.defaultReadme }; State.currentPath = [];
                }
                renderFolder(); loadReadme(State.currentFolder);
            };
            back.addEventListener('click', goBack);
            back.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goBack(); } });
            ensureEnhanceLayers(back); list.appendChild(back);
        }

        const children = State.currentFolder?.children || [];
        if (children.length === 0) {
            const empty = document.createElement('div'); empty.className = 'card folder-item';
            empty.innerHTML = `<span class="sf-icon" style="background:rgba(120,120,128,0.15);">❔</span>
                               <div class="text-wrap"><h2>${State.isSearchActive ? '无搜索结果' : '此目录为空'}</h2><p>${State.isSearchActive ? '试试其他关键词' : '暂时没有内容'}</p></div>
                               <span class="chevron"></span>`;
            list.appendChild(empty); return;
        }

        children.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card resource-card folder-item';
            card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0');
            const icon = getIconFor(item);
            const title = escapeHtml(item.name || '未命名');
            const desc = escapeHtml(item.desc || (item.type === 'folder' ? '文件夹' : '暂无描述'));
            let extra = '';
            if (State.isSearchActive && item._sourcePath?.length > 0) {
                extra = `<div style="margin-top:3px;font-size:12px;color:var(--sub);">${item._sourcePath.map(escapeHtml).join(' › ')}</div>`;
            }
            card.innerHTML = `<span class="sf-icon">${icon}</span>
                              <div class="text-wrap">
                                  <h2>${title}</h2>
                                  <p>${desc}</p>
                                  ${extra}
                              </div>
                              <span class="chevron">${item.type === 'folder' ? '›' : '⬇'}</span>`;
            ensureEnhanceLayers(card);
            const activate = () => {
                if (item.type === 'folder') {
                    if (State.isSearchActive && State.folderStack.length === 0) {
                        State.isSearchActive = false;
                        if (item._sourcePath) { State.currentPath = [...item._sourcePath]; rebuildStackFromPath(item._sourcePath); }
                        else { State.currentPath = [item.name]; State.folderStack = [{ children: State.data, readme: CONFIG.defaultReadme }]; }
                    } else { State.folderStack.push(State.currentFolder); State.currentPath.push(item.name); }
                    State.currentFolder = item; renderFolder(); loadReadme(item);
                } else openDownload(item.url, item.name, icon, item.readme || '');
            };
            card.addEventListener('click', activate);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
            list.appendChild(card);
        });
        loadReadme(State.currentFolder);
    };

    const loadReadme = folder => {
        const box = State.dom.readmeBox; if (!box) return;
        animateClass(box, 'readme-animation'); ensureEnhanceLayers(box);
        if (!folder?.readme) { box.innerHTML = '<h3>资源介绍</h3>暂无介绍'; return; }
        const key = folder.readme;
        if (State.readmeTextCache.has(key)) { box.innerHTML = renderReadmeHtml(State.readmeTextCache.get(key), '资源介绍'); return; }
        if (!State.readmeFetching.has(key)) {
            const p = fetch(key).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
                .then(t => { State.readmeTextCache.set(key, t); return t; })
                .catch(e => { console.warn('[README]', key, e); return null; })
                .finally(() => State.readmeFetching.delete(key));
            State.readmeFetching.set(key, p);
        }
        box.innerHTML = '<h3>资源介绍</h3><p style="opacity:.5;">加载中…</p>';
        State.readmeFetching.get(key).then(t => {
            if (State.currentFolder?.readme !== key) return;
            box.innerHTML = t === null ? '<h3>资源介绍</h3>暂无介绍' : renderReadmeHtml(t, '资源介绍');
        });
    };

    const searchAll = (arr, key, parents = []) => {
        const res = []; if (!Array.isArray(arr)) return res;
        arr.forEach(item => {
            const name = (item.name || '').toLowerCase(); const desc = (item.desc || '').toLowerCase();
            if (name.includes(key) || desc.includes(key)) res.push({ ...item, _sourcePath: [...parents, item.name] });
            if (item.type === 'folder' && Array.isArray(item.children)) res.push(...searchAll(item.children, key, [...parents, item.name]));
        });
        return res;
    };
    const initSearch = () => {
        const { search } = State.dom; if (!search) return;
        const doSearch = debounce(() => {
            const key = search.value.trim().toLowerCase();
            if (!key) {
                State.isSearchActive = false; State.searchKeyword = '';
                State.currentFolder = { children: State.data, readme: CONFIG.defaultReadme };
                State.folderStack = []; State.currentPath = []; renderFolder(); return;
            }
            State.isSearchActive = true; State.searchKeyword = key;
            State.currentFolder = { children: searchAll(State.data, key), readme: null, _searchResult: true };
            State.folderStack = []; State.currentPath = []; renderFolder();
        }, CONFIG.searchDebounceMs);
        search.addEventListener('input', doSearch);
        search.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch.flush?.(); });
    };

    const openDownload = (url, name, icon, readmePath) => {
        State.downloadUrl = url || ''; State.downloadName = name || '';
        State.downloadIcon = (typeof icon === 'string' && icon) ? icon : (CONFIG.icons[icon] || CONFIG.icons[0]);
        if (State.dom.downloadName) State.dom.downloadName.textContent = State.downloadName;
        if (State.dom.downloadIcon) State.dom.downloadIcon.textContent = State.downloadIcon;
        loadDownloadReadme(readmePath);
        const res = document.getElementById('resource'); const down = document.getElementById('download');
        const activeTabBtn = document.querySelector('.tabs button.active');
        State.lastTabId = 'resource'; State.lastTabBtn = activeTabBtn || null;
        if (res) res.classList.add('hide');
        if (down) {
            down.classList.remove('hide'); triggerReflow(down); down.classList.add('page-show');
            const win = down.querySelector('.download-window'); if (win) ensureEnhanceLayers(win);
            const rm = down.querySelector('.download-readme'); if (rm) ensureEnhanceLayers(rm);
        }
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    };
    const loadDownloadReadme = path => {
        const box = State.dom.downloadReadmeBox; if (!box) return; ensureEnhanceLayers(box);
        if (!path) { box.innerHTML = '<h3>文件介绍</h3>暂无介绍'; return; }
        if (State.readmeTextCache.has(path)) { box.innerHTML = renderReadmeHtml(State.readmeTextCache.get(path), '文件介绍'); return; }
        if (!State.readmeFetching.has(path)) {
            const p = fetch(path).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
                .then(t => { State.readmeTextCache.set(path, t); return t; })
                .catch(e => { console.warn('[DL README]', path, e); return null; })
                .finally(() => State.readmeFetching.delete(path));
            State.readmeFetching.set(path, p);
        }
        box.innerHTML = '<h3>文件介绍</h3><p style="opacity:.5;">加载中…</p>';
        State.readmeFetching.get(path).then(t => {
            box.innerHTML = t === null ? '<h3>文件介绍</h3>暂无介绍' : renderReadmeHtml(t, '文件介绍');
        });
    };

    window.startDownload = () => {
        if (!State.downloadUrl) { toast('下载链接无效'); return; }
        const btn = document.querySelector('.download-buttons button'); const orig = btn?.textContent || '';
        if (btn) { btn.textContent = '正在跳转…'; btn.disabled = true; setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, CONFIG.downloadRedirectHintMs); }
        try { window.open(State.downloadUrl, '_blank', 'noopener,noreferrer'); toast('已在新标签打开下载链接'); }
        catch { location.href = State.downloadUrl; }
    };
    window.copyDownloadLink = async () => {
        if (!State.downloadUrl) { toast('没有可复制的链接'); return; }
        toast(await safeCopyText(State.downloadUrl) ? '链接已复制' : '复制失败');
    };
    window.backResource = () => {
        const down = document.getElementById('download'); const res = document.getElementById('resource');
        if (down) { down.classList.add('hide'); down.classList.remove('page-show'); }
        if (res) { res.classList.remove('hide'); triggerReflow(res); res.classList.add('page-show'); }
        document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
        if (State.lastTabBtn?.isConnected) { State.lastTabBtn.classList.add('active'); moveTabIndicator(State.lastTabBtn); }
        else { const f = document.querySelector('.tabs button[data-tab="resource"]') || document.querySelector('.tabs button'); if (f) { f.classList.add('active'); moveTabIndicator(f); } }
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    };

    const initGlass = () => {
        const sw = State.dom.glassSwitch; if (!sw) return;
        const enabled = Storage.getBool(CONFIG.storageKeys.glass, true);
        sw.checked = enabled; document.body.classList.toggle('no-glass', !enabled);
        sw.addEventListener('change', () => {
            const v = sw.checked; Storage.setBool(CONFIG.storageKeys.glass, v);
            document.body.classList.toggle('no-glass', !v);
        });
    };
    const initAnimation = () => {
        const sw = State.dom.animationSwitch; if (!sw) return;
        const enabled = Storage.getBool(CONFIG.storageKeys.animation, true);
        sw.checked = enabled; document.body.classList.toggle('no-animation', !enabled);
        sw.addEventListener('change', () => {
            const v = sw.checked; Storage.setBool(CONFIG.storageKeys.animation, v);
            document.body.classList.toggle('no-animation', !v);
        });
    };

    const nextMusic = () => { if (State.musicEnabled && State.musicList.length) playMusic((State.currentMusicIndex + 1) % State.musicList.length); };
    const playMusic = index => {
        if (!State.musicList.length) return;
        const safeIdx = ((index % State.musicList.length) + State.musicList.length) % State.musicList.length;
        const song = State.musicList[safeIdx];
        if (!song?.url) { nextMusic(); return; }
        State.currentMusicIndex = safeIdx; Storage.set(CONFIG.storageKeys.musicIndex, safeIdx.toString());
        State.audio.src = song.url;
        State.audio.play().then(() => { State.consecutiveMusicFailures = 0; })
            .catch(err => {
                console.warn('[Music]', song.name, err); State.consecutiveMusicFailures++;
                if (State.consecutiveMusicFailures >= CONFIG.maxConsecutiveMusicFailures) {
                    State.musicEnabled = false; if (State.dom.musicSwitch) State.dom.musicSwitch.checked = false;
                    Storage.setBool(CONFIG.storageKeys.music, false); State.audio.pause(); State.audio.removeAttribute?.('src');
                    toast('音乐播放失败，已自动关闭'); return;
                }
                setTimeout(nextMusic, 280);
            });
    };
    const initMusic = () => {
        const sw = State.dom.musicSwitch;
        State.musicEnabled = Storage.getBool(CONFIG.storageKeys.music, false);
        if (sw) sw.checked = State.musicEnabled;
        try { State.audio.volume = 0.75; } catch {}
        const tryAutoplay = () => {
            if (State.musicEnabled && State.musicList.length) playMusic(State.currentMusicIndex);
            ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.removeEventListener(ev, tryAutoplay));
        };
        ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, tryAutoplay, { once: true }));
        fetch(CONFIG.musicPath).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(json => {
                if (!Array.isArray(json) || !json.length) throw new Error('空列表');
                State.musicList = json;
                const savedIdx = Number(Storage.get(CONFIG.storageKeys.musicIndex, 0));
                State.currentMusicIndex = (Number.isFinite(savedIdx) && savedIdx >= 0 ? savedIdx : 0) % State.musicList.length;
                if (State.musicEnabled) playMusic(State.currentMusicIndex);
            })
            .catch(err => { console.warn('[Music]', err); State.musicList = []; if (State.musicEnabled) toast('音乐列表加载失败'); });
        if (sw) {
            sw.addEventListener('change', () => {
                State.musicEnabled = sw.checked; Storage.setBool(CONFIG.storageKeys.music, State.musicEnabled);
                if (State.musicEnabled) playMusic(State.currentMusicIndex);
                else { State.audio.pause(); State.consecutiveMusicFailures = 0; }
            });
        }
        State.audio.addEventListener('ended', () => { State.consecutiveMusicFailures = 0; nextMusic(); });
        State.audio.addEventListener('error', () => {
            State.consecutiveMusicFailures++;
            if (State.consecutiveMusicFailures >= CONFIG.maxConsecutiveMusicFailures) {
                State.musicEnabled = false; if (sw) sw.checked = false;
                Storage.setBool(CONFIG.storageKeys.music, false); State.audio.pause(); State.audio.removeAttribute?.('src');
                toast('音乐无法播放，已自动关闭'); return;
            }
            setTimeout(nextMusic, 280);
        });
    };

    const loadLinks = () => {
        const c = State.dom.linksContainer; if (!c) return;
        fetch(CONFIG.linksPath).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(json => {
                if (!Array.isArray(json)) throw new Error('非数组'); c.innerHTML = '';
                if (!json.length) { c.innerHTML = '<div class="card folder-item"><h3>友情链接</h3><p>暂无</p></div>'; return; }
                json.forEach((item, idx) => {
                    const a = document.createElement('a');
                    a.href = item.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'folder-item';
                    if (idx >= 11) a.style.animationDelay = `${.205 + (idx - 11) * 0.03}s`;
                    const ic = item.icon ? `<span style="margin-right:6px;">${escapeHtml(item.icon)}</span>` : '';
                    const desc = item.desc ? ` <span style="opacity:.5;font-size:12.5px;margin-left:4px;">${escapeHtml(item.desc)}</span>` : '';
                    a.innerHTML = `${ic}${escapeHtml(item.name || '未命名')}${desc}`;
                    ensureEnhanceLayers(a); c.appendChild(a);
                });
            })
            .catch(err => { console.warn('[Links]', err); c.innerHTML = '<div class="card folder-item"><h3>友情链接</h3><p>暂无</p></div>'; });
    };
    const loadResources = () => {
        fetch(CONFIG.dataPath).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(json => {
                const arr = Array.isArray(json) ? json : (json.data || json.children || []);
                if (!Array.isArray(arr)) throw new Error('格式错误');
                State.data = arr; State.folderStack = [];
                State.currentFolder = { children: State.data, readme: CONFIG.defaultReadme };
                State.currentPath = []; State.isSearchActive = false; State.searchKeyword = '';
                renderFolder();
            })
            .catch(e => {
                console.error('[Resources]', e);
                if (State.dom.list) State.dom.list.innerHTML = `<div class="card folder-item"><h2>资源加载失败</h2><p>请检查 data/resources.json</p></div>`;
            });
    };

    window.showDonate = () => { State.dom.wechatImg?.classList.toggle('show'); State.dom.telegramImg?.classList.remove('show'); };
    window.showTelegram = () => { State.dom.telegramImg?.classList.toggle('show'); State.dom.wechatImg?.classList.remove('show'); };
    const moveTabIndicator = btn => {
        const ind = State.tabIndicator; if (!ind || !btn) return;
        const pr = btn.parentElement.getBoundingClientRect();
        const r = btn.getBoundingClientRect();
        ind.style.width = r.width + 'px';
        ind.style.transform = `translateX(${r.left - pr.left}px)`;
    };
    const ensureTabIndicator = () => {
        const tabs = document.querySelector('.tabs'); if (!tabs) return;
        let ind = tabs.querySelector(':scope > .tab-indicator');
        if (!ind) { ind = document.createElement('span'); ind.className = 'tab-indicator'; ind.setAttribute('aria-hidden', 'true'); tabs.insertBefore(ind, tabs.firstChild); }
        State.tabIndicator = ind;
    };
    window.showTab = (tabId, btn) => {
        ['resource', 'friend', 'author', 'setting', 'download'].forEach(id => {
            const el = document.getElementById(id); if (el) { el.classList.add('hide'); el.classList.remove('page-show'); }
        });
        const target = document.getElementById(tabId);
        if (target) { target.classList.remove('hide'); triggerReflow(target); target.classList.add('page-show'); }
        document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
        if (btn) { btn.classList.add('active'); moveTabIndicator(btn); }
        State.lastTabId = tabId; State.lastTabBtn = btn || null;
        window.scrollTo?.({ top: 0, behavior: 'auto' });
    };

    const initInteractionEffects = () => {
        document.addEventListener('pointerdown', e => {
            if (e.button !== undefined && e.button !== 0) return;
            const t = e.target.closest(SHINE_SELECTOR); if (!t) return;
            ensureEnhanceLayers(t); fireShineAndRipple(t, e.clientX, e.clientY);
        }, { passive: true });
        if (!CONFIG.enableHoverSpotlight) return;
        try { if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return; } catch { return; }
        document.addEventListener('pointermove', e => {
            const card = e.target.closest('.card.resource-card'); if (!card) return;
            const spot = card.querySelector(':scope > .__spotlight'); if (!spot) return;
            const r = card.getBoundingClientRect();
            spot.style.setProperty('--mx', (e.clientX - r.left - 130) + 'px');
            spot.style.setProperty('--my', (e.clientY - r.top - 130) + 'px');
        }, { passive: true });
    };
    const initHeaderParallax = () => {
        if (!CONFIG.enableHeaderParallax) return;
        const header = document.querySelector('header'); if (!header) return;
        let ticking = false;
        const update = () => {
            const y = Math.min(500, window.scrollY || 0);
            header.style.setProperty('--scroll', y + '');
            header.style.setProperty('--hdr-dx', (-y * 0.004).toFixed(3) + '%');
            header.style.setProperty('--hdr-dy', (-y * 0.008).toFixed(3) + '%');
            ticking = false;
        };
        window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
        update();
    };

    document.addEventListener('DOMContentLoaded', () => {
        const d = State.dom;
        d.list = document.getElementById('list'); d.search = document.getElementById('search'); d.breadcrumb = document.getElementById('breadcrumb');
        d.readmeBox = document.getElementById('readme'); d.downloadName = document.getElementById('downloadName');
        d.downloadIcon = document.getElementById('downloadIcon'); d.downloadReadmeBox = document.getElementById('downloadReadme');
        d.linksContainer = document.getElementById('links'); d.themeSelect = document.getElementById('themeSelect');
        d.glassSwitch = document.getElementById('glassSwitch'); d.animationSwitch = document.getElementById('animationSwitch');
        d.musicSwitch = document.getElementById('musicSwitch'); d.wechatImg = document.getElementById('wechat'); d.telegramImg = document.getElementById('telegram');
        ensureTabIndicator(); document.querySelectorAll(SHINE_SELECTOR).forEach(ensureEnhanceLayers);
        initInteractionEffects(); initTheme(); initGlass(); initAnimation(); initMusic();
        initSearch(); loadResources(); loadLinks();
        const firstTab = document.querySelector('.tabs button'); if (firstTab) showTab('resource', firstTab);
        document.querySelectorAll('.tabs button[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => { const id = btn.getAttribute('data-tab'); if (id) showTab(id, btn); });
            btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
        });
        const bk = document.querySelector('#download [data-action="back"]'); if (bk && !bk.onclick) bk.addEventListener('click', window.backResource);
        const dl = document.querySelector('#download [data-action="download"]'); if (dl && !dl.onclick) dl.addEventListener('click', window.startDownload);
        const cp = document.querySelector('#download [data-action="copy"]'); if (cp && !cp.onclick) cp.addEventListener('click', window.copyDownloadLink);
        initHeaderParallax();
        window.addEventListener('resize', debounce(() => { const a = document.querySelector('.tabs button.active'); if (a) moveTabIndicator(a); }, 120));
    });
})();
/* =========================================================
   🎵 新版音乐播放器逻辑（支持 MP3 内嵌歌词 USLT + 封面 APIC）
   追加到 script.js 末尾，不要替换原有代码！
   ========================================================= */
(function () {
  var mask = document.getElementById('mpMask');
  if (!mask) { console.warn('[MusicPlayer] mpMask not found, skip'); return; }

  var $ = function (id) { return document.getElementById(id); };
  var openBtn = $('musicSwitch');
  var closeBtn = $('mpClose');
  var loadBtn = $('mpLoadBtn');
  var playBtn = $('mpPlay');
  var playIcon = $('mpPlayIcon');
  var prevBtn = $('mpPrev');
  var nextBtn = $('mpNext');
  var bar = $('mpBar');
  var fill = $('mpFill');
  var thumb = $('mpThumb');
  var curTimeEl = $('mpCur');
  var durTimeEl = $('mpDur');
  var volSlider = $('mpVol');
  var volVal = $('mpVolVal');
  var fileInput = $('mpFile');
  var modeSeg = $('mpModeSeg');
  var modeInd = $('mpModeInd');
  var modeItems = modeSeg ? modeSeg.querySelectorAll('.mp-mode-item') : [];
  var listEl = $('mpList');
  var nameEl = $('mpName');
  var artistEl = $('mpArtist');
  var lyricScroller = $('mpLyricScroller');
  var statusEl = $('mpStatus');
  var coverEl = $('mpCover');
  var coverGlowEl = $('mpCoverGlow');

  var audio = new Audio();
  var playlist = [];
  var currentIdx = -1;
  var mode = 0;
  var lrcLines = [];
  var lrcActiveIdx = -1;

  var ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  var ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }
  function fmtSize(b) {
    if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1024 / 1024).toFixed(1) + ' MB';
  }
  function setStatus(t, type) {
    if (!statusEl) return;
    statusEl.textContent = t || '';
    statusEl.className = 'mp-status ' + (type || '');
    if (t) {
      var saved = t;
      setTimeout(function () { if (statusEl.textContent === saved) setStatus(''); }, 4500);
    }
  }

  /* ========== 打开/关闭 ========== */
  function open() { mask.classList.add('show'); moveMode(); }
  function close() { mask.classList.remove('show'); }
  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mask.classList.contains('show')) close();
  });

  /* ========== 加载 Music/list.json ========== */
  function autoLoadMusic() {
    setStatus('正在加载 Music/list.json ...');
    fetch('Music/list.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('格式错误');
        var added = 0;
        data.forEach(function (it) {
          playlist.push({
            name: it.name || (it.file || '').replace(/\.[^.]+$/, '') || '未命名',
            artist: it.artist || '来自 Music 目录',
            url: 'Music/' + (it.file || it.name),
            isLocal: false,
            // 内嵌 metadata 会在播放时用 jsmediatags 读取
            metadata: null,
            fetched: false
          });
          added++;
        });
        setStatus('✅ 已加载 ' + added + ' 首（播放时自动读取内嵌歌词/封面）', 'ok');
        renderList();
      })
      .catch(function (e) {
        setStatus('⚠️ 未找到 Music/list.json，可手动添加音乐', 'err');
      });
  }
  setTimeout(autoLoadMusic, 500);
  if (loadBtn) loadBtn.addEventListener('click', function () {
    playlist = playlist.filter(function (x) { return x.isLocal; });
    currentIdx = -1;
    renderList();
    autoLoadMusic();
  });

  /* ========== 手动导入 ========== */
  if (fileInput) fileInput.addEventListener('change', function (e) {
    var files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(function (f) {
      playlist.push({
        name: f.name.replace(/\.[^.]+$/, ''),
        artist: fmtSize(f.size),
        url: URL.createObjectURL(f),
        isLocal: true,
        file: f, // 本地文件直接读 metadata
        metadata: null,
        fetched: false
      });
    });
    fileInput.value = '';
    renderList();
    setStatus('已添加 ' + files.length + ' 首本地音乐', 'ok');
    if (currentIdx === -1) playIdx(0);
  });

  /* ========== 解析 LRC 文本 ========== */
  function parseLrc(text) {
    if (!text) return [];
    var lines = String(text).split(/\r?\n/);
    var out = [];
    var re = /\[(\d{1,3}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;
    lines.forEach(function (line) {
      var segs = [];
      var pure = line.replace(re, function (_, mm, ss, ms) {
        var t = parseInt(mm, 10) * 60 + parseInt(ss, 10) +
          (ms ? parseInt(ms, 10) / (ms.length === 3 ? 1000 : 100) : 0);
        segs.push(t);
        return '';
      }).trim();
      if (!pure) return;
      segs.forEach(function (t) { out.push({ t: t, text: pure }); });
    });
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
  }

  /* ========== 用 jsmediatags 读取 ID3（内嵌歌词/封面/标题/作者） ========== */
  function readMetadata(song) {
    return new Promise(function (resolve) {
      if (song.fetched && song.metadata) { resolve(song.metadata); return; }
      if (typeof jsmediatags === 'undefined') { resolve(null); return; }
      var src = song.isLocal ? song.file : song.url;
      try {
        jsmediatags.read(src, {
          onSuccess: function (tag) {
            song.fetched = true;
            var md = {
              title: tag.tags.title || song.name,
              artist: tag.tags.artist || song.artist,
              album: tag.tags.album || '',
              lyrics: null,
              picture: null
            };
            // USLT 内嵌歌词
            if (tag.tags.lyrics && tag.tags.lyrics.length) {
              var uslt = tag.tags.lyrics[0];
              if (uslt && uslt.lyrics) md.lyrics = uslt.lyrics;
              else if (typeof uslt === 'string') md.lyrics = uslt;
            }
            // 有些格式（FLAC/Vorbis）会以 plain 字符串放 lyrics
            if (!md.lyrics && tag.tags.LYRICS) md.lyrics = String(tag.tags.LYRICS);
            if (!md.lyrics && tag.tags.lyrics && typeof tag.tags.lyrics === 'string') md.lyrics = tag.tags.lyrics;

            // APIC 封面
            if (tag.tags.picture) {
              var p = tag.tags.picture;
              var bytes = new Uint8Array(p.data);
              var binary = '';
              for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
              md.picture = 'data:' + p.format + ';base64,' + btoa(binary);
            }
            song.metadata = md;
            resolve(md);
          },
          onError: function () { song.fetched = true; resolve(null); }
        });
      } catch (e) { resolve(null); }
    });
  }

  /* ========== 渲染歌词占位 ========== */
  function renderLrcPlaceholder(html) {
    if (!lyricScroller) return;
    lyricScroller.innerHTML =
      '<div class="mp-lyric-placeholder">' +
      (html ||
        '<div class="mp-ph-title">加载中…</div>' +
        '<div class="mp-ph-sub">正在读取音频内嵌歌词</div>') +
      '</div>';
  }
  function renderLrcToDOM() {
    if (!lrcLines.length) { renderLrcPlaceholder(); return; }
    lyricScroller.innerHTML = lrcLines.map(function (l) {
      return '<div class="mp-lyric-line" data-t="' + l.t + '">' + l.text + '</div>';
    }).join('');
  }

  /* ========== 更新歌词滚动 ========== */
  function updateLrc(cur) {
    if (!lrcLines.length || !lyricScroller) return;
    var idx = -1;
    for (var i = 0; i < lrcLines.length; i++) {
      if (cur >= lrcLines[i].t) idx = i; else break;
    }
    if (idx === lrcActiveIdx) return;
    lrcActiveIdx = idx;
    var all = lyricScroller.querySelectorAll('.mp-lyric-line');
    all.forEach(function (el, i) {
      el.classList.remove('active', 'near');
      if (i === idx) el.classList.add('active');
      else if (Math.abs(i - idx) <= 1) el.classList.add('near');
    });
    if (idx >= 0 && all[idx]) {
      var box = lyricScroller.parentElement.getBoundingClientRect();
      var lineBox = all[idx].getBoundingClientRect();
      var offset = (lineBox.top - box.top) + lineBox.height / 2 - box.height / 2;
      var prev = parseFloat(lyricScroller.dataset.offset || '0');
      var next = prev - offset;
      lyricScroller.style.transform = 'translateY(' + next + 'px)';
      lyricScroller.dataset.offset = next;
    }
  }

  /* ========== 更新封面 ========== */
  function updateCover(md, song) {
    if (!coverEl) return;
    if (md && md.picture) {
      coverEl.style.backgroundImage = 'url("' + md.picture + '")';
      coverEl.classList.add('has-pic');
      // 光晕跟随封面？只能简单用默认紫粉渐变
    } else {
      coverEl.style.backgroundImage = '';
      coverEl.classList.remove('has-pic');
    }
  }

  /* ========== 播放指定索引 ========== */
  function playIdx(i) {
    if (i < 0 || i >= playlist.length) return;
    currentIdx = i;
    var song = playlist[i];

    audio.src = song.url;
    audio.play().then(function () { setPlaying(true); }).catch(function (err) {
      setStatus('⚠️ 播放失败：' + (err.message || '浏览器阻止自动播放'), 'err');
    });

    if (nameEl) nameEl.textContent = song.name;
    if (artistEl) artistEl.textContent = song.artist || '';

    lrcLines = [];
    lrcActiveIdx = -1;
    if (lyricScroller) {
      lyricScroller.dataset.offset = '0';
      lyricScroller.style.transform = 'translateY(0)';
    }
    // 重置封面
    if (coverEl) { coverEl.style.backgroundImage = ''; }
    renderLrcPlaceholder(
      '<div class="mp-ph-title">读取元数据中…</div>' +
      '<div class="mp-ph-sub">内嵌歌词 · 封面 · 标题</div>'
    );

    // 先读 ID3 内嵌元数据（USLT 歌词 + APIC 封面 + 标题作者）
    readMetadata(song).then(function (md) {
      // 用 ID3 的标题/作者覆盖
      if (md) {
        if (md.title && nameEl) nameEl.textContent = md.title;
        if (md.artist && artistEl) artistEl.textContent = md.artist;
        updateCover(md, song);

        // 内嵌歌词优先
        if (md.lyrics) {
          var parsed = parseLrc(md.lyrics);
          if (parsed.length) {
            lrcLines = parsed;
            renderLrcToDOM();
            setStatus('✅ 已读取内嵌歌词 ' + lrcLines.length + ' 行', 'ok');
            return;
          }
          // 内嵌但非 LRC 格式（纯文本），按行显示
          lrcLines = String(md.lyrics).split(/\r?\n/)
            .filter(function (x) { return x.trim(); })
            .map(function (t, idx) { return { t: idx * 2, text: t.trim() }; });
          if (lrcLines.length) {
            renderLrcToDOM();
            setStatus('已读取纯文本内嵌歌词（将自动滚动）', 'ok');
            return;
          }
        }
      }

      // 回退：尝试同名 .lrc 文件（仅远程资源）
      if (!song.isLocal) {
        var lrcUrl = song.url.replace(/\.[^./?#]+(\?|#|$)/, '.lrc$1');
        fetch(lrcUrl).then(function (r) { if (!r.ok) throw 0; return r.text(); })
          .then(function (t) {
            lrcLines = parseLrc(t);
            if (lrcLines.length) { renderLrcToDOM(); setStatus('已读取同名 .lrc 歌词文件', 'ok'); }
            else showNoLrc(song, md);
          })
          .catch(function () { showNoLrc(song, md); });
      } else {
        showNoLrc(song, md);
      }

    });

    renderList();
  }

  function showNoLrc(song, md) {
    var n = (md && md.title) || song.name;
    var a = (md && md.artist) || song.artist || '';
    renderLrcPlaceholder(
      '<div class="mp-ph-icon" style="font-size:40px;opacity:.55;">🎧</div>' +
      '<div class="mp-ph-title">' + n + '</div>' +
      '<div class="mp-ph-sub">' + a + '<br/><span style="opacity:.6">（该歌曲未内嵌歌词）</span></div>'
    );
  }

  /* ========== 播放/暂停 ========== */
  function togglePlay() {
    if (currentIdx === -1) { if (playlist.length) playIdx(0); return; }
    if (audio.paused) audio.play().then(function () { setPlaying(true); }).catch(function () {});
    else { audio.pause(); setPlaying(false); }
  }
  function setPlaying(p) {
    if (playIcon) playIcon.innerHTML = p ? ICON_PAUSE : ICON_PLAY;
    renderList();
  }
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', function () {
    if (!playlist.length) return;
    playIdx((currentIdx - 1 + playlist.length) % playlist.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', function () { playNext(false); });

  function playNext(auto) {
    if (!playlist.length) return;
    if (mode === 1 && auto) { audio.currentTime = 0; audio.play(); return; }
    var next;
    if (mode === 2) {
      do { next = Math.floor(Math.random() * playlist.length); }
      while (next === currentIdx && playlist.length > 1);
    } else {
      next = currentIdx + 1;
      if (next >= playlist.length) {
        if (auto) { setPlaying(false); return; }
        next = 0;
      }
    }
    playIdx(next);
  }

  /* ========== audio 事件 ========== */
  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var ratio = audio.currentTime / audio.duration;
    if (fill) fill.style.width = (ratio * 100) + '%';
    if (curTimeEl) curTimeEl.textContent = fmt(audio.currentTime);
    if (bar && thumb) {
      var barW = bar.clientWidth - 12;
      thumb.style.left = (6 + ratio * barW) + 'px';
    }
    updateLrc(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', function () {
    if (durTimeEl) durTimeEl.textContent = fmt(audio.duration);
  });
  audio.addEventListener('ended', function () { playNext(true); });
  audio.addEventListener('play', function () { setPlaying(true); });
  audio.addEventListener('pause', function () { if (!audio.ended) setPlaying(false); });

  /* ========== 进度条跳转 ========== */
  if (bar) {
    function seekFromEvent(e) {
      if (!audio.duration) return;
      var rect = bar.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - 6;
      var w = rect.width - 12;
      audio.currentTime = Math.max(0, Math.min(1, x / w)) * audio.duration;
    }
    bar.addEventListener('click', seekFromEvent);
  }

  /* ========== 音量 ========== */
  if (volSlider) volSlider.addEventListener('input', function () {
    audio.volume = volSlider.value / 100;
    if (volVal) volVal.textContent = volSlider.value;
  });
  audio.volume = 0.75;

  /* ========== 播放模式 Segmented ========== */
  function moveMode() {
    if (!modeSeg || !modeInd) return;
    var active = modeSeg.querySelector('.mp-mode-item.active');
    if (!active) return;
    var segRect = modeSeg.getBoundingClientRect();
    var aRect = active.getBoundingClientRect();
    modeInd.style.width = (aRect.right - aRect.left) + 'px';
    modeInd.style.transform = 'translateX(' + (aRect.left - segRect.left) + 'px)';
  }
  modeItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeItems.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mode = parseInt(btn.dataset.mode, 10);
      moveMode();
    });
  });
  window.addEventListener('resize', moveMode);
  setTimeout(moveMode, 120);

  /* ========== 播放列表渲染 ========== */
  function renderList() {
    if (!listEl) return;
    if (!playlist.length) {
      listEl.innerHTML =
        '<div class="mp-empty">' +
          '🎵 暂无音乐<br/>' +
          '<span style="opacity:.75">从 Music 目录加载 或 选择本地文件<br/>支持读取 MP3/FLAC 内嵌歌词与封面</span>' +
        '</div>';
      return;
    }
    listEl.innerHTML = playlist.map(function (s, i) {
      var isCur = i === currentIdx;
      var playing = isCur && !audio.paused;
      return '<div class="mp-item' + (isCur ? ' current' : '') + (playing ? ' playing' : '') + '" data-idx="' + i + '">'
        + '<span class="mp-item-num">' + (i + 1) + '</span>'
        + '<span class="mp-item-eq"><span></span><span></span><span></span></span>'
        + '<div class="mp-item-meta">'
        +   '<div class="mp-item-name">' + ((s.metadata && s.metadata.title) || s.name) + '</div>'
        +   '<div class="mp-item-sub">' + ((s.metadata && s.metadata.artist) || s.artist || (s.isLocal ? '本地音乐' : 'Music 目录')) + '</div>'
        + '</div>'
        + '</div>';
    }).join('');
    listEl.querySelectorAll('.mp-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(el.dataset.idx, 10);
        if (idx === currentIdx) togglePlay();
        else playIdx(idx);
      });
    });
  }

  renderList();
})();
