// data = {};
pData = {};
// R={};
// 
			

sc1 = {

	setup: function () {

		shaders = [];

		sliderDataIsChanged = false;

		worked = {blah:'blah'};

		worker = new Worker('sketches/worker.js');

		worker.addEventListener('message', function(e) {
		  	worked = e.data;
		  	// console.log(worked);
		}, false);

		// worker.postMessage('Hello World'); // Send data to our worker.

		
		material = new THREE.MeshLambertMaterial();
	

		colors = [];

		canvases = [];

		canvases.push(new CUI('myCanvas',{setVec:[0,35,0,17,17,0,56,1,0,95,12,0,112,51,0,102,87,0,86,116,0,56,144,0,22,143,0,0,127,0]}));
		canvases.push(new CUI('myCanvas2',{setVec:[0,55,0,13,29,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,50,99,0,17,117,0,0,135,0]}));
		canvases.push(new CUI('myCanvas3',{setVec:[20,20,0,130,130,0]}));

		// console.log(b);
		colorSlider = $( "#slider" ).slider({
			range: false,
			step:.01,
			value:20,
		});


		sliders = [];

		for(var i = 0 ; i < 3 ; i++){
			$("#sliders").append("\
				<div style='width:110px;position:relative'>\
			<div class='mine'></div>\
				<div id='slider" + i + "'></div>\
			<div id = 'text"+i+"' style='position:relative;margin-left:120px;margin-top:-1.5em;font-size:.4em'> hidf:"+i+"</div>\
			</div><div style='margin-top:.4em'>\
			");

			var val = 80;

			if(i==0)
				val = 90;
			if(i==1)
				val = 50;

			if(i==2)
				val = 20;

			sliders[i]=$( "#slider"+i ).slider({
				range: false,
				step:.01,
				value:val,
				// values: [ 17 ]
			});
		}

		$( "#tabs" ).tabs();

		$( "#accordion" ).accordion({
			collapsible: true,
			heightStyle: "content",
			active: false,
			animate: 50
		});


		sliderData = checkSlider();
		pSliderData = checkSlider();

		animater();

		R = new rainbow();
		R.randomCurves();
		R.lerpCurves();
		R.makeTube();
		scene.add(R.tubeParent);
		data.var4=.5;
		data.var2 = Math.random();
		data.var3 = Math.random();

		frameRate = 1;

		highres = true;

	
		
		

 },

	draw: function (time) {

		// console.log(sliders.slider("value"));
		// console.log(shaders);

		for(var i = 0 ; i < shaders.length ; i++){
			shaders[i].uniforms["camPos"].value = controls.object.position;
		}

		R.steps = Math.round(5+(sliderData[2]/5));//Math.round((data.var6+1)*10);
		steps = R.steps;

		sliderData = checkSlider();

		sliderDataIsChanged = compareObj(pSliderData,sliderData);

		if(typeof canvases!=='undefined'){

			if(typeof colorCanvas !== 'undefined')
				colorCanvas.update();

			if(canvases[0].staticDrawing() || !sliderDataIsChanged || sliderMove){
				// console.log('hi');
				R.randomCurves();
				R.lerpCurves();
				R.tubesRotation[0] = ((sliderData[1]-50)/50) * Math.PI;
				R.tubesRotation[1] = ((sliderData[0]-50)/50) * Math.PI;
				R.makeTube({curveDetail:10});
				highres = true;
				// console.log(((sliderData[1]-50)/50));
			}
			else if(highres){
				R.randomCurves();
				R.lerpCurves();
				R.tubesRotation[1] = ((sliderData[0]-50)/50) * pi * 2;
				R.makeTube({curveDetail:50});
				highres = false;
			}

		}

		for(k in data){
			pData[k] = data[k];
		}

		pSliderData = cloneArray(sliderData);


		// console.log(sliderData);
		// if (varR) {
		//   vectors = [];
		//   varR = false;
		// }
	}
};


function checkSlider(){
	sl = [];
	for(var i = 0 ; i < sliders.length ; i++){
		var s = sliders[i];
		var val = ".";
		if(i==0)
			val = "outer rotation"
		if(i==1)
			val = "inner rotation"
		if(i==2)
			val = "steps"
		setSpan("text"+i,val);
		sl.push(s.slider("value"));
	}
	return sl;
}

function animater(){

	if(typeof first === 'undefined')
		first = true;

	if(typeof pValue == 'undefined')
		pValue = colorSlider.slider("value");

	sliderMove = false;

	if(pValue!==colorSlider.slider("value"))
		sliderMove = true;


	if(canvases[0].staticDrawing() || first || !sliderDataIsChanged || sliderMove){
		for(var i = 0 ; i < canvases.length ; i++){

			if(i==2){
				canvases[i].colorSteps =  5+(sliderData[2]/5);//Math.round((data.var6+1)*10) ;
				canvases[i].paintColors(colorSlider.slider("value")*.001);
				colors = canvases[i].lerpColor();
			}
			else{
				canvases[i].background("#99ccff");
				canvases[i].pinEdges();
			}

			canvases[i].drawVectors();

		}
		first = false;
	}

	pValue = colorSlider.slider("value");

	requestAnimationFrame(animater);
};

var compareObj = function(a,b){

	var returner = true;

	for(var k in a){
		if(b[k]!=a[k])
			returner = false;
	}

	return returner;
}

var rainbow = function (params) {

	args = params || {};

	// this.curveDetail = args.curveDetail || 1000;

	this.steps = args.steps || 10;
	this.ctrlSteps = args.ctrlSteps || 10;
	this.curveDetail = args.curveDetail || 10;
	this.tubesRotation = [0, 0];

	this.ctrlCurves = [
	[],
	[],
	[]
	];

	this.curves = [];

	// this.tree = new TREE();
	this.parent = new THREE.Object3D();
	this.tubeParent = new THREE.Object3D();
	this.tubeParent.rotation.y = pi;
	this.tubeParent.position.y = 15;
};

rainbow.prototype.makeTube = function (params) {

	var args = params || {};

	args.curveDetail = args.curveDetail || this.curveDetail;


	if (this.tubeGeo) {
		this.tubeParent.remove(this.tubeGeo);
		this.tubeGeo.traverse(function (obj) {
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose();
				obj.material.dispose();
			}
		});
	}

	this.tubeGeo = new THREE.Object3D();

 // for(var i = 0 ; i < 100 ; i ++){
 //     sp = sphere(1);
 //     sp.position.x = sin(i+count*.01)*100;
 //     sp.position.y = cos(i+count*.01)*100;
 //     this.tubeGeo.add(sp);
 // }

 // console.log(this.tubeGeo);

 // var a = [];
 // a.push(this.curves);
 // var tubes = [];
 // 
	
	var colors = canvases[2].lerpColors;

	for (var i = 0; i < this.curves.length; i++) {

		var rAmount = THREE.Math.mapLinear(i / this.steps, 0, 1, this.tubesRotation[0], this.tubesRotation[1]);
		var mat = new THREE.Matrix4();
		var mat2 = new THREE.Matrix4();

		// console.log(rAmount);
		mat.makeRotationY(rAmount);
		mat2.makeScale(1, 1, -1);

		for (var j in this.curves[i]) {
			this.curves[i][j].applyMatrix4(mat);
		}
		// console.log(colors);
		if(typeof colors !== 'undefined'){
			if(colors.length>0){
				
				if(typeof colors[i]!=='undefined')
					// if(typeof colors[i][0]!=='undefined')
						var col = new THREE.Color(colors[i][0]/255,colors[i][1]/255,colors[i][2]/255);
				// console.log(colors[i]);
			}
		}
		else
			var col = new THREE.Color(1,1,1);

		// console.log(col);
		// col.setHSL(noise(data.var3+data.var2*10*(i/this.curves.length)),.7+((Math.sin((i/this.curves.length)*Math.PI*2)+1)/4),.6);
		
		var shader = makeShader();
		shaders.push(shader);

		var tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.SplineCurve3(this.curves[i]), args.curveDetail), 
			new THREE.MeshLambertMaterial({
				color: col
			})
			// shader
			);

		// var tube = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial());

		// if(typeof worker !== 'undefined'){

		// 	worker.postMessage({
		// 		curves: this.curves[i],
		// 		detail: this.curveDetail,
		// 		color: col
		// 	});

		// 	if(typeof worked.data !== 'undefined'){
		// 		tube.geometry.vertices = cloneArray(worked.data.tube.geometry.vertices);
		// 		tube.geometry.faces = cloneArray(worked.data.tube.geometry.faces);
		// 	}

		// 	// console.log(worked);
		// }

		// if(typeof worked.data !== 'undefined'){
			
		// }

		// console.log(tube);
		// for(var i = 0 ; i < 8 ; i++){
		//     var v = tube.geometry.vertices[i];
		//     tube.geometry.vertices.push(new THREE.Vector3(v.x,v.y,v.z));
		//     tube.geometry.faces.push(new THREE.Face3( a, b, c, normal, color, materialIndex ));
		// }
		for (var j in this.curves[i]) {
			this.curves[i][j].applyMatrix4(mat2);
		}
		var tube2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.SplineCurve3(this.curves[i]), args.curveDetail), new THREE.MeshLambertMaterial({
			color: col
		}));

		// tube2 = tube.clone();
		// tube.rotation.y = THREE.Math.mapLinear(i/this.curves.length,0,1,this.tubesRotation[0],this.tubesRotation[1]);
		// tube2.rotation.y = THREE.Math.mapLinear(i/this.curves.length,0,1,this.tubesRotation[0],-this.tubesRotation[1]);
		
		this.tubeGeo.add(tube);
		this.tubeGeo.add(tube2);

		if(this.tubesRotation[0]<Math.PI/2){
			if(i==0){
				var t = tube.clone();
				t.rotation.y=Math.PI/2-this.tubesRotation[0];
				this.tubeGeo.add(t);
				var t = tube.clone();
				t.rotation.y=-Math.PI/2-this.tubesRotation[0];
				this.tubeGeo.add(t);
			}
		}
	}

	

	// if(d.vectors.length>0){
	// 	var tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.SplineCurve3(this.ctrlCurves[2]), args.curveDetail,1.2), new THREE.MeshLambertMaterial({
	// 			color: Math.sin(i + data.var2) * 0xffffff
	// 		}));
	// 	tube.rotation.y=Math.PI/2;
	// 	var tube2 = tube.clone();
	// 	tube2.rotation.y=-Math.PI/2;
	// 	this.tubeGeo.add(tube2);
	// 	this.tubeGeo.add(tube);
	// }

	var zCurve = [];

	// var mat = new THREE.Matrix4();
	// mat.makeRotationX(pi);

	// var latheCurve = new THREE.SplineCurve3(this.curves[this.curves.length - 1]);
	// var lcp = [];
	// for (var i = 0; i < args.curveDetail + 1; i++) {
	// 	lcp.push(latheCurve.getPointAt(i / args.curveDetail));
	// }

	// for (var i = 0; i < lcp.length; i++) {
	// 	var v = lcp[i];
	// 	v.applyMatrix4(mat);
	// 	zCurve.push(v);

	// }

	// var lathe = new THREE.Mesh(
	// new THREE.LatheGeometry(zCurve, 30, 0, this.tubesRotation[1] * 1.8),
	// new THREE.MeshLambertMaterial({
	// 	side: THREE.DoubleSide,
	// 	color: Math.sin(i + data.var3) * 0xffffff
	// }));
	// // lathe.rotation.z=-this.tubesRotation[1]*.9;
	// lathe.rotation.x = -pi;
	// 
	// var col = new THREE.Color();
	// 	col.setHSL(noise(sliderData[0]+sliderData[1]*10*(this.curves.length-1/this.curves.length)),1,.6);

	var that = this;
	var lathe = new THREE.Mesh(
	new THREE.ParametricGeometry(
		function(u,v){			
			var mat = new THREE.Matrix4();
			mat.makeRotationY(v*((sliderData[0]-50)/50)*Math.PI*2);
			var points = [];//that.curves[that.curves.length - 1];
			for(var i = 0 ; i < that.curves[that.curves.length - 1].length ; i++){
				points.push(that.curves[that.curves.length - 1][i].clone());
				points[i].applyMatrix4(mat);
			}
			var curve = new THREE.SplineCurve3(points);
			return curve.getPointAt(u);
		},
		args.curveDetail,
		args.curveDetail

		),
	new THREE.MeshLambertMaterial({
		side: THREE.DoubleSide,
		color: col
	}));

	latheO = lathe.clone();
	for(var i = 0 ; i < latheO.geometry.faces.length ; i++){
		if(((sliderData[0]-50)/100)>0){
			latheO.geometry.vertices[latheO.geometry.faces[i].a].add(latheO.geometry.faces[i].normal.multiplyScalar(.5));
			latheO.geometry.vertices[latheO.geometry.faces[i].b].add(latheO.geometry.faces[i].normal.multiplyScalar(.5));
			latheO.geometry.vertices[latheO.geometry.faces[i].c].add(latheO.geometry.faces[i].normal.multiplyScalar(.5));
		}
		else{
			latheO.geometry.vertices[latheO.geometry.faces[i].a].sub(latheO.geometry.faces[i].normal.multiplyScalar(.5));
			latheO.geometry.vertices[latheO.geometry.faces[i].b].sub(latheO.geometry.faces[i].normal.multiplyScalar(.5));
			latheO.geometry.vertices[latheO.geometry.faces[i].c].sub(latheO.geometry.faces[i].normal.multiplyScalar(.5));
		}

	}
	// 
	// console.log(lathe);


	this.tubeGeo.add(lathe);
	this.tubeGeo.add(latheO);


	// var lathe = new THREE.Mesh(
	// new THREE.ParametricGeometry(


	// 	function(u,v){

			
	// 		var mat = new THREE.Matrix4();
	// 		mat.makeRotationY(v*data.var4*Math.PI*1.8);
	// 		var points = [];//that.curves[that.curves.length - 1];
	// 		for(var i = 0 ; i < that.curves[that.curves.length - 1].length ; i++){
	// 			points.push(that.curves[that.curves.length - 1][i].clone());
	// 			points[i].applyMatrix4(mat);
	// 		}
	// 		var curve = new THREE.SplineCurve3(points);
	// 		var c1 = curve.getPointAt(u);
	// 		if(u>0)
	// 			var c2 = curve.getPointAt(u-.001);
	// 		else
	// 			var c2 = curve.getPointAt(u);

	// 		var c3 = c1.cross(c2);

	// 		return curve.getPointAt(u).add(c3);
	// 	},
	// 	20,
	// 	20

	// 	),
	// new THREE.MeshLambertMaterial({
	// 	side: THREE.DoubleSide,
	// 	color: Math.sin(i + data.var3) * 0xffffff
	// }));

	// tree = new TREE();
	// tree.solidify(lathe.geometry,-1);

	
	// var mat = new THREE.MeshLambertMaterial(  );

	// for(var i = 0 ; i < tubes.children.length ; i++){
	//     var tTube = new THREE.Mesh(tubes.children[i].geometry,mat);
	//     tTube.rotation.y = THREE.Math.mapLinear(i/tubes.children.length,0,1,this.tubesRotation[0],this.tubesRotation[1]);
	//     this.tubeGeo.add(tTube);
	// }

	this.tubeGeo.traverse(function (obj) {
		if (obj instanceof THREE.Mesh) {
			obj.geometry.dispose();
			obj.material.dispose();
		}
	});

	tubes = null;
	// mat.dispose();

	this.tubeParent.add(this.tubeGeo);
};

rainbow.prototype.lerpCurves = function () {

 var c1 = new THREE.SplineCurve3(this.ctrlCurves[0]);
 var c2 = new THREE.SplineCurve3(this.ctrlCurves[1]);

 this.curves = [];

	for (var j = 0; j <= this.steps; j++) {
		var c = [];
		for (var i = 0; i <= this.ctrlSteps; i++) {
			var l = c1.getPointAt(exp(i / this.ctrlSteps));
			var k = c2.getPointAt(exp(i / this.ctrlSteps));
			l.lerp(k, j / this.steps);
			c.push(l);
		}
		this.curves.push(c);
	}
};

rainbow.prototype.randomCurves = function () {

	var a = canvases[0];
	var b = canvases[1];
	var c = canvases[2];

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