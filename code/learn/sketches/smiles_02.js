
size(960,540);

//setup variables
//capitalizing variablesLikeThis whereTheFirst character is lowerCase and the following characters are uppercase
//is known as 'camel case' and is considered good practice for most kinds of variables.

//Processing mostly uses float(0.5,1.2,3.333,etc), int(1,2,3,etc), String("hello"), char(a,$,Q,etc), boolean true or false

float headSize = 400;
float headPosX = width/2;
float headPosY = height/2;
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

