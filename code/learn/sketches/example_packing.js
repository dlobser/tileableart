
// I'm using a variable here so I can make it smaller as more cirlces are added, speeding up the algorithm
float largeSize = 200;
// Amount of balls we'll add
int num = 100;

// item keeps track of how many items have been added to the array
int item;

// This Boolean is there just to draw things differently one last time once the calculations are done
boolean drawEnd = true;

// http://processing.org/reference/Array.html
// This is an array - you need to set the size of an array when you declare it.
// I'm using this one dimensional array as a three dimensional array
// The array will look something like this: things{positionX,positionY,radius,positionX,positionY,radius,...}

float[] things = new float[num*3];

void setup(){
	size(960,540);
	background(0);
	item=1;
}

void draw(){

	boolean draw = false;

	//Once we count up to the number of total balls we want we'll stop

	if(item<num){

		// I start by generating a random X,Y position and a radius
		// We'll then check to see if there's already a ball on the screen that overlaps it
		float posX = random(width);
		float posY = random(height);
		float radius = largeSize;

		//For demonstration purposes I'm drawing all the test balls as a darker color
		//Only the balls that fit the rules will be white

		fill(random(50,150),random(100),random(75));
		noStroke();
		ellipse(posX,posY,radius,radius);

		//Item is the number of balls, but to store X,Y and radius I'm using an array where
		//those values are stored one after the other so every third item represents info about a new ball

		for(int i = 0 ; i < things.length ; i+=3 ){

			//This draws one white ball for every ball stored in the array
			fill(255);
			ellipse(things[i],things[i+1],things[i+2],things[i+2]);

			//We'll check every item in the array to see if our new ball overlaps
			if(dist(posX,posY,things[i],things[i+1]) < 1+(radius + things[i+2])/2){

				//If the new ball overlaps we won't be drawing it
				//I reduce the 'largeSize' variable which will make sure that over the course
				//of time smaller balls will be getting introduced as they'll have a better
				//shot at not overlapping
				draw = false;

				//shrink the balls if they're not too small
				if(largeSize>5)
					largeSize--;

				//this gets us out of the loop
				break;
			}
			else{
				//After we've checked all the items, if none of them overlap draw becomes true
				draw=true;
			}
		}

		//If draw is true then we add our new values onto the array

		if(draw){

			things[3*item]=posX;
			things[3*item+1]=posY;
			things[3*item+2]=radius;

			//count up the items when we add them for our check
			item++;

			//scale up the balls so we don't wind up with all tiny balls
			largeSize+=10;

		}
	}
	//If item is greater than num that means we're done and we do one last drawing off all the white balls
	else{
		if(drawEnd){
			//a black background
			fill(0,255);
			rect(0,0,width,height);

			for(int i = 0 ; i < item*3 ; i+=3 ){
				fill(255);
				ellipse(things[i],things[i+1],things[i+2],things[i+2]);
			}

			drawEnd=false;
		}
	}
}

