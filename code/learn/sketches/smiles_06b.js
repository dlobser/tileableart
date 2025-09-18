
size(960,540);

// item keeps track of how many items have been added to the array
int item;

// I'm using a variable here so I can make it smaller as more cirlces are added, speeding up the algorithm
float largeSize = 200;
// Amount of balls we'll add
int num = 100;

// This is an array - you need to set the size of an array when you declare it.
// I'm using this one dimensional array as a three dimensional array
// http://processing.org/reference/Array.html

float[] things = new float[num*3];

void setup(){
	background(0);
	item=1;
}

void draw(){

	boolean draw = false;

	if(item<num){

		float posX = random(width);
		float posY = random(height);
		float radius = largeSize;//random(largeSize);

		fill(random(50,150),random(100),random(75));
		noStroke();
		ellipse(posX,posY,radius,radius);

		for(int i = 0 ; i < item*3 ; i+=3 ){

			fill(255);
			ellipse(things[i],things[i+1],things[i+2],things[i+2]);

			if(dist(posX,posY,things[i],things[i+1]) < (radius + things[i+2])/2){
				stroke(2);
				line(posX,posY,things[i],things[i+1]);
				draw = false;
				if(largeSize>5)
					largeSize--;
				break;
			}
			else{
				draw=true;
			}
		}

		if(draw){

			boolean grow = true;

			while(grow){
				
				for(int i = 0 ; i < item*3 ; i+=3 ){
					if(dist(posX,posY,things[i],things[i+1]) < ((radius + things[i+2])/2)){

						if(radius>200)
							radius=200;

						while((dist(posX,posY,things[i],things[i+1]) < ((radius + things[i+2])/2))){
							radius--;
							//console.log(radius);
						}
						things[3*item]=posX;
						things[3*item+1]=posY;
						things[3*item+2]=radius;
						item+=2;
						//largeSize+=10;
						
						grow=false;
						break;
					}
					else{
						//if(radius !> 200){
						radius++;
						//}
					}
				}
			}
		}
		console.log(item);
		if(item>10){
			for(int i = 0 ; i < item*3 ; i+=3 ){
				if(dist(posX,posY,things[i],things[i+1]) < ((radius + things[i+2])/2)){
					item--;
					break;
				}
			}
		}

	}
	else{
		if(draw){
			for(int i = 0 ; i < item*3 ; i+=3 ){
				fill(255);
				ellipse(things[i],things[i+1],things[i+2],things[i+2]);
			}
		}
	}
}

