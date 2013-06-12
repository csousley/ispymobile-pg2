var longLog = true;
var logCount = 0;
var logCountUpTo = 4;
var isLogStatusShowing = false;
var logStatusInterval = null;
var pushNotification = null;
var customers = null;
var agency = null;
var isiSpyRegistered = false;

$(document).ready(function() {
    $.ajaxSetup({cache:false});
        
    $("#agencySelect").change(function() {
        var val = $("#agencySelect").val();
        logStatus("Agency Changed: " + val);
        if (uCheck(val)) {
            agency = val;
            window.localStorage.setItem("agency", val);
            $("#regOptions").css("display", "block");
            $("#agencySelect").css("display", "none");
            $("#focusHref").focus();
            iSpyReg();
        }else{
            agency = null;
            $("#regOptions").css("display", "none");
        }
    });
    
    agency = window.localStorage.getItem("agency");
    
    if (!uCheck(agency))
        getCustomers();
    else
        iSpyReg();
});

function initialize() {
    logStatus("Initialize");    
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
    logStatus("Device Ready");
    document.addEventListener("resume", onResume, false);
    register();
}

function onResume() {
    logStatus("Device Resume");
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
    log("GOT IT");
    log("Received a notification! " + event.alert);
    // console.log("event sound " + event.sound);
    // console.log("event badge " + event.badge);
    // console.log("event " + event);
    if (event.alert) {
        navigator.notification.alert(event.alert);
    }
    if (event.badge) {
        log("Set badge on  " + pushNotification);
        pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
    }
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
            log("GOT IT");
            // this is the actual push notification. its format depends on the data model
            // of the intermediary push server which must also be reflected in GCMIntentService.java
            //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
            $("#ol").append("<li>Android Message Received: "+e.message+"</li>");
            //alert(e.message);
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
    log("storing device id");
    window.localStorage.setItem("deviceid", device.uuid);
}


function logIntTimer() {
    logCount++;
    if (logCount > logCountUpTo) {
        isLogStatusShowing = false;
        $("#deviceStatus").fadeOut(500);
        clearInterval(logStatusInterval);
        logStatusInterval = null;
    }
}

function logStatus(logMessage) {
    if (!uCheck(logStatusInterval))
        logStatusInterval = setInterval(logIntTimer, 1000);
        
    if (!isLogStatusShowing) {
        isLogStatusShowing = true;
        $("#deviceStatus").fadeIn(500);
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
    logStatus("Get Customer List")
    var jsonURL = 'http://test.ispyfire.com/fireapp/getCustomerList';
    $.getJSON(jsonURL, function(data) {
        customers = data.result.results;
        log("Customers: " + customers.length);
        showLogin();
    });  
}

function showLogin() {
    logStatus("Show Login");
    if (uCheck(customers)) {
        for(var i = 0; i<customers.length; i++) {
             $('#agencySelect')
                .append($("<option></option>")
                .attr("value", customers[i].subdomain)
                .text(customers[i].name)); 
        }
        $("#login").css("display", "block");
        //$("#deviceready").css("display", "none");
    }else{
        log("No Customer List!?");
    }
}

function showRegButtons() {
    logStatus("Show Buttons");
    //$("#deviceready").css("display", "none");
    $("#regOptions").css("display", "block");
    if (isiSpyRegistered) {
        $("#unregButton").css("display", "block");
        $("#regButton").css("display", "none");
    }else{
        $("#unregButton").css("display", "none");
        $("#regButton").css("display", "block");
    }
}

function hideRegButtons() {
    logStatus("Hide Buttons");
    $("#regOptions").css("display", "none");
    $("#regButton").css("display", "none");
    $("#unregButton").css("display", "none");
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
        log(keyname + ": " + window.localStorage.getItem(keyname));
        log("device: " + window.localStorage.getItem("deviceid"));
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
                log("DATA: " + data);
                isiSpyRegistered = true;
                showRegButtons();
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
        hideRegButtons();
        var lastURL = "iosUnReg";
        var keyname = "token";
        if (isAndroid()) {
            lastURL = "gcmUnReg";
            keyname = "regid";
        }
        var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL;
        var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\", \"regID\": \"" + window.localStorage.getItem(keyname) + "\"}";
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
            log("DATA: " + data);
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

// function testReg() {
//     if (uCheck(agency)) {
//         hideRegButtons();
//         var lastURL = "iostestreg";
//         var keyname = "token";
//         if (isAndroid()) {
//             lastURL = "gcmtestreg";
//             var keyname = "regid";
//         }
//         var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL;
//         var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\", \"regID\": \"" + window.localStorage.getItem(keyname) + "\"}";
//         log("json: " + jsonString);
//         log("Check URL: " + jsonURL);
//         logStatus("iSpy Test Registration");
//         $.ajax({
//             type: "PUT",
//             url: jsonURL,
//             contentType: "application/json",
//             data: jsonString
//         })
//         .fail(function() {
//             log("Fail on testreg");
//         })
//         .done(function(data) {
//             log("DATA: " + data);
//             logStatus("iSpy Test Reg Complete");
//             if (uCheck(data)) {
                
//                 var datastring = JSON.stringify(data);
//                 log("datastring: " + datastring);
                
//                 var result = data.result;
//                 log("RESULT: " + result);
//                 if (uCheck(result)) {
//                     if (result == "Registered") {
//                         log ("already registered");
//                         isiSpyRegistered = true;
//                         showRegButtons();
//                         return false;
//                     }
//                 }
//                 log("needs registered");
//                 isiSpyRegistered = false;
//                 showRegButtons();
//             }else{
//                 log("no data returned");
//                 isiSpyRegistered = false;
//                 showRegButtons();
//             }
//         });
//     }else{
//         log("Can't test reg, no agency");
//     }
// }