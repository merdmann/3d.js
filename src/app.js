/**
 * 
 */


// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from "electron";
import jetpack from "fs-jetpack";
import env from "./env";

const log = require("fancy-log");

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const BERLIN = [50.507222, 13.145833];

/**
 * 
 * @param {string} warning - some text to be displaey in the status line
 * of the app!
 */
const status = function (warning) {
    document.getElementById("statusbar-info").innerHTML = warning; 
}

var eventSources = null;
var hunter = 2480517;
var hunted = 2888574; 

var layerControl = false;

/**
 * This function loads the map from the GBIF mapo interface and presents it 
 * as an overlay on the open streetmap
 * 
 * @param {any} anchor  - location on the screen
 * @param {any} gbifId  - gbfid of the species of interest.
 *
 /* const osmurl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const osmattribution = "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors";
    const gbifurl = "http://api.gbif.org/v1/map/density/tile?x={x}&y={y}&z={z}&type=TAXON&key=" + gbifId + "&layer=OBS_2010_2020&layer=LIVING&palette=yellows_reds";
    const gbifattribution = "&copy; <a href=\"http://www.gbif.org/terms/data-user\">Global Bio Divesity Facility</a> contributors";
    
    const topomapurl = "http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    const topomapattribution = "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreet";
*/

const TopoURL ="http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

const OSMurl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const GBIFurl = function( key ) { return "http://api.gbif.org/v1/map/density/tile?x={x}&y={y}&z={z}&type=TAXON&key=" + key + "&layer=OBS_2010_2020&layer=LIVING&palette=yellows_reds" };

/**
 * 
 * @param {latlong*} center 
 * @param {string} anchor - the html elemenmte where thr maps should go 
 * @param {*} species  -- gbifg code f the sepcies to show
 */
const showMap = function (center, anchor, species) {
    log.info("showMap(" + center + ", " + anchor + ")");
    var layerControl = null;

    //  the topology map
    var topoMap = L.tileLayer(TopoURL, { attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreet"})
    var gbifMap = L.tileLayer(GBIFurl(species), { atribution: "&copy; <a href=\"http://www.gbif.org/terms/data-user\">Global Bio Divesity Facility</a> contributors" })

    var map = L.map(anchor, { layers:[topoMap]}).setView(center, 13);

    var EventsLayer = getEventData();


    if(layerControl === null) {  // var layerControl set to false in init phase; 
        log.info("Addind layerconrol to map");
        layerControl = L.control.layers({ "Topology": topoMap}, { "GBIF": gbifMap }).addTo(map);
    }       
    layerControl.addOverlay(EventsLayer, "Events");
    status("Loading done");

    return map;
}

/**
 *  get the selected species from the HTML docucment
 * 
 * @param {any} 
 * @returns 
 */
function getSelection(anchor) {
    var  e = document.getElementById(anchor);
    return e.options[e.selectedIndex].value;
}

/**
 * 
 * 
 * We draw when the document is available 
 */
document.addEventListener("DOMContentLoaded", function() {  
    log.info("DOM Tree loaded");

    const categories = jetpack.read("category.json", "json");
    
    var select = document.createElement("select");
    select.setAttribute("Id", "event-sources" );

    categories.categories.forEach( function(o, index) {
        var option = document.createElement("option");
        option.text = o.title;
        select.add(option);
    });

    var location = document.getElementById("sources");
    location.appendChild(select);
    
    eventSources = getSelection( "event-sources")
    hunter = getSelection( "inp-hunter");
    hunted = getSelection("inp-hunted");

    showMap( BERLIN, "hunter", hunter );
    showMap( BERLIN, "mouse", hunted );


    $("btn-refresh").addEvent("click", function() {
        log.info("REFRESH");

        $("lbl-hunter").innerHTML = "Species: " + hunter;
        $("lbl-pray").innerHTML = "Species: " + hunted;
   
    });
});    /** end of DONContentsLoaded */




/**
 * Get event Data anmd create a layer
 */
/** 
const getEventData = function( ) {
    var ojson = { "source": eventSources };
    var strJSON = encodeURIComponent(JSON.stringify(ojson));
    var eventsLayer = L.layerGroup();

    $.ajax({ dataType: "json", url: "https://eonet.sci.gsfc.nasa.gov/api/v2.1/events", data: encodeURIComponent(JSON.stringify(ojson)), 
        success: function( data, text, jqxhdr ) { 
            data.events.forEach(function (event) { 
                console.log( "titel: " + event.title );
                console.log( "     " + event.link);
                
                eventsLayer.addLayer(L.geoJSON(event.geometries, { properties: {popupContent: "Title missing..."}} ));        
            });
        }    
    });

    return eventsLayer;
};*/



const getEventData = function () {
    new Request.JSONP({
        url: "https://eonet.sci.gsfc.nasa.gov/api/v2.1/events", 
        callbackKey: 'jsoncallback',
        data: {
            source: eventSources
    },

    onRequest: function(url){
        // a script tag is created with a src attribute equal to url
    },
    onComplete: function(data){
        // the request was completed.
        console.log("requeest completed");
    }
}).send();
}

/**
 * GBIF API Inteface
 */
const GBIF_Species = function (name, cb ) {
    const username = "michael.erdmann@snafu.de";
    const password = "Dieter#10";

    $.ajax({
        type: "GET",
        url: "http://api.gbif.org/v1/species/match",
        dataType: "json",  
        contentType: "application/json; charset=utf-8",

        data: $.param({ name: name}),
        headers: { "Authorization": "Basic " + btoa( username + ":" + password )},
        success: function( resp ) { cb(resp); },
    }).done( function () {console.log("Auth done")});
     
};
