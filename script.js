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


target.classList.add("tab-content");


},260);


}




function showDonate(){

let img=document.getElementById("wechat");


if(img.style.display=="none" || img.style.display==""){

img.style.display="block";

img.classList.add("tab-content");

}else{

img.style.display="none";

}


}


