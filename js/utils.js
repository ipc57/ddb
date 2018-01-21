'use strict';

function exportData(Data, type, showFields) {
    // Data       : {}. Can be any data you want to export (records, columns, custom, etc...).
    // type       : string. Extension of file name 'xls' or 'csv' are possible. By default 'excel' format is done on array
    // showFields : boolean (optional). Insert field names on top of the file data. By default 'false'

        var arrData = typeof Data != 'object' ? JSON.parse(Data) : Data;
        fileName = 'ExportData.' + type;
        var Data = '';
        // show fields on first row ?
        if (showFields) {
            var row = "";
            for (var index in arrData[0]) {
                if (row !="" && type =='csv') row +=',';
                row += index + '\t';
            }
            row = row.slice(0, -1);
            Data += row + '\r\n';
        }
        // Prepare array data format
        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            for (var index in arrData[i]) {
                if (row !="" && type =='csv') row +=',';
                row += (type == 'xls') ? '"' + arrData[i][index] + '"\t' :  arrData[i][index] + '\t'
            }
            row.slice(0, row.length - 1);
            Data += row + '\r\n';
        }
        // No data?
        if (Data == '') {
            w2alert('No Data Found');
            return;
        }
        var link = document.createElement("a");
        // browser with HTML5 support download attribute
        if (link.download !== undefined) {
            var uri = 'data:application/vnd.ms-excel,' + escape(Data);
            link.setAttribute ( 'href', uri);
            link.setAttribute('style', "visibility:hidden");
            link.setAttribute ('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        // IE 10,11+
        else if (navigator.msSaveBlob) {
            var blob = new Blob([Data], {
                "type": "text/csv;charset=utf8;"			
            });
            navigator.msSaveBlob(blob, fileName);
        }
        // old IE 9-  remove this part ?? deprecated browsers ??
        var ua = window.navigator.userAgent;
        var ie = ua.indexOf('MSIE ');
        if ((ie > -1)) {
            if (document.execCommand) {
                var oWin = window.open("about:blank","_blank");
                oWin.document.write(Data);
                oWin.document.close();
                var success = oWin.document.execCommand('SaveAs', true, fileName)
                oWin.close();
            }
        }
};


function empty(data){
  if(typeof(data) == 'number' || typeof(data) == 'boolean')
  { 
    return false; 
  }
  if(typeof(data) == 'undefined' || data === null)
  {
    return true; 
  }
  if(typeof(data.length) != 'undefined')
  {
    return data.length == 0;
  }
  var count = 0;
  for(var i in data)
  {
    if(data.hasOwnProperty(i))
    {
      count ++;
    }
  }
  return count == 0;
};


function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;   
     return dateTime;
};



function compareJSON(obj1, obj2) { 
    var ret = {}; 
    for(var i in obj2) { 
      if(!obj1.hasOwnProperty(i) || obj2[i] !== obj1[i]) { 
        ret[i] = obj2[i]; 
      } 
    } 
    return ret; 
  }; 
