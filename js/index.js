var pushNotification = null;
var token = null;

function initialize() {
    bindEvents();
}

function bindEvents() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
    receivedEvent('deviceready');
    iSpySetup();
}
function tokenHandler(msg) {
    log("Token Handler: " + msg);
    token = msg;
    setDeviceID(msg);
}
function errorHandler(error) {
    log("Error Handle: " + error);
    alert(error);
}

function successHandler(result) {
    log("Success: " + result);
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
// Update DOM on a Received Event
function receivedEvent(id) {
    log("Step 1");
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
        
    setTimeout(function() {
        $("#doRegDiv").css("display", "block");
    }, 4000);
}
function doReg() {
    pushNotification = window.plugins.pushNotification;
    log("Do Reg");
    if (isAndroid()) {
        log(">>Android");
        pushNotification.register(this.successHandler, this.errorHandler,{"senderID":"648816449509","ecb":"onNotificationGCM"});
    } else {
        log(">>IOS");
        pushNotification.register(this.tokenHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
    }    
    log("Step 2");
    
    $("#deviceID").html("Token Test: " + token);
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
    $("#deviceID").html("device: unregistered");
}

function iSpySetup() {
    //$("#deviceID").html("device: " + device.uuid);
}

function setDeviceID(id) {
    log("storing device id");
    var keyname = "token";
    if (isAndroid())
        keyname = "regid";
    window.localStorage.setItem(keyname, id);
    
    // window.localStorage.setItem("key", "value");
    // var keyname = window.localStorage.key(i);
    // // keyname is now equal to "key"
    // var value = window.localStorage.getItem("key");
    // // value is now equal to "value"
    // window.localStorage.removeItem("key");
    // window.localStorage.setItem("key2", "value2");
    // window.localStorage.clear();
    // // localStorage is now empty
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


function getCustomers() {
    var jsonURL = 'http://test.ispyfire.com';
    jsonURL += '/fireapp/getCustomerList';
    $.getJSON(jsonURL, function(data) {
        customers = data.result;
        //showLogin();
    });  
}
