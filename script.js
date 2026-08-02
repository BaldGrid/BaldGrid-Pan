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


    showTab("resource");

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


    tabs.forEach(id=>{

        const el=document.getElementById(id);

        if(el){

            el.classList.add("hide");

            el.classList.remove("page-show");

        }

    });



    const target=document.getElementById(tabId);


    if(target){

        target.classList.remove("hide");


        //重新触发动画

        void target.offsetWidth;


        target.classList.add("page-show");

    }



    //按钮状态

    document
    .querySelectorAll(".tabs button")
    .forEach(b=>{

        b.classList.remove("active");

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


    console.error(err);


    list.innerHTML=`

<div class="card"
style="text-align:center">

<h2>
⚠️ 资源加载失败
</h2>

<p>
${err.message}
</p>

</div>

`;


});


}



// =====================
// 显示资源
// =====================


function show(arr){


    list.innerHTML="";


    if(!arr.length){


        list.innerHTML=`

<div class="card"
style="text-align:center">

<p>
😕 没有找到资源
</p>

</div>

`;

        return;

    }



    arr.forEach(item=>{


        let card=document.createElement("div");


        card.className="card resource-card";



        card.innerHTML=`

<h2>
${escapeHtml(item.name)}
</h2>


<span class="tag">

${escapeHtml(item.type||"资源")}

</span>


<p>

${escapeHtml(item.desc||"暂无描述")}

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

div.textContent=text||"";

return div.innerHTML;


}



// =====================
// 搜索
// =====================


function initSearch(){


if(!search)return;


search.addEventListener("input",()=>{


let key=
search.value
.trim()
.toLowerCase();



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


const links=document.getElementById("links");


if(!links)return;



fetch("./data/links.json")


.then(res=>res.json())


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


links.innerHTML=
"⚠️ 友链加载失败";


});


}



// =====================
// 主题
// =====================


function initTheme(){


const select=
document.getElementById("themeSelect");


if(!select)return;



let theme=
localStorage.getItem("theme")
||
"system";



select.value=theme;


applyTheme(theme);



select.onchange=()=>{


localStorage.setItem(
"theme",
select.value
);


applyTheme(
select.value
);


};


}




function applyTheme(theme){


if(theme==="system"){


let dark=
window.matchMedia(
"(prefers-color-scheme:dark)"
)
.matches;


document.documentElement
.dataset.theme=
dark?
"dark":
"light";


}

else{


document.documentElement
.dataset.theme=
theme;


}


}




// =====================
// 音乐系统
// =====================


function initMusic(){


const sw=
document.getElementById(
"musicSwitch"
);



if(!sw)return;



sw.checked=
localStorage.getItem(
"musicEnabled"
)
==="true";



isMusicEnabled=
sw.checked;




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


// 随机开始播放

currentMusicIndex =
Math.floor(
Math.random()*musicList.length
);



if(isMusicEnabled)

playMusic(
currentMusicIndex
);



})



.catch(err=>{


console.error(err);


sw.disabled=true;


sw.parentElement.innerHTML=
"⚠️ 音乐加载失败";


});





sw.onchange=()=>{


isMusicEnabled=
sw.checked;



localStorage.setItem(
"musicEnabled",
isMusicEnabled
);



if(isMusicEnabled)

playMusic(
currentMusicIndex
);


else

bgAudio.pause();



};



bgAudio.onended=()=>{


if(!isMusicEnabled || musicList.length===0)
return;


// 随机下一首

let nextIndex;


do{

nextIndex =
Math.floor(
Math.random()*musicList.length
);


}
while(
nextIndex===currentMusicIndex
&&
musicList.length>1
);



currentMusicIndex=nextIndex;


playMusic(currentMusicIndex);


};



}



//播放

function playMusic(index){


if(!musicList.length)
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