let GoogleClient = (function() {

    'use strict';


    const Name = "Name",
        NumAttendees = "Number of Attendees",
        Relation = "Relation/Role",
        Address = "Address",
        Mail = "Mail or hand deliver?",
        SaveTheDateSent = "Save the Date Sent",
        InvitationSent = "Invitation Sent",
        RSVPStatus = "RSVP Status",
        RSVPNumber = "RSVP Number",
        PlusOneEligibility = "Plus 1 Eligibility",
        InvitedToBonfire = "Invited to Bonfire?";

    // placeholder for cached DOM elements
    let DOM = {
        $someElement : null
    };

    let SheetRow;
    let token;

    /* =================== private methods ================= */
    // cache DOM elements
    function cacheDom() {
        //DOM.$someElement = $('#some-element');
    }

    async function loadSpreadsheetData(range) {
        token = await getAuthToken();
        return new Promise( (resolve) => {
            $.ajax({
                type: "GET",
                url: `https://sheets.googleapis.com/v4/spreadsheets/${XORCipher.decode("Xidk92jnJa5eW7Rh4ownL=W2kmn", Things.Things.Thing2)}/values/${range}`,
                contentType: "application/json",
                headers: {"Authorization" : `Bearer ${token}`},
                success: function(data) {

                    let sheet = new Map();
                    let headers = data.values[0];

                    for (let i = 1; i < data.values.length; i++) {
                        let map = new Map();
                        for (let j = 0; j < headers.length; j++) {
                            map.set(headers[j], data.values[i][j]);
                        }
                        sheet.set(map.get("Name"), {Row : map, RowNum : i})
                    }
                    resolve(sheet);
                }

            });
        })
    }
    function getAuthToken() {
        return new Promise((resolve => {
            let pHeader = {"alg":"RS256","typ":"JWT"}
            let sHeader = JSON.stringify(pHeader);

            let pClaim = {};
            pClaim.aud = "https://www.googleapis.com/oauth2/v4/token";
            pClaim.scope = "https://www.googleapis.com/auth/spreadsheets";
            pClaim.iss = "weddingwebsite@elegant-canto-285618.iam.gserviceaccount.com";
            pClaim.exp = KJUR.jws.IntDate.get("now + 1hour");
            pClaim.iat = KJUR.jws.IntDate.get("now");

            let sClaim = JSON.stringify(pClaim);

            let sJWS = KJUR.jws.JWS.sign(null, sHeader, sClaim, XORCipher.decode("Xidk92jnJa5eW7Rh4ownL=W2kmn", Things.Things.Thing1));

            let XHR = new XMLHttpRequest();
            let urlEncodedData = "";
            let urlEncodedDataPairs = [];

            urlEncodedDataPairs.push(encodeURIComponent("grant_type") + '=' + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer"));
            urlEncodedDataPairs.push(encodeURIComponent("assertion") + '=' + encodeURIComponent(sJWS));
            urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

            XHR.addEventListener('load', function(event) {
                let response = JSON.parse(XHR.responseText);
                resolve(response["access_token"])
            });

            XHR.addEventListener('error', function(event) {
                console.log('Oops! Something went wrong.');
            });

            XHR.open('POST', 'https://www.googleapis.com/oauth2/v3/token');
            XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            XHR.send(urlEncodedData)
        }))
    }

    function putSpreadsheetData(range, data) {

        let json = {
            "range": range,
            "majorDimension": "ROWS",
            "values": data
        }
        return new Promise( (resolve) => {
            $.ajax({
                type: "PUT",
                url: `https://sheets.googleapis.com/v4/spreadsheets/${XORCipher.decode("Xidk92jnJa5eW7Rh4ownL=W2kmn", Things.Things.Thing2)}/values/${range}?valueInputOption=RAW`, //?key=${API_Key}
                contentType: "application/json",
                headers: {"Authorization" : `Bearer ${token}`},
                data: JSON.stringify(json)
            });
        });
    }
    
    
    function searchFor(searchTerm, valueDict) {
        let tokens = searchTerm
            .toLowerCase()
            .split(' ')
            .filter(function(token){
                return token.trim() !== '' && token !== "and";
            });

        let result = undefined;

        if (tokens.length > 1) {

            const searchTermRegex = new RegExp("\\b" +tokens.join('\\b|\\b') + "\\b", 'g');

            let matchedKey = "";
            let maxMatched = 0;

            valueDict.forEach((value, key) => {
                let numMatched =  ((key.toLowerCase().replace(',', '') || '').match(searchTermRegex) || []).length
                if (numMatched > maxMatched){
                    maxMatched = numMatched;
                    result = value;
                    matchedKey = key;
                }
            });

            if (maxMatched < (matchedKey.split(' ').length /5)) {
                result = undefined;
            }
        }
        return result;
    }

    // bind events

    // handle click events
    function handleClick(e) {
        //render(); // etc
    }
    // render DOM
    function render() {

    }
    /* =================== public methods ================== */
    // main init method

    async function searchInSpreadsheet(searchTerm) {
        let sheet = await loadSpreadsheetData("A1:L64");
        SheetRow = searchFor(searchTerm, sheet);
        return SheetRow === undefined ? undefined : {
            NumAttendees : SheetRow.Row.get(NumAttendees),
            PlusOneEligibility : SheetRow.Row.get(PlusOneEligibility),
            PersonName: SheetRow.Row.get(Name),

            RSVP: async function(attendees, plusOne){
                let data = [
                    ["RSVPed", attendees, plusOne ? "Reserved" : "Not Reserved"]
                ];
                let range = `H${SheetRow.RowNum}:J${SheetRow.RowNum}`
                return await putSpreadsheetData(range, data);
            }
        };
    }

    function getNumberAttendees() {
        return SheetRow.Row.get(NumAttendees);
    }

    function init() {


    }
    /* =============== export public methods =============== */
    return {
        init: init,
        searchInSpreadsheet : searchInSpreadsheet
    };
}());