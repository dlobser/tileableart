var Average = function(s) {

	/*
	var avg = new Average(10);
	avg.avg(valueToAverage);
	*/

	this.size=s;
	this.arr = [];

	this.avg = function(value){
		this.arr.push(value);

		var returnVal = 0;
		for(var i = 0 ; i < this.arr.length ; i++){
			returnVal+=this.arr[i];
		}
		if(this.arr.length>this.size){
			this.arr.shift();
		}
		return returnVal/this.arr.length;
	}
}

 var noise = function(ix, iy, iz) {

 		var x = ix || 0;
 		var y = iy || 0;
 		var z = iz || 0;
      var X = Math.floor(x)&255, Y = Math.floor(y)&255, Z = Math.floor(z)&255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      var u = fade(x), v = fade(y), w = fade(z);
      var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
          B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,
      return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                     grad(p[BA  ], x-1, y  , z   )), // BLENDED
                             lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                     grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                     lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                     grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                             lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                     grad(p[BB+1], x-1, y-1, z-1 ))));
   };
   function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); };
   function lerp(t, a, b) { return a + t * (b - a); };
   function grad(hash, x, y, z) {
      var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
      var u = h<8 ? x : y,                    // INTO 12 GRADIENT DIRECTIONS.
          v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
   };
   var p = [ 151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180 ];
   for (var i=0; i < 256 ; i++) p.push(p[i]);

function sphere(size){
	return(new THREE.Mesh(new THREE.SphereGeometry(size),new THREE.MeshLambertMaterial({color:0xffffff})));
}

saveGeometryToObj = function (geo,nums) {

	geo.updateMatrixWorld();

	var num = parseInt(nums);

	var s = '';
	for (i = 0; i < geo.geometry.vertices.length; i++) {

		var vector = new THREE.Vector3( geo.geometry.vertices[i].x, geo.geometry.vertices[i].y, geo.geometry.vertices[i].z );
		geo.matrixWorld.multiplyVector3( vector );
		
		//vector.applyProjection( matrix )
		
	    s+= 'v '+(vector.x) + ' ' +
	    vector.y + ' '+
	    vector.z + '</br>';
	}

	for (i = 0; i < geo.geometry.faces.length; i++) {

	    s+= 'f '+ (geo.geometry.faces[i].a+1+num) + ' ' +
	    (geo.geometry.faces[i].b+1+num) + ' '+
	    (geo.geometry.faces[i].c+1+num);

	    if (geo.geometry.faces[i].d!==undefined) {
	        s+= ' '+ (geo.geometry.faces[i].d+1+num);
	    }
	    s+= '</br>';
	}

	return s;
}

function saver() {

		console.log(things);
		alert("saving!");
		var j = 0;
		var output = "";
		
		
		for (var i = 0 ; i < things[0].msh.length ; i++){
			

			if(i == things[0].msh.length-2 || i == things[0].msh.length-3) i++;
			else{
				output += THREE.saveGeometryToObj4(things[0].msh[i],j,.0003);
				j += things[0].msh[i].geometry.vertices.length;
			}
		}
		
		output.replace("undefined","");
		document.write(output);
		console.log(output);
		// alert("saved!");
		// var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
		// saveAs(blob, "tree.obj");
}

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / https://github.com/WestLangley
 */

THREE.OrbitControls = function ( object, domElement ) {

	THREE.EventDispatcher.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, ZOOM : 1 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.center )

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.center ).add( offset );

		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			// this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		if ( event.button === 0 || event.button === 2 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.subVectors( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn();

			} else {

				scope.zoomOut();

			}

			zoomStart.copy( zoomEnd );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.zoomOut();

		} else {

			scope.zoomIn();

		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

};
