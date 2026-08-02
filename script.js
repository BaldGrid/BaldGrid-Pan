// =====================
// 全局
// =====================

let list;
let search;

let data=[];

let bgAudio=new Audio();

let musicList=[];




// =====================
// 页面初始化
// =====================

document.addEventListener(
"DOMContentLoaded",
()=>{


list=document.getElementById("list");

search=document.getElementById("search");



// 加载资源

loadResources();


// 加载友情链接

loadLinks();


// 初始化主题

initTheme();


// 音乐

initMusic();



});







// =====================
// 资源系统
// =====================


function loadResources(){


fetch("./data/resources.json")


.then(r=>{


if(!r.ok)

throw Error("资源文件不存在");


return r.json();


})


.then(d=>{


data=d;

show(data);


})


.catch(e=>{


list.innerHTML=`

<div class="card">

<h2>
资源加载失败
</h2>

<p>
${e}
</p>

</div>

`;

});


}






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

</