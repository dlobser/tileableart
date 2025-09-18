
size(960,540);

float speed = .01;
int amount = 10;
float radius = 10;

//This is one way to make an array.  I am making 2 to store X and Y coordinates
//http://www.processing.org/tutorials/2darray/

int[] arrayX = new int[(amount*amount)];
int[] arrayY = new int[(amount*amount)];

/* 	Here are some other examples from http://stackoverflow.com/questions/1200621/how-to-declare-an-array-in-java
	int[] myIntArray = new int[3];
	int[] myIntArray = {1,2,3};
	int[] myIntArray = new int[]{1,2,3};
*/

float time = 0;

void setup(){

	for (var i = 0; i < amount; i++) {
		for (var j = 0; j < amount; j++) {
			arrayX[j+i*amount] = (width /amount/2) + i * (width/amount);
			arrayY[j+i*amount] = (height/amount/2) + j * (height/amount);
		}
	}
}

void draw(){

	if(mouseX != pmouseX && mouseY != pmouseY){

		time += speed;
		fill(255,8);
		rect(0,0,width,height);
		fill(255,255);

		for (var i = 0; i < amount; i++) {
			for (var j = 0; j < amount; j++) {

				int q = j+i*amount;
				float distance = dist(arrayX[q],arrayY[q],mouseX,mouseY);

				if(distance<200){
					//http://www.processing.org/reference/noise_.html
					arrayX[q]+=((noise(q+time)-.5)*13)		/(distance*.01);
					arrayY[q]+=((noise(q+time+100)-.5)*13)	/(distance*.01);
				
				}
				
				ellipse(arrayX[q],arrayY[q],radius,radius);
			}
		}
	}
}