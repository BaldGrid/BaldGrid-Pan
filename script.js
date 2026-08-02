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

function showTab(id){


let tabs=[

"resource",

"friend",

"author"

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


target.classList.remove("tab-content");



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