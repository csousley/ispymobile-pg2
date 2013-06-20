var calls = null;
var refreshWait = 15000; // 15 seconds
var directionsDisplay = null;
var directionsService = new google.maps.DirectionsService();
var map = null;
var currentCall = null;

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
            var wComments = (w - 100) + "px";
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