var pushNotification = null;
var customers = null;
var agency = null;
var isiSpyRegistered = false;

$(document).ready(function() {
    $.ajaxSetup({cache:false});
    
    agency = window.localStorage.getItem("agency");
    
    if (!uCheck(agency))
        getCustomers();
    else
        testReg();
        
    $("#agencySelect").change(function() {
        var val = $("#agencySelect").val();
        if (uCheck(val)) {
            agency = val;
            window.localStorage.setItem("agency", val);
            $("#regOptions").css("display", "block");
            testReg();
        }else{
            agency = null;
            $("#regOptions").css("display", "none");
        }
    });
});

function initialize() {
    bindEvents();
}

function bindEvents() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
    receivedEvent('deviceready');
}

function tokenHandler(msg) {
    //log("APN push ready");
    setRegID(msg);
}

function regHandler(result) {
    //log("GCM push ready");
    //setRegID(result);
}

function successHandler(result) {
    log("Success: " + result);
}

function errorHandler(error) {
    log("Error Handle: " + error);
    alert(error);
}

function unregister() {
    try {
    log("Starting unreg");
    pushNotification.unregister(
            function(data){
                log("unreg ok");
            },
            function(data){
                log("unreg bad");
            });
    } catch(e) {
        log("unreg error: " + e);
    }
    log("unreg finished?");
}

function receivedEvent(id) {
    //log("Device Ready Event");
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');   
    
    doReg();
}

function doReg() {
    pushNotification = window.plugins.pushNotification;
    //log("Do Reg");
    if (isAndroid()) {
        //log(">>Android");
        pushNotification.register(this.regHandler, this.errorHandler,{"senderID":"648816449509","ecb":"onNotificationGCM"});
    } else {
        //log(">>IOS");
        pushNotification.register(this.tokenHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
    }    
    //log("Reg Complete");
}

// iOS
function onNotificationAPN(event) {
    log("Received a notification! " + event.alert);
    console.log("event sound " + event.sound);
    console.log("event badge " + event.badge);
    console.log("event " + event);
    if (event.alert) {
        navigator.notification.alert(event.alert);
    }
    if (event.badge) {
        //log("Set badge on  " + pushNotification);
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

// function unReg() {
//     //log("unreg method call");
//     unregister();
// }

function iSpySetup() {
    //$("#deviceID").html("device: " + device.uuid);
}

function setRegID(id) {
    //log("storing reg id");
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
    window.localStorage.setItem(keyname, id);
    
    if (!uCheck(window.localStorage.getItem("deviceid")))
        setDeviceID();
    
    //log(keyname + ": " + window.localStorage.getItem(keyname));
    //log("device: " + window.localStorage.getItem("deviceid"));
}

function setDeviceID() {
    //log("storing device id");
    window.localStorage.setItem("deviceid", device.uuid);
}

function log(logMessage) {
    $("#ol").append("<li>" + logMessage + "</li>");
    console.log(logMessage);
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
    var jsonURL = 'http://test.ispyfire.com/fireapp/getCustomerList';
    $.getJSON(jsonURL, function(data) {
        customers = data.result.results;
        //log("Customers: " + customers.length);
        showLogin();
    });  
}

function showLogin() {
    if (uCheck(customers)) {
        for(var i = 0; i<customers.length; i++) {
             $('#agencySelect')
                .append($("<option></option>")
                .attr("value", customers[i].subdomain)
                .text(customers[i].name)); 
        }
        $("#login").css("display", "block");
        $("#deviceready").css("display", "none");
    }else{
        //log("No Customer List!?");
    }
}

function showRegButtons() {
    log("show reg buttons");
    $("#deviceready").css("display", "none");
    $("#regOptions").css("display", "block");
    if (isiSpyRegistered) {
        $("#unregButton").css("display", "block");
        $("#regButton").css("display", "none");
    }else{
        $("#unregButton").css("display", "none");
        $("#regButton").css("display", "block");
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
        var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL;
        var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\", \"regID\": \"" + window.localStorage.getItem(keyname) + "\"}";
        log("json: " + jsonString);
        log("Check URL: " + jsonURL);
        $.ajax({
            type: "PUT",
            url: jsonURL,
            contentType: "application/json",
            data: jsonString
        })
        .fail(function() {
            log("Fail on testreg");
            isiSpyRegistered = false;
            showRegButtons();
        })
        .done(function(data) {
            //log("DATA: " + data);
            isiSpyRegistered = true;
            showRegButtons();
        });
    }else{
        log("Can't test reg, no agency");
    }
}

function iSpyUnReg() {
    if (uCheck(agency)) {
        var lastURL = "iosUnReg";
        var keyname = "token";
        if (isAndroid()) {
            lastURL = "gcmUnReg";
            keyname = "regid";
        }
        var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL;
        var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\"}";
        log("json: " + jsonString);
        log("Check URL: " + jsonURL);
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
            isiSpyRegistered = false;
            showRegButtons();
        });
    }else{
        log("Can't test reg, no agency");
    }    
}

function testReg() {
    if (uCheck(agency)) {
        var lastURL = "iostestreg";
        if (isAndroid())
            lastURL = "gcmtestreg";
        var jsonURL = "http://" + agency + ".ispyfire.com/fireapp/" + lastURL + "?deviceID=" + window.localStorage.getItem("deviceid");
        var jsonString = "{\"deviceID\": \"" + window.localStorage.getItem("deviceid") + "\"}";
        log("json: " + jsonString);
        log("Check URL: " + jsonURL);
        $.ajax({
            type: "PUT",
            url: jsonURL,
            contentType: "application/json",
            data: jsonString
        })
        .fail(function() {
            log("Fail on testreg");
        })
        .done(function(data) {
            log("DATA: " + data);
            if (uCheck(data)) {
                
                var datastring = JSON.stringify(data);
                log("datastring: " + datastring);
                
                var result = data.result;
                log("RESULT: " + result);
                if (uCheck(result)) {
                    if (result == "Registered") {
                        log ("already registered");
                        isiSpyRegistered = true;
                        showRegButtons();
                        return false;
                    }
                }
                log("needs registered");
                isiSpyRegistered = false;
                showRegButtons();
            }else{
                log("no data returned");
                isiSpyRegistered = false;
                showRegButtons();
            }
        });
    }else{
        //log("Can't test reg, no agency");
    }
}