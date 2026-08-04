// =====================
// 全局变量
// =====================

let list;

let search;


let data=[];


// 当前目录路径

let folderPath=[];



// 音乐

let bgAudio=new Audio();

let musicList=[];

let currentMusicIndex=0;

let isMusicEnabled=false;





// =====================
// 页面初始化
// =====================


document.addEventListener(
"DOMContentLoaded",
()=>{


    list=document.getElementById(
        "list"
    );


    search=document.getElementById(
        "search"
    );



    loadResources();

    loadLinks();

    initTheme();

    initMusic();

    initSearch();





    // 默认打开资源列表

    const firstTab=
    document.querySelector(
        ".tabs button"
    );



    if(firstTab){


        showTab(
            "resource",
            firstTab
        );


    }else{


        showTab(
            "resource"
        );


    }



});








// =====================
// 页面切换 + Tab高亮
// =====================


function showTab(tabId,btn){



    const tabs=[


        "resource",

        "friend",

        "author",

        "setting"


    ];





    tabs.forEach(id=>{


        const page=
        document.getElementById(id);



        if(page){


            page.classList.add(
                "hide"
            );


            page.classList.remove(
                "page-show"
            );


        }



    });






    const target=
    document.getElementById(
        tabId
    );



    if(target){



        target.classList.remove(
            "hide"
        );



        // 重新触发动画

        void target.offsetWidth;



        target.classList.add(
            "page-show"
        );



    }






    // 清除所有按钮高亮


    document
    .querySelectorAll(
        ".tabs button"
    )
    .forEach(button=>{


        button.classList.remove(
            "active"
        );


    });






    // 设置当前按钮


    if(btn){


        btn.classList.add(
            "active"
        );


    }



}









// =====================
// 赞助二维码
// =====================


function showDonate(){



    const img=
    document.getElementById(
        "wechat"
    );



    if(img){


        img.classList.toggle(
            "show"
        );


    }


}









// =====================
// 加载资源
// =====================


function loadResources(){



    fetch(
        "./data/resources.json"
    )



    .then(res=>{


        if(!res.ok){


            throw new Error(
            "resources.json加载失败"
            );


        }



        return res.json();



    })



    .then(json=>{


        data=json;


        folderPath=[];


        show(data);



    })



    .catch(err=>{


        console.warn(err);



        list.innerHTML=`

        <div class="card">


            <h2>
            资源加载失败
            </h2>


            <p>
            请检查 resources.json
            </p>


        </div>

        `;



    });



}









// =====================
// 显示资源
// 支持文件夹
// =====================


function show(arr){



    if(!list)return;



    list.innerHTML="";


    // 文件夹切换动画
    list.classList.remove("folder-animation");
    
    void list.offsetWidth;
    
    list.classList.add("folder-animation");
    





    // 返回上一级

    if(folderPath.length){



        let back=
        document.createElement(
            "div"
        );



        back.className=
        "card";



        back.innerHTML=`

        <h2>
        📂 ..
        </h2>


        <p>
        返回上一级目录
        </p>


        `;





        back.onclick=()=>{



            folderPath.pop();




            if(folderPath.length){



                show(
                    folderPath[
                    folderPath.length-1
                    ]
                );



            }else{


                show(data);


            }



        };



        list.appendChild(back);



    }









    // 渲染内容


    arr.forEach(item=>{


        let card=
        document.createElement(
            "div"
        );



        =
        "card resource-card";








        // 文件夹


        if(item.type==="folder"){



            card.innerHTML=`

            <h2>
            📁 ${escapeHtml(item.name)}
            </h2>


            <p>
            ${escapeHtml(
            item.desc || "文件夹"
            )}
            </p>


            `;



            card.onclick=()=>{


                folderPath.push(
                    item.children
                );


                show(
                    item.children
                );


            };



        }








        // 文件


        else{



            card.innerHTML=`

            <h2>
            📄 ${escapeHtml(item.name)}
            </h2>



            <span class="tag">

            ${escapeHtml(
            item.type || "资源"
            )}

            </span>



            <p>

            ${escapeHtml(
            item.desc || "暂无描述"
            )}

            </p>



            <a href="${escapeHtml(item.url)}"
            target="_blank">

            📎 查看资源

            </a>


            `;



        }





        list.appendChild(card);


        void card.offsetWidth;
        
        card.classList.add("folder-item");
        


    });



}








// =====================
// HTML过滤
// =====================


function escapeHtml(text){



    const div=
    document.createElement(
        "div"
    );



    div.textContent=
    text || "";



    return div.innerHTML;



}

// =====================
// 搜索系统
// 支持文件夹递归搜索
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


            folderPath=[];


            show(data);


            return;


        }





        let result=
        searchAll(
            data,
            key
        );



        folderPath=[];


        show(result);



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
            item.name || ""
        )
        .toLowerCase()
        .includes(key)



        ||



        (
            item.type || ""
        )
        .toLowerCase()
        .includes(key)



        ||



        (
            item.desc || ""
        )
        .toLowerCase()
        .includes(key);








        if(match){


            result.push(item);


        }







        // 搜索子文件夹


        if(
            item.type==="folder"
            &&
            item.children
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







    const defaultLinks=[



        {

            name:"Google",

            url:"https://www.google.com/"

        },



        {

            name:"Bilibili",

            url:"https://www.bilibili.com/"

        },



        {

            name:"知乎",

            url:"https://www.zhihu.com/"

        }



    ];









    fetch(
        "./data/links.json"
    )



    .then(res=>{


        if(!res.ok){


            throw new Error(
            "links.json加载失败"
            );


        }



        return res.json();



    })



    .then(json=>{



        links.innerHTML="";




        json.forEach(item=>{



            let a=
            document.createElement(
                "a"
            );



            a.href=
            item.url;



            a.target=
            "_blank";



            a.innerHTML=
            escapeHtml(
                item.name
            );



            links.appendChild(a);



        });



    })



    .catch(()=>{



        links.innerHTML="";



        defaultLinks.forEach(item=>{



            let a=
            document.createElement(
                "a"
            );



            a.href=
            item.url;



            a.target=
            "_blank";



            a.innerHTML=
            escapeHtml(
                item.name
            );



            links.appendChild(a);



        });



    });



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




    select.value=
    theme;



    applyTheme(
        theme
    );








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



    if(
        theme==="system"
    ){



        let dark=
        window
        .matchMedia(
        "(prefers-color-scheme:dark)"
        )
        .matches;



        document
        .documentElement
        .dataset
        .theme=


        dark
        ?
        "dark"
        :
        "light";



    }

    else{



        document
        .documentElement
        .dataset
        .theme=
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



    const status=
    document.getElementById(
        "musicStatus"
    );



    if(!sw)return;








    sw.checked=
    localStorage.getItem(
        "musicEnabled"
    )
    ==="true";



    isMusicEnabled=
    sw.checked;





    if(status){


        status.textContent=
        isMusicEnabled
        ?
        "开启"
        :
        "关闭";


    }









    const defaultMusic=[



        {

            name:"示例音乐1",

            url:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

        },



        {

            name:"示例音乐2",

            url:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"

        }



    ];









    fetch(
        "./data/music.json"
    )



    .then(res=>{


        if(!res.ok){


            throw new Error(
            "music.json不存在"
            );


        }



        return res.json();



    })



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



    .catch(err=>{



        console.warn(err);



        musicList=
        defaultMusic;



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



    });










    // 音乐开关


    sw.onchange=()=>{



        isMusicEnabled=
        sw.checked;




        localStorage.setItem(

            "musicEnabled",

            isMusicEnabled

        );





        if(status){



            status.textContent=
            isMusicEnabled
            ?
            "开启"
            :
            "关闭";



        }








        if(isMusicEnabled){



            playMusic(
                currentMusicIndex
            );



        }

        else{



            bgAudio.pause();



        }



    };









    // 自动播放下一首


    bgAudio.onended=()=>{



        if(!isMusicEnabled)
        return;





        currentMusicIndex++;





        if(
            currentMusicIndex
            >=
            musicList.length
        ){


            currentMusicIndex=0;


        }






        playMusic(
            currentMusicIndex
        );



    };



}











// =====================
// 播放音乐
// =====================


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
        "等待用户操作后播放"
        );



    });







    localStorage.setItem(

        "musicIndex",

        index

    );



}












// =====================
// 系统主题监听
// =====================


window.matchMedia(
"(prefers-color-scheme: dark)"
)
.addEventListener(
"change",
()=>{



    const select=
    document.getElementById(
        "themeSelect"
    );




    if(

        select

        &&

        select.value==="system"

    ){



        applyTheme(
            "system"
        );



    }




});