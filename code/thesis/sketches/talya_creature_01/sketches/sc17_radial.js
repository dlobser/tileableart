var sc1 = {

	setup:function(){

		tree = new TREE();
		tree.params.jointGeo = new THREE.Geometry();
		tree.branch();
		tree.position.x=-16;
		scene.add(tree);

		for (var i = 0; i <= tree.FIND([0,0,0]).joints; i+=2) {
			var thing = tree.FIND([0,0,i]);
			tree.appendBranch(thing,{amount:30,rz:Math.PI/2,sc:5});
		};

		var things = tree.worldPositionsMultiArray(tree.reportLayers());
		stuff = tree.report();

		thingies = tree.report();

		var h = new THREE.Geometry();

		for (var i = 0; i < thingies.length; i++) {
			for (var j = 0; j < thingies[i].joints; j++) {
				var hi = thingies[i];
				// console.log(hi);
				tree.setGeo(tree.findJoint(thingies[i],j),{ballGeo2:h});
			};
			// tree.setGeo(thingies[i],{ballGeo2:h});
		};

		console.log(tree);

	},

	draw:function(time){

		tree.xform(makeInfo([

			[0,0,"all"],{rz:Math.PI*-.02},
			[0,0,[0,49],0,[1,30]],{rx:.01,jMult:.5,jFreq:omouseX,jFract:omouseY*.3,jOff:-time*1,jOffset:Math.PI*.02},
			[0,0,[0,49],0,[1,30]],{sc:1,rz:omouseX*.1,jMult:.3,jFreq:omouseX,jFract:omouseY*.3,jOff:-time*1,jOffset:Math.PI*.08},
			[0,0,[0,49],0,[20,30]],{sc:.9},

			[0,0,[0,49],0,0],{ry:.1,jMult:.3,jFreq:omouseX,jFract:omouseY*.5,jOff:-time*1,jOffset:Math.PI*.04},
			// [0,0,[0,49],0,0],{ry:time,jMult:.3,jFreq:omouseX,jFract:omouseY*.5,jOff:-time*1,jOffset:Math.PI*8.08},


		]),
		tree.transform);

		tree.xform(makeInfo([	
			[0,0,[0,49],0,[1,30]],{},
		]),
		function(obj,args){
			obj.children[0].children[0].position.y+=1;
			if(obj.children[0].children[0].position.y>9)
				obj.children[0].children[0].position.y=0;
			});
		
	}
}