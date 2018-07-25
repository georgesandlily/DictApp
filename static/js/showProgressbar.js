/*
 * File:        showProgressbar.js
 * Description: implement importing progress info display
 * Author:      swallow
 */

 var ct = $("#id_progressbar");
var desc=$("#id_desc");
var bar = $("#id_bar");
var border = $("#id_border");
var title = $("#id_title");
var btn_import = $("#id_btn_import");
var lang_file_selector = $("#id_language_file");

btn_import.onclick=function(){
     var ret = send_import_request();
     if (ret == true){
        showProgessbar();
     }
 }

function showProgressbar(c_proc_id) {
     var idx = 0;
     var time = 500;

     //console.log("proc_id is " + proc_id);
     border.attr('display', 'block');
     bar.setValue = function(n){$("#id_bar").css({"width":n + "%"}); };
     $("#id_button").attr('disabled','disabled');

     void function(){
         $.ajax({
             url: '/ajax/get_importingRate/',
             data: {
               'proc_id': c_proc_id
             },
             dataType: 'json',
             success: function (data) {
                 var rate = data.current_rate;
                 var status = data.current_status;
                 var comment = data.status_comment;
                 var languageID = data.language_ID;
                 console.log("rate is " + rate + " status is " + status);
                 if (status == 2)
                 {
                    $("#id_title").html("Importing finished");
                    $("#id_desc").html("100% imported");
                    bar.setValue(100);
                    clearTimeout(timer);
                    //$("#id_button").removeAttr('disabled');
                    refresh_menuitem(languageID);
                    return;
                 }
                 else if (status == -1)
                 {
                    $("#id_desc").html(comment);
                    clearTimeout(timer);

                    //$("#id_button").removeAttr('disabled');
                 }
                 else
                 {
                    $("#id_desc").html(rate + "% imported");
                     bar.setValue(rate);
                 }
             }
          });
         timer = setTimeout(arguments.callee, time += 10);
     }();
}

function send_import_request(){
    var ip_address = $("#id_ip_address").attr("value");
    var city = $("#id_city").attr("value");
    var region = $("#id_region").attr("value");
    var country = $("#id_country").attr("value");
    var latitude = $("#id_latitude").attr("value");
    var longitude = $("#id_longitude").attr("value");
    var time_zone = $("#id_timezone").attr("value");
    var language_file = $("#id_language_file").attr("value");

    $.ajax({
                 url: '/ajax/start_import_task/',
                 data: {
                   'language_file':language_file,
                   'ip_address': ip_address,
                   'city': city,
                   'region': region,
                   'country':country,
                   'latitude':latitude,
                   'longitude':longitude,
                   'time_zone':time_zone
                 },
                 dataType: 'json',
                 success: function (data) {
                    return true;
                 },
                 error:function(data) {
                    return false;
                 }
      });

}

function PostData() {

        var formData = new FormData(this);
        $.ajax({
            url: '/ajax/start_import_task/',
            //type: "POST",
            //url: "post.go",
            data : formData,
            dataType:'json',
            success: function(data) {
                showProgessbar();
                console.log("task started");
            }
        });
        return true;
}
