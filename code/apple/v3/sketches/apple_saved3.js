pData = {};	
outputScale = 4;

sc1 = {

	setup: function () {

		shaders = [];
		colors = [];
		canvases = [];
		material = new THREE.MeshLambertMaterial();

		frameRate = 1;
		highres = true;	
		setupDone = true;

		sliderDataIsChanged = false;

		/** web workers
		worked = {blah:'blah'};

		worker = new Worker('sketches/worker.js');

		worker.addEventListener('message', function(e) {
		  	worked = e.data;
		  	// console.log(worked);
		}, false);

		// worker.postMessage('Hello World'); // Send data to our worker.

		*/
	
		canvases.push(new CUI('myCanvas',{lineWidth:20,setVec:[0, 35, 0, 16.38352394104004, 14.90057373046875, 0, 54.38352394104004, 0.90057373046875, 0, 98.38352394104004, 11.90057373046875, 0, 117.38352394104004, 47.90057373046875, 0, 109.38352394104004, 83.90057373046875, 0, 82.38352394104004, 116.90057373046875, 0, 56, 144, 0, 22, 143, 0, 0, 127, 0]}));
		// canvases.push(new CUI('myCanvas',{setVec:[0,35,0,17,17,0,56,1,0,95,12,0,112,51,0,102,87,0,86,116,0,56,144,0,22,143,0,0,127,0]}));
		canvases.push(new CUI('myCanvas2',{lineWidth:20,setVec:[0,55,0,13,29,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,50,99,0,17,117,0,0,135,0]}));
		canvases.push(new CUI('myCanvas3',{lineWidth:3,setVec:[20,20,0,130,130,0],ctrlAmount:2}));

		colorSlider = $( "#slider" ).slider({
			range: false,
			step:.01,
			value:20,
		});
		// colorSlider = $( "#slider" ).slider({
		// 	range: false,
		// 	step:.01,
		// 	value:20,
		// });

		// $( "#speed" ).selectmenu();
		// $( "#speed" ).change = function(event,ui) {console.log(event);console.log(ui);}

		// $( "#ss" ).selectmenu({
		//   // change: setOuterShape()
		// });

		// $( "#slider" ).mouseleave(function() {
		//   console.log('hoihoihoih');
		// });

		mouseLeft = false;
		sliders = [];

		for(var i = 0 ; i < 4 ; i++){
			if(i<3){
				$("#sliders").append("\
					<div style='width:110px;position:relative'>\
				<div class='mine'></div>\
					<div id='slider" + i + "'></div>\
				<div id = 'text"+i+"' style='position:relative;margin-left:120px;margin-top:-1.5em;font-size:.4em'> hidf:"+i+"</div>\
				</div><div style='margin-top:.4em'>\
				");
			}

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
			sliders[i].mouseleave(function() {
			  mouseLeft = true;
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

		console.log(sliderData);

		animater();

		R = new rainbow();
		// R.setCurves(canvases);
		// R.tubesRotation[0] = ((sliderData[1]-50)/50) * Math.PI;
		// R.tubesRotation[1] = ((sliderData[0]-50)/50) * Math.PI;
		// R.init();
		// R.lerpCurves();
		// R.makeTube();
		scene.add(R.tubeParent);
		// scene.add(R.lathe);
		// scene.add(R.extraGeo);
		// scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff00ff})));
		// var b = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff00}));
		// scene.add(b);
		// b.scale.x = 12;
		// b.scale.y=12;
		// b.scale.z = 12;
		// b.position.x=3;

		data.var4=.5;
		data.var2 = Math.random();
		data.var3 = Math.random();


 },

	draw: function (time) {

		var sliderMoveFromAnim = animater();

		for(var i = 0 ; i < shaders.length ; i++){
			shaders[i].uniforms["camPos"].value = controls.object.position;
		}

		if(typeof pValue == 'undefined')
			pValue = [0];

		
		sliderMove = false;

		// console.log(mouseLeft);

		// if(pValue[0]!==colorSlider.slider("value"))
		// 	sliderMove = true;

		// console.log(pValue);

		// pValue.push(colorSlider.slider("value")+0);
		// console.log(canvases[0].mouseOut);
		// scene.add(R.lathe);
		R.steps = Math.round(7+(sliderData[2]/3));//Math.round((data.var6+1)*10);
		steps = R.steps;

		if(typeof pSliderDatas == 'undefined')
			pSliderDatas = [];

		sliderData = checkSlider();

		if(pSliderDatas.length==0)
			pSliderDatas.push(sliderData);

		sliderDataIsChanged = compareObj(pSliderData,pSliderDatas[0]);

	

		// console.log(pValue[0],colorSlider.slider("value"));
	// console.log(sliderMove);

		if(typeof canvases!=='undefined'){

			if(typeof colorCanvas !== 'undefined')
				colorCanvas.update();



			// console.log(canvases[1]._drawLine);
// console.log(canvases[0]._drawLine , canvases[1]._drawLine , pSliderData[2]!=sliderData[2] ,  !R.loopFinished);
			if( canvases[0]._drawLine || canvases[1]._drawLine || pSliderData[2]!=sliderData[2] ||  !R.loopFinished || R.curveDetail<100){
				// R.loopFinished = false;
				// console.log('hi');
				// if(!R.loopFinished){
					R.setCurves(canvases);
					// R.randomCurves();
					// R.lerpCurves();
					R.tubesRotation[0] = ((sliderData[1]-50)/50) * Math.PI;
					R.tubesRotation[1] = ((sliderData[0]-50)/50) * Math.PI;
					// R.makeTube({curveDetail:30});
					
					if(canvases[0]._drawLine || canvases[1]._drawLine || pSliderData[2]!=sliderData[2] ){
						if(R.tubeStep<R.steps-2)
							R.curveDetail = 10;
						else
							R.curveDetail = 30;
					}
					else if(R.curveDetail<100){
						R.tubeStep=0;
						R.curveDetail = 100;
					}

					if(R.loopFinished)
						highres = true;
					

					if(pSliderData[2]!=sliderData[2]){

						R.tubeStep = 0;
						while(!R.loopFinished){
							R.update(true);
						}
					}
					R.update(true);
					// console.log(R.tubeStep,R.steps);

					// if(R.tubeStep == R.steps){
					// 	console.log('doit')
					// 			scene.add(R.lathe);
					// if(pSliderData[1]!=sliderData[1])
					
					R.makeLathe();

					// if(canvases[0].mouseOut = true)
					// 	mouseLeft = true;
					// else
					// 	mouseLeft = false;

					// }

					// console.log(R.lathe);
				// }
				// console.log(((sliderData[1]-50)/50));
			}
			else if( pSliderData[0]!=sliderData[0] || pSliderDatas[1]!=sliderData[1]){
				// R.loopFinished = false;
				// console.log('hi');
				// if(!R.loopFinished){
					// R.setCurves(canvases);
					// R.randomCurves();
					// R.lerpCurves();
					// R.curveDetail = 30;
					R.tubesRotation[0] = ((sliderData[1]-50)/50) * Math.PI;
					R.tubesRotation[1] = ((sliderData[0]-50)/50) * Math.PI;
					// R.makeTube({curveDetail:30});
					
					if(pSliderData[0]!=sliderData[0]){
						R.curveDetail = 10;
						R.makeLathe();
						// highres=false
					// 	console.log('hoi')
					}
					// else
					R.curveDetail = 100;
					R.rotateTube();
					highres = true;

					// console.log(pSliderDatas[0][1],sliderData[1]);
					// R.curveDetail = 30;
					// if(pSliderDatas[0][1]!==sliderData[1])
					// 	R.update(false,true);
					// else
					// 	R.update(false,false);

				// }
				// console.log(((sliderData[1]-50)/50));
			}
			else if(canvases[0].staticDrawing() || sliderMoveFromAnim || pSliderData[3]!=sliderData[3]){
					highres=false;
					R.colorTube();
					R.colorSpine();
			}
			else if(highres && mouseLeft){

													// console.log('bl')
					// if(R.curveDetail<100){
						R.loopFinished = false;
						R.curveDetail=100;
						// while(!R.loopFinished){
							// R.update(true);
						// }
						highres = true;
						R.lathe = makeHighRes(R);
						R.loopFinished = true;
					// }
					// else{
						R.highres = false;
						mouseLeft = false;
					// }



				// while(!R.loopFinished){
				// 	R.randomCurves();
				// 	R.lerpCurves();
				// 	R.tubesRotation[1] = ((sliderData[0]-50)/50) * pi * 2;
				// 	R.makeTube({curveDetail:80});
				// 	highres = false;
				// }
			}

		}

		for(k in data){
			pData[k] = data[k];
		}

		// mouseLeft=false;

		pSliderData = cloneArray(sliderData);
		pSliderDatas.push(pSliderData);

		if(pSliderDatas.length>10)
			pSliderDatas.shift();

		if(typeof firstLoop === 'undefined'){
			readData( {"canvases":[[0,35,0,16.38352394104004,14.90057373046875,0,54.38352394104004,0.90057373046875,0,95.28125,11.5,0,119.28125,45.5,0,112.28125,85.5,0,82.38352394104004,116.90057373046875,0,56,144,0,22,143,0,0,127,0],[0,55,0,13,29,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,50,99,0,17,117,0,0,135,0],[119.28125,107.1875,0,97.28125,17.1875,0]],"sliders":[90,50,20,20],"toDrawExtraGeo":[true]});
			firstLoop=false;
		}
	}
};

function makeHighRes(R,val) {

    function doChunk(R,val) {
    	var v = val || 1;
    	R.curveDetail=40;
  		var t = R.makeLathe(val);
  		R.curveDetail = 100;
  		// console.log(t);
        return t;

    }

    return doChunk(R,val);    
};

function checkSlider(){
	sl = [];
	for(var i = 0 ; i < sliders.length ; i++){
		var s = sliders[i];
		// var val = ".";
		// if(i==0)
		// 	val = "outer rotation"
		// if(i==1)
		// 	val = "inner rotation"
		// if(i==2)
		// 	val = "steps"
		// if(i<3)
		// setSpan("text"+i,val);
		sl.push(s.slider("value"));
	}
	return sl;
};

function animater(){

	if(typeof first === 'undefined'){
		first = true;
	}

	if(typeof pValue == 'undefined')
		pValue = colorSlider.slider("value");

	sliderMove = false;

	if(pValue!==colorSlider.slider("value"))
		sliderMove = true;

	if(canvases[0].staticDrawing() || first || !sliderDataIsChanged || sliderMove){
		for(var i = 0 ; i < canvases.length ; i++){

			if(i==2){
				canvases[i].colorSteps =  Math.round(7+(sliderData[2]/3));//Math.round((data.var6+1)*10) ;
				canvases[i].paintColors(colorSlider.slider("value")*.001,sliders[3].slider("value"));
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

	return sliderMove;
	// requestAnimationFrame(animater);
};

var compareObj = function(a,b){

	var returner = true;

	for(var k in a){
		if(b[k]!=a[k])
			returner = false;
	}

	return returner;
};

function upResAndSave(name,toSave){

	var saveMe = toSave?true:false;

	R.tubeStep = 0;
	R.loopFinished = false;
	R.curveDetail = 120;

	while(!R.loopFinished){
		R.update(true);
	};
	R.makeLathe(2);

	if(!saveMe)
		saverX3D(name);
};

function saverX3D(name) {

	var scaleOut = 4;//outputScale || 1;

	var name = name || "tree.x3d";

	var mshArray = [];

	var returnerArray = [];

	scene.updateMatrixWorld();

	scene.traverse(function(obj){
		if(obj.geometry){
			if(obj.parent)
				obj.parent.updateMatrixWorld();
			obj.updateMatrixWorld();
			if(obj.geometry.vertices.length>0){
				returnerArray.push(obj);
			}
		}
	});

	mshArray = returnerArray;

	// alert("saving!");
	var j = 0;

	var outputVecs = "";
	var outputFaces = "";
	var outputColors = "";

	// console.log(mshArray);
	
	for (var i = 0 ; i < mshArray.length ; i++){
		
		// if(i == mshArray.length-2 || i == mshArray.length-3) i++;
		// else{
			var getInfo = THREE.saveGeometryToX3D(mshArray[i],j,(.0003*scaleOut));
			// console.log(getInfo);
			outputVecs += getInfo[0];
			outputFaces += getInfo[1];
			outputColors += getInfo[2];
			j += mshArray[i].geometry.vertices.length;
		// }
	}

	var output = [
	'<?xml version=\"1.0\" encoding=\"UTF-8\"?>',
	'<!DOCTYPE X3D PUBLIC \"ISO//Web3D//DTD X3D 3.1//EN\" \"http://www.web3d.org/specifications/x3d-3.1.dtd\">',
	'<X3D profile=\"Immersive\" version=\"3.1\" xsd:noNamespaceSchemaLocation=\"http://www.web3d.org/specifications/x3d-3.1.xsd\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema-instance\">',
	 '<head>',
	  '<meta content=\"fruited.x3d\" name=\"title\"/>',
	  '<meta content=\"Generated from Meshlab X3D Exported\" name=\"description\"/>',
	  '<meta content=\"7 December 2014\" name=\"created\"/>',
	  '<meta content=\"Made by Idle Hands, http://www.dlobser.com\" name=\"fruited\"/>',
	' </head>',
	' <Scene>',
	'  <Shape>',
	'   <IndexedFaceSet coordIndex=\"'+outputFaces+'\" colorPerVertex=\"false\" solid=\"false\" normalPerVertex=\"false\">',
	    '<Coordinate point=\"'+outputVecs+'\"/>',
	    '<ColorRGBA color=\"'+outputColors+'\"/>',
	   '</IndexedFaceSet>',
	  '</Shape>',
	 '</Scene>',
	'</X3D>',
	].join("\n");


	
	output.replace("undefined","");
	// document.write(output);
	// console.log(output);
	// alert("saved!");
	var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
	saveAs(blob, name);
}

THREE.saveGeometryToX3D = function (geo,nums,scalar) {

	geo.updateMatrixWorld();

	var num = parseInt(nums);

	var s = [];

	s[0]=""; //verts
	s[1]=""; //faces
	s[2]=""; //colors

	for (i = 0; i < geo.geometry.vertices.length; i++) {

		var vector = new THREE.Vector3( geo.geometry.vertices[i].x, geo.geometry.vertices[i].y, geo.geometry.vertices[i].z );
		
		geo.matrixWorld.multiplyVector3( vector );
		vector.multiplyScalar(scalar);
		//vector.applyProjection( matrix )
		
		s[0]+= ' '+(vector.x) + ' ' +
		vector.y + ' '+
		vector.z + ' ';

		
	}

	for (i = 0; i < geo.geometry.faces.length; i++) {

		s[2]+=geo.material.color.r + ' ' + 
		geo.material.color.g + ' ' + 
		geo.material.color.b + ' 1 ';

		s[1]+= (geo.geometry.faces[i].a+num) + ' ' +
		(geo.geometry.faces[i].b+num) + ' '+
		(geo.geometry.faces[i].c+num);

		// if (geo.geometry.faces[i].d!==undefined) {
		// 	s+= ' '+ (geo.geometry.faces[i].d+1+num);
		// }
		s[1]+= ' -1 ';
	}
	// console.log(s);
	return s;
}

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

function drawCenterShape(){
	R.toDrawExtraGeo[0] = !R.toDrawExtraGeo[0];
	R.loopFinished = false;
	R.tubeStep = 0 ;
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

function writeData(){

	var canvases = [];

	for(var j = 0 ; j < R.canvases.length ; j++){
		var r = []; 
		for(var i = 0 ; i < R.canvases[j].ctrls.length ; i++){
			r.push(R.canvases[j].ctrls[i].x);
			r.push(R.canvases[j].ctrls[i].y);
			r.push(R.canvases[j].ctrls[i].z);
		}
		if(j<2)
		r = scaleDown(r);
		canvases.push(r);

	}

	var sl = checkSlider();

	sl.push(colorSlider.slider("value"));

	tob = {
		canvases:canvases,
		sliders:sl,
		toDrawExtraGeo:[R.toDrawExtraGeo[0]]
	};

	ob = JSON.stringify(tob);
	console.log(ob);


}

function readData(st){

	var bob = st || JSON.parse(ob);

	for(var i = 0 ; i < R.canvases.length ; i++){
		R.canvases[i].setCtrls(bob.canvases[i]);
	}

	for(var i = 0 ; i < sliders.length ; i++){
		sliders[i].slider("value",bob.sliders[i]);
	}

	colorSlider.slider("value",bob.sliders[4]);

	R.toDrawExtraGeo[0] = bob.toDrawExtraGeo[0];
	updateCanvases();
	
	R.loopFinished = false;
	R.tubeStep = 0;

}

function setOuterShape(st){


	var options = document.getElementById('selectOuter').options;
		
	switch(options.selectedIndex){
		case 0:
			R.canvases[0].setCtrls([0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0]);
			break;
		case 1:
			R.canvases[0].setCtrls([0, 0, 0, 25, 4, 0, 48, 17, 0, 65, 37, 0, 73, 62, 0, 73, 88, 0, 65, 112, 0, 48, 132, 0, 25, 145, 0, 0, 150, 0]);
			break;
		case 2:
			R.canvases[0].setCtrls([0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0]);
			break;
		case 3:
			R.canvases[0].setCtrls([0,35,0,16.38352394104004,14.90057373046875,0,54.38352394104004,0.90057373046875,0,95.28125,11.5,0,119.28125,45.5,0,112.28125,85.5,0,82.38352394104004,116.90057373046875,0,56,144,0,22,143,0,0,127,0]);
			break;
		case 4:
			R.canvases[0].setCtrls([0,36.5,0,15.28125,21.5,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,44.28125,112.5,0,8.28125,132.5,0,0,114.5,0]);
			break;
		case 5:
			R.canvases[0].setCtrls([0, 75, 0, 17, 26, 0, 62, 1, 0, 112, 10, 0, 145, 49, 0, 145, 100, 0, 112, 140, 0, 62, 148, 0, 17, 123, 0, 0, 75, 0]);
			break;
		default:
			R.canvases[0].setCtrls([0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0]);
	}
	
	updateCanvases();
	R.loopFinished = false;
	R.tubeStep = 0;

}


function setInnerShape(st){


	var options = document.getElementById('selectInner').options;
		
	switch(options.selectedIndex){
		case 0:
			R.canvases[1].setCtrls([0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0]);
			break;
		case 1:
			R.canvases[1].setCtrls([0, 7.5, 0, 22.5, 11.1, 0, 43.2, 22.8, 0, 58.5, 40.800000000000004, 0, 65.7, 63.300000000000004, 0, 65.7, 86.7, 0, 58.5, 108.3, 0, 43.2, 126.3, 0, 22.5, 138, 0, 0, 142.5, 0]);
			break;
		case 2:
			R.canvases[1].setCtrls([0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0]);
			break;
		case 3:
			R.canvases[1].setCtrls([0,35,0,16.38352394104004,14.90057373046875,0,54.38352394104004,0.90057373046875,0,95.28125,11.5,0,119.28125,45.5,0,112.28125,85.5,0,82.38352394104004,116.90057373046875,0,56,144,0,22,143,0,0,127,0]);
			break;
		case 4:
			R.canvases[1].setCtrls([0,55,0,13,29,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,50,99,0,17,117,0,0,135,0]);
			break;
		case 5:
			R.canvases[1].setCtrls([0, 75, 0, 17, 26, 0, 62, 1, 0, 112, 10, 0, 145, 49, 0, 145, 100, 0, 112, 140, 0, 62, 148, 0, 17, 123, 0, 0, 75, 0]);
			break;
		default:
			R.canvases[1].setCtrls([0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0]);
	}
	
	updateCanvases();

	// R.canvases[1].setCtrls(st);
	R.loopFinished = false;
	R.tubeStep = 0;

}

function updateCanvases(){
	for(var i = 0 ; i < canvases.length ; i++){

		if(i==2){
			canvases[i].colorSteps =  Math.round(7+(sliderData[2]/3));//Math.round((data.var6+1)*10) ;
			canvases[i].paintColors(colorSlider.slider("value")*.001,sliders[3].slider("value"));
			colors = canvases[i].lerpColor();
		}
		else{
			canvases[i].background("#99ccff");
			canvases[i].pinEdges();
		}

		canvases[i].drawVectors();

	}
}


function scaleDown(a){

	var b = [];

	for(var i = -1 ; i < a.length-3; i){
		b.push(a[++i]*.9);
		b.push((150/20)+a[++i]*.9);
		b.push(a[++i]);
	}

	console.log(b);

	return b;
};



applyPreset2 = function(){

	var div = document.getElementById('user');
	var options = document.getElementById('select').options;
	var divAnim = document.getElementById('anim');
	
	switch(options.selectedIndex)
	{
	case 0:
		//apple
		readData( {"canvases":[[0,35,0,16.38352394104004,14.90057373046875,0,54.38352394104004,0.90057373046875,0,95.28125,11.5,0,119.28125,45.5,0,112.28125,85.5,0,82.38352394104004,116.90057373046875,0,56,144,0,22,143,0,0,127,0],[0,55,0,13,29,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,50,99,0,17,117,0,0,135,0],[119.28125,107.1875,0,97.28125,17.1875,0]],"sliders":[90,50,20,20,0],"toDrawExtraGeo":[true]});
		break;
	case 1:
		//apple
		readData( {"canvases":[[0,39,0,14.745171546936035,20.910516357421876,0,48.94517154693604,8.310516357421875,0,85.753125,17.85,0,107.353125,48.45,0,101.05312500000001,84.45,0,74.14517154693604,112.71051635742188,0,50.4,137.1,0,19.8,136.20000000000002,0,0,121.8,0],[0,57,0,11.700000000000001,33.6,0,32.4,16.5,0,60.300000000000004,15.6,0,84.60000000000001,28.2,0,92.7,55.2,0,75.60000000000001,83.10000000000001,0,45,96.60000000000001,0,15.3,112.8,0,0,129,0],[119.28125,107.1875,0,97.28125,17.1875,0]],"sliders":[90,50,20,20,0],"toDrawExtraGeo":[true]});
		break;
	case 2:
		//mushroom
	 	readData( {"canvases":[[0,15.5,0,16.38352394104004,14.90057373046875,0,53.28125,20.5,0,90.28125,35.5,0,117.28125,63.5,0,116.38352394104004,94.90057373046875,0,58.38352394104004,95.90057373046875,0,56,144,0,22,143,0,0,141.5,0],[0,65.5,0,17.28125,44.5,0,41.28125,27.5,0,75.28125,20.5,0,108.28125,37.5,0,117.28125,75.5,0,96.28125,108.5,0,59.28125,115.5,0,24.28125,103.5,0,0,74.5,0],[90.28125,39.1875,0,82.28125,137.1875,0]],"sliders":[76.88,25.22,99.99000000000001,51.63,0],"toDrawExtraGeo":[true]});
		break;
	case 3:
		//hamburger
	 	readData({"canvases":[[0,8.5,0,94.28125,14.5,0,116.28125,59.5,0,97.28125,70.5,0,109.28125,74.5,0,110.28125,98.5,0,100.28125,103.5,0,118.28125,110.5,0,101.28125,137.5,0,0,141.5,0],[0,58.5,0,18.28125,30.5,0,63.28125,7.5,0,116.28125,56.5,0,131.28125,129.5,0,106.28125,131.5,0,90.28125,72.5,0,63.28125,39.5,0,32.28125,56.5,0,0,120.5,0],[85.28125,7.1875,0,91.28125,64.1875,0]],"sliders":[17.37,74.25,67.72,20.69,0],"toDrawExtraGeo":[true]});
		break;
	case 4:
		//infinity
	 	readData( {"canvases":[[0,75,0,15.3,30.900000000000002,0,55.800000000000004,8.4,0,100.8,16.5,0,130.5,51.6,0,130.5,97.5,0,100.8,133.5,0,55.800000000000004,140.70000000000002,0,15.3,118.2,0,0,75,0],[0,75,0,15.3,30.900000000000002,0,55.800000000000004,8.4,0,100.8,16.5,0,130.5,51.6,0,130.5,97.5,0,100.8,133.5,0,55.800000000000004,140.70000000000002,0,15.3,118.2,0,0,75,0],[73.38352394104004,131.42898559570312,0,144.38352394104004,6.428985595703125,0]],"sliders":[77.55,1.85,99.99000000000001,46.05,0],"toDrawExtraGeo":[false]});
		break;
	case 5:
		//spaceship
	 	readData( {"canvases":[[0,7.5,0,22.5,11.1,0,43.2,22.8,0,67.84517154693604,53.14688186645508,0,120.94517154693604,64.84688186645508,0,120.94517154693604,82.84688186645508,0,66.94517154693604,94.54688186645508,0,43.2,126.3,0,22.5,138,0,0,142.5,0],[0,7.5,0,13.845171546936035,44.146875,0,43.2,22.8,0,36.34517154693604,58.546875,0,65.7,63.300000000000004,0,65.7,86.7,0,35.44517154693604,90.946875,0,43.2,126.3,0,14.745171546936035,108.946875,0,0,142.5,0],[45.38352394104004,133.42898559570312,0,130.38352394104004,120.42898559570312,0]],"sliders":[17.37,74.25,67.72,44.72,0],"toDrawExtraGeo":[true]});
		break;
	case 6:
		//happy cat
	 	readData({"canvases":[[0,66.71875762939453,0,11.383523941040039,38.71875762939453,0,41.38352394104004,10.718757629394531,0,81.38352394104004,5.718757629394531,0,111.38352394104004,25.71875762939453,0,110.38352394104004,64.71875762939453,0,89.38352394104004,96.71875762939453,0,56.38352394104004,115.71875762939453,0,29.38352394104004,123.71875762939453,0,0,119.71875762939453,0],[0,14.71875,0,46.38352394104004,13.71875,0,90.38352394104004,13.71875,0,120.38352394104004,18.71875,0,138.38352394104004,29.71875,0,130.38352394104004,56.71875,0,110.38352394104004,80.71875,0,79.38352394104004,107.71875,0,35.38352394104004,126.71875,0,0,135.71875,0],[101.38352394104004,53.428985595703125,0,13.383523941040039,116.42898559570312,0]],"sliders":[64.9,76.24,20.01,38.52],"toDrawExtraGeo":[true]});
		break;
	default:
 		readData({"canvases":[[0,35,0,16.38352394104004,14.90057373046875,0,54.38352394104004,0.90057373046875,0,98.38352394104004,11.90057373046875,0,117.38352394104004,47.90057373046875,0,109.38352394104004,83.90057373046875,0,82.38352394104004,116.90057373046875,0,56,144,0,22,143,0,0,127,0],[0,55,0,13,29,0,36,10,0,67,9,0,94,23,0,103,53,0,84,84,0,50,99,0,17,117,0,0,135,0],[20,20,0,130,130,0]],"sliders":[90,50,20,20],"toDrawExtraGeo":[true]});	
	}
}