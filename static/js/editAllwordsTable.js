/*
 * File:        editAllwordsTable.js
 * Description: implement language entry interpretation insert/search/update/
 * Author:      swallow
 */

function save_updatedEntry(obj, txtEntry, txtStringID, txtIntpre)
{
    if(!txtEntry)
    {
        //alert('entry must be inputted！');
        return false;
    }

    $.ajax({
        url: '/ajax/set_allwordsData/',
        data: {
            'entry_content': txtEntry,
            'string_id': txtStringID,
            'interpretation': txtIntpre,
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tip").html("<span style='color:blue'>start upload data...</span>");
            return true;
        },
        success: function (data) {
            result = data.result;
            if (g_current_row != null) {
                if(result.length != 0){
                    g_current_row.cells[1].innerHTML = result[0][1];
                    g_current_row.cells[2].innerHTML = result[0][2];
                    g_current_row.cells[4].innerHTML = result[0][4];
                    g_current_row.style.background = "#98FB98";

                    //g_allwords_freeSearch_list[(g_current_page -1) * g_max_display_rows + g_current_row.rowIndex - 1][1] = result[0][1];
                    //g_allwords_freeSearch_list[(g_current_page -1) * g_max_display_rows + g_current_row.rowIndex - 1][2] = result[0][2];
                    //g_allwords_freeSearch_list[(g_current_page -1) * g_max_display_rows + g_current_row.rowIndex - 1][4] = result[0][4];

                    g_allwords_sort_list[(g_current_page -1) * g_max_display_rows + g_current_row.rowIndex - 1]["entry"] = result[0][1];
                    g_allwords_sort_list[(g_current_page -1) * g_max_display_rows + g_current_row.rowIndex - 1]["interpre"] = result[0][2];
                    g_allwords_sort_list[(g_current_page -1) * g_max_display_rows + g_current_row.rowIndex - 1]["update_date"] = result[0][4];

                    $("#id_tip").html("<span style='color:blue'>Update OK...</span>");
                }
                else{
                    g_current_row.style.dbackground = "#FF0000";
                    $("#id_tip").html("<span style='color:red'>Update failed...</span>");
                }
            }
        }
    });

}


function azure_translate()
{
    let txtEntry = $('#id_entry').val();
    let txtStringID = $('#id_stringId').val();
    if(!txtEntry)
    {
        alert('entry must be inputted！');
        return false;
    }

    let txtLanguageCode = $('#id_languageID_edit').val();

    $.ajax({
        url: '/ajax/get_translateWord/',
        data: {
            'source_text': txtEntry,
            'dest_lang': 'zh',
            'string_id': txtStringID,
            'language_id':txtLanguageCode,

        },
        dataType: 'json',
        success: function (data) {
            let inputInterpreNode = $('#id_interpretation');

            $('#id_interpretation').removeAttr("placeholder");
            $('#id_interpretation').val(data.translated_text);
            $("#id_tip").html("<span style='color:blue'>Translated</span>");
        },
        failed: function (data) {
            $("#id_tip").html("<span style='color:red'>Error occurred</span>");

        },
    });
}


function updatedEntry(obj) {
    let txtEntry = $('#id_entry').val();
    let txtStringID = $('#id_stringId').val();
    let txtIntpre = $('#id_interpretation').val();

    save_updatedEntry(obj, txtEntry, txtStringID, txtIntpre);
}

function insertNewEntry(obj)
{
    let txtEntry = $('#id_new_entry').val();
    let txtIntpre = $('#id_new_interpretation').val();
    let txtLangCode = $('#id_new_langCode').val();

    if(!txtEntry)
    {
        $("#id_tip").html("<span style='color:red'>empty entry...</span>");

        return false;
    }

    if(!txtEntry)
    {
        //alert('entry must be inputted！');
        return false;
    }

    $.ajax({
        url: '/ajax/insert_allwordsData/',
        data: {
            'entry_content': txtEntry,
            'interpretation': txtIntpre,
            'language_id': txtLangCode,
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tip").html("<span style='color:blue'>Start insert...</span>");
            $('#myWaiting').modal('show');
            return true;
        },
        success: function (data) {
            insertData = data.insert_data;
            insertCount = data.insert_count;
            insertLangCodeCount = data.insert_lang_code_count;
            if(insertCount != 0){
                 $('#myWaiting').modal('hide');
                 //g_allwords_freeSearch_list = insertData;

                 window.location.replace("/dictionary/#id_append");
                 let parentNode = document.getElementById("id_result_append");
                 setDataInOrderList(insertData);
                 clearCurrentPageContent();
                 createAllwordsTable("id_result_append", PAGE_NAME_APPEND);


                 //if(insertData[0][3] == g_current_language) {
                 //   g_allwords_freeSearch_list.push(insertData[0]);
                 //   let pageNo = get_page_display_number(g_allwords_freeSearch_list.length, g_max_display_rows);
                 //   g_current_page = pageNo;
                 //   let tipNode = document.getElementById("id_tip");
                 //   let parentNode = tipNode.parentNode;
                 //   let pageID = parentNode.getAttribute("id");

                 //refresh_page(tableNode, pageNo);
                 $("#id_tip").html("<span style='color:blue'>Insert OK...</span>");

                //}
                //else{
                //    let html_str = "<span style='color:blue'>Insert OK, find it in " ;
                //    html_str= html_str.concat(language_code[insertData[0][3]]);
                //   html_str = html_str.concat("</span>");
                //    $("#id_tip").html(html_str);
                //}
            }
            else {
                $("#id_tip").html("<span style='color:red'>Entry already exsits...</span>");
            }

            if(insertLangCodeCount > 0) {
                refresh_menuitem(txtLangCode);
            }
        }
    });

}

