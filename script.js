/* =====================
   主题变量
===================== */

:root {

    --bg:#111;

    --card:#1e1e1e;

    --box:#222;

    --text:#fff;

    --sub:#aaa;

    --blue:#0057ff;

    --border:#333;

}



[data-theme="light"]{

    --bg:#f5f5f5;

    --card:#fff;

    --box:#e8e8e8;

    --text:#111;

    --sub:#555;

    --border:#ddd;

}



[data-theme="dark"]{

    --bg:#111;

    --card:#1e1e1e;

    --box:#222;

    --text:#fff;

    --sub:#aaa;

    --border:#333;

}



/* =====================
   基础
===================== */


*{

box-sizing:border-box;

}



body{

margin:0;

font-family:
"Microsoft YaHei",
Arial,
sans-serif;


background:

var(--bg);


color:var(--text);


transition:

background .3s,
color .3s;


min-height:100vh;

}



/* =====================
   顶部
===================== */


header{


padding:

40px 20px;


text-align:center;



background:

linear-gradient(
135deg,
#222,
#0057ff
);



overflow:hidden;



}



header h1{

font-size:32px;

margin:0 0 10px;

color:white;

}



header p{

font-size:18px;

opacity:.8;

color:white;

}



/* =====================
   公告
===================== */


.notice{


margin:20px;

padding:15px;


background:

rgba(255,255,255,.08);



backdrop-filter:

blur(20px);


-webkit-backdrop-filter:

blur(20px);



border:

1px solid rgba(255,255,255,.12);



border-radius:15px;



box-shadow:

0 10px 30px rgba(0,0,0,.25);


text-align:center;

}



/* =====================
   搜索
===================== */


#search{


display:block;


width:80%;


max-width:500px;


margin:20px auto;


padding:15px 20px;


border-radius:20px;


border:

1px solid rgba(255,255,255,.15);



outline:none;



background:

rgba(255,255,255,.08);



backdrop-filter:

blur(20px);



color:var(--text);



font-size:16px;



}



#search:focus{

border-color:var(--blue);

}



#search::placeholder{

color:var(--sub);

}



/* =====================
   Tab
===================== */


.tabs{


display:flex;


margin:20px;


overflow:hidden;


border-radius:18px;



background:

rgba(255,255,255,.08);



backdrop-filter:

blur(25px);



border:

1px solid rgba(255,255,255,.12);



}



.tabs button{


flex:1;


padding:15px;


border:0;


background:transparent;


color:var(--text);


font-size:16px;


cursor:pointer;


transition:.3s;


}



.tabs button:hover,
.tabs button.active{


background:

linear-gradient(
135deg,
#0057ff,
#00c6ff
);



color:white;


}



/* 点击效果 */

.tabs button:active{

transform:scale(.92);

}



/* =====================
   页面区域
===================== */


#resource,
#friend,
#author,
#setting{


max-width:1200px;


margin:auto;


padding:

0 20px 40px;


}



/* 页面动画 */


.page-show{


animation:

pageIn .35s ease;


}



@keyframes pageIn{


from{

opacity:0;

transform:
translateY(20px);

}


to{

opacity:1;

transform:none;

}


}



/* 隐藏 */


.hide{

display:none!important;

}

/* =====================
   资源卡片
===================== */


#list{

display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(260px,1fr)
);


gap:20px;


}



/* 卡片 */


.card{


background:

rgba(255,255,255,.07);



backdrop-filter:

blur(25px);



-webkit-backdrop-filter:

blur(25px);



border:

1px solid rgba(255,255,255,.12);



border-radius:18px;



padding:20px;



box-shadow:

0 10px 35px rgba(0,0,0,.25);



transition:

.3s;


}



.card:hover{


transform:

translateY(-6px);



background:

rgba(255,255,255,.12);



box-shadow:

0 20px 50px rgba(0,87,255,.25);


}



.card h2{


margin-top:0;


font-size:20px;


}



.card p{


color:var(--sub);


line-height:1.6;


}



/* 标签 */

.tag{


display:inline-block;


background:

var(--blue);



color:white;



font-size:12px;



padding:

3px 12px;



border-radius:20px;



margin-bottom:10px;


}




/* 下载按钮 */


.card a{


display:block;


margin-top:15px;


padding:12px;



background:

var(--blue);



color:white;



text-align:center;



border-radius:12px;



text-decoration:none;



transition:.25s;



}



.card a:hover{


background:#0080ff;


}



.card a:active{


transform:scale(.95);


}



/* =====================
   友情链接
===================== */


#links{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(150px,1fr)
);


gap:15px;


}



#links a{


display:block;


padding:15px;



background:

rgba(255,255,255,.08);



backdrop-filter:

blur(20px);



-webkit-backdrop-filter:

blur(20px);



border:

1px solid rgba(255,255,255,.15);



border-radius:15px;



color:var(--text);



text-decoration:none;



text-align:center;



transition:.3s;



box-shadow:

0 8px 25px rgba(0,0,0,.2);



}



#links a:hover{


background:

var(--blue);



color:white;



transform:

translateY(-4px);



}



/* =====================
   设置
===================== */


#setting .card label{


display:flex;


align-items:center;


gap:10px;


cursor:pointer;


padding:10px 0;


}



#setting input[type="checkbox"]{


width:18px;


height:18px;


cursor:pointer;


accent-color:

var(--blue);


}



#themeSelect{


padding:

10px 15px;



border-radius:12px;



border:

1px solid var(--border);



background:

rgba(255,255,255,.08);



backdrop-filter:

blur(15px);



color:var(--text);



font-size:16px;



outline:none;


}



/* =====================
   二维码
===================== */


#wechat{


display:none;


width:220px;


margin-top:20px;


border-radius:15px;


border:

2px solid var(--border);



}



#wechat.show{


display:block;



animation:

zoom .3s ease;



}



@keyframes zoom{


from{


opacity:0;


transform:

scale(.8);


}


to{


opacity:1;


transform:

scale(1);


}


}



/* =====================
   滚动条
===================== */


::-webkit-scrollbar{


width:8px;


}



::-webkit-scrollbar-track{


background:

var(--bg);


}



::-webkit-scrollbar-thumb{


background:

var(--blue);



border-radius:10px;


}



::-webkit-scrollbar-thumb:hover{


background:#0080ff;


}



/* =====================
   手机适配
===================== */


@media(max-width:600px){


header{


padding:

30px 10px;


}



header h1{


font-size:26px;


}



.tabs button{


font-size:13px;


padding:

12px 5px;


}



#list{


grid-template-columns:

1fr;


gap:15px;


}



#search{


width:90%;


font-size:14px;


}



/* 手机底部导航效果 */


.tabs{


position:fixed;


bottom:10px;


left:10px;


right:10px;


z-index:999;



}



body{


padding-bottom:90px;


}


}