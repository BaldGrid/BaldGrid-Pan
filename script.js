let list=document.getElementById("list");
let search=document.getElementById("search");

let data=[];


// 加载资源

fetch("data/resources.json")

.then(r=>r.json())

.then(d=>{

data=d;

show(data);

});




// 显示资源

function show(arr){

list.innerHTML="";


arr.forEach(x=>{


list.innerHTML+=`

<div class="card">

<h2>${x.name}</h2>

<p>${x.type}</p>

<p>${x.desc}</p>


<a href="${x.url}" target="_blank">
下载 / 查看
</a>


</div>

`;

});


}




// 搜索

search.oninput=function(){


let k=this.value;


show(

data.filter(x=>

x.name.includes(k)

||

x.type.includes(k)

||

x.desc.includes(k)
)

);


};






// 加载友情链接

let links=document.getElementById("links");


if(links){


fetch("data/links.json")

.then(r=>r.json())

.then(d=>{


d.forEach(x=>{


links.innerHTML+=`


<div class="card">


<h2>
${x.icon} ${x.name}
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


});


}







// 页面切换动画

let tabs=[

"resource",

"friend",

"author",

"setting"

];



tabs.forEach(function(x){


let e=document.getElementById(x);



if(e.style.display=="block"){


e.classList.add("tab-out");



setTimeout(()=>{


e.style.display="none";

e.classList.remove("tab-out");


},250);



}else{


e.style.display="none";


}


});




setTimeout(()=>{


let target=document.getElementById(id);



target.style.display="block";


target.classList.add("tab-content");



setTimeout(()=>{

target.classList.add("tab-content");

},10);



},260);



}







// 微信赞助

function showDonate(){


let img=document.getElementById("wechat");



if(img.style.display=="none" || img.style.display==""){


img.style.display="block";


img.classList.add("tab-content");


}else{


img.style.display="none";


}



}

// =====================
// 背景音乐系统
// =====================


let bgAudio=new Audio();

let musicList=[];



fetch("data/music.json")

.then(r=>r.json())

.then(d=>{

musicList=d;

initMusic();

});




function initMusic(){


let sw=document.getElementById("musicSwitch");


if(!sw)
return;



let state=getCookie("music");



if(state==="on"){

sw.checked=true;

playMusic();

}else{

sw.checked=false;

}


}




function playMusic(){


if(musicList.length==0)
return;


let i=Math.floor(
Math.random()*musicList.length
);


bgAudio.src=musicList[i];

bgAudio.loop=true;

bgAudio.volume=0.3;


bgAudio.play()
.catch(()=>{

console.log("等待用户操作");

});


}




document.addEventListener(
"DOMContentLoaded",
()=>{


let sw=document.getElementById(
"musicSwitch"
);


if(!sw)
return;



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


}



});





function setCookie(name,value,days){


let d=new Date();


d.setTime(
d.getTime()+days*86400000
);



document.cookie=
name+"="+value+
";expires="+
d.toUTCString()+
";path=/";


}




function getCookie(name){


let arr=document.cookie.split(";");


for(let i of arr){


let p=i.trim().split("=");


if(p[0]==name)

return p[1];


}


return null;


}