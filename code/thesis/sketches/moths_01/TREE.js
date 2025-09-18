
Joint = function(params){

	THREE.Object3D.call(this);
	this.params = params;
	this.limbs = [];
	// this.branches = [];
	
}

Joint.prototype = Object.create(THREE.Object3D.prototype);

Joint.prototype.construct = function(off){

	var p = this.params;

	var ballMesh = new THREE.Mesh( p.ballGeo, p.mat );
	var ballMesh2 = new THREE.Mesh( p.ballGeo, p.mat );
	var jointMesh = new THREE.Mesh( p.jointGeo, p.mat );
	ballMesh.scale = p.rootScale;
	jointMesh.position.y = .5;

	ballMesh.matrixAutoUpdate = true;		
	jointMesh.matrixAutoUpdate = true;	

	this.scalar = new THREE.Object3D();
	this.rotator = new THREE.Object3D();

	//this.poser = new THREE.Object3D();
	//this.scalar.matrixAutoUpdate = true;		
	//this.poser.matrixAutoUpdate = true;		
	//this.rotator.matrixAutoUpdate = true;		

	this.scalar.add(jointMesh);
	this.scalar.scale = p.jointScale;

	this.rotator.add(ballMesh);
	ballMesh2.position.y = p.jointScale.y;
	ballMesh.add(ballMesh2);

	this.rotator.add(this.scalar);
	//this.poser.add(this.rotator);

	//this.poser.position = p.rootPosition/;
	//this.poser._rotation = p.rootRotation;
	this.add(this.rotator);
	
	var offset = off || p.jointScale.y;
	
	this.position.y = offset;

}

TREE = function(){

	THREE.Object3D.call(this);
	this.limbs = [];
	this.parts = [];
	this.name = 0;

	var zero = new THREE.Vector3(0,0,0);
	var one = new THREE.Vector3(1,1,1);
	var colour = 0xFFFFFF;

	this.params = {
		name : 0,
		parts : [],
		rootPosition : zero,
		rootScale : one,
		rootRotation :  zero,
		jointScale : new THREE.Vector3(1,25,1),
		ballGeo :  new THREE.SphereGeometry(1,12,6),
		jointGeo : new THREE.CylinderGeometry( 1,1,1,12,1),
		color : colour,
		mat : new THREE.MeshLambertMaterial({ color:colour, shading: THREE.SmoothShading }),
		offset : 0,
		scalar : new THREE.Object3D(),
		rotator : new THREE.Object3D(),
		poser : new THREE.Object3D(),
		num : 100
	}
	

}

TREE.prototype = Object.create(THREE.Object3D.prototype);

TREE.prototype.branch = function(amt,obj,params){

	//Create one branch, a collection of linked limbs
	var p = this.params;
	var parent = obj || this;
	var amount = amt || p.num;
	var countUp = 0;

	

	var joint = new Joint(obj.params);

	var offsetOffset = parent ? parent.offset+parent.limbs.length : 0;
	joint.offset = parent.joint+offsetOffset || 0;

	joint.joint = countUp;
	joint.joints = amt-1;
	joint.parentJoint = parent;
	joint.name = Math.floor(Math.random()*1e9);
	parent.limbs.push(joint);
	this.parts.push(joint);
	countUp++;


	var keys = (Object.keys(joint.params));
	var tempParams = {};
	for(var i = 0 ; i < keys.length ; i++){
		tempParams[keys[i]] = joint.params[keys[i]];
	}

	
	joint.params = tempParams;

	if(params){
		var keys = (Object.keys(params));
		for(var i = 0 ; i < keys.length ; i++){
			joint.params[keys[i]] = params[keys[i]];
			// console.log(keys[i]);
		}
	}

	joint.construct(parent.params.jointScale.y);

	parent.children[0].add(this.recursiveAdd(amount, countUp++, joint));
		
	return joint;
}

TREE.prototype.recursiveAdd = function(amt,counter,obj){
	
	var joint = new Joint(obj.params);
	joint.offset = obj.offset;
	// joint.parentJoint = obj.parentJoint;
	joint.name = obj.name;
	joint.construct();
	joint.joint = counter;
	
	if(amt>1)
		obj.children[0].add(joint);

	amt--;
	counter++;

	if(amt>0){
		this.recursiveAdd(amt,counter++,joint);
	}

	return obj;
}

//find the second branch of the third joint of the second joint of the root

TREE.prototype.generate = function(genome, rootDiv){

	//e.g. genome = {joints:[15,3,2],divs:[2,3,1],angles:[.78,.05,.03],rads:[2,1,1]}
	var g = genome;

	// if the arrays are the wrong length, error
	if(g.joints.length!=g.divs.length || g.joints.length!=g.angles.length || g.divs.length!=g.angles.length){
		alert("arrays must be the same length");
		return;
	}

	// make an empty branch - not sure if this is exactly doing what I want
	var tempRoot = new Joint(this.params);
	tempRoot.construct();
	tempRoot.name = "0";

	// make the root branch
	// var rootRoot = this.branch(1,tempRoot);

	for (var i = 0; i < g.rads[0]; i++) {
		var altLength = tempRoot.params.jointScale.clone();
		altLength.y = g.length[0];
		// newBranch = this.branch(g.joints[0],kidJoint,{jointScale:altLength});
		var root = this.branch(g.joints[0],tempRoot,{jointScale:altLength});
		root.rotator.rotation.z = g.angles[0];
		root.rotator.rotation.y = i * ((2*Math.PI)/g.rads[0]);
		// console.log(root);
		this.recursiveBranch(g,1,root);
		this.add(root);
		this.limbs.push(root);
	}
	// this.recursiveBranch(g,1,root);
}

TREE.prototype.recursiveBranch = function(genome,counter,joint){
	
	var g = genome;	
	var newBranch,kidJoint;	

	//loop through all the joints in the current branch
	for (var i = g.start[counter]; i < joint.joints+1; i+=g.divs[counter]) {
	
		//loop through the 'rads' - the number of branches from each joint
		for (var j = 0; j < g.rads[counter]; j++) {

			kidJoint = this.Find(joint,i);
			var altLength = kidJoint.params.jointScale.clone();
			altLength.y = g.length[counter];


			newBranch = this.branch(g.joints[counter],kidJoint,{jointScale:altLength});

			newBranch.rotator.rotation.z = g.angles[counter];
			newBranch.rotator.rotation.y = j * ((2*Math.PI)/g.rads[counter]);
		}
		if(counter<g.joints.length){
			for (var k = 0; k < kidJoint.limbs.length; k++) {
				this.recursiveBranch(genome,counter+1,kidJoint.limbs[k]);
			}
		}
	}
}

TREE.prototype.Find = function(obj,num){

	//Return a particular joint on a limb

	if(num>obj.joints)
		num=obj.joints;

	var returner;

	if(num>0){
		num--
		returner = this.Find(obj.children[0].children[2],num);
	}
	else{
		returner = obj;
	}

	return returner;
}

TREE.prototype.Move = function(selector,func,args,counter,branch){

	//apply a function to a selected joint
	//e.g. Move([0,1,0,1,1],function,{rx:3})
	//no need to supply counter or branch on fist call

	var root = branch || this;
	var count = counter || 0;

	var returner;
	// console.log(root);
	// console.log(selector[count]);
	//selector:[limb with branches, branch, limb, branch, etc, etc, which joint]

	//count up through items in selector; an array
	if( count < selector.length-2 ){

		//create an empty array that we'll fill up with the locations
		//of all the joints that have limbs
		var j = [];
		this.findLimbs(root,j);
		// console.log(j);
		//make sure we're not going past the end of the array
		var c;
		if(selector[count] > j.length-1){
			c=j.length-1;
		}
		else
			c=selector[count];

		//use the selected joint for the next recursion
		var joint = j[c];
		returner = this.Move(selector,func,args,count+2,joint.limbs[selector[count+1]]);
	}
	else{
		if( selector[count] == "all" ){
			for (var i = 0; i < root.joints+1; i++) {
				returner = func(this.Find(root,i),args);
			}
		}
		else{
			// console.log(selector);
			returner = func(this.Find(root,selector[count]),args);

		}

	}
	return returner;
}

TREE.prototype.FIND = function(selector,counter,branch){

	//apply a function to a selected joint
	//e.g. Move([0,1,0,1,1],function,{rx:3})
	//no need to supply counter or branch on fist call

	var root = branch || this;
	var count = counter || 0;

	var returner;
	// console.log(root);
	// console.log(selector[count]);
	//selector:[limb with branches, branch, limb, branch, etc, etc, which joint]

	//count up through items in selector; an array
	if( count < selector.length-2 ){

		//create an empty array that we'll fill up with the locations
		//of all the joints that have limbs
		var j = [];
		this.findLimbs(root,j);
		// console.log(j);
		// console.log(j);
		//make sure we're not going past the end of the array
		var c;
		if(selector[count] > j.length-1){
			c=j.length-1;
		}
		else
			c=selector[count];

		//use the selected joint for the next recursion
		var joint = j[c];
		returner = this.FIND(selector,count+2,joint.limbs[selector[count+1]]);
	}
	else{
		if( selector[count] == "all" ){
			for (var i = 1; i < root.joints+1; i++) {

				returner = this.Find(root,i);
			}
		}
		else{
			// console.log(selector);
			returner = this.Find(root,selector[count]);

		}

	}
	return returner;
}

TREE.prototype.findLimbs = function(branch,array){
	//fills an array with a list of the joints that branch from a limb

	var returner;

	if(branch){
		// if(branch.children[0].children.length>3 || branch.joint==branch.joints){
		if(branch.limbs.length>0){
			array.push(branch);
		}
		if(branch.children[0].children[2]!=undefined && branch.children[0].children[2].name==branch.name){
			returner = this.findLimbs(branch.children[0].children[2],array);
		}
		
	}

	return returner;
}

TREE.prototype.report = function(array,obj){

	//make a list of all root branches

	var arr = array || [];
	var joint = obj || this;

	for(var j = 0 ; j < joint.limbs.length ; j++){
		arr.push(joint.limbs[j]);

		var jarr = [];
		this.findLimbs(joint.limbs[j],jarr);


		for(var i = 0 ; i < jarr.length ; i++){

			this.report(arr,jarr[i]);

		}
	}
	return arr;
}

TREE.prototype.worldPositions = function(obj){

	var arr = [];

	var l = obj.joints;

	for(var i = 0 ; i <= obj.joints ; i++){

		var tempObj = this.Find(obj,i);

		tempObj.updateMatrixWorld();
		var el = tempObj.matrixWorld.elements;

		var vector = new THREE.Vector3();
		vector.setFromMatrixPosition( tempObj.matrixWorld );

		var vec4 = new THREE.Vector4(vector.x,vector.y,vector.z,Math.sin((tempObj.joint/l)*Math.PI));

		arr.push(vec4);
	}

	return arr;

}

TREE.prototype.worldPositionsArray = function(arr){

	var masterArray = [];

	for(var i = 0 ; i < arr.length ; i++){
		masterArray.push(tree.worldPositions(arr[i]));
	}

	return masterArray;
}

TREE.prototype.tubes = function(arr,w,s){

	var width = w || 1;
	var seg = s || 1;

	for(var i = 0 ; i < arr.length ; i++){
		var curve = new THREE.SplineCurve3(arr[i]);
		curve.data = arr[i];
		var geo = new THREE.TubeGeometry(curve, arr[i].length * seg, width, 6);
		this.add(new THREE.Mesh(geo,this.params.mat));
		// this.add(THREE.SceneUtils.createMultiMaterialObject(geo, [new THREE.MeshLambertMaterial({color: 0xffffff})]));
	}
}

TREE.prototype.makeTubes = function(w){
	var width = w || 1;
	this.tubes(this.worldPositionsArray(this.report()),width);
}

function append(obj,args){

	var amt = args.amount || 10;

	var x = args.rx || 0;
	var y = args.ry || 0;
	var z = args.rz || 0;

	//making a tempTree to get access to the 'branch' function
	var tempTree = new TREE();

	var tempRoot = new Joint(tempTree.params);
	var altLength = tempRoot.params.jointScale.clone();
	altLength.y = args.sc;
	tempRoot.construct();

	var root = tempTree.branch(amt,tempRoot,{jointScale:altLength});
	
	obj.children[0].add(root);
	obj.limbs.push(root);
	root.position.y=root.parent.parent.params.jointScale.y;	

	root.rotator.rotation.x = x;
	root.rotator.rotation.y = y;
	root.rotator.rotation.z = z;

	return root;
}

function pushNoRepeat(array,child){
	var temp = child;
	var push = true;
	for (var i = 0; i < array.length; i++) {
		if(array[i]==child)
			push=false;
	};
	if(push)
		array.push(child);
}

function makeList(range) {
	var result = [];

	for (var i = range.length-1; i >= 0; i--) {
		var min, max;
		var newResult = [];
		if (range[i] instanceof Array) {
			min = range[i][0];
			max = range[i][1];
		} else {
			min = max = range[i];
		}
        if (result.length == 0) {
            for (var j = min; j <= max; j++)
                newResult.push([j]);
        } else {
            for (var j = min; j <= max; j++) {
                for (var k = 0; k < result.length; k++)
                    newResult.push([j].concat(result[k]));
            }
        }
		result = newResult;
	}
    
    return result;
}

function xform(array,obj,func){
	for (var i = 0; i < array.length; i++) {
		for (var j = 0; j < array[i].length; j++) {
		 	var process = makeList(array[i][j]);
		 	for (var k = 0; k < process.length; k++) {
				obj.Move(process[k],func,array[i].args);
				// console.log(obj.FIND(process[k]));
				// func(obj.FIND(process[k]),array[i].args);
			};
		 }; 
	};
}

function go(obj,args){

	var rx,ry,rz,sc,scx,scy,scz,off,offMult,iOff,iMult;

	if(args){
		sc = args.sc || 1;

		if(args.sc){
			scx = scy = scz = args.sc;
		}
		else{
			scx = args.scx || 1 ;
			scy = args.scy || 1 ;
			scz = args.scz || 1 ;
			
		}
		rx = args.rx || 0 ;
		ry = args.ry || 0 ;
		rz = args.rz || 0 ;
		off = args.off || 0;
		offMult = args.offMult || 0;
		ioff = args.off || 0;
		iMult = args.iMult || 0;
	}
	else{
		rx = ry = rz = 0;
		sc = scx = scy = scz = 1;
		off = offMult = ioff = iMult = 0;
	}

	if(args.rx != undefined)
		obj.rotator.rotation.x=rx+(off+(offMult*obj.offset))+(ioff+(iMult*(obj.joint-1)));
	if(args.ry != undefined)
		obj.rotator.rotation.y=ry+(off+(offMult*obj.offset))+(ioff+(iMult*(obj.joint-1)));
	if(args.rz != undefined)
		obj.rotator.rotation.z=rz+(off+(offMult*obj.offset))+(ioff+(iMult*(obj.joint-1)));
	
	if(args.sc || args.scx || args.scy || args.scz);
		obj.rotator.scale = new THREE.Vector3(scx,scy,scz);

	return obj;
}
function go2(obj,args){

	var rx,ry,rz,sc,scx,scy,scz,
	off,offMult,iOff,iMult,offMult2,
	idMult;

	if(args){
		sc = args.sc || 1;

		if(args.sc){
			scx = scy = scz = args.sc;
		}
		else{
			scx = args.scx || 1 ;
			scy = args.scy || 1 ;
			scz = args.scz || 1 ;
			
		}
		rx = args.rx || 0 ;
		ry = args.ry || 0 ;
		rz = args.rz || 0 ;
		off = args.off || 0;
		offMult = args.offMult || 0;
		offMult2 = args.offMult2 || 0;
		ioff = args.ioff || 0;
		iMult = args.iMult || 0;
		idMult = args.idMult || 0;
	}
	else{
		rx = ry = rz = 0;
		sc = scx = scy = scz = 1;
		off = offMult = ioff = iMult = 0;
	}


	if(args.rx != undefined)
		obj.rotator.rotation.x=rx+(Math.sin(off+(obj.offset*offMult)))+(ioff+(iMult*(obj.joint-1))) + (idMult*obj.id);
	if(args.ry != undefined) 
		obj.rotator.rotation.y=ry+(Math.sin(off+(obj.offset*offMult)))+(ioff+(iMult*(obj.joint-1))) + (idMult*obj.id);
	if(args.rz != undefined)
		obj.rotator.rotation.z=rz+(Math.sin(off+(obj.offset*offMult)))+(ioff+(iMult*(obj.joint-1))) + (idMult*obj.id);
	
	if(args.sc || args.scx || args.scy || args.scz);
		obj.rotator.scale = new THREE.Vector3(scx,scy,scz);

	return obj;
}

function makeInfo(args){

	var info = [];
	
	var q = 0;
	for (var i = 0; i < args.length/2; i++) {

		info.push(makeList(args[q]));
		info[i].args=args[q+1];
		q+=2;
	};
	// console.log(args);
	return info;
}

function looker(obj,args){

	var vx = args.x || 0;
	var vy = args.y || 0;
	var vz = args.z || 0;

	var vec = new THREE.Vector3(vx,vy,vz);

	var tempParent = obj.parent;

	obj.updateMatrixWorld();

	THREE.SceneUtils.detach(obj,tempParent,scene);

	// obj.lookAt(vec);
	obj._rotation = vec;
	// console.log(obj);

	obj.updateMatrixWorld();
	tempParent.updateMatrixWorld();

	THREE.SceneUtils.attach(obj,scene,tempParent);
}

var Average = function(s) {

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

////deprecated
/*
TREE.prototype.move = function(branch,joint,func){

	if(joint.length==1){
		func(tree.find(this.limbs[0],branch,joint[0],1));
	}

	else{
		for(var i = joint[0] ; i < joint[1] ; i++){
			func(tree.find(this.limbs[0],branch,i,1));
		}
	}
}

TREE.prototype.find = function(limb,branch,joint,leaf){
	
	var returnJoint;

	if(leaf>branch.length-1){
		returnJoint = limb.limb[joint];
	}
	else{
		returnJoint = this.find(limb.children[branch[leaf]],branch,joint,leaf+1);
	}
	return returnJoint;
}
*/
