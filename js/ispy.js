var calls = null;
var refreshWait = 15000; // 15 seconds
var directionsDisplay = null;
var directionsService = new google.maps.DirectionsService();
var map = null;

function mapIt(callID) {
    logStatus("Map It: " + callID);
    if(uCheck(callID)) {
        var call = null;
        for (var i = 0; i<calls.length; i++) {
            if (calls[i]._id == callID) {
                call = calls[i];
                break;
            }
        }
        if (uCheck(call)) {
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

function initializeMap(lat, lng) {
    logStatus("Init Map");
    // directionsDisplay = new google.maps.DirectionsRenderer();
    // var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    // var mapOptions = {
    //     zoom:7,
    //     mapTypeId: google.maps.MapTypeId.ROADMAP,
    //     center: chicago
    // };
    // map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // directionsDisplay.setMap(map);
    // google.maps.event.trigger(map, 'resize');
    
    var otherLocation = new google.maps.LatLng(47.409034, -120.31458399999997);
    var currentLocation = new google.maps.LatLng(lat, lng);
    
    directionsDisplay = new google.maps.DirectionsRenderer();
    
    var mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: currentLocation
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    
    calcRoute(currentLocation, otherLocation);
    
    logStatus("Map Complete");
}

function calcRoute(start, end) {
    // var start = document.getElementById('start').value;
    // var end = document.getElementById('end').value;
    log("Map directions");
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

function getCalls() {
    var jsonURL = "https://" + agency + ".ispyfire.com";
    jsonURL += '/firecad/@@DB@@/cadcalls/';
    showLoader();
    $("#actionRefresh").hide();
    logStatus("Getting Calls");
    $.getJSON(jsonURL, function(data) {
        log("Calls back");
    })
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
                    activeHTML += parseCall(calls[i]);
                }else{
                    completeHTML += parseCall(calls[i]);
                }
            }
        }
        $("#activeCalls").html(activeHTML);
        $("#completeCalls").html(completeHTML);
        
        $(".callClick").click(function() {
            var productId = $(this).attr('id');
            mapIt(productId);
        });
    }else{
        logStatus("No Calls");
        $("#activeCalls").html("No Calls");
        $("#completeCalls").html("No Calls");
    }
}

function parseCall(call) {
    var htmlString = "<div id='"+call._id+"' class='callClick'>" + call.IncidentNature;
    htmlString += "<br>" + call.RespondToAddress;
    htmlString += "<br>" + call.CityInfo.City;
    htmlString += "<br>" + call.WhenCallWasOpened;
    htmlString += "</div>";
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