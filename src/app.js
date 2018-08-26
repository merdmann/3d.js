/**
 *
 * Copyright (c) 2017, 2018 Michael Erdmann
 *
 * Permission is hereby granted, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
//ap = L.tileLayer(GBIFurl(species), { atribution: "&copy; <a href=\"http://www.gbif.org/terms/data-user\">Global Bio Divesity Facility</a> contributors" })

const manifest = appDir.read("package.json", "json");

var BERLIN = [50.507222, 13.145833];

/**
 *
 * @param {string} warning - some text to be displaey in the status line
 * of the app!
 */
const status = function (warning) {
	document.getElementById("statusbar-info").innerHTML = warning;
}

/* status("Startup ...............");*/

var eventSources = null;
var hunter = 2480517;
var hunted = 2888574;

var layerControl = false;

var events = [];
var EventLayer;

/**
 * This function loads the map from the GBIF mapo interface and presents it
 * as an overlay on the open streetmap
 *
 * @param {any} anchor  - location on the screen
 * @param log.info("getData 2");
        	// process data
        	y} gbifId  - gbfid of the species of interest.
 *
 */
/*
const osmurl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmattribution = "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors";
const gbifurl = "http://api.gbif.org/v1/map/density/tile?x={x}&y={y}&z={z}&type=TAXON&key=" + gbifId + "&layer=OBS_2010_2020&layer=LIVING&palette=yellows_reds";
const gbifattribution = "&copy; <a href=\"http://www.gbif.org/terms/data-user\">Global Bio Divesity Facility</a> contributors";

const topomapurl = "http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
const topomapattribution = "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreet";


const TopoURL ="http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
const OSMurl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const GBIFurl = function( key ) { return "http://api.gbif.org/v1/map/density/tile?x={x}&y={y}&z={z}&type=TAXON&key=" + key + "&layer=OBS_2010_2020&layer=LIVING&palette=yellows_reds" };
*/
/**
 *
 * @param {latlong*} center
 * @param {string} anchor - the html elemenmte where thr maps should go
 * @param {*} species  -- gbifg code f the sepcies to show
 */
 const showMap = function (center, anchor, species) {

	var map = [];

	try {
		log.info("showMap(" + center + ", " + anchor + ")");
		var layerControl = null;

		//  the topology map
	  var topoMap = L.tileLayer(TopoURL, { attribution: "<a href=\"http://www.openstreetmap.org/copyright>\"OpenStreet\"</a>"});
		var gbifMap = L.tileLayer(GBIFurl(species), { atribution: "<a href=\"http://www.gbif.org/terms/data-user/>Global Bio Divesity Facility contributors\"" });
		map[anchor] = L.map(anchor, { center: center, zoom: 4, layers: [topoMap, gbifMap] }  );

		EventLayer = L.geoJSON().addTo(map[anchor]);

		if(layerControl === null) {  // var layerControl set to false in init phase;
			log.info("Adding layerconrol to map");
			layerControl = L.control.layers( {"Topology": topoMap}, { "GBIF": gbifMap }, {"Events": EventLayer}).addTo(map[anchor]);
		}
		layerControl.addOverlay(EventLayer, "Events");
		status("Loading done");
	}
	catch( error ) {
		log.error( "Exception: " + error );
	}
	return map[anchor];
};

/**
 *  get the selected species from the HTML docucment
 *
 * @param {any}
 * @returns
 */
var getSelection = function(anchor) {
	var e = $$(anchor);
	return e.options[e.selectedIndex].value;
}

/*
 * redraw the screen
 */
const redraw = function() {
	log.info("redraw");

	showMap( BERLIN, "hunter", hunter );
	showMap( BERLIN, "mouse", hunted );

	$("lbl-hunter").innerHTML = "Species: " + hunter;
	$("lbl-pray").innerHTML = "Species: " + hunted;
};

/**
 * load event data and process the result after the interacton is donw
 */
const getExternalData = function () {
	var myChain = new Chain();

	myChain.chain(
		function() {
			getEventData(eventSources, myChain);
		},
		function() {
			var i = 0;

			for(i in events) {
				if( events[i] !== null && events[i].title !== null) {
					log.info( events[i]);
					EventLayer.addData(events[i].geometries);
				}
			}
			//redraw();
		}
	);
	myChain.callChain();
};

/**
 * We draw when the document is available
 */
document.addEventListener("DOMContentLoaded", function() {
	log.info("DOM Tree loaded");

	const categories = jetpack.read("category.json", "json");

	categories.categories.forEach( function(o) {
		log.info("Category " + o.id + ", " + o.title);
		var location = $("event-sources");
		var option = new Element( "option",
			{ id    : "event-selection",
				value : o.id,
				html  : o.title,
				events: {
					change: function() { redraw(); }
				}
			});
		location.append(option);
	}); /* forEach */


	var selectedEvent = getSelection("event-sources");

	eventSources = $$("event-sources")
	eventSources.addEventListener("change", function() {
		redraw();
	});

	$("inp-hunter").addEventListener("change", function() {
		hunter = getSelection("inp-hunter");
		redraw();
	});

	$("inp-hunted").addEventListener("change", function() {
		hunted = getSelection("inp-hunted");
		redraw();
	});

	showMap( BERLIN, "hunter", hunter );
	showMap( BERLIN, "pray", hunted );


$("btn-refresh").addEvent("click", function() {
		log.info("Refresh");
		getExternalData();
	});
});    /** end of DONContentsLoaded */

/**
 *
 * https://eonet.sci.gsfc.nasa.gov/docs/v2.1
 *
 * @param {*} source
 */
const getEventData = function (source, myChain) {
	log.info("getEventData(" + source + "myChain: " + myChain + ")");

	// request the data
	var myRequest = new Request({
		url: "https://eonet.sci.gsfc.nasa.gov/api/v2.1/events",
		method: "get",
		onRequest: function() { log.info("onRequest()"); },
		onSuccess: function(responseText) {
			var o = JSON.parse(responseText)
			for(var i in o.events ) {
				log.info( o.events[i].title );
      	log.info( o.events[i].geometries );
      }
			var events = o.events;
			myChain.callChain(events);
		},
    onFailure: function(){
    	log.error("Sorry, your request failed");
		}
	})
	myRequest.send({ source: source });
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
	}).done( function () { console.log("Auth done");})
};
