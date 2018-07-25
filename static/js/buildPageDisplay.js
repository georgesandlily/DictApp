/*
 * File:        buildPageDisplay.js
 * Description: build web page element after data changed
 * Author:      swallow
 */
let g_max_display_rows = 15;
let g_table_cursor = 0;

let g_current_row = null;
let g_last_row = null;
let g_current_page = 0;

let g_sort_id_flag  = -1;
let g_sort_entry_flag  = -1;
let g_sort_updatedate_flag  = -1;
let g_sort_interpre_flag  = -1;
let g_sort_langcode_flag  = -1;


const DO_NEXT = 1;
const DO_PREV = 2;
const DO_REFRESH_PAGE = 3;

const TAB_IMPORT = 1;
const TAB_ALLWORDS = 2;
const TAB_VB = 3;

const PAGE_NAME_INVALID = -1;
const PAGE_NAME_ALL_LANGUAGES = 0;
const PAGE_NAME_ONE_LANGUAGE = 1;
const PAGE_NAME_FREE_SEARCH = 2;
const PAGE_NAME_ONE_VB = 3;
const PAGE_NAME_APPEND = 4;
const PAGE_NAME_ONE_VB_MISTAKE = 5;

const ENTRY_INSERT = 0;
const ENTRY_UPDATE = 1;

const VB_INSERT = 0;
const VB_DELETE = 1;

const TABLE_TITLE_ROWS = "Total entries rows: ";

const TABLE_TITLE_Page_0 = "  |       Page: [";
const TABLE_TITLE_Page_1 = "/";
const TABLE_TITLE_Page_2 = "]  ";

const ENTRY_EDIT = 0;
const VB_EDIT = 1;

const APPEND_IN_VB = 0;
const DELETE_IN_VB = 1;

const ORDER_BY_ID = 0;
const ORDER_BY_ENTRY = 1;
const ORDER_BY_UPDATEDATE = 2;
const ORDER_BY_LANGCODE =3;
const ORDER_BY_INTERPRE = 4;

const SORT_ID_FLAG_ASCEND = 0;
const SORT_ID_FLAG_DESCEND = 1;

const SORT_ENTRY_FLAG_ASCEND = 0;
const SORT_ENTRY_FLAG_DESCEND = 1;

const SORT_UPDATEDATE_FLAG_ASCEND = 0;
const SORT_UPDATEDATE_FLAG_DESCEND = 1;

const SORT_LANGCODE_FLAG_ASCEND = 0;
const SORT_LANGCODE_FLAG_DESCEND = 1;

const SORT_INTERPRE_FLAG_ASCEND = 0;
const SORT_INTERPRE_FLAG_DESCEND = 1;


function clearTable(addNode_Name){
     var tablename = addNode_Name;
     tablename = tablename.concat("_table");

    var parentNode =document.getElementById(addNode_Name);
    if (parentNode.tagName == "P") {
        while(parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
        }
    }
}

function clearCurrentPageContent(){
     clearTable('id_result');
     clearTable('id_result_all');
     clearTable('id_result_freesearch');
     clearTable('id_one_vb_result');
     clearTable('id_result_append');

     let tipNode = document.getElementById("id_tip");
     if (tipNode != null) {
         let parentNode = tipNode.parentNode;
         if (parentNode != null) {
            parentNode.removeChild(tipNode);
         }
     }
}


function createImportInfoTable(addNodeName, pageName) {
    var totalRows = g_import_history_list.length;

    //alert(row);
    if(totalRows <=0 || isNaN(totalRows) ){
        show_message(addNodeName);
        return;
    }

    var tableNode;
    tableNode=document.createElement("table");//获得对象

    var tableID = addNodeName;
    tableID = tableID.concat("_table");
    tableNode.setAttribute("id", tableID);

    var ulID = "id_ul_";
    ulID = ulID.concat(addNodeName);
    var ulNode = document.getElementById(ulID);
    if (ulNode == null) {
        ulNode = document.createElement("ul");
        document.getElementById(addNodeName).appendChild(ulNode);
        ulNode.setAttribute("id",ulID);
    }

    var prevNode = document.createElement("id_prev");
    prevNode = document.createElement("a");
    prevNode.setAttribute("id", "id_prev");

    if (pageName == PAGE_NAME_ALL_LANGUAGES) {
        prevNode.setAttribute("href", "#id_all");
    }

    if (pageName == PAGE_NAME_ONE_LANGUAGE) {
        prevNode.setAttribute("href", "#id_one");
    }

    prevNode.setAttribute("class", "page_downup");
    prevNode.innerHTML = "⇦Prev";

    prevNode.onclick=function(){
        let curNode=event.srcElement.parentElement;
        if (curNode.tagName == 'UL') {
            let tableNode = document.getElementById("id_result_all_table");

            refresh_table("id_result_all_table", DO_PREV, TAB_IMPORT);
        }
    };

    prevNode.setAttribute("hidden", true);

    var nextNode=document.createElement("A");
    nextNode.setAttribute("id", "id_next");

    if (pageName == PAGE_NAME_ALL_LANGUAGES) {
        nextNode.setAttribute("href", "#id_all");
    }

    if (pageName == PAGE_NAME_ONE_LANGUAGE) {
        nextNode.setAttribute("href", "#id_one");
    }

    nextNode.setAttribute("class", "page_downup");
    nextNode.innerHTML = "Next⇨";
    nextNode.onclick=function(){
        let curNode=event.srcElement.parentElement;
        if (curNode.tagName == 'UL') {
            let tableNode = document.getElementById("id_result_all_table");

            refresh_table("id_result_all_table", DO_NEXT, TAB_IMPORT);
        }
    };

    nextNode.setAttribute("hidden", true);


    var pageInfoNode = document.createElement("p");
    pageInfoNode.setAttribute("id", "id_pageinfo");
    pageInfoNode.setAttribute("class", "pageinfo_text");

    var pageInfoStr = TABLE_TITLE_ROWS;
    pageInfoStr = pageInfoStr.concat(String(totalRows));
    pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_0);

    var totalPageNum = get_page_display_number(totalRows, g_max_display_rows);

    pageInfoStr = pageInfoStr.concat(" 1");
    pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_1);
    pageInfoStr = pageInfoStr.concat(totalPageNum);
    pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_2);

    pageInfoNode.innerHTML = pageInfoStr;

    ulNode.appendChild(pageInfoNode);
    ulNode.appendChild(prevNode);
    ulNode.appendChild(nextNode);

    //alert(row);
    if (totalRows >= g_max_display_rows) {
        nextNode.removeAttribute("hidden");
    }

    var trNode=tableNode.insertRow();
    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Language file";
    var tdNode=trNode.insertCell();
    tdNode.innerHTML="ip address";
    var tdNode=trNode.insertCell();
    tdNode.innerHTML="region_name";
    var tdNode=trNode.insertCell();
    tdNode.innerHTML="new created item";
    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Date";

     for(var x=0;x<totalRows;x++){
        if (x < g_max_display_rows) {
            var trNode=tableNode.insertRow();
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=g_import_history_list[x][1];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=g_import_history_list[x][4];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=g_import_history_list[x][6];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=g_import_history_list[x][2];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=g_import_history_list[x][11];
         }
         else{
            break;
         }
     }

    document.getElementById(addNodeName).appendChild(tableNode);

    var tipNode = document.createElement("p");
    tipNode.setAttribute("id", "id_tip");
    tipNode.setAttribute("class", "page_message");

    document.getElementById(addNodeName).appendChild(tipNode);

    g_table_cursor = x;
    g_current_page = 1;
}

function createAllwordsTable(addNodeName, pageName) {
    let list = {};

    switch(pageName){
        case PAGE_NAME_FREE_SEARCH:
        case PAGE_NAME_ONE_LANGUAGE:
        case PAGE_NAME_APPEND:
            list = g_allwords_freeSearch_list;
            break;
        case PAGE_NAME_ONE_VB:
        case PAGE_NAME_ONE_VB_MISTAKE:
            list = g_vb_allwords_list;
            break;
    }

    list = g_allwords_sort_list;

    let rows = list.length;
    if(rows<=0 || isNaN(rows)){
        show_message(addNodeName, "No data found");
        return;
    }

    var tableNode;
    tableNode=document.createElement("table");//获得对象

    var tableID = addNodeName;
    tableID = tableID.concat("_table");
    tableNode.setAttribute("id", tableID);
    //tableNode.onmouseover = function() {
    //    get_row(this);
    //};

    tableNode.onclick = function() {
        select_row(this);
    };

    tableNode.ondblclick = function() {
        show_modal_form(this);
    };

    tableNode.onmouseout = function() {
        //backrow(this);
    };

    var ulID = "id_ul_";
    ulID = ulID.concat(addNodeName);
    var ulNode = document.getElementById(ulID);
    if (ulNode == null) {
        ulNode = document.createElement("ul");
        document.getElementById(addNodeName).appendChild(ulNode);
        ulNode.setAttribute("id", ulID);
        ulNode.setAttribute("class", "page_ul")
    }

    // prev node
    var prevNode = document.createElement("id_prev");
    prevNode = document.createElement("a");
    prevNode.setAttribute("id", "id_prev");
    prevNode.setAttribute("class", "page_downup");
    prevNode.innerHTML = "⇦Prev";

    switch (pageName) {
        case PAGE_NAME_ONE_LANGUAGE:
            prevNode.setAttribute("href", "#id_one");
            prevNode.onclick=function(){
                refresh_table(tableID, DO_PREV, TAB_ALLWORDS);
            };
            break;
        case PAGE_NAME_FREE_SEARCH:
            prevNode.setAttribute("href", "#id_freesearch");
            prevNode.onclick=function(){
                refresh_table(tableID, DO_PREV, TAB_ALLWORDS);
            };
            break;
        case PAGE_NAME_ONE_VB:
        case PAGE_NAME_ONE_VB_MISTAKE:
            prevNode.setAttribute("href", "#id_vb_one");
            prevNode.onclick=function(){
                refresh_table(tableID, DO_PREV, TAB_VB);
            };
            break;
        case PAGE_NAME_APPEND:
            prevNode.setAttribute("href", "#id_result_append");
            prevNode.onclick=function(){
                refresh_table(tableID, DO_PREV, TAB_ALLWORDS);
            };
            break;
    }
    prevNode.setAttribute("hidden", true);
    //document.getElementById(addNodeName).appendChild(prevNode);

    // next node
    var nextNode=document.createElement("A");
    nextNode.setAttribute("id", "id_next");
    nextNode.setAttribute("class", "page_downup");
    nextNode.innerHTML = "Next⇨";

    switch(pageName) {
        case PAGE_NAME_ONE_LANGUAGE:
            nextNode.setAttribute("href", "#id_one");
            nextNode.onclick=function(){
               refresh_table(tableID, DO_NEXT, TAB_ALLWORDS);
            };
            break;
        case PAGE_NAME_FREE_SEARCH:
            nextNode.setAttribute("href", "#id_freesearch");
            nextNode.onclick=function(){
               refresh_table(tableID, DO_NEXT, TAB_ALLWORDS);
            };

            break;
        case PAGE_NAME_ONE_VB:
        case PAGE_NAME_ONE_VB_MISTAKE:
            nextNode.setAttribute("href", "#id_vb_one");
            nextNode.onclick=function(){
               refresh_table(tableID, DO_NEXT, TAB_VB);
            };
            break;
        case PAGE_NAME_APPEND:
            nextNode.setAttribute("href", "#id_result_append");
            nextNode.onclick=function(){
                refresh_table(tableID, DO_PREV, TAB_ALLWORDS);
            };
            break;
    }

    //alert(row);
    if (rows >= g_max_display_rows) {
        nextNode.removeAttribute("hidden");
    }else{
        nextNode.setAttribute("hidden", true);
    }

    //document.getElementById(addNodeName).appendChild(nextNode);

    // page information display
    var pageInfoNode = document.createElement("p");
    pageInfoNode.setAttribute("id", "id_pageinfo");
    pageInfoNode.setAttribute("class", "pageinfo");

    var pageInfoStr = TABLE_TITLE_ROWS;
    pageInfoStr = pageInfoStr.concat(String(rows));
    pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_0);

    var totalPageNum = get_page_display_number(rows, g_max_display_rows);

    pageInfoStr = pageInfoStr.concat(" 1");
    pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_1);
    pageInfoStr = pageInfoStr.concat(totalPageNum);
    pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_2);

    pageInfoNode.innerHTML = pageInfoStr;

    let searchPageNode = document.createElement("input");
    searchPageNode.setAttribute("id","id_page_search");
    searchPageNode.setAttribute("type", "search");
    searchPageNode.setAttribute("maxlength", 30);
    searchPageNode.setAttribute("placeholder", "input page no");
    searchPageNode.setAttribute("class", "pageinfo");

    switch(pageName) {
        case PAGE_NAME_ONE_LANGUAGE:
        case PAGE_NAME_FREE_SEARCH:
        case PAGE_NAME_APPEND:
            searchPageNode.onsearch=function(){
                let txtPageNo = $('#id_page_search').val();
                let pageNo = Number(txtPageNo);
                if (Number.isNaN(pageNo) == false) {
                    g_current_page = pageNo;
                    refresh_page(tableID, pageNo, TAB_ALLWORDS);
                }
            }
            break;
        case PAGE_NAME_ONE_VB:
        case PAGE_NAME_ONE_VB_MISTAKE:
            searchPageNode.onsearch=function(){
                let txtPageNo = $('#id_page_search').val();
                let pageNo = Number(txtPageNo);

                if (Number.isNaN(pageNo) == false) {
                    g_current_page = pageNo;
                    refresh_page(tableID, pageNo, TAB_VB);
                }
            }
            break;
    }

    ulNode.appendChild(pageInfoNode);
    ulNode.appendChild(searchPageNode);

    ulNode.appendChild(document.createElement("br"));
    ulNode.appendChild(document.createElement("br"));

    ulNode.appendChild(prevNode);
    ulNode.appendChild(nextNode);

    // translate page
    var translateNode=document.createElement("A");
    translateNode.setAttribute("id", "id_translate");
    switch (pageName) {
        case PAGE_NAME_ONE_LANGUAGE:
            translateNode.setAttribute("href", "#id_one");
            translateNode.onclick=function(){
               translate_page(tableID, PAGE_NAME_ONE_LANGUAGE);
            };
            break;
        case PAGE_NAME_FREE_SEARCH:
            translateNode.setAttribute("href", "#id_freesearch");
            translateNode.onclick=function(){
               translate_page(tableID, PAGE_NAME_FREE_SEARCH);
            };
            break;
        case PAGE_NAME_ONE_VB:
        case PAGE_NAME_ONE_VB_MISTAKE:
            translateNode.setAttribute("href", "#id_vb_one");
            translateNode.onclick=function(){
               translate_page(tableID, PAGE_NAME_ONE_VB);
            };
            break;
        case PAGE_NAME_APPEND:
            translateNode.setAttribute("href", "#id_result_append");
            translateNode.onclick=function(){
               translate_page(tableID, PAGE_NAME_APPEND);
            };
    }

    translateNode.setAttribute("class","page_translate")
    translateNode.innerHTML = "translate this page";

    ulNode.appendChild(translateNode);

    let ulVBID = "id_ul_vb_";
    ulVBID = ulVBID.concat(addNodeName);
    var ulVBNode = document.getElementById(ulVBID);
    if (ulVBNode == null) {
        ulVBNode = document.createElement("ul");
        document.getElementById(addNodeName).appendChild(ulVBNode);
        ulVBNode.setAttribute("id", ulVBID);
        ulVBNode.setAttribute("class", "page_ul")
    }

    if ((pageName != PAGE_NAME_ONE_VB) &&(pageName != PAGE_NAME_ONE_VB_MISTAKE)) {
        var insertNode=document.createElement("A");
        insertNode.setAttribute("id", "id_insertNewEntry");
        if (pageName == PAGE_NAME_ONE_LANGUAGE) {
            insertNode.setAttribute("href", "#id_one");
        }

        if (pageName == PAGE_NAME_FREE_SEARCH) {
            insertNode.setAttribute("href", "#id_freesearch");
        }

        if (pageName == PAGE_NAME_APPEND) {
            insertNode.setAttribute("href", "#id_result_append");
        }

        insertNode.setAttribute("class","page_translate")
        insertNode.innerHTML = "append new entry";

        insertNode.onclick=function(){
            //let pNode = event.srcElement.parent;
            show_modal_insert_form(this);
        };

        ulNode.appendChild(insertNode);

        let hrNode = document.createElement("hr");
        ulNode.appendChild(hrNode);

        let lableNode = document.createElement("label");
        lableNode.innerHTML = "Choose current vocabulary book:   ";

        ulVBNode.appendChild(lableNode);

        // vb select list
        let vbSelectNode = document.createElement("select");
        vbSelectNode.setAttribute("id","id_vb_select");
        vbSelectNode.setAttribute("class", "btn btn-default");


        vbSelectNode.onclick = function() {
            if (g_all_vb_list.length ==0 ){
                return;
            }
            g_current_vb_id = g_all_vb_list[event.srcElement.selectedIndex][0];
            refreshVBwordsTable(tableID, PAGE_NAME_INVALID);

        }

        ulVBNode.appendChild(vbSelectNode);
        setVBListOption();
   }

    // save to current vb
    var appendVBNode=document.createElement("A");
    appendVBNode.setAttribute("id", "id_appendToVB");
    appendVBNode.setAttribute("style", "cursor:pointer");
    if (pageName == PAGE_NAME_ONE_LANGUAGE) {
        appendVBNode.setAttribute("href", "#id_one");
    }

    if (pageName == PAGE_NAME_FREE_SEARCH) {
        appendVBNode.setAttribute("href", "#id_freesearch");
    }

    appendVBNode.setAttribute("class","page_downup");
    if (pageName == PAGE_NAME_ONE_VB_MISTAKE) {
        appendVBNode.innerHTML = "Remove vocabulary from mistake book";

        appendVBNode.onclick=function(){
           saveVBMistakeData();
        };
    }else{
        appendVBNode.innerHTML = "Update entries to vocabulary books";

        appendVBNode.onclick=function(){
           saveVBData();

        };
    }

    ulVBNode.appendChild(appendVBNode);

    // review current vb
    if ((pageName == PAGE_NAME_ONE_VB) || (pageName == PAGE_NAME_ONE_VB_MISTAKE)){
        var reviseVBNode=document.createElement("A");
        reviseVBNode.setAttribute("id", "id_reviseVB");
        reviseVBNode.setAttribute("href", "#id_vb_one");
        reviseVBNode.innerHTML = "Begin to revise";
        reviseVBNode.onclick=function(){
            reviseVBWord(pageName);
        }

        ulVBNode.appendChild(reviseVBNode);
    }

    var trNode=tableNode.insertRow();
    trNode.style.background="#D3D3D3";
    var tdNode=trNode.insertCell();
    tdNode.innerHTML="String ID ";
    g_sort_id_flag = SORT_ID_FLAG_ASCEND;

    var iconNode = document.createElement("span");
    iconNode.setAttribute("class","glyphicon glyphicon glyphicon-sort");
    iconNode.setAttribute("style", "cursor:pointer");

    iconNode.onclick = function() {
        sort_allwords(ORDER_BY_ID, pageName);
        switch(pageName) {
            case PAGE_NAME_ONE_LANGUAGE:
            case PAGE_NAME_FREE_SEARCH:
            case PAGE_NAME_APPEND:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_ALLWORDS);
                break;
            case PAGE_NAME_ONE_VB:
            case PAGE_NAME_ONE_VB_MISTAKE:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_VB);
                break;
        }
    };
    tdNode.appendChild(iconNode);

    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Entry ";
    g_sort_entry_flag = SORT_ENTRY_FLAG_ASCEND;

    var iconNode = document.createElement("span");
    iconNode.setAttribute("class","glyphicon glyphicon glyphicon-sort");
    iconNode.setAttribute("style", "cursor:pointer");

    iconNode.onclick = function() {
        sort_allwords(ORDER_BY_ENTRY,pageName);
        switch(pageName) {
            case PAGE_NAME_ONE_LANGUAGE:
            case PAGE_NAME_FREE_SEARCH:
            case PAGE_NAME_APPEND:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_ALLWORDS);
                break;
            case PAGE_NAME_ONE_VB:
            case PAGE_NAME_ONE_VB_MISTAKE:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_VB);
                break;
        }
    };
    tdNode.appendChild(iconNode);

    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Interpretation ";
    g_sort_interpre_flag = SORT_INTERPRE_FLAG_ASCEND;

    var iconNode = document.createElement("span");
    iconNode.setAttribute("class","glyphicon glyphicon glyphicon-sort");
    iconNode.setAttribute("style", "cursor:pointer");
    iconNode.onclick = function() {
        sort_allwords(ORDER_BY_INTERPRE,pageName);
        switch(pageName) {
            case PAGE_NAME_ONE_LANGUAGE:
            case PAGE_NAME_FREE_SEARCH:
            case PAGE_NAME_APPEND:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_ALLWORDS);
                break;
            case PAGE_NAME_ONE_VB:
            case PAGE_NAME_ONE_VB_MISTAKE:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_VB);
                break;
        }
    };

    tdNode.appendChild(iconNode);

    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Language code ";
    g_sort_langcode_flag = SORT_LANGCODE_FLAG_ASCEND;

    var iconNode = document.createElement("span");
    iconNode.setAttribute("class","glyphicon glyphicon glyphicon-sort");
    iconNode.setAttribute("style", "cursor:pointer");
    iconNode.onclick = function() {
        sort_allwords(ORDER_BY_LANGCODE, pageName);
        switch(pageName) {
            case PAGE_NAME_ONE_LANGUAGE:
            case PAGE_NAME_FREE_SEARCH:
            case PAGE_NAME_APPEND:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_ALLWORDS);
                break;
            case PAGE_NAME_ONE_VB:
            case PAGE_NAME_ONE_VB_MISTAKE:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_VB);
                break;
        }
    };
    tdNode.appendChild(iconNode);

    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Update date ";
    g_sort_updatedate_flag = SORT_UPDATEDATE_FLAG_ASCEND;

    var iconNode = document.createElement("span");
    iconNode.setAttribute("class","glyphicon glyphicon glyphicon-sort");
    iconNode.setAttribute("style", "cursor:pointer");
    iconNode.onclick = function() {
        sort_allwords(ORDER_BY_UPDATEDATE,pageName);
        switch(pageName) {
            case PAGE_NAME_ONE_LANGUAGE:
            case PAGE_NAME_FREE_SEARCH:
            case PAGE_NAME_APPEND:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_ALLWORDS);
                break;
            case PAGE_NAME_ONE_VB:
            case PAGE_NAME_ONE_VB_MISTAKE:
                refresh_table(tableID, DO_REFRESH_PAGE, TAB_VB);
                break;
        }
    };
    tdNode.appendChild(iconNode);

    var tdNode=trNode.insertCell();
    tdNode.innerHTML="Selected in VB";

    let x = 0;
     for(x=0;x<rows;x++){
        if (x < g_max_display_rows) {
            var trNode=tableNode.insertRow();
            var tdNode=trNode.insertCell();
            //tdNode.innerHTML=list[x][0];
            tdNode.innerHTML = g_allwords_sort_list[x]["id_entry"];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=list[x][1];
            tdNode.innerHTML = g_allwords_sort_list[x]["entry"];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=list[x][2];
            tdNode.innerHTML = g_allwords_sort_list[x]["interpre"];
            var tdNode=trNode.insertCell();
            tdNode.innerHTML=list[x][3];
            tdNode.innerHTML = g_allwords_sort_list[x]["lang_code"];

            insertTextAudioPlayHtml(tdNode);

            var tdNode=trNode.insertCell();
            tdNode.innerHTML=list[x][4];
            tdNode.innerHTML = g_allwords_sort_list[x]["update_date"];

            var tdNode=trNode.insertCell();
            var checkBoxNode = document.createElement("input");
            checkBoxNode.setAttribute("type","checkbox");
            checkBoxNode.setAttribute("class", "roundedTwo");

            if ((pageName == PAGE_NAME_ONE_VB) || (pageName == PAGE_NAME_ONE_VB_MISTAKE)) {
                checkBoxNode.checked = true;
            }else {
                if (isExistedInEntryList(list[x][0], g_current_vb_id) == true){
                    checkBoxNode.checked = true;
                }else{
                    checkBoxNode.checked = false;
                }
            }

            checkBoxNode.onclick = function() {
                let trNode = event.srcElement.parentNode.parentNode;
                if (trNode.tagName == 'TR') {
                    let entryID = trNode.cells[0].innerHTML;

                    if (pageName == PAGE_NAME_ONE_VB_MISTAKE) {
                        if( event.srcElement.checked == false ) {
                            saveVBMistakeTempArray(entryID, g_current_vb_id, DELETE_IN_VB);
                        }else{
                            saveVBMistakeTempArray(entryID, g_current_vb_id, APPEND_IN_VB);
                        }

                    }else{

                        if( event.srcElement.checked == false ) {
                            saveVBOpeInTempArray(entryID, g_current_vb_id, DELETE_IN_VB);
                        }else{
                            saveVBOpeInTempArray(entryID, g_current_vb_id, APPEND_IN_VB);
                        }
                    }

                }
            }
            tdNode.appendChild(checkBoxNode);
        }
        else{
            break;
        }
    }

    document.getElementById(addNodeName).appendChild(tableNode);

    g_table_cursor = x;

    g_current_page = 1;

    var tipNode = document.createElement("p");
    tipNode.setAttribute("id", "id_tip");
    tipNode.setAttribute("class", "page_message");

    document.getElementById(addNodeName).appendChild(tipNode);

    let audioNode = document.createElement("audio");
    audioNode.setAttribute("id","id_audio");

    document.getElementById(addNodeName).appendChild(audioNode);
}


function show_message(addNodeName, messageContent){
    var messageNode =document.getElementById("id_show_message");
    if (messageNode != null){
         messageNode.innerHTML =  messageContent;
    }else{
         messageNode=document.createElement("p");//获得对象
         messageNode.setAttribute("id","id_show_message");
         messageNode.setAttribute("class","page_message");
         messageNode.innerHTML =  messageContent;
         document.getElementById(addNodeName).appendChild(messageNode);
    }
}


function refresh_table(tableNode, actionFlag, type){

    switch(actionFlag) {
        case DO_NEXT:
            g_current_page += 1;
            break;
        case DO_PREV:
            g_current_page -= 1;
            break;
    }

    console.log(g_current_page);

    refresh_page(tableNode, g_current_page, type);

    return;
}

function insertTextAudioPlayHtml(tdNode) {
    let languageCode = tdNode.innerText;
    if (languageCode == 'en') {
        let audioUKPlayNode = document.createElement("button");
        audioUKPlayNode.setAttribute("class", "btn btn-default");
        audioUKPlayNode.setAttribute("type", "button");
        audioUKPlayNode.innerText = "uk";

        audioUKPlayNode.onclick=function() {
            let curNode=event.srcElement.parentElement;

            if (curNode.tagName == 'BUTTON') {
                tdNode = curNode.parentNode;
            }
            else{
                tdNode = curNode;
            }

            if (tdNode.tagName == 'TD') {
                let languageCode = tdNode.innerText;
                let trNode = tdNode.parentNode;
                let sourceText = trNode.cells[1].innerHTML;
                let stringID = trNode.cells[0].innerHTML;
                play_text_audio(stringID, sourceText, "uk");
            }else {
                $("#id_tip").html("<span style='color:blue'>Document error</span>");
            }
        }
        let spanUKNode = document.createElement("span");
        spanUKNode.setAttribute("class", "glyphicon glyphicon-play");

        audioUKPlayNode.appendChild(spanUKNode);
        tdNode.appendChild(audioUKPlayNode);

        let audioUSPlayNode = document.createElement("button");
        audioUSPlayNode.setAttribute("class", "btn btn-default");
        audioUSPlayNode.setAttribute("type", "button");
        audioUSPlayNode.innerText = "us";

        audioUSPlayNode.onclick=function() {
            let curNode=event.srcElement.parentElement;

            if (curNode.tagName == 'BUTTON') {
                tdNode = curNode.parentNode;
            }
            else{
                tdNode = curNode;
            }

            if (tdNode.tagName == 'TD') {
                let languageCode = tdNode.innerText;
                let trNode = tdNode.parentNode;
                let sourceText = trNode.cells[1].innerHTML;
                let stringID = trNode.cells[0].innerHTML;
                play_text_audio(stringID, sourceText, "us");
            }else {
                $("#id_tip").html("<span style='color:blue'>Document error</span>");
            }
        }
        let spanUSNode = document.createElement("span");
        spanUSNode.setAttribute("class", "glyphicon glyphicon-play");

        audioUSPlayNode.appendChild(spanUSNode);
        tdNode.appendChild(audioUSPlayNode);

    }else{
        let audioPlayNode = document.createElement("button");
        audioPlayNode.setAttribute("class", "btn btn-default");
        audioPlayNode.setAttribute("type", "button");

        audioPlayNode.onclick=function() {
            let curNode=event.srcElement.parentElement;

            if (curNode.tagName == 'BUTTON') {
                tdNode = curNode.parentNode;
            }
            else{
                tdNode = curNode;
            }

            if (tdNode.tagName == 'TD') {
                let languageCode = tdNode.innerText;
                let trNode = tdNode.parentNode;
                let sourceText = trNode.cells[1].innerHTML;
                let stringID = trNode.cells[0].innerHTML;
                play_text_audio(stringID, sourceText, languageCode);
                console.log(sourceText + '  ' + languageCode);
            }else {
                $("#id_tip").html("<span style='color:blue'>Document error</span>");
            }
        }

        tdNode.appendChild(audioPlayNode);

        let spanNode = document.createElement("span");
        spanNode.setAttribute("class", "glyphicon glyphicon-play");

        audioPlayNode.appendChild(spanNode);
    }
}



function isAlreadyExisted(element, index, array, entryID) {
    if (element[0] == entryID){
        console.log("callback");
    }
}

function get_page_display_number(totalRows, pageRows) {
    var pageDisplayNumber;
    if (totalRows % pageRows == 0 ) {
        pageDisplayNumber = String(parseInt(totalRows / pageRows));
    }else {
        pageDisplayNumber = String(parseInt(totalRows / pageRows + 1));
    }
    return pageDisplayNumber;
}

function get_row(obj) {
    if(event.srcElement.tagName=="TD"){
        curRow=event.srcElement.parentElement;
        if (curRow.rowIndex != 0) {
            curRow.style.background="yellow";
        }
    }
}

function select_row(obj) {
    if(event.srcElement.tagName=="TD"){
        curRow=event.srcElement.parentElement;
        if (curRow.rowIndex != 0) {
            backrow();
            curRow.style.background="#87CEFA";
            g_last_row = curRow;
        }
    }
}

function backrow(){
    if (g_last_row != null) {
        if (g_last_row.rowIndex % 2 == 0 ){
            g_last_row.style.background="#fff";
        }else {
            g_last_row.style.background="#F5FAFA";
        }
    }
}

function show_modal_form(obj) {
    if(event.srcElement.tagName=="TD"){
        curRow=event.srcElement.parentElement;
        if (curRow.rowIndex != 0) {
            g_current_row = curRow;
            $("#id_entry").val(curRow.cells[1].innerHTML);

            $("#id_stringId").val(curRow.cells[0].innerHTML);

            $("#id_interpretation").val(curRow.cells[2].innerHTML);

            $("#id_languageID_edit").val(curRow.cells[3].innerText);

            g_current_language = curRow.cells[3].innerText;

            let playNode = document.getElementById("id_Playtext");
            playNode.onclick=function(){
                let txtStringID = $('#id_stringId').val();
                let txtEntry = $('#id_entry').val();
                let txtLanguageID = $('#id_languageID_edit').val();

                play_text_audio(txtStringID, txtEntry, txtLanguageID);

            }

            $('#myModal').modal();
            $('#myModal').on('shown.bs.modal', function () {
                $("#id_entry").focus();
            })
        }
    }

}

function show_modal_insert_form(obj) {
    $("#id_new_entry").val('');
    $("#id_new_langCode").val('');
    $("#id_new_interpretation").val('');

    $('#myModal_ins').modal();
    $('#myModal_ins').on('shown.bs.modal', function () {
        $("#id_new_entry").focus();
    })
}

function show_modal_login_form(obj) {
    if (g_user_id == "") {
        $("#id_user_name").val('');
        $("#id_user_password").val('');

        $('#myModal_login').modal();
        $('#myModal_login').on('shown.bs.modal', function () {
            $("#id_user_name").focus();
        })
    }

}


function refresh_translateInfo(tableID, stringID, sourceText, translatedText, type) {
    var tableNode=document.getElementById(tableID);
    if (tableNode == null) {
        return;
    }

    //let list = new Array();
    //switch (type) {
    //   case PAGE_NAME_ONE_VB:
    //       list = g_vb_allwords_list;
    //        break;
    //    case PAGE_NAME_ONE_LANGUAGE:
    //    case PAGE_NAME_FREE_SEARCH:
    //        list = g_allwords_freeSearch_list;
    //        break;
    //}

    //list = g_allwords_sort_list;

    $.ajax({
        url: '/ajax/set_allwordsData/',
        data: {
            'entry_content': sourceText,
            'string_id': stringID,
            'interpretation': translatedText,
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#tip").html("<span style='color:blue'>正在处理...</span>");
            return true;
        },
        success: function (data) {
            result = data.result;
            var currentPageRows = tableNode.rows.length - 1;

            for(var x=0;x<currentPageRows ;x++){
                if(tableNode.rows[x+1].cells[0].innerHTML == stringID) {
                    tableNode.rows[x+1].cells[2].innerHTML = result[0][2];
                    tableNode.rows[x+1].cells[4].innerHTML = result[0][4];

                    //list[(g_current_page -1) * g_max_display_rows + x][2] = result[0][2];
                    //list[(g_current_page -1) * g_max_display_rows + x][4] = result[0][4];
                    g_allwords_sort_list[(g_current_page -1) * g_max_display_rows + x]["interpre"] = result[0][2];
                    g_allwords_sort_list[(g_current_page -1) * g_max_display_rows + x]["update_date"] = result[0][4];

                    break;
                }
            }
            $("#id_tip").html("<span style='color:blue'>Translating finished...</span>");
        },
    });
}

function refreshTableSelectedStatus(nodeName, pageMode) {
    let tableNode = document.getElementById(nodeName);
    if (tableNode == null) {
        return;
    }

    let tablerows = tableNode.rows.length;
    for(let x = 1; x < tablerows; x++){
        let tdNode=tableNode.rows[x].cells[5];
        let entryID = parseInt(tableNode.rows[x].cells[0].innerHTML);
        let checkBoxNode = tdNode.firstChild;
        if (isExistedInEntryList(entryID,g_current_vb_id) == true){
            checkBoxNode.checked = true;
        }else{
            checkBoxNode.checked = false;
        }
    }
}

function refresh_menuitem(languageID) {
    var menuItemNode = document.getElementById("id_language_item");

    if (menuItemNode == null){
        return;
    }

    //for(var x = 0; x < g_current_language_list.length; x++) {
    //    if (g_current_language_list[x] == languageID) {
    //        return;
    //    }
    //}

    ahref_Node=document.createElement("a");//获得对象
    var href_mark = "#id_one";
    var href_node_id = "id_";
    var href_class = "leftmenu_item";
    href_node_id= href_node_id.concat(languageID);
    ahref_Node.setAttribute("id",href_node_id);

    ahref_Node.setAttribute("href",href_mark);
    ahref_Node.setAttribute("value",languageID);
    ahref_Node.setAttribute("class",href_class);
    ahref_Node.innerHTML = language_code[languageID];

    ahref_Node.onclick=function(){
        g_current_language = this.getAttribute("value");
        clearCurrentPageContent();

        var current_language_title = "Information of "
        current_language_title = current_language_title.concat(language_code[g_current_language]);
        document.getElementById("id_language_subtitle").innerHTML = current_language_title;
    };

    menuItemNode.appendChild(ahref_Node);
}

function refresh_VB_menuitem(mode, vbID, vbName) {
    var menuItemNode = document.getElementById("id_vb_item");

    if (menuItemNode == null){
        return;
    }

    ahref_Node=document.createElement("a");//获得对象
    var href_mark = "#id_vb_one";
    var href_node_id = "id_";
    var href_class = "leftmenu_item";
    href_node_id= href_node_id.concat(vbID);
    ahref_Node.setAttribute("id",href_node_id);

    ahref_Node.setAttribute("href",href_mark);
    ahref_Node.setAttribute("value",vbName);
    ahref_Node.setAttribute("class",href_class);
    ahref_Node.innerHTML = vbName;

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

    menuItemNode.appendChild(ahref_Node);
}


function refresh_page(tableID, pageNo, type) {
    let tableNode = document.getElementById(tableID);
    if (tableNode == null) {
        return;
    }

    var prevNode = document.getElementById("id_prev");
    if (prevNode == null) {
        return;
    }

    var nextNode = document.getElementById("id_next");
    if (nextNode == null) {
        return;
    }

    backrow();

    var parentNode =tableNode.parentNode;
    if (parentNode == null) {
        return;
    }

    let list = {};
    switch(type) {
        case TAB_VB :
        case TAB_ALLWORDS :
            list = g_allwords_sort_list;
            break;
        case TAB_IMPORT :
            list = g_import_history_list;
            break;
    }

    var startListIndex = (pageNo-1)*g_max_display_rows;
    var currentPageRows = tableNode.rows.length - 1;
    var remainDataListLength = list.length - startListIndex;

    if (remainDataListLength > g_max_display_rows) {
        if (currentPageRows < g_max_display_rows) {
            for (var j=0; j< g_max_display_rows-currentPageRows; j++) {
                var trNode=tableNode.insertRow();
                var tdNode=trNode.insertCell(); // string ID
                var tdNode=trNode.insertCell(); // entry
                var tdNode=trNode.insertCell(); // interpretation
                var tdNode=trNode.insertCell(); // language code
                var tdNode=trNode.insertCell(); // update date

                var tdNode=trNode.insertCell(); // selected in vb
                var checkBoxNode = document.createElement("input");
                checkBoxNode.setAttribute("type","checkbox");
                checkBoxNode.setAttribute("class", "roundedTwo");

                checkBoxNode.onclick = function() {
                    let trNode = event.srcElement.parentNode.parentNode;
                    if (trNode.tagName == 'TR') {
                        let entryID = trNode.cells[0].innerHTML;

                        if( event.srcElement.checked == false ) {
                            saveVBOpeInTempArray(entryID, g_current_vb_id, DELETE_IN_VB);
                        }else{
                            saveVBOpeInTempArray(entryID, g_current_vb_id, APPEND_IN_VB);
                        }
                    }
                }
                tdNode.appendChild(checkBoxNode);

                tableNode.appendChild(trNode);
            }
        }
        for(var x=0; x < g_max_display_rows; x++){
            if (type != TAB_IMPORT) {
                //tableNode.rows[x+1].cells[0].innerHTML = list[startListIndex + x][0];
                //tableNode.rows[x+1].cells[1].innerHTML = list[startListIndex + x][1];
                //tableNode.rows[x+1].cells[2].innerHTML = list[startListIndex + x][2];
                //tableNode.rows[x+1].cells[3].innerHTML = list[startListIndex + x][3];
                tableNode.rows[x+1].cells[0].innerHTML = g_allwords_sort_list[startListIndex + x]["id_entry"];
                tableNode.rows[x+1].cells[1].innerHTML = g_allwords_sort_list[startListIndex + x]["entry"];
                tableNode.rows[x+1].cells[2].innerHTML = g_allwords_sort_list[startListIndex + x]["interpre"];
                tableNode.rows[x+1].cells[3].innerHTML = g_allwords_sort_list[startListIndex + x]["lang_code"];
                insertTextAudioPlayHtml(tableNode.rows[x+1].cells[3]);
                //tableNode.rows[x+1].cells[4].innerHTML = list[startListIndex + x][4];
                tableNode.rows[x+1].cells[4].innerHTML = g_allwords_sort_list[startListIndex + x]["update_date"];

                let checkBoxNode = tableNode.rows[x+1].cells[5].firstChild;
                if (checkBoxNode != null){
                    if (type == TAB_VB) {
                        checkBoxNode.checked = true;
                    }else {
                        if (isExistedInEntryList(list[startListIndex + x][0], g_current_vb_id) == true){
                            checkBoxNode.checked = true;
                        }else{
                            checkBoxNode.checked = false;
                       }
                    }
                }

            }else{
                tableNode.rows[x+1].cells[0].innerHTML = list[startListIndex + x][1];
                tableNode.rows[x+1].cells[1].innerHTML = list[startListIndex + x][4];
                tableNode.rows[x+1].cells[2].innerHTML = list[startListIndex + x][6];
                tableNode.rows[x+1].cells[3].innerHTML = list[startListIndex + x][2];
                tableNode.rows[x+1].cells[4].innerHTML = list[startListIndex + x][11];
            }

        }
        nextNode.removeAttribute("hidden");
        g_table_cursor = startListIndex + x;
    }
    else{
        if (currentPageRows < remainDataListLength) {
            for (var j=0; j< remainDataListLength-currentPageRows; j++) {
                var trNode=tableNode.insertRow();
                var tdNode=trNode.insertCell(); // string ID
                var tdNode=trNode.insertCell(); // entry
                var tdNode=trNode.insertCell(); // interpretation
                var tdNode=trNode.insertCell(); // language code
                var tdNode=trNode.insertCell(); // update date

                var tdNode=trNode.insertCell(); // selected in vb
                var checkBoxNode = document.createElement("input");
                checkBoxNode.setAttribute("type","checkbox");
                checkBoxNode.setAttribute("class", "roundedTwo");
                checkBoxNode.onclick = function() {
                    let trNode = event.srcElement.parentNode.parentNode;
                    if (trNode.tagName == 'TR') {
                        let entryID = trNode.cells[0].innerHTML;

                        if( event.srcElement.checked == false ) {
                            saveVBOpeInTempArray(entryID, g_current_vb_id, DELETE_IN_VB);
                        }else{
                            saveVBOpeInTempArray(entryID, g_current_vb_id, APPEND_IN_VB);
                        }
                    }
                }
                tdNode.appendChild(checkBoxNode);

                tableNode.appendChild(trNode);
            }
        }
        else{
            for (var y = currentPageRows; y > remainDataListLength; y--) {
                tableNode.deleteRow(y);
            }
        }
        for(var x=0;x< remainDataListLength ;x++){
            if (type != TAB_IMPORT) {
                //tableNode.rows[x+1].cells[0].innerHTML = list[startListIndex + x][0];
                //tableNode.rows[x+1].cells[1].innerHTML = list[startListIndex + x][1];
                //tableNode.rows[x+1].cells[2].innerHTML = list[startListIndex + x][2];
                //tableNode.rows[x+1].cells[3].innerHTML = list[startListIndex + x][3];
                tableNode.rows[x+1].cells[0].innerHTML = g_allwords_sort_list[startListIndex + x]["id_entry"];
                tableNode.rows[x+1].cells[1].innerHTML = g_allwords_sort_list[startListIndex + x]["entry"];
                tableNode.rows[x+1].cells[2].innerHTML = g_allwords_sort_list[startListIndex + x]["interpre"];
                tableNode.rows[x+1].cells[3].innerHTML = g_allwords_sort_list[startListIndex + x]["lang_code"];
                insertTextAudioPlayHtml(tableNode.rows[x+1].cells[3]);

                //tableNode.rows[x+1].cells[4].innerHTML = list[startListIndex + x][4];
                tableNode.rows[x+1].cells[4].innerHTML = g_allwords_sort_list[startListIndex + x]["update_date"];

                let checkBoxNode = tableNode.rows[x+1].cells[5].firstChild;
                if (checkBoxNode != null){
                    if (type == TAB_VB) {
                        checkBoxNode.checked = true;
                    }else {
                        if (isExistedInEntryList(list[startListIndex + x][0],g_current_vb_id) == true){
                            checkBoxNode.checked = true;
                        }else{
                            checkBoxNode.checked = false;
                        }
                    }
                }
            }else{
                tableNode.rows[x+1].cells[0].innerHTML = list[startListIndex + x][1];
                tableNode.rows[x+1].cells[1].innerHTML = list[startListIndex + x][4];
                tableNode.rows[x+1].cells[2].innerHTML = list[startListIndex + x][6];
                tableNode.rows[x+1].cells[3].innerHTML = list[startListIndex + x][2];
                tableNode.rows[x+1].cells[4].innerHTML = list[startListIndex + x][11];
            }
        }
        nextNode.setAttribute("hidden",true);
        g_table_cursor = startListIndex + x;
    }

    if (startListIndex >= g_max_display_rows) {
        prevNode.removeAttribute("hidden");
    }else{
        prevNode.setAttribute("hidden",true);
    }

    var pageInfoNode = document.getElementById("id_pageinfo");
    if (pageInfoNode != null) {
        var pageInfoStr = TABLE_TITLE_ROWS;
        pageInfoStr = pageInfoStr.concat(String(list.length));
        pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_0);

        var totalPageNum = get_page_display_number(list.length, g_max_display_rows);

        pageInfoStr = pageInfoStr.concat(String(parseInt(pageNo)));
        pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_1);
        pageInfoStr = pageInfoStr.concat(totalPageNum);
        pageInfoStr = pageInfoStr.concat(TABLE_TITLE_Page_2);

        pageInfoNode.innerHTML = pageInfoStr;
    }

}


function reviseVBWord(pageName)
{
    clearCurrentPageContent();
    let parentNode = document.getElementById("id_one_vb_result");
    if (parentNode == null) {
        return;
    }

    let bookLength = g_allwords_sort_list.length;

    let randomIndex = Math.floor(Math.random()*bookLength);
    let word = g_allwords_sort_list[randomIndex]["interpre"];
    let keyString = g_allwords_sort_list[randomIndex]["entry"];
    let stringID = g_allwords_sort_list[randomIndex]["id_entry"];
    let languageCode = g_allwords_sort_list[randomIndex]["lang_code"];

    let ulNode = document.createElement("UL");
    ulNode.setAttribute("id", "id_ul_revise");

    let questionNode = document.createElement("label");
    questionNode.setAttribute("ID", "id_question_string");
    questionNode.setAttribute("class", "revise_question");

    questionNode.innerHTML = word;
    ulNode.appendChild(questionNode);

    let audioNode = document.createElement("audio");
    audioNode.setAttribute("id", "id_audio");
    play_text_audio(stringID, keyString, languageCode);

    ulNode.appendChild(audioNode);

    let playImageNode = document.createElement("image");
    playImageNode.setAttribute("class", "glyphicon glyphicon-play-circle");
    playImageNode.setAttribute("style", "cursor:pointer");

    playImageNode.onclick=function(){
        let indexNode = document.getElementById("id_index_string");

        randomIndex = parseInt(indexNode.getAttribute("value"));

        let keyString = g_allwords_sort_list[randomIndex]["entry"];
        let stringID = g_allwords_sort_list[randomIndex]["id_entry"];
        let languageCode = g_allwords_sort_list[randomIndex]["lang_code"];

        play_text_audio(stringID, keyString, languageCode);

    }
    ulNode.appendChild(playImageNode);

    let hrNode = document.createElement("hr");
    ulNode.appendChild(hrNode);

    let keyNode = document.createElement("input");
    keyNode.setAttribute("id", "id_key_string");
    keyNode.setAttribute("hidden", true);
    keyNode.setAttribute("value", keyString);

    ulNode.appendChild(keyNode);

    let indexNode = document.createElement("input");
    indexNode.setAttribute("id", "id_index_string");
    indexNode.setAttribute("hidden", true);
    indexNode.setAttribute("value", randomIndex);

    ulNode.appendChild(indexNode);


    let answerNode = document.createElement("input");
    answerNode.setAttribute("id","id_input_answer");
    answerNode.setAttribute("type", "search");
    answerNode.setAttribute("maxlength", 30);
    answerNode.setAttribute("placeholder", "");

    answerNode.onsearch = function() {
        let keyNode = document.getElementById("id_key_string");
        let userAnwser = event.srcElement.value;

        if (keyNode.value != userAnwser) {
            $("#id_tip").html("<span style='color:red' class='glyphicon glyphicon-thumbs-down'> wrong answer</span>, currect answer is: " + keyNode.value);
        }else {
            $("#id_tip").html("<span style='color:green' class='glyphicon glyphicon-thumbs-up'> good answer</span>");
        }
    }

    ulNode.appendChild(answerNode);

    ulNode.appendChild(document.createElement("br"));

    var prevNode=document.createElement("A");
    prevNode.setAttribute("id", "id_revise_prev");
    prevNode.setAttribute("class", "page_downup");
    prevNode.innerHTML = "⇦Prev";

    prevNode.setAttribute("href", "#id_vb_one");
    prevNode.onclick=function(){
        let indexNode = document.getElementById("id_index_string");

        randomIndex = parseInt(indexNode.getAttribute("value"));
        if (randomIndex == 0){
            randomIndex = bookLength -1;
        }else{
            randomIndex -= 1;
        }

        let word = g_allwords_sort_list[randomIndex]["interpre"];
        let keyString = g_allwords_sort_list[randomIndex]["entry"];
        let stringID = g_allwords_sort_list[randomIndex]["id_entry"];
        let languageCode = g_allwords_sort_list[randomIndex]["lang_code"];

        let questionNode = document.getElementById("id_question_string");
        questionNode.innerHTML = word;

        let keyNode = document.getElementById("id_key_string");
        keyNode.setAttribute("value", keyString);

        let answerNode = document.getElementById("id_input_answer");
        answerNode.value = "";

        play_text_audio(stringID, keyString, languageCode);

        indexNode.setAttribute("value", randomIndex);
        $("#id_tip").html("<span style='color:green'> </span>");

    };

    ulNode.appendChild(prevNode);

    var nextNode=document.createElement("A");
    nextNode.setAttribute("id", "id_revise_next");
    nextNode.setAttribute("class", "page_downup");
    nextNode.innerHTML = "Next⇨";

    nextNode.setAttribute("href", "#id_vb_one");
    nextNode.onclick=function(){
        let indexNode = document.getElementById("id_index_string");

        randomIndex = parseInt(indexNode.getAttribute("value"));
        if (randomIndex == bookLength -1){
            randomIndex = 0;
        }else{
            randomIndex += 1;
        }

        let word = g_allwords_sort_list[randomIndex]["interpre"];
        let keyString = g_allwords_sort_list[randomIndex]["entry"];
        let stringID = g_allwords_sort_list[randomIndex]["id_entry"];
        let languageCode = g_allwords_sort_list[randomIndex]["lang_code"];

        let questionNode = document.getElementById("id_question_string");
        questionNode.innerHTML = word;

        let keyNode = document.getElementById("id_key_string");
        keyNode.setAttribute("value", keyString);

        let answerNode = document.getElementById("id_input_answer");
        answerNode.value = "";

        play_text_audio(stringID, keyString, languageCode);

        indexNode.setAttribute("value", randomIndex);
        $("#id_tip").html("<span style='color:green'> </span>");

    };

    ulNode.appendChild(nextNode);

    if (pageName == PAGE_NAME_ONE_VB) {
        let addToMistakeBookNode = document.createElement("A");
        addToMistakeBookNode.setAttribute("id","id_revise_mistake_record");
        addToMistakeBookNode.setAttribute("class", "page_down");
        addToMistakeBookNode.innerHTML = "<span class='glyphicon glyphicon-tag'></span> Save in mistake collection";
        addToMistakeBookNode.setAttribute("href", "#id_vb_one");

        addToMistakeBookNode.onclick=function(){
            let indexNode = document.getElementById("id_index_string");
            let randomIndex = parseInt(indexNode.getAttribute("value"));
            let stringID = g_allwords_sort_list[randomIndex]["id_entry"];
            $.ajax({
             url: '/ajax/set_vbMistakeRecord/',
             data: {
                'vb_id': g_current_vb_id,
                'entry_id' : stringID,
                'update_ip': g_my_ip_addr,
                'update_user': g_user_id,
             },
             dataType: 'json',
             success: function (data) {
                 let count = data.vb_mistake_list;
                 if (count['vb_mistake_count'] > 0) {
                    $("#id_tip").html("<span style='color:green'> add to mistake book.</span>");
                    setVBMistakeInfo(g_current_vb_id, null, "");
                 }else{
                    $("#id_tip").html("<span style='color:red' > this vocabulary is already in mistake book.</span>");
                 }
             }
            });

        };

        ulNode.appendChild(addToMistakeBookNode);

    }

    var tipNode = document.createElement("p");
    tipNode.setAttribute("id", "id_tip");
    tipNode.setAttribute("class", "page_message");

    ulNode.appendChild(tipNode);
    parentNode.appendChild(ulNode);
}


function sort_allwords(sortType, pageName) {
    switch(sortType){
        case ORDER_BY_ID:
            if (g_sort_id_flag == SORT_ID_FLAG_ASCEND) {
                g_sort_id_flag = SORT_ID_FLAG_DESCEND;
                g_allwords_sort_list.sort(function (a, b) {
                    if (a.id_entry < b.id_entry) {
                        return 1;
                    }
                    if (a.id_entry > b.id_entry) {
                        return -1;
                    }
                    return 0;
                 });
            }else{
                g_sort_id_flag = SORT_ID_FLAG_ASCEND;
                g_allwords_sort_list.sort(function (a, b) {
                    if (a.id_entry > b.id_entry) {
                        return 1;
                    }
                    if (a.id_entry < b.id_entry) {
                        return -1;
                    }
                    return 0;
                });
            }
            break;
        case ORDER_BY_ENTRY:
            if (g_sort_entry_flag == SORT_ENTRY_FLAG_ASCEND) {
                  g_sort_entry_flag = SORT_ENTRY_FLAG_DESCEND;
                  g_allwords_sort_list.sort(function (a, b) {
                      if (a.entry < b.entry) {
                        return 1;
                      }
                      if (a.entry > b.entry) {
                        return -1;
                      }
                      return 0;
                  });
            }else{
                  g_sort_entry_flag = SORT_ENTRY_FLAG_ASCEND;
                  g_allwords_sort_list.sort(function (a, b) {
                      if (a.entry > b.entry) {
                        return 1;
                      }
                      if (a.entry < b.entry) {
                        return -1;
                      }
                      return 0;
                  });
            }
            break;
        case ORDER_BY_INTERPRE:
            if (g_sort_interpre_flag == SORT_INTERPRE_FLAG_ASCEND) {
                  g_sort_interpre_flag = SORT_INTERPRE_FLAG_DESCEND;
                  g_allwords_sort_list.sort(function (a, b) {
                      if (a.interpre < b.interpre) {
                        return 1;
                      }
                      if (a.interpre > b.interpre) {
                        return -1;
                      }
                      return 0;
                 });
            }else{
                 g_sort_interpre_flag = SORT_INTERPRE_FLAG_ASCEND;
                 g_allwords_sort_list.sort(function (a, b) {
                      if (a.interpre > b.interpre) {
                        return 1;
                      }
                      if (a.interpre < b.interpre) {
                        return -1;
                      }
                      return 0;
                 });
            }
            break;
        case ORDER_BY_UPDATEDATE:
            if (g_sort_updatedate_flag == SORT_UPDATEDATE_FLAG_ASCEND) {
                 g_sort_updatedate_flag = SORT_INTERPRE_FLAG_DESCEND;
                 g_allwords_sort_list.sort(function (a, b) {
                      if (a.update_date < b.update_date) {
                        return 1;
                      }
                      if (a.update_date > b.update_date) {
                        return -1;
                      }
                      return 0;
                 });
            }else{
                 g_sort_updatedate_flag = SORT_INTERPRE_FLAG_ASCEND;
                 g_allwords_sort_list.sort(function (a, b) {
                      if (a.update_date > b.update_date) {
                        return 1;
                      }
                      if (a.update_date < b.update_date) {
                        return -1;
                      }
                      return 0;
                 });
            }
            break;
        case ORDER_BY_LANGCODE:
            if (g_sort_langcode_flag == SORT_LANGCODE_FLAG_ASCEND){
                 g_sort_langcode_flag = SORT_LANGCODE_FLAG_DESCEND;
                 g_allwords_sort_list.sort(function (a, b) {
                      if (a.lang_code < b.lang_code) {
                        return 1;
                      }
                      if (a.lang_code > b.lang_code) {
                        return -1;
                      }
                      return 0;
                 });
            }else{
                 g_sort_langcode_flag = SORT_LANGCODE_FLAG_ASCEND;
                 g_allwords_sort_list.sort(function (a, b) {
                      if (a.lang_code > b.lang_code) {
                        return 1;
                      }
                      if (a.lang_code < b.lang_code) {
                        return -1;
                      }
                      return 0;
                 });
            }
            break;
    }

}


function setVBListOption()
{
    let vbSelectNode = document.getElementById("id_vb_select");
    if (vbSelectNode == null) {
        return;
    }
    do{
        if (vbSelectNode.hasChildNodes()) {
            vbSelectNode.removeChild(vbSelectNode.firstChild);
        }
     }while(vbSelectNode.hasChildNodes());

    for(let y = 0; y < g_all_vb_list.length; y++) {
        let optionNode = document.createElement("option");
        optionNode.setAttribute("value", g_all_vb_list[y][0]);

        optionNode.innerHTML = g_all_vb_list[y][1];

        if (g_current_vb_id == g_all_vb_list[y][0]) {
            optionNode.setAttribute("selected", "true");
        }else{
            optionNode.removeAttribute("selected");
        }

        vbSelectNode.appendChild(optionNode);
    }
}