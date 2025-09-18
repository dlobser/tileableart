   var noise = function(x, y, z) {
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


   
	function RTSmat(x,y,z,t,s){
   
		var m = [];
		m.push(x);
		m.push(y);
		m.push(z);
		m.push(t);
		m.push(s);

		var r1 = jMatMult(x,y);
		var r2 = jMatMult(z,r1);

		var ts = jMatMult(t,s);
		
		return jMatMult(r2,ts);
   
   }
   
    function STRmat(x,y,z,t,s){
   
		var m = [];
		m.push(x);
		m.push(y);
		m.push(z);
		m.push(t);
		m.push(s);

		var r1 = jMatMult(y,x);
		var r2 = jMatMult(z,r1);

		var st = jMatMult(s,t);
		
		return jMatMult(st,r2);
   
   }
   	
	var a = 0;
	
	
	function jMatMult(A,B){
	
		var C = [];
	
		
		for(var i = 0; i < 16; i++){ 
			C.push(0);
		}
		
		
		C[0]=	A[0]* B[0] 	+ A[1] *B[4] 	+ A[2]* B[8] 	+ A[3]* B[12];
		C[4]=	A[4]* B[0] 	+ A[5]* B[4] 	+ A[6]* B[8] 	+ A[7]* B[12];
		C[8]=	A[8]* B[0]	+ A[9]* B[4] 	+ A[10]*B[8] 	+ A[11]*B[12];
		C[12]=	A[12]*B[0]	+ A[13]*B[4] 	+ A[14]*B[8] 	+ A[15]*B[12];

		C[1]=	A[0]* B[1] 	+ A[1]* B[5] 	+ A[2]* B[9] 	+ A[3]* B[13];
		C[5]=	A[4]* B[1] 	+ A[5]* B[5] 	+ A[6]* B[9] 	+ A[7]* B[13];
		C[9]=	A[8]* B[1]	+ A[9]* B[5] 	+ A[10]*B[9] 	+ A[11]*B[13];
		C[13]=	A[12]*B[1]	+ A[13]*B[5] 	+ A[14]*B[9] 	+ A[15]*B[13];

		C[2]=	A[0] *B[2] 	+ A[1] *B[6]  	+ A[2] *B[10] 	+ A[3] *B[14];
		C[6]=  	A[4] *B[2] 	+ A[5] *B[6]  	+ A[6] *B[10] 	+ A[7] *B[14];
		C[10]=  A[8] *B[2]	+ A[9] *B[6] 	+ A[10]*B[10] 	+ A[11]*B[14];
		C[14]=  A[12]*B[2]	+ A[13]*B[6] 	+ A[14]*B[10] 	+ A[15]*B[14];

		C[3]=	A[0] *B[3] 	+ A[1] *B[7] 	+ A[2] *B[11]	+ A[3] *B[15];
		C[7]=	A[4] *B[3] 	+ A[5] *B[7] 	+ A[6] *B[11]	+ A[7] *B[15];
		C[11]=	A[8] *B[3]	+ A[9] *B[7] 	+ A[10]*B[11]	+ A[11]*B[15];
		C[15]=	A[12]*B[3]	+ A[13]*B[7] 	+ A[14]*B[11]	+ A[15]*B[15];
		
		return C;
	}

	function recurse(ob,mat){

            var kidMat = mat;

            if(ob.parent){

              var tempKidMat = jMatMult(mat,ob.parent.pMatrix);
              kidMat = recurse(ob.parent,tempKidMat);

            }

            return kidMat;
          }
   
   	function makeMatrix(params){

   		var x = params.x || 0;
   		var y = params.y || 0;
   		var z = params.z || 0;
   		var rx = params.rx || 0;
   		var ry = params.ry || 0;
   		var rz = params.rz || 0;
   		var xs = params.sx || 1;
   		var ys = params.sy || 1;
   		var zs = params.sz || 1;

   		this.ident = [ 1,0,0,0, 
						0,1,0,0, 
						0,0,1,0, 
						0,0,0,1 ];
		
		this.tMatrix = [ 1,0,0,0, 
						0,1,0,0, 
						0,0,1,0, 
						x,y,z,1 ];
						
		this.sMatrix = [ xs,0,0,0, 
						0,ys,0,0, 
						0,0,zs,0, 
						0,0,0,1 ];
		
		this.rXmatrix = [ 	1,0,0,0, 
							0,Math.cos(rx),-Math.sin(rx),0, 
							0,Math.sin(rx),Math.cos(rx),0, 
							0,0,0,1 ];
		this.rYmatrix = [ 	Math.cos(ry),0,Math.sin(ry),0, 
							0,1,0,0, 
							-Math.sin(ry),0,Math.cos(ry),0, 
							0,0,0,1 ];
		this.rZmatrix = [ 
							Math.cos(rz),-Math.sin(rz),0,0, 
							Math.sin(rz),Math.cos(rz),0,0, 
							0,0,1,0,
							0,0,0,1 ];
							
		return RTSmat(this.rXmatrix,this.rYmatrix,this.rZmatrix,this.tMatrix,this.sMatrix);
	
	}

	function updateMatrix(params){
		var x = params.x || 0;
   		var y = params.y || 0;
   		var z = params.z || 0;
   		var rx = params.rx || 0;
   		var ry = params.ry || 0;
   		var rz = params.rz || 0;
   		var xs = params.sx || 0;
   		var ys = params.sy || 0;
   		var zs = params.sz || 0;




	}
	
	Object3D = function(){};

	Object3D.prototype = new Object3D();

	Object3D.prototype.makeObj = function(){

		this.hasChildren = false;
		this.pts = [];
		this.edges = [];
		this.matrix = [];
		this.children = [];
		
		this.add = function(obj){
			this.children.push(obj);
			this.hasChildren = true;
			obj.parent = this;
		}

		return this;
	}
	
	function makeSpiral(obj){
		obj.pts = [];
		obj.edges = [];
		for(var i = -50 ; i < 50 ; i++ ){
			obj.pts.push([Math.cos(i/Math.PI)*Math.cos(i/30),i/100,Math.sin(i/Math.PI)*Math.cos(i/30)]);
		}

	   // THE EDGES OF A UNIT CUBE (INDEXING INTO THE VERTICES)

		for(var i = 0 ; i < obj.pts.length-1 ; i++ ){
			obj.edges.push([i,i+1]);
		
		}
		for(var i = 0 ; i < obj.pts.length-10 ; i++ ){
			obj.edges.push([i,i+10]);
		
		}
	}
	function makeSpiralSimple(obj){
		obj.pts = [];
		obj.edges = [];

		for(var i = -50 ; i < 50 ; i++ ){
			obj.pts.push([Math.cos(i/Math.PI)*Math.cos(i/30),i/100,Math.sin(i/Math.PI)*Math.cos(i/30)]);
		}

	   // THE EDGES OF A UNIT CUBE (INDEXING INTO THE VERTICES)

		for(var i = 0 ; i < obj.pts.length-1 ; i++ ){
			obj.edges.push([i,i+1]);
		
		}

	}

	function makeSphere2(obj,div){
		obj.pts = [];
		obj.edges = [];

		for(var i = 0 ; i < div ; i++ ){
			for(var j = 0 ; j < div ; j++ ){

				var c = Math.sin((j/(div-1))*Math.PI);
				var b = Math.cos((j/(div-1))*Math.PI);
				
				
				obj.pts.push([c,b+.1,0]);

				

			}
			
			for(var q = 0 ; q < obj.pts.length ; q++){
					var matR = [];
					matR = makeMatrix(0,0,0,1,1,1,0,Math.PI*2/(div-1),0);
					obj.pts[q] = transform(obj.pts[q], matR);
					//console.log(i + " " + matR);
			}
		}

	   // THE EDGES OF A UNIT CUBE (INDEXING INTO THE VERTICES)

		for(var i = 0 ; i < obj.pts.length-1 ; i++ ){
			if((i+1)%div!=0)
			obj.edges.push([i,i+1]);

		
		}
		for(var i = 0 ; i < obj.pts.length-div ; i++ ){
			//if((i+1)%20!=0)
			obj.edges.push([i,i+div]);
		
		
		}

	}
