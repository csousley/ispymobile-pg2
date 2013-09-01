var logCount = 0;
var logCountUpTo = 4;
var isLogStatusShowing = false;
var isBrowserFirst = true;
var logStatusInterval = null;
var pushNotification = null;
var browser = null;
var customers = null;
var cadsettings = null;
var agency = null;
var deviceType = null;
var isiSpyRegistered = false;

var debug = false;


$(document).ready(function() {
    $.ajaxSetup({cache:false});
    // $(window).resize(function(){
    //     var height = $(document).height();
    //     $("#show").css("height", height);
    // });
});

function documentReady() {
    log("debug status: " + debug);
    if (debug) {
        alert("DEBUG ENABLED");
        window.localStorage.setItem("agency", "CFD");
        window.localStorage.setItem("devicetype", "IOS");
        window.localStorage.setItem("user", "cy@cyzer.com");
        window.localStorage.setItem("userID", "null");
        window.localStorage.setItem("cadsettings", "{\"matchingUnits\": [\"CFD\", \"A21\"]}");
        
        agency = window.localStorage.getItem("agency");
        deviceType = window.localStorage.getItem("devicetype");
        cadsettings = window.localStorage.getItem("cadsettings");
        
        setHeaderTexts();
        
        if (uCheck(cadsettings))
            cadsettings = $.parseJSON(cadsettings);
    }else{
        agency = window.localStorage.getItem("agency");
        deviceType = window.localStorage.getItem("devicetype");
        cadsettings = window.localStorage.getItem("cadsettings");
    }
    
    moveShiftDiv();
    
    log("AGENCY: " + agency);
    log("DEVICETYPE: " + deviceType);
    
    if (!debug) {
        if (!uCheck(agency)) {
            log("No agency get customers");
            getCustomers();
        } else {
            log("Reg and Cad Settings");
            iSpyReg();
            getCadSettings();
            if (uCheck(window.localStorage.getItem("userID"))) {
                getShiftCalendar();
            }else{
                getPersonIDForUser(window.localStorage.getItem("user"));
            }
            setHeaderTexts();
        }
    }else{
        var debugCalls = "{\"results\": [{\"AgencyCode\": \"CFD\",\"CallNumber\": \"31\",\"CallPriority\": \"1\",\"CallTypeLawFireEMS\": \"f\",\"CallZoneCode\": \"CFD1\",\"CityCode\": \"CAS\",\"CityInfo\": {\"City\": \"CASHMERE\",\"CityCode\": \"CAS\",\"StateAbbreviation\": \"WA\",\"ZIPCode\": \"98815\",\"MileageToCity\": \"0\"},\"ClearanceCodeLawOnly\": \"NA\",\"DispatchLevelStatus\": \"0\",\"Disposition\": \"ACT\",\"GeobaseAddressID\": \"534\",\"HighBitsOfXCoordinate\": \"-240\",\"HowManyTimesTextChanged\": \"4\",\"IncidentNature\": \"BREATHING PROB\",\"JoinedComments\": \"ELDERLY FEMALE CANT BREATH\",\"JoinedResponders\": \"BALL CFD A21\",\"JoinedRespondersDetail\": [{\"UnitNumber\": \"BALL\",\"UnitTypeLawFireEMS\": \"e\",\"LongTermCallID\": \"1308-3707\",\"CallTypeAssignedTo\": \"e\",\"StatusDisplayCode\": \"PAGED\",\"UnitZoneCode\": \"BALL\",\"AgencyCode\": \"BALL\",\"LastRadioLogComments\": \"incid#=13BAL2020Pagedcall=31e\",\"LastAddressRespondedTo\": \"115 EAST PLEASANT ST;#110\",\"TimeoutHasExpired\": \"0\",\"MutualAidCall\": \"Y\",\"CurrentUnitStatus\": \"28\",\"DisplayFlag\": \"1\",\"TimeOfStatusChange\": \"09:03:06 08/13/2013\",\"WhenTimeoutWillExpire\": \"09:13:06 08/13/2013\",\"GeoXCoordinateOfUnit\": \"-29434\",\"GeoYCoordinateOfUnit\": \"-43658\",\"HighBitsOfXCoordinate\": \"0\",\"OperationCost\": \"0\",\"GpsHeadingOfUnit\": \"0\",\"GpsSpeedOfUnit\": \"0\",\"UnitKind\": \"AMB\",\"iSpyIsNew\": false},{\"UnitNumber\": \"CFD\",\"UnitTypeLawFireEMS\": \"f\",\"LongTermCallID\": \"1308-3707\",\"CallTypeAssignedTo\": \"f\",\"StatusDisplayCode\": \"PAGED\",\"UnitZoneCode\": \"CFD\",\"AgencyCode\": \"CFD\",\"LastRadioLogComments\": \"incid#=13CAS1647Pagedcall=31f\",\"LastAddressRespondedTo\": \"115 EAST PLEASANT ST;#110\",\"TimeoutHasExpired\": \"0\",\"CurrentUnitStatus\": \"28\",\"DisplayFlag\": \"1\",\"TimeOfStatusChange\": \"09:03:10 08/13/2013\",\"WhenTimeoutWillExpire\": \"09:13:10 08/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"HighBitsOfXCoordinate\": \"0\",\"OperationCost\": \"0\",\"GpsHeadingOfUnit\": \"0\",\"GpsSpeedOfUnit\": \"0\",\"UnitKind\": \"ENG\",\"iSpyIsNew\": false},{\"UnitNumber\": \"A21\",\"UnitTypeLawFireEMS\": \"f\",\"LongTermCallID\": \"1308-3707\",\"CallTypeAssignedTo\": \"f\",\"StatusDisplayCode\": \"ARRVD\",\"UnitZoneCode\": \"CFD\",\"AgencyCode\": \"CFD\",\"LastRadioLogComments\": \"incid#=13CAS1647Arrivedonscenecall=31f\",\"LastAddressRespondedTo\": \"115 EAST PLEASANT ST;#110\",\"TimeoutHasExpired\": \"1\",\"CurrentUnitStatus\": \"9\",\"DisplayFlag\": \"1\",\"TimeOfStatusChange\": \"09:07:1408/13/2013\",\"WhenTimeoutWillExpire\": \"09:37:1408/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"HighBitsOfXCoordinate\": \"0\",\"OperationCost\": \"0\",\"GpsHeadingOfUnit\": \"0\",\"GpsSpeedOfUnit\": \"0\",\"Station\": \"CFD1\",\"UnitKind\": \"ENG\",\"iSpyIsNew\": false}],\"JoinedRespondersHistory\": [{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:17:32 08/13/2013\",\"GeoXCoordinateOfUnit\": \"-29434\",\"GeoYCoordinateOfUnit\": \"-43658\",\"UnitNumber\": \"BALL\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"ACFD1\",\"AgencyCode\": \"BALL\",\"TenCode\": \"CMPLT\",\"Description\": \"incid#=13BAL2020Completedcallcall=31e\",\"SequenceNumber\": \"1\",\"CallType\": \"e\"},{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:17:27 08/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"UnitNumber\": \"A21\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"CFD1\",\"AgencyCode\": \"CFD\",\"TenCode\": \"CMPLT\",\"Description\": \"incid#=13CAS1647Completedcallcall=31f\",\"SequenceNumber\": \"1\",\"CallType\": \"f\"},{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:17:27 08/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"UnitNumber\": \"CFD\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"CFD1\",\"AgencyCode\": \"CFD\",\"TenCode\": \"CMPLT\",\"Description\": \"incid#=13CAS1647Completedcallcall=31f\",\"SequenceNumber\": \"1\",\"CallType\": \"f\"},{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:07:14 08/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"UnitNumber\": \"A21\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"CFD1\",\"AgencyCode\": \"CFD\",\"TenCode\": \"ARRVD\",\"Description\": \"incid#=13CAS1647Arrivedonscenecall=31f\",\"SequenceNumber\": \"1\",\"CallType\": \"f\"},{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:03:55 08/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"UnitNumber\": \"A21\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"CFD1\",\"AgencyCode\": \"CFD\",\"TenCode\": \"ENRT\",\"Description\": \"incid#=13CAS1647Enroutetoacallcall=31f\",\"SequenceNumber\": \"1\",\"CallType\": \"f\"},{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:03:10 08/13/2013\",\"GeoXCoordinateOfUnit\": \"0\",\"GeoYCoordinateOfUnit\": \"0\",\"UnitNumber\": \"CFD\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"CFD1\",\"AgencyCode\": \"CFD\",\"TenCode\": \"PAGED\",\"Description\": \"incid#=13CAS1647Pagedcall=31f\",\"SequenceNumber\": \"1\",\"CallType\": \"f\"},{\"UserWhoLoggedCall\": \"CONNER KRIS\",\"TimeDateOfEntry\": \"09:03:06 08/13/2013\",\"GeoXCoordinateOfUnit\": \"-29434\",\"GeoYCoordinateOfUnit\": \"-43658\",\"UnitNumber\": \"BALL\",\"LongTermCallID\": \"1308-3707\",\"UnitZoneCode\": \"ACFD1\",\"AgencyCode\": \"BALL\",\"TenCode\": \"PAGED\",\"Description\": \"incid#=13BAL2020Pagedcall=31e\",\"SequenceNumber\": \"1\",\"CallType\": \"e\"}],\"LongTermCallID\": \"1308-3707\",\"RelatedRecordNumber\": \"13CAS1647\",\"RespondToAddress\": \"115 EAST PLEASANT ST;#110\",\"ResponsibleUnitNumber\": \"CFD\",\"StatusCodeOfCall\": \"PAGED\",\"TimeDateReported\": \"09:01:58 08/13/2013\",\"TimeoutHasExpired\": \"1\",\"WhenCallWasOpened\": \"09:02:34 08/13/2013\",\"WhenStatusDeclared\": \"09:03:10 08/13/2013\",\"WhenTimeoutWillExpire\": \"09:04:34 08/13/2013\",\"XCoordinateGeobase\": \"-30694\",\"YCoordinateGeobase\": \"-37987\",\"_id\": \"520a58a047a018020000004c\",\"iSpyStatus\": \"Completed\",\"iSpyTimestamp\": 1376410658}]}";
        debugCalls = $.parseJSON(debugCalls);
        calls = debugCalls.results;
        parseCalls();
        hideLoader();
        refreshTimer();
    }
}

function setClicks() {
    $("#agencySelect").change(function() {
        var val = $("#agencySelect").val();
        logStatus("Agency Changed: " + val);
        if (uCheck(val)) {
            agency = val;
            window.localStorage.setItem("agency", val);
            setHeaderTexts();
        }else{
            agency = null;
            $("#regOptions").css("display", "none");
        }
    });
    
    $("#menuOptions").click(function() {
        if( $('#appOptions').is(':hidden') ) {
            $("#appOptions").slideDown(500);
            $("#menuOptions").html("Hide Options");
            $("#appOptionsContent").html(getAppOptionsHTML());
        }else{
            $("#appOptions").slideUp(500);
            $("#menuOptions").html("Options");
        }
    });
    
    $("#menuAppSelect").click(function() {
        openBrowser();
    });
    
    $("#shiftAction").click(function() {
        shiftAction();
    });
    
    setHeaderClicks();
}

function setHeaderClicks() {
    $("#activeCallsHeader").click(function() {
        if (uCheck(window.localStorage.getItem("usActive"))) {
            if (window.localStorage.getItem("usActive") === "true") {
                window.localStorage.setItem("usActive", "false");
            }else{
                window.localStorage.setItem("usActive", "true");
            }
        }else{
            // just for us active, it's default is shown, so unshow
            window.localStorage.setItem("usActive", "false");
        }
        setHeaderTexts();
    });
    
    $("#completeCallsHeader").click(function() {
        if (uCheck(window.localStorage.getItem("usComplete"))) {
            if (window.localStorage.getItem("usComplete") === "true") {
                window.localStorage.setItem("usComplete", "false");
            }else{
                window.localStorage.setItem("usComplete", "true");
            }
        }else{
            window.localStorage.setItem("usComplete", "true");
        }
        setHeaderTexts();
    });
    
    $("#activeCallsHeaderNotUs").click(function() {
        if (uCheck(window.localStorage.getItem("themActive"))) {
            if (window.localStorage.getItem("themActive") === "true") {
                window.localStorage.setItem("themActive", "false");
            }else{
                window.localStorage.setItem("themActive", "true");
            }
        }else{
            window.localStorage.setItem("themActive", "true");
        }
        setHeaderTexts();
    });
    
    $("#completeCallsHeaderNotUs").click(function() {
        if (uCheck(window.localStorage.getItem("themComplete"))) {
            if (window.localStorage.getItem("themComplete") === "true") {
                window.localStorage.setItem("themComplete", "false");
            }else{
                window.localStorage.setItem("themComplete", "true");
            }
        }else{
            window.localStorage.setItem("themComplete", "true");
        }
        setHeaderTexts();
    });
}

function setHeaderTexts() {
    var usActive = false;
    var usComplete = false;
    var themActive = false; 
    var themComplete = false;
    
    if (uCheck(window.localStorage.getItem("usActive"))) {
        if (window.localStorage.getItem("usActive") === "true") {
            usActive = true;
        }
    }else{
        // us active is not set, make it true
        usActive = true;
    }
    if (uCheck(window.localStorage.getItem("usComplete"))) {
        if (window.localStorage.getItem("usComplete") === "true") {
            usComplete = true;
        }
    }
    if (uCheck(window.localStorage.getItem("themActive"))) {
        if (window.localStorage.getItem("themActive") === "true") {
            themActive = true;
        }
    }
    if (uCheck(window.localStorage.getItem("themComplete"))) {
        if (window.localStorage.getItem("themComplete") === "true") {
            themComplete = true;
        }
    }

    if (usActive) {
        $("#activeCallsHeader").html(agency.toUpperCase() + " Active -");
        $("#activeCalls").show();
    }else{
        $("#activeCallsHeader").html(agency.toUpperCase() + " Active +");
        $("#activeCalls").hide();
    }
    
    if (usComplete) {
        $("#completeCallsHeader").html(agency.toUpperCase() + " Complete -");
        $("#completeCalls").show();
    }else{
        $("#completeCallsHeader").html(agency.toUpperCase() + " Complete +");
        $("#completeCalls").hide();
    }
    
    if (themActive) {
        $("#activeCallsHeaderNotUs").html("Other Active -");
        $("#activeCallsNotUs").show();
    }else{
        $("#activeCallsHeaderNotUs").html("Other Active +");
        $("#activeCallsNotUs").hide();
    }
    
    if (themComplete) {
        $("#completeCallsHeaderNotUs").html("Other Complete -");
        $("#completeCallsNotUs").show();
    }else{
        $("#completeCallsHeaderNotUs").html("Other Complete +");
        $("#completeCallsNotUs").hide();
    }
}

function initialize() {
    documentReady();
    if (!debug) {
        document.addEventListener('deviceready', onDeviceReady, false);
        document.getElementById('menuOptions').addEventListener('touchstart', onTouch_menuOptions, false);
        document.getElementById('menuOptions').addEventListener('touchend', onStopTouch_menuOptions, false);
    }
}

function onTouch_menuOptions() {
    $("#menuOptions").addClass("menuItemTouch");
}

function onStopTouch_menuOptions() {
    $("#menuOptions").removeClass("menuItemTouch");
}

function onDeviceReady() {
    logStatus("Device Ready");
    document.addEventListener("resume", onResume, false);
    register();
}

function onResume() {
    logStatus("Device Resume");
    if (agency) {
        getCalls();
        getShiftCalendar();
    }
}

function tokenHandler(msg) {
    logStatus("APN Push Ready");
    setRegID(msg);
}

function regHandler(result) {
    logStatus("GCM Push Ready");
}

function successHandler(result) {
    log("Success: " + result);
}

function errorHandler(error) {
    log("Error Handle: " + error);
}

function openBrowser() {
    browser = window.open('https://'+agency+'.ispyfire.com', '_blank', 'location=yes');
    if(isBrowserFirst) {
        isBrowserFirst = false;
        browser.addEventListener('loadstart', function() { log('start: ' + event.url); });
        browser.addEventListener('loadstop', function() { log('stop: ' + event.url); });
        browser.addEventListener('exit', function() { log(event.type); });
    }
}

function unregister(isReregister) {
    try {
    logStatus("Starting Unreg");
    pushNotification.unregister(
            function(data){
                logStatus("unreg ok");
                iSpyUnReg(isReregister);
            },
            function(data){
                logStatus("unreg bad");
            });
    } catch(e) {
        log("unreg error: " + e);
    }
}

function register() {
    logStatus("Do Reg");
    pushNotification = window.plugins.pushNotification;
    if (isAndroid()) {
        log(">>Android");
        pushNotification.register(this.regHandler, this.errorHandler,{"senderID":"648816449509","ecb":"onNotificationGCM"});
    } else {
        log(">>IOS");
        pushNotification.register(this.tokenHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
    }    
    log("Reg Complete");
}

function onNotificationAPN(event) {
    logStatus("Notification Received");
    log(event.alert);
    getCalls();
    if (event.sound) {
        var snd = new Media(event.sound);
        snd.play();
    }
}

function onNotificationGCM(e) {
    switch(e.event)
    {
        case 'registered':
            if (e.regid.length > 0) {
                setRegID(e.regid);
                $("#ol").append("<li>Android regID: "+e.regid+"</li>");
            }
        break;

        case 'message':
            logStatus("Notification Received");
            log(e.message);
            getCalls();
        break;

        case 'error':
          $("#ol").append("<li>Android GCM Error: "+e.msg+"</li>");
        break;

        default:
          $("#ol").append("<li>Android Unknown GCM Event</li>");
          break;
    }
}

function moveShiftDiv() {
    var menuLeft = $("#menu").offset().left;
    var menuWidth = $("#menu").width();
    var menuHeight = $("#menu").height();
    console.log(menuLeft + " " + menuWidth + " " + menuHeight);
    $("#shift").css("width", menuWidth + "px");
    $("#shift").css("top", (menuHeight + 3) + "px");
    $("#shift").css("left", menuLeft + "px");
    
    $("#shiftAction").css("top", (menuHeight + 30) + "px");
    $("#shiftAction").css("left", (menuLeft + (menuWidth - 50)) + "px");
}

function hideMessage() {
    $("#actionWrapper").css("display", "none");
}

function getAppOptionsHTML() {
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
    var htmlString = "";
    htmlString += "<div class='textNoWrap'>Agency: " + window.localStorage.getItem("agency") + "</div>";
    htmlString += "<div class='textNoWrap'>User: " + window.localStorage.getItem("user") + "</div>";
    htmlString += "<div class='textNoWrap'>DeviceID: " + window.localStorage.getItem("deviceid") + "</div>";
    htmlString += "<div class='textNoWrap'>" + keyname + ": " + window.localStorage.getItem(keyname) + "</div>";
    htmlString += "<div class='textNoWrap' style='margin-bottom: 85px;'>DBID: " + window.localStorage.getItem("dbid") + "</div>";
    return htmlString;
}

function clearAll() {
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
        
    var skipRegID = window.localStorage.getItem(keyname);
    window.localStorage.clear();
    $("#appOptions").slideUp(500);
    $("#menuOptions").html("Options");
    $("#actionWrapper").hide();
    hideRegButtons();
    documentReady();
    setRegID(skipRegID);
}

function clearList() {
    if ($('#ol li').length > 0)
        $("#ol").empty();
}

function setMenuAppRegStatus(color){
    if (color.toLowerCase() == "green")
        $("#menuAppRegStatus").html("<img src='img/green.png'>");
    else if (color.toLowerCase() == "red")
        $("#menuAppRegStatus").html("<img src='img/red.png'>");
    else
        $("#menuAppRegStatus").html("<img src='img/yellow.png'>");
}

function setRegID(id) {
    logStatus("Checking IDs");
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
        
    if (!uCheck(window.localStorage.getItem("deviceid")))
        setDeviceID();
    
    var needSet = false;
    if (uCheck(window.localStorage.getItem(keyname))) {
        var key = window.localStorage.getItem(keyname);
        if (key != id) {
            needSet = true;
        }else{
            log("matching new id and old");
        }
    }else{
        needSet = true;
    }
    if (needSet) {
        window.localStorage.setItem(keyname, id);
        iSpyReg();
    }
    
    log(keyname + ": " + window.localStorage.getItem(keyname));
    log("device: " + window.localStorage.getItem("deviceid"));
}

function setDeviceID() {
    window.localStorage.setItem("deviceid", device.uuid);
}

function setUser(user) {
    window.localStorage.setItem("user", user);
    getPersonIDForUser(user);
}

function setDBID(id) {
    window.localStorage.setItem("dbid", id);
}

function logIntTimer() {
    logCount++;
    if (logCount > logCountUpTo) {
        isLogStatusShowing = false;
        $("#deviceStatus").fadeTo(500, 0.1);
        clearInterval(logStatusInterval);
        logStatusInterval = null;
    }
}

function logStatus(logMessage) {
    if (!uCheck(logStatusInterval))
        logStatusInterval = setInterval(logIntTimer, 1000);
        
    if (!isLogStatusShowing) {
        isLogStatusShowing = true;
        $("#deviceStatus").fadeTo(500, 1);
    }
    logCount = 0;
    $("#deviceStatus").html(logMessage);
    log(logMessage);
}

function log(logMessage) {
    console.log(logMessage);
    $("#ol").append("<li>" + logMessage + "</li>");
}

function isAndroid() {
    log("device type check");
    if (!uCheck(deviceType)) {
        log("step");
        if (!debug) {
            if (uCheck(device) && uCheck(device.platform)) {
                log("double step");
                deviceType = device.platform;
                window.localStorage.setItem("devicetype", deviceType);
                log("device platform saved: " + deviceType);
                if (deviceType == 'android' || deviceType == 'Android')
                    return true;
                return false;
            }else{
                logStatus("ERROR: Needs re-install");
            }
        }else{
            return false;
        }
    }else{
        if (deviceType == 'android' || deviceType == 'Android')
            return true;
        return false;
    }
}

function isIOS() {
    if (!isAndroid())
        return true;
    return false;
}

function uCheck(a) {
    if (a === undefined)
        return false;
    if (typeof a == "undefined")
        return false;
    if (a === null)
        return false;
    if (a.length === 0)
        return false;
    return true;
}

function getPersonIDForUser(user) {
    logStatus("Get Person From User");
    var jsonURL = "http://" + agency + ".ispyfire.com";
    jsonURL += '/firedb/@@DB@@/people/?criteria={"email": "'+user+'"}';
    log("person url: " + jsonURL);
    $.getJSON(jsonURL)
        .done(function(data) {
            //log("person back data: " + JSON.stringify(data));
            if (uCheck(data.results[0]._id)) {
                log("Person back, store id");
                window.localStorage.setItem("userID", data.results[0]._id);
                getShiftCalendar();
            }else{
                log("person error 1: " + JSON.stringify(data));
            }
        })
        .fail(function(data) {
            log("person error: " + JSON.stringify(data));
        });
}

function getCustomers() {
    logStatus("Get Customer List");
    var jsonURL = 'http://test.ispyfire.com/fireapp/getCustomerList';
    $.getJSON(jsonURL)
        .done(function(data) {
            customers = data.result.results;
            log("Customers: " + customers.length);
            showLogin();
        })
        .fail(function(data) { log( "customer error: " + JSON.stringify(data) ); });
}

function getCadSettings() {
    log("CAD settings for " + agency);
    if (uCheck(agency)) {
        var jsonURL = "http://" + agency + ".ispyfire.com";
        jsonURL += '/firedb/@@DB@@/cadsettings/?criteria={"isActive": true}';
        $.getJSON(jsonURL)
            .done(function(data) {
                if (uCheck(data.results[0])) {
                    cadsettings = data.results[0];
                    window.localStorage.setItem("cadsettings", cadsettings);
                    log("CAD settings set");
                }
            })
            .fail(function(data) { log( "cad settings error: " + JSON.stringify(data) ); });
    }
}

function showLogin() {
    logStatus("Show Login");
    if (uCheck(customers)) {
            $('#agencySelect').empty();
            $('#agencySelect').append($("<option></option>").attr("value", "").text("Select your agency")); 
        for(var i = 0; i<customers.length; i++) {
            $('#agencySelect').append($("<option></option>").attr("value", customers[i].subdomain).text(customers[i].name)); 
        }
        $("#login").css("display", "block");
        $("#agencySelect").css("display", "block");
        $("#loading").css("display", "none");
    }else{
        log("No Customer List!?");
    }
}

function showRegButtons() {
    $("#loading").css("display", "none");
    $("#regOptions").css("display", "block");
    if (isiSpyRegistered) {
        $("#unregButton").css("display", "block");
        $("#regButton").css("display", "none");
        setMenuAppRegStatus("green");
    }else{
        $("#unregButton").css("display", "none");
        $("#regButton").css("display", "block");
        setMenuAppRegStatus("red");
    }
}

function hideRegButtons() {
    setMenuAppRegStatus("yellow");
    $("#loading").css("display", "block");
    $("#regOptions").css("display", "none");
    $("#regButton").css("display", "none");
    $("#unregButton").css("display", "none");
}

function switchLongLog() {
    log("long log switch");
    
    $("#longLogWrapper").hide();
    $("#switchLongLog").hide();
    
    // if ($('#longLogWrapper').is(":visible")) {
    //     $("#switchLongLog").val("View long log");
    //     $("#longLogWrapper").hide();
    // }else{
    //     $("#switchLongLog").val("Hide long log");
    //     $("#longLogWrapper").show();
    // }
}

function submitLogin() {
    var user = $("#username").val();
    var pass = $("#password").val();
    if (uCheck(user) && uCheck(pass) && uCheck(agency)) {
        hideRegButtons();
        $("#loginButton").disabled = true;
        var jsonURL = "https://" + agency + ".ispyfire.com/applogin";
        var jsonString = "{\"username\": \"" + user + "\", \"password\": \"" + pass + "\"}";
        logStatus("iSpy Login");
        $.ajax({
            type: "POST",
            url: jsonURL,
            contentType: "application/json",
            data: jsonString
        })
        .fail(function() {
            logStatus("Fail on login");
            $("#loading").css("display", "none");
        })
        .done(function(data) {
            logStatus("iSpy login Complete");
            var datastring = JSON.stringify(data);
            log("datastring: " + datastring);
            $("#loginButton").disabled = false;
            if(uCheck(data.authenticated)) {
                if(data.authenticated) {
                    $("#regOptions").css("display", "block");
                    $("#login").css("display", "none");
                    setUser(user);
                    getCadSettings();
                    iSpyReg();
                }else{
                    logStatus("iSpy login incomplete");
                    $("#loading").css("display", "none");
                }
            }else{
                log("missing data return on login");
            }
        });
    }else{
        logStatus("Missing Something!");
    }
}

function iSpyReg() {
    log("early reg");
    if (uCheck(agency)) {
        var lastURL = "iosReg";
        var keyname = "token";
        if (isAndroid()) {
            lastURL = "gcmReg";
            keyname = "regid";
        }
        logStatus("PreReg");
        if (uCheck(window.localStorage.getItem("deviceid")) && uCheck(window.localStorage.getItem(keyname))) {
            hideRegButtons();
            var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL;
            var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\", \"regID\": \"" + window.localStorage.getItem(keyname) + "\"}";
            log("json: " + jsonString);
            log("Check URL: " + jsonURL);
            logStatus("iSpy Registration");
            $.ajax({
                type: "PUT",
                url: jsonURL,
                contentType: "application/json",
                data: jsonString
            })
            .fail(function() {
                logStatus("Fail on reg");
                isiSpyRegistered = false;
                showRegButtons();
            })
            .done(function(data) {
                logStatus("iSpy Reg Complete");
                var datastring = JSON.stringify(data);
                log("datastring: " + datastring);
                isiSpyRegistered = true;
                showRegButtons();
                if(uCheck(data.regids.results[0]._id)) {
                    setDBID(data.regids.results[0]._id);
                }
                getCalls();
            });
        }else{
            logStatus("NO REG: Missing " + keyname);
        }
    }else{
        log("Can't test reg, no agency");
    }
}

function iSpyUnReg(isReregister) {
    if (uCheck(agency)) {
        var dbid = window.localStorage.getItem("dbid");
        if(!uCheck(dbid)) {
            log("No DBID, can't unreg");
            return false;
        }
        hideRegButtons();
        var lastURL = "iosUnReg";
        var keyname = "token";
        if (isAndroid()) {
            lastURL = "gcmUnReg";
            keyname = "regid";
        }
        var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL;
        var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\", \"regID\": \"" + window.localStorage.getItem(keyname) + "\", \"id\": \"" + dbid + "\"}";
        log("json: " + jsonString);
        log("Check URL: " + jsonURL);
        logStatus("iSpy UnRegister");
        $.ajax({
            type: "PUT",
            url: jsonURL,
            contentType: "application/json",
            data: jsonString
        })
        .fail(function() {
            log("Fail on unreg");
            isiSpyRegistered = false;
            showRegButtons();
        })
        .done(function(data) {
            logStatus("iSpy UnReg Complete");
            isiSpyRegistered = false;
            showRegButtons();
            if (isReregister)
                register();
        });
    }else{
        log("Can't test reg, no agency");
    }    
}
