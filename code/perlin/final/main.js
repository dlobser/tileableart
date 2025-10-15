var canvas1={};

canvas1.setup = function() {
  this.setGlobals();
  this.makeUni();
  this.things.outerTire.add(this.things.innerTire);
  this.makeCthulu();
}


canvas1.update = function(){

  ////Setup 

  this.noise = (this.n.noise(time/2,2)*.01);

  var mouseX = this.mouseX/512-1,
  mouseY = -this.mouseY/512+1;

  var o = this.things;

  if(mouseX - this.pMouse[0]>0 || mouseX - this.pMouse[0]<0){
    this.speed += (mouseX-this.pMouse[0])*PI;
    
  }
  this.a.add((mouseX-this.pMouse[0])*PI);

  ///Translate Objects

  this.moveUni(o,this.speed,mouseX,mouseY);
  this.moveCthulu(mouseX,mouseY);
  
  ////

  ////Management

  this.pMouse.push(mouseX+this.noise);
  this.pMouse.push(mouseY);

  while(this.pMouse.length>2){
    this.pMouse.shift();
  }
  if(this.pMouse[0]==mouseX){
    this.pMouse[0]=mouseX;
    this.pMouse[1]=mouseY;
  }
}


canvas1.setGlobals = function(){
  this.things = [];
  this.pMouse = [0,0];
  this.speed = 0;
  this.loff = this.roff = this.luxoff = this.luyoff = this.ruxoff = this.ruyoff = 0;
  this.n = new SimplexNoise();
  this.a = new Average(15);
  this.tents = [];
  this.stick = new Array(4);
  this.noise;
}

canvas1.makeCthulu = function(){

  for (var p = 0 ; p < 3; p++){
    this.stick[p] = [0,0,0];
    var tent = [];
    var num = 30;
    if(p>=2) num = 20;

    for (var i = 0 ; i < num ; i++){
      this.addObject(createParametric(1/(12*2),1/12,sph), 'fs_phong');
      this.objects[this.objects.length-1].name = "ball" + p + i;
      this.objects[this.objects.length-1].setUniform('p', [.05,.08, .02,0,0,0, 0,0,0,1]);
      tent.push(this.objects[this.objects.length-1]);

    }
    this.tents.push(tent);
  

  }
}

canvas1.moveUni = function(o,speed,mouseX,mouseY){
  o.wheel.tMatrix=makeMatrix({sx:.25,sy:.25,sz:.25})
  
  var params={rx:PI/2,ry:time};
  var landSpeed = time*2;
 
  o.outerTire.tMatrix=(makeMatrix({rz:speed+landSpeed}));
  o.pedalJoint1.tMatrix=(makeMatrix({x:-.62,z:.92,rz:-speed-landSpeed}));
  o.pedalJoint2.tMatrix=(makeMatrix({x:.62,z:-.92,rz:-speed-landSpeed}));

  obj.move(o.wheel,makeMatrix({
    x:mouseX+this.noise,
    y:-.6,
    ry:(sin(landSpeed)*.2)+sin(this.a.avg()*6+mouseX*this.a.avg())
  }));

  o.wangleParent.tMatrix=(jMatMult(o.wheel.tMatrix,makeMatrix({rz:this.a.avg()*-6,sy:4,sx:3.5,sz:3.5})));

  // var sMat = makeMatrix({sx:sin(time*speed),sz:sin(time*speed),sy:sin(time*speed)});
  // o.wangleton.setUniform('p', [(mcos(time*2),0,1),msin(time*5,0,1), .02,0,0,0, 0,0,0,1]);
  // o.wangleton.matrix=jMatMult(sMat,makeMatrix({x:o.pedalJoint1.matrix[12],y:o.pedalJoint1.matrix[13],z:o.pedalJoint1.matrix[14]}));
  o.wangleton.move(o.wangleton,o.wangleton.tMatrix);
}

canvas1.makeThing = function(parms,name,uniform,obj,material){
  this.addObject(obj, material);
  var obj = this.objects[this.objects.length-1];
  obj.name = name;
  obj.tMatrix=makeMatrix(parms);
  obj.setUniform('p', uniform);
  this.things[name] = obj;
}

canvas1.moveCthulu = function(mouseX,mouseY){

  var o = this.things;
  var scrw = this.canvas.width, scrh = this.canvas.height;
  var D = [mouseY,mouseX,0];
  var C = [];
  var off = -.1;
  var offy = .8;

  var lstick = 0, rstick = 0; 

  for(var i = 0 ; i < this.tents.length ; i++){

    var color = 0;

      for(var j = 0 ; j < this.tents[i].length ; j++){


        C = [mouseX, mouseY,0];
        C= [o.seatPoint.matrix[12],o.seatPoint.matrix[13],o.seatPoint.matrix[14]];

        if(i==0){
        R = [ o.pedalJoint1.matrix[12],
              o.pedalJoint1.matrix[13],
              o.pedalJoint1.matrix[14]];
        }
        else if(i==1){
        R = [ o.pedalJoint2.matrix[12],
              o.pedalJoint2.matrix[13],
              o.pedalJoint2.matrix[14]];
        }
        else if(i==2){
        R = [ this.a.avg()+mouseX,mouseY+.6,0];
        }
        var obj = this.tents[i][j];

        var off = 0;

        if(i>0)
          off=.7;

        var parms = [];

        var Q = [mouseX+.5,0,0];

        switch(i){
          case 0:  if(solve(.65,.65,C,R,Q, 1)>.65*3)   this.stick[0] = [0,0,0]; break;
          case 1:  if(solve(.65,.65,C,R,Q,-1)>.65*3)   this.stick[1] = [0,0,0]; break;
          case 2:  if(solve(.15,.15,C,R,Q, 1)>.15*2.5) this.stick[2] = [0,0,0]; break;
          case 3:  if(solve(.65,.65,C,R,Q,-1)>.65*2.5) this.stick[3] = [0,0,0]; break;
          default: solve(.65,.65,C,R,Q, 1); 
        }

        //push useful points into an array for making a bezier
        var points = [];
        points.push(new Point(R));
        points.push(new Point(Q));
        points.push(new Point(C));

        points[1].y-=.15;
        points[0].y+=.03;

        //nudge knees forward and backward
        f.log(points);
        if(i==0)
        points[1].z +=1;//sin(this.a.avg()*3+mouseX);
        else if(i==1)
        points[1].z -=1;
        else if(i==2){
        points[0].x +=.4;
        points[1].y +=.4;
        points[1].x -=.2;
        }

        var sp = new Quad(points);
        

        if(obj.name == ("ball"+i+j)){
          var u = this.tents[i].length;
          parms.y = sp.getPoint(j/u).y;
          parms.x = sp.getPoint(j/u).x;
          parms.z = sp.getPoint(j/u).z;
        }


        d.log(points);

        var scaleMat = makeMatrix(parms);

        obj.pMatrix = scaleMat;

        obj.matrix = recurse(obj,obj.pMatrix);

        var params = [];
        params.sx = params.sy = params.sz = .2+(j+1)/25;

        var sMat = makeMatrix(params);

        obj.matrix = jMatMult(sMat,obj.matrix);
    }
  } 
}

canvas1.makeUni=function(){

  this.unicycle = [];
  this.wheel = [];
  this.spokes = []
  this.pedals = [];

  //wheel parent

  this.addObject([0], 'fs_phong');
  var obj = this.objects[this.objects.length-1];
  this.things["wheel"] = obj;

  this.addObject([0], 'fs_phong');
  var obj = this.objects[this.objects.length-1];
  this.things["wangleParent"] = obj;

  this.things.wheel.add(this.things.wangleParent);

  //create outer tire
  var parms = {r1:1,r2:.1};
  this.addObject(createParametric(1/48,1/12,tor,parms), 'fs_phong');
  var obj = this.objects[this.objects.length-1];
  obj.setUniform('p', [.02,.01, .01,0,0,0, 0,0,0,1]);
  obj.drawType="TRIANGLE_STRIP";
  this.things["outerTire"] = obj;
  this.wheel.push(obj);

  var parms = {r1:.95,r2:.09};
  this.addObject(createParametric(1/48,1/12,tor,parms), 'fs_phong');
  var obj = this.objects[this.objects.length-1];
  obj.name = "innerTire";
  obj.setUniform('p', [.06,.04, .04,0,0,0, 0,0,0,1]);
  obj.drawType="TRIANGLE_STRIP";
  this.things["innerTire"] = obj;

  this.things.outerTire.add(obj);

  //make spokes  
  for(var i = 0 ; i < 13; i ++){
    var parms = {r1:.02,r2:1};
    this.addObject(createParametric(1/9,1/7,cyl,parms), 'fs_phong');
    var obj = this.objects[this.objects.length-1];
    obj.setUniform('p', [.02,.01, .01,0,0,0, 0,0,0,1]);
    obj.drawType="TRIANGLE_STRIP";
    var name = "spoke"+i;
    this.things[name] = name;
    this.things.outerTire.add(obj);
    this.spokes.push(obj);

    for(var v = 0 ; v < obj.vertices.length ; v+=8){

      var rotparms =[];
      rotparms.rz = (i*Math.PI*2)/13;

      var rotMat = makeMatrix(rotparms);

      var vp = [];
      vp.x = obj.vertices[v];
      vp.y = obj.vertices[v+1];
      vp.z = obj.vertices[v+2];

      var vMat = makeMatrix(vp);

      var newMat = jMatMult(vMat,rotMat);

      obj.vertices[v+0] = newMat[12];
      obj.vertices[v+1] = newMat[13];
      obj.vertices[v+2] = newMat[14];

    }

    obj.vertexBuffer = createVertexBuffer(this.canvas.gl, obj.vertices);

  }

  //make axle

  this.makeThing(
    {rx:Math.PI/2,sx:.1,sy:.1,sz:10,z:.05},
    "axle",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:1,r2:.1}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.axle);

  this.makeThing(
    {rx:Math.PI/2,sx:.12,sy:.12,sz:1,z:.62,x:.02},
    "smallAxle1",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:1,r2:.2}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.smallAxle1);

  this.makeThing(
    {rx:Math.PI/2,sx:.12,sy:.12,sz:1,z:-.62,x:.02,ry:Math.PI},
    "smallAxle2",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:1,r2:.2}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.smallAxle2);

  //pedals

  this.makeThing(
    {rz:Math.PI/2,sx:.12,sy:.12,sz:.12,z:4.4,x:.02,ry:Math.PI},
    "jangle1",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:.6,r2:5}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.jangle1);


  this.makeThing(
    {rz:Math.PI/2,sx:.12,sy:.12,sz:.12,z:-4.4,x:.02,ry:Math.PI*2},
    "jangle2",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:.6,r2:5}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.jangle2);

  //pedal pivots
  this.makeThing(
    {rx:-Math.PI/2,sx:.12,sy:.12,sz:.12,z:4,x:-5.02},
    "jangle1A",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:.6,r2:5}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.jangle1A);

  this.makeThing(
    {rx:Math.PI/2,sx:.12,sy:.12,sz:.12,z:-4,x:5.02},
    "jangle2A",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    createParametric(1/24,1/18,cyl,{r1:.6,r2:5}),
    'fs_phong'
  );
    this.things.outerTire.add(this.things.jangle2A);

  this.makeThing(
    {rx:Math.PI/2,sx:1,sy:1,sz:1,x:-.3,z:.32},//,z:-4,x:5.02},
    "pedalJoint1",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    [0],
    'fs_phong'
  );
   this.things.outerTire.add(this.things.pedalJoint1);

  this.makeThing(
    {rx:Math.PI/2,sx:1,sy:1,sz:1,x:.3,z:-.32},//,z:-4,x:5.02},
    "pedalJoint2",
    [.06,.04, .04,0,0,0, 0,0,0,1],
    [0],
    'fs_phong'
  );
   this.things.outerTire.add(this.things.pedalJoint2);

  this.makeThing(
    {rx:Math.PI/2,sx:2,sy:.5,sz:3},//,x:-.3,z:.32},//,z:-4,x:5.02},
    "pedal1",
    [.5,.45, .49,0,0,0, 0,0,0,1],
    createCube(),
    'fs_phong'
  );
   this.things.pedalJoint1.add(this.things.pedal1);

  this.makeThing(
    {rx:Math.PI/2,sx:2,sy:.5,sz:3},//,x:-.3,z:.32},//,z:-4,x:5.02},
    "pedal2",
    [.5,.45, .49,0,0,0, 0,0,0,1],
    createCube(),
    'fs_phong'
  );
   this.things.pedalJoint2.add(this.things.pedal2);



  this.makeThing(
    {rx:Math.PI/2,sx:.1,sy:.1,sz:2,z:.05},        //initial translation
    "smallAxle",                                  //name
    [.06,.04, .04,0,0,0, 0,0,0,1],                //uniform
    createParametric(1/24,1/12,cyl,{r1:2,r2:.1}), //object
    'fs_phong'                                    //material
  );
    this.things.outerTire.add(this.things.smallAxle);  

  this.makeThing(
    {ry:Math.PI/2,rz:Math.PI/2,y:.45,sx:2,sy:2,sz:2},
    "wangle",
    [.5,.02, .02,0,0,0, 0,0,0,1],
    createParametric(1/32,1/24,tor,{r1:.16,r2:.04}),
    'fs_phong'
  );
  this.things.wangleParent.add(this.things.wangle);

  this.makeThing(
    {z:1},
    "wangleton",
    [.04,.02, .02,0,0,0, 0,0,0,1],
    createParametric(1/52,1/24,tor,{r1:1,r2:.2}),
    'fs_phong'
  );

  this.makeThing(
    {ry:Math.PI/2,rz:Math.PI/2,y:1.4,sx:2,sy:2,sz:2},
    "seatPoint",
    [1,.02, .02,0,0,0, 0,0,0,1],
    [0],
    'fs_phong'
  );
    this.things.wangleParent.add(this.things.seatPoint);

  //wingle the wangle
  var o = this.things.wangle;
  console.log(o.vertices);
  for(var i = 0 ; i < o.vertices.length ; i+=8){
    if(o.vertices[i]>0){
      o.vertices[i]+=5*.45;
      o.vertices[i]*=.2;
    }
  }
  o.vertexBuffer = createVertexBuffer(this.canvas.gl, o.vertices);
  this.things.wheel.add(this.things.outerTire);

  this.makeThing(
    {y:.6,sx:2,sy:2,sz:2},
    "shaft",
    [.5,.02, .02,0,0,0, 0,0,0,1],
    createParametric(1/12,1/18,cyl,{r1:.04,r2:.5}),
    'fs_phong'
  );
  this.things.wangleParent.add(this.things.shaft);
}

canvas1.onmousemove = function(event) { // Mouse moved
  moveMouse(this.handle, event);
}

function moveMouse(handle, event) {
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  if ( rect.left <= x && x <= rect.right &&
      rect.top  <= y && y <= rect.bottom ) {
    handle.mouseX = x - rect.left;
    handle.mouseY = y - rect.top;
  }
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
    if(evt.keyCode == 68){
      d.debug=!d.debug;
    }
     if(evt.keyCode == 87){
      canvas1.speed -= 1;
    }
  }

      

  


  
  
