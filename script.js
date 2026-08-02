// =====================
// 全局变量
// =====================

let list;
let search;
let data = [];
let bgAudio = new Audio();
let musicList = [];
let currentMusicIndex = 0;

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
});

// =====================
// 资源加载
// =====================

function loadResources() {
    fetch("./data/resources.json")
        .then(response => {
            console.log("资源状态:", response.status);
            if (!response.ok) {
                throw new Error("resources.json 加载失败");
            }
            return response.json();
        })
        .then(json => {
            data = json;
            show(data);
        })
        .catch(error => {
            list.innerHTML = `
                <div class="card">
                    <h2>⚠️ 资源加载失败</h2>
                    <p>${error.message}</p>
                    <p style="font-size:13px;opacity:0.6;margin-top:8px;">
                        请确保 ./data/resources.json 文件存在且格式正确
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
            <div class="empty">
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
            ${item.type ? `<span class="type">${escapeHtml(item.type)}</span>` : ""}
            <p>${escapeHtml(item.desc || "暂无描述")}</p>
            <a href="${escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">
                📎 下载 / 查看
            </a>
        `;

        list.appendChild(card);
    });
}

// =====================
// HTML 转义（防 XSS）
// =====================

function escapeHtml(text) {
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
                .join(" · ");
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
    const themeBtn = document.getElementById("themeToggle");
    if (!themeBtn) return;

    // 读取保存的主题
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButton(themeBtn, savedTheme);

    themeBtn.addEventListener("click", function () {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateThemeButton(this, next);
    });
}

function updateThemeButton(btn, theme) {
    btn.textContent = theme === "light" ? "🌙 暗色" : "☀️ 亮色";
}

// =====================
// 音乐播放
// =====================

function initMusic() {
    const player = document.getElementById("musicPlayer");
    if (!player) return;

    // 读取保存的音乐索引
    const savedIndex = parseInt(localStorage.getItem("musicIndex")) || 0;

    fetch("./data/music.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("music.json 加载失败");
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("音乐列表为空");
                return;
            }

            musicList = data;
            currentMusicIndex = Math.min(savedIndex, musicList.length - 1);
            playMusic(currentMusicIndex);

            // 播放/暂停按钮
            const toggleBtn = document.getElementById("musicToggle");
            if (toggleBtn) {
                toggleBtn.addEventListener("click", function () {
                    if (bgAudio.paused) {
                        bgAudio.play();
                        this.textContent = "⏸️ 暂停";
                    } else {
                        bgAudio.pause();
                        this.textContent = "▶️ 播放";
                    }
                });
            }

            // 下一首
            const nextBtn = document.getElementById("musicNext");
            if (nextBtn) {
                nextBtn.addEventListener("click", function () {
                    if (musicList.length === 0) return;
                    currentMusicIndex = (currentMusicIndex + 1) % musicList.length;
                    playMusic(currentMusicIndex);
                });
            }

            // 上一首
            const prevBtn = document.getElementById("musicPrev");
            if (prevBtn) {
                prevBtn.addEventListener("click", function () {
                    if (musicList.length === 0) return;
                    currentMusicIndex = (currentMusicIndex - 1 + musicList.length) % musicList.length;
                    playMusic(currentMusicIndex);
                });
            }

            // 自动播放下一首
            bgAudio.addEventListener("ended", function () {
                if (musicList.length === 0) return;
                currentMusicIndex = (currentMusicIndex + 1) % musicList.length;
                playMusic(currentMusicIndex);
            });

            // 更新播放状态按钮
            bgAudio.addEventListener("play", () => {
                if (toggleBtn) toggleBtn.textContent = "⏸️ 暂停";
            });
            bgAudio.addEventListener("pause", () => {
                if (toggleBtn) toggleBtn.textContent = "▶️ 播放";
            });

            // 显示当前歌曲名
            updateMusicDisplay();

        })
        .catch(error => {
            console.error("音乐加载失败:", error);
        });
}

function playMusic(index) {
    if (!musicList || musicList.length === 0) return;

    const song = musicList[index];
    if (!song || !song.url) return;

    bgAudio.src = song.url;
    bgAudio.load();
    bgAudio.play().catch(err => {
        console.warn("自动播放被阻止:", err);
        // 用户交互后才能播放
    });

    localStorage.setItem("musicIndex", index);
    updateMusicDisplay();
}

function updateMusicDisplay() {
    const display = document.getElementById("musicNow");
    if (!display) return;

    if (musicList && musicList.length > 0 && musicList[currentMusicIndex]) {
        const song = musicList[currentMusicIndex];
        const name = song.name || "未命名";
        const artist = song.artist ? ` - ${song.artist}` : "";
        display.textContent = `🎵 ${name}${artist}`;
    } else {
        display.textContent = "🎵 无音乐";
    }
}

// =====================
// 工具函数 - 防抖
// =====================

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}