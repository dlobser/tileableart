var sc1 = {

	//create a substrate cloud
	//create a dynamic object
	//which leaves behind a trail of points which know the angle of their creation
	//	or just the position of the following point so it can figure it out
	//	this point will have an age and after a certain age it will spawn a new dynamic object
	//	this will only happen if it has no available substrate around
	//the original object will aim in a random direction and it will store the points that are
	//	within a certain angle of it's direction
	//points that are not stored by an object will be stored in a 'fair game' array
	//once a point that's been left behind is surrounded by enough 'fair game' points - it will
	//	spawn another forager
	
	setup:function(){

		d = new Debug();
		d.overflow=100;

		tim = new fSPK();
		console.log(tim);
		tim.showGeo();
		scene.add(tim);

		fNodes = [];

		for (var i = 0; i < 500; i++) {
			var newNode = new fNode(new THREE.Color(0xffffff));
			newNode.construct();
			newNode.position = new THREE.Vector3(50-Math.random()*100,50-Math.random()*100,50-Math.random()*100);
			fNodes.push(newNode);
			scene.add(newNode);
		}



		g = sphere(10);
		// g = new THREE.Mesh(new THREE.CylinderGeometry(.1,1,1),new THREE.MeshLambertMaterial());

		// scene.add(sphere(2));
		scene.add(g);
		// g.acceleration = new THREE.Vector3();
		// g.velocity = new THREE.Vector3();
		// g.damp = .01;
		// g.maxVelocity=.1;


		b = sphere(1);
		scene.add(b);


		// d = new THREE.Mesh(new THREE.CylinderGeometry(.1,2),new THREE.MeshLambertMaterial());
		// dp = new THREE.Object3D();
		// d.rotation.x=Math.PI/2;
		// dp.add(d);
		// scene.add(dp);

		// t = new THREE.Mesh(new THREE.CylinderGeometry(.1,2),new THREE.MeshLambertMaterial());
		// tp = new THREE.Object3D();
		// t.rotation.x=Math.PI/2;
		// tp.add(t);
		// scene.add(tp);


	},

	draw:function(time){


		// pos2 = new THREE.Vector3(0,0,0);

		b.position = new THREE.Vector3(omouseX*300,omouseY*-300,-omouseX*300);

		tim.checkAngle(b);

		tim.aim.lookAt(b.position);
		// tim.aimCheck.lookAt(b.position);

		whiteNodes(fNodes);

		tim.makeAimArray(fNodes);
		tim.colorAimArray();

		g.position = tim.findAveragePosition();


		// pos = new THREE.Vector3().subVectors(b.position,g.position);
		// pos3 = pos.clone().normalize();

		// dist = b.position.distanceTo(g.position);
		// // console.log(dist);

		// // if(dist>100)
		// // 	dist=g.damp;
		// dp.updateMatrixWorld();
		// dp.position = g.position;
		// tp.position = g.position;
		// tp.lookAt(pos2);
		// dp.lookAt(b.position);


		// // g.aimAt(pos);
		// g.acceleration.add(pos);
		// g.velocity.add(g.acceleration);
		// g.velocity.multiplyScalar(g.damp);
		// g.position.add(g.velocity);
		// // g.rotation.x=pos3.y;
		// // g.rotation.y=pos3.z;
		// // g.rotation.z=pos3.x;
		// g.acceleration.multiplyScalar(0);

		// rot = new THREE.Vector3(dp.rotation.x,dp.rotation.y,dp.rotation.z);
		// rot2 = new THREE.Vector3(tp.rotation.x,tp.rotation.y,tp.rotation.z);

		// col = (rot.angleTo(rot2));

		// // console.log(dp);

		// if(col<.1)
		// 	dp.children[0].material.color=(new THREE.Color(0xff0000))
		// else
		// 	dp.children[0].material.color=(new THREE.Color(0xffffff))

		
	}
}

fSPK = function(params){

	THREE.Object3D.call(this);

	this.acceleration = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	this.mass = 1;
	this.damp = .01;
	this.maxVelocity = .1;
	this.angle = .3;

	this.geo = new THREE.CylinderGeometry(.1,2,10);
	this.mat = new THREE.MeshLambertMaterial();

	var mat = new THREE.Matrix4();

	mat.makeRotationX( Math.PI/2 );
	this.geo.applyMatrix(mat);

	this.aim = new THREE.Object3D();
	this.aimCheck = new THREE.Object3D();

	this.add(this.aim);
	this.add(this.aimCheck);
	

}

fSPK.prototype = Object.create(THREE.Object3D.prototype);

fSPK.prototype.applyForce = function(force){

    this.acceleration.add(force.clone().divideScalar(this.mass));

}

fSPK.prototype.update = function() {

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    acceleration.mult(0);

}

fSPK.prototype.checkAngle = function(other){

	thisRot = new THREE.Vector3(this.aim.rotation.x,this.aim.rotation.y,this.aim.rotation.z);
	var tempAimCheck = this.aimCheck;

	tempAimCheck.lookAt(other.position);
	var checkRot = new THREE.Vector3(tempAimCheck.rotation.x,tempAimCheck.rotation.y,tempAimCheck.rotation.z);
	return checkRot.angleTo(thisRot);

}

fSPK.prototype.makeAimArray = function(arr){

	this.aimNodes = [];

	for (var i = 0; i < arr.length; i++) {
		var checked = this.checkAngle(arr[i]);
		if(checked<this.angle && checked>-this.angle)
			this.aimNodes.push(arr[i]);
	}

}

fSPK.prototype.colorAimArray = function(arr){

	for (var i = 0; i < this.aimNodes.length; i++) {
		this.aimNodes[i].makeRed();
	};

}

fSPK.prototype.findAveragePosition = function(){
	var arr = this.aimNodes;
	var x = y = z = 0;
	for (var i = 0; i < arr.length; i++) {
		x+=arr[i].position.x;
		y+=arr[i].position.y;
		z+=arr[i].position.z;
	}
	return new THREE.Vector3(x/arr.length,y/arr.length,z/arr.length);
}

fSPK.prototype.showGeo = function(){
	this.aim.add(new THREE.Mesh(this.geo,this.mat));
	this.aimCheck.add(new THREE.Mesh(this.geo,this.mat));
}


fSPK.prototype.construct = function(off){

}


fNode = function(){
	THREE.Object3D.call(this);

	var color = new THREE.Color(0xffffff);
	this.geo = new THREE.SphereGeometry(1);
	this.mat = new THREE.MeshLambertMaterial({color:color});
	// this.obj;
}

fNode.prototype = Object.create(THREE.Object3D.prototype);

fNode.prototype.construct = function(off){
	this.add(new THREE.Mesh(this.geo,this.mat));
}
fNode.prototype.makeRed = function(){
	this.mat.color = new THREE.Color(0xff0000);
}
fNode.prototype.makeWhite = function(){
	this.mat.color = new THREE.Color(0xffffff);
}

function findAveragePosition(arr){
	var x = y = z = 0;
	for (var i = 0; i < arr.length; i++) {
		x+=arr[i].position.x;
		y+=arr[i].position.y;
		z+=arr[i].position.z;
	}
	return new THREE.Vector3(x/arr.length,y/arr.length,z/arr.length);
}

function whiteNodes(arr){
	for (var i = 0; i < arr.length; i++) {
		arr[i].makeWhite();
	};
}

