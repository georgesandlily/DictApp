const DB_NAME = "local_dict_db";
const VERSION = 1;

var g_indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;


var g_request = g_indexedDB.open(DB_NAME, VERSION);
var g_localDatabase;

g_request.onerror = function(event) {
  // Handle errors.
};

g_request.onsuccess = function(e){
    g_localDatabase = e.target.result;
    console.log('创建或打开数据库成功') ;

};

g_request.onupgradeneeded = function(event) {
    var g_localDatabase = event.target.result;

    var objectStore = g_localDatabase.createObjectStore("vocabulary_table", { keyPath: "id" });

    // Create an index to search customers by name. We may have duplicates
    // so we can't use a unique index.
    //objectStore.createIndex("id", "id", { unique: true });

    //Create an index to search customers by email. We want to ensure that
    //no two customers have the same email, so use a unique index.
    //objectStore.createIndex("entry", "entry", { unique: true });
    //objectStore.createIndex("interpretation", "interpretation", { unique: false });
    //objectStore.createIndex("lang_code", "lang_code", { unique: false });
    //objectStore.createIndex("update_date", "update_date", { unique: false });
    //objectStore.createIndex("in_vb_flag", "in_vb_flag", { unique: false });

  // Use transaction oncomplete to make sure the objectStore creation is
  // finished before adding data into it.
  //objectStore.transaction.oncomplete = function(event) {
    // Store values in the newly created objectStore.
  //  var customerObjectStore = db.transaction("vb_list", "readwrite").objectStore("vb_list");
  //  customerData.forEach(function(customer) {
  //    customerObjectStore.add(customer);
  //  });
  //};
};