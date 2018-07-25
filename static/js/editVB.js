/*
 * File:        editVB.js
 * Description: implement vocabulary book create/search/update/delete
 * Author:      swallow
 */


function saveVocabularyBook(vbName, vbDesc){

    if(!vbName)
    {
        $("#id_tips_vb").html("<span style='color:red'>empty vocabulary name..</span>");

        return false;
    }

    if(g_user_id == "")
    {
        $("#id_tips_vb").html("<span style='color:red'>Please login first.</span>");

        return false;
    }

    $.ajax({
        url: '/ajax/set_newVBData/',
        data: {
            'vb_name': vbName,
            'vb_desc': vbDesc,
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tips_vb").html("<span style='color:blue'>start creating...</span>");
            return true;
        },
        success: function (data) {
            result = data.insert_data;

            if (result["vb_count"] == 0) {
                $("#id_tips_vb").html("<span style='color:red'>Vocabular book already existed</span>");
            }
            else {
                let vbData = result["vb_data"];
                g_all_vb_list.push(vbData[0]);


                let vbName  = vbData[0][1];
                let vbID = vbData[0][0];

                let html_str = vbName;
                html_str = html_str.concat("<span style='color:blue'> created.</span>");

                $("#id_tips_vb").html(html_str);

                refresh_VB_menuitem(VB_INSERT, vbID, vbName);
            }
        }
    });

}


function refreshVBMenuItem() {
    let vbName = $("#id_vb_name").val();
    let vbDesc = $("#id_vb_desc").val();
    if(!vbName)
    {
        $("#id_tips_vb").html("<span style='color:red'>empty vocabulary name..</span>");

        return false;
    }

    $.ajax({
        url: '/ajax/set_newVBData/',
        data: {
            'vb_name': vbName,
            'vb_desc': vbDesc,
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tips_vb").html("<span style='color:blue'>start creating...</span>");
            return true;
        },
        success: function (data) {
            result = data.update_count;
            let html_str = "<span style='color:blue'>";
            html_str = html_str.concat(String(data.update_count));
            html_str = html_str.concat(" was appended...</span>")

            $("#id_tips").html(html_str);

            return true;
        }
    });

}

function load_vbData(nodeName, pageMode)
{
    $.ajax({
        url: '/ajax/get_vbData/',
        data: {
            "vb_id" : g_current_vb_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            //$("#id_tips_vb").html("<span style='color:blue'>start updatecreating...</span>");
            return true;
        },
        success: function (data) {
            g_current_vb_entry_collection=[];
            setDataInOrderList(data.result_list);
            g_allwords_sort_list = [];
            for (let x  = 0; x < data.result_list.length; x ++){
                g_current_vb_entry_collection.push(data.result_list[x][1]);

                let oneItem = [];
                oneItem["id_entry"] = listItem[0];
                oneItem["entry"] = listItem[1];
                oneItem["interpre"] = listItem[1];
                oneItem["lang_code"] = listItem[1];
                oneItem["update_date"] = listItem[1];

                g_allwords_sort_list.push(oneItem);

            }
            nodeName = nodeName.concat("_table");
            refreshTableSelectedStatus(nodeName, pageMode);

            return true;
        }
    });
}

function saveVBData() {

    if (g_user_id == "") {
       $("#id_tip").html("<span style='color:red'>Please login first,then choose a vocabulary book.</span>");
       return;

    }
    $.ajax({
        url: '/ajax/update_vbData/',
        data: {
            "vb_data": JSON.stringify(g_temp_saved_entry_list),
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tip").html("<span style='color:blue'>start updating vb data...</span>");
            return true;
        },
        success:function (data){
            result = data.update_count;

            if (result <= 0) {
                $("#id_tip").html("<span style='color:blue'>Vocabular book no data  updated</span>");
            }
            else {

                let html_str = "<span style='color:blue'> " ;
                html_str = html_str.concat(readVBOpeInTempArray());
                html_str = html_str.concat("</span>");
                $("#id_tip").html(html_str);
            }

            g_temp_saved_entry_list.length = 0;
            return true;
        },
    });
}

function saveVBMistakeData() {
    $.ajax({
        url: '/ajax/update_vbMistakeData/',
        data: {
            "vb_mistake_data": JSON.stringify(g_temp_vb_mistake_list),
            'update_ip': g_my_ip_addr,
            'update_user': g_user_id,
        },
        dataType: 'json',
        beforeSend:function()
        {
            $("#id_tip").html("<span style='color:blue'>Remove from mistake book...</span>");
            return true;
        },
        success:function (data){
            result = data.update_count;

            if (result <= 0) {
                $("#id_tip").html("<span style='color:blue'>Mistake book no data  updated</span>");
            }
            else {

                let html_str = "<span style='color:blue'> " ;
                html_str = html_str.concat(readVBMistakeTempArray());
                html_str = html_str.concat("</span>");
                $("#id_tip").html(html_str);
            }

            g_temp_vb_mistake_list.length = 0;
            return true;
        },
    });
}

function refreshCurrentVBData() {
    $.ajax({
     url: '/ajax/get_vbAllwordsData/',
     data: {
       'vb_id': g_current_vb_id,
     },
     dataType: 'json',
     success: function (data) {
         g_vb_entry_id_list = data.vb_entry_id_list;
         g_vb_allwords_list.length = 0;
         setDataInOrderList(data.vb_allwords_list);

         for (let i = 0; i< data.vb_allwords_list.length; i ++) {
            let listItem = data.vb_allwords_list[i][0];
            g_vb_allwords_list.push(data.vb_allwords_list[i][0]);
         }
     }
    });
}


function refreshVBwordsTable(tableID, intent)
{
     $.ajax({
         url: '/ajax/get_vbAllwordsData/',
         data: {
           'vb_id': g_current_vb_id
         },
         dataType: 'json',
         success: function (data) {
             g_vb_entry_id_list = data.vb_entry_id_list;
             setDataInOrderList(data.vb_allwords_list);

             // g_vb_allwords_list.length = 0;
             if (intent == PAGE_NAME_ONE_VB) {
                 createAllwordsTable("id_one_vb_result", PAGE_NAME_ONE_VB);
             }
             else{
                 refreshTableSelectedStatus(tableID, PAGE_NAME_ONE_LANGUAGE);
             }
         }
      });
}

function refreshVBMistakeRecords()
{
     $.ajax({
         url: '/ajax/get_vbMistakeAllwords/',
         data: {
           'vb_id': g_current_vb_id
         },
         dataType: 'json',
         success: function (data) {
             g_vb_allwords_list.length = 0;
             listLen = data.vb_mistake_allwords_list.length;
             setDataInOrderList(data.vb_mistake_allwords_list);

             //for (let i = 0; i< listLen; i ++) {
             //   let listItem = data.vb_mistake_allwords_list[i][0];
             //   g_vb_allwords_list.push(data.vb_mistake_allwords_list[i][0]);
             //}
             createAllwordsTable("id_one_vb_result", PAGE_NAME_ONE_VB_MISTAKE);

         }
      });
}

function isExistedInEntryList(entryID, vbID)
{
    for (let i = 0; i < g_vb_entry_id_list.length; i++){
        if ((entryID == g_vb_entry_id_list[i][1]) && (vbID == g_vb_entry_id_list[i][0])) {
            return true;
        }
    }

    for (let i = 0; i < g_temp_saved_entry_list.length; i++){
        if ((entryID == g_temp_saved_entry_list[i][1]) && (g_temp_saved_entry_list[i][2] == APPEND_IN_VB) && (vbID == g_temp_saved_entry_list[i][0])) {
            return true;
        }
    }

    return false;
}

function saveVBOpeInTempArray(entryID, vbID, opeFlag){
    for(let i=0,len = g_temp_saved_entry_list.length; i< len; i++){

        if ((vbID == g_temp_saved_entry_list[i][0]) && (entryID == g_temp_saved_entry_list[i][1])) {
            delete g_temp_saved_entry_list[i];
            g_temp_saved_entry_list.sort();
            g_temp_saved_entry_list.length = len - 1;
            return;
        }
    }

    let dataArray = new Array();
    dataArray.push(vbID);
    dataArray.push(entryID);
    dataArray.push(opeFlag);

    g_temp_saved_entry_list.push(dataArray);
}

function saveVBMistakeTempArray(entryID, vbID, opeFlag){
    for(let i=0,len = g_temp_vb_mistake_list.length; i< len; i++){

        if ((vbID == g_temp_vb_mistake_list[i][0]) && (entryID == g_temp_vb_mistake_list[i][1])) {
            delete g_temp_vb_mistake_list[i];
            g_temp_vb_mistake_list.sort();
            g_temp_vb_mistake_list.length = len - 1;
            return;
        }
    }

    let dataArray = new Array();
    dataArray.push(vbID);
    dataArray.push(entryID);
    dataArray.push(opeFlag);

    g_temp_vb_mistake_list.push(dataArray);
}


function readVBOpeInTempArray(){
    g_temp_saved_entry_list.sort();
    let readOutString = "";
    let vbID = g_temp_saved_entry_list[0][0];
    let vbName = getVocaublarBookName(vbID);
    let count = 0;

    let len = g_temp_saved_entry_list.length;

    for(let i=0; i< len; i++){
        if (vbID == g_temp_saved_entry_list[i][0]) {
            count ++;
        }else{
            readOutString = readOutString.concat(String(count));
            readOutString = readOutString.concat(" entries was updated in ");
            readOutString = readOutString.concat(vbName);
            readOutString = readOutString.concat(".<br>");
            count = 1;
            vbID = g_temp_saved_entry_list[i][0];
            vbName = getVocaublarBookName(vbID);
        }
    }
    readOutString = readOutString.concat(String(count));
    readOutString = readOutString.concat(" entries was updated in ");
    readOutString = readOutString.concat(vbName);
    readOutString = readOutString.concat(". \n");

    return readOutString;
}

function readVBMistakeTempArray(){
    g_temp_vb_mistake_list.sort();
    let readOutString = "";
    let vbID = g_temp_vb_mistake_list[0][0];
    let vbName = getVocaublarBookName(vbID);
    let count = 0;

    let len = g_temp_vb_mistake_list.length;

    for(let i=0; i< len; i++){
        if (vbID == g_temp_vb_mistake_list[i][0]) {
            count ++;
        }else{
            readOutString = readOutString.concat(String(count));
            readOutString = readOutString.concat(" entries was updated in ");
            readOutString = readOutString.concat(vbName);
            readOutString = readOutString.concat(".<br>");
            count = 1;
            vbID = g_temp_vb_mistake_list[i][0];
            vbName = getVocaublarBookName(vbID);
        }
    }
    readOutString = readOutString.concat(String(count));
    readOutString = readOutString.concat(" entries was updated in ");
    readOutString = readOutString.concat(vbName);
    readOutString = readOutString.concat(". \n");

    return readOutString;
}



function getVocaublarBookName(vbID) {
    for (let i=0, len= g_all_vb_list.length; i < len ; i++) {
        if (vbID == g_all_vb_list[i][0]) {
            return g_all_vb_list[i][1];
        }
    }

    return null;
}


function getVocaublarBookDesc(vbName) {
    for (let i=0, len= g_all_vb_list.length; i < len ; i++) {
        if (vbName == g_all_vb_list[i][1]) {
            return g_all_vb_list[i][2];
        }
    }

    return null;
}
