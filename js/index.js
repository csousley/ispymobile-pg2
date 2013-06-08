var pushNotification = null;
var token = null;

// Application Constructor
function initialize() {
    bindEvents();
}
// Bind any events that are required on startup. Common events are:
// 'load', 'deviceready', 'offline', and 'online'.
function bindEvents() {
    document.addEventListener('deviceready', onDeviceReady, false);
}
// deviceready Event Handler
//
// The scope of 'this' is the event. In order to call the 'receivedEvent'
// function, we must explicity call 'app.receivedEvent(...);'
function onDeviceReady() {
    receivedEvent('deviceready');
    iSpySetup();
}
function tokenHandler(msg) {
    console.log("Token Handler " + msg);
    $("#ol").append("<li>Token Handler: "+msg+"</li>");
    token = msg;
    $("#deviceID").html("Token Test: " + msg);
    setDeviceID(msg);
}
function errorHandler(error) {
    console.log("Error Handler  " + error);
    $("#ol").append("<li>Error Handle: "+error+"</li>");
    alert(error);
}
// result contains any message sent from the plugin call
function successHandler(result) {
    //alert('Success! Result = '+result);
    console.log("Success: "+result);
    $("#ol").append("<li>Success: "+result+"</li>");
}
function unregister() {
    try {
    console.log("unreg starting");
    $("#ol").append("<li>Unreg</li>");
    //var pushNotification = window.plugins.pushNotification;
    pushNotification.unregister(
            function(data){
                console.log("unreg ok: " + data);
                $("#ol").append("<li>unreg ok</li>");
            },
            function(data){
                console.log("unreg bad: " + data);
                $("#ol").append("<li>unreg bad</li>");
            });
    } catch(e) {
        console.log("unreg error: " + e);
    }
    console.log("unreg finished?");
}
// Update DOM on a Received Event
function receivedEvent(id) {
    console.log(">>Step 1");
    $("#ol").append("<li>step 1</li>");
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
    console.log(">>Push set");
    $("#ol").append("<li>push set</li>");
    if (isAndroid()) {
        console.log(">>Android");
        $("#ol").append("<li>Android</li>");
        pushNotification.register(this.successHandler, this.errorHandler,{"senderID":"648816449509","ecb":"onNotificationGCM"});
    } else {
        console.log(">>IOS");
        $("#ol").append("<li>IOS</li>");
        pushNotification.register(this.tokenHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
    }    
    console.log(">>Step 2");
    $("#ol").append("<li>step 2</li>");
    //console.log('Received Event: ' + id);
    
    $("#deviceID").html("Token Test: " + token);
}

// iOS
function onNotificationAPN(event) {
    //var pushNotification = window.plugins.pushNotification;
    console.log("Received a notification! " + event.alert);
    console.log("event sound " + event.sound);
    console.log("event badge " + event.badge);
    console.log("event " + event);
    if (event.alert) {
        navigator.notification.alert(event.alert);
    }
    if (event.badge) {
        console.log("Set badge on  " + pushNotification);
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
          $("#ol").append("<li>Message Received Dashboard Key: "+e.payload.dashboard+"</li>");
          alert("whooaa");
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
    console.log("unreg method call");
    unregister();
    $("#deviceID").html("device: unregistered");
}

function iSpySetup() {
    //$("#deviceID").html("device: " + device.uuid);
}

function setDeviceID(id) {
    console.log("storing device id");
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
