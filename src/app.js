// Here is the starting point for your application code.

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from "electron";
import jetpack from "fs-jetpack";
import env from "./env";


function f(x) {
  
}

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");
/**
 * status bar
 *
 * @param {any} warning
 */
function status(warning) {
	var last;
  document.getElementById("statusbar-info").innerHTML = warning; 
}

var hunter = 2480517;
var hunted = 2888574; 

var map = []; 

// 2480517 Bussard
// 2888574 Mouse
function loadGBIFData(anchor, gbifId ) {
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        zoom: 0, 
	      maxZoom: 18, attribution: "copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors" });

    if( !(anchor in map) ) {
        map[anchor] = L.map(anchor, { center: new L.LatLng(51.5, 10), zoom: 0, layers: [osm] });
    }

    status("Loading data " + anchor + "//" + gbifId );
    var gbi = L.tileLayer( "http://api.gbif.org/v1/map/density/tile?x={x}&y={y}&z={z}&type=TAXON&key=" + gbifId + "&layer=OBS_2010_2020&layer=LIVING&palette=yellows_reds", {
                 attribution: "&copy; <a href=\"http://www.gbif.org/terms/data-user\">Global Bio Divesity Facility</a> contributors"
    }).addTo(map[anchor]);

    var clouds = L.OWM.clouds({showLegend: false, opacity: 0.5, appId: "457d718f712a87a666b58ae28239b835" });
    var city = L.OWM.current({intervall: 15, lang: 'de'});
    status("Loading done");
  
    var baseMaps = { "OSM Standard": osm };
    var overlayMaps = { "Clouds": clouds, "Cities": city, "GBI": gbi };

    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map[anchor]);

    L.marker([52, 13]).addTo(map[anchor])
    .bindPopup('My location')
    .openPopup();

}

//    landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
//    thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;

function getSelection(anchor) {
      var e = document.getElementById(anchor);
      return e.options[e.selectedIndex].value;
}

/**
 * We draw when the document is available 
 */
document.addEventListener("DOMContentLoaded", function() {  
    loadGBIFData( "hunter",  2480517 );
    loadGBIFData( "mouse",  2888574);
    
    document.getElementById("btn-refresh").addEventListener("click", function() {
      console.log("REFRESH");

      var hunter = getSelection("inp-hunter");
      var hunted = getSelection("inp-hunted");

      console.log( hunter + "//" + hunted)
      loadGBIFData( "hunter",  hunter );
      loadGBIFData( "mouse",  hunted );

      document.getElementById("lbl-hunter").innerHTML = "Species: " + hunter;
      document.getElementById("lbl-pray").innerHTML = "Species: " +  hunted;

    });

function getEventData() {
  var ojson = { "source":  "BCWILDFIRE" };
  var strJSON = encodeURIComponent(JSON.stringify(ojson));

  $.ajax({ dataType: "json", url: "https://eonet.sci.gsfc.nasa.gov/api/v2.1/events", data: encodeURIComponent(JSON.stringify(ojson)), 
  success: function( data, text, jqxhdr ) { 
    data.events.forEach(function (event) { console.log("geometries:" + event.geometries.coordinates)})
  }
  });

}; /* getEventData */

  /** end of DONContentsLoaded */
});
 
 
