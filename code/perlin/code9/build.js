

   
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




	/////////*************
	///all that follows is (sadly) not mine
	
	//math utils from Ken
	var PI = Math.PI;
   function cos(t) { return Math.cos(t); }
   function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
   function floor(t) { return Math.floor(t); }
   
   function ik(a, b, C, D) {
   
      var cc = dot(C,C), 
	  x = (1 + (a*a - b*b)/cc) / 2, 
	  y = dot(C,D)/cc;
	  
      for (var i = 0 ; i < 3 ; i++) 
		D[i] -= y * C[i];
		
      y = sqrt(max(0,a*a - cc*x*x) / dot(D,D));
	  
      for (var i = 0 ; i < 3 ; i++) 
		D[i] = x * C[i] + y * D[i];
		
   }
   
   function lerp(t, a, b) { return a + t * (b - a); }
   function min(a, b) { return Math.min(a, b); }
   function max(a, b) { return Math.max(a, b); }
   function sCurve(t) { return t * t * (3 - t - t); }
   function sin(t) { return Math.sin(t); }
   function sqrt(t) { return Math.sqrt(t); }
   function dist( a,b ) {

		var dx = a[0] - b[0];
		var dy = a[1] - b[1];
		var dz = a[2] - b[2];

		return dx * dx + dy * dy + dz * dz;

	}


   //-------- SOLVE TWO LINK INVERSE KINEMATICS -------------

// Given a two link joint from [0,0,0] to end effector position P,
// let link lengths be a and b, and let norm |P| = c.  Clearly a+b >= c.
//
// Problem: find a "knee" position Q such that |Q| = a and |P-Q| = b.
//
// In the case of a point on the x axis R = [c,0,0], there is a
// closed form solution S = [d,e,0], where |S| = a and |R-S| = b:
//
//    d2+e2 = a2                  -- because |S| = a
//    (c-d)2+e2 = b2              -- because |R-S| = b
//
//    c2-2cd+d2+e2 = b2           -- combine the two equations
//    c2-2cd = b2 - a2
//    c-2d = (b2-a2)/c
//    d - c/2 = (a2-b2)/c / 2
//
//    d = (c + (a2-b2/c) / 2      -- to solve for d and e.
//    e = sqrt(a2-d2)

   function findD(a,b,c) {
      return Math.max(0, Math.min(a, (c + (a*a-b*b)/c) / 2));
   }


   function findE(a,d) { return Math.sqrt(a*a-d*d); } 

// This leads to a solution to the more general problem:
//
//   (1) R = Mfwd(P)         -- rotate P onto the x axis
//   (2) Solve for S
//   (3) Q = Minv(S)         -- rotate back again

  var  Mfwd = new Array(3);
   for (var i=0;i<3;i++){
        Mfwd[i]=new Array(3);
    }

   var Minv = new Array(3);
   for (var i=0;i<3;i++){
        Minv[i]=new Array(3);
    }

	function solve(A,B,P1,P2,D,Q) {
		var P=[]; 
		P[0] = P1[0]-P2[0];
		P[1] = P1[1]-P2[1];
		P[2] = P1[2]-P2[2];
		var R = new Array(3);
		defineM(P,D);
		rot(Minv,P,R);
		var d = findD(A,B,norm(R));
		var e = findE(A,d);
		var S = [d,e,0];
		rot(Mfwd,S,Q);
		Q[0]=Q[0]+P2[0];Q[1]=Q[1]+P2[1];Q[2]=Q[2]+P2[2];
		return d > 0 && d < A;
	}

// If "knee" position Q needs to be as close as possible to some point D,
// then choose M such that M(D) is in the y>0 half of the z=0 plane.
//
// Given that constraint, define the forward and inverse of M as follows:

   function defineM(P,D) {
       X = Minv[0]; Y = Minv[1]; Z = Minv[2];

// Minv defines a coordinate system whose x axis contains P, so X = unit(P).

      for (var i = 0 ; i < 3 ; i++)
         X[i] = P[i];
      normalize(X);

// The y axis of Minv is perpendicular to P, so Y = unit( D - X(DÂ·X) ).

      var dDOTx = dot(D,X);
      for (var i = 0 ; i < 3 ; i++)
         Y[i] = D[i] - dDOTx * X[i];
      normalize(Y);

// The z axis of Minv is perpendicular to both X and Y, so Z = XÃ—Y.

      cross(X,Y,Z);

// Mfwd = (Minv)T, since transposing inverts a rotation matrix.

      for (var i = 0 ; i < 3 ; i++) {
         Mfwd[i][0] = Minv[0][i];
         Mfwd[i][1] = Minv[1][i];
         Mfwd[i][2] = Minv[2][i];
      }
   }

//------------ GENERAL VECTOR MATH SUPPORT -----------

   function norm(v) { return Math.sqrt( dot(v,v) ); }

   function normalize(v) {
      var normm = norm(v);
      for (var i = 0 ; i < 3 ; i++)
         v[i] /= normm;
   }

   function dot(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }

   function cross(a,b,c) {
      c[0] = a[1] * b[2] - a[2] * b[1];
      c[1] = a[2] * b[0] - a[0] * b[2];
      c[2] = a[0] * b[1] - a[1] * b[0];
   }

   function rot(M,src,dst) {
      for (var i = 0 ; i < 3 ; i++)
         dst[i] = dot(M[i],src);
   }


   /**
 * Spline from Tween.js, slightly optimized (and trashed)
 * http://sole.github.com/tween.js/examples/05_spline.html
 *
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 from THREEJS*/

Point = function(a){

	this.x = a[0];
	this.y = a[1];
	this.z = a[2];
}

Spline = function ( points ) {

	this.points = points;

	var c = [], v3 = { x: 0, y: 0, z: 0 },
	point, intPoint, weight, w2, w3,
	pa, pb, pc, pd;


	this.getPoint = function ( k ) {

		point = ( this.points.length - 1 ) * k;
		intPoint = Math.floor( point );
		weight = point - intPoint;

		c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint  > this.points.length - 2 ? this.points.length - 1 : intPoint + 1;
		c[ 3 ] = intPoint  > this.points.length - 3 ? this.points.length - 1 : intPoint + 2;

		pa = this.points[ c[ 0 ] ];
		pb = this.points[ c[ 1 ] ];
		pc = this.points[ c[ 2 ] ];
		pd = this.points[ c[ 3 ] ];

		w2 = weight * weight;
		w3 = weight * w2;

		v3.x = interpolate( pa.x, pb.x, pc.x, pd.x, weight, w2, w3 );
		v3.y = interpolate( pa.y, pb.y, pc.y, pd.y, weight, w2, w3 );
		v3.z = interpolate( pa.z, pb.z, pc.z, pd.z, weight, w2, w3 );

		return v3;

	};

	// Catmull-Rom

	function interpolate( p0, p1, p2, p3, t, t2, t3 ) {

		var v0 = ( p2 - p0 ) * 0.5,
			v1 = ( p3 - p1 ) * 0.5;

		return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	};

};



/**************************************************************
 *	Quadratic Bezier 3D curve
 **************************************************************/



Quad = function ( points) {

	this.v0 = points[0];
	this.v1 = points[1];
	this.v2 = points[2];

	

	this.getPoint = function ( t ) {

		var tx, ty, tz;

		tx = b2( t, this.v0.x, this.v1.x, this.v2.x );
		ty = b2( t, this.v0.y, this.v1.y, this.v2.y );
		tz = b2( t, this.v0.z, this.v1.z, this.v2.z );

		return new Point([tx,ty,tz]);

	}
}




	function b2p0( t, p ) {

		var k = 1 - t;
		return k * k * p;

	}

	function b2p1( t, p ) {return 2 * ( 1 - t ) * t * p;}

	function b2p2( t, p ) {return t * t * p;}

	function b2( t, p0, p1, p2 ) {return b2p0( t, p0 ) + b2p1( t, p1 ) + b2p2( t, p2 );}

	 function setSpan(id, str) {
      document.getElementById(id).firstChild.nodeValue = str;
   }
   
