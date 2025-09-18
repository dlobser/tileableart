
size(960,540);

// http://www.processing.org/tutorials/pshape/

// In Processing, width and height will return the width and height of the window
// line is a function that draws a line between two x,y coordinates like this: line(x1,y1,x2,y2)
// so this will draw a diagonal line across the screen

//line(0,0,width,height);

// random is the easiest way to start introducing variation automatically
// if you don't specify a second value random(value1, value2) like that
// it will pick a random value between 0 and whichever number you specify

// line(random(width),random(height),random(width),random(height));
// line(random(960),random(540),random(960),random(540));
// line(random(200,700),random(100,400),random(200,700),random(100,400));

//http://processing.org/reference/fill_.html

fill(255,200);

//This is one way to make a background, if you set it to be semi-transparent you can also use it to fade out elements

rect(0,0,width,height);

fill(255,128,0,200);

ellipse(width/2+random(100),height/2+random(100),300,300);

fill(128,255,32,200);

rect(width/2+random(50,100),height/2+random(-100,-200),300,300);

fill(0,128,255,200);

triangle(width/2-random(100,200),height/2-random(150,250),
	width/2+random(100,200),height/2-random(150,250),
	width/2,height/2+random(150,250));

//float is a type of variable that can use decimal points
//I define variables once and reuse them in different ways
//fill(0,0) means fill(black,0 alpha)

fill(0,0);

float X1 = random(100,250);
float Y1 = random(50,100);

float X2 = random(100,350);
float Y2 = random(150,300);

float X3 = random(100,350);
float Y3 = random(300,450);

float X4 = random(100,250);
float Y4 = random(450,500);

ellipse(X1,Y1,10,10);
ellipse(X2,Y2,10,10);
ellipse(X3,Y3,10,10);
ellipse(X4,Y4,10,10);

strokeWeight(6);

bezier(X1,Y1,X2,Y2,X3,Y3,X4,Y4);

strokeWeight(.5);

line(X1,Y1,X2,Y2);
line(X2,Y2,X3,Y3);
line(X3,Y3,X4,Y4);

