// Here is the starting point for your application code.

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from "electron";
import jetpack from "fs-jetpack";
import env from "./env";

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

/**
 * We draw when the document is available 
 */
document.addEventListener("DOMContentLoaded", function() {
  
    // Create a World Window for the canvas.
    var wwd = new WorldWind.WorldWindow("canvasOne");

// Define layers to populate the World Window
  var layers = [
    {layer: new WorldWind.BMNGLayer(), enabled: true},
    {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
    {layer: new WorldWind.BingAerialLayer(null), enabled: false},
    {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
    {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
    {layer: new WorldWind.CompassLayer(), enabled: true},
    {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
    {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}  
  	];

// Create those layers.
    for (var l = 0; l < layers.length; l++) {
      layers[l].layer.enabled = layers[l].enabled;
      wwd.addLayer(layers[l].layer);

  wwd.navigator.lookAtLocation.latitude = 52;
  wwd.navigator.lookAtLocation.longitude = 13;
  wwd.navigator.range = 50000; // 50KM

  placeMarker(52,  13, "Center of the World"  );

  getEventData( );
  getGBIFdata();
};

function placeMarker(latitude, longitude, text) {

    var pinLibrary = WorldWind.WWUtil.currentUrlSansFilePart() + "/../images/pushpins/"; // location of the image files
    var placemarkLayer = new WorldWind.RenderableLayer("Placemarks");
    var placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, 50000), false, null);
    placemark.label = text;       
    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

    var placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
          // Set up the common placemark attributes.
    placemarkAttributes.imageScale = 1;
    placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.3,
            WorldWind.OFFSET_FRACTION, 0.0);
    placemarkAttributes.imageColor = WorldWind.Color.WHITE;
    placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.0);
    placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
    placemarkAttributes.drawLeaderLine = true;
    placemarkAttributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;
    placemarkAttributes.imageSource = pinLibrary + "castshadow-red.png";
    placemark.attributes = placemarkAttributes;

    var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 5.0;
    placemark.highlightAttributes = highlightAttributes;

            // Add the placemark to the layer.
    placemarkLayer.addRenderable(placemark);

    wwd.addLayer(placemarkLayer);
}


function getEventData() {
  var ojson = { "source":  "BCWILDFIRE" };
  var strJSON = encodeURIComponent(JSON.stringify(ojson));

  $.ajax({ dataType: "json", url: "https://eonet.sci.gsfc.nasa.gov/api/v2.1/events", data: encodeURIComponent(JSON.stringify(ojson)), 
  success: function( data, text, jqxhdr ) { 
    data.events.forEach(function (event) { console.log("geometries:" + event.geometries.coordinates)})
  }
  });

}; /* getEventData */



function getGBIFdata() {
  var map = L.map("hunter").setView([52, 13], 13);

  L.tileLayer( "http://api.gbif.org/v1/map/density/tile?x={x}&y={y}&z={z}&type=TAXON&key=2480517&layer=OBS_2010_2020&layer=LIVING&palette=yellows_reds", { 
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
}

  /** end of DONContentsLoaded */
});
 
 
