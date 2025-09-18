
makeMaze = false;
size = 50; //maze size
ruler=true;

spiralDiameter = 2.546;
loaded = false;
once = true;
curveBalls = null;


sc1 = {
    
    setup:function(){

        var5=true;

        renderer.sortObjects = false;
        
        cUp = 0;
        cUpC = 0;
        cAp = 0;
        spheres = [];
        ln = [];
        didIt = false;
        readyToWrite = false;
        objInfo = {};

        matOpac = 1;

        linePickSetup();
        linePickSphere = sphere(.1);
        scene.add(linePickSphere);

        w = size;
        h = size;
        
        whichBall = -1;
        profileCurve = {};

        showGeo=false;
        mousePushed = false;
        lines = [];
        linesOut = [];
        lineTo = false;
        newLine = true;
        countUp = 0;


        geo = new THREE.CylinderGeometry( .1,.1,1);
        mat = new THREE.MeshLambertMaterial({color:0x222222});
        ball = sphere(.1);

        blobs = [];


        prnt = new THREE.Object3D();
        scene.add(prnt);

        var stack = [];

        frameRate = 1;
        

        if(ruler){
            Ruler = new THREE.Object3D();
            scene.add(Ruler);
            ruler = new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshLambertMaterial());

            var ruleGeo = new THREE.SphereGeometry(.2);
            var mat = new THREE.MeshBasicMaterial( {color:0x000000} );
            ruler.position.x=2;
            Ruler.add(ruler);
            for(var i = -11 ; i < 11 ; i++){
                for(var j = 0 ; j < 20 ; j++){
                    ruler = new THREE.Mesh(ruleGeo,mat);
                    // ruler.position.z = -1;
                    ruler.position.x = i*10;
                    ruler.position.y = j*10;
                    Ruler.add(ruler);
                }
            }
          }

        sph = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial({color:0x888888}));
        
        scl(prnt,3);
        prnt.scale.z=10;
        prnt.position.x=-45;
        prnt.position.y=-45;

        up = 0;
        upf = 0;

        rebuildGui({values:{nothing:0,outputScale:1,
        curveDetail     :0.5 ,
        petals          :0.0,
        petalAmount     :0.0,
        petals2          :0.0,
        petalAmount2     :0.0,
        twist           :0.0,
        twist2          :0.0,
        wobbleFrequency :0.0,
        wobbleAmount    :0.0,
        loops:0.5,
        noiseAmount:0.0,
        noiseFreq:0.0,
        ynoiseFreq:0.0,
        loopdyNoise:0.0,
        loopdyLoop:0.0,
        loopdyOffset:0.0,
        looper:0.0,
        },sliders:0.1,
        })
        setSliders({"var1":1,"var2":0,"var3":.731,"var4":.1,"var5":.06,"var6":.1,"var7":.1,
            "var8":.6,"var9":.1,"var10":.1,"var11":.75,"var12":.16,"var13":.25,"var14":1,"outputScale":.2513,
            "curveDetail":.27,
            "loops":.2,
            "loopdyLoop":0.0,
            "loopdyNoise":0.0,
            "twist2":0
            });  
        varY=true;
        
        makeCurve();
        
    },
    
    draw:function(time){

        colorCurveBalls();

        setTimeout(function(){
            if(once){
                once=false;
                var5=false;
            }
        },1200);
       

        if(varR){
            var output = "";
            output += "objInfo=";
            output += JSON.stringify(data);
            output += ";";
            output += saveObjPositions();
            output += "var3=true;";
            console.log(output);
            varR = false;
        }
        if(varW){
            tree = new TREE();
            var arr = [];
            arr.push(sph.geometry.vertices);
            thing = tree.tubes(arr);
            scene.add(thing);
            // varW=false;
        }

        if(varE){
           matOpac = mouseX;
        }
        if(var3){
            updateArgs2();
            var3=false;
        }
        if(var4){
            if(readyToWrite){
                lines.push(ln);
                varY=false;
                makeLines();
                // scene.remove(sph);
                if(var2)
                    saveGCode(linesOut,"basket");
                else
                    saveGCode2(linesOut,"basket");
                // savePS(linesOut,"hot");
                console.log('saved');
                var4=false;
            }
        }
        if(var5){
            profileCurve = updateCurve(whichBall);
            linePickSphere.position = linePick();
        }
        if(var1){
            controls.center = new THREE.Vector3(0,omouseY*200,0);
        }
        if(varY){
            pillar2();
        }
        if(var5)
            updateControls=false;
        else
            updateControls = true;

        if(var2){
            setSpan("flavor","ultiMaker")
        }
        else
            setSpan("flavor","makerBot")

    }
}

function linePickSetup(){
    plane = new THREE.Mesh(new THREE.PlaneGeometry( 1000,1000,10,10),new THREE.MeshLambertMaterial( { color:0xFFFFFF, transparent:true, opacity:.0,emissive:0x99DDFF} ));
    plane.rotation.x = -pi;
}

function linePick(){

    var projector = new THREE.Projector();

    var vector = new THREE.Vector3(
    ( rmouseX / width)*2 -1,// * 2 - 1,
    - ( rmouseY / height) *2 + 1,// * 2 + 1,
    -1000 );

    var ray = projector.pickingRay( vector, camera );

    var intersect = ray.intersectObject( plane ); 

    if ( intersect.length > 0) { 

        pPos = new THREE.Vector3(intersect[0].point.x,intersect[0].point.y,intersect[0].point.z);
        return pPos;
        
    }
    else
        return new THREE.Vector3(0,0,0);
}

function makeCurve(){

    outlineCurve = {};
    curveBalls = [];
    
    data.var2=.5;
    data.var3=.1;
    data.var4=0;
    
    var upX = 0;
    var upY = 0;

    var mat = new THREE.MeshLambertMaterial( );

    curveBallObjs = new THREE.Object3D();
    scene.add(curveBallObjs);
    
    for(var i = 0 ; i < 7 ; i++){
        upX+=Math.random()*0;
        upY+=Math.random()*14;
        var tSphere = sphere(1);
        tSphere.material = mat;
        curveBallObjs.add(tSphere);
        if(i>0)
            tSphere.position = new THREE.Vector3(upX,upY,0);
        if(i==1){
            tSphere.position.y = 0;
            upX+=25;
            tSphere.position.x+=25;
        }
        // if(i==4){
        //     tSphere.position.x=10;
        // }
        // if(i==4){
        //     tSphere.position.x=5;
        // }
        var cube = new THREE.Mesh(new THREE.BoxGeometry(.1,80,.1),mat); tSphere.add(cube);
        var cube = new THREE.Mesh(new THREE.BoxGeometry(80,.1,.1),mat); tSphere.add(cube);

       
        curveBalls.push(tSphere);
    }
}

function colorCurveBalls(){

    if(curveBalls!=null){

        for (var i = 0; i < curveBalls.length; i++) {
            if(var5){
                // curveBalls[i].material.color = new THREE.Color(1,.7,.1);
                // curveBalls[i].material.opacity = 1;
                scene.add(curveBallObjs);
                scene.add(Ruler);
            }
            else{
                // curveBalls[i].material.transparent = true;
                // curveBalls[i].material.opacity = 0;//color = new THREE.Color(.5,.9,1);
                scene.remove(curveBallObjs);
                scene.remove(Ruler);
            }

        };
    }
}

function updateCurve(which){

    if(which==undefined)
        Which=0;
    else
        Which=which;
    
    if(Which > -1 && mousePressed){
        curveBalls[Which].position.x = omouseX*300;
        curveBalls[Which].position.y = omouseY*-300;
    }

   
    
    for(var i = 0 ; i < curveBalls.length ; i++){       

        if(!mousePushed){
             w=0;
            if(mousePressed && linePickSphere.position.distanceTo(curveBalls[i].position)<1){

                curveBalls[i].position.x = linePickSphere.position.x;
                curveBalls[i].position.y = linePickSphere.position.y;
                w=i;
                i=curveBalls.length;
                mousePushed = true;

            }
            else
                mousePushed = false;
        }
    }

    if(mousePushed && mousePressed){
        curveBalls[w].position.x = linePickSphere.position.x;
        curveBalls[w].position.y = linePickSphere.position.y;
    }
    else
        mousePushed = false;
    
    
    var curvies = [];
    
    for(var i = 0 ; i < curveBalls.length ; i++){
            curvies.push(curveBalls[i].position);
    }
    
    outlineCurve = new THREE.SplineCurve(curvies);

    return outlineCurve;
}

function slopeCheck(vec1,vec2,mult){
    var a = vec2.x-vec1.x;
    var b = vec2.y-vec1.y;
    var slope = b/a;
    return THREE.Math.mapLinear(Math.min(1,Math.max(0,Math.abs(slope))),0,1,mult,1);
}



function pillar2(){

    var deep = 0;
    data.var6=-1;
  
    
    if(profileCurve.points != undefined){

    var zed = .3;

    var its = 4000;
   
    var curveLength = profileCurve.getLength();

    var divisions = data.loops*1000;
    var lineWidth = 1/data.curveDetail;
    var spool = curveLength * divisions * lineWidth;

    var flowerOff = 0;

    if(cAp<spool){

        sph = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial({color:(1+Math.sin(cAp*.1)*.5) * 0xccddff,transparent:true,opacity:matOpac}));
        sph.bob = cUp;
        scene.add(sph);
        spheres.push(sph);

        if(didIt){
            while(spheres.length-1>spool/its){
                var sp = spheres[0];
                scene.remove(sp);
                sp.geometry.vertices = null;
                sp.geometry.faces = null;
                sp.geometry.dispose();
                sp.material.dispose();
                sp = null;
                
                spheres.shift();
            }
        }

        readyToWrite = false;

    }
    else{

        readyToWrite = true;
        varW=false;

        if(!var4){
            lines = [];
            ln = [];
            cUp = 0;
            sph = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial({color:0x888888}));
            sph.bob = 12;
            scene.add(sph);
            spheres.push(sph);
            didIt = true;
        }
    }

    cAp = cUp + its;

    if(cAp>spool){
        cAp=spool;
    }


    if(cAp>spool){
        cAp = spool;
        readyToWrite = true;
    }
   

    if(data.var6>0){
        cUp=0;
        cAp = spool;
    }



//     if(i=undefined)
//     var i;
//     if(p=undefined)
//     var p;

// console.log(i + "  " + p);

    // if(i < p){
    //     // p=i;
    //     console.log(i + "  " + p);
    //     cAp = i + its;
    //     cUp = i;
    // }
    // else{
    //     i = cUp;
    //     p = cUp;
    // }
    var p = cUp;

    if(!i)
        i=cUp;
    if(cUp==0)
        i=cUp;

    while(p < cAp){
    // for(var i = cUp ; i < cAp ; i++){


        spool = curveLength * divisions * lineWidth;

        var sum = Math.min(1,p/Math.ceil(spool));
        var sumi = 0;
        // if(p>1)
        sumi = Math.min(1,(p+1)/Math.floor(spool));
        // var vec = new THREE.Vector3(0,0,0);
        // if(isNaN(divisions)){
        //     console.log(sum);
        //     sum = .5;

        // }
        vec = profileCurve.getPointAt(sum);
        veci = profileCurve.getPointAt(sumi);

        var upper = slopeCheck(vec,veci,2);

        // if(vec.y<=1){
        //     // console.log(vec.z);
        //     i+=(Math.PI*2/divisions);
        //      vec = profileCurve.getPointAt((i)/Math.floor(spool));
             
        //  }
        // var slopex = veci.x - vec.x;
        // var slopey = veci.y - vec.y;
        // var slope = slopex/slopey;

        // if(slope>0 && i < cAp-1)
        //     i+=20;//Math.floor(slope);
        
        var goer = i*(Math.PI*2/divisions);
        var goeri=goer-.001;

        if(i>cUp)
            var goeri = (i-1)*(Math.PI*2/divisions);

        var flower = ((Math.sin(goer*Math.floor(data.petals*30)*(1+data.twist*.1+data.twist2*.001))));
        var flower2 = ((Math.sin(goer*Math.floor(data.petals2*90)*(1+data.twist*.1+data.twist2*.001))));

        var wobble = (data.wobbleAmount*Math.sin(i*data.wobbleFrequency*.01));
        
        var noisy = noise(
        
        Math.sin(flowerOff+goer+wobble)*data.noiseFreq*10,
        Math.cos(flowerOff+goer+wobble)*data.noiseFreq*10,
        vec.y*data.ynoiseFreq*.2) * (1+data.noiseAmount);

        var noisyi = 1 + noise(
        Math.sin(flowerOff+goeri+wobble)*data.noiseFreq*10,
        Math.cos(flowerOff+goeri+wobble)*data.noiseFreq*10,
        vec.y*data.ynoiseFreq*.2) * (1+data.noiseAmount);
        
        var multi = 1;
        if(noisy<noisyi)
            multi=-1;
        
        if(data.loopdyOffset>.1)
            flowerOff = Math.cos(goer*Math.floor(data.petals*30)*(1+data.twist*.1+data.twist2*.001)) * data.loopdyLoop * Math.sin((goer/(data.loopdyOffset*500))+data.looper*pi*2);//flower
        else
            flowerOff = Math.cos(goer*Math.floor(data.petals*30)*(1+data.twist*.1+data.twist2*.001)) * data.loopdyLoop;//flower

        var intensity = 1;
        if(vec.y<1){
            // THREE.Math.mapLinear(vec.y,0,)
            intensity = vec.y/1;
            intensity*=upper;
            if(vec.y<=0)
                intensity=0;
        }
        else
            intensity=upper;
         // intensity=1;


        flower*=intensity*data.petalAmount;
        flower2*=intensity*data.petalAmount2*.1;

        flower+=1;
        flower2+=1;

        noisy*=intensity;
        noisy+=1;


        // if(flower==0)
        //     flower=1;
        // if(flower2==0)
        //     flower2=1;
        
        var ex  = noisy*Math.sin((flowerOff+goer+wobble)  +  (multi*data.loopdyNoise* (1+Math.cos(1-noisy*Math.PI*2))/2 )  )*flower*flower2*vec.x;
        var why = noisy*Math.cos((flowerOff+goer+wobble)  +  (multi*data.loopdyNoise* (1+Math.cos(1-noisy*Math.PI*2))/2 )  )*flower*flower2*vec.x;
        
        zed = vec.y;
        if(vec.y<0)
            zed = 0;

        sph.geometry.vertices.push(new THREE.Vector3(
            ex,why,zed
            ));
       
        ln.push(new THREE.Vector3(
            ex,why,zed));

        i += 1;
        p += upper;
            
    }

    cUp+=its;

    }

    sph.rotation.x=-pi;
    var deep = 0;
}

function makeLines(){
    var up = 0;
    var lines2=[];
    for(var i = 0 ; i < lines.length ; i++){
            if(lines[i].length>1){
                lines2.push(lines[i]);
                up++;
        }
    }

    var maze = new THREE.Object3D();

    for(var i = 0 ; i < lines2.length ; i++){

        var geo = new THREE.Geometry();
        var line = new THREE.SplineCurve3(lines2[i]);

        var nLine = [];

        var segs = 4;

        for(var j = 0 ; j < lines2[i].length*segs ; j++){
            geo.vertices.push(line.getPointAt(j/(lines2[i].length*segs)));
            nLine.push(line.getPointAt(j/(lines2[i].length*segs)));
        }

        //straight lines
        //  for(var j = 0 ; j < lines2[i].length*segs ; j++){
        //     geo.vertices.push(lines2[i][j]);//line.getPointAt(j/(lines2[i].length*segs)));
        //     // nLine.push(line.getPointAt(j/(lines2[i].length*segs)));
        //     nLine.push(lines2[i][j]);
        //     // console.log(j/lines2[i].length);
        // }

        linesOut.push(nLine);

        thisLine = new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x888888}));
        maze.add(thisLine);
    }

    // maze.position.x=-size/20;
    // maze.position.y=-size/20;
    scene.add(maze);
}

function findMin(arr){

    var minX = 0;
    var minY = 0;
    var minZ = 0;

    for(var i = 0 ; i < arr.length ; i++){
        if(minX>arr[i].x)
            minX = arr[i].x;
        if(minY>arr[i].y)
            minY = arr[i].y;
        if(minZ>arr[i].z)
            minZ = arr[i].z;
    }

    var ra = [minX,minY,minZ];
    return ra;
}

function saveSBP2(arr,name) {

    // var scaleOut = outputScale || 1;

    // var name = name || "tree.obj";

    var minX = 0;
    var minY = 0;
    var minZ = 0;

    for(var i = 0 ; i < arr.length ; i++){
        for(j = 0 ; j < arr[i].length ; j++){
            if(minX>arr[i][j].x)
                minX = arr[i][j].x;
            if(minY>arr[i][j].y)
                minY = arr[i][j].y;
            if(minZ>arr[i][j].z)
                minZ = arr[i][j].z;
        }
    }

    MinX = minX;
    MinY = minY;

    var output = "";

    console.log(MinX);
    console.log(MinY);
    console.log(minZ);

    if(spiralDiameter<0)
        spiralDiameter = minX*-2;

    for(var i = 0 ; i < arr.length ; i++){

            // var offX = arr[i][0].x-MinX;
            // var offY = arr[i][0].y-MinY;
             var offX = (( arr[i][0].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
             var offY = (( arr[i][0].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            output+="J3,"+offX.toFixed(4);
            output+=","  +offY.toFixed(4);
            output+=",.2";
            output+='\n';

        for(j = 0 ; j < arr[i].length ; j++){

            var offX = (( arr[i][j].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            var offY = (( arr[i][j].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            output+="M3,"+offX.toFixed(4);
            output+=","  +offY.toFixed(4);
            output+=","  +arr[i][j].z.toFixed(4);
            output+='\n';
        }
            var end = arr[i].length-1;

            var offX = (( arr[i][end].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            var offY = (( arr[i][end].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            output+="J3,"+offX.toFixed(4);
            output+=","  +offY.toFixed(4);
            output+=",.2" ;
            output+='\n';
    }
    // return output;
    // document.write(output);
    console.log("hio");
    // alert("saved!");
    var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
    saveAs(blob, name);
}

function getOffset(){
    var offset = 0;
    var tradius = document.getElementById('fat').toString();
    var oradius = tradius.split(",");
    console.log(oradius);
    if(tradius.value>-1e6 && tradius.value < 1e6){
        offset = tradius.value * 0.5;
    }
    else{
        alert("NaN or out of range");
    }
    return offset;
}

function saveGCode(arr,name) {


    // var scaleOut = outputScale || 1;

    // var name = name || "tree.obj";

    var minX = 0;
    var minY = 0;
    var minZ = 0;

    for(var i = 0 ; i < arr.length ; i++){
        for(j = 0 ; j < arr[i].length ; j++){
            if(minX>arr[i][j].x)
                minX = arr[i][j].x;
            if(minY>arr[i][j].y)
                minY = arr[i][j].y;
            if(minZ>arr[i][j].z)
                minZ = arr[i][j].z;
        }
    }

    MinX = minX;
    MinY = minY;

    var output = " \nM73 P0 (enable build progress)\nG21 (set units to mm)\nG90 (set positioning to absolute)\nG10 P1 X-16.5 Y0 Z0 (Designate T0 Offset)\nG55 (Recall offset cooridinate system)\n(**** begin homing ****)\nG162 X Y F2500 (home XY axes maximum)\nG161 Z F1100 (home Z axis minimum)\nG92 Z-5 (set Z to -5)\nG1 Z0.0 (move Z to ÔøΩ0?)\nG161 Z F100 (home Z axis minimum)\nM132 X Y Z A B (Recall stored home offsets for XYZAB axis)\n(**** end homing ****)\nG1 X112 Y-73 Z155 F3300.0 (move to waiting position)\nG130 X0 Y0 A0 B0 (Lower stepper Vrefs while heating)\nM6 T0 (wait for toolhead, and HBP to reach temperature)\nM104 S230 T0 (set extruder temperature)\nM6 T0 (wait for toolhead, and HBP to reach temperature)\nG130 X127 Y127 A127 B127 (Set Stepper motor Vref to defaults)\nM108 R3.0 T0\nG0 X112 Y-73 (Position Nozzle)\nG0 Z0.2 (Position Height)\nM108 R4.0 (Set Extruder Speed)\nM101 (Start Extruder)\nG4 P1500 (Create Anchor)\n";

    var output = ";FLAVOR:UltiGCode\n;TIME:1081      \n;MATERIAL:1177      \n;MATERIAL2:0         \n\n;Layer count: 170\n;LAYER:0\nM107\nG1 F9000 X20.360 Y20.859 Z0.300 E-2.0\n;TYPE:WALL-OUTER\n";

    console.log(MinX);
    console.log(MinY);
    console.log(minZ);

    if(spiralDiameter<0)
        spiralDiameter = minX*-2;

    var E = 2.0;

    for(var i = 0 ; i < arr.length ; i++){

            // // var offX = arr[i][0].x-MinX;
            // // var offY = arr[i][0].y-MinY;
            //  var offX = (( arr[i][0].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            //  var offY = (( arr[i][0].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            // output+="G1 X"+arr[i][j].x;
            // output+=" Y"  +arr[i][j].y;
            // output+=" Z" + arr[i][j].z;
            // output+=" F5400";
            // output+='\n';

        for(j = 0 ; j < arr[i].length ; j++){

            // var offX = (( arr[i][j].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            // var offY = (( arr[i][j].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );
            var zed =  arr[i][j].z;
            if(zed<0)
                zed=0;
            zed+=.3;

            var off = 110+MinX;//getOffset();

            // console.log(off);
            var eValue = 0;

            var squirt = 1;

            if(arr[i][j].z<1){
                squirt=THREE.Math.mapLinear(arr[i][j].z,0,1,.6,1);
            }

            squirt=1;

            if(j>0){

                var one = arr[i][j].x - arr[i][j-1].x;
                var two = arr[i][j].y - arr[i][j-1].y;
                var dist = Math.sqrt(one*one + two*two);
                eValue = .4 * dist * data.curveDetail * squirt;

            }

             E+=eValue;

            var x = off+arr[i][j].x - MinX;
            var y = off+arr[i][j].y - MinY;
                
           output+="G1 X" + x;
            output+=" Y"  + y;
            output+=" Z"  + zed;
            output+=" E"+E;
            output+='\n';

           
        }
            // var end = arr[i].length-1;

            // var offX = (( arr[i][end].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            // var offY = (( arr[i][end].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            // output+="J3,"+offX.toFixed(4);
            // output+=","  +offY.toFixed(4);
            // output+=",.2" ;
            // output+='\n';
    }
    // return output;
    // document.write(output);
    console.log("hio");
    // alert("saved!");
    var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
    saveAs(blob, name);
}

function saveGCode2(arr,name) {


    // var scaleOut = outputScale || 1;

    // var name = name || "tree.obj";

    var minX = 0;
    var minY = 0;
    var minZ = 0;

    for(var i = 0 ; i < arr.length ; i++){
        for(j = 0 ; j < arr[i].length ; j++){
            if(minX>arr[i][j].x)
                minX = arr[i][j].x;
            if(minY>arr[i][j].y)
                minY = arr[i][j].y;
            if(minZ>arr[i][j].z)
                minZ = arr[i][j].z;
        }
    }

    MinX = minX;
    MinY = minY;

    var output = " \nM73 P0 (enable build progress)\nG21 (set units to mm)\nG90 (set positioning to absolute)\nG10 P1 X-16.5 Y0 Z0 (Designate T0 Offset)\nG55 (Recall offset cooridinate system)\n(**** begin homing ****)\nG162 X Y F2500 (home XY axes maximum)\nG161 Z F1100 (home Z axis minimum)\nG92 Z-5 (set Z to -5)\nG1 Z0.0 (move Z to ÔøΩ0?)\nG161 Z F100 (home Z axis minimum)\nM132 X Y Z A B (Recall stored home offsets for XYZAB axis)\n(**** end homing ****)\nG1 X112 Y-73 Z155 F3300.0 (move to waiting position)\nG130 X0 Y0 A0 B0 (Lower stepper Vrefs while heating)\nM6 T0 (wait for toolhead, and HBP to reach temperature)\nM104 S230 T0 (set extruder temperature)\nM6 T0 (wait for toolhead, and HBP to reach temperature)\nG130 X127 Y127 A127 B127 (Set Stepper motor Vref to defaults)\nM108 R3.0 T0\nG0 X112 Y-73 (Position Nozzle)\nG0 Z0.2 (Position Height)\nM108 R4.0 (Set Extruder Speed)\nM101 (Start Extruder)\nG4 P1500 (Create Anchor)\n";

    // var output = ";FLAVOR:UltiGCode\n;TIME:1081      \n;MATERIAL:1177      \n;MATERIAL2:0         \n\n;Layer count: 170\n;LAYER:0\nM107\nG1 F9000 X20.360 Y20.859 Z0.300 E-2.0\n;TYPE:WALL-OUTER\n";

    console.log(MinX);
    console.log(MinY);
    console.log(minZ);

    if(spiralDiameter<0)
        spiralDiameter = minX*-2;

    var E = 2.0;

    for(var i = 0 ; i < arr.length ; i++){

            // // var offX = arr[i][0].x-MinX;
            // // var offY = arr[i][0].y-MinY;
            //  var offX = (( arr[i][0].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            //  var offY = (( arr[i][0].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            // output+="G1 X"+arr[i][j].x;
            // output+=" Y"  +arr[i][j].y;
            // output+=" Z" + arr[i][j].z;
            // output+=" F5400";
            // output+='\n';

        for(j = 0 ; j < arr[i].length ; j++){

            // var offX = (( arr[i][j].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            // var offY = (( arr[i][j].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );
            var zed =  arr[i][j].z;
            if(zed<0)
                zed=0;
            zed+=.3;

            var off = 110+MinX;//getOffset();

            // console.log(off);
            var eValue = 0;

            var squirt = 1;

            if(arr[i][j].z<1){
                squirt=THREE.Math.mapLinear(arr[i][j].z,0,1,.6,1);
            }

            squirt=1;

            if(j>0){

                var one = arr[i][j].x - arr[i][j-1].x;
                var two = arr[i][j].y - arr[i][j-1].y;
                var dist = Math.sqrt(one*one + two*two);
                eValue = .4 * dist * data.curveDetail * squirt;

            }

             E+=eValue;

            var x = arr[i][j].x;// - MinX;
            var y = arr[i][j].y;// - MinY;
                
           output+="G1 X" + x;
            output+=" Y"  + y;
            output+=" Z"  + zed;
            output+=" F2000";
            output+='\n';

           
        }
            // var end = arr[i].length-1;

            // var offX = (( arr[i][end].x-MinX ) / ( MinX*-2 )) * ( spiralDiameter );
            // var offY = (( arr[i][end].y-MinY ) / ( MinY*-2 )) * ( spiralDiameter );

            // output+="J3,"+offX.toFixed(4);
            // output+=","  +offY.toFixed(4);
            // output+=",.2" ;
            // output+='\n';
    }
    // return output;
    // document.write(output);
    console.log("hio");
    // alert("saved!");
    var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
    saveAs(blob, name);
}

function savePS(arr,name) {

    // var scaleOut = outputScale || 1;

    // var name = name || "tree.obj";

    var minX = 0;
    var minY = 0;
    var minZ = 0;

    for(var i = 0 ; i < arr.length ; i++){
        if(minX>arr[i].x)
            minX = arr[i].x;
        if(minY>arr[i].y)
            minY = arr[i].y;
        if(minZ>arr[i].z)
            minZ = arr[i].z;
    }

    MinX = minX;
    MinY = minY;

    var output = "";

    // console.log(MinX);
    // console.log(MinY);
    // console.log(minZ);

    for(var i = 0 ; i < arr.length ; i++){

        var offX = (arr[i][0].x-MinX);
        var offY = (arr[i][0].y-MinY);
        output+=offX.toFixed(4)+" "+offY.toFixed(4)+" moveto"+"\n";

        for(var j = 0 ; j < arr[i].length ; j++){
            var offX = (arr[i][j].x-MinX);
            var offY = (arr[i][j].y-MinY);

            output+=offX.toFixed(4)+" "+offY.toFixed(4)+" lineto"+"\n";
                
        }

    }
    // return output;
    // document.write(output);
    console.log("hio");
    // alert("saved!");
    var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
    saveAs(blob, name);
}

function scl(obj,size){
    obj.scale.x = size;
    obj.scale.y = size;
    obj.scale.z = size;
}

function saveObjPositions(){

    var tOutput = "";

    for( var i = 0 ; i < curveBalls.length ; i++){
        tOutput+="curveBalls["+i+"].position.x = "+curveBalls[i].position.x + ";";
        tOutput+="curveBalls["+i+"].position.y = "+curveBalls[i].position.y + ";";
    }

    return tOutput;
    // console.log(tOutput);
}

function updateArgs(){
    return JSON.parse('{"nothing":0,"outputScale":0.2513,"whichBall":0,"curveDetail":0.27,"petals":0,"petalAmount":0,"twist":0,"wobbleFrequency":0,"wobbleAmount":0,"loops":0.2,"noiseAmount":0,"noiseFreq":0,"ynoiseFreq":0,"var1":1,"var2":0.5,"var3":0.1,"var4":0,"var5":0.06,"var6":0.1,"var7":0.1,"var8":0.6,"var9":0.1,"var10":0.1,"var11":0.75,"var12":0.16,"var13":0.25,"var14":1,"var15":0}');
}

function updateArgs2(){
         var info2 = objInfo;
            for (var key in info2) {
                if (info2.hasOwnProperty(key)){
                    data[key] = info2[key];
                }
            }
}

function updateCurveBallPosition(){
    eval("curveBalls[0].position.x = 0;curveBalls[0].position.y = 0;curveBalls[1].position.x = 23.365973071428016;curveBalls[1].position.y = 0;curveBalls[2].position.x = 27.7419545147568;curveBalls[2].position.y = 13.889639396220446;curveBalls[3].position.x = 30.811484779929742;curveBalls[3].position.y = 23.283632886596024;curveBalls[4].position.x = 18.99004015983411;curveBalls[4].position.y = 37.556180356674716;curveBalls[5].position.x = 34.89053697466704;curveBalls[5].position.y = 51.34011915360074;curveBalls[6].position.x = 9.359568135282302;curveBalls[6].position.y = 43.99794782562665;");
}

// var imagedata = getImageData( imgTexture.image );
// var color = getPixel( imagedata, 10, 10 );

