var rainbow = function (params) {

	args = params || {};

	// this.curveDetail = args.curveDetail || 1000;

	this.steps = args.steps || 10;
	this.ctrlSteps = args.ctrlSteps || 10;
	this.curveDetail = args.curveDetail || 30;
	this.tubesRotation = [0, 0];
	this.tubeGeo = new THREE.Object3D();
	this.latheGeo = new THREE.Object3D();
	this.extraGeo = new THREE.Object3D();
	this.toDrawExtraGeo = [true];
	this.rotator = [];

	this.tubes = [];
	this.lathes = [];
	this.loopFinished = false;

	this.tubeStep = 0;

	this.ctrlCurves = [[],[],[]];

	this.curves = [];

	// this.tree = new TREE();
	this.parent = new THREE.Object3D();
	this.tubeParent = new THREE.Object3D();
	this.lathe = new THREE.Object3D();
	this.tubeParent.rotation.y = pi;
	this.tubeParent.position.y = 15;

	this.tree = new TREE();
};

rainbow.prototype.init = function(){

	while(!this.loopFinished){
		this.update();
	}
};

rainbow.prototype.update = function(redraw,lathe){

	if(typeof lathe!=='undefined')
		lather = lathe;
	else
		lather = true;

	if(redraw){
		this.loopFinished = false;
		this.disposeGeo();
		// this.setCurves();
		this.lerpCurves();
		this.extrudeTube();
		this.colorTube();
		if(this.tubeStep==this.steps)
			this.extrudeSpine();
		this.stepper();
	}
	// if(this.tubeStep==this.steps-1)
	// if(lather)
	// 	this.makeLathe();

	this.rotateTube();
};

rainbow.prototype.stepper = function(){

	this.tubeStep++;

	if(this.tubeStep>this.steps){
		this.tubeStep = 0;
		this.loopFinished = true;
	}
};

rainbow.prototype.extrudeTube = function(params){

	var args = params || {};
	args.curveDetail = args.curveDetail || this.curveDetail;

	var i = this.tubeStep;

	var obj = new THREE.Object3D();
	this.tubes[i] = obj;
	this.tubeParent.add(obj);

	var amt = 2;

	if(this.tubeStep===0 && this.toDrawExtraGeo[0])
		amt = 4;

	var size = 1;

	for(var j = 0 ; j < amt ; j++){

		if(j>1)
			size=1.1;
		if(i==this.curves.length-1)
			size=1.1;
		var tube = new THREE.Mesh(new THREE.TubeGeometry2(new THREE.SplineCurve3(this.curves[i]), args.curveDetail, size, 12), 
			new THREE.MeshLambertMaterial({}));

		// var tube = sphere(1);  //debug
		obj.add(tube);

	}
};

rainbow.prototype.extrudeSpine = function(params){

	if(typeof this.spine !== 'undefined'){
		if(typeof this.spine.parent!=='undefined')
		this.spine.parent.remove(this.spine);
		this.spine.traverse(function (obj) {
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose();
				obj.material.dispose();
			}
		});
		this.spine = new THREE.Object3D();
	}
	else
		this.spine = new THREE.Object3D();

	// console.log(this.spine);

	// var args = params || {};
	// args.curveDetail = args.curveDetail || this.curveDetail;



	this.spineCurve = [[],[]];

	for(var i = 0 ; i < this.curves.length ; i++){
		this.spineCurve[0].push(this.curves[i][this.curves[i].length-1]);
		this.spineCurve[1].push(this.curves[i][0]);
	}


	for(var j = 0 ; j < 2 ; j++){
		// var tube = new THREE.Mesh(new THREE.TubeGeometry2(new THREE.SplineCurve3(s[j]), args.curveDetail),
		// 	new THREE.MeshLambertMaterial({color:this.tubes[this.tubes.length-1].children[0].material.color}));

		for(var i = 0 ; i < this.spineCurve[j].length ; i++){
			var radius = 1;
			if(i==0 && this.toDrawExtraGeo[0])
				radius=1.2
			var sp = new sphere(radius,12,12);
			// console.log(s[j].length,this.tubes.length);
			if(typeof this.tubes[i]!=='undefined')
				sp.material.color = this.tubes[i].children[0].material.color;
			sp.position = this.spineCurve[j][i];
			this.spine.add(sp);
		}
		// this.spine.add(tube);
	}

	this.extraGeo.add(this.spine);
	this.tubeParent.add(this.extraGeo);
};

rainbow.prototype.colorSpine = function(){

	// for(var j = 0 ; j < 2 ; j++){
		var q = 0;
		for(var i = 0 ; i < this.spine.children.length ; i++){
			var col = new THREE.Color(1,1,1);
			if(typeof this.tubes[q]!=='undefined')
				col = this.tubes[q].children[0].material.color;
			this.spine.children[i].material.color = col;
			q++;
			if(q>this.tubes.length-1)
				q=0;
		}
	// }
};

rainbow.prototype.rotateTube = function(){


	for(var i = 0 ; i < this.tubes.length ; i++){

		this.rAmount = THREE.Math.mapLinear(i / this.steps, 0, 1, this.tubesRotation[0], this.tubesRotation[1]);

		this.tubes[i].children[0].rotation.y =  this.rAmount;
		this.tubes[i].children[1].rotation.y = -this.rAmount;

	}
	if(this.toDrawExtraGeo[0]){
		this.tubes[0].children[2].rotation.y =  Math.PI/2;
		this.tubes[0].children[3].rotation.y = -Math.PI/2;
	}
};

rainbow.prototype.colorTube = function(){

	var colors = this.canvases[2].lerpColors;

	var col = new THREE.Color(0,0,0);

	for(var i = 0 ; i < this.tubes.length ; i++){

		if(typeof colors[i]!=='undefined'){
			var c = colors[i];
			var col = new THREE.Color(c[0]/255,c[1]/255,c[2]/255);
		}
		else
			var col = new THREE.Color(0,0,0);

		for(var j = 0 ; j < this.tubes[i].children.length ; j++)
			this.tubes[i].children[j].material.color = col;
	}
	// if(this.lathe)
	// console.log(this.lathe.material);
		if(this.lathe.material)
			this.lathe.material.color = col;
};

rainbow.prototype.makeLathe = function(divs){

	// this.lathe = sphere(3);
	
	var d = divs || 1;

	if(this.tubeStep==0){
		if(typeof this.lathe !== 'undefined'){
			if(typeof this.lathe.parent!=='undefined')
			this.lathe.parent.remove(this.lathe);
			this.lathe.traverse(function (obj) {
				if (obj instanceof THREE.Mesh) {
					obj.geometry.dispose();
					obj.material.dispose();
				}
			});
			this.lathe = null;
		}

		this.rAmount = this.tubesRotation[1];

		var that = this;
		this.lathe = new THREE.Mesh(
			new THREE.ParametricGeometry(
			function(u,v){			
				var mat = new THREE.Matrix4();
				mat.makeRotationY(v*Math.abs(that.rAmount)*2);
				var points = [];
				for(var i = 0 ; i < that.curves[that.curves.length - 1].length ; i++){
					points.push(that.curves[that.curves.length - 1][i].clone());
					points[i].applyMatrix4(mat);
				}
				var curve = new THREE.SplineCurve3(points);
				return curve.getPointAt(u);
			},
			that.curveDetail*d,
			that.curveDetail*d

			),
			new THREE.MeshLambertMaterial({
			side: THREE.DoubleSide,
			// color: col
		}));

		this.lathe.rotation.y = -Math.abs(this.rAmount);
		this.tubeParent.add(this.lathe);
		var extrudeAmount = -1.15;
		// if(this.rAmount<0)
		// 	extrudeAmount= 1;
		this.lathe.material.color = this.tubes[this.tubes.length-1].children[0].material.color;
		this.tree.solidify(this.lathe.geometry,extrudeAmount,that.curveDetail*d,that.curveDetail*d);

		return this.lathe;
	}
};

rainbow.prototype.disposeGeo = function(){

	// console.log(this.tubeStep,'ha');
	// console.log(this.tubeParent);

	if(typeof this.tubes[this.tubeStep] !== 'undefined'){
		this.tubeParent.remove(this.tubes[this.tubeStep])
		this.tubes[this.tubeStep].traverse(function (obj) {
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose();
				obj.material.dispose();
			}
		});
		this.tubes.splice(this.tubeStep,0);
	}

	if(this.tubes.length > this.steps+1){
		for(var i = this.tubes.length-1 ; i > this.steps ; i--){
			this.tubeParent.remove(this.tubes[i])
			if(typeof this.tubes[i]!='undefined'){
				this.tubes[i].traverse(function (obj) {
					if (obj instanceof THREE.Mesh) {
						obj.geometry.dispose();
						obj.material.dispose();
					}
				});
				this.tubes.pop();
			}
		}
		// this.tubeStep = 0;
		this.loopFinished = false;
	}
};

rainbow.prototype.lerpCurves = function () {

 var c1 = new THREE.SplineCurve3(this.ctrlCurves[0]);
 var c2 = new THREE.SplineCurve3(this.ctrlCurves[1]);

 this.curves = [];

	// for (var j = 0; j <= this.steps; j++) {
	// 	var c = [];
	// 	for (var i = 0; i <= this.ctrlSteps*3; i++) {
	// 		var l = c1.getPointAt(exp(i / (this.ctrlSteps*3)));
	// 		var k = c2.getPointAt(exp(i / (this.ctrlSteps*3)));
	// 		l.lerp(k, j / this.steps);
	// 		c.push(l);
	// 	}
	// 	this.curves.push(c);
	// }

	for (var j = 0; j <= this.steps; j++) {
		var c = [];
		for (var i = 0; i < this.ctrlSteps; i++) {
			var l = this.ctrlCurves[0][i].clone();//c1.getPointAt(exp(i / this.ctrlSteps));
			var k = this.ctrlCurves[1][i].clone();//c2.getPointAt(exp(i / this.ctrlSteps));
			l.lerp(k, j / this.steps);
			c.push(l);
		}
		this.curves.push(c);
	}
};

rainbow.prototype.setCurves = function (arr) {

	var array = arr || this.ctrlCurves;
	this.canvases = array;

	var a = array[0];
	var b = array[1];
	var c = array[2];

	for (var i = 0; i < this.ctrlCurves.length; i++) {
		this.ctrlCurves[i] = this.makeRandomCurve((.1 + i) * 20);
	}

	if (a.vectors.length > 0) {
		this.ctrlCurves[1] = [];
		for (var i = 0; i < a.vectors.length; i++) {
			this.ctrlCurves[1][i] = new THREE.Vector3(a.vectors[i].x * .2, a.vectors[i].y * -.2, 0);
		} // console.log(this.ctrlCurves[1]);
	}
	if (b.vectors.length > 0) {

		var diff = (Math.abs(a.vectors[a.vectors.length-1].y-a.vectors[0].y))/2;
		 diff+=a.vectors[0].y;
		// console.log(diff);
		// diff-=a.vectors[0].y;
		this.ctrlCurves[0] = [];
		for (var i = 0; i < b.vectors.length; i++) {
			this.ctrlCurves[0][i] = new THREE.Vector3(b.vectors[i].x * .05, ((b.vectors[i].y * -.05) + diff*-.15), 0);
		} // console.log(this.ctrlCurves[1]);
	}
	// console.log(d.vectors);
	// if (d.vectors.length > 0) {
	// 	d.vectors[d.vectors.length-1].y=150;
	// 	this.ctrlCurves[2] = [];
	// 	var off =  Math.min(a.vectors[0].y,a.vectors[a.vectors.length-1].y);
	// 	for (var i = 0; i < d.vectors.length; i++) {
	// 		this.ctrlCurves[2][i] = new THREE.Vector3(d.vectors[i].x * .1, -off*.1+ 12 +((d.vectors[i].y * -.1) ), 0);

	// 	} // console.log(this.ctrlCurves[1]);
	// }
};

rainbow.prototype.makeRandomCurve = function (off, amount) {

	var o = off || 0;
	var amt = amount || 10;

	var c = [];

	for (var i = 0; i <= amt; i++) {
		var x = Math.sin((i / amt) * pi * 2); //*Math.random();
		var y = Math.cos((i / amt) * pi * 2); //+noise(i*3.1);
		c.push(new THREE.Vector3(x * o, y * o, 0));
	}

	return c;
};

function exp(t){
	return t*t;
}

function cloneArray(a){
	var b = [];
	for(var i = 0 ; i < a.length ; i++){
		b[i] = a[i];
	}
	return b;
}

function isDef(t){
	return typeof t !== 'undefined';
}

function makeShader(){

	tex = THREE.ImageUtils.loadTexture('assets/textures/superBlurry.jpg');

	var vertRT2 = "\
	    varying vec2 vUv;\
	    varying vec3 vNormal;\
	    uniform sampler2D tDiffuse;\
	    uniform vec3 camPos;\
	    void main() {\
	    	vNormal = (normal+normalize(camPos*-1.)).xyz;\
	        vUv = uv;\
	        float offset = texture2D(tDiffuse, vUv).x;\
	        gl_Position = projectionMatrix * modelViewMatrix * vec4( vec3(position.x,position.y,position.z + offset*.00), 1.0 );\
	    }\
	";

	var fragRT2="\
	    varying vec2 vUv;\
	    uniform sampler2D tDiffuse;\
	    varying vec3 vNormal;\
	   	uniform vec3 camPos;\
	    void main() {\
	        float offset = texture2D(tDiffuse, vUv).x;\
	        vec4 col = texture2D(tDiffuse, vNormal.xy);\
	        gl_FragColor = vec4(vec3(vNormal.x),1.0);\
	    }\
	";

	

	return new THREE.ShaderMaterial( {
	    uniforms: { tDiffuse: { type: "t", value: tex },
	    			color: { type: "c", value: new THREE.Color(0x5599ee) },
					camPos : { type: "v3", value: new THREE.Vector3( 0, 1, 2 ) },  
	    			 },
	    vertexShader: vertRT2,
	    fragmentShader: fragRT2,
	    // depthWrite: false
	} );
}