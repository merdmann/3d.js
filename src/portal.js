
function Portal(x,y) {
    this.cube =  this.cube = new THREE.Mesh( geometry, material );
    this.cube.position.x = x;
    this.cube.position.y = y;
	this.cube.rotation.x += 0.1;
	this.cube.rotation.y += 0.1;

    this.getInfo = getPortalInfo;
}

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

Portal.prototype.getInfo = funcion() {
    return this.cube;
}