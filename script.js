// =====================
// 全局变量
// =====================

let list;
let search;

let data=[];


// 当前目录
let folderStack=[];

let currentFolder=null;

let currentPath=[];

let downloadUrl="";

let downloadReadme="";


// =====================
// 初始化
// =====================

document.addEventListener(
"DOMContentLoaded",
()=>{


list=document.getElementById("list");

search=document.getElementById("search");


loadResources();

loadLinks();

initTheme();

initMusic();

initGlass();

initAnimation();

initSearch();



let first=document.querySelector(
".tabs button"
);


if(first){

showTab(
"resource",
first
);

}


});



// =====================
// Tab
// =====================


function showTab(tabId,btn){


[
"resource",
"friend",
"author",
"setting",
"download"
]
.forEach(id=>{


let e=document.getElementById(id);

if(e){

e.classList.add("hide");

e.classList.remove("page-show");

}


});



let target=document.getElementById(tabId);


if(target){

target.classList.remove("hide");

void target.offsetWidth;

target.classList.add("page-show");

}



document.querySelectorAll(
".tabs button"
)
.forEach(b=>{

b.classList.remove("active");

});


if(btn){

btn.classList.add("active");

}


}




// =====================
// 加载资源
// =====================


function loadResources(){


fetch(
"./data/resources.json"
)

.then(r=>r.json())

.then(json=>{


data=json;


folderStack=[];

currentFolder={
children:data,
readme:"data/rm/root.md"
};

currentPath=[];


renderFolder();


})


.catch(e=>{


console.error(e);


list.innerHTML=
`
<div class="card">
<h2>
资源加载失败
</h2>
</div>
`;


});


}




// =====================
// 渲染目录
// =====================


function renderFolder(){


    list.innerHTML="";


    // 文件夹切换动画

    list.classList.remove(
        "folder-animation"
    );


    void list.offsetWidth;


    list.classList.add(
        "folder-animation"
    );
// 第一部分 路径

let bread=document.getElementById(
"breadcrumb"
);


if(bread){

bread.innerHTML=
"🏠 首页 / "+
currentPath.join(" / ");

}




// 返回按钮

if(folderStack.length){


let back=document.createElement(
"div"
);


back.className=
"card";


back.innerHTML=
`
<h2>
⬅ 返回上一级
</h2>
`;



back.onclick=()=>{


let parent=
folderStack.pop();



if(parent){


currentFolder=parent;


}else{


currentFolder={
children:data,
readme:"data/rm/root.md"
};


}



currentPath.pop();


renderFolder();



};


list.appendChild(back);


}




// 文件列表


currentFolder.children.forEach(item=>{


let card=document.createElement(
"div"
);


card.className=
"card resource-card folder-item";



if(item.type==="folder"){


card.innerHTML=
`
<h2>
📁 ${escapeHtml(item.name)}
</h2>

<p>
${escapeHtml(item.desc||"文件夹")}
</p>
`;



card.onclick=()=>{


folderStack.push(
currentFolder
);


currentFolder=item;


currentPath.push(
item.name
);


renderFolder();


loadReadme(item);


};



}

else{


card.innerHTML=
`
<h2>
📄 ${escapeHtml(item.name)}
</h2>

<p>
${escapeHtml(item.desc||"暂无描述")}
</p>

`;



card.onclick=()=>{


openDownload(
encodeURIComponent(item.url),
encodeURIComponent(item.name),
item.icon || 0,
item.readme || ""
);


};



}



list.appendChild(card);



});



loadReadme(currentFolder);


}





// =====================
// README读取
// =====================


function loadReadme(folder){


let box=document.getElementById(
"readme"
);

box.classList.remove(
"readme-animation"
);


void box.offsetWidth;


box.classList.add(
"readme-animation"
);

if(!box)return;



if(!folder.readme){


box.innerHTML=
`
<h3>
资源介绍
</h3>

暂无介绍

`;

return;


}



fetch(folder.readme)

.then(r=>r.text())

.then(text=>{


box.innerHTML=
`
<h3>
资源介绍
</h3>

<div class="markdown">
${marked.parse(text)}
</div>
`;



})

.catch(()=>{


box.innerHTML=
`
暂无介绍
`;

});


}

// =====================
// HTML过滤
// =====================


function escapeHtml(text){


const div=document.createElement(
"div"
);


div.textContent=text||"";


return div.innerHTML;


}





// =====================
// 搜索系统
// =====================


function initSearch(){


if(!search)return;



search.addEventListener(
"input",
()=>{


let key=
search.value
.trim()
.toLowerCase();



if(!key){


currentFolder={
children:data,
readme:"data/rm/root.md"
};


folderStack=[];

currentPath=[];


renderFolder();


return;


}





let result=
searchAll(
data,
key
);



currentFolder={
children:result
};


folderStack=[];

currentPath=[];


renderFolder();



});



}





// =====================
// 递归搜索
// =====================


function searchAll(arr,key){


let result=[];



arr.forEach(item=>{


let match=


(
item.name||""
)
.toLowerCase()
.includes(key)



||



(
item.desc||""
)
.toLowerCase()
.includes(key);





if(match){


result.push(item);


}




if(
item.type==="folder"
&&
Array.isArray(item.children)
){



result.push(
...searchAll(
item.children,
key
)
);



}



});



return result;


}







// =====================
// 友情链接
// =====================


function loadLinks(){



const links=
document.getElementById(
"links"
);



if(!links)return;




fetch(
"./data/links.json"
)



.then(r=>{


if(!r.ok)
throw new Error();


return r.json();


})



.then(json=>{


links.innerHTML="";



json.forEach(item=>{


let a=document.createElement(
"a"
);



a.href=item.url;


a.target="_blank";


a.innerHTML=
escapeHtml(
item.name
);



links.appendChild(a);



});



})



.catch(()=>{


links.innerHTML=
"暂无友情链接";



});



}







// =====================
// 赞助图片
// =====================


function showDonate(){


let img=
document.getElementById(
"wechat"
);



if(!img)return;



img.classList.toggle(
"show"
);



}




// =====================
// 电报图片
// =====================


function showTelegram(){


let img=
document.getElementById(
"telegram"
);



if(!img)return;



img.classList.toggle(
"show"
);



}

// =====================
// 主题系统
// =====================


function initTheme(){


const select=
document.getElementById(
"themeSelect"
);



if(!select)return;



let theme=
localStorage.getItem(
"theme"
)
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



document.documentElement.dataset.theme=
dark
?
"dark"
:
"light";


}

else{


document.documentElement.dataset.theme=
theme;


}


}






window.matchMedia(
"(prefers-color-scheme: dark)"
)
.addEventListener(
"change",
()=>{


let select=
document.getElementById(
"themeSelect"
);


if(
select &&
select.value==="system"
){


applyTheme(
"system"
);


}



});









// =====================
// 液态玻璃
// =====================


function initGlass(){


const sw=
document.getElementById(
"glassSwitch"
);



if(!sw)return;



let enabled=
localStorage.getItem(
"glassEnabled"
);



if(enabled===null){

enabled=true;

}

else{

enabled=
enabled==="true";

}



sw.checked=enabled;



document.body.classList.toggle(
"no-glass",
!enabled
);




sw.onchange=()=>{


enabled=
sw.checked;



localStorage.setItem(
"glassEnabled",
enabled
);



document.body.classList.toggle(
"no-glass",
!enabled
);



};



}









// =====================
// 动画开关
// =====================


function initAnimation(){


const sw=
document.getElementById(
"animationSwitch"
);



if(!sw)return;



let enabled=
localStorage.getItem(
"animationEnabled"
);



if(enabled===null){

enabled=true;

}

else{

enabled=
enabled==="true";

}



sw.checked=enabled;



document.body.classList.toggle(
"no-animation",
!enabled
);





sw.onchange=()=>{


enabled=
sw.checked;



localStorage.setItem(
"animationEnabled",
enabled
);



document.body.classList.toggle(
"no-animation",
!enabled
);



};


}









// =====================
// 音乐系统
// =====================


let bgAudio=
new Audio();


let musicList=[];


let currentMusicIndex=0;


let isMusicEnabled=false;







function initMusic(){


const sw=
document.getElementById(
"musicSwitch"
);



if(!sw)return;



isMusicEnabled=
localStorage.getItem(
"musicEnabled"
)
==="true";



sw.checked=
isMusicEnabled;






fetch(
"./data/music.json"
)


.then(r=>r.json())


.then(json=>{


musicList=json;



currentMusicIndex=
Number(
localStorage.getItem(
"musicIndex"
)
||
0
);



if(isMusicEnabled){

playMusic(
currentMusicIndex
);

}



})



.catch(()=>{


musicList=[

{
name:"示例音乐",
url:
"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
}

];


});







sw.onchange=()=>{


isMusicEnabled=
sw.checked;



localStorage.setItem(
"musicEnabled",
isMusicEnabled
);



if(isMusicEnabled){


playMusic(
currentMusicIndex
);


}

else{


bgAudio.pause();


}



};







bgAudio.onended=()=>{


if(!isMusicEnabled)
return;



currentMusicIndex++;



if(
currentMusicIndex>=musicList.length
){

currentMusicIndex=0;

}



playMusic(
currentMusicIndex
);



};



}








function playMusic(index){


if(
!musicList.length
||
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
"等待用户操作播放"
);


});



localStorage.setItem(
"musicIndex",
index
);



}

// =====================
// 下载页面
// =====================


function openDownload(url,name,icon,readme){


downloadUrl=
decodeURIComponent(url);



downloadReadme=
readme || "";



document.getElementById("downloadName")
.innerHTML=
decodeURIComponent(name);



let icons=[

"🌐",
"📦",
"📁",
"📄",
"🎵",
"🎬",
"🖼️",
"📱",
"⚙️",
"🚀",
"🔥"

];



document.getElementById("downloadIcon")
.innerHTML=
icons[icon]||icons[0];



// 加载文件介绍

loadDownloadReadme(downloadReadme);


// 隐藏资源

document.getElementById("resource")
.classList.add("hide");



// 显示下载

let page=
document.getElementById("download");


page.classList.remove("hide");


void page.offsetWidth;


page.classList.add("page-show");


}


// =====================
// 下载页面 README
// =====================


function loadDownloadReadme(path){


let box=
document.getElementById(
"downloadReadme"
);



if(!box)return;



if(!path){


box.innerHTML=
`
<h3>
文件介绍
</h3>

暂无介绍

`;

return;

}



fetch(path)

.then(r=>r.text())

.then(text=>{


box.innerHTML=
`
<h3>
文件介绍
</h3>

<div class="markdown">

${marked.parse(text)}

</div>

`;



})


.catch(()=>{


box.innerHTML=
`
<h3>
文件介绍
</h3>

暂无介绍

`;



});


}






function startDownload(){


location.href=downloadUrl;


}




function copyDownloadLink(){


navigator.clipboard.writeText(downloadUrl);


alert("链接已复制");


}




function backResource(){


document.getElementById("download")
.classList.add("hide");



document.getElementById("resource")
.classList.remove("hide");



}