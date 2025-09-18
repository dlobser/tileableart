sc1 = {
	
	setup:function(){

		var sphGeo = new THREE.SphereGeometry(1,90,90);
		sphere9 = new THREE.Mesh(sphGeo,camNormReflShader.clone());
		sphere10 = new THREE.Mesh(sphGeo,camNormReflShader);
		sphere1 = new THREE.Mesh(sphGeo,camNormShader);

		// sphere1.material.uniforms['color'].value = new THREE.Vector3(.7,.8,.9);
		sphere2 = new THREE.Mesh(sphGeo,simpleMat);
		sphere3 = new THREE.Mesh(sphGeo,simpleNorm);
		sphere4 = new THREE.Mesh(sphGeo,simpleUvs);
		sphere5 = new THREE.Mesh(sphGeo,simplePos);
		sphere6 = new THREE.Mesh(sphGeo,perlin3DShader);
		sphere7 = new THREE.Mesh(sphGeo,perlin2DShader);
		sphere8 = new THREE.Mesh(sphGeo,simpleWPos);
		sphere1.position.x = -2;
		sphere2.position.x = 2;
		sphere3.position.y = -2;
		sphere4.position.y = -2;
		sphere3.position.x = -1.2;
		sphere4.position.x = 1.2;
		sphere5.position.y = 0;
		sphere6.position.y = 2;
		sphere7.position.y = 2;
		sphere6.position.x = -1.2;
		sphere7.position.x = 1.2;
		sphere8.position.x = -4.2;
		sphere9.position.x=-3.3;
		sphere9.position.y=2;
		sphere10.position.x=-5.4;
		sphere10.position.y=2;
		sphere10.position = new THREE.Vector3(-5,2,0);
		scene.add(sphere1);
		scene.add(sphere2);
		scene.add(sphere3);
		scene.add(sphere4);
		scene.add(sphere5);
		scene.add(sphere6);
		scene.add(sphere7);
		scene.add(sphere8);
		scene.add(sphere9);
		scene.add(sphere10);


		count=0;

	},

	draw:function(){

		sphere8.rotation.y+=.1;
		sphere3.rotation.y+=.1;
		sphere1.rotation.y+=.1;


		count++;
		camera.updateMatrixWorld();
		sphere1.material.uniforms['camMat'].value = camera.matrixWorld;
		sphere9.material.uniforms['camMat'].value = camera.matrixWorld;
		sphere10.material.uniforms['camMat'].value = camera.matrixWorld;
		sphere10.material.uniforms['switcher'].value = 1;
		sphere9.material.uniforms['switcher'].value = 0;
		sphere2.material.uniforms['camMat'].value = camera.matrixWorld;

		sphere5.position.y=Math.sin(count*.1)*.4;
		sphere5.position.x=Math.cos(count*.1)*.4;
		sphere5.position.z=Math.cos(count*.05)*.4;


	}
};



var noise = "\
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
float noise(vec3 P) {\
	vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
	vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
	vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
	vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
	vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
	vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
	vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
	gx0 = fract(gx0); gx1 = fract(gx1);\
	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
	gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
	gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
	vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
		 g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
		 g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
		 g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
	vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
	vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
	g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
	g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
				   dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
			  vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
				   dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
	return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
}\
float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
float turbulence(vec3 P) {\
	float f = 0., s = 1.;\
for (int i = 0 ; i < 9 ; i++) {\
   f += abs(noise(s * P)) / s;\
   s *= 2.;\
   P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
}\
	return f;\
}\
";

var bumpVert = "\
	varying vec3 vecNormal;\
	varying vec3 pos;\
	varying vec2 vUv;\
	varying vec3 wNormal;\
	uniform float switcher;\
	void main() {\
		vUv = uv;\
		pos = position;\
		vecNormal = normal;\
		wNormal = mat3(modelMatrix[0].xyz,modelMatrix[1].xyz,modelMatrix[2].xyz)*normal;\
		wNormal = normalize(wNormal);\
		gl_Position = projectionMatrix *\
		modelViewMatrix * vec4(position, 1.0 );\
	}\
";


var camSpaceNorm = "\
	precision highp float;\
	uniform mat4 camMat;\
	uniform mat4 camMatInverse;\
	varying vec3 wNormal;\
	varying vec2 vUv;\
	varying vec3 pos;\
	void main(void) {\
		vec4 camNorm = vec4(vec3(wNormal),0.) * camMat;\
		gl_FragColor = vec4(camNorm.xyz, 1.0);\
	}\
";


var camNormShader = new THREE.ShaderMaterial({
	uniforms: THREE.UniformsUtils.merge([
		THREE.UniformsLib['lights'],
		{	
			camMat: {type: 'm4', value:new THREE.Matrix4()},
		}
	]),
	vertexShader: bumpVert,
	fragmentShader: camSpaceNorm,
});


var camSpaceReflNorm = "\
	precision highp float;\
	uniform mat4 camMat;\
	varying vec3 wNormal;\
	varying vec3 vecNormal;\
	varying vec2 vUv;\
	varying vec3 pos;\
	uniform float switcher;\
	vec3 reflRay(vec3 dir, vec3 norm) {\
		vec3 ray;\
		float ldn = dot(dir, norm);\
       	vec3 refl = 2. * ldn * norm - dir;\
		return refl;\
	}\
	void main(void) {\
		vec4 camNorm = vec4(vec3(wNormal),0.) * camMat;\
		vec3 refl = reflRay(normalize(camMat[3].xyz),wNormal.xyz);\
		float n = turbulence(refl);\
		if(switcher<.5)\
			gl_FragColor = vec4(vec3(n), 1.0);\
		else\
			gl_FragColor = vec4(refl, 1.0);\
	}\
";


var camNormReflShader = new THREE.ShaderMaterial({
	uniforms: THREE.UniformsUtils.merge([
		THREE.UniformsLib['lights'],
		{	
			camMat: {type: 'm4', value:new THREE.Matrix4()},
			switcher: {type:'f', value:0},
		}
	]),
	vertexShader: bumpVert,
	fragmentShader: noise+camSpaceReflNorm,
});


var perlin3D = "\
	precision highp float;\
	varying vec3 pos;\
	void main(void) {\
		gl_FragColor = vec4(vec3(.5+noise(pos*5.)), 1.0);\
	}\
";

var perlin3DShader = new THREE.ShaderMaterial({
	vertexShader: bumpVert,
	fragmentShader: noise+perlin3D,
});


var perlin2D = "\
	precision highp float;\
	varying vec2 vUv;\
	varying vec3 pos;\
	void main(void) {\
		gl_FragColor = vec4(vec3(.5+noise(vec3(vUv.x*20.,vUv.y*10.,0.))), 1.0);\
	}\
";

var perlin2DShader = new THREE.ShaderMaterial({
	vertexShader: bumpVert,
	fragmentShader: noise+perlin2D,
});

var simpleVert = "\
	varying vec3 vecNormal;\
	varying vec3 wNormal;\
	varying vec2 vUv;\
	varying vec3 pos;\
	varying vec3 wPos;\
	void main() {\
		vUv = uv;\
		pos = (modelMatrix * vec4(position, 1.0 )).xyz;\
		wPos = (viewMatrix * modelMatrix * vec4(position, 1.0 )).xyz;\
		vecNormal = normal;\
		wNormal = mat3(modelMatrix[0].xyz,modelMatrix[1].xyz,modelMatrix[2].xyz)*normal;\
		wNormal = normalize(wNormal);\
		gl_Position = projectionMatrix *\
		modelViewMatrix * vec4(position, 1.0 );\
	}\
";

var simpleFrag = "\
	precision highp float;\
	varying vec3 vecNormal;\
	varying vec2 vUv;\
	varying vec3 pos;\
	uniform mat4 camMat;\
	void main(void) {\
		vec4 camNorm = vec4(vec3(vecNormal),0.) * camMat;\
		gl_FragColor = vec4(vec3(-camNorm.z+1.), 1.0);\
	}\
";

var simpleMat = new THREE.ShaderMaterial({
	uniforms: THREE.UniformsUtils.merge([
	THREE.UniformsLib['lights'],
		{	
			camMat: {type: 'm4', value:new THREE.Matrix4()},
		}
	]),
	vertexShader: simpleVert,
	fragmentShader: simpleFrag,
});

var simpleNormal = "\
	precision highp float;\
	varying vec3 vecNormal;\
	uniform float color;\
	varying vec2 vUv;\
	varying vec3 pos;\
	void main(void) {\
		vec4 lgts = vec4(vec3(0.0),1.0);\
		gl_FragColor = vec4(vecNormal, 1.0);\
	}\
";

var simpleNorm = new THREE.ShaderMaterial({
	vertexShader: simpleVert,
	fragmentShader: simpleNormal,
});

var uvs = "\
	precision highp float;\
	varying vec3 vecNormal;\
	uniform float color;\
	varying vec2 vUv;\
	varying vec3 pos;\
	void main(void) {\
		vec4 lgts = vec4(vec3(0.0),1.0);\
		gl_FragColor = vec4(vUv,0., 1.0);\
	}\
";

var simpleUvs = new THREE.ShaderMaterial({
	vertexShader: simpleVert,
	fragmentShader: uvs,
});

var pos = "\
	precision highp float;\
	varying vec3 pos;\
	varying vec2 vUv;\
	void main(void) {\
		vec4 lgts = vec4(vec3(0.0),1.0);\
		gl_FragColor = vec4(pos, 1.0);\
	}\
";

var simplePos = new THREE.ShaderMaterial({
	vertexShader: simpleVert,
	fragmentShader: pos,
});


var wPos = "\
	precision highp float;\
	varying vec3 vecNormal;\
	varying vec3 wNormal;\
	varying vec2 vUv;\
	varying vec3 pos;\
	void main(void) {\
		vec4 lgts = vec4(vec3(0.0),1.0);\
		gl_FragColor = vec4(wNormal, 1.0);\
	}\
";

var simpleWPos = new THREE.ShaderMaterial({
	vertexShader: simpleVert,
	fragmentShader: wPos,
});