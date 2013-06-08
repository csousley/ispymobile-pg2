var pushNotification = null;
var customers = null;

function initialize() {
    bindEvents();
}

function bindEvents() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
    receivedEvent('deviceready');
    getCustomers();
}

function tokenHandler(msg) {
    log("APN push ready");
    setRegID(msg);
}

function regHandler(result) {
    log("GCM push ready");
    setRegID(result);
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
    log("Device Ready Event");
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');   
    
    doReg();
}

function doReg() {
    pushNotification = window.plugins.pushNotification;
    log("Do Reg");
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
    log("Received a notification! " + event.alert);
    console.log("event sound " + event.sound);
    console.log("event badge " + event.badge);
    console.log("event " + event);
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
                alert('registration id = '+e.regid);
            }
        break;

        case 'message':
          // this is the actual push notification. its format depends on the data model
          // of the intermediary push server which must also be reflected in GCMIntentService.java
          //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
          $("#ol").append("<li>Message Received Android: "+JSON.stringify(e.payload)+"</li>");
          $("#ol").append("<li>Message Received Dashboard Key: "+JSON.stringify(e.payload.dashboard.message)+"</li>");
          alert(JSON.parse(e.payload.dashboard).message);
        break;

        case 'error':
          alert('GCM error = '+e.msg);
        break;

        default:
          alert('An unknown GCM event has occurred');
          break;
    }
}

function unReg() {
    log("unreg method call");
    unregister();
}

function iSpySetup() {
    //$("#deviceID").html("device: " + device.uuid);
}

function setRegID(id) {
    log("storing reg id");
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
    window.localStorage.setItem(keyname, id);
    
    if (!uCheck(window.localStorage.getItem("deviceid")))
        setDeviceID();
    
    log(keyname + ": " + window.localStorage.getItem(keyname));
    log("device: " + window.localStorage.getItem("deviceid"));
}

function setDeviceID() {
    log("storing device id");
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
    var jsonURL = 'http://test.ispyfire.com';
    jsonURL += '/fireapp/getCustomerList';
    $.getJSON(jsonURL, function(data) {
        customers = data.result.results;
        log("Customers: " + customers.length);
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
    }else{
        log("No Customer List!?");
    }
}

function testReg() {
    var jsonURL = window.location.protocol + '//' + window.location.host;
    jsonURL += '/firedb/@@DB@@/calls/';
    $.ajax({
        type: "PUT",
        url: jsonURL,
        contentType: "application/json",
        data: json
    })
    .fail(function() {
        alert("Error Promoting Call...");
    })
    .done(function(data) {
        if (data.results[0]._id) {
            isPromote = true;
            getCallByID(data.results[0]._id);
            emitPromotedCallNotice();
        }
    });
}