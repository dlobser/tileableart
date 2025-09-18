
size(960,540);

//set background to white
background(255);

//Every command executes in order from top to bottom - so lower lines will draw on top of higher up lines.
//If you want to change the color of an object use the 'fill' command

//fill(0); will be black and opaque, fill(0,0); will be black and transparent
//fill(0,128); will be black and semi-transparent, fill(255,0,255) will be purple, 
//fill(255,255,0,128) will be yellow and half opaque,

fill(255,128,0,255);

//There is no circle function, only an ellipse - we'll see later how to make our own functions
//I use 'width' and 'height' throughout - in this case width is 960 and height is 540
//The nice thing about using these variables is that even if you decide to resize a canvas later
//all of the proprtions will remain the same.

//ellipse(x coordinate, y coordinate, x width, y height);

ellipse(width/2,height/2,100,100);

fill(128,255,32,255);

//rect(upper left x, upper left y, width, height);

rect(width/2-50,height/2+100,100,100);

fill(0,128,255,255);

//triangle(corner x, corner y, corner x, corner y, corner x, corner y);

triangle(width/2-50,height/2-100,width/2+50,height/2-100,width/2,75);

//There are multiple ways to set the fill
fill(0,0);

//strokeWeight() changes the thickness of lines

strokeWeight(5);

//arc has all the same inputs as circle with the addition of a start and end point in radians
//look here for an explanation of the relationship between radians and PI

arc(width/2,height/2-100,250,250,PI,PI*2);

//These two lines connect from the edges of the ellipse

//line(X1, Y1, X2, Y2);

line(width/2+125,height/2-100,width/2+125,height/2+200);
line(width/2-125,height/2-100,0,height/2-100);

//stroke works the same as 'fill' but it colors the stroke instead

stroke(50,190,125);
strokeWeight(15);

//the horizon line across the frame and 200 down from the middle

line(0,height/2+200,width,height/2+200);

//colorMode lets you map you fill options differently
//In this case we switch from RGB mode to HSB mode and set our high value to 1 instead of 255
//by default colorMode is colorMode(RGB,255);
//By switching to HSB mode you only need to tweak one value to produce a rainbow of color

colorMode(HSB,1);

//turns of strokes

noStroke();

//later on we'll see how to produce this effect with loops
//when programming you want to have as few repeated lines as possible.
//Notice that in the fill function I'm only changing the first value (hue) from 0 to 1, 
//also notice that 0 and 1 produce the same color (red) as we've gone all the way around the hue circle

fill(0,1,1,1);
rect(50, height/2-50, 250, 20);
fill(.2,1,1,1);
rect(50, height/2-30, 250, 20);
fill(.4,1,1,1);
rect(50, height/2-10, 250, 20);
fill(.6,1,1,1);
rect(50, height/2+10, 250, 20);
fill(.8,1,1,1);
rect(50, height/2+30, 250, 20);
fill(1,1,1,1);
rect(50, height/2+50, 250, 20);

fill(0,255);
stroke(0);
strokeWeight(1);
text("Program or be Programmed",100,100);
