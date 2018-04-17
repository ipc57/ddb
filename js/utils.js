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



  var myCanvas = document.getElementById("screen");
  var wsBase = "%WSURI%";
  var RIMtablet = navigator.appVersion && (-1 != navigator.appVersion.indexOf('RIM Tablet'));
  var mhx = 100;
  var mhy = 100;
  var dragX = 0;
  var dragY = 0;
  var inDrag = false;
  var rdp = null;
  var vkbd = null;
  var embedded = false;

  var externalConnection = false;

  function initBody(){
      //apply old settings
      settingsApply();
      initPopUpDeck();
  }


  //pop up message procedure
  var popUpDeck = null;
  var popUpElements = [];

  function initPopUpDeck(){
      popUpDeck = document.createElement('div');
      document.body.appendChild(popUpDeck);

      popUpDeck.set('class', 'popupwrapper');
  }

  function cleanPopUpDeck(){
      for(var i=0; i<popUpElements.length; i++){
          popUpElements[i].removeEvents();
          popUpElements[i].destroy();
      }
  }

  function popUpMessage(type, msg, timeout, callback, center){
      var newMessage = document.createElement('div');
      popUpDeck.appendChild(newMessage);

      newMessage.set('class', 'popupmessage');
      newMessage.set('text', msg);
      newMessage.addEvent('mousedown',
          function(){
              if(callback)
                  callback();
              newMessage.destroy();
              newMessage = null;
          });

      var color = {
          r: 255,
          g: 255,
          b: 255
      };

      if(type=='error'){
          color.r = 247;
          color.g = 203;
          color.b = 30;
      }else
      if(type=='message'){
          color.r = 107;
          color.g = 180;
          color.b = 229;
      }else
      if(type=='critical'){
          color.r = 255;
          color.g = 0;
          color.b = 0;
      }

      if(center){
          newMessage.setStyle('position','absolute');
          newMessage.setStyle('top', document.body.offsetHeight/2);
          newMessage.setStyle('z-index', '1235');
      }
      newMessage.setStyle('background-color','rgba(' + color.r
                                               + ',' + color.g
                                               + ',' + color.b
                                               + ', 0.8)' );

      if(timeout){
          window.setTimeout(
              function(){
                  if(newMessage){
                      if(callback)
                          callback();
                      newMessage.destroy();
                  }
              },
              timeout*1000);
      }

      popUpElements.push(newMessage);

      return newMessage;
  }

 /*  function noInstancePopUp(){
      popUpMessage('critical', "This instance seems to be not working. Try to enter the console again.", 0, noInstancePopUp, true);
  } */

  function RDPStart(uri, title){
      if(uri === undefined){
          uri = wsBase;
      }
      /* if(title === undefined){
          title = "FreeRDP WebConnect: connected to " + $('rdphost').value.trim();
      }
      if(!embedded){
          $('dvLoading').setStyles({'visibility':'visible'});
      } */
      rdp = new wsgate.RDP(uri, myCanvas, !RIMtablet, RIMtablet, vkbd);

      rdp.addEvent('alert', function(msg) {
          popUpMessage('error', msg, 5);
          });
      /* rdp.addEvent('connected', function() {
              cleanPopUpDeck();
              document.title = title;
              button = $("rdpconnect");
              button.removeEvents();
              window.removeEvent('resize', OnDesktopSize);
              button.value = 'Disconnect';
              button.addEvent('click', rdp.Disconnect.bind(rdp));
              window.addEvent("beforeunload", rdp.Disconnect.bind(rdp));
              }); */
     /*  rdp.addEvent('disconnected', function() {
              showDialog(true);
              if(embedded){
                  $('maindialog').addClass('invisible');
                  noInstancePopUp()
              }
              button = $("rdpconnect");
              button.removeEvents();
              button.value = 'Connect';
              button.addEvent('click', function(){RDPStart();});
              OnDesktopSize();
              window.addEvent('resize', OnDesktopSize);
              }); */
      rdp.addEvent('mouserelease', ResetRdpMouseFlags);
      /* rdp.addEvent('touch2', function() {
          ShowMouseHelper(document.getElementById('mousehelper').hasClass('invisible'));
      }); */
      rdp.addEvent('touch3', function() {
          vkbd.toggle();
      });
      rdp.addEvent('touch4', function() {
          if (confirm('Are you sure you want to disconnect?')) {
              rdp.Disconnect();
          }
      });
      showDialog(false);
      rdp.Run();
  }

  /* function SetRdpMouseFlags() {
      var mf = {
          'r': document.getElementById('rclick').checked,
          'm': document.getElementById('mclick').checked,
          'a': document.getElementById('aclick').checked,
          's': document.getElementById('sclick').checked,
          'c': document.getElementById('cclick').checked,
      };
      rdp.SetArtificialMouseFlags(mf);
  }
  function ResetRdpMouseFlags() {
    document.getElementById('rclick').checked = false;
    document.getElementById('mclick').checked = false;
    document.getElementById('aclick').checked = false;
    document.getElementById('sclick').checked = false;
    document.getElementById('cclick').checked = false;
      rdp.SetArtificialMouseFlags(null);
  }
  function ShowMouseHelper(show) {
      var mh = document.getElementById("mousehelper");
      inDrag = false;
      if (show) {
          mh.setStyles({'position':'absolute','top':mhy,'left':mhx,'z-index':999});
          mh.addEvent('mousedown',DragStart);
          document.getElementById('rclick').addEvent('change', SetRdpMouseFlags);
          document.getElementById('mclick').addEvent('change', SetRdpMouseFlags);
          document.getElementById('aclick').addEvent('change', SetRdpMouseFlags);
          document.getElementById('sclick').addEvent('change', SetRdpMouseFlags);
          document.getElementById('cclick').addEvent('change', SetRdpMouseFlags);
          mh.removeClass('invisible');
      } else {
          mh.removeEvents();
          mh.addClass('invisible');
          document.getElementById('rclick').removeEvents();
          document.getElementById('mclick').removeEvents();
          document.getElementById('aclick').removeEvents();
          document.getElementById('sclick').removeEvents();
          document.getElementById('cclick').removeEvents();
      }
  } */

  function OnDesktopSize() {
     ResizeCanvas('auto');
     //DrawLogo();
  }

  function DragStart(evt) {
      var mh = document.getElementById('mousehelper');
      if (!mh.hasClass('invisible')) {
          inDrag = true;
          dragX = evt.page.x;
          dragY = evt.page.y;
          window.addEvent('mouseup',DragEnd);
          window.addEvent('touchmove',DragMove);
      }
  }
  function DragEnd(evt) {
      inDrag = false;
      var mh = document.getElementById('mousehelper');
      window.removeEvent('touchmove',DragMove);
      window.removeEvent('mouseup',DragEnd);
  }
  function DragMove(evt) {
      if (inDrag) {
          var dx = evt.page.x - dragX;
          var dy = evt.page.y - dragY;
          dragX = evt.page.x;
          dragY = evt.page.y;
          var mh = document.getElementById('mousehelper');
          if (!mh.hasClass('invisible')) {
              mhx += dx;
              mhy += dy;
              mh.setStyles({'top':mhy,'left':mhx});
          }
      }
  }

/*   function DrawLogo() {
          var logo = new Element('img', {'src': 'empty_on_purpose'});
          logo.addEvent('load', function() {
      var scaleWCoeficient = 0.5;
      var scaleHCoeficient = 0.5;
                  var iw = this.width * scaleWCoeficient;
                  var ih = this.height * scaleHCoeficient;
                  var scale = (myCanvas.height - 20) / ih;
                  myCanvas.getContext('2d').drawImage(this, 10, 10, Math.round(iw * scale), Math.round(ih * scale));
          }.bind(logo));
  } */

  function ResizeCanvas(sz) {
      var w, h;
      if (sz == 'auto') {
          w = window.getCoordinates().width;
          h = window.getCoordinates().height;
          if (RIMtablet) {
              // Toplevel bar not removable
              h -= 31;
          }
          if (w % 2) {
              w -= 1;
          }
      } else {
          var sza = sz.split('x');
          var w = sza[0];
          var h = sza[1];
      }
      myCanvas.width = w-50;
      myCanvas.height = h-50;
      myCanvas.style["margin"] = "0 auto";
  }

/* var sendDisconnect = function() {
if (confirm('Are you sure you want to disconnect ?')) {
  $('extracommands').setStyles({'visibility':'hidden'});
  rdp.Disconnect();
}
  } */

  var altTabOn = false;
  function altTabEvent(){
      if(altTabOn){
          altTabOn = false;
          rdp.SendKey(2);//alt+tab release
          document.getElementById('alttab').removeClass('extracommandshold');
      }
      else{
          altTabOn = true;
          rdp.SendKey(1);//alt+tab
          document.getElementById('alttab').addClass('extracommandshold');
      }
  }

  /* function showDialog(show) {
      if (show) {
          ShowMouseHelper(false);
          var dlg = document.getElementById('maindialog');
          var x = Math.round((window.getCoordinates().width - dlg.getCoordinates().width) / 2) + 'px';
          var y = Math.round((window.getCoordinates().height - dlg.getCoordinates().height) / 2) + 'px';
          $('extracommands').setStyles(
          {
              'visibility':'hidden'
          });
          $('dvLoading').setStyles(
          {
              'visibility':'hidden'
          });
          DrawLogo();
          dlg.setStyles({
                  'position': 'absolute',
                  'top': y,
                  'left': x,
                  'z-index': 999
                  }).removeClass('invisible');
      } else {
          $('maindialog').addClass('invisible');
          $('extracommands').setStyles(
          {
              'visibility':'visible'
          });
          $('ctrlaltdelete').addEvent('click', function(){ rdp.SendKey(0); });
          $('alttab').addEvent('click', altTabEvent);
          $('disconnect').addEvent('click', sendDisconnect);
      }
  } */

  /* var RDPCookieKey = "RDPinfoJSON";
  //sets a cookie with the settings inserted in the form
  function settingsSet(){
      var infoJSON = settingsGetJSON();
      //remove password
      infoJSON.pass = "";
      document.cookie = RDPCookieKey + "=" + JSON.stringify(infoJSON) + "; expires=Fri, 31 Dec 2030 23:59:59 GMT;";
  }
  //change the form fields with respect with the cookie
  function settingsApply(){
      var cookie = document.cookie;
      if(cookie){
          var cookieValues = cookie.split(';');
          var i = 0;
          //get the cookie for infoJSON
          while(cookieValues[i].indexOf(RDPCookieKey) == -1){
              i++;
          }
          //get the value of the cookie then parse it to a JSON
          try{
              var infoJSON = JSON.parse(cookieValues[i].split('=')[1]);
              //if we found a JSON we apply the values to the form fields
              if(infoJSON){
                  $('rdphost').set('value',infoJSON.host);
                  $('rdpport').set('value',infoJSON.port);
                  $('rdppcb').set('value',infoJSON.pcb);
                  $('rdpuser').set('value',infoJSON.user);
                  $('nowallp').set('checked', infoJSON.nowallp != 0);
                  $('nowdrag').set('checked', infoJSON.nowdrag != 0);
                  $('nomani').set('checked', infoJSON.nomani != 0);
                  $('notheme').set('checked', infoJSON.notheme != 0);
                  $('nonla').set('checked', infoJSON.nonla != 0);
                  $('notls').set('checked', infoJSON.notls != 0);
              }
          } catch (e){
              console.log("Bad JSON format");
              console.log(e.message);
          }
      }
  }
  //gets a JSON with the settings inserted in the form
  function settingsGetJSON(){
      return {"host"   : $('rdphost').value.trim()
             ,"port"   : parseInt($('rdpport').value.trim())
             ,"pcb"    : $('rdppcb').value.trim()
             ,"user"   : $('rdpuser').value.trim()
             ,"pass"   : $('rdppass').value
             ,"perf"   : parseInt($('perf').value.trim())
             ,"fntlm"  : parseInt($('fntlm').value.trim())
             ,"nowallp": parseInt($('nowallp').checked ? '1' : '0')
             ,"nowdrag": parseInt($('nowdrag').checked ? '1' : '0')
             ,"nomani" : parseInt($('nomani').checked ? '1' : '0')
             ,"notheme": parseInt($('notheme').checked ? '1' : '0')
             ,"nonla"  : parseInt($('nonla').checked ? '1' : '0')
             ,"notls"  : parseInt($('notls').checked ? '1' : '0')
             ,"dtsize" : 'auto'
             };
  } */

  /* window.addEventListener("beforeunload", function() {
      if ($('maindialog').hasClass('invisible')){
          var ans = confirm("Are you sure you want to disconnect?");
          if (ans) {
              rdp.Disconnect();
          }
      }
  }, false); */

/*   window.addEvent('domready', function() {

          var querystring = window.location.href.slice(window.location.href.indexOf('?'))

          //$('dtsize').addEvent('change', OnDesktopSize);
          //var tabs = new SimpleTabs('rdpdialog',{selector:'h4'});
          OnDesktopSize();
          if (RIMtablet) {
              // Set default performance flags to modem
              $('perf').value = '2';
          }
          window.addEvent('resize', OnDesktopSize);
          // Special handling of webkit nightly builds
          var webkitOK = false;
          var wkVA = RegExp("( AppleWebKit/)([^ ]+)").exec(navigator.userAgent);
          if (wkVA && (wkVA.length > 2)) {
              if (wkVA[2].indexOf('+') != -1) {
                  webkitOK = true;
              }
          }
          var wsOK = RIMtablet || webkitOK ||
              (Browser.firefox && (Browser.version >= 11.0)) ||
              (Browser.chrome && (Browser.version >= 17)) ||
              (Browser.safari && (Browser.version >= 6)) ||
              (Browser.ie && (Browser.version >= 10.0));
          if(externalConnection == true)
          {
              RDPStart();
              vkbd = new wsgate.vkbd({
                  version:false,
                  sizeswitch:false,
                  numpadtoggle:false
              });
          }
          if (wsOK) {
              if(querystring.length > 2)
              {
                  showDialog(false);
                  if (querystring.indexOf('token=')>=0){
                      //$('disconnect').setStyles({'visibility':'hidden'});
                      embedded = true;
                  }
                  var urlParams;
                  (window.onpopstate = function () {
                      var match,
                          pl     = /\+/g,  // Regex for replacing addition symbol with a space
                          search = /([^&=]+)=?([^&]*)/g,
                          decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                          query  = window.location.search.substring(1);

                      urlParams = {};
                      while (match = search.exec(query))
                         urlParams[decode(match[1])] = decode(match[2]);
                  })();
                  RDPStart(wsBase + querystring, urlParams["title"]);
              }
              else
              {
                  //$('rdpconnect').addEvent('click', function(){RDPStart();});
                  showDialog(true);
              }
              vkbd = new wsgate.vkbd({
                  version:false,
                  sizeswitch:false,
                  numpadtoggle:false
              });
          } else {
              alert('Sorry!\nYour Browser (' + Browser.name + ' ' + Browser.version
                      + ') does not yet\nprovide the required HTML5 features '
                      + 'for this application.\n');
          }
  }); */