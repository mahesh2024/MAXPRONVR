/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
COPYRIGHT (c) 2008  HONEYWELL INC.,   ALL RIGHTS RESERVED

This software is a copyrighted work and/or information protected as a trade secret. Legal rights of Honeywell 
Inc. in this software is distinct from ownership of any medium in which the software is embodied. Copyright or trade secret 
notices included must be reproduced in any copies authorized by Honeywell Inc. The information in this 
software is subject to change without notice and should not be considered as a commitment by Honeywell Inc.

File Name                           : mobile.js
Project Title                       : 
Author(s)                           : Venu Janga
Created on                          : 18 Sep 2011
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

//------------------------------------------------------------------------------------------------------------------------------------
// APPLICATION 
//------------------------------------------------------------------------------------------------------------------------------------

// Logging
// create dummy console if doesn't exist.
if (!window.console) {
    console = {};
    console.log = function() { };
    console.warn = function() { };
    console.error = function() { };
    console.info = function() { };
}

// for code minification, nothing more than that.
// Dont mix with AJAX, could become bottle neck.
function gEBI(id) {
    return document.getElementById(id);
}

// Global variables
var i = 0;
var viewPortHeight = 350;
var viewPortWidth = 250;
var CamNameMaxLen = 25;
var CurActiveTab = "SerTab"; // SerTab, VdoTab, StngTab, NtfTab
var timeToSave=1000*25;

function pause(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) { }
}

function AdjustAppSize() {
    //alert(screen.width + " " + screen.height);
    //Set view port height & width
    //document.body.style.height = screen.height + "px";
    //document.body.style.width = screen.width + "px";

    //document.body.style.height = screen.availHeight + "px";
    //document.body.style.width = (screen.availWidth - 9) + "px";

    //document.getElementById('Vishnu').style.height = screen.availHeight + "px";
    //document.getElementById('Vishnu').style.width = (screen.availWidth - 9) + "px";

    var winW = screen.availWidth, winH = screen.availHeight;

    if (document.body && document.body.offsetWidth) {
        winW = document.body.offsetWidth;
        winH = document.body.offsetHeight;
    }
    if (document.compatMode == 'CSS1Compat' &&
                document.documentElement &&
                document.documentElement.offsetWidth) {
        winW = document.documentElement.offsetWidth;
        winH = document.documentElement.offsetHeight;
    }
    if (window.innerWidth && window.innerHeight) {
        winW = window.innerWidth;
        winH = window.innerHeight;
    }

    document.body.style.height = winH + "px";
    document.body.style.width = winW + "px";
}

// JSON related
var JSON = JSON || {};

// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function(obj) {

    var t = typeof (obj);
    if (t != "object" || obj === null) {

        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);

    }
    else {

        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);

        for (n in obj) {
            v = obj[n]; t = typeof (v);

            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);

            json.push((arr ? "" : '"' + n + '":') + String(v));
        }

        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

// implement JSON.parse de-serialization
JSON.parse = JSON.parse || function(str) {
    if (str === "") str = '""';
    eval("var p=" + str + ";");
    return p;
};

function AppLoad() {
    PanelManager.Initialize(1, "SalvoContainer");
    var ua = navigator.userAgent;
    if (ua.indexOf("BlackBerry") >= 0) {
        if (ua.indexOf("WebKit") < 0) {
            window.location = window.location + 'mobile_basic.htm';
        }
    }
    
       

    var c_object=null;
    
    // Read the cookie string
    //var c_String=ReadCookie("SalvoJSON");
    var c_String =window.name;
   
    // If cookie excists
    if(c_String!="undefined"&&c_String!=null&& c_String.length>0)
      c_object=JSON.parse(c_String);
    
    if(c_object!="undefined"&&c_object!=null){
    
        //gEBI('appSplash').style.display = 'none';   
        searchCameras(c_object.SearchString);
        if(c_object.ActiveTab=="SerTab") // Search Tab
        {
            
            OpenSearchTab();
        }else if(c_object.ActiveTab=="VdoTab") //Video Tab
        {        
         OpenVideoTab();
         ReconstructSalvo();
         
        }else if(c_object.ActiveTab=="StngTab") // Settings Tab
        {
            OpenSettingsTab();
        }
        else if(c_object.ActiveTab=="NtfTab") // Notifications tab
        {
           OpenNotificationsTab();
        }
              
    }
     else{
          
        gEBI('appSplash').style.display = 'block';
        // Hide login
        pause(500); // let all images load  
        // Hide application splash screen
        gEBI('appSplash').style.display = 'none';
        
         OpenSearchTab();
        // Get list of allowed cameras @ app load
        searchCameras('');       
    }
    
    document.getElementById('ServerURL').innerText = document.URL;     
}

function MakeTabsBarVisible()
{
    document.getElementById('tabsbar').style.visibility = "visible";
    document.getElementById('tabsbar').style.height = "12.2%";
}

function CloseLoginTab() {
    document.getElementById('login_logo').style.visibility = "hidden";
    document.getElementById('login_logo').style.height = "0";
    document.getElementById('tabsbar').style.visibility = "visible";
    document.getElementById('tabsbar').style.height = "12.2%";
    //document.getElementById('img_view').src = "images/tab_vdo_on.png";
    OpenSearchTab();
}

function DoAppReload() {
    if (confirm('This action will reload application..') == true)
        location.reload(true);
}

//--- Set timeout---
function SetRefreshMetaTag(timetoRefresh) {
    setTimeout("SaveAppState();location.reload(true);",timetoRefresh);
}
function PreparePageRefresh()
{
    //alert("Preparing for page refresh");
    //SaveAppState();
}
//------------------------------------------------------------------------------------------------------------------------------------
// SEARCH TAB 
//------------------------------------------------------------------------------------------------------------------------------------

function OpenSearchTab() {
    CurActiveTab="SerTab";
    SetRefreshMetaTag(1000*60*60*60);

    document.getElementById('LoginTab').style.display = "none";
    
    MakeTabsBarVisible();

    document.getElementById('SearchTab').style.display = "block";
    document.getElementById('TAB1').style.backgroundImage = 'url(images/tab_ser_on.png)';

    document.getElementById('VideoTab').style.display = "none";
    document.getElementById('TAB3').style.backgroundImage = 'url(images/tab_vdo_off.png)';

    document.getElementById('SettingsTab').style.display = "none";
    document.getElementById('TAB2').style.backgroundImage = 'url(images/tab_stng_off.png)';

    document.getElementById('NotificationsTab').style.display = "none";
    document.getElementById('TAB4').style.backgroundImage = 'url(images/tab_ntf_off.png)';

    PanelManager.PauseSalvo(true);
}

function searchCameras(srchStr) {
    var li_count = 0;

    //document.getElementById('cam_list').innerHTML = "";
    var xmlhttp1;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp1 = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp1 = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if (srchStr == "Search for cameras") srchStr = '';

    xmlhttp1.open("GET", "./PSIA/Streaming/channels", true);
    //alert("Search.aspx?search=" + srchStr);
    xmlhttp1.send();
    xmlhttp1.onreadystatechange = function() {
        if (xmlhttp1.readyState == 4) {

            switch (xmlhttp1.status) {
                case 200:

                    var respTxt;

                    respTxt = xmlhttp1.responseText;

                    var scl = new StreamingChannelList(respTxt);
                    scl.PopulateChannelList();

                    var trgLst;

                    if (srchStr.length > 0) {
                        trgLst = scl.Search(srchStr);
                    }
                    else {
                        trgLst = scl.ChannelList;
                    }

                    var camList = ' ';

                    for (var x = 0; x < trgLst.length; x++) {
                        camList = camList + '<div onclick="StartStreaming(\'' + trgLst[x].GetChannelId() + '\', \'' + trgLst[x].GetChannelName() + '\')" >&nbsp;<img src="images/li_cam.png" />&nbsp;' + FormatCameraName(trgLst[x].GetChannelName(), trgLst[x].GetChannelId()) + '</div>';
                    }

                    if (srchStr.length > 0) {
                        if (trgLst.length == 0) {
                            camList = '<br/><table align="center" class="iTable" cellpadding="5" cellspacing="0" width="95%"><tr><td width="10%" class="iTd_tl iTd_bl">&nbsp</td><td colspan="2" class=" iTd_br iTd_tr">No matching cameras found.</td></tr></table>';
                        }
                    }
                    else {
                        if (trgLst.length == 0) {
                            camList = '<br/><table align="center" class="iTable" cellpadding="5" cellspacing="0" width="95%"><tr><td width="10%" class="iTd_tl iTd_bl">&nbsp</td><td colspan="2" class=" iTd_br iTd_tr">No cameras configured.</td></tr></table>';
                        }
                    }

                    document.getElementById("CamSearchList").innerHTML = camList;

                    break;

                default:
                    document.getElementById("CamSearchList").innerHTML = '<br/><table align="center" class="iTable" cellpadding="5" cellspacing="0" width="95%"><tr><td width="10%" class="iTd_tl iTd_bl">&nbsp</td><td colspan="2" class=" iTd_br iTd_tr">Device error. <br/>Unable to get camera list.</td></tr></table>';
                    console.log('search() - XHR req status:' + this.status + ' - status text:' + this.statusText);
            }
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------
// SETTINGS TAB 
//------------------------------------------------------------------------------------------------------------------------------------

function OpenSettingsTab() {
    CurActiveTab="StngTab";
    SetRefreshMetaTag(1000*60*60*60);
    document.getElementById('LoginTab').style.display = "none";
    
    MakeTabsBarVisible();

    document.getElementById('SearchTab').style.display = "none";
    document.getElementById('TAB1').style.backgroundImage = 'url(images/tab_ser_off.png)';

    document.getElementById('VideoTab').style.display = "none";
    document.getElementById('TAB3').style.backgroundImage = 'url(images/tab_vdo_off.png)';

    document.getElementById('SettingsTab').style.display = "block";
    document.getElementById('TAB2').style.backgroundImage = 'url(images/tab_stng_on.png)';

    document.getElementById('NotificationsTab').style.display = "none";
    document.getElementById('TAB4').style.backgroundImage = 'url(images/tab_ntf_off.png)';

    PanelManager.PauseSalvo(true);
}

function LogOutApp() {    
    location.reload(true);
}

var cp;

function StartStreaming(camId, camName) {
    OpenVideoTab();

    this.PanelManager.AddCamera(camId, camName);
    SetVideoTabTitle(camName, camId);
}



//------------------------------------------------------------------------------------------------------------------------------------
// VIDEO TAB 
//------------------------------------------------------------------------------------------------------------------------------------
var xmlhttp_c, s = false;

function OpenVideoTab() {
    CurActiveTab="VdoTab";
    SetRefreshMetaTag(1000*60);
    document.getElementById('LoginTab').style.display = "none";
    
    MakeTabsBarVisible();

    document.getElementById('SearchTab').style.display = "none";
    document.getElementById('TAB1').style.backgroundImage = 'url(images/tab_ser_off.png)';

    document.getElementById('VideoTab').style.display = "block";
    document.getElementById('TAB3').style.backgroundImage = 'url(images/tab_vdo_on.png)';

    document.getElementById('SettingsTab').style.display = "none";
    document.getElementById('TAB2').style.backgroundImage = 'url(images/tab_stng_off.png)';

    document.getElementById('NotificationsTab').style.display = "none";
    document.getElementById('TAB4').style.backgroundImage = 'url(images/tab_ntf_off.png)';

    PanelManager.PauseSalvo(false);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function OptBarClick(id) {
    var ele = gEBI(id);

    if (ele == null) {
        console.error('OptBarClick - inavlid element id');
        return;
    }

    switch (id) {
        case 'opt_live':
            PanelManager.StartLive();
            break;

        case 'opt_ss':
            PanelManager.GetSnapshot();
            break;

        case 'opt_jump':
            break;

        case 'opt_speed':
            openFPSPicker(PanelManager.GetSpeed());
            break;

        case 'opt_ptz_sl':
            if (gEBI('OPT_PTZ').style.display == 'none') {
                ele.style.backgroundImage = 'url(images/opt_ptz_on.png)';
                gEBI('OPT_PTZ').style.display = 'block';
            }
            else {
                ele.style.backgroundImage = 'url(images/opt_ptz_off.png)';
                gEBI('OPT_PTZ').style.display = 'none';
            }
            break;

        case 'opt_flp_vt':
            PanelManager.ToggleFlipVtl();
            break;

        case 'opt_flp_hz':
            PanelManager.ToggleFlipHzl();
            break;

        case 'opt_salvo_sl':
            if (gEBI('OPT_SALVO').style.display == 'none') {
                ele.style.backgroundImage = 'url(images/opt_salvo_on.png)';
                gEBI('OPT_SALVO').style.display = 'block';
            }
            else {
                ele.style.backgroundImage = 'url(images/opt_salvo_off.png)';
                gEBI('OPT_SALVO').style.display = 'none';
            }
            break;

        default:
            console.error('OptBarClick - unhandled id');
    }
}

function PZT(val, id) {
    var ele = gEBI(id);

    if (ele == null) {
        console.error('PTZ - inavlid element id');
        return;
    }

    if (!(val >= -5 && val <= 5)) {
        console.error('PTZ - inavlid PTZ value');
        return;
    }

    switch (id) {
        case 'pan_l':
            PanelManager.Pan(val);
            break;

        case 'pan_r':
            PanelManager.Pan(val);
            break;
        case 'tilt_u':
            PanelManager.Tilt(val);
            break;

        case 'tilt_d':
            PanelManager.Tilt(val);
            break;

        case 'zoom_i':
            PanelManager.Zoom(val);
            break;

        case 'zoom_o':
            PanelManager.Zoom(val);
            break;
        case 'preset':
            openPresetPicker(1);
            break;
        default:
            console.error('PTZ - inavlid PTZ option');
    }
}


//call preset
function PresetCallback(presetNo) {
    PanelManager.TriggerPreset(presetNo);
}

// Speed (fps)
function SetSpeed(val) {
    PanelManager.SetSpeed(val);
}
// Presets (presetNumber)
function SetPreset(val) {
    PanelManager.setPreset(val);
}

// Salvo types
function ChangeSalvo(type) {
    PanelManager.ChangeSalvoType(type);

    // Close salvo option menu
    OptBarClick('opt_salvo_sl');
}

function ClearSalvo() {
    PanelManager.ClearSalvo();

    // Close salvo option menu
    OptBarClick('opt_salvo_sl');
}

function FormatCameraName(camName, camId) {
    var tmp = '';
    if (camId > 0) {
        if (camName.length > CamNameMaxLen) {
            tmp = camName.substring(0, (CamNameMaxLen - 3)) + '...';
        } else {
            tmp = camName.substring(0, CamNameMaxLen);
        }

        // Check if show camera ID is enabled.
        if (gEBI('ShwCamId').checked == true)
            tmp = tmp + '(' + camId + ')';
    }

    return tmp;
}

function SetVideoTabTitle(camName, camId) {
    var tmp = FormatCameraName(camName, camId);

    if (tmp.length > 0)
        gEBI('CamNameSpan').innerHTML = tmp;
    else
        gEBI('CamNameSpan').innerHTML = '&nbsp;Select a camera&nbsp;';
}

// Salvo HTML events
function onSalvoCellFocus(id) {
    // Set previously focused cell changes
    // Set border color
    document.getElementById(PanelManager.FocusedCellId).style.borderColor = "gray";
    // hide close button
    if (PanelManager.FocusedPanelId > -1)
        document.getElementById("xCam" + PanelManager.FocusedPanelId).style.display = "none";

    // Set new focused cell changes
    // Set border color
    document.getElementById(id).style.borderColor = "#ffbb00";

    PanelManager.FocusedCellId = id;
    PanelManager.GetPanelIdFromCellId();

    // display close button
    if (PanelManager.FocusedPanelId > -1)
        document.getElementById("xCam" + PanelManager.FocusedPanelId).style.display = "block";

    if (PanelManager.FocusedPanelId > -1)
        SetVideoTabTitle(PanelManager.PanelList[PanelManager.FocusedPanelId].CameraName, PanelManager.PanelList[PanelManager.FocusedPanelId].CameraId);
    else
        SetVideoTabTitle('', 0);
}

function OnCameraClose(PanelId) {
       
    PanelManager.RemoveCamera(PanelId);
    PanelManager.ClearSalvoCell(PanelManager.FocusedCellId);
    PanelManager.FocusedPanelId = -1;
}

function onCameraAdd() {
    OpenSearchTab();
}




/*Read from cookie*/
function ReadCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return unescape(y);
            }
        }
}

/*Save the data to cookie*/
function setCookie(c_name,value,exdays)
{
    document.cookie=null;
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}


var AppState={
    ActiveTab: "st",

    // Search Tab specific
    SearchString: "",
    
    // Video Tab Specific
    objPanelMgr: null,
    
    // Settings Tab Specific
    DispCamId: false
        
    // Notifications Tab Specific

}

function SaveAppState() {

    AppState.ActiveTab = CurActiveTab;
    AppState.SearchString = "";
    AppState.objPanelMgr = PanelManager;
    AppState.DispCamId = "";

    var strCooki = "";

    // Save into JSON
    strCooki = JSON.stringify(AppState);
    window.name = strCooki;

    //setCookie("SalvoJSON",strCooki,10);     
    //document.cookie = "SalvoJSON=" + strPnlList + ";expires=" + todayDate.toGMTString() + ";";
}

function ReconstructSalvo() {
    
    var strCookie = window.name;
    //var strCookie = ReadCookie("SalvoJSON");

    //    document.cookie[
    var c_Object = JSON.parse(strCookie);
    var PM=c_Object.objPanelMgr ;

    // Change Salvo Type
    PanelManager.ChangeSalvoType(PM.CurrentSalvoType);
    
    // Good to do some cleanup.
    PanelManager.ClearSalvo();
    
    // Set the focus to cell
    onSalvoCellFocus(PM.FocusedCellId);
    
    PanelManager.SalvoMarkupContainerId = PM.SalvoMarkupContainerId;

    for (i = 0; i < PM.PanelList.length; i++) {
        PanelManager.FocusedCellId = PM.PanelList[i].CellId;
        PanelManager.FocusedPanelId = -1; // should be -1. Else PanelManager will assign same Panel Id for all cameras.
        PanelManager.AddCamera(PM.PanelList[i].CameraId, PM.PanelList[i].CameraName);
        
        // Now FocusedPanelId will be newly added camera panleID. 
        // So set all other properties of camera on PanelManager itself
        
        // Set Flip modes
        if(PM.PanelList[i].FlipH == true)
            PanelManager.ToggleFlipHzl();
        
        if(PM.PanelList[i].FlipV == true)
            PanelManager.ToggleFlipVtl();

        // Is camera in Snapshot mode?
        if(PM.PanelList[i].PlayStatus == 3)
            PanelManager.GetSnapshot(); 
       
        // Set camera speed
        PanelManager.SetSpeed(PM.PanelList[i].StreamSpeed);        

    }
    
    PanelManager.FocusedCellId = PM.FocusedCellId;
    PanelManager.GetPanelIdFromCellId(); // this will set the proper panel id from cell id.
    
    // Set the focus to cell
    //onSalvoCellFocus(PanelManager.FocusedCellId);
}

// PanelManager manages mobile application salvo. Base container to cameras in salvo.
// PanelManager should be singleton.
var PanelManager = new function() {        // Singleton

    //-------- data -------------
    this.CurrentSalvoType = 0; //0 - None, 1 - 1x1, 2 - 2x2
    this.PanelList = new Array();
    this.SalvoMarkupContainerId = "";
    this.FocusedPanelId = -1; // should be index in PanelList array.
    this.FocusedCellId = ""; // should be <DIV> id of salvo cell selected.
    //this.DefaultPanelImg = ""; // Image to display when panel is empty.
    this.EmptyCellMarkup = "";

    //-------- functionality -------------

    this.Initialize = function(nSalvoType, strSalvoContainerId) {
        if (strSalvoContainerId.length == 0)
            this.SalvoMarkupContainerId = strSalvoContainerId;
        else
            this.SalvoMarkupContainerId = "SalvoContainer";

        if (nSalvoType == 1 || nSalvoType == 2)
            this.ChangeSalvoType(nSalvoType);
        else
            this.ChangeSalvoType(1);
    }

    // CameraID (required)
    // CameraName (required)
    // dstPnlId (optional) - if camera is choosen from empty panel (from salvo).
    this.AddCamera = function(CameraId, CameraName) {
        var dstPnlId = -1;

        if (this.FocusedPanelId > -1) {
            // delete existing camera view & assign same panle id.
            this.RemoveCamera(this.FocusedPanelId);

            dstPnlId = this.FocusedPanelId;
        }
        else
            dstPnlId = this.GetNextSuitablePanelId();

        var tmp = new CameraPanel();
        tmp.Initialize(CameraId, CameraName, dstPnlId, this.FocusedCellId); // dstPnlId should be index in PanelList array.

        this.PanelList[dstPnlId] = tmp;
        this.FocusedPanelId = dstPnlId;

        document.getElementById(this.FocusedCellId).innerHTML = this.PanelList[dstPnlId].PanelMarkup;

        // start streaming
        this.PanelList[dstPnlId].StartLive();
    }

    // Function to gets the suitable panel from panel list
    // Returns: suitable panel Id
    this.GetNextSuitablePanelId = function() {

        switch (this.CurrentSalvoType) {
            case 1: // 1x1 - only 1 panel
                if (this.PanelList[0] == null)
                    return 0;
                else {
                    // remove existing camera panel
                    this.RemoveCamera(0);
                    return 0;
                }
                break;

            case 2: // 2x2 - total 4 panels
                var i;
                for (i = 0; i < this.PanelList.length; i++) {
                    if (this.PanelList[i] == null)
                        return i;
                }

                if (i < 4)
                    return i; // for new cell

                if (i >= 4) {
                    console.error('GetNextSuitablePanelId() - shouldnot reach here [1]');
                    this.RemoveCamera(0);
                    return 0;
                }
                break;

            default:
                console.error('GetNextSuitablePanelId() Invalid Salvo type - ' + this.CurrentSalvoType);
        }
    }

    this.RemoveCamera = function(PanelId) {
        if (PanelId > -1) {
            if (this.PanelList[PanelId] != null) {
                this.PanelList[PanelId].Stop();
                this.PanelList[PanelId].Dispose();
                this.PanelList[PanelId] = null;
            }
        }
    }

    this.ClearPanelList = function() {
        for (i = 0; i < this.PanelList.length; i++) {
            if (this.PanelList[i] != null)
                this.RemoveCamera(i);
        }

        this.PanelList = null;
        this.PanelList = new Array();
        this.FocusedPanelId = -1;
    }

    this.ClearSalvo = function() {
        switch (this.CurrentSalvoType) {
            case 1:
                this.ClearPanelList();
                document.getElementById('SalvoContainer').innerHTML = this.CreateSalvoMarkup(1);
                this.FocusedCellId = "SLV_1X1_11";
                onSalvoCellFocus(this.FocusedCellId);
                break;
            case 2:
                this.ClearPanelList();
                document.getElementById('SalvoContainer').innerHTML = this.CreateSalvoMarkup(2);
                this.FocusedCellId = "SLV_2X2_11";
                onSalvoCellFocus(this.FocusedCellId);
                break;
            default:
                console.error('ClearSalvo() Invalid Salvo type - ' + this.CurrentSalvoType);
        }
    }

    // Creates the HTML markup for Salvo
    this.CreateSalvoMarkup = function(nSalvoType) {
        var strMarkup = "";

        switch (nSalvoType) {
            case 1:
                strMarkup = '<div id="SLV_TYP_1X1" class="SLV_1X1"><div id="SLV_1X1_11" onclick="onSalvoCellFocus(this.id)"><img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span></div></div>';
                this.EmptyCellMarkup = '<img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span>';
                break;
            case 2:
                strMarkup = '<div id="SLV_TYP_2X2" class="SLV_2X2"><div id="SLV_2X2_11" onclick="onSalvoCellFocus(this.id)"><img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span></div><div id="SLV_2X2_12" onclick="onSalvoCellFocus(this.id)"><img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span></div><div id="SLV_2X2_21" onclick="onSalvoCellFocus(this.id)"><img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span></div><div id="SLV_2X2_22" onclick="onSalvoCellFocus(this.id)"><img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span></div></div>';
                this.EmptyCellMarkup = '<img src="images/cell_bg.png" /><span class="ADD_CAM" onclick="onCameraAdd()" >&nbsp;</span>';
                break;
            default:
                console.error('CreateSalvoMarkup() Invalid Salvo type - ' + nSalvoType);
        }

        return strMarkup;
    }

    this.ClearSalvoCell = function(cellId) {
        document.getElementById(cellId).innerHTML = this.EmptyCellMarkup;
    }

    this.ChangeSalvoType = function(nSalvoType) {
        if (this.CurrentSalvoType == nSalvoType)
            return;

        switch (nSalvoType) {
            case 1:
                document.getElementById('SalvoContainer').innerHTML = this.CreateSalvoMarkup(1);
                this.FocusedCellId = "SLV_1X1_11";

                // move focused camera view to new salvo
                if (this.CurrentSalvoType == 2) {
                    if (this.FocusedPanelId == -1) {
                        this.ClearPanelList();
                    }
                    else {
                        for (i = 0; i < this.PanelList.length && i != this.FocusedPanelId; i++) {
                            this.RemoveCamera(i);
                        }

                        document.getElementById(this.FocusedCellId).innerHTML = this.PanelList[this.FocusedPanelId].PanelMarkup;
                        this.PanelList[this.FocusedPanelId].CellId = this.FocusedCellId; // [IMP]Required for ReconstructSalvo
                    }
                }

                this.CurrentSalvoType = nSalvoType;
                onSalvoCellFocus(this.FocusedCellId);
                break;
            case 2:
                document.getElementById('SalvoContainer').innerHTML = this.CreateSalvoMarkup(2);
                this.FocusedCellId = "SLV_2X2_11";

                // move focused camera view to new salvo
                if (this.CurrentSalvoType == 1) {
                    if (this.FocusedPanelId == -1) {
                        this.ClearPanelList();
                    }
                    else {
                        for (i = 0; i < this.PanelList.length && i != this.FocusedPanelId; i++) {
                            this.RemoveCamera(i);
                        }

                        document.getElementById(this.FocusedCellId).innerHTML = this.PanelList[this.FocusedPanelId].PanelMarkup;
                        this.PanelList[this.FocusedPanelId].CellId = this.FocusedCellId; // [IMP]Required for ReconstructSalvo
                    }
                }

                this.CurrentSalvoType = nSalvoType;
                onSalvoCellFocus(this.FocusedCellId);
                break;
            default:
                console.error('ChangeSalvoType() Invalid Salvo type - ' + nSalvoType);
        }
    }

    this.GetPanelIdFromCellId = function() {
        if (this.FocusedCellId.length != 0) {
            var strXML;
            var x = "";
            strXML = "<div>" + document.getElementById(this.FocusedCellId).innerHTML + "</div>";
            $(strXML).find('img').each(
                    function() {
                        var i = this.id;
                        if (i.substr(0, 6) == 'imgCam') {
                            x = i;
                        }
                    }
                );
            if (x.length > 6 && (x.substr(0, 6) == 'imgCam')) {
                this.FocusedPanelId = x.substring(6, x.length);
                console.log(this.FocusedPanelId);
            }
            else {
                this.FocusedPanelId = -1;
                console.log('- Empty Panel -');
            }
        }
    }

    //
    this.StartLive = function() {
        if (this.FocusedPanelId > -1) {
            this.PanelList[this.FocusedPanelId].StartLive();
        }
    }

    this.GetSnapshot = function() {
        if (this.FocusedPanelId > -1) {
            this.PanelList[this.FocusedPanelId].GetSnapshot();
        }
    }

    // PTZ operations
    this.Pan = function(val) {
        if (this.FocusedPanelId > -1) {
            if (val >= -5 && val <= 5)
                this.PanelList[this.FocusedPanelId].Pan(val);
        }
    }

    this.Tilt = function(val) {
        if (this.FocusedPanelId > -1) {
            if (val >= -5 && val <= 5)
                this.PanelList[this.FocusedPanelId].Tilt(val);
        }
    }

    this.Zoom = function(val) {
        if (this.FocusedPanelId > -1) {
            if (val >= -5 && val <= 5)
                this.PanelList[this.FocusedPanelId].Zoom(val);
        }
    }

    this.PauseSalvo = function(pause) {
        for (i = 0; i < this.PanelList.length; i++) {
            if (this.PanelList[i] != null) {
                this.PanelList[i].SetSalvoPause(pause);
            }
        }
    }

    // Speed(fps)
    this.SetSpeed = function(val) {
        if (this.FocusedPanelId > -1) {
            if (val > 0 && val <= 4)
                this.PanelList[this.FocusedPanelId].StreamSpeed = val;
        }
    }

    this.GetSpeed = function() {
        if (this.FocusedPanelId > -1) {
            return this.PanelList[this.FocusedPanelId].StreamSpeed;
        }
        else
            return 0;
    }

    // Presets
    this.TriggerPreset = function(val) {
        if (this.FocusedPanelId > -1) {
            if (val > 0 && val <= 255)
                this.PanelList[this.FocusedPanelId].SetPreset(val);
        }
    }

    // Flip operations
    this.ToggleFlipHzl = function() {
        if (this.FocusedPanelId > -1) {
            this.PanelList[this.FocusedPanelId].ToggleFlipHzl();
        }
    }
    this.ToggleFlipVtl = function() {
        if (this.FocusedPanelId > -1) {
            this.PanelList[this.FocusedPanelId].ToggleFlipVtl();
        }
    }

}


// Object which represents single camera & its container (panel).
// Panel manager will create one CameraPanel for each panel in salvo.
function CameraPanel() {

    //-------- data ----------

    this.PanelId = ""; // Index in panel list array.
    this.CellId = "";  // [IMP]Required for ReconstructSalvo
    this.CameraId = "";
    this.CameraName = "";
    this.StreamDateTime = "";
    this.PlayMode = 1; // 1 - LIVE, 2 - PLAYBACK
    this.StreamSpeed = 1; // 1fps, 2fps, 3fps, 4fps, 5fps
    this.PlayDirection = 0; // 0 - LIVE, 1 - FWD, -1 - BWD
    this.PlayStatus = 0; // 0 - STOP, 1 - PLAY, 2 - PAUSE, 3 - SNAPSHOT
    this.FlipH = false;
    this.FlipV = false;
    this.IsSalvoPause = false;
    this.DefaultImg = "images/loading.gif";
    this.ErrorImg = "images/device_err1.png"
    this.objAJAX = null;

    this.URL = "";
    this.imgTagId = "";
    this.PanelMarkup = ""; // Contains the HTML markup for panel (<img>)

    this.StreamError = "";
    this.OtherError = "";

    //-------- functionality -------------

    this.Initialize = function(CamId, CamName, PnlId, CellId) {
        this.CameraId = CamId;
        this.CameraName = CamName;
        this.PanelId = PnlId;
        this.CellId = CellId; // [IMP]Required for ReconstructSalvo
        this.imgTagId = "imgCam" + this.PanelId;

        this.PreparePanelMarkup();
    }

    // Prepare panel markup
    this.PreparePanelMarkup = function() {
        if (this.CameraId > 0) {
            if (this.imgTagId.length > 6) { // imgTagId format : imgCamXX; XX should be Panel Id
                this.PanelMarkup = '<img id="' + this.imgTagId + '" src="' + this.DefaultImg + '"></img>';
                this.PanelMarkup += '<span id="pmCam' + this.PanelId + '" class="OL_PM">Live</span>'; /* play mode - LIVE / PLAYBACK */
                //this.PanelMarkup += '<span id="ptCam' + this.PanelId + '" class="OL_PT">18 Sep 2011 4:55pm</span>'; /* play time */
                this.PanelMarkup += '<span id="xCam' + this.PanelId + '" onclick="OnCameraClose(' + this.PanelId + ')" class="OL_CLOSE"><img src="./images/closecam.png" style="width:17px; min-height:17px; max-height:14px;"/></span>';
            }
            else
                console.warn('PreparePanelMarkup() - Not a valid image tag id (imgTagId) - ' + this.imgTagId.length);
        }
        else {
            this.PanelMarkup = '<img id="' + imgTagId + '" width="99%" height="99%" style="margin: 0px; padding: 0px; max-height: 99%; max-width: 99%;" src="" />'; // 
            console.warn('PreparePanelMarkup() - Not a valid camera id - ' + this.CameraId);
        }
    }

    this.StartLive = function() {

        if (this.CameraId > 0) {
            // form & set appropriate PSIA REST URL
            this.URL = "./PSIA/Streaming/channels/" + this.CameraId + "/picture?snapShotImageType=JPEG";
            //this.PlayStatus = 1;
            this.SetPlayStatus(1);
            this.Streamer();
        }
        else
            console.error('StartLive() - Not a valid camera id - ' + this.CameraId);
    }

    this.StartPlayback = function() {

    }

    this.GetSnapshot = function() {
        if (this.CameraId > 0) {
            //this.PlayStatus = 3;
            this.SetPlayStatus(3);
            this.URL = "./PSIA/Streaming/channels/" + this.CameraId + "/picture?snapShotImageType=JPEG";
            this.Streamer();
        }
        else
            console.error('GetSnapshot() - Not a valid camera id - ' + this.CameraId);
    }

    this.SetPlayStatus = function(stsValue) {
        switch (stsValue) {
            case 0: // 0 - STOP
                this.PlayStatus = 0;
                if (gEBI('pmCam' + this.PanelId))
                    gEBI('pmCam' + this.PanelId).innerText = '&nsp;';
                break;
            case 1: // 1 - PLAY
                this.PlayStatus = 1;
                if (this.PlayMode == 1) { // LIVE
                    if (gEBI('pmCam' + this.PanelId))
                        gEBI('pmCam' + this.PanelId).innerText = 'Live';
                }
                else
                    if (this.PlayMode == 2) { // Play back
                    if (gEBI('pmCam' + this.PanelId))
                        gEBI('pmCam' + this.PanelId).innerText = '&nsp;';
                }
                break;
            case 2: // 2 - PAUSE
                this.PlayStatus = 2;
                if (gEBI('pmCam' + this.PanelId))
                    gEBI('pmCam' + this.PanelId).innerText = '||';
                break;
            case 3: // 3 - SNAPSHOT
                this.PlayStatus = 3;
                if (gEBI('pmCam' + this.PanelId))
                    gEBI('pmCam' + this.PanelId).innerHTML = 'Live[Snap]';
                break;
            default:
                console.error('SetPlayStatus() - Not a valid Play Status value - ' + stsValue);
        }
    }

    this.SetSalvoPause = function(pause) {
        if (pause == true) {
            this.IsSalvoPause = true;
        }
        else {
            this.IsSalvoPause = false;
            if (this.PlayStatus == 1) {
                this.Streamer();
            }
        }

        console.log('SetSalvoPause: ' + pause);
    }

    this.Streamer = function() {

        try {
            //alert(this.imgTagId);

            // *Note: Workaround for Java Script limitation with "this" operator in innere functions.
            //        In inner function we cant access parent object with "this" operator. 
            //        So, create a local variable (parentThis) which refers the parent obect.
            var parentThis;
            parentThis = this;

            if (this.PlayStatus == 1 || this.PlayStatus == 3) {
                // *Note: In Black Berry browser we can't reuse single AJAX object. 
                //        For this reason for every request AJAX object is recreated.
                //var objAJAX;
                if (this.objAJAX == null)
                {
                    objAJAX = new XMLHttpRequest();
                }

                objAJAX.open("GET", this.URL, true);
                objAJAX.send();
                objAJAX.onreadystatechange = function() {

                    if (this.readyState == 4) {

                        switch (this.status) {
                            case 200:
                                // Render image data
                                if (this.responseText.length > 200) {
                                    setTimeout(parentThis.Renderer(this.responseText), 5);
                                }

                                if (parentThis.PlayStatus == 1 && parentThis.IsSalvoPause == false) // only in LIVE request for next frame
                                    setTimeout(parentThis.Streamer(), Math.round(1000 / parentThis.StreamSpeed));

                                break;

                            default:
                                console.log('Streamer() - XHR req status:' + this.status + ' - status text:' + this.statusText);
                                // retry after 3 seconds

                                if (parentThis.PlayStatus == 1 && parentThis.IsSalvoPause == false) // only in LIVE request for next frame
                                    setTimeout(parentThis.Streamer(), 3000);
                                    
                                parentThis.SetError(404);
                        }

                    }
                }
            }
        } catch (e) {
            console.log("Streamer - " + e);
        }

        finally {

        }

        // - Todo -
        // AJAX obj cleaning & optimization.
        // AJAX request time out
        // Validations where ever required
        // StreamSpeed optimization which includes previous req turnaround time.

    }

    this.Renderer = function(b64ImgSrc) {
        document.getElementById(this.imgTagId).src = "data:image/jpeg;charset=utf-8;base64," + b64ImgSrc;
    }

    this.SetDefaultImage = function() {
        document.getElementById(this.imgTagId).src = this.DefaultImg;
    }

    this.SetError = function(errType) {
        // Based on error type set image.
        document.getElementById(this.imgTagId).src = this.ErrorImg;
    }

    this.Play = function() {
        // should be only for playback
        if (this.PlayMode == 2) {
            //this.PlayStatus = 1;
            this.SetPlayStatus(1);
            this.Streamer();
        }
    }

    this.Pause = function() {
        // should be only for playback
        if (this.PlayMode == 2) {
            //this.PlayStatus = 2;
            this.SetPlayStatus(2);
        }
    }

    this.Stop = function() {
        //this.PlayStatus = 0;
        this.SetPlayStatus(0);
    }

    this.Jump = function() { }

    this.OnPanelFocus = function() {

        PanelManager.FocusedPanelId = this.PanelId;

        // Set Camera title as heading
    }

    // PTZ operations
    this.Pan = function(val) {
    
        alert("PAN progress--" +val);
    
        var q_params="pan=" + val;
        var ptzUrl = "./PSIA/PTZ/channels/" + this.CameraId + "/continuous?"+q_params;

        var objAJAX;
        objAJAX = new XMLHttpRequest();

        objAJAX.open("PUT", ptzUrl, true);
        objAJAX.setRequestHeader("Content-length",q_params.length);
        
        
        objAJAX.onreadystatechange = function() {

            if (this.readyState == 4) {

                switch (this.status) {
                    case 200:
                        break;

                    default:
                          alert('Pan(' + val + ') - XHR req status:' + this.status + ' - status text:' + this.statusText);
                        console.log('Pan(' + val + ') - XHR req status:' + this.status + ' - status text:' + this.statusText);
                }

            }
        }
        alert("PAN send--" +q_params);
        objAJAX.send();
    }

    this.Tilt = function(val) {

        var ptzUrl = "./PSIA/PTZ/channels/" + this.CameraId + "/continuous?tilt=" + val;

        var objAJAX;
        objAJAX = new XMLHttpRequest();

        objAJAX.open("PUT", ptzUrl, true);
        objAJAX.send();
        objAJAX.onreadystatechange = function() {

            if (this.readyState == 4) {

                switch (this.status) {
                    case 200:
                        break;

                    default:
                        console.log('Tilt(' + val + ') - XHR req status:' + this.status + ' - status text:' + this.statusText);
                }

            }
        }
    }

    this.Zoom = function(val) {

        var ptzUrl = "./PSIA/PTZ/channels/" + this.CameraId + "/continuous?zoom=" + val;

        var objAJAX;
        objAJAX = new XMLHttpRequest();

        objAJAX.open("PUT", ptzUrl, true);
        objAJAX.send();
        objAJAX.onreadystatechange = function() {

            if (this.readyState == 4) {

                switch (this.status) {
                    case 200:
                        break;

                    default:
                        console.log('Zoom(' + val + ') - XHR req status:' + this.status + ' - status text:' + this.statusText);
                }

            }
        }

    }

    this.ToggleFlipHzl = function() {
        if (this.FlipH == true) {
            document.getElementById(this.imgTagId).style.webkitTransform = "scaleY(1)";
            document.getElementById(this.imgTagId).style.transform = "scaleY(1)";
            this.FlipH = false;
            console.log('ToggleFlipHzl' + this.FlipH + this.PanelId);
        }
        else {
            document.getElementById(this.imgTagId).style.webkitTransform = "scaleY(-1)";
            document.getElementById(this.imgTagId).style.transform = "scaleY(-1)";
            this.FlipH = true;
            console.log('ToggleFlipHzl' + this.FlipH + this.PanelId);
        }
    }

    this.ToggleFlipVtl = function() {
        if (this.FlipV == true) {
            document.getElementById(this.imgTagId).style.webkitTransform = "scaleX(1)";
            document.getElementById(this.imgTagId).style.transform = "scaleX(1)";
            this.FlipV = false;
            console.log('ToggleFlipVtl' + this.FlipV + this.PanelId);
        }
        else {
            document.getElementById(this.imgTagId).style.webkitTransform = "scaleX(-1)";
            document.getElementById(this.imgTagId).style.transform = "scaleX(-1)";
            this.FlipV = true;
            console.log('ToggleFlipVtl' + this.FlipV + this.PanelId);
        }
    }

    // Presets
    this.SetPreset = function(presetId) {
        if (presetId > 0 && presetId <= 255) {

            var ptzUrl = "./PSIA/PTZ/channels/" + this.CameraId + "/presets/" + presetId + "/goto";

            var objAJAX;
            objAJAX = new XMLHttpRequest();

            objAJAX.open("PUT", ptzUrl, true);
            objAJAX.send();
            objAJAX.onreadystatechange = function() {

                if (this.readyState == 4) {

                    switch (this.status) {
                        case 200:
                            break;

                        default:
                            console.log('setPreset(' + val + ') - XHR req status:' + this.status + ' - status text:' + this.statusText);
                    }
                }
            }
        }
    }

    this.Dispose = function() { }
}


//------------------------------------------------------------------------------------------------------------------------------------
// NOTIFICATIONS TAB 
//------------------------------------------------------------------------------------------------------------------------------------

function OpenNotificationsTab() {
    CurActiveTab="NtfTab";
    SetRefreshMetaTag(1000*60*60*60);
    document.getElementById('LoginTab').style.display = "none";
    
    MakeTabsBarVisible();

    document.getElementById('SearchTab').style.display = "none";
    document.getElementById('TAB1').style.backgroundImage = 'url(images/tab_ser_off.png)';

    document.getElementById('VideoTab').style.display = "none";
    document.getElementById('TAB3').style.backgroundImage = 'url(images/tab_vdo_off.png)';

    document.getElementById('SettingsTab').style.display = "none";
    document.getElementById('TAB2').style.backgroundImage = 'url(images/tab_stng_off.png)';

    document.getElementById('NotificationsTab').style.display = "block";
    document.getElementById('TAB4').style.backgroundImage = 'url(images/tab_ntf_on.png)';

    PanelManager.PauseSalvo(true);
}

//------------------------------------------------------------------------------------------------------
//
// PSIA API Response XML Serialization classes
// 
//------------------------------------------------------------------------------------------------------

function ResponseStatus(xmlRspSts) {

    //-------- data -------------
    this.requestURL = "";
    this.statusCode = 0;
    this.statusString = "";
    this.ID = "";

    if (xmlRspSts) {
        this.strXML = xmlRspSts;
    }
    else
        this.strXML = "";

    //-------- functionality -------------
    this.Deserialize = function() {

        var requestURL = "";
        var statusCode = 0;
        var statusString = "";
        var ID = "";

        $(this.strXML).find('ResponseStatus').each(

        function() {
            requestURL = $(this).find('requestURL').text();
            statusCode = $(this).find('statusCode').text();
            statusString = $(this).find('statusString').text();
            ID = $(this).find('ID').text();
        })

        this.requestURL = requestURL;
        this.statusCode = statusCode;
        this.statusString = statusString;
        this.ID = ID;
    }
}

function StreamingChannelList(xmlChnlLst) {

    //-------- data -------------

    if (xmlChnlLst) {
        this.strXML = xmlChnlLst;
    }
    else
        this.strXML = "";

    //-------- functionality -------------

    this.PopulateChannelList = function() {

        var ChannelList = new Array();
        var i = 0;

        $(this.strXML).find('StreamingChannel').each(

                    function() {
                        var tmp = new StreamingChannel();
                        //tmp.Serialize($(this).innerHTML);
                        tmp.SetChannelId($(this).find('id').text());
                        tmp.SetChannelName($(this).find('channelName').text());
                        tmp.SetEnabled($(this).find('enabled').text());

                        ChannelList[i] = tmp;
                        i++;
                    }
                );

        // *******************************
        // make it member variable (this.) - cloning ;)
        this.ChannelList = ChannelList;
        // *******************************
    }

    this.GetChannelList = function() {
        return this.ChannelList;
    }

    this.Search = function(searchString) {
        searchString = searchString.toUpperCase();
        var lst = new Array();

        if (this.ChannelList.length > 0) {
            var y = 0;
            for (var x = 0; x < this.ChannelList.length; x++) {
                var tmp = new String();
                tmp = this.ChannelList[x].GetChannelName().toUpperCase();
                if (tmp.search(searchString) > -1) {
                    lst[y] = this.ChannelList[x];
                    y++;
                }
            }
        }

        return lst;
    }

    // - Todo -
    // Proper validations
    // Push data serialization to StreamingChannel class.
}


function StreamingChannel() {

    //-------- data -------------
    // Set Get ChannelId
    this.SetChannelId = function(ChnlId) {
        this.ChannelId = ChnlId;
    }

    this.GetChannelId = function() {
        return this.ChannelId;
    }

    // Set Get ChannelName
    this.SetChannelName = function(ChnlName) {
        this.ChannelName = ChnlName;
    }

    this.GetChannelName = function() {
        return this.ChannelName;
    }

    // Set get Enabled
    this.SetEnabled = function(Enabled) {
        this.IsEnabled = Enabled;
    }

    this.GetEnabled = function() {
        return this.IsEnabled;
    }

    //-------- functionality -------------

    //            this.Serialize = function (xml) {
    //                this.SetChannelId($(xml).find('id').text());
    //                this.SetChannelName($(xml).find('channelName').text());
    //                this.SetEnabled($(xml).find('enabled').text());
    //            }

    // - Todo -
    // Add StreamingChannel serialization to this class.
    // Add validations according to PSIA StreamingChannel XML schema.

}
