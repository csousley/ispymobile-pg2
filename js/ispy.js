var calls = null;

function getCalls() {
    var jsonURL = "https://" + agency + ".ispyfire.com";
    jsonURL += '/firecad/@@DB@@/cadcalls/';
    showLoader();
    $.getJSON(jsonURL, function(data) {
        log("Calls back");
    })
    .done(function(data) {
        calls = data.results;
        parseCalls();
    })
    .fail(function(data) { log( "calls error: " + JSON.stringify(data) ); })
    .always(function() { hideLoader(); });   
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
    var htmlString = call.IncidentNature;
    htmlString += "<br>" + call.RespondToAddress;
    htmlString += "<br>" + call.CityInfo.City;
    htmlString += "<p>&nbsp;</p>";
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