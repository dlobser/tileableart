
var charles = "philip";

var canvas1={};

canvas1.setup = function() {

  this.text = false;
  this.n = new SimplexNoise();
 // console.log(n);
 
this.dance = false;
this.loff = this.roff = this.luxoff = this.luyoff = this.ruxoff = this.ruyoff = 0;
this.speed = 13;
this.count = 0;


this.mousePos = new Array(6);

for(q in this.mousePos)
  this.mousePos[q] = 0;

this.tents = [];

for (var p = 0 ; p < 4 ; p++){
  var tent = [];
  var num = 20;
  if(p>=2) num = 20;

  for (var i = 0 ; i < num ; i++){
    this.addObject(createParametric(1/(12*2),1/12,sph), 'fs_phong');
    this.objects[this.objects.length-1].name = "ball" + p + i;
    tent.push(this.objects[this.objects.length-1]);

  }
  this.tents.push(tent);


}
console.log(this.tents[0][0]);
}

canvas1.addTent = function(num,typer,div){

var that = this;
var type = typer || 'cube';
var d = div || 12;

//var num = num;
var tent = [];

for(var i = 0 ; i < num ; i++){

  if(type=='cube')
    that.addObject(createCube(), 'fs_phong');
  else
    this.addObject(createParametric(1/(d*2),1/d,sph), 'fs_phong');
  
  tent.push(that.objects[that.objects.length-1]);

  if(i>0){
    tent[i-1].add(tent[i]);
  }
}

that.tents.push(tent);

}
    
canvas1.update = function() {

  var Q = [0,0,0];



  var mouseX = this.mouseX/300-1,
  mouseY = -this.mouseY/300+1;

  var D = [mouseY,mouseX,0];
  var C = [];
  var off = -.1;
  var offy = .8;

  var mx,my;

  this.mousePos.push(mouseX);
  this.mousePos.push(mouseY);
  
  if (this.mousePos.length>10){
    mx = this.mousePos.shift();
    my = this.mousePos.shift();
  }

  /* experimenting with moving the canvas
  if(this.dance){
    var blurry = Math.cos(Math.PI+time*this.speed);
    var stringy = blurry*100+"px";
    document.getElementById("cvs").style.left = stringy;
  }
  */

  for(var i = 0 ; i < this.tents.length ; i++){

  var color = 0;

    for(var j = 0 ; j < this.tents[i].length ; j++){

    C = [mouseX, mouseY,0];

    if(this.dance){
      C = [mouseX+(cos(time*(this.speed+.5))/20),mouseY+(sin(time*(this.speed+.5))/8),0];

      this.loff = max(0,sin(time*(this.speed/2)))/7;
      this.roff = max(0,sin(PI+(time*(this.speed/2))))/7;

      this.ruxoff = (0,sin(time*-this.speed))/7;
      this.luxoff = (0,sin(time*this.speed))/7;
      this.ruyoff = (0,cos(time*-this.speed))/3;
      this.luyoff = (0,cos(time*this.speed))/3;
    }

    if(i==0){ var R = [-.35,-.51+this.loff,0];off=-.5;}
    else if(i==2){ var R = [mx-.75+this.luxoff,my+this.luyoff,0]; }
    else if(i==3){ var R = [mx+.75+this.ruxoff,my+this.ruyoff,0]; }
    else{var R = [.35,-1+this.roff,0];off=.5;}

    var obj = this.tents[i][j];

    var off = 0;

    if(i>0)
      off=.7;

    var parms = [];

    if(this.count==0){
      var B = [0,0,0];
      this.count++;
    }
    else
      var B = [Q[0]-C[0]+1,Q[1]-C[1],Q[2]-C[2]];

    var F = crossT(R,[0,0,1]);

    var Q = [0,1-mouseX,0];

   if(i>1)solve(.65,.65,C,R,[off,offy,.0],Q);
   else solve(.85,.85,C,R,[1,0,0],Q);

    //if(i>1)solve(.65,.65,C,R,F,Q);
    //else solve(.85,.85,C,R,F,Q);

    var points = [];
    points.push(new Point(R));
    points.push(new Point(Q));
    points.push(new Point(C));

    var sp = new Quad(points);
    

    if(obj.name == ("ball"+i+j)){
      var u = this.tents[i].length;
      parms.y = sp.getPoint(j/u).y;
      parms.x = sp.getPoint(j/u).x;
    }

    if(obj.name == ("ballssss"+i+"19")){
      parms.x = F[0];
      parms.y = F[1];
    }

    var scaleMat = makeMatrix(parms);
    
    var params = [];
    params.sx = params.sy = params.sz = .2+(j+1)/15;
    
       // console.log(obj.matrix + " matrix " + obj.pMatrix);

    if(!canvas1.dance){
      obj.matrix = recurse(obj,obj.pMatrix);
      obj.pMatrix = scaleMat;
      var sMat = makeMatrix(params);
      obj.matrix = jMatMult(sMat,obj.matrix);

     
    }
    else if(canvas1.dance && !this.test){
       if(!this.test&&j==10){
        console.log(obj.matrix + " matrix " + obj.pMatrix);
        this.test = true;
      }
    }
    else {
      zparms = [];
      zparms.sx = zparms.sy = zparms.sz = params.sx*-1;
      zparms.tx = obj.pMatrix[3];
     
    
      freezeVerts(obj);
       obj.matrix = makeMatrix(zparms);
      //updateVerts(obj,1e-3,1);
    }
            //  updateVerts(obj,0.0051,1);



   // else
   // obj.matrix =obj.p;


    

    //


    

    color+=(1/this.tents[i].length);

    var cr = (sin(time*3+(j*3))+1)/2;
    var cb = (sin(time*4+(j*1.5))+1)/2;
    var cg = (sin(time*5+(j*1.9))+1)/2;

    if(j==this.tents[i].length-1)
      obj.setUniform('p', [.6,0, 0,0,0,0, 0,0,0,1]);
    else
      obj.setUniform('p', [cr*.2,cg*.2, cb*.2,color*.3,0,color*.1, 0,.5,.3,1]);
    
    obj.setUniform('sc',1);

    obj.setUniform('lDir', [.1,.5,0.0]);
    obj.setUniform('time', time+j);

    obj.setUniform('oNoise', [j,j,j]);
    obj.setUniform('uVertOffset', [0.5,0.5,0.5]);

        
    }
  }
}


var sph = function(u,v) {
   var theta = 2 * Math.PI * u,
       phi = Math.PI * (v - .5),
       cosT = Math.cos(theta) *.1, cosP = Math.cos(phi)*1 ,
       sinT = Math.sin(theta) *.1, sinP = Math.sin(phi)*.1 ;
   return [ cosT * cosP, sinT * cosP, sinP ];
}

var rand = function(min,max) {

   return [ Math.random()/10,Math.random()/10,Math.random()];
}

window.onkeydown = onKeyDown;
  
  function onKeyDown(evt) {
    console.log(evt.keyCode);
    //add a ball 'a'
    
    if(evt.keyCode == 81){
      canvas1.dance = !canvas1.dance;
      if(canvas1.dance)
        setSpan("foo","Dancing Jester");
      else
        setSpan("foo","Floppy Harlequin");
    }
    if(evt.keyCode == 69){
      canvas1.speed += 1;
    }
     if(evt.keyCode == 87){
      canvas1.speed -= 1;
    }
  }

      

  


  
  
