// =====================
// 全局变量
// =====================

let list;
let search;

let data = [];

let bgAudio = new Audio();

let musicList = [];




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


// 加载友链

loadLinks();


// 初始化主题

initTheme();


// 初始化音乐

initMusic();


}

);






// =====================
// 资源加载
// =====================


function loadResources(){


fetch("./data/resources.json")


.then(response=>{


console.log(
"资源状态:",
response.status
);



if(!response.ok){

throw new Error(
"resources.json 加载失败"
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

<h2>
资源加载失败
</h2>


<p>
${error.message}
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


arr.forEach(x=>{


list.innerHTML+=`

<div class="card">


<h2>

${x.name}

</h2>



<p>

${x.type}

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


let links=document.getElementById(
"links"
);



if(!links)

return;




fetch("./data/links.json")


.then(r=>r.json())