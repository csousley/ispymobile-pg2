var longLog = true;
var logCount = 0;
var logCountUpTo = 4;
var isLogStatusShowing = false;
var logStatusInterval = null;
var pushNotification = null;
var customers = null;
var cadsettings = null;
var agency = null;
var isiSpyRegistered = false;

$(document).ready(function() {
    $.ajaxSetup({cache:false});
});

function documentReady() {
    agency = window.localStorage.getItem("agency");
    cadsettings = window.localStorage.getItem("agency");
    
    log("AGENCY: " + agency);
    log("CADSETTINGS: " + cadsettings);
    
    getCadSettings(); // refresh, even if we have it
    
    if (!uCheck(agency))
        getCustomers();
    else
        iSpyReg();
}

function setClicks() {
    $("#agencySelect").change(function() {
        var val = $("#agencySelect").val();
        logStatus("Agency Changed: " + val);
        if (uCheck(val)) {
            agency = val;
            window.localStorage.setItem("agency", val);
            // $("#regOptions").css("display", "block");
            // $("#agencySelect").css("display", "none"); // maybe $("#login").css("display", "none");
            // $("#focusHref").focus();
            // iSpyReg();
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
        alert("app click");
    });
}

function initialize() {
    documentReady();
    logStatus("Initialize");    
    document.addEventListener('deviceready', onDeviceReady, false);
    document.getElementById('menuOptions').addEventListener('touchstart', onTouch_menuOptions, false);
    document.getElementById('menuOptions').addEventListener('touchend', onStopTouch_menuOptions, false);
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
    getCalls();
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
    //alert(error);
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

// iOS
function onNotificationAPN(event) {
    logStatus("Notification Received");
    getCalls();
    // log("Received a notification! " + event.alert);
    // var callIDs = null;
    // if (uCheck(event.callIDs)) {
    //     callIDs = event.callIDs;
    // }
    // if (event.alert) {
    //     //navigator.notification.alert(event.alert); // shows a popup
    //     //showMessage(event.alert, callIDs);
    // }
    // if (event.badge) {
    //     log("Set badge on  " + pushNotification);
    //     pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
    // }
    if (event.sound) {
        var snd = new Media(event.sound);
        snd.play();
    }
}

// Android
function onNotificationGCM(e) {
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                //alert('registration id = '+e.regid);
                setRegID(e.regid);
                $("#ol").append("<li>Android regID: "+e.regid+"</li>");
            }
        break;

        case 'message':
            //log("GOT IT");
            // this is the actual push notification. its format depends on the data model
            // of the intermediary push server which must also be reflected in GCMIntentService.java
            //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
            // $("#ol").append("<li>Android Message Received: "+e.message+"</li>");
            // if (uCheck(e.callIDs)) {
            //     log("PASSED CALL IDS: " + e.callIDs);
            // }
            //alert(e.message);
            // var callIDs = null;
            // if (uCheck(e.callIDs)) {
            //     callIDs = e.callIDs;
            // }
            // if (e.message) {
            //     showMessage(e.message, callIDs);
            // }
            logStatus("Notification Received");
            getCalls();
        break;

        case 'error':
          $("#ol").append("<li>Android GCM Error: "+e.msg+"</li>");
          //alert('GCM error = '+e.msg);
        break;

        default:
          $("#ol").append("<li>Android Unknown GCM Event</li>");
          //alert('An unknown GCM event has occurred');
          break;
    }
}

// function showMessage(message, callIDs) {
//     var htmlString = message;
//     if (uCheck(callIDs)) {
//         htmlString += "<br>" + callIDs;
//     }
//     $("#action").html(htmlString);
//     $("#actionWrapper").css("display", "block");
// }

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
    hideRegButtons();
    documentReady();
    setRegID(skipRegID);
}

function clearList() {
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
    logStatus("Storing IDs");
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
        
    if (!uCheck(window.localStorage.getItem("deviceid")))
        setDeviceID();
    
    var needSet = false;
    if (uCheck(window.localStorage.getItem(keyname))) {
        var key = window.localStorage.getItem(keyname);
        if (key != id) {
            // regid or token don't match, reg with new one now
            needSet = true;
        }else{
            log("matching new id and old");
        }
        // we're already registered with ispy using this regid or token, no need to do it again
    }else{
        // never set, any reg attempt prior would have aborted, reg now
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
    //log("storing device id");
    window.localStorage.setItem("deviceid", device.uuid);
}

function setUser(user) {
    //log("storing user id");
    window.localStorage.setItem("user", user);
}

function setDBID(id) {
    //log("dbid: "+ id);
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
    if (longLog)
        $("#ol").append("<li>" + logMessage + "</li>");
}

function isAndroid() {
    if (device.platform == 'android' || device.platform == 'Android')
        return true;
    return false;
}

function isIOS() {
    if (!isAndroid())
        return true;
    return false;
}

function uCheck(a) {
    if (typeof a == "undefined")
        return false;
    if (a === null)
        return false;
    if (a.length === 0)
        return false;
    return true;
}

function getCustomers() {
    logStatus("Get Customer List");
    var jsonURL = 'http://test.ispyfire.com/fireapp/getCustomerList';
    $.getJSON(jsonURL, function() {
        log("Customers back");
    })
    .done(function(data) {
        customers = data.result.results;
        log("Customers: " + customers.length);
        showLogin();
    })
    .fail(function(data) { log( "customer error: " + JSON.stringify(data) ); });
}

function getCadSettings() {
    var jsonURL = window.location.protocol + '//' + window.location.host;
    jsonURL += '/firedb/@@DB@@/cadsettings/?criteria={"isActive": true}';
    $.getJSON(jsonURL, function(data) {
        log("CAD settings back");
    })
    .done(function(data) {
        if (uCheck(data.results[0])) {
            cadsettings = data.results[0];
            window.localStorage.setItem("agency", cadsettings);
            log("CAD settings set");
        }
    })
    .fail(function(data) { log( "cad settings error: " + JSON.stringify(data) ); });
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
    if (longLog) {
        longLog = false;
        $("#switchLongLog").val("Turn on long log");
        clearList();
    }else{
        longLog = true;
        $("#switchLongLog").val("Turn off long log");
    }
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
            //log("DATA: " + data);
            logStatus("iSpy UnReg Complete");
            //unregister(); // to unreg for apn and gcm service
            isiSpyRegistered = false;
            showRegButtons();
            if (isReregister)
                register();
        });
    }else{
        log("Can't test reg, no agency");
    }    
}
