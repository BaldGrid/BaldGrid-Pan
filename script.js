let list=document.getElementById("list");
let search=document.getElementById("search");

let data=[];

fetch("data/resources.json")
.then(r=>r.json())
.then(d=>{
data=d;
show(data);
});


function show(arr){

list.innerHTML="";

arr.forEach(x=>{

list.innerHTML+=`

<div class="card">

<h2>${x.name}</h2>

<p>${x.type}</p>

<p>${x.desc}</p>

<a href="${x.url}">
下载 / 查看
</a>

</div>

`;

});

}


search.oninput=function(){

let k=this.value;

show(
data.filter(x=>
x.name.includes(k)
||
x.type.includes(k)
)
);

}


function showTab(id){

document.getElementById("resource").style.display="none";

document.getElementById("friend").style.display="none";

document.getElementById("author").style.display="none";


document.getElementById(id).style.display="block";

}



function showDonate(){

let img=document.getElementById("wechat");

img.style.display="block";

}

