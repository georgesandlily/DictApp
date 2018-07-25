/*
 * File:        searchDB.js
 * Description: implement DB access and refresh main page table content
 * Author:      swallow
 */


let btn_search_all = document.getElementById('id_search_all');
let btn_search_one_history = document.getElementById('id_search_history');
let btn_search_allwords = document.getElementById('id_search_allwords');

let btn_save_vb = document.getElementById("btn_save_vb");
let btn_create_vb = document.getElementById("btn_create_vb");

btn_search_all.onclick=function(){
    button_import_history_click("id_result_all",PAGE_NAME_ALL_LANGUAGES);
}

btn_search_one_history.onclick=function(){
    button_import_history_click("id_result", PAGE_NAME_ONE_LANGUAGE);
}

btn_search_allwords.onclick=function(){
    load_languageData("id_result",PAGE_NAME_ONE_LANGUAGE);
}

btn_save_vb.onclick = function() {

    let vbDesc = $("#id_vb_desc_one").val();
    saveVocabularyBook(getVocaublarBookName(g_current_vb_id), vbDesc);
}

btn_create_vb.onclick = function() {
    let vbName = $("#id_vb_name").val();
    let vbDesc = $("#id_vb_desc").val();

    saveVocabularyBook(vbName, vbDesc);
}


function button_import_history_click(addNodeName, pageName){

 $.ajax({
     url: '/ajax/get_importHistory/',
     data: {
       'current_language': g_current_language
     },
     dataType: 'json',
     success: function (data) {
         g_import_history_list = data.result_list;
         clearCurrentPageContent(addNodeName);
         if (g_import_history_list.length > 0){
             createImportInfoTable(addNodeName, pageName);
         }
         else{
            show_message(addNodeName, 'No data found.');
         }
     }
  });

}


function load_languageData(addNodeName, pageName){

 $.ajax({
    url: '/ajax/get_languageData/',
    data: {
      'current_language': g_current_language
    },
    dataType: 'json',
    beforeSend:function()
    {
        show_message(addNodeName, "<span style='color:blue'>Start loading language data...</span>");
        return true;
    },

    success: function (data) {
         //g_allwords_freeSearch_list = data.result_list;
         clearCurrentPageContent(addNodeName);
         setDataInOrderList(data.result_list);
         if (data.result_list.length > 0) {
             createAllwordsTable(addNodeName, pageName);
             $("#id_tip").html("<span style='color:blue'>Language data loaded.</span>");
         }
         else{
             $("#id_tip").html("<span style='color:blue'>No data found.</span>");
         }
     }
  });
}


function freeSearch()
{
     var search_str = $("#searchbox-input").val();
     g_allwords_freeSearch_list = {};
     g_table_cursor = 0;
     search_str = search_str.replace(/^\s+|\s+$/g,"");
     $.ajax({
         url: '/ajax/get_freesearch/',
         data: {
           'search_string': search_str
         },
         dataType: 'json',
         success: function (data) {
             //g_allwords_freeSearch_list = data.result_list;
             window.location.replace("/dictionary/#id_freesearch");
             clearCurrentPageContent('id_result_freesearch');
             setDataInOrderList(data.result_list);
             if (data.result_list.length > 0) {
                createAllwordsTable('id_result_freesearch', PAGE_NAME_FREE_SEARCH);
                refreshTableSelectedStatus('id_result_freesearch_table', PAGE_NAME_FREE_SEARCH);

             }
             else{
                var insertNode=document.createElement("A");
                insertNode.setAttribute("id", "id_insertNew_searchPage");
                insertNode.setAttribute("href", "#id_freesearch");
                insertNode.setAttribute("class","page_translate")
                insertNode.innerHTML = "append new entry";

                insertNode.onclick=function(){
                    show_modal_insert_form(this);
                };

                document.getElementById("id_result_freesearch").appendChild(insertNode);
                //show_message('id_result_freesearch', 'No data found.');

                var tipNode = document.getElementById("id_tip");
                if (tipNode == null){
                    var tipNode = document.createElement("p");
                    tipNode.setAttribute("id", "id_tip");
                    tipNode.setAttribute("class", "page_message");
                    document.getElementById("id_result_freesearch").appendChild(tipNode);
                }

                $('#id_tip').html("<span style='color:blue'>No data found.</span>");
             }
         }
      });
}



function translate_page(tableID, type){

    var tableNode=document.getElementById(tableID);
    if (tableNode == null) {
        return;
    }

    var currentPageRows = tableNode.rows.length - 1;

    for(var x=0;x<currentPageRows ;x++){
        var txtEntry = tableNode.rows[x+1].cells[1].innerHTML;
        var txtStringID = tableNode.rows[x+1].cells[0].innerHTML;
        var txtInter = tableNode.rows[x+1].cells[2].innerHTML;
        var txtLanguageID = tableNode.rows[x+1].cells[3].innerText;
        if (txtInter == '') {
            $.ajax({
                url: '/ajax/get_translateWord/',
                data: {
                    'source_text': txtEntry,
                    'dest_lang': 'zh',
                    'string_id': txtStringID,
                    "language_id": txtLanguageID,
                },
                beforeSend:function()
                {
                    $("#id_tip").html("<span style='color:blue'>Start translating...</span>");
                    return true;
                },

                dataType: 'json',
                success: function (data) {
                    var translatedText = data.translated_text;
                    var sourceText = data.source_Text;
                    var stringID = data.string_ID;
                    var synthesisString = data.synthesis_string;
                    console.log(synthesisString);

                    refresh_translateInfo(tableID, stringID, sourceText, translatedText, type);

                    g_translatedList[sourceText] = translatedText;
                }
            });

        }
    }

}



function searchByPage(){

    var txt_entry = $('#id_page_search').val();

}

function play_text_audio(stringID, sourceText, languageCode)
{
    if (languageCode == 'en') {
        languageCode = 'uk'
    }

    if (languageCode == 'enukus') {
        languageCode = 'uk'
    }

    $.ajax({
        url: '/ajax/play_text_audio/',
        data: {
            'string_id': stringID,
            'source_text': sourceText,
            'language_code':languageCode,
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        success: function (data) {
            audioFileName = data.src_path;
            resString = data.result_string;

            if (audioFileName !=null) {
                let audioNode = document.getElementById("id_audio");
                audioNode.setAttribute("src", audioFileName);
                console.log(audioFileName);

                let playPromise = audioNode.play();
                if (playPromise !== undefined) {
                  playPromise.then(function() {
                    $("#id_tip").html("<span style='color:green'>" + resString + "</span>");
                  }).catch(function(error) {
                    $("#id_tip").html("<span style='color:red'>wrong audio play...</span>");
                  });
                }else{
                    $("#id_tip").html("<span style='color:red'>your browser doesn't support playing audio</span>");
                }
            }else{
                $("#id_tip").html("<span style='color:red'>can't get audio file</span>");
            }
        }
    });
}

function azure_translate_insert()
{
    let txtEntry = $('#id_new_entry').val();

    if(!txtEntry)
    {
        alert('entry must be inputted！');
        return false;
    }

    let txtLanguageCode = $('#id_new_langCode').val();

    $.ajax({
        url: '/ajax/get_translateWord/',
        data: {
            'source_text': txtEntry,
            'dest_lang': 'zh',
            'string_id': '',
            'language_id':txtLanguageCode,
        },
        dataType: 'json',
        success: function (data) {
            let translatedText = data.translated_text;
            let detectedCode = data.language_ID;
            console.log(detectedCode);

            $("#id_new_interpretation").removeAttr("placeholder");
            $("#id_new_interpretation").val(translatedText) ;
            $("#id_new_langCode").val(detectedCode);

            $("#id_tip").html("<span style='color:blue'>Update OK...</span>");

        }
    });
}


function setDataInOrderList(list)
{
    g_allwords_sort_list = [];
    for (let i = 0; i< list.length; i ++) {
        let oneItem = [];
        oneItem["id_entry"] = list[i][0];
        oneItem["entry"] = list[i][1];
        oneItem["interpre"] = list[i][2];
        oneItem["lang_code"] = list[i][3];
        oneItem["update_date"] = list[i][4];

        g_allwords_sort_list.push(oneItem);
    }
}

function begin_searchPodcast()
{
    $.ajax({
        url: '/ajax/search_podcast/',
        data: {
            'user_id':g_user_id,
        },
        dataType: 'json',
        success: function (data) {
            $("#id_tip").html("<span style='color:blue'>search podcast finished...</span>");
        }
    });


}


function update_cambridge()
{
    $.ajax({
        url: '/ajax/update_cambridge/',
        data: {
            'user_id':g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tip").html("<span style='color:blue'>Start updateing from cambridge...</span>");
            return true;
        },

        success: function (data) {
            $("#id_tip").html("<span style='color:blue'>update cambridge data finished...</span>");
        }
    });

}