sc1 = {
    
    setup:function(){

        tree = new TREE();
        tree.branch();
        scene.add(tree);

        tree.generate({
            joints:[10,5],
            rads:[1,2],
            divs:[1],
            start:[8],
        })

        frameRate=1;

            // init the library
        var webaudio    = new WebAudio();
        // create a sound

        sounds = [];
        objects = [];

        var sphere = new THREE.Mesh(new THREE.SphereGeometry(10),new THREE.MeshLambertMaterial());


        var lib = ["sine",1.0000,0.0480,0.4420,0.7020,0.1350,0.9440,89.0000,217.0000,2000.0000,-0.0700,0.2840,0.0000,7.9763,0.0003,0.0000,0.0000,0.1000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
        var lib = ["sine",1.0000,0.0480,0.0640,0.0300,0.1350,0.0200,89.0000,217.0000,2000.0000,-0.0700,0.2840,0.0000,7.9763,0.0003,0.0000,0.0000,0.1000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
        console.log(webaudio);
       
        

        // console.log(objects);
        // console.log(obj);


        for(var i = 0 ; i < 3 ; i++){
            console.log(i);
                    var lib = ["sine",1.0000,0.0480,Math.random()*4,Math.random()*4,Math.random()*4,Math.random()*4,89.0000,217.0000,2000.0000,-0.0700,0.2840,0.0000,7.9763,0.0003,0.0000,0.0000,0.1000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];

            // boing   = webaudio.createSound().generateWithJsfx(lib);
             boing   = webaudio.createSound();
              boing.tone((Math.random()*200)+200,30);
            obj = new THREE.AudioObject(boing);
            sounds.push(obj);
            objects.push(sphere.clone());
            // sounds.push(webaudio.createSound());
            // sounds[i].tone((Math.random()+1)*500,3);
            // sounds[i].loop(true).play();
            // sounds[i].volume(10);
            // scene.add(sounds[i].sph);
            // console.log(sounds);
            scene.add(objects[i]);
        }
        // sound   = webaudio.createSound();
        // load sound.wav and play it

        // console.log(sound);

        // console.log(jsfx);
       
        
       // sound.tone(440);
       //  sound.loop(true).play();
       //  sound.volume(10);

        // var lib     = ["sine",1.0000,0.0480,0.4420,0.7020,0.1350,0.9440,89.0000,217.0000,2000.0000,-0.0700,0.2840,0.0000,7.9763,0.0003,0.0000,0.0000,0.1000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
    // here you create a sound with webaudio.js and generate it with jsfx.js
    // after that ```boing``` is a ```WebAudio.Sound``` so you can play it
    // and do many other things allow by the
    // [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html).
    // We did a short plugin for that ```webaudio.sound.jsfx.js``` 
    // boing   = webaudio.createSound().generateWithJsfx(lib);

    // Here we create another sound. Once again generater by jsfx.js editor 
    // var lib     = ["square",0.0000,0.4000,0.0000,0.3560,0.0000,0.1900,20.0000,358.0000,2400.0000,0.3000,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.1810,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
    // var jump    = webaudio.createSound().generateWithJsfx(lib);

    // here we play the sound.
    // boing.loop(true).play();
    // jump.play();
    for(var i = 0 ; i < sounds.length ; i++){
            objects[i].position.x = Math.sin(i+time*2)*100;
            objects[i].position.z = Math.cos(i+time*2)*100;
            sounds[i].position.x = Math.sin(i+time*2)*100;
            sounds[i].position.z = Math.cos(i+time*2)*100;
            sounds[i].update(camera);
            // sounds[i].updateWithObject3dCam(objects[i],camera,time);
        }
       
        

    },

    draw:function(time){
        // obj.position.x = Math.sin(time)*120;
        // obj.update(camera);

        // console.log(objects[0]);
       // sound.tone(rmouseX);
        // sound.loop(true).play();
        for(var i = 0 ; i < sounds.length ; i++){
            objects[i].position.x = Math.sin(i+time*2)*100;
            objects[i].position.z = Math.cos(i+time*2)*100;
            sounds[i].position.x = Math.sin(i+time*2)*100;
            sounds[i].position.z = Math.cos(i+time*2)*100;
            sounds[i].update(camera);
            // sounds[i].updateWithObject3dCam(objects[i],camera,time);
        }
        // tree.position.x+=Math.sin(time*2)*10;

        // sound.updateWithObject3dCam(tree,camera,time);

      
    }
}