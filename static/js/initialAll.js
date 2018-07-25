/*
 * File:        intialAll.js
 * Description: implement all initialize, loading, startTask, global data define
 * Author:      swallow
 */

const language_code = {"af":"Afrikaans",
"ar":"Arabic",
"az":"Azerbaijani",
"bg":"Bulgarian",
"ca":"Catalan",
"cs":"Czech",
"cy":"Welsh",
"da":"Dansih",
"de":"German",
"el":"Greek",
"en":"English",
"eo":"Esperanto",
"es":"Spanish",
"et":"Estonian",
"eu":"Basque",
"fa":"Persian",
"fi":"Finnish",
"fo":"Faroese",
"fr":"French",
"gl":"Galician",
"gu":"Gujarati",
"he":"Hebrew",
"hi":"Hindi",
"hr":"Croatian",
"hu":"Hungarian",
"hy":"Armenian",
"id":"Indonesian",
"is":"Icelandic",
"it":"Italian",
"ja":"Japanese",
"ka":"Georgian",
"kk":"Kazakh",
"kn":"Kannada",
"ko":"Korean",
"ky":"Kyrgyz",
"lt":"Luxembourgish",
"lv":"Latvian",
"mi":"Maori",
"mk":"Macedonian",
"mn":"Mongolian",
"mr":"Marathi",
"ms":"Malay",
"mt":"Malti",
"nb":"Norwegian Bokmål",
"nl":"Dutch",
"nn":"Norwegian Nynorsk",
"pa":"Panjabi",
"pl":"Polish",
"pt":"Portuguese",
"qu":"Quechua",
"ro":"Romanian",
"ru":"Russian",
"sa":"Sanskrit",
"se":"Northern Sami",
"sk":"Slovak",
"sl":"Slovenian",
"sq":"Albanian",
"sr":"Serbian",
"sv":"Swedish",
"sw":"Swahili",
"ta":"Tamil",
"te":"Telugu",
"th":"Thai",
"tl":"Tagalog",
"tn":"Tswana",
"tr":"Turkish",
"ts":"Tsonga",
"tt":"Tatar",
"uk":"Ukrainian",
"ur":"Urdu",
"uz":"Uzbek",
"vi":"Vietnamese",
"xh":"Xhosa",
"zh":"Chinese",
"zu":"Zulu"};


let g_current_language = 'en';
let file_selected = false;

let g_all_language_list = {}; // all language kinds in DB
let g_all_vb_list = {}; // all vocabulary books in DB

let g_allwords_freeSearch_list = {};
let g_allwords_sort_list = [];


let g_import_history_list = {};
let g_vb_entry_id_list = {};
let g_vb_allwords_list = new Array();

let g_translatedList = new Array();

let g_temp_saved_entry_list = new Array();
let g_temp_vb_mistake_list = new Array();

let g_current_vb_id = -1;
let g_exdays = 0;

let g_my_ip_addr = null;
let g_user_id = null;

function myloading() {
     var c_proc_id =  $("#id_procid").val();

     $.ajax({
         url: '/ajax/get_languageList/',
         data: {
           'proc_id': c_proc_id
         },
         dataType: 'json',
         success: function (data) {
             var g_all_language_list = data.result_list;
             var task_status = data.task_status;

             initialLeftMenuItem(g_all_language_list);

             //console.log(c_proc_id);
             if (c_proc_id == "") { //waiting status
                 window.location.replace("/dictionary/#id_import");
             }else{
                 window.location.replace("/dictionary/#id_progressbar");
                 showProgressbar(c_proc_id);
             }
         }
      });

    g_user_id = getCookie("username");

    refreshVBList(c_proc_id);

    $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
        console.log(JSON.stringify(data, null, 2));

        $("#id_ip_address").val(data['ip']);
        $("#id_user").val('');
        g_my_ip_addr = data['ip'];

        $("#id_city").val(data['city']);
        $("#id_region").val(data['region_name']);
        $("#id_country").val(data['country_name']);
        $("#id_latitude").val(data['latitude']);
        $("#id_longitude").val(data['longitude']);
        $("#id_timezone").val(data['time_zone']);
    });


    //var view_proc_id = {{proc_id}};
    //console.log(view_proc_id);
    //var slot_ids = JSON.parse("{{proc_id}}");

}

function initialLeftMenuItem(list) {
    var row = list.length
     if(row<=0 || isNaN(row) ){
        return;
     }
     for(var x=0;x<row;x++){
        if (language_code[list[x][0]] == undefined) {
            console.log("no this language code : " +  language_code[lang_code]);
        }
        else{
            LiNode=document.createElement("LI");//获得对象
            var liNode_id = "ml_vb_";
            var lang_code = list[x][0];
            var liNode_class = "leftmenu_li";

            liNode_id = liNode_id.concat(lang_code);
            LiNode.setAttribute("id",liNode_id);
            LiNode.setAttribute("title", lang_code);
            LiNode.setAttribute("class", liNode_class);
            document.getElementById("id_language_item").appendChild(LiNode);

            ahref_Node=document.createElement("a");//获得对象
            var href_mark = "#id_one";
            var href_node_id = "id_";
            var href_class = "leftmenu_item";
            href_node_id= href_node_id.concat(lang_code);
            ahref_Node.setAttribute("id",href_node_id);

            ahref_Node.setAttribute("href",href_mark);
            ahref_Node.setAttribute("value",lang_code);
            ahref_Node.setAttribute("class",href_class);
            ahref_Node.innerHTML = language_code[lang_code];

            document.getElementById(liNode_id).appendChild(ahref_Node);
            console.log(href_node_id + language_code[lang_code]);

            document.getElementById(href_node_id).onclick=function(){
                if (g_vb_allwords_list.length == 0) { // first time to get vb allwords data
                    refreshCurrentVBData();
                }
                //console.log(this.getAttribute("id"));
                g_current_language = this.getAttribute("value");
                clearCurrentPageContent();

                var current_language_title = "Information of "
                current_language_title = current_language_title.concat(language_code[g_current_language]);
                document.getElementById("id_language_subtitle").innerHTML = current_language_title;

                load_languageData("id_result",PAGE_NAME_ONE_LANGUAGE);
                //load_vbData("id_result", PAGE_NAME_ONE_LANGUAGE);
            };

        }
     }
}

function refreshVBList(c_proc_id){
     $.ajax({
         url: '/ajax/get_vbList/',
         data: {
           'proc_id': c_proc_id,
           'user_name': g_user_id,
         },
         dataType: 'json',
         success: function (data) {
             g_all_vb_list = data.result_list;
             initialVBMenuItem(g_all_vb_list);
             setVBListOption();
             //refreshVBwordsTable(-1);
         }
      });
}

function initialVBMenuItem(list) {
     let parentNode = document.getElementById("id_vb_item");
     if (parentNode == null) {
        return;
     }

     do{
         if (parentNode.hasChildNodes()) {
             parentNode.removeChild(parentNode.firstChild);
         }
     }while(parentNode.hasChildNodes());

     var row = list.length;
     if(row<=0 || isNaN(row) ){
        return;
     }

     for(var x=0;x<row;x++){
        let LiNode=document.createElement("LI");
        let liNode_id = "ml_";
        let vbName = list[x][1];
        let liNode_class = "leftmenu_li";

        liNode_id = liNode_id.concat(vbName);
        //g_current_vb_list.push(vbName);

        let vbIndexName = "'" + list[x][0] + "'";
        //g_vb_dictionary.push({vbIndexName,vbName});

        LiNode.setAttribute("id",liNode_id);
        LiNode.setAttribute("title", vbName);
        LiNode.setAttribute("class", liNode_class);
        document.getElementById("id_vb_item").appendChild(LiNode);


        let ahref_Node=document.createElement("a");//获得对象
        let href_mark = "#id_vb_one";
        let href_node_id = "id_";
        let href_class = "leftmenu_item";
        href_node_id= href_node_id.concat(vbName);
        ahref_Node.setAttribute("id",href_node_id);

        ahref_Node.setAttribute("href",href_mark);
        ahref_Node.setAttribute("value",vbName);
        ahref_Node.setAttribute("class",href_class);
        ahref_Node.setAttribute("name", list[x][0]);
        ahref_Node.innerHTML = "<span class='glyphicon glyphicon-book'></span> " + vbName;

        document.getElementById(liNode_id).appendChild(ahref_Node);

        ahref_Node.onclick=function(){
            clearCurrentPageContent();
            let vbName = event.srcElement.innerHTML;
            var currentTitle = "Vocabulary book:  "
            currentTitle = currentTitle.concat(vbName);
            document.getElementById("id_vb_list_title").innerHTML = currentTitle;
            g_current_vb_id = event.srcElement.getAttribute("name");
            refreshVBwordsTable(id_vb_one, PAGE_NAME_ONE_VB);

            let descNode = document.getElementById("id_vb_desc_one");
            descNode.innerHTML = getVocaublarBookDesc(vbName);
        };

        setVBMistakeInfo(list[x][0], LiNode, vbName);
     }

     g_current_vb_id = list[0][0];

}

function setVBMistakeInfo(vbID, LiParentNode, vbName)
{

    if ((vbName == "") || (LiParentNode == null)) {
        vbName = getVocaublarBookName(vbID);

        var liNode_mistake_id = "ml_vb_mistake";
        liNode_mistake_id = liNode_mistake_id.concat(vbName);

        let liMistakeNode = document.getElementById(liNode_mistake_id);
        if (liMistakeNode != null){
            return;
        }

        let liNode_id = "ml_";
        liNode_id = liNode_id.concat(vbName);
        LiParentNode = document.getElementById(liNode_id);
    }

    $.ajax({
     url: '/ajax/get_vbMistakeRecord/',
     data: {
       'vb_id': vbID
     },
     dataType: 'json',
     success: function (data) {
        let ulNode = document.createElement("UL");
        let LiNode=document.createElement("LI");
        let rtn = data.vb_mistake_list;
        if (rtn.length > 0){
            var liNode_id = "ml_vb_mistake";
            liNode_id = liNode_id.concat(vbName);//String(parseInt(vbID)));
            LiNode.setAttribute("id",liNode_id);
            LiNode.setAttribute("class", "leftmenu_li");

            let ahref_Node=document.createElement("a");//获得对象

            let href_node_id = "id_mistake_";
            href_node_id= href_node_id.concat(String(parseInt(vbID)));
            ahref_Node.setAttribute("id",href_node_id);

            ahref_Node.setAttribute("href","#id_vb_one");
            ahref_Node.setAttribute("value","mistake book");

            ahref_Node.setAttribute("class","leftmenu_item");
            ahref_Node.innerHTML = " <span class='glyphicon glyphicon-tag'></span>  Mistake book";
            ahref_Node.setAttribute("name", vbID);
            ahref_Node.onclick=function(){

                clearCurrentPageContent();
                //let vbName = event.srcElement.innerHTML;
                var currentTitle = "Mistake book of ";
                currentTitle=currentTitle.concat(vbName);
                document.getElementById("id_vb_list_title").innerHTML = currentTitle;
                g_current_vb_id = event.srcElement.getAttribute("name");
                refreshVBMistakeRecords();
            }

            LiNode.appendChild(ahref_Node);
            ulNode.appendChild(LiNode);
            LiParentNode.appendChild(ulNode);
        }
     }
    });
}



function setCurrentLanguage(){
    g_current_language = "all";
}
