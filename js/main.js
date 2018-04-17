'use strict';
var ApiAddressRDP = "https://skdambstsd01.dealers.skoda.vwg/Myrtille/";
var ApiAddressDB = "https://skdambstsd01.dealers.skoda.vwg/ddbapi/";
var ApiAddressDMS = "https://skdambstsd01.dealers.skoda.vwg/DMSRestAPI/";

var config = {
    layout: {
        name: 'layout',
        padding: 0,
        panels: [
           // { type: 'left', size: '70%', resizable: true, minSize: 300 },
           //{ type: 'top',  size: 50, resizable: true, hidden:true, style: pstyle, content: 'top' },
           { type: 'left', size: '40%', resizable: false },
           { type: 'main' },
           //{ type: 'preview', size: '50%', resizable: true, style: pstyle, content: 'preview' },
           { type: 'right', size: '40%', resizable: true },
           // { type: 'right', size: '45%',style: pstyle + 'border-top: 0px;', content: 'content' },
            { type: 'bottom', size: '40%', resizable: true }
        ]
    },
    layout2: {
        name: 'layout2',
        padding: 0,
        panels: [
          { type: 'left',size: '60%', resizable: true },
          { type: 'right', size: '40%', resizable: true },
        ]
    },
    grid: { 
        name: 'grid',
        recid: 'id',
        reorderColumns: true,
        multiSearch: true,
        searches: [
            { field: 'nazevobch', caption: 'Název obchodníka', type: 'text', operator: 'contains', simple:true },
            { field: 'cisloobch', caption: 'Číslo obchodníka', type: 'text', operator: 'contains', simple:true },
            { field: 'domena', caption: 'Doména', type: 'text', operator: 'contains', simple:true },
            { field: 'mesto', caption: 'Město', type: 'text', operator: 'contains', simple: true },
            { field: "licence_dmsczsk", caption: "Licence DMS",type: 'int', operator: 'between', simple: false},
        ],
      /*  search.simple - t/f - display or not in simple search drop down
        search.hidden - t/f - if search is a hidden search, user cannot change it by it will be sent to the server
        search.value - value for the search used in hidden search
        search.operator - default operator one of ['is', 'begins', 'contains', 'ends', 'between', 'less', 'more', 'in', 'not in', 'null', 'not null']
         */
       /*  menu: [
            { id: 1, text: 'Select Item', icon: 'fa-star' },
            { id: 2, text: 'View Item', icon: 'fa-camera' }, 
            { id: 6, text: '', icon: 'fa-minus' }
        ], */
        show: {
                toolbar            : true,
                toolbarDelete: true,
                //toolbarAdd: true,
                //expandColumn: true,
                //selectColumn: true,
                footer: true
        },
        
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'spacer' },
                { type: 'button', id: 'selectallgrid', caption: '', icon: 'fa fa-stack-exchange', tooltip: 'Select all rows' },
                { type: 'check', id: 'selectactive', caption: '', icon: 'fa fa-heartbeat', tooltip: 'Show active dealers only OR all incl. deleted' },
                { type: 'button', id: 'exportdealergrid', caption: '', icon: 'fa fa-download', tooltip: 'Export grid' }
            ],
            onClick: async function (target, data) {
                if (target == 'exportdealergrid') {   
                    
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['grid'].records;
                    w2ui['grid'].vs_extra = allRecords.length;
                    w2ui['grid'].reload();

                    w2ui['grid'].selectAll();
                    var selectedIds = w2ui['grid'].getSelection();
                    
                    var selectedRecords = [];
                    for (var row in selectedIds) {
                        //vyfiltruje data vybraných podle jejich id
                        var record = getObjects(allRecords, 'id', selectedIds[row]);
                        selectedRecords = selectedRecords.concat(record);
                    }   
                    w2ui['grid'].selectNone();
                    
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: selectedRecords
                        , columns: getColumns(selectedRecords)     
                    }); 

                    //nastaví zpět buffer pro zobrazování
                    w2ui['grid'].vs_extra = 0;
                    w2ui['grid'].reload();
                }
                if (target == 'selectallgrid') {   
                    
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['grid'].records;
                    w2ui['grid'].vs_extra = allRecords.length;
                    w2ui['grid'].reload();
                    w2ui['grid'].selectAll();
                }
                if (target == 'selectactive') { 
                    if (!data.item.checked) {
                        w2ui['grid'].records = await FetchAsync('dealers', 'get');
                        w2ui['grid'].reload();
                    } else { 
                        w2ui['grid'].records = await FetchAsync('dealers?vyrazeny=eq.false','get');
                        w2ui['grid'].reload();
                    }
                }
            }    
        },
        columns: [
            { field: 'cisloobch', caption: 'Číslo obch.', size: '75px', sortable: true, searchable: true,info: true },
            //{ field: 'sdate', caption: 'Start Date', size: '120px', render: 'date' },
            { field: 'nazevobch', caption: 'Název obchodníka', sortable: true, searchable: true },
            { field: 'mesto', caption: 'Město', sortable: true, searchable: true },
            { field: 'druhdms', caption: 'Druh DMS', sortable: true, searchable: true, size: '100px' },
            { field: 'zeme', caption: 'Země', sortable: true, searchable: true ,size: '75px'},
            { field: 'skoda', caption: 'Škoda',sortable: true, searchable: true, size: '75px',
                render: function (record) {
                    if ((record.serv_smlouva == true) || (record.prod_smlouva == true)) {
                        return true;
                    } else { return false; }
                }
            },
            { field: 'ost_koncern', caption: 'Ost. konc.', sortable: true, searchable: true, size: '75px', editable: { type: 'checkbox' },
                render: function (data) {
                    if ((data.serv_smlouva_a == true) || (data.prod_smlouva_a == true) || (data.serv_smlouva_v == true) || (data.prod_smlouva_v == true) || (data.serv_smlouva_s == true) || (data.prod_smlouva_s == true) || (data.serv_smlouva_n == true) || (data.prod_smlouva_n == true)) {
                        return true;
                    } else { return false; }
                }
            },
        //hidden by default
            { field: 'domena', caption: 'Doména', sortable: true, searchable: true, hidden: true },
            { field: "ulice",  caption: "Ulice", hidden: true, searchable: true,sortable: true  },
            
            { field: "pobocka_cis_hlavni", caption: "Číslo matky", hidden: true, searchable: true,sortable: true  },
            { field: "psc", caption: "PSČ", hidden: true , searchable: true,sortable: true},
            { field: "ico", caption: "IČO", hidden: true , searchable: true,sortable: true},

            { field: "vlastni_dms", caption: "Vlastní DMS?", hidden: true , searchable: true,sortable: true},
            { field: "licence_dmsczsk", caption: "Licence DMS", hidden: true, searchable: true,sortable: true},
            { field: "port", caption: "DMS Port", hidden: true, searchable: true,sortable: true},
            { field: "ipdms", caption: "DMS IP" , hidden: true , searchable: true,sortable: true},
            { field: "sid", caption: "DMS SID" , hidden: true, searchable: true,sortable: true },
            { field: "dbuser", caption: "DMS Db User" , hidden: true, searchable: true,sortable: true },
            { field: "dbpassuser", caption: "DMS Db User Password", hidden: true , searchable: true,sortable: true },
            { field: "dbpasssys", caption: "DMS Db Sys Password", hidden: true, searchable: true,sortable: true },
            { field: "pozn_dms", caption: "DMS Poznámka", hidden: true, searchable: true,sortable: true },

            { field: "vlastni_btac", caption: "Vlastní BTAC?", hidden: true , searchable: true,sortable: true},
            { field: "ipbtac", caption: "BTAC IP" , hidden: true , searchable: true,sortable: true},
            { field: "userbtac", caption: "BTAC Uživatel", hidden: true , searchable: true,sortable: true},
            { field: "heslobtac", caption: "BTAC Heslo" , hidden: true , searchable: true,sortable: true},
            { field: "pozn_btac", caption: "BTAC Poznámka", hidden: true, searchable: true,sortable: true },
            { field: "snbtacbox", caption: "BTAC Box SN", hidden: true , searchable: true,sortable: true },
            { field: "ipbtacbox", caption: "BTAC Box IP", hidden: true, searchable: true,sortable: true },

            { field: "linka_aktivni", caption: "IP DealNet připojení?", hidden: true , searchable: true,sortable: true },
            { field: "iprozsah", caption: "IP Rozsah", hidden: true, searchable: true,sortable: true},
            { field: "iprozsah_mask", caption: "IP Rozsah Maska" , hidden: true , searchable: true,sortable: true},
            { field: "iprouterlan", caption: "IP Router Lan", hidden: true , searchable: true,sortable: true },
            { field: "iprouterwan", caption: "IP Router Wan", hidden: true, searchable: true,sortable: true },
            { field: "pozn_linka", caption: "IP Poznámka", hidden: true , searchable: true,sortable: true},

            { field: "poznamka", caption: "Poznámka", hidden: true, searchable: true,sortable: true },

            { field: "serv_smlouva", caption: "Servis Škoda", hidden: true, searchable: true,sortable: true},
            { field: "prod_smlouva", caption: "Prodej Škoda",hidden: true , searchable: true,sortable: true},
            { field: "serv_smlouva_v", caption: "Servis VW", hidden: true , searchable: true,sortable: true},
            { field: "prod_smlouva_v", caption: "Prodej VW", hidden: true , searchable: true,sortable: true},
            { field: "serv_smlouva_a", caption: "Servis Audi", hidden: true, searchable: true,sortable: true },
            { field: "prod_smlouva_a", caption: "Prodej Audi", hidden: true, searchable: true,sortable: true },
            { field: "serv_smlouva_s", caption: "Servis Seat", hidden: true, searchable: true,sortable: true },
            { field: "prod_smlouva_s", caption: "Prodej Seat", hidden: true, searchable: true,sortable: true },
            { field: "serv_smlouva_n", caption: "Servis Nutzfahrzeuge", hidden: true, searchable: true,sortable: true },
            { field: "prod_smlouva_n", caption: "Prodej Nutzfahrzeuge", hidden: true, searchable: true,sortable: true },
            { field: "neaut_opravce", caption: "Neautorizovaný", hidden: true, searchable: true,sortable: true },
            { field: "dodavatel", caption: "Dodavatel", hidden: true, searchable: true,sortable: true },
            { field: "jiny", caption: "Jiné zařazení", hidden: true , searchable: true,sortable: true},

            { field: "cpn_c_user", caption: "VW Portal uživatel C", hidden: true, searchable: true,sortable: true },
            { field: "cpn_c_pass", caption: "VW Portal heslo C", hidden: true, searchable: true,sortable: true },
            { field: "cpn_0_user", caption: "VW Portal uživatel 0", hidden: true, searchable: true,sortable: true },
            { field: "cpn_0_pass", caption: "VW Portal heslo 0", hidden: true, searchable: true,sortable: true },

            { field: "id", caption: "Dealer Id", hidden: true, searchable: true,sortable: true },
            { field: 'vyrazeny', caption: 'Vyřazený', sortable: true, searchable: true, hidden: true, editable: { type: 'checkbox' } }
        ],
            onClick: function(event) {
            var grid = this;
            var form = w2ui['form'];
            //console.log(event);
            event.onComplete = async function () {
                var sel = grid.getSelection();
                //console.log(sel);
                if (sel.length == 1) {
                    form.recid = sel[0];
                    var record = grid.get(sel[0]);

                    //dešifruje heslo na dms server
                    let hesloDmsSrvText = record["heslodmssrv"];
                    await fetch(ApiAddressDMS + 'api/password/Decrypt/' + btoa(hesloDmsSrvText) + '/', { method: 'GET', headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }) })
                    .then((resp) => resp.text())
                    .then(function (data) {
                        hesloDmsSrvText = data.slice(1, -1);
                        delete record["heslodmssrv"];
                        record["heslodmssrv"] = atob(hesloDmsSrvText);
                       }); 

                    form.record = $.extend(true, {}, record);
                    form.refresh();

                    //async - asi trochu rychlejší než sync
                   /*  fetch(ApiAddressDB + 'resultsbydealerid?dealerid=eq.' + record.id,{ method: 'GET', headers: new Headers({ 'Authorization': 'Bearer ' + window.sessionStorage.accessToken, 'Content-Type': 'application/json' })  })
                        .then((resp) => resp.json())
                        .then(function (data) {
                            w2ui['gridResults'].records = data;
                            w2ui['gridResults'].refresh();
                        })
                        .catch(function (error) {
                            console.log(error);
                          });    */

                        //sync
                        w2ui['gridResults'].records = await FetchAsync('resultsbydealerid?dealerid=eq.' + record.id,'get');
                        w2ui['gridResults'].refresh();

                    
                    //async - asi trochu rychlejší než sync
                   /*  fetch(ApiAddressDB + 'contacts?dealersdataid=eq.' + record.id,{ method: 'GET', headers: new Headers({ 'Authorization': 'Bearer ' + window.sessionStorage.accessToken, 'Content-Type': 'application/json' })  })
                    .then((resp) => resp.json())
                    .then(function (data) {
                    w2ui['gridContacts'].records = data;
                    w2ui['gridContacts'].refresh();
                    });
                     */
                    //sync
                    w2ui['gridContacts'].records = await FetchAsync('contacts?dealersdataid=eq.' + record.id,'get');
                    w2ui['gridContacts'].refresh();

                    //ping na ip adresu - podle výsledku obarví pole formu, ,,, proč to nedělat ve formu???
                    $(w2ui.form.get('ipdms').el).css({'background-color': '' });
                    if (record.ipdms.length > 1) {
                        fetch(ApiAddressDMS + 'api/ping/get/' + record.ipdms + '/',{ method: 'GET', headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })  })
                        .then((resp) => resp.text())
                        .then(function (data) {
                             if (data == 'true') {
                                $(w2ui.form.get('ipdms').el).css({'background-color': 'lightgreen' });
                            } else {
                                $(w2ui.form.get('ipdms').el).css({'background-color': 'red' });
                            }
                        });
                        }

                } else {
                    form.clear();
                }
            }
        },
       /*  onExpand: function (event) {
            $('#' + event.box_id).html('some html').animate({ height : 100 }, 100);
        }, */
        onDelete: async function (event) {
            if (event.force == true) { 
                var selectedRecid = w2ui.grid.getSelection();
                var selectedRecord = w2ui.grid.get(selectedRecid[0]);
                event.onComplete = async function() {
                    await FetchAsync('dealers?id=eq.'+ selectedRecord.id,'delete');
                }
             }
        }        
    }, 
    gridResults: { 
        name: 'gridResults',
        recid: 'dotazid',
        show: {
            toolbar : true,
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'spacer' },
                { type: 'menu', id: 'requestgroup', caption: 'Category', icon: 'fa fa-th-large'  },
                { type: 'menu', id: 'requests', caption: 'Request',  icon: 'fa fa-th', disabled: true  },
                { type: 'drop', id: 'requestsql', caption: 'SQL', icon: 'fa fa-font', disabled: true },
                { type: 'break' },
                { type: 'button',   id: 'requestsend', caption: '', icon: 'fa fa-bolt',disabled: true },
               // { type: 'drop', id: 't1categoryselect2', html: '<div><select id="categoryselect2" style="width: 300px;"> </select> <div style="padding-top: 15px; margin-left: -5px;"></div></div>' }
            ],
            onClick: async function (target, data) {

                //console.log(data);
                if (data.subItem && data.item.id == 'requestgroup') { 
                    w2ui.gridResults_toolbar.set('requestgroup', { text: data.subItem.text });
                    w2ui.gridResults_toolbar.set('requests', { disabled: false });

                    let requests = await FetchAsync('RequestsView?groupid=eq.' + data.subItem.value,'get');
                    w2ui.gridResults_toolbar.set('requests', { items: requests });
                    
                   // GetRequests(data.subItem.value);
                } 
                if (data.subItem && data.item.id == 'requests') { 
                    w2ui.gridResults_toolbar.set('requestsql', { disabled: false });
                    w2ui.gridResults_toolbar.set('requestsend', { disabled: false });
                    w2ui.gridResults_toolbar.set('requests', { text: data.subItem.text });
                    w2ui.gridResults_toolbar.set('requestsql', { html: '<textarea rows="4" cols="80">' + data.subItem.value + '</textarea>' });
                    
                    sessionStorage.selectedRequestID = data.subItem.id;
                    sessionStorage.selectedRequestSQL = data.subItem.value;
                }
                if (target == 'requestsend') { 
                    var selectedIds = w2ui['grid'].getSelection();

                    for (var row in selectedIds) {
                        var record = w2ui['grid'].get(selectedIds[row]);
                        if (record == undefined) { toastr.warning('Vyber dealera!') }
                        else {
                            if(sessionStorage.selectedRequestSQL == 0 || record.ipdms.length == 0 || record.port.length == 0 || record.sid.length == 0 || record.dbuser.length == 0 || record.dbpassuser.length == 0) {
                                toastr.error('Některý z připojovacích údajů chybí!') ;
                            }else{
                                var request = {
                                    SQL: sessionStorage.selectedRequestSQL,
                                    Ip: record.ipdms,
                                    Port: record.port,
                                    SID: record.sid,
                                    User: record.dbuser,
                                    Password: record.dbpassuser
                                 }
                                await GetResult(record.id, record.cisloobch, sessionStorage.selectedRequestID, request);
                            }
                        }
                    }   
                }
            }     
        }, 
        columns: [
            { field: 'datum', caption: 'Datum', size: '140px', render: 'isodate',sortable: true, searchable: true },
            { field: 'popis', caption: 'Dotaz', size: '80%', sortable: true, searchable: true },
            { field: 'vysledek', caption: 'Odpověď', sortable: true, searchable: true }
        ]/* ,
        onClick: async function (event) {

            w2ui.gridResults_toolbar.enable('requests');
            //w2ui.gridResults_toolbar.enable('requests:' + event.recid);
            w2ui.gridResults_toolbar.show('requests:94');

            console.log(event.recid);
        } */
    }, 
    gridContacts: { 
        name: 'gridContacts',
        recid: 'id',
        reorderColumns: true,
        show: {
                toolbar            : true,
                toolbarAdd: true,
                toolbarSave: true,
                toolbarDelete: true,
                footer: true
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'spacer' },
                { type: 'break' },
                { type: 'button', id: 'exportcontactsgrid', caption: '', icon: 'fa fa-download' }
            ],
            onClick: function (target, data) {
                //console.log(data);
                if (target == 'exportcontactsgrid') {   
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['gridContacts'].records;
                    w2ui['gridContacts'].vs_extra = allRecords.length;
                    w2ui['gridContacts'].reload();

                    w2ui['gridContacts'].selectAll();
                    var selectedIds = w2ui['gridContacts'].getSelection();
                    
                    var selectedRecords = [];
                    for (var row in selectedIds) {
                        //vyfiltruje data vybraných podle jejich id
                        var record = getObjects(allRecords, 'id', selectedIds[row]);
                        selectedRecords = selectedRecords.concat(record);
                    }   
                    w2ui['gridContacts'].selectNone();
                    
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: selectedRecords
                        , columns: getColumns(selectedRecords)     
                    }); 
                    //nastaví zpět buffer pro zobrazování
                    w2ui['gridContacts'].vs_extra = 0;
                    w2ui['gridContacts'].reload();
                    }
            }    
        },
        columns: [
            { field: 'datum', caption: 'Datum', size: '80px', render: 'isodate',sortable: true, searchable: true },
            { field: 'jmeno', caption: 'Jméno', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'prijmeni', caption: 'Příjmení', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'telefon1', caption: 'Telefon 1', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'telefon2', caption: 'Telefon 2', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'email', caption: 'Email', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'funkce', caption: 'Role', size: '40px', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'preferovany', caption: 'Preferovaný', size: '80px', sortable: true, searchable: true, editable: { type: 'text' } },
            { field: 'dealersdataid', caption: 'Dealer Id', sortable: true, searchable: true, hidden:true}
        ],
        onAdd: function (event) {
            var selectedRecid = w2ui['grid'].getSelection();
            var selectedDealer = w2ui.grid.get(selectedRecid[0])
            var g = w2ui.gridContacts.records.length;
            w2ui.gridContacts.add({ recid: g + 1, datum: getDateTime(), dealersdataid: selectedDealer.id }, true);
            w2ui.gridContacts.editField(g + 1, 1);
        },
        onSave: function (event) {
            event.onComplete = async function () {
                var recid = event.changes["0"].recid;
                var arr = event.changes["0"];
                var record = w2ui.gridContacts.get(recid);

                if (!record.id) {
                    delete record["recid"];
                    delete record["w2ui"];
                   // record["dealersdataid"] = 
                    await FetchAsync('contacts', 'post', record); 
                    w2ui.gridContacts.reload();
                    
                } else {
                    delete arr["recid"];
                    await FetchAsync('contacts?id=eq.' + record.id, 'patch', arr); 
                    w2ui.gridContacts.reload();
                }
            }
        },
        onDelete: async function (event) {
            if (event.force == true) { 
                var selectedRecid = w2ui['gridContacts'].getSelection();
                var selectedContact = w2ui.gridContacts.get(selectedRecid[0]);
                
                event.onComplete = async function() {
                    await FetchAsync('contacts?id=eq.'+ selectedContact.id,'delete');
                }
             }
        }        
    },
    gridResultsAll: { 
        name: 'gridResultsAll',
        recid: 'resultid',
        show: {
            toolbar : true,
            footer: true
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'button', id: 'exportresultsallgrid', caption: 'Export', icon: 'fa fa-download' },
                { type: 'break' },
                { type: 'spacer' },
                { type: 'break' },
                { type: 'menu', id: 'requestgroup', caption: 'Category',  icon: 'fa fa-th-large' },
                { type: 'menu', id: 'requests', caption: 'Requests',  icon: 'fa fa-th', disabled: true },
                { type: 'drop', id: 'requestsql', caption: 'SQL',  icon: 'fa fa-font', disabled: true }
               // { type: 'button',   id: 'requestsend', caption: 'Send',img: 'w2ui-icon-search'},
            ],
            onLoad: function(event) {
                toastr.success('Vyber dotaz');
            },    
            onClick: async function (target, data) {
                //console.log(data);
                if (data.subItem && data.item.id == 'requestgroup') { 
                    w2ui.gridResultsAll_toolbar.set('requests', { disabled: false });
                    w2ui.gridResultsAll_toolbar.set('requestgroup', { text: data.subItem.text });

                    let requests = await FetchAsync('RequestsView?groupid=eq.' + data.subItem.value,'get');
                    //w2ui.gridResults_toolbar.set('requests', { items: requests });
                    w2ui.gridResultsAll_toolbar.set('requests', { items: requests });    
                } 
                if (data.subItem && data.item.id == 'requests') { 
                    w2ui.gridResultsAll_toolbar.set('requestsql', { disabled: false });
                    w2ui.gridResultsAll_toolbar.set('requests', { text: data.subItem.text });
                    w2ui.gridResultsAll_toolbar.set('requestsql', { html: '<textarea rows="5" cols="150">' + data.subItem.value + '</textarea>' });

                    w2ui['gridResultsAll'].records = await FetchAsync('LastResultView?dotazid=eq.' + data.subItem.id,'get');;
                    w2ui['gridResultsAll'].reload();
                }
                if (target == 'exportresultsallgrid') {   
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: w2ui['gridResultsAll'].records
                        , columns: getColumns(w2ui['gridResultsAll'].records)     
                    }); 
                    }
            }     
        }, 
        columns: [
            { field: 'datum', caption: 'Datum', size: '140px', render: 'isodate',sortable: true, searchable: true },
            { field: 'popis', caption: 'Dotaz', sortable: true, searchable: true },
            { field: 'vysledek', caption: 'Odpověď', sortable: true, searchable: true },
            { field: 'cisloobch', caption: 'Číslo obch.', size: '100px',sortable: true, searchable: true },
            { field: 'nazevobch', caption: 'Název obch.', sortable: true, searchable: true },
            { field: 'domena', caption: 'Doména', size: '100px',sortable: true, searchable: true },
            { field: 'mesto', caption: 'Město',size: '200px', sortable: true, searchable: true },
            { field: 'zeme', caption: 'Země', size: '50px',sortable: true, searchable: true },
            { field: 'skoda', caption: 'Škoda', size: '100px', sortable: true, searchable: true },
            { field: 'ost_koncern', caption: 'Ost. koncern',size: '100px', sortable: true, searchable: true},
            { field: 'vlastni_dms', caption: 'Vlastní DMS',size: '100px', sortable: true, searchable: true }
        ]
    },
    gridContactsAll: { 
        name: 'gridContactsAll',
        recid: 'id',
        show: {
            toolbar: true,
            toolbarSave: true,
            toolbarDelete: true,
            toolbarAdd: true
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'button', id: 'exportcontactsAllgrid', caption: 'Export', icon: 'fa fa-download' },
                { type: 'break' }
            ],
            onClick: function (target, data) {
                console.log(data);
                
                if (target == 'w2ui-add') {
                    w2ui.gridContactsAll.add($.extend(true, { recid: w2ui.gridContactsAll.records.length + 1 }, { datum: getDateTime() }),true);
                   // w2ui.gridContactsAll.sort('datum', 'desc');
                    w2ui.gridContactsAll.reload();
                }

                
               /*  if (data.subItem && data.item.id == 'requestgroup') { 
                    w2ui.gridResultsAll_toolbar.set('requests', { disabled: false });
                    w2ui.gridResultsAll_toolbar.set('requestgroup', { text: data.subItem.text });
                    GetRequests(data.subItem.value);
                } 
                if (data.subItem && data.item.id == 'requests') { 
                    w2ui.gridResultsAll_toolbar.set('requestsql', { disabled: false });
                    w2ui.gridResultsAll_toolbar.set('requests', { text: data.subItem.text });
                    w2ui.gridResultsAll_toolbar.set('requestsql', { html: '<textarea rows="5" cols="150">' + data.subItem.value + '</textarea>' });
                    LoadResults(data.subItem.id);
                } */
                if (target == 'exportcontactsAllgrid') {   
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: w2ui['gridContactsAll'].records
                        , columns: getColumns(w2ui['gridContactsAll'].records)     
                    }); 
                    }
            }      
        }, 
        columns: [
            { field: 'datum', caption: 'Datum', size: '140px', render: 'isodate',sortable: true, searchable: true, editable: { type: 'text' } },
            { field: 'jmeno', caption: 'Jméno', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'prijmeni', caption: 'Příjmení', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'telefon1', caption: 'Telefon 1', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'telefon2', caption: 'Telefon 2', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'email', caption: 'Email', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'funkce', caption: 'Role', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'preferovany', caption: 'Preferovaný', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'cisloobch', caption: 'Číslo obch.', size: '100px', sortable: true, searchable: true,editable: { type: 'text' } },
            { field: 'dealersdataid', caption: 'Id obch.', size: '100px',sortable: true, searchable: true },
            
        ]
    },
    gridRequestGroups: { 
        name: 'gridRequestGroups',
        recid: 'id',
        reorderColumns: false,
        show: {

            toolbar         : true,
            toolbarReload   : false,
            toolbarColumns  : false,
            toolbarSearch: false,
            toolbarInput: false,
            toolbarAdd      : true,
            toolbarDelete   : true,
            toolbarSave     : true
        },
        toolbar: {
            items: [
              //  { type: 'break' },
              //  { type: 'spacer' },
              //  { type: 'break' }
               // { type: 'button', id: 'exportrequestgroupsgrid', caption: 'Export', icon: 'fa fa-download' }
            ],
            onClick: function (target, data) {
                //console.log(data);
                if (target == 'exportrequestgroupsgrid') {   
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['gridRequestGroups'].records;
                    w2ui['gridRequestGroups'].vs_extra = allRecords.length;
                    w2ui['gridRequestGroups'].reload();

                    w2ui['gridRequestGroups'].selectAll();
                    var selectedIds = w2ui['gridRequestGroups'].getSelection();
                    
                    var selectedRecords = [];
                    for (var row in selectedIds) {
                        //vyfiltruje data vybraných podle jejich id
                        var record = getObjects(allRecords, 'id', selectedIds[row]);
                        selectedRecords = selectedRecords.concat(record);
                    }   
                    w2ui['gridRequestGroups'].selectNone();
                    
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: selectedRecords
                        , columns: getColumns(selectedRecords)     
                    }); 
                    //nastaví zpět buffer pro zobrazování
                    w2ui['gridRequestGroups'].vs_extra = 0;
                    w2ui['gridRequestGroups'].reload();
                }

            }    
        },
        columns: [
            { field: 'nazev', caption: 'Název', sortable: true, editable: { type: 'text' } },
            { field: 'id', caption: 'id', sortable: true }
        ],
        onSelect: function(event) {
            //console.log(event);
            var record = w2ui['gridRequestGroups'].get(event.recid);
            //console.log(record);
            w2ui.gridRequests.search('skupina_id', record.id);
        },      
        onAdd: function (event) {
            //var newContactId = w2ui.gridRequestGroups.add({ recid: w2ui.gridRequestGroups.records.length + 1 }, true);
            //Create('requestgroups',{});
            var g = w2ui.gridRequestGroups.records.length;
            w2ui.gridRequestGroups.add({ recid: g + 1 }, true);
            w2ui.gridRequestGroups.editField(g + 1, 0);
        },
        onSave:  function (event) {
            event.onComplete = async function () {
                var recid = event.changes["0"].recid;
                var record = w2ui.gridRequestGroups.get(recid);

                if (!record.id) {
                    delete record["recid"];
                    delete record["w2ui"];
                    await FetchAsync('requestgroups', 'post', record); 
                    w2ui.gridRequestGroups.reload();
                    
                } else {
                    var arr = event.changes["0"];
                    delete arr["recid"];
                    await FetchAsync('requestgroups?id=eq.' + record.id, 'patch', arr); 
                    w2ui.gridRequestGroups.reload();
                }
            }
        },
        onDelete: function (event) {
            var sel = w2ui.gridRequestGroups.getSelection();
            var selectedRecord = w2ui.gridRequestGroups.get(sel[0]);
             
            event.onComplete = async function () {
                await FetchAsync('requestgroups?id=eq.'+ selectedRecord.id,'delete');
            }
        }        
    },
    gridRequests: { 
        name: 'gridRequests',
        recid: 'id',
        reorderColumns: true,
        show: {
                toolbar            : true,
                toolbarAdd: true,
                toolbarSave: true,
                toolbarDelete: true,
                footer: true
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'spacer' },
                { type: 'break' },
                { type: 'button', id: 'exportrequestsgrid', caption: 'Export', icon: 'fa fa-download' }
            ],
            onClick: function (target, data) {
                //console.log(data);
                if (target == 'exportrequestsgrid') {   
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['gridRequests'].records;
                    w2ui['gridRequests'].vs_extra = allRecords.length;
                    w2ui['gridRequests'].reload();

                    w2ui['gridRequests'].selectAll();
                    var selectedIds = w2ui['gridRequests'].getSelection();
                    
                    var selectedRecords = [];
                    for (var row in selectedIds) {
                        //vyfiltruje data vybraných podle jejich id
                        var record = getObjects(allRecords, 'id', selectedIds[row]);
                        selectedRecords = selectedRecords.concat(record);
                    }   
                    w2ui['gridRequests'].selectNone();
                    
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: selectedRecords
                        , columns: getColumns(selectedRecords)     
                    }); 
                    //nastaví zpět buffer pro zobrazování
                    w2ui['gridRequests'].vs_extra = 0;
                    w2ui['gridRequests'].reload();
                    }
            }    
        },
        columns: [
            { field: 'popis', caption: 'Popis', sortable: true, size: '30%', searchable: true, editable: { type: 'text' } },
            { field: 'dotaz', caption: 'Dotaz', sortable: true, size: '60%', searchable: true, editable: { type: 'textarea' } },
            { field: 'verejne', caption: 'Veřejný', sortable: true, size: '5%', searchable: true, editable: { type: 'checkbox' } },
            { field: 'skupina_id', caption: 'Skupina', sortable: true, size: '5%',searchable: true, editable: { type: 'text' } }
        ],
        onAdd: function (event) {
            var g = w2ui.gridRequests.records.length;

            var sel = w2ui.gridRequestGroups.getSelection();
            var selectedRecord = w2ui.gridRequestGroups.get(sel[0]);
            console.log(selectedRecord);

            w2ui.gridRequests.add({ recid: g + 1, skupina_id: selectedRecord.id, verejne: false }, true);
            w2ui.gridRequests.editField(g + 1, 0);
        },
        onSave: function (event) {
            event.onComplete = async function () {
                var recid = event.changes["0"].recid;
                var arr = event.changes["0"];
                var record = w2ui.gridRequests.get(recid);

                if (!record.id) {
                    delete record["recid"];
                    delete record["w2ui"];
                    await FetchAsync('requests', 'post', record); 
                    w2ui.gridRequests.reload();
                    
                } else {
                    delete arr["recid"];
                    await FetchAsync('requests?id=eq.' + record.id, 'patch', arr); 
                    w2ui.gridRequests.reload();
                }
                
            }
        },
        onDelete: async function (event) {
            if (event.force == true) { 
                var sel = w2ui.gridRequests.getSelection();
                var selectedRecord = w2ui.gridRequests.get(sel[0]);

                event.onComplete = async function() {
                    await FetchAsync('requests?id=eq.'+ selectedRecord.id,'delete'); 
                }
                
              }
        }        
    },
    gridUsers: { 
        name: 'gridUsers',
        recid: 'id',
        reorderColumns: true,
        show: {
                toolbar            : true,
                toolbarAdd: true,
                toolbarSave: true,
                toolbarDelete: true,
                footer: true
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'spacer' },
                { type: 'break' },
                { type: 'button', id: 'exportusersgrid', caption: 'Export', icon: 'fa fa-download' }
            ],
            onClick: function (target, data) {
                //console.log(data);
                if (target == 'exportusersgrid') {   
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['gridUsers'].records;
                    w2ui['gridUsers'].vs_extra = allRecords.length;
                    w2ui['gridUsers'].reload();

                    w2ui['gridUsers'].selectAll();
                    var selectedIds = w2ui['gridUsers'].getSelection();
                    
                    var selectedRecords = [];
                    for (var row in selectedIds) {
                        //vyfiltruje data vybraných podle jejich id
                        var record = getObjects(allRecords, 'id', selectedIds[row]);
                        selectedRecords = selectedRecords.concat(record);
                    }   
                    w2ui['gridUsers'].selectNone();
                    
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: selectedRecords
                        , columns: getColumns(selectedRecords)     
                    }); 
                    //nastaví zpět buffer pro zobrazování
                    w2ui['gridUsers'].vs_extra = 0;
                    w2ui['gridUsers'].reload();
                    }
            }    
        },
        columns: [
            { field: 'id', caption: 'id', sortable: true, searchable: true, hidden: true },
            { field: 'email', caption: 'Email', sortable: true, searchable: true, editable: { type: 'text' } },
            { field: 'pass', caption: 'Password', sortable: true, searchable: true, editable: { type: 'text' }, render: 'password' },
            { field: 'role', caption: 'role', sortable: true, searchable: true, editable: { type: 'text' } }
        ],
        onAdd: function (event) {
            var g = w2ui['gridUsers'].records.length;
            w2ui['gridUsers'].add({ recid: g + 1, role: 'admin' }, true);
            w2ui.gridUsers.editField(g + 1, 1, '@');
            
        },
        onSave: function (event) {
            event.onComplete = async function () {
                var recid = event.changes["0"].recid;
                var arr = event.changes["0"];
                var record = w2ui['gridUsers'].get(recid);

                if (!record.id) {
                    delete record["recid"];
                    delete record["w2ui"];
                    await FetchAsync('users', 'post', record); 
                    w2ui['gridUsers'].reload();
                    
                } else {
                    delete arr["recid"];
                    await FetchAsync('users?id=eq.' + record.id, 'patch', arr); 
                    w2ui['gridUsers'].reload();
                }
                
            }
        },
        onDelete: async function (event) {
            if (event.force == true) { 
                var sel = w2ui['gridUsers'].getSelection();
                var selectedRecord = w2ui.gridUsers.get(sel[0]); 
                event.onComplete = async function() {
                    await FetchAsync('users?id=eq.'+ selectedRecord.id,'delete'); 
                }
             }
        }        
    },
    gridRanges: { 
        name: 'gridRanges',
        recid: 'id',
        reorderColumns: true,
        show: {
                toolbar            : true,
                footer: true
        },
        toolbar: {
            items: [
                { type: 'break' },
                { type: 'spacer' },
                { type: 'break' },
                { type: 'button', id: 'exportrangesgrid', caption: 'Export', icon: 'fa fa-download' }
            ],
            onClick: function (target, data) {
                //console.log(data);
                if (target == 'exportrangesgrid') {   
                    //nastaví buffer pro zobrazování tak aby v něm byly všechny možné řádky (kolik řádků mimo obraz má být načteno = všechny)
                    //grid nemá samostatnou fci na získání uživatelem vyfiltrovaných řádků 
                    var allRecords = w2ui['gridRanges'].records;
                    w2ui['gridRanges'].vs_extra = allRecords.length;
                    w2ui['gridRanges'].reload();

                    w2ui['gridRanges'].selectAll();
                    var selectedIds = w2ui['gridRanges'].getSelection();
                    
                    var selectedRecords = [];
                    for (var row in selectedIds) {
                        //vyfiltruje data vybraných podle jejich id
                        var record = getObjects(allRecords, 'id', selectedIds[row]);
                        selectedRecords = selectedRecords.concat(record);
                    }   
                    w2ui['gridRanges'].selectNone();
                    
                    $("#dvjson").excelexportjs({
                        containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: selectedRecords
                        , columns: getColumns(selectedRecords)     
                    }); 
                    //nastaví zpět buffer pro zobrazování
                    w2ui['gridRanges'].vs_extra = 0;
                    w2ui['gridRanges'].reload();
                    }
            }    
        },
        columns: [
            //{ field: 'id', caption: 'id', sortable: true, searchable: true, hidden: true },
            //{ field: 'domena', caption: 'domena', sortable: true, searchable: true },
            //{ field: 'iprozsah', caption: 'iprozsah', sortable: true, searchable: true },
            //{ field: 'iprozsah_mask', caption: 'iprozsah_mask', sortable: true, searchable: true },
            { field: 'ip', caption: 'ip', sortable: true, searchable: true, size: '20%' },
            { field: 'range0', caption: '0', sortable: true, searchable: true,
                render: function (record, index, column_index) {
                    if (record.range0 == '') {
                        var html = '<div style="background-color:lightgreen">'+ '•' + '</div>';
                        return html;
                    } else {
                        var html = '<div>'+ record.range0 + '</div>';
                        return html;
                    }
                }
            },
            {
                field: 'range64', caption: '64', sortable: true, searchable: true,
                render: function (record, index, column_index) {
                    if (record.range64 == '') {
                        var html = '<div style="background-color:lightgreen">'+ '•' + '</div>';
                        return html;
                    } else {
                        var html = '<div>'+ record.range64 + '</div>';
                        return html;
                    }


                }    },
            {
                field: 'range128', caption: '128', sortable: true, searchable: true,
                render: function (record, index, column_index) {
                    if (record.range128 == '') {
                        var html = '<div style="background-color:lightgreen">'+ '•' + '</div>';
                        return html;
                    } else {
                        var html = '<div>'+ record.range128 + '</div>';
                        return html;
                    }


                }    },
            {
                field: 'range192', caption: '192', sortable: true, searchable: true,
                render: function (record, index, column_index) {
                    if (record.range192 == '') {
                        var html = '<div style="background-color:lightgreen">'+ '•' + '</div>';
                        return html;
                    } else {
                        var html = '<div>'+ record.range192 + '</div>';
                        return html;
                    }


                }    }
        ],
        /*  onAdd: function (event) {
            var g = w2ui['gridUsers'].records.length;
            w2ui['gridUsers'].add({ recid: g + 1, role: 'admin' }, true);
            w2ui.gridUsers.editField(g + 1, 1, '@');
            
        },
        onSave: function (event) {
            event.onComplete = async function () {
                var recid = event.changes["0"].recid;
                var arr = event.changes["0"];
                var record = w2ui['gridUsers'].get(recid);

                if (!record.id) {
                    delete record["recid"];
                    delete record["w2ui"];
                    await FetchAsync('users', 'post', record); 
                    w2ui['gridUsers'].reload();
                    
                } else {
                    delete arr["recid"];
                    await FetchAsync('users?id=eq.' + record.id, 'patch', arr); 
                    w2ui['gridUsers'].reload();
                }
                
            }
        },
        onDelete: async function (event) {
            if (event.force == true) { 
                var sel = w2ui['gridUsers'].getSelection();
                var selectedRecord = w2ui.gridUsers.get(sel[0]); 
               await FetchAsync('users?id=eq.'+ selectedRecord.id,'delete'); 
             }
        }  */       
    },
    form: { 
        header: 'Edit',
        name: 'form',
        tabs: [
            { id: 'tab1', caption: 'Hlavní údaje'},
            { id: 'tab2', caption: 'Technické údaje'},
            { id: 'tab3', caption: 'Smlouvy' },
            { id: 'tab4', caption: 'Účty a jiné' }
        ],
        fields: [
            //{ name: 'id', type: 'int', html: { caption: 'ID', span: 4, attr: 'size="5" readonly' , page: 0, column: 0, group: 'Address Group 1' } },
            //{ name: 'cisloobch', type: 'text', required: true, html: { caption: 'Číslo obch.', span: 4, attr: 'size="5" maxlength="5"', page: 0, column: 0, group: 'Address Group 1' } },
            //{ name: 'nazevobch', type: 'text', required: true, html: { caption: 'Název obch.', span: 4,attr: 'size="40" maxlength="40"' , page: 0, column: 0, group: 'Address Group 1'} },
            //{ name: 'email', type: 'email', html: { caption: 'Email', attr: 'size="30"' } },
            //{ name: 'sdate', type: 'date', html: { caption: 'Date', attr: 'size="10"' } }

            { name: "cisloobch", type: 'text', html: { caption: "Číslo obchodníka" , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "pobocka_cis_hlavni", type: 'text', html: { caption: "Číslo matky", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "domena", type: 'text', html: { caption: "Doména" , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "nazevobch", type: 'text', html: { caption: "Název obch." , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "ulice", type: 'text', html: { caption: "Ulice", hidden: true , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "mesto", type: 'text', html: { caption: "Město" , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "psc", type: 'text', html: { caption: "PSČ", hidden: true , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "zeme", type: 'text', html: { caption: "Země", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "ico", type: 'text', html: { caption: "IČO", span: 5,attr: 'size="20" maxlength="30"' , page: 0, column: 0, group: 'Adresa'} },
            { name: "poznamka", type: 'textarea', html: { caption: "Poznámka", span: 5,attr: 'style="height: 75px"' , page: 0, column: 0, group: 'Adresa'} },

            { name: "druhdms", type: 'list', html: { caption: "Název DMS", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'}, options: { items: ['DMS-CZ/SK','Helios Green','Caris', 'CROSS 2', 'CROSS NG', 'Incadea', 'CDK', 'Orbit'] }  },
            { name: "vlastni_dms", type: 'checkbox', html: { caption: "Vlastní DMS?", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'} },
            { name: "licence_dmsczsk", type: 'text', html: { caption: "Licence", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'} },
            { name: "ipdms", type: 'text', html: { caption: "Srv ip", span: 5, attr: 'size="20" maxlength="40"', page: 0, column: 1, group: 'DMS' } },
            { name: "userdmssrv", type: 'text', html: { caption: "Srv user", span: 5, attr: 'size="20" maxlength="40"', page: 0, column: 1, group: 'DMS' } },
            { name: "heslodmssrv", type: 'password', html: { caption: "Srv pass", span: 5, attr: 'size="20" maxlength="40"', page: 0, column: 1, group: 'DMS' } },
            { name: "sid", type: 'text', html: { caption: "SID", span: 5, attr: 'size="20" maxlength="40"', page: 0, column: 1, group: 'DMS' } },
            { name: "port", type: 'text', html: { caption: "Port", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'} },
            { name: "dbuser", type: 'text', html: { caption: "Db user" , span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'} },
            { name: "dbpassuser", type: 'password', html: { caption: "Db user pass", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'} },
            { name: "dbpasssys", type: 'password', html: { caption: "Db sys pass", span: 5,attr: 'size="20" maxlength="40"' , page: 0, column: 1, group: 'DMS'} },
            { name: "pozn_dms", type: 'textarea', html: { caption: "DMS poznámka", span: 5,attr: 'style="height: 75px"' , page: 0, column: 1, group: 'DMS'} },

            { name: "vlastni_btac", type: 'checkbox', html: { caption: "Vlastní BTAC?", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 0, group: 'BTAC'} },
            { name: "ipbtac", type: 'text', html: { caption: "BTAC IP" , span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 0, group: 'BTAC'} },
            { name: "userbtac", type: 'text', html: { caption: "BTAC Uživatel", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 0, group: 'BTAC'} },
            { name: "heslobtac", type: 'password', html: { caption: "BTAC Heslo" , span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 0, group: 'BTAC'} },
            { name: "snbtacbox", type: 'text', html: { caption: "BTAC Box SN", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 0, group: 'BTAC'} },
            { name: "ipbtacbox", type: 'text', html: { caption: "BTAC Box IP", span: 5, attr: 'size="20" maxlength="40"', page: 1, column: 0, group: 'BTAC' } },
            { name: "pozn_btac", type: 'textarea', html: { caption: "BTAC Poznámka", span: 5,attr: 'style="height: 60px"' , page: 1, column: 0, group: 'BTAC'} },

            { name: "linka_aktivni", type: 'checkbox', html: { caption: "IP DealNet připojení?", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 1, group: 'Spojení'} },
            { name: "iprozsah", type: 'text', html: { caption: "IP Rozsah", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 1, group: 'Spojení'} },
            { name: "iprozsah_mask", type: 'text', html: { caption: "IP Rozsah Maska" , span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 1, group: 'Spojení'} },
            { name: "iprouterlan", type: 'text', html: { caption: "IP Router Lan", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 1, group: 'Spojení'} },
            { name: "iprouterwan", type: 'text', html: { caption: "IP Router Wan", span: 5,attr: 'size="20" maxlength="40"' , page: 1, column: 1, group: 'Spojení'} },
            { name: "pozn_linka", type: 'textarea', html: { caption: "IP Poznámka", span: 5,attr: 'style="height: 92px"' , page: 1, column: 1, group: 'Spojení'} },

            { name: "serv_smlouva", type: 'checkbox', html: { caption: "Servis Škoda", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 0, group: 'Smlouvy ŠKODA'} },
            { name: "prod_smlouva", type: 'checkbox', html: { caption: "Prodej Škoda", span: 5, attr: 'size="20" maxlength="40"', page: 2, column: 0, group: 'Smlouvy ŠKODA' } },
            { name: "serv_smlouva_v", type: 'checkbox', html: { caption: "Servis VW", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 0, group: 'Smlouvy VW'} },
            { name: "prod_smlouva_v", type: 'checkbox', html: { caption: "Prodej VW", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 0, group: 'Smlouvy VW'} },
            { name: "serv_smlouva_a", type: 'checkbox', html: { caption: "Servis Audi", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 0, group: 'Smlouvy Audi'} },
            { name: "prod_smlouva_a", type: 'checkbox', html: { caption: "Prodej Audi", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 0, group: 'Smlouvy Audi'} },
            { name: "serv_smlouva_s", type: 'checkbox', html: { caption: "Servis Seat", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 1, group: 'Smlouvy Seat'} },
            { name: "prod_smlouva_s", type: 'checkbox', html: { caption: "Prodej Seat", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 1, group: 'Smlouvy Seat'} },
            { name: "serv_smlouva_n", type: 'checkbox', html: { caption: "Servis Nutzfahrzeuge", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 1, group: 'Smlouvy VW-N'} },
            { name: "prod_smlouva_n", type: 'checkbox', html: { caption: "Prodej Nutzfahrzeuge", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 1, group: 'Smlouvy VW-N'} },
            { name: "neaut_opravce", type: 'checkbox', html: { caption: "Neautorizovaný", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 2, group: 'Jiné smlouvy'} },
            { name: "dodavatel", type: 'checkbox', html: { caption: "Dodavatel", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 2, group: 'Jiné smlouvy'} },
            { name: "jiny", type: 'checkbox', html: { caption: "Jiné zařazení", span: 5,attr: 'size="20" maxlength="40"' , page: 2, column: 2, group: 'Jiné smlouvy'} },

            { name: "cpn_c_user", type: 'text', html: { caption: "VW Portal uživatel C", span: 5,attr: 'size="20" maxlength="40"' , page: 3, column: 0, group: 'CPN'} },
            { name: "cpn_c_pass", type: 'password', html: { caption: "VW Portal heslo C", span: 5,attr: 'size="20" maxlength="40"' , page: 3, column: 0, group: 'CPN'} },
            { name: "cpn_0_user", type: 'text', html: { caption: "VW Portal uživatel 0", span: 5,attr: 'size="20" maxlength="40"' , page: 3, column: 0, group: 'CPN'} },
            { name: "cpn_0_pass", type: 'password', html: { caption: "VW Portal heslo 0", span: 5,attr: 'size="20" maxlength="40"' , page: 3, column: 0, group: 'CPN'} },

            { name: "id", type: 'text', readonly:true, html: { caption: "Dealer Id", span: 5, attr: 'size="20" maxlength="40"', page: 3, column: 1, group: 'Systém' } },
            { name: "recid", type: 'text', html: { caption: "Record Id", span: 5,attr: 'size="20" maxlength="40"' , page: 3, column: 1, group: 'Systém'} },
            { name: "vyrazeny", type: 'checkbox', html: { caption: "Vyřazený", span: 5,attr: 'size="20" maxlength="40"' , page: 3, column: 1, group: 'Systém'} }

        ],
        actions: {
            RdpDMS: async function () {
                var form = w2ui['form'];
                var heslodmssrv = form.record.heslodmssrv;

                if (!heslodmssrv.startsWith('Cg')) { 

                    await fetch(ApiAddressDMS + 'api/password/Decrypt/' + btoa(heslodmssrv) + '/', { method: 'GET', headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }) })
                    .then((resp) => resp.text())
                    .then(function (data) {
                         heslodmssrv =  data.slice(1, -1);
                    }); 
                }    
 
                await fetch(ApiAddressDMS + 'api/password/EncryptRDP/' + heslodmssrv + '/',{ method: 'GET', headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })  })
                        .then((resp) => resp.text())
                        .then(function (data) {
                            if (data.length > 50) {
                                let url = ApiAddressRDP +'?__EVENTTARGET=&__EVENTARGUMENT=&server='+ form.record.ipdms +'&user='+ form.record.userdmssrv +'&passwordHash='+ atob(data.slice(1, -1)) +'&connect=Connect%21';
                                window.open(url, "_blank", "toolbar=0,menubar=0,location=0,status=no,scrollbars=yes,resizable=yes,top=5,left=5,width=1440,height=900");
                               // w2popup.open({ body: '<iframe style="border: 0px; " src="' + url + '" width="100%" height="100%"></iframe>' });
                            } else {
                            }
                        });

                //let url = 'https://myserver/Myrtille/?__EVENTTARGET=&__EVENTARGUMENT=&server=server&domain=domain[optional]&user=user&passwordHash=passwordHash&program=program[optional]&width=width(px)[optional]&height=height(px)[optional]&connect=Connect%21';
            },
            Reset: function () {
                //this.clear();
                this.record.id = null;
                this.record.recid = 0;
                this.recid = 0;
                $("#cisloobch").val('');
                $("#nazevobch").val('');
                toastr.success("Záznam resetován. Uložením založíte nového dealera.");
                //console.log(this.record);
            },
            Save: async function () {
                //Pozor, validace mění typ hodnot chceckboxů z bool na int!!!
                //var errors = this.validate();
                //if (errors.length > 0) return;
                if (this.recid == 0) {

                    let dealerRecord = this.record;

                    //nahradit objekt list stringem
                    let druhdmsText = dealerRecord["druhdms"].text;
                    delete dealerRecord["druhdms"];
                    dealerRecord["druhdms"] = druhdmsText;

                    //zašifrovat heslo na dms server
                    let hesloDmsSrvText = dealerRecord["heslodmssrv"];
                    await fetch(ApiAddressDMS + 'api/password/Encrypt/' + btoa(hesloDmsSrvText) + '/', { method: 'GET', headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }) })
                    .then((resp) => resp.text())
                    .then(function (data) {
                        hesloDmsSrvText =  data.slice(1, -1);
                        delete dealerRecord["heslodmssrv"];
                        dealerRecord["heslodmssrv"] = atob(hesloDmsSrvText);
                    }); 

                    //CreateDealer(this.record);
                    await FetchAsync('dealers', 'post', dealerRecord);
                    w2ui.grid.add($.extend(true, { recid: w2ui.grid.records.length + 1 }, dealerRecord));
                    w2ui.grid.selectNone();
                    this.clear();
                } else {
                     /*//změní hodnotu checkboxů zpět na bool poté co ji validace zmrvila
                                        for (var f = 0; f < this.fields.length; f++) {
                                            var field = this.fields[f];
                                            //if (this.record[field.name] == null) this.record[field.name] = '';
                                            switch (field.type) {
                                                case 'checkbox':
                                                    // convert true/false
                                                    //if (this.record[field.name] == true) this.record[field.name] = 1; else this.record[field.name] = 0;
                                                    if (this.record[field.name] == 1) this.record[field.name] = true; else this.record[field.name] = false;
                                                    break;
                    
                                            }
                                        } */

                    //console.log(this.record);
                    let dealer = this.record;

                    //nahradit objekt list stringem
                    let druhdmsText2 = dealer["druhdms"].text;
                    delete dealer["druhdms"];
                    dealer["druhdms"] = druhdmsText2;

                     //zašifrovat heslo na dms server
                     let hesloDmsSrvText2 = dealer["heslodmssrv"];
                     console.log(hesloDmsSrvText2);
                     await fetch(ApiAddressDMS + 'api/password/Encrypt/' + btoa(hesloDmsSrvText2) + '/', { method: 'GET', headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }) })
                     .then((resp) => resp.text())
                     .then(function (data) {
                         hesloDmsSrvText2 =  data.slice(1, -1);
                         delete dealer["heslodmssrv"];
                         dealer["heslodmssrv"] = atob(hesloDmsSrvText2);
                     }); 

                    var original = w2ui.grid.get(this.recid);
  
                    //zjistí rozdíl mezi původním a novým záznamem a pošle do k uložení
                    var delta = compareJSON(original, dealer);
                    //console.log(delta);

                   
                    if (empty(delta)==false) {
                        await FetchAsync('dealers?id=eq.' + dealer.id, 'patch', delta); 
                       //UpdateDealer(this.recid, delta);
                    }  
                    
                   //aktualizuje grid
                    w2ui.grid.set(this.recid, this.record);
                    w2ui.grid.selectNone();
                    this.clear(); 
                }
            }
            
        }


        


    },
    sidebar: {
        name: 'sidebar',
        //style: 'background-color: #f2f2f2;',
        flatButton: true,
        nodes: [
            { id: 'level-1', text: 'Dealer info', expanded: true, group: true, groupShowHide: false,
                nodes: [{ id: 'level-1-1', text: 'Dealers', icon: 'fa fa-building' },
                        { id: 'level-1-2', text: 'Results', icon: 'fa fa-flash' },
                        { id: 'level-1-3', text: 'Contacts', icon: 'fa fa-address-card' },
                     ]
            },
            { id: 'level-2', text: 'Settings', img: 'fa fa-window-minimize' ,expanded: true, group: true, groupShowHide: false,
                nodes: [
                        { id: 'level-2-1', text: 'DMS Requests', icon: 'fa fa-th-large' },
                        //{ id: 'level-2-2', text: 'Requests', icon: 'fa fa-th' },
                        { id: 'level-2-3', text: 'Users', icon: 'fa fa-users' },
                        { id: 'level-2-4', text: 'IP Ranges', icon: 'fa fa-exchange' }
                       // { id: 'level-2-5', text: 'RDP', icon: 'fa fa-tv' }
                     ]
            }
        ],
        onFlat: function (event) {
            //console.log(event);
            //w2ui.sidebar.set('width', (event.goFlat ? '35px' : '200px'));
            if (event.goFlat) {
                w2ui.layout.set('left', { size: '35px' });
            } else { 
                w2ui.layout.set('left', { size: '200px' });
            }
            //w2ui.gridResults_toolbar.set('requests', { text: data.subItem.text });
        },
        onClick: async function (event) {

            if (event.type == 'click' && event.target == 'level-1-1') {
                w2ui['layout'].set('right', { hidden: false });
                w2ui.layout.set('right', { size: '40%' });
                w2ui.layout.content('right', w2ui['form']);

                w2ui['layout'].set('bottom', { hidden: false });
                w2ui.layout.content('main', w2ui['grid']);

                w2ui['grid'].records = await FetchAsync('dealers?vyrazeny=eq.false&order=id.asc','get');
                w2ui['grid'].reload();

                let RequestGroupsViewData = await FetchAsync('RequestGroupsView','get');
                w2ui.gridResults_toolbar.set('requestgroup', { items: RequestGroupsViewData });
                w2ui.gridResultsAll_toolbar.set('requestgroup', { items: RequestGroupsViewData });
            }

            if (event.type == 'click' && event.target == 'level-1-2') {
                w2ui['layout'].set('right', { hidden: true });
                w2ui['layout'].set('bottom', { hidden: true });
               // w2ui['layout'].toggle('right');
                //w2ui['layout'].toggle('bottom');
                w2ui.layout.content('main', w2ui['gridResultsAll']);
            }

            if (event.type == 'click' && event.target == 'level-1-3') {
                w2ui['layout'].set('right', { hidden: true });
                w2ui['layout'].set('bottom', { hidden: true });
                w2ui.layout.content('main', w2ui['gridContactsAll']);

                w2ui['gridContactsAll'].records = await FetchAsync('contacts', 'get');
                w2ui['gridContactsAll'].reload();
                //LoadContacts();
            }

            if (event.type == 'click' && event.target == 'level-2-1') {
                w2ui.layout.set('right', { hidden: false });
                w2ui.layout.set('bottom', { hidden: true });
                w2ui.layout.content('main', w2ui['gridRequestGroups']);
                w2ui.layout.content('right', w2ui['gridRequests']);
                w2ui.layout.set('right', { size: '85%' });

                
                w2ui['gridRequestGroups'].records = await FetchAsync('requestgroups', 'get');
                w2ui['gridRequestGroups'].hideColumn('id');
                w2ui['gridRequestGroups'].reload();

                w2ui['gridRequests'].records = await FetchAsync('requests', 'get');
                w2ui['gridRequests'].reload();
            }

            if (event.type == 'click' && event.target == 'level-2-2') {
                w2ui.layout.set('right', { hidden: true });
                w2ui.layout.set('bottom', { hidden: true });
                w2ui.layout.content('main', w2ui['gridRequests']);
               
                w2ui['gridRequests'].records = await FetchAsync('requests', 'get');
                w2ui['gridRequests'].reload();
            }

            if (event.type == 'click' && event.target == 'level-2-3') {
                w2ui['layout'].set('right', { hidden: true });
                w2ui['layout'].set('bottom', { hidden: true });
                w2ui.layout.content('main', w2ui['gridUsers']);

                w2ui['gridUsers'].records = await FetchAsync('users', 'get');
                w2ui['gridUsers'].reload();
            }
            
            if (event.type == 'click' && event.target == 'level-2-4') {
                w2ui['layout'].set('right', { hidden: true });
                w2ui['layout'].set('bottom', { hidden: true });
                w2ui.layout.content('main', w2ui['gridRanges']);
                
                let dealer = await FetchAsync('dealers?select=id,domena,vyrazeny,iprozsah_mask,iprozsah&and=(vyrazeny.is.false)&order=iprozsah.asc', 'get');
               // console.log(dealer);

                var iprangesArray = []; 

                for (var i = 1; i <= 254; i++) {

                    var iprangeObject = new iprange_row('10.219.' + i + '.x', '', '','','');
                    JSON.stringify(iprangeObject);
                    iprangesArray.push(iprangeObject);
                   
                    for (var key in dealer) {
                        if (dealer.hasOwnProperty(key)) {

                            let iprozsah = dealer[key].iprozsah;
                            let iprozsah_mask = dealer[key].iprozsah_mask;
                            let id = dealer[key].id;
                            let domena = dealer[key].domena;

                            if (iprozsah && iprozsah_mask) {
                                if (iprozsah.includes('10.219.' + i + '.')) {
                                
                                    if (iprozsah_mask.includes('255.255.255.0')) {
                                        iprangesArray[i - 1].range0 = domena;
                                        iprangesArray[i - 1].range64 = domena;
                                        iprangesArray[i - 1].range128 = domena;
                                        iprangesArray[i - 1].range192 = domena; 
                                    }

                                    if (iprozsah_mask.includes('255.255.255.128') && iprozsah.includes('10.219.' + i + '.0')) {
                                         iprangesArray[i - 1].range0 = domena;
                                         iprangesArray[i - 1].range64 = domena;
                                    }
                                    if (iprozsah_mask.includes('255.255.255.128') && iprozsah.includes('10.219.' + i + '.128')) {
                                        iprangesArray[i - 1].range128 = domena;
                                        iprangesArray[i - 1].range192 = domena;
                                    }
                                   
                                    if (iprozsah_mask.includes('255.255.255.192') && iprozsah.includes('10.219.' + i + '.0')) {
                                        iprangesArray[i - 1].range0 = domena;
                                    }
                                    if (iprozsah_mask.includes('255.255.255.192') && iprozsah.includes('10.219.' + i + '.64')) {
                                        iprangesArray[i - 1].range64 = domena;
                                    }
                                    if (iprozsah_mask.includes('255.255.255.192') && iprozsah.includes('10.219.' + i + '.128')) {
                                        iprangesArray[i - 1].range128 = domena;
                                    }
                                    if (iprozsah_mask.includes('255.255.255.192') && iprozsah.includes('10.219.' + i + '.192')) {
                                        iprangesArray[i - 1].range192 = domena;
                                   } 
   
                                }
                            }
                            

                        }
                    }
                }    

                w2ui['gridRanges'].records = iprangesArray;
                w2ui['gridRanges'].reload();
            }
            

             if (event.type == 'click' && event.target == 'level-2-5') {
                w2ui['layout'].set('right', { hidden: true });
                w2ui['layout'].set('bottom', { hidden: true });

                 var myCanvas = document.getElementById("screen");
                 w2ui.layout.content('main', myCanvas);
                 var rdp = new wsgate.RDP('ws://localhost:8000/wsgate', myCanvas, false, false,null);
                 rdp.Run();    
            }
            
           
             
        }
    }
};


function settingsGetJSON() {
    var myCanvas = document.getElementById("screen");
    return {"host"   : 'K2RDPTest.cloudapp.net'
           ,"port"   : '3389'
           ,"pcb"    : ''
           ,"user"   : 'Denallix\\K2RDPTest'
           ,"pass"   : 'K2pass!'
           ,"perf"   : '0'
           ,"fntlm"  : '0'
           ,"nowallp": '0'
           ,"nowdrag": '0'
           ,"nomani" : '0'
           ,"notheme": '0'
           ,"nonla"  : '0'
           ,"notls"  : '0'
           ,"dtsize": '1280' + 'x' + '800'
           };
}

function iprange_row(ip, range0, range64, range128, range192) {
    this.ip = ip;
    this.range0 = range0;
    this.range64 = range64;
    this.range128 = range128;
    this.range192 = range192;
}

w2utils.formatters['isodate'] = function (val, params) {
    var d = new Date(val);
    //console.log(d.getUTCDate());
    return d.toLocaleString();
};

$(function () {
    Login();

    //$("#categoryselect").append('<option value="option6">option6</option>');
    //$("#categoryselect2").append('<option value="option6">option6</option>'); 
    //w2ui.toolbar1.add({ type: 'html', id: 't1dotaz', html: '<div class="w2ui-field"><div><input id="dotaz" style="width: 300px;"> <div style="padding-top: 15px; margin-left: -5px;"></div></div></div>' });
});

async function Login() {
    if (!sessionStorage.accessToken) {
        if (localStorage.email)
            var focusValue = localStorage.email ? '1' : '0';    
        if (!w2ui.formLogin) {
            $().w2form({
                name: 'formLogin',
                url      : '/server/form/path',
                focus  : focusValue,
                style: 'border: 0px; background-color: transparent;',
                fields: [
                    { field: 'email', type: 'text' },
                    { field: 'password', type: 'password' },
                ],
                record: { 
                    email   : localStorage.email
                },
                onChange: async function (event) {
                    if (event.target == 'password') {
                        await getAuthAsync(this.record.email, this.get('password').el.value)
                          //  .then(data => { console.log(data);});
                            w2popup.close();
                         await InitiateLayout();
                    }
                },
                actions: {
                    Login: async function () {
                        await getAuthAsync(this.record.email, this.get('password').el.value)
                           // .then(data => {console.log(data);  });
                            w2popup.close();
                        await InitiateLayout();
                    }
                }
            });
        }
        $().w2popup('open', {
            title   : 'Login',
            body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
            style   : 'padding: 10px 0px 0px 0px',
            width   : 350,
            height  : 200, 
            modal: true,
            showMax : false,
            onToggle: function (event) {
                $(w2ui.formLogin.box).hide();
                event.onComplete = function () {
                    $(w2ui.formLogin.box).show();
                    w2ui.formLogin.resize();
                }
            },
            onOpen: function (event) {
                event.onComplete = function () {
                    // specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
                    $('#w2ui-popup #form').w2render('formLogin');
                }
            }
        });
    } else {
        InitiateLayout();
    }
} 

async function InitiateLayout() {
    
    $('#main').w2layout(config.layout);
    w2ui.layout.content('main', $().w2grid(config.grid));
    w2ui.layout.content('bottom', $().w2layout(config.layout2));
    w2ui.layout.content('left', $().w2sidebar(config.sidebar));
    w2ui.layout.content('right', $().w2form(config.form));
    w2ui.layout2.content('left', $().w2grid(config.gridResults));
    w2ui.layout2.content('right', $().w2grid(config.gridContacts));
    
     $().w2grid(config.gridResultsAll);
     $().w2grid(config.gridContactsAll);
     $().w2grid(config.gridRequestGroups); 
     $().w2grid(config.gridRequests); 
     $().w2grid(config.gridUsers); 
     $().w2grid(config.gridRanges); 
    
    toastr.options.progressBar = true;
    toastr.options.timeOut = 1500;
    toastr.options.positionClass = 'toast-top-center';

     //w2ui['grid'].vs_extra = 0;
     w2ui.sidebar.goFlat();
     w2ui.sidebar.select('level-1-1');
 
     //LoadDealers();
     //GetRequestGroups();

     //w2ui['grid'].records = await getDataAsync('dealers?vyrazeny=eq.false');
     w2ui['grid'].records = await FetchAsync('dealers?vyrazeny=eq.false&order=id.asc','get');
     //w2ui['grid'].search('vyrazeny', 'false');
     w2ui['grid'].reload();

     //let RequestGroupsViewData = await getDataAsync('RequestGroupsView');
     let RequestGroupsViewData = await FetchAsync('RequestGroupsView','get');
     w2ui.gridResults_toolbar.set('requestgroup', { items: RequestGroupsViewData });
     w2ui.gridResultsAll_toolbar.set('requestgroup', { items: RequestGroupsViewData });
    

    $(w2ui.form.get('id').el).prop('readonly', true);
    $(w2ui.form.get('recid').el).prop('readonly', true);


   $("#heslodmssrv").dblclick(function(){showPrompt($(this).val(), 'DMS server password'); });
   $("#dbpassuser").dblclick(function(){showPrompt($(this).val(), 'DMS DB user password'); });
   $("#dbpasssys").dblclick(function(){showPrompt($(this).val(), 'DMS DB sys password'); });
   $("#heslobtac").dblclick(function(){showPrompt($(this).val(), 'BTAC server password'); });
}

function showPrompt(value, label) {
    w2prompt({
       // label       : label,
        value       : value,
        attrs       : 'onFocus="this.select();"',
        title       : w2utils.lang(label),
        ok_text     : w2utils.lang('Ok'),
        cancel_text : w2utils.lang('Cancel'),
        width       : 400,
        height      : 200
    })
    .change(function (event) {
       // console.log('change', event);
    })
    .ok(function (event) {
       // console.log('ok', event);
    });
}

async function getAuthAsync(email, password) {
    try {
      let response = await fetch(ApiAddressDB + 'rpc/login',{
          method: 'post',
          body: JSON.stringify({ email: email, pass: password }),
          headers: { 'Content-Type': 'application/json' }
    });
      let responseJson = await response.json();
        window.sessionStorage.accessToken = responseJson[0].token;
        localStorage.email = email;
        //InitiateLayout2();  
    //return responseJson[0].token;
  
    } catch (error) {
    console.error(error);
  }
} 

async function FetchAsync(url, method, data) {
    if (window.sessionStorage.accessToken) {
        var myHeaders = new Headers({ 'Authorization': 'Bearer ' + window.sessionStorage.accessToken, 'Content-Type': 'application/json' });
        //'Accept': 'application/json',

        if (method == 'get') {  var options = { method: 'GET', headers: myHeaders};}
        if (method == 'post') { var options = { method: 'POST', headers: myHeaders, body: JSON.stringify(data) }; }
        if (method == 'patch') { var options = { method: 'PATCH', headers: myHeaders, body: JSON.stringify(data) }; }
        if (method == 'delete') {  var options = { method: 'DELETE',headers: myHeaders};}

        try {
            let response = await fetch(ApiAddressDB + url, options);
            if (response.ok) {
                if (method == 'get') {
                    let responseJson = await response.json();
                   // toastr.success('Got succesfully.')
                    return responseJson;
                }
                if (method == 'post') { 
                    let responseText = await response.text();
                    toastr.success('Záznam uložen') ;
                    return responseText;

                }
                if (method == 'patch') { toastr.success('Záznam aktualizován') }
                if (method == 'delete') { toastr.success('Záznam smazán') }
                
            } else {
                w2alert(response.message)
                .ok(function () { console.log('User acknowledged the error.'); });
                console.log(response);
                //throw new HttpError(response);
              }
        } catch (error) {
            console.error(error);
        }
    }
    else {
        Login();
    }

}

async function GetResult(dealerid, cisloobch, dotazid, dotaz) {
    var auth = window.sessionStorage.accessToken;

    var headers = new Headers({ 'Content-Type': 'application/json' })
    var options = { method: 'POST', headers: headers, body: JSON.stringify(dotaz) };

    let response = await fetch(ApiAddressDMS + 'api/ExecuteScalar/DMSRequest/', options);
     if (response.ok) {
        let data = await response.text();

        var encodedData = data.slice(1, -1);
        var decodedData = atob(encodedData);
            
        let req_data = {"cisloobch": cisloobch, "dotazid": dotazid, "vysledek": decodedData, "dealersdataid": dealerid};
        await FetchAsync('results', 'post', req_data);
            
        w2ui['gridResults'].records = await FetchAsync('resultsbydealerid?dealerid=eq.' + dealerid,'get');
        w2ui['gridResults'].refresh();

    } else {
             w2alert(response.message)
            .ok(function () { console.log('User acknowledged the error.'); });
             console.log(response);
    }
};
    
