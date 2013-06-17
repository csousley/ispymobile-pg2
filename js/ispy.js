var calls = null;
var refreshWait = 15000; // 15 seconds
var directionsDisplay = null;
var directionsService = new google.maps.DirectionsService();
var map = null;

function map(callID) {
    alert(callID);
}

function initializeMap() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom:7,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: chicago
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
}

function calcRoute() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
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
    }else{
        logStatus("No Calls");
        $("#activeCalls").html("No Calls");
        $("#completeCalls").html("No Calls");
    }
}

function parseCall(call) {
    var htmlString = "<div onClick='map('"+call._id+"');'>" + call.IncidentNature;
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