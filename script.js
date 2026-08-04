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

document.addEventListener("DOMContentLoaded",()=>{

    list=document.getElementById("list");
    search=document.getElementById("search");

    loadResources();
    loadLinks();
    initTheme();
    initMusic();
    initSearch();


    // 默认打开资源列表
    const firstTab=document.querySelector(".tabs button");

    if(firstTab){

        showTab("resource",firstTab);

    }else{

        showTab("resource");

    }

});




// =====================
// 页面切换 + 动画
// =====================

function showTab(tabId,btn){


    const tabs=[

        "resource",
        "friend",
        "author",
        "setting"

    ];



    // 隐藏所有页面

    tabs.forEach(id=>{


        const page=document.getElementById(id);


        if(page){

            page.classList.add("hide");

            page.classList.remove("page-show");

        }


    });



    // 显示当前页面

    const target=document.getElementById(tabId);


    if(target){


        target.classList.remove("hide");


        // 重新触发动画

        void target.offsetWidth;


        target.classList.add("page-show");


    }



    // =====================
    // 修复Tab高亮
    // =====================


    document.querySelectorAll(".tabs button")
    .forEach(button=>{


        button.classList.remove("active");


    });



    if(btn){


        btn.classList.add("active");


    }


}



// =====================
// 赞助二维码
// =====================

function showDonate(){

    const img=document.getElementById("wechat");


    if(img){

        img.classList.toggle("show");

    }

}

// =====================
// 加载资源
// =====================

function loadResources(){

    const defaultData=[

        {
            name:"MDN Web 文档",
            type:"文档",
            desc:"最权威的 Web 技术参考文档",
            url:"https://developer.mozilla.org/zh-CN/"
        },

        {
            name:"GitHub",
            type:"工具",
            desc:"全球最大的代码托管平台",
            url:"https://github.com/"
        },

        {
            name:"Stack Overflow",
            type:"社区",
            desc:"程序员问答社区",
            url:"https://stackoverflow.com/"
        },

        {
            name:"Vue.js 官方文档",
            type:"文档",
            desc:"渐进式 JavaScript 框架",
            url:"https://cn.vuejs.org/"
        },

        {
            name:"React 官方文档",
            type:"文档",
            desc:"用于构建用户界面的 JavaScript 库",
            url:"https://zh-hans.react.dev/"
        }

    ];



    fetch("./data/resources.json")

    .then(res=>{

        if(!res.ok)
            throw new Error("resources.json加载失败");

        return res.json();

    })


    .then(json=>{

        data=json;

        show(data);

    })


    .catch(err=>{

        console.warn(err.message);

        data=defaultData;

        show(data);

    });

}





// =====================
// 显示资源
// =====================

function show(arr){


    if(!list)return;


    list.innerHTML="";



    if(!arr || !arr.length){


        list.innerHTML=`

        <div class="card" style="text-align:center">

            <p>😕 没有找到资源</p>

        </div>

        `;


        return;

    }



    arr.forEach(item=>{


        let card=document.createElement("div");


        card.className="card resource-card";



        card.innerHTML=`

        <h2>${escapeHtml(item.name)}</h2>

        <span class="tag">
        ${escapeHtml(item.type || "资源")}
        </span>

        <p>
        ${escapeHtml(item.desc || "暂无描述")}
        </p>


        <a href="${escapeHtml(item.url)}"
        target="_blank">

        📎 查看资源

        </a>

        `;



        list.appendChild(card);


    });


}




// =====================
// HTML过滤
// =====================

function escapeHtml(text){

    const div=document.createElement("div");

    div.textContent=text || "";

    return div.innerHTML;

}





// =====================
// 搜索
// =====================

function initSearch(){


    if(!search)return;



    search.addEventListener("input",()=>{


        let key=
        search.value.trim().toLowerCase();



        if(!key){

            show(data);

            return;

        }



        let result=data.filter(item=>{


            return (

                (item.name||"")
                .toLowerCase()
                .includes(key)


                ||

                (item.type||"")
                .toLowerCase()
                .includes(key)


                ||

                (item.desc||"")
                .toLowerCase()
                .includes(key)

            );


        });



        show(result);


    });


}






// =====================
// 友情链接
// =====================

function loadLinks(){


    const links=
    document.getElementById("links");


    if(!links)return;



    const defaultLinks=[


        {
            name:"Google",
            url:"https://www.google.com/"
        },


        {
            name:"Bilibili",
            url:"https://www.bilibili.com/"
        },


        {
            name:"知乎",
            url:"https://www.zhihu.com/"
        }


    ];




    fetch("./data/links.json")


    .then(res=>{


        if(!res.ok)

            throw new Error("links.json加载失败");


        return res.json();


    })



    .then(json=>{


        links.innerHTML="";



        json.forEach(item=>{


            let a=document.createElement("a");


            a.href=item.url;

            a.target="_blank";

            a.innerHTML=
            escapeHtml(item.name);



            links.appendChild(a);



        });


    })



    .catch(()=>{


        links.innerHTML="";



        defaultLinks.forEach(item=>{


            let a=document.createElement("a");


            a.href=item.url;

            a.target="_blank";

            a.innerHTML=
            escapeHtml(item.name);



            links.appendChild(a);



        });


    });


}

// =====================
// 主题系统
// =====================

function initTheme(){

    const select=
    document.getElementById("themeSelect");


    if(!select)return;



    let theme=
    localStorage.getItem("theme") || "system";



    select.value=theme;


    applyTheme(theme);



    select.onchange=()=>{


        localStorage.setItem(
            "theme",
            select.value
        );


        applyTheme(select.value);


    };


}





function applyTheme(theme){


    if(theme==="system"){


        let dark=
        window.matchMedia(
        "(prefers-color-scheme:dark)"
        ).matches;



        document.documentElement.dataset.theme=
        dark ? "dark" : "light";


    }

    else{


        document.documentElement.dataset.theme=
        theme;


    }


}






// =====================
// 音乐系统
// =====================

function initMusic(){


    const sw=
    document.getElementById("musicSwitch");


    const status=
    document.getElementById("musicStatus");



    if(!sw)return;




    sw.checked=
    localStorage.getItem("musicEnabled")
    ==="true";



    isMusicEnabled=
    sw.checked;



    if(status){

        status.textContent=
        isMusicEnabled ? "开启" : "关闭";

    }






    const defaultMusic=[


        {
            name:"示例音乐1",
            url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },


        {
            name:"示例音乐2",
            url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        }


    ];





    fetch("./data/music.json")


    .then(res=>{


        if(!res.ok)

            throw new Error(
            "music.json不存在"
            );


        return res.json();


    })


    .then(json=>{


        musicList=json;


        currentMusicIndex=
        Number(
        localStorage.getItem("musicIndex")
        ||0
        );



        if(isMusicEnabled){

            playMusic(currentMusicIndex);

        }


    })



    .catch(err=>{


        console.warn(err.message);



        musicList=
        defaultMusic;



        currentMusicIndex=
        Number(
        localStorage.getItem("musicIndex")
        ||0
        );



        if(isMusicEnabled){

            playMusic(currentMusicIndex);

        }


    });







    // 音乐开关

    sw.onchange=()=>{


        isMusicEnabled=
        sw.checked;



        localStorage.setItem(
        "musicEnabled",
        isMusicEnabled
        );



        if(status){

            status.textContent=
            isMusicEnabled
            ? "开启"
            : "关闭";

        }



        if(isMusicEnabled){


            playMusic(currentMusicIndex);


        }

        else{


            bgAudio.pause();


        }


    };







    // 自动下一首

    bgAudio.onended=()=>{


        if(!isMusicEnabled)return;



        currentMusicIndex++;



        if(currentMusicIndex>=musicList.length){


            currentMusicIndex=0;


        }



        playMusic(currentMusicIndex);


    };


}







// =====================
// 播放音乐
// =====================

function playMusic(index){


    if(
        !musicList.length ||
        !musicList[index]
    )

    return;



    let song=
    musicList[index];



    bgAudio.src=
    song.url;



    bgAudio.play()
    .catch(()=>{


        console.log(
        "等待用户操作后播放"
        );


    });



    localStorage.setItem(
    "musicIndex",
    index
    );


}







// =====================
// 系统主题变化监听
// =====================

window.matchMedia(
"(prefers-color-scheme: dark)"
)
.addEventListener(
"change",
()=>{


    const select=
    document.getElementById(
    "themeSelect"
    );



    if(
        select &&
        select.value==="system"
    ){

        applyTheme("system");

    }


});