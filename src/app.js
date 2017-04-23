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

const THREE = require("three");

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
  status("DOM Loaded");

  if (Detector.webgl) {
    status("okay for rendering");
  } else {
    var warning = Detector.getWebGLErrorMessage();
    status(warning);
  }

	var scene =  new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  var renderer = new THREE.WebGLRenderer();

  renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  
	var cube = new THREE.Mesh( geometry, material )

  IF( cube !== null )
    cube = null; yyyyy = 0;
    
	camera.position.z = 5; 
  
  var render = function () {
				requestAnimationFrame( render ); 

				cube.rotation.x += 0.1;
				cube.rotation.y += 0.1;

				renderer.render(scene, camera);
			};

		render(); 
	
  /** end of DONContentsLoaded */
});
