
//this sketch introduces loops, conditionals, and some new processing functionality

size(960,540);

float counter = 0;

void setup(){
	noCursor();
}

void draw(){

	//again, everything is in this if statement just to keep it from rendering when the mouse is not moving
	if(mouseX != pmouseX || mouseY != pmouseY){

		background(255);
		counter++;

		translate(mouseX,mouseY);

		flower(100,250,8);
		face(map(sin(counter*.2),-1,1,.9,1),.5);

		//map is a function that let's you set some original bounds then the new bounds
		//you want them to be constrained to - in this case sin and cos give values from -1 to 1										


	}
	
}

//just like an ellipse is a function, we can make our own functions and call them whatever we want
//it's an excellent way to keep the draw loop clean and simple while organizing your code.
//the following bits take everything we've done so far and encapsulates it into some usable code 
//that can be controlled from a higher level.

void flower(float innerPetal, float outerPetal, int petals){

	for(int i = 0 ; i < petals ; i++){

		strokeWeight(3);

		float q = (i/petals)*(PI*2);
		float p = PI/petals*2;

		bezier(
			sin(q)*innerPetal,cos(q)*innerPetal,
			sin(q)*outerPetal,cos(q)*outerPetal,
			sin(q+p)*outerPetal,cos(q+p)*outerPetal,
			sin(q+p)*innerPetal,cos(q+p)*innerPetal
		);
	}

}

//it can be a tricky thing deciding how much control to give to a user
//you want to have as few inputs as possible

void face(float mouthOpen, float size){

	//In this version I'm no longer basing the positions of all the points on a variable axis
	//rather, everything is centered at zero and the position will be modified elsewhere

	headPosX = 0;
	headPosY = 0;

	int black = 0;
	int white = 255;

	float headSize = 400;

	float eyeOffsetX = 80;
	float eyeOffsetY = 75;
	float eyeSize = 40;

	float mouthEdgesX = 115;
	float mouthEdgesY = 30;

	float upperMouthX = 30;
	float upperMouthY = 15 * mouthOpen;

	float lowerMouthY = 185 * mouthOpen;
	float lowerMouthX = 50;

	float highLightSize = 10;
	float highLightOffset = 8;

	pushMatrix();
	scale(size);

	ellipse(headPosX,headPosY,headSize,headSize);
	fill(black);
	ellipse(eyeOffsetX,-eyeOffsetY,eyeSize,eyeSize);
	ellipse(-eyeOffsetX,-eyeOffsetY,eyeSize,eyeSize);

	//upper mouth
	bezier(
		-mouthEdgesX,mouthEdgesY+1,
		-upperMouthX,-upperMouthY,
		upperMouthX,-upperMouthY,
		mouthEdgesX,mouthEdgesY+1
		);

	//lower mouth
	bezier(
		-mouthEdgesX,mouthEdgesY,
		-lowerMouthX,lowerMouthY,
		lowerMouthX,lowerMouthY,
		mouthEdgesX,mouthEdgesY
		);

	fill(white);

	ellipse(eyeOffsetX-highLightOffset,-eyeOffsetY-highLightOffset,highLightSize,highLightSize);
	ellipse(-eyeOffsetX-highLightOffset,-eyeOffsetY-highLightOffset,highLightSize,highLightSize);

	popMatrix();
}



