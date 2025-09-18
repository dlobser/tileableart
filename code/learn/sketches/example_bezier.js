
size(960,540);

fill(0,0);

float X1,Y1,X2,Y2,X3,Y3,X4,Y4;
boolean click,clicked;
boolean one,two,three,four;
color myColor;

void setup(){

	click=clicked=false;
	one=two=three=four=false;
	X1 = ceil(random(width)	);
	Y1 = ceil(random(height));
	X2 = ceil(random(width)	);
	Y2 = ceil(random(height));
	X3 = ceil(random(width)	);
	Y3 = ceil(random(height));
	X4 = ceil(random(width)	);
	Y4 = ceil(random(height));
	myColor = color(random(150,250),random(100,200),random(50,100));

}

void draw(){

	if(mouseX != pmouseX && mouseY != pmouseY || click){

		background(200);

		if(clicked==false){
			if(click){
				if (dist(mouseX,mouseY,X1,Y1) < 50){
					one=true;
					two=three=four=false;
					clicked=true;
				}
				else if (dist(mouseX,mouseY,X2,Y2) < 50){
					two=true;
					one=three=four=false;
					clicked=true;
				}
				else if (dist(mouseX,mouseY,X3,Y3) < 50){
					three=true;
					one=two=four=false
					clicked=true;
				}
				else if (dist(mouseX,mouseY,X4,Y4) < 50){
					four=true;
					one=two=three=false;
					clicked=true;
				}
				else{
					one=two=three=four=false;
				}
			}
		}
		else{
			if (one){
				X1 = mouseX;
				Y1 = mouseY;
			}
			if (two){
				X2 = mouseX;
				Y2 = mouseY;
			}
			if (three){
				X3 = mouseX;
				Y3 = mouseY;
			}
			if (four){
				X4 = mouseX;
				Y4 = mouseY;
			}
		}

		if(click)
			fill(myColor);
		else
			fill(0,255);
		
		ellipse(X1,Y1,10,10);
		ellipse(X2,Y2,10,10);
		ellipse(X3,Y3,10,10);
		ellipse(X4,Y4,10,10);

		strokeWeight(2);
		fill(0,100);
		bezier(X1,Y1,X2,Y2,X3,Y3,X4,Y4);

		strokeWeight(.25);

		line(X1,Y1,X2,Y2);
		line(X2,Y2,X3,Y3);
		line(X3,Y3,X4,Y4);

		fill(255,255);
		text("x: " + X1 + " y: " + Y1,X1+5,Y1);
		text("x: " + X2 + " y: " + Y2,X2+5,Y2);
		text("x: " + X3 + " y: " + Y3,X3+5,Y3);
		text("x: " + X4 + " y: " + Y4,X4+5,Y4);

		textSize(20);
		text("bezier("+
			X1+","+
			Y1+","+
			X2+","+
			Y2+","+
			X3+","+
			Y3+","+
			X4+","+
			Y4+
			");",5,height-5);
	}

}

void mousePressed(){
	click=true;
	console.log("clicked " + clicked + " click " + click);
}

void mouseReleased(){
	myColor = color(random(150,250),random(100,200),random(50,100));
	clicked=false;
	click=false;
	console.log(clicked);
}
