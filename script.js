// =====================
// 全局变量
// =====================

let list;
let search;
let data = [];
let bgAudio = new Audio();
let musicList = [];
let currentMusicIndex = 0;
let isMusicEnabled = false;

// =====================
// 页面初始化
// =====================

document.addEventListener("DOMContentLoaded", () => {
    list = document.getElementById("list");
    search = document.getElementById("search");

    // 加载资源
    loadResources();

    // 加载友链
    loadLinks();

    // 初始化主题
    initTheme();

    // 初始化音乐
    initMusic();

    // 初始化搜索
    initSearch();

    // 默认显示资源列表
    showTab('resource');
});

// =====================
// Tab 切换
// =====================

function showTab(tabId) {
    const tabs = ['resource', 'friend', 'author', 'setting'];
    tabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hide');
    });

    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hide');
}

// =====================
// 赞助弹窗
// =====================

function showDonate() {
    const wechatImg = document.getElementById('wechat');
    if (wechatImg) {
        if (wechatImg.style.display === 'block') {
            wechatImg.style.display = 'none';
        } else {
            wechatImg.style.display = 'block';
        }
    }
}

// =====================
// 资源加载
// =====================

function loadResources() {
    fetch("./data/resources.json")
        .then(response => {
            console.log("资源状态:", response.status);
            if (!response.ok) {
                throw new Error("resources.json 加载失败 (状态: " + response.status + ")");
            }
            return response.json();
        })
        .then(json => {
            data = json;
            show(data);
        })
        .catch(error => {
            console.error("资源加载错误:", error);
            list.innerHTML = `
                <div class="card" style="grid-column:1/-1;text-align:center;">
                    <h2>⚠️ 资源加载失败</h2>
                    <p>${error.message}</p>
                    <p style="font-size:13px;opacity:0.6;margin-top:8px;">
                        请创建 ./data/resources.json 文件
                    </p>
                </div>
            `;
        });
}

// =====================
// 显示资源
// =====================

function show(arr) {
    list.innerHTML = "";

    if (!arr || arr.length === 0) {
        list.innerHTML = `
            <div class="card" style="grid-column:1/-1;text-align:center;padding:60px 20px;opacity:0.6;">
                <p>😕 没有找到匹配的资源</p>
            </div>
        `;
        return;
    }

    arr.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h2>${escapeHtml(item.name || "未命名")}</h2>
            ${item.type ? `<span style="display:inline-block;background:var(--blue);color:#fff;font-size:12px;padding:2px 12px;border-radius:30px;margin-bottom:10px;">${escapeHtml(item.type)}</span>` : ""}
            <p>${escapeHtml(item.desc || "暂无描述")}</p>
            <a href="${escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">
                📎 下载 / 查看
            </a>
        `;

        list.appendChild(card);
    });
}

// =====================
// HTML 转义
// =====================

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// =====================
// 搜索初始化
// =====================

function initSearch() {
    if (!search) return;

    let timer = null;

    search.addEventListener("input", function () {
        clearTimeout(timer);

        timer = setTimeout(() => {
            const key = this.value.trim().toLowerCase();

            if (!key) {
                show(data);
                return;
            }

            const filtered = data.filter(item => {
                const name = (item.name || "").toLowerCase();
                const type = (item.type || "").toLowerCase();
                const desc = (item.desc || "").toLowerCase();
                return name.includes(key) || type.includes(key) || desc.includes(key);
            });

            show(filtered);
        }, 300);
    });
}

// =====================
// 友情链接
// =====================

function loadLinks() {
    const links = document.getElementById("links");
    if (!links) return;

    fetch("./data/links.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("links.json 加载失败");
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                links.innerHTML = '<span style="opacity:0.6;">暂无友链</span>';
                return;
            }

            links.innerHTML = data
                .map(link => {
                    const name = escapeHtml(link.name || "未命名");
                    const url = escapeHtml(link.url || "#");
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`;
                })
                .join("");
        })
        .catch(error => {
            console.error("友链加载失败:", error);
            links.innerHTML = `<span style="color:#ef4444;">⚠️ 友链加载失败</span>`;
        });
}

// =====================
// 主题切换
// =====================

function initTheme() {
    const themeSelect = document.getElementById("themeSelect");
    if (!themeSelect) return;

    const savedTheme = localStorage.getItem("theme") || "system";
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener("change", function () {
        const theme = this.value;
        localStorage.setItem("theme", theme);
        applyTheme(theme);
    });

    if (window.matchMedia) {
        const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMedia.addEventListener('change', () => {
            const currentTheme = localStorage.getItem("theme") || "system";
            if (currentTheme === "system") {
                applyTheme("system");
            }
        });
    }
}

function applyTheme(theme) {
    if (theme === "system") {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
}

// =====================
// 音乐播放
// =====================

function initMusic() {
    const musicSwitch = document.getElementById("musicSwitch");
    if (!musicSwitch) return;

    const savedState = localStorage.getItem("musicEnabled") === "true";
    musicSwitch.checked = savedState;
    isMusicEnabled = savedState;

    fetch("./data/music.xml")
        .then(response => {
            if (!response.ok) {
                throw new Error("Music.xml 加载失败 (状态: " + response.status + ")");
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("音乐列表为空");
                musicSwitch.disabled = true;
                musicSwitch.parentElement.innerHTML = '⚠️ 音乐列表为空';
                return;
            }

            musicList = data;
            currentMusicIndex = 0;

            if (isMusicEnabled && musicList.length > 0) {
                playMusic(0);
            }

            musicSwitch.addEventListener("change", function () {
                isMusicEnabled = this.checked;
                localStorage.setItem("musicEnabled", isMusicEnabled);

                if (isMusicEnabled) {
                    if (musicList.length > 0) {
                        if (bgAudio.paused) {
                            playMusic(currentMusicIndex);
                        }
                    } else {
                        alert("⚠️ 音乐列表为空");
                        this.checked = false;
                        isMusicEnabled = false;
                    }
                } else {
                    bgAudio.pause();
                }
            });
        })
        .catch(error => {
            console.error("音乐加载失败:", error);
            musicSwitch.disabled = true;
            musicSwitch.parentElement.innerHTML = `⚠️ 音乐加载失败: ${error.message}`;
        });

    bgAudio.addEventListener("ended", function () {
        if (!isMusicEnabled || musicList.length === 0) return;
        currentMusicIndex = (currentMusicIndex + 1) % musicList.length;
        playMusic(currentMusicIndex);
    });
}

function playMusic(index) {
    if (!musicList || musicList.length === 0) return;
    if (index >= musicList.length) index = 0;

    const song = musicList[index];
    if (!song || !song.url) return;

    bgAudio.src = song.url;
    bgAudio.load();
    bgAudio.play().catch(err => {
        console.warn("自动播放被阻止:", err);
    });

    currentMusicIndex = index;
    localStorage.setItem("musicIndex", index);
    console.log("🎵 正在播放:", song.name || "未命名");
}