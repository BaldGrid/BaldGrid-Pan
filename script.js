// =====================
// 初始化
// =====================

let list;
let search;
let data = [];


// 等页面加载完成

document.addEventListener("DOMContentLoaded",()=>{


list=document.getElementById("list");

search=document.getElementById("search");


// 加载资源

loadResources();


// 加载友情链接

loadLinks();


// 初始化音乐

loadMusic();


});




// =====================
// 资源加载
// =====================

function loadResources(){


fetch("./data/resources.json")


.then(response=>{


console.log(
"resources状态:",
response.status
);


if(!response.ok){

throw new Error(
"resources.json不存在"
);

}


return response.json();


})


.then(json=>{


data=json;


show(data);


})


.catch(error=>{


list.innerHTML=`

<div class="card">

<h2>资源加载失败</h2>

<p>${error}</p>

</div>

`;


});


}





// =====================
// 显示资源
// =====================

function show(arr){


list.innerHTML="";


arr.forEach(x=>{


list.innerHTML+=`

<div class="card">


<h2>
${x.name}
</h2>


<p>
类型：${x.type}
</p>


<p>
${x.desc}
</p>


<a href="${x.url}" target="_blank">

下载 / 查看

</a>


</div>

`;


});


}





// =====================
// 搜索
// =====================

if(search){


search.oninput=function(){


let key=this.value.trim();


show(

data.filter(x=>


x.name.includes(key)

||

x.type.includes(key)

||

x.desc.includes(key)


)


);


};


}






// =====================
// 友情链接
// =====================

function loadLinks(){


let links=document.getElementById("links");


if(!links)

return;



fetch("./data/links.json")


.then(r=>r.json())


.then(json=>{


json.forEach(x=>{


links.innerHTML+=`

<div class="card">


<h2>
${x.icon || ""}
${x.name}
</h2>


<p>
${x.desc}
</p>


<a href="${x.url}" target="_blank">

访问网站

</a>


</div>

`;


});


})

.catch(()=>{


links.innerHTML="友情链接加载失败";


});


}







// =====================
// 页面切换
// =====================

function showTab(id){


let pages=[

"resource",

"friend",

"author",

"setting"

];



pages.forEach(page=>{


let el=document.getElementById(page);


if(!el)

return;



if(page===id){


el.style.display="block";

el.classList.add(
"tab-content"
);


}else{


el.style.display="none";

el.classList.remove(
"tab-content"
);


}


});


}








// =====================
// 微信赞助
// =====================

function showDonate(){


let img=document.getElementById("wechat");


if(img.style.display==="block"){


img.style.display="none";


}else{


img.style.display="block";


}


}







// =====================
// 音乐系统
// =====================

let bgAudio=new Audio();

let musicList=[];



function loadMusic(){


fetch("./data/music.json")


.then(r=>r.json())


.then(json=>{


musicList=json;


initMusic();


})

.catch(()=>{

console.log(
"音乐列表不存在"
);

});


}





function initMusic(){


let sw=document.getElementById(
"musicSwitch"
);


if(!sw)

return;



if(
getCookie("music")
==="on"
){


sw.checked=true;


playMusic();


}



sw.onchange=function(){



if(this.checked){


setCookie(
"music",
"on",
365
);


playMusic();


}else{


setCookie(
"music",
"off",
365
);


bgAudio.pause();


}



};



}





function playMusic(){


if(
musicList.length===0
)

return;



let i=Math.floor(

Math.random()
*
musicList.length

);



bgAudio.src=
musicList[i];


bgAudio.loop=true;


bgAudio.volume=0.3;



bgAudio.play()

.catch(()=>{


console.log(
"浏览器禁止自动播放"
);


});


}







// =====================
// Cookie
// =====================

function setCookie(
name,
value,
days
){


let date=new Date();


date.setTime(

date.getTime()
+
days*86400000

);



document.cookie=

name+"="+value+

";expires="+
date.toUTCString()
+
";path=/";


}






function getCookie(name){


let cookies=
document.cookie.split(";");



for(let c of cookies){


let p=c.trim().split("=");



if(p[0]===name)

return p[1];


}



return null;


}