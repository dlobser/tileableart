var num = 0;

var fover = 64;
	
	var views = [
		{ 
			left: 0,
			bottom: 0,
			width: 0.333,
			height: 1.0,
			//background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
		//	eye: [ 0, 300, 1800 ],
		//	up: [ 0, 1, 0 ]
			fov: fover,
					updateCamera: function ( camera ) {
					  camera.rotation.y = 0;//Math.PI*0.5;
					  camera.position.z = 50;
					 // camera.lookAt( scene.position );
					}			
		},
		{ 
			left: 0.333,
			bottom: 0,
			width: 0.333,
			height: 1,
			background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
		//	eye: [ 0, 1800, 0 ],
	//		up: [ 0, 0, 1 ]
			fov: fover,
				updateCamera: function ( camera ) {
					  camera.rotation.y = -Math.PI*0.5;
					  camera.position.z = 50;
					 // camera.lookAt( scene.position );
					}	
			
		},
		{ 
			left: 0.666,
			bottom: 0,
			width: 0.333,
			height: 1,
			background: new THREE.Color().setRGB( 0.5, 0.7, 0.7 ),
		//	eye: [ 1400, 800, 1400 ],
		//	up: [ 0, 1, 0 ]
			fov: fover,
				updateCamera: function ( camera ) {
					  camera.rotation.y = Math.PI;
					  camera.position.z = 50;
					 // camera.lookAt( scene.position );
					}	
			
		}
	];
	
	
	

sc1 = function(){

	var container,
	camera, 
	controls, 
	scene,
	renderer,
	pLight,
	pCount,
	camGroup;	
	this.things = [];
	this.trees = [];
	this.Sky = [];
	this.tops = [];
	
	var text;
	
	
/*
	//setup dat.gui
	var starfield = function()
	{
		this.speed = 0.00001;
		this.speed2 = 1;
		this.size = 43.9;
		this.x = 0.0046;
		this.y = 0.001;
		this.z = 0.001;
		this.x2 = 0.000;
		this.y2 = 0.000;
		this.z2 = 0.000;
		this.xw = 0.000;
		this.yw = 0.000;
		this.zw = 0.000;
		this.x1 = 0.000;
		this.y1 = 0.000;
		this.z1 = 0.000;
		this.sizerx = 5;
		this.sizery = 5;
		this.sizerz = 5;
		this.length = 1;
	};
	
    this.text = new starfield();
	var gui = new dat.GUI();
	gui.remember(this.text);
	// gui.add(text, 'message');
	gui.add(this.text, 'speed', -.0001, .001);
	gui.add(this.text, 'speed2', 0,10);
	gui.add(this.text, 'size', 1, 100);
	gui.add(this.text, 'x', 0,.01);
	gui.add(this.text, 'y', 0,.01);
	gui.add(this.text, 'z', 0,.01);
	//gui.add(this.text, 'xw', 0,.01);
	//gui.add(this.text, 'yw', 0,.01);
	//gui.add(this.text, 'zw', 0,.01);
	gui.add(this.text, 'x2', 0,1);
	gui.add(this.text, 'y2', 0,1);
	gui.add(this.text, 'z2', 0,1);
	gui.add(this.text, 'x1', 0,1);
	gui.add(this.text, 'y1', 0,1);
	gui.add(this.text, 'z1', 0,1);
	gui.add(this.text, 'length', 0,10);
//	gui.add(this.text, 'sizerx', 0,10);
//	gui.add(this.text, 'sizery', 0,10);
//	gui.add(this.text, 'sizerz', 0,10);*/
}

//sets up the three scene and calls addGeo
sc1.prototype.init = function() {

	//this.camera = new THREE.PerspectiveCamera( 125, window.innerWidth / window.innerHeight, 1, 2000 );
	//this.camera.position.z = 20;
	//this.camera.position.y = 0;
	//this.camera.position.x = 0;
	
		for (var ii =  0; ii < views.length; ++ii ) {

					var view = views[ii];
					camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
					//camera.position.x = view.eye[ 0 ];
					//camera.position.y = view.eye[ 1 ];
					//camera.position.z = view.eye[ 2 ];
					//camera.up.x = view.up[ 0 ];
					//camera.up.y = view.up[ 1 ];
					//camera.up.z = view.up[ 2 ];
					view.camera = camera;
				}
	
	
	//this.camera.rotation.x = .5;
	
	//camGroup = new THREE.Object3D();
	//camGroup.position.y = 100;
	
	//console.log(camGroup);
	
	//camGroup.add(this.camera);
	pLight = new THREE.Object3D();
	pCount = 0;
	
	this.controls = new THREE.OrbitControls( this.camera );
	this.controls.addEventListener( 'change', this.render );

	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2( 0xcc5588, 0.001 );

	//this.addGeo();
	this.addEnv();

	var light = new THREE.DirectionalLight( 0x111111 );
	light.position.set( 1, 1, 1 );
	//this.scene.add( light );

	light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	this.scene.add( light );
	
	light = new THREE.PointLight( 0x5588cc );
	light.intensity = 1;
	light.distance = 200;
	light.position.set( -5, -10, 30 );
	pLight.add(light);
	this.scene.add( pLight );
	
	light = new THREE.PointLight( 0xcc8833 );
	light.intensity = 1;
	light.distance = 100;
	light.position.set( 5, -10, 30 );
	this.scene.add( light );

	light = new THREE.AmbientLight( 0x222222 );
	//this.scene.add( light );

	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	//this.renderer.setClearColor( scene.fog.color, 1 );
	//this.renderer.setSize( window.innerWidth, window.innerHeight -100);	
		this.renderer.setSize( 1920,1080);	


	this.container = document.getElementById( 'container' );
	this.container.appendChild( this.renderer.domElement );

	//window.addEventListener( 'resize', onWindowResize, false );
	//console.log(this.renderer, + " " + this.scene.children.length + " " + this.camera.toString());

	
}

sc1.prototype.addGeo = function(){

	var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
	var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
	
	var parms={color1:0x003399,color2:0xbbffdd,color3:0x0099ff};
	
	for ( var i = 0 ; i < 2 ; i++){
		var cuber = new peep();
		//check out peep.js to see what this function does - 
		//(recurions, scale xyz, scale of each increment)
		cuber.parentSquares(200,3,0,3,.99);
		this.mesh = new THREE.Mesh( geometry, material );
		this.scene.add(cuber.pos_big);
		this.things.push(cuber);
	}
	console.log(this.things);
	
}

sc1.prototype.moveThings = function(){

	for ( var j = 0 ; j <   this.things.length  ; j++){
	
		var thing = this.things[j];
		
		//thing array has two cubers, I'm just rotating the first one around for symmetry
		if(j==0){
			thing.rt[0].rotation.x = Math.PI;
		}
		
		thing.rt[0].position.y = 0;
		thing.rt[0].children[0].scale.y = this.text.length;
	
		var sizer = new THREE.Vector3(1,1,1);
		
		//peep creates an array called rot with a list of all the required joints
		//the alternate method would involve tracing through the heirarchy by finding links to children[]
		
		for (var i = 1 ; i< thing.rt.length; i++){
			sizer.multiplyScalar(2);
			thing.rt[i].rotation.x = (Math.sin((i/this.text.size)+num)*(i*this.text.x))+(Math.sin(this.text.x2)*(i/thing.rt.length))+(Math.sin(this.text.x1));
			thing.rt[i].rotation.z = (Math.sin((i/this.text.size)+num)*(i*this.text.y))+(Math.sin(this.text.y2)*(i/thing.rt.length))+(Math.sin(this.text.y1));
			thing.rt[i].rotation.y = (Math.sin((i/this.text.size)+num)*(i*this.text.z))+(Math.sin(this.text.z2)*(i/thing.rt.length))+(Math.sin(this.text.z1));
			thing.rt[i].position.y = this.text.length;
			thing.rt[i].children[0].scale.y = this.text.length;
			
			//when enabled, these options would allow for the scaling of each joint in isolation without respect to the heirarchy
			
		//	thing.rot[i].children[0].scale.x = this.text.sizerx;
		//	thing.rot[i].children[0].scale.y = this.text.sizery;
		//	thing.rot[i].children[0].scale.z = this.text.sizerz;
		}
		num-=i*this.text.speed*this.text.speed2;
	}	
}

sc1.prototype.animate = function(){
	
	//this.render();
	
	//this.renderer.render( this.scene, this.camera );
	
	//this.renderer.setViewport(0,0,400,800 );
	//this.renderer.setScissor( 0, 0,400,800);
	//this.renderer.enableScissorTest ( true );
	
	
	for ( var ii = 0; ii < views.length; ++ii ) {

		view = views[ii];
		camera = view.camera;
		
		//console.log(camera);

		view.updateCamera( camera );

		var left   = Math.floor( 1920  * view.left );
		var bottom = Math.floor( 1080 * view.bottom );
		var width  = Math.floor( 1920  * view.width );
		var height = Math.floor( 1080 * view.height );
		this.renderer.setViewport( left, bottom, width, height );
		this.renderer.setScissor( left, bottom, width, height );
		this.renderer.enableScissorTest ( true );
		//this.renderer.setClearColor( view.background );

		//camera.aspect = .5;
		//camera.updateProjectionMatrix();

		this.renderer.render( this.scene, camera );
	}
	
	/*
	if(this.text.speed*this.text.speed2 !=0){
		this.moveThings();
	}
	*/
	this.moveEnv();
	var that = this;
	requestAnimationFrame( function() { that.animate(); });
	this.controls.update();

	
}

sc1.prototype.render = function() {
	//console.log("wtf");
	//wtf does this throw errors even when it's not being used?
	//this.renderer.render( this.scene, this.camera );

}
sc1.prototype.moveEnv = function(){

	//this.scene.children[3].rotation.x+=.01;
	this.things[0].rotation.x += 0.0011;
	this.things[0].position.y = -1080;
	
	for(thing in this.trees){
		this.trees[thing].rotation.y += 0.001;
	}
	
		for(thing in this.tops){
		this.tops[thing].rotation.y += 0.05 * this.tops[thing].q;
	}
	
	this.Sky[0].rotation.x += 0.021;
	this.Sky[0].position.y = -200;
	
	pCount += 0.021;
	
	pLight.position.y=Math.sin(pCount)*200;
	
}

sc1.prototype.addEnv = function(){

	var planegeo = new THREE.PlaneGeometry(20,20,20,20);
	var spheregeo = new THREE.CubeGeometry(20,20,20);
		var sphere = new THREE.SphereGeometry(20,20,20);

	var cylgeo = new THREE.CylinderGeometry(6,6, 200, 6 )
	this.material =  new THREE.MeshLambertMaterial( { color:0x33ccdd} );
	this.material2 =  new THREE.MeshLambertMaterial( { shading:THREE.FlatShading, color:0x885533 } );
	this.materialCloud =  new THREE.MeshLambertMaterial( { shading:THREE.FlatShading, color:0xffffff } );
	


	
	mesh = new THREE.Mesh( planegeo, this.material );
	mesh.rotation.x = -Math.PI/2;
	mesh.position.y = -65;
	mesh.scale.x = 500;
	mesh.scale.y = 500;
	
	mesh.receiveShadow = true;
	
	//this.scene.add(mesh);
	var balls = new THREE.Object3D();
	
	geo = new THREE.Geometry();
	
	for(var j = 0 ; j < 2 ; j++){
		for(var i = 0 ; i < 50 ; i++){
			var cylgeo2 = new THREE.CylinderGeometry(6,6, 1, 6 )

			mesh2 = new THREE.Mesh( cylgeo2, this.material );
			
			var ball = new THREE.Object3D();
			var ballHold = new THREE.Object3D();
			
			ball.add(mesh2);
			
			var scaled = rand(65,95);
			ball.scale = new THREE.Vector3(scaled,1,scaled);
			ball.rotation.x = rand(0,Math.PI);
			ball.rotation.z = Math.PI/2;
			ball.position.y = rand(550,620);
			ball.position.x = rand(-125,125);
			
			ballHold.add(ball);
			ballHold.rotation.x = rand(0,Math.PI*2);
			
			if(j==0)
			ballHold.position.x = 200;
			
			else
			ballHold.position.x = -250;

			
			THREE.GeometryUtils.merge(geo,mesh2);
			
			balls.add(ballHold);
			
		}
		//balls.add(geo);
		this.scene.add(balls);
		this.things.push(balls);
	}
	
	for(var j = 0 ; j < 3 ; j++){
		for(var i = 0 ; i < 400 ; i++){
			mesh = new THREE.Mesh( spheregeo, this.material );
			mesh2 = new THREE.Mesh( cylgeo, this.material2 );
			//cloud = new THREE.Mesh(spheregeo,this.materialCloud);
			
			
			//cloud.position.y = 400;
			
			var ball = new THREE.Object3D();
			var ballHold = new THREE.Object3D();
			
			mesh.position.y = 0;
			mesh.castShadow = true;	
			mesh2.castShadow = true;	
			
			mesh.receiveShadow = false;
			mesh2.receiveShadow = false;
			
			ball.add(mesh);
			
			mesh.q = rand(0,1);
			this.tops.push(mesh);
			
			if(j!=2)
			ball.add(mesh2);
					//	ball.add(cloud);

			ballHold.add(ball);
			
			this.trees.push(mesh);
			
			ball.children[0].position.y=10;
			if(j!=2)
			ball.children[1].position.y=-100;
			
			var scalar = (Math.random() * 3)+1;
			var scaleme = new THREE.Vector3(scalar,scalar,scalar);

			var randValue;
			var finished = false;
			
			/*
			while(!finished){
				randValue = randly();
				if(randValue > 30 || randValue < 25){
					finished = true;
				}
			}
			*/
			
			var pos = new THREE.Vector3( rand(-25,25),rand(1060,1090.5),0);
			
			//ball.scale = scaleme;
			ball.position = pos;
			ball.rotation = new THREE.Vector3(rand(-.01,.01),rand(-.01,.01),rand(-.01,.01));
			
			ballHold.rotation.x =rand(0,Math.PI*2);
			ball.rotation.y = rand(0,Math.PI);
			//ballHold.position.y = -180;
			
			if(j==0)
				ballHold.position.x = -55;
			
			else if(j==1)
				ballHold.position.x = 65;
			
			else{
				ballHold.position.x = 0;
				ballHold.scale = new THREE.Vector3(3.68,.92,.92);
			}
			
			balls.add(ballHold);
			
		}
		this.scene.add(balls);
		this.things.push(balls);
	}
	
	//add sky
	
	var texture = THREE.ImageUtils.loadTexture('../images/texture/sky.jpg');
	texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.filter =  THREE.NearestFilter;
	//texture.repeat.set( 5, 5 );
	//texture.offset.set( 15, 15 );
	//texture.needsUpdate = true;

	  var materialSky = new THREE.MeshBasicMaterial({
        map: texture,
		color: 0xffffff,
		emission: 1,
		side: THREE.DoubleSide,
		fog:false
      });
	
	sky = new THREE.Mesh(sphere,materialSky);
	skyScalar = new THREE.Vector3(130,130,130);
	sky.scale = skyScalar;
	sky.position.z = 0;
	sky.rotation.y = Math.PI/2;
	
	light = new THREE.PointLight( 0xff0000 );
	light.intensity = 10;
	light.distance = 200;
	light.position.set( 0, 0, -300 );
	
	skyGroup = new THREE.Object3D();
	skyGroup.add(sky);
	skyGroup.add(light);
	
	this.scene.add(skyGroup);
	this.Sky.push(skyGroup);
	
	console.log(this.scene);

}

function randly(){
	var returner = (Math.random() -.5)*300;
	return returner;
}

