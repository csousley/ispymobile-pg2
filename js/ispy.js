var calls = null;
var refreshWait = 15000; // 15 seconds
var directionsDisplay = null;
var directionsService = new google.maps.DirectionsService();
var mapStartingLocation = null;
var mapEndingLocation = null;
var map = null;
var currentCall = null;
var shiftCalendar = null;
var lastShiftCheck = null;
var shiftExpanded = false;
var shiftColor = "yellow";

function showIt(callID) {
    logStatus("Show It: " + callID);
    if(uCheck(callID)) {
        currentCall = null;
        for (var i = 0; i<calls.length; i++) {
            if (calls[i]._id == callID) {
                currentCall = calls[i];
                break;
            }
        }
        if (uCheck(currentCall)) {
            logStatus("Show Call Details");
            $("#show").show();
            var w = ($(window).height() - 30);
            var wComments = (w - 150) + "px";
            w += "px";
            $("#show").height(w);
            $("#show-canvas").height(w);
            $("#show-canvas").html(getShowDetailsHTML(currentCall, wComments));
            initializeMap(position.coords.latitude, position.coords.longitude);
        }
    }else{
        alert("no call id");
    }
}

function mapIt(callID) {
    logStatus("Map It: " + callID);
    if(uCheck(callID)) {
        currentCall = null;
        for (var i = 0; i<calls.length; i++) {
            if (calls[i]._id == callID) {
                currentCall = calls[i];
                break;
            }
        }
        if (uCheck(currentCall)) {
            logStatus("Geolocating");
            showLoader();
            navigator.geolocation.getCurrentPosition(onInitGeoSuccess, onInitGeoError);
        }
    }else{
        alert("no call id");
    }
}

function onInitGeoSuccess(position) {
    logStatus("Location obtained");
    mapStartingLocation = position;
    $("#map").show();
    var w = ($(window).height() - 30) + "px";
    $("#map").height(w);
    $("#map-canvas").height(w);
    hideLoader();
    initializeMap(position.coords.latitude, position.coords.longitude);
}

function onInitGeoError(error) {
    logStatus("Error on location");
    log(error.message);
}

function mapDirections() {
    //var url = 'http://maps.apple.com/?q=daddr='+destination+'&saddr='+source;
    var url = 'maps:daddr='+mapEndingLocation;
    window.location = url;
}


function mapHide() {
    $("#map").hide();
}

function showHide() {
    $("#show").hide();
}

function initializeMap(lat, lng) {
    logStatus("Init Map");
    
    var currentLocation = new google.maps.LatLng(lat, lng);
    
    directionsDisplay = new google.maps.DirectionsRenderer();
    
    var mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: currentLocation
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    
    calcRoute(currentLocation);
    
    logStatus("Map Complete");
}

function calcRoute(start) {
    // var start = document.getElementById('start').value;
    // var end = document.getElementById('end').value;
    var end = getCallAddressForMap(currentCall);
    mapEndingLocation = end;
    log("Map directions");
    log("To: " + end);
    if (uCheck(end)) {
        var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                log("Map directions ok");
            }
        });
    }
}

function getCallAddressForMap(call) {
    var address = "";
    if (uCheck(call.RespondToAddress))
        address += call.RespondToAddress.split(/[\.,:;\n\f\r]+/)[0] + ", ";
    if (uCheck(call.CityInfo) && uCheck(call.CityInfo.ZIPCode)) {
        address += call.CityInfo.City + ", ";
        address += call.CityInfo.ZIPCode;
    }
    if (address.length === 0)
        return null;
    
    address = address.replace("&", "AT");
    return address.trim();
}

function pushInTest() {
    var call = {_id: 12341234, IncidentNature: "FALL", RespondToAddress: "209 PATON STREET: EXTRA LONG INFO FOR CHECK", CityInfo: {City: "Cashmere"}, WhenCallWasOpened: "testing"};
    var activeHTML = parseCall(call, true);
    $("#activeCalls").html(activeHTML);
}

function getCalls() {
    var jsonURL = "https://" + agency + ".ispyfire.com";
    jsonURL += '/firecad/@@DB@@/cadcalls/';
    showLoader();
    $("#actionRefresh").hide();
    logStatus("Getting Calls");
    $.getJSON(jsonURL)
        .done(function(data) {
            logStatus("Calls Returned");
            //log( "calls: " + JSON.stringify(data) );
            calls = data.results;
            parseCalls();
        })
        .fail(function(data) { log( "calls error: " + JSON.stringify(data) ); })
        .always(function() {
            hideLoader();
            refreshTimer();
        });   
}

function refreshTimer() {
    setTimeout(function() { $("#actionRefresh").slideDown(500); }, refreshWait);
}

function parseCalls() {
    $("#actionWrapper").css("display", "block");
    if (uCheck(calls)) {
        var activeHTML = "";
        var completeHTML = "";
        for(var i = 0; i<calls.length; i++) {
            if (checkCADCallForLocal(calls[i])) {
                if (calls[i].iSpyStatus.toLowerCase() != "completed") {
                    activeHTML += parseCall(calls[i], true);
                }else{
                    completeHTML += parseCall(calls[i], false);
                }
            }
        }
        $("#activeCalls").html(activeHTML);
        $("#completeCalls").html(completeHTML);
        
        $(".callClick").click(function() {
            var productId = $(this).attr('id');
            showIt(productId);
        });
        
        $(".mapover").click(function() {
            var productId = $(this).attr('id');
            productId = productId.replace("_map", "");
            mapIt(productId);
        });
    }else{
        logStatus("No Calls");
        $("#activeCalls").html("No Calls");
        $("#completeCalls").html("No Calls");
    }
}

function parseCall(call, isAcive) {
    var style = "";
    if (isAcive)
        style = "border: 1px solid white;";
        
    var textWidth = $("#activeCalls").width() - 70;
    var htmlString = "<div class='callWrapper' style='"+style+"'>";
    htmlString += "<div id='"+call._id+"' class='callClick textNoWrap' style='width: "+textWidth+"px;'>" + call.IncidentNature;
    htmlString += "<br>" + call.RespondToAddress;
    htmlString += "<br>" + call.CityInfo.City;
    htmlString += "<br>" + call.WhenCallWasOpened;
    htmlString += "</div>";
    htmlString += "<div id='"+call._id+"_map' class='mapover'></div>";
    htmlString += "</div>";
    return htmlString;
}

function getShowDetailsHTML(call, w) {
    var htmlString = "<div class='showWrapper'><h2>"+call.IncidentNature+"</h2>";
    htmlString += call.RespondToAddress;
    htmlString += "<br>" + call.CityInfo.City;
    htmlString += "<br>" + call.WhenCallWasOpened;
    if (uCheck(call.JoinedResponders))
        htmlString += "<br>" + call.JoinedResponders;
    if (uCheck(call.JoinedComments))
        htmlString += "<div id='callComments' style='height: "+w+";'>" + call.JoinedComments.replace(/\n/g, '<p>') + "</div>";
    htmlString += "</div>"
    return htmlString;
}

function checkCADCallForLocal(call) {
    if (uCheck(cadsettings) && uCheck(cadsettings.matchingUnits)) {
        var joinedResp = getCallUnitsString(call);
        if (uCheck(joinedResp)) {
            var units = joinedResp.split(" ");
            for (var i = 0; i<cadsettings.matchingUnits.length; i++) {
                if (units.indexOf(cadsettings.matchingUnits[i]) > -1)
                    return true;
            }
        }
        if (uCheck(call.AgencyCode)) {
            if (uCheck(cadsettings.agencyCode))
                if (call.AgencyCode == cadsettings.agencyCode)
                    return true;
        }
    }
        
    return false;
}

function getCallUnitsString(call) {
    var units = "";
    if (uCheck(call.JoinedRespondersDetail)) {
        for(var i = 0; i<call.JoinedRespondersDetail.length; i++) {
            units += call.JoinedRespondersDetail[i].UnitNumber + " ";
        }
    }else{
        units = "Agency: " + call.AgencyCode;
    }
    if (units.length === 0) {
        units = "Unk";
    }
    return units;
}

function showLoader() {
    $("#loading").css("display", "block");
}

function hideLoader() {
    $("#loading").css("display", "none");
}


function workShiftCalendar() {
    log("work shift calendar");
    var dateNow = new Date();
    var latertoday = false;
    var match = false;
    for (var i = 0; i<shiftCalendar.length; i++) {
        if (match)
            break;
        if (uCheck(shiftCalendar[i].response)) {
            for (var x = 0; x<shiftCalendar[i].response.length; x++) {
                if (shiftCalendar[i].response[x]._id == window.localStorage.getItem("userID")) {
                    var startD = formatEpochToDate(shiftCalendar[i].date);
                    var endD = formatEpochToDate(shiftCalendar[i].endDate);
                    if (dateNow > startD && dateNow < endD) {
                        var type = shiftCalendar[i].callType;
                        if (type == "*") {type="All";}
                        var zone = shiftCalendar[i].callZone;
                        if (zone == "*") {zone="All";}
                        $("#shiftDisplay").html("On Shift (" + type + " - " + zone + ")");
                        
                        match = true;
                        break;
                    }
                    var dateNowString = formatDate(dateNow);
                    var startDString = formatDate(startD);
                    if (dateNowString == startDString && dateNow < endD) {
                        latertoday = true;
                    }
                }
            }
        }
    }
       
    if (match) {
        $("#app").animate(
            {marginTop:"25px"},
            {
                duration: 500,
                complete: function() {
                    $("#shift").css("background-color", "green");
                    $("#shift").css("color", "white");
                    $("#shift").fadeIn(500);
                    $("#shiftDisplay").fadeIn(500);
                    setTimeout(function(){
                        $("#app").animate({marginTop:"10px"}, 500);
                        $("#shift").animate({height:"2px"}, 500);
                        $("#shiftDisplay").fadeOut(500);
                        $("#shiftAction").html('<img src="img/greenDown.png">');
                        $("#shiftAction").fadeIn(500);
                        shiftExpanded = false;
                        shiftColor = "green";
                        },
                    4000);
                }
            }
        ); 
        return false;
    }
    
    for (var i = 0; i<shiftCalendar.length; i++) {
        if (match)
            break;
        var endD = formatEpochToDate(shiftCalendar[i].endDate);
        if (dateNow < endD) {
            if (uCheck(shiftCalendar[i].response)) {
                for (var x = 0; x<shiftCalendar[i].response.length; x++) {
                    if (shiftCalendar[i].response[x]._id == window.localStorage.getItem("userID")) {
                        var htmlString = "Next Shift: "+ shiftCalendar[i].displayDate;
                        // if (latertoday) {
                        //     // $("#shiftDisplay").css("color", "green");
                        //     //htmlString += "<div id='timeTillShift' />";
                        // }
                        $("#shiftDisplay").css("font-size", "12px");
                        $("#shiftDisplay").html(htmlString);
                        // if (latertoday) {
                        //     $("#timeTillShift").html(timeTillShift(shiftCalendar[i]));
                        // }
                        match = true;
                        break;
                    }
                }
            }
        }
    }
    
    if (match) {
        $("#app").animate(
            {marginTop:"25px"},
            {
                duration: 500,
                complete: function() {
                    $("#shift").css("background-color", "yellow");
                    $("#shift").css("color", "black");
                    $("#shift").fadeIn(500);
                    $("#shiftDisplay").fadeIn(500);
                    $("#shiftAction").fadeIn(250);
                    setTimeout(function(){
                        $("#app").animate({marginTop:"10px"}, 500);
                        $("#shift").animate({height:"2px"}, 500);
                        $("#shiftDisplay").fadeOut(500);
                        $("#shiftAction").html('<img src="img/yellowDown.png">');
                        $("#shiftAction").fadeIn(500);
                        shiftExpanded = false;
                        shiftColor = "yellow";
                        },
                    4000);
                }
            }
        ); 
        return false;
    }
    
    
    // $("#shiftDisplay").html("No shifts within 2 weeks");
    
    // $("#app").animate(
    //     {marginTop:"25px"},
    //     {
    //         duration: 500,
    //         complete: function() {
    //             $("#shift").css("background-color", "yellow");
    //             $("#shift").fadeIn(500);
    //             $("#shiftDisplay").fadeIn(500);
    //             setTimeout(function(){
    //                 $("#app").animate({marginTop:"10px"}, 500);
    //                 $("#shift").animate({height:"3px"}, 500);
    //                 $("#shiftDisplay").fadeOut(500);
    //                 },
    //             4000);
    //         }
    //     }
    // );    
}

function shiftAction() {
    if (shiftExpanded) {
        $("#app").animate({marginTop:"10px"}, 500);
        $("#shift").animate({height:"2px"}, 500);
        $("#shiftDisplay").fadeOut(500);
        $("#shiftAction").html('<img src="img/'+shiftColor+'Down.png">');
        shiftExpanded = false;
    }else{
        $("#app").animate({marginTop:"25px"}, 500);
        $("#shift").animate({height:"25px"}, 500);
        $("#shiftDisplay").fadeIn(500);
        $("#shiftAction").html('<img src="img/'+shiftColor+'Up.png">');
        shiftExpanded = true;
    }
}

function getShiftCalendar() {
    log("Shift Calendar...");
    if (uCheck(window.localStorage.getItem("userID"))) {
        var hourAgo = new Date().setHours(-1);
        log("HOUR AGO: " + hourAgo);
        if (!uCheck(lastShiftCheck) || lastShiftCheck < hourAgo) {
            log("userid stored: " + window.localStorage.getItem("userID"));
            var startDate = new Date();
            $("#shiftDisplay").html("Checking shifts...");
            // if (uCheck(currentSystemSettings.shiftLookBack))
            //     startDate.setHours(startDate.getHours() - currentSystemSettings.shiftLookBack);
            startDate.setHours(startDate.getHours() - 12);
            log("SD: " + startDate);
            var endDate = new Date();
            endDate.setDate(endDate.getDate() + 14);
            log("ED: " + endDate);
            var firstEpoch = formatDateToEpoch(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            var lastEpoch = formatDateToEpoch(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            log("SDE: " + firstEpoch);
            log("EDE: " + lastEpoch);
            
            var jsonURL = "https://" + agency + ".ispyfire.com";
            // jsonURL += '/firecad/@@DB@@/cadcalls/';
            
            // var jsonURL = window.location.protocol + '//' + window.location.host;
            jsonURL += '/firedb/@@DB@@/shiftcalendar/?criteria={"date":{"$gte":"'+firstEpoch+'","$lt":"'+lastEpoch+'"},"isActive": true}&sort={"date":1}';
            $.getJSON(jsonURL)
                .done(function(data) {
                    $("#shiftDisplay").html("Parsing Shifts...");
                    shiftCalendar = data.results;
                    workShiftCalendar();
                })
                .fail(function(data) {
                    $("#shiftDisplay").html("error");
                    log( "shift error: " + JSON.stringify(data) );
                });  
            lastShiftCheck = new Date();
        }else{
            log("Shift recently checked... Abort.");
        }
    }else{
        log("missing userid, reset app for shifts");
    }
}

function timeTillShift(shift) {
    var now = new Date();
    var shiftStart = formatEpochToDate(shift.date);
    var dif = shiftStart.getTime() - now.getTime();
    var timeCalc = new Date(2013, 01, 13, 0, 0, 0, dif);
    if (timeCalc.getHours() > 0)
        return "In: " + timeCalc.getHours() + " hours " + timeCalc.getMinutes() + " minutes";
    return "In: " + timeCalc.getMinutes() + " minutes";
}

function formatDateToEpoch(Year, Month, Day) {
    var epoch = new Date(Year, Month, Day).getTime() / 1000;
    return epoch;
}

function formatEpochToDate(epoch) {
    var dateObj = new Date(0);
    dateObj.setUTCSeconds(epoch);
    return dateObj;
}

function formatDate(datetime) {
    var dateObj = new Date(datetime);
    var dateStr = (dateObj.getMonth()+1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
    return dateStr;
}

