
size(960,540);

//ellipse is a 'function' - you'll be working with lots of those.
//a function let's you encapsulate complicated code into a simple wrapper
//in this case the way ellipse works is like this: ellipse(x-coordinate, y-coordinate, radius-x, radius-y)
//In processing 0,0 in x,y is in the upper left corner and the numbers get bigger as the screen moves right and down

ellipse(480,270,400,400);
fill(0);
ellipse(400,200,40,40);
ellipse(560,200,40,40);

//bezier works the same way that beziers work in Illustrator, but you're only defining one segment at a time
//In illustrator, each segment has four points and Processing works the same way where each number is an
//x and y coordinate for a point
//        x      y      x     y      x     y      x      y
bezier(480-115, 300, 480-30, 260, 480+30, 260, 480+115, 300);
bezier(480-115, 300, 480-50, 450, 480+50, 450, 480+115, 300);
fill(255);
ellipse(400-10,200-10,10,10);
ellipse(560-10,200-10,10,10);





