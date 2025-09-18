
size(960,540);

float headSize = 400;
int black = 0;
int white = 255;

float eyeOffsetX = 80;
float eyeOffsetY = 75;
float eyeSize = 40;

float mouthEdgesX = 115;
float mouthEdgesY = 30;
float upperMouthX = 30;
float upperMouthY = 15;
float lowerMouthY = 185;
float lowerMouthX = 50;
float lowerMouthX = 50;

float highLightSize = 10;
float highLightOffset = 8;

//setup and draw are the two functions you need to make Processing animate
//setup runs once at the beginning and draw runs in a loop, updating once per frame

void setup(){}

void draw(){

	//these variables must be in the draw loop because they'll be changing every frame

	float headPosX = mouseX;
	float headPosY = mouseY;

	ellipse(headPosX,headPosY,headSize,headSize);
	fill(black);
	ellipse(headPosX+eyeOffsetX,headPosY-eyeOffsetY,eyeSize,eyeSize);
	ellipse(headPosX-eyeOffsetX,headPosY-eyeOffsetY,eyeSize,eyeSize);

	bezier(
		headPosX-mouthEdgesX,headPosY+mouthEdgesY,
		headPosX-upperMouthX,headPosY-upperMouthY,
		headPosX+upperMouthX,headPosY-upperMouthY,
		headPosX+mouthEdgesX,headPosY+mouthEdgesY
		);
	bezier(
		headPosX-mouthEdgesX,headPosY+mouthEdgesY,
		headPosX-lowerMouthX,headPosY+lowerMouthY,
		headPosX+lowerMouthX,headPosY+lowerMouthY,
		headPosX+mouthEdgesX,headPosY+mouthEdgesY
		);

	fill(white);

	ellipse(headPosX+eyeOffsetX-highLightOffset,headPosY-eyeOffsetY-highLightOffset,
		highLightSize,highLightSize
		);
	ellipse(headPosX-eyeOffsetX-highLightOffset,headPosY-eyeOffsetY-highLightOffset,
		highLightSize,highLightSize
		);
}
