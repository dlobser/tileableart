
//this sketch introduces loops, conditionals, and some new processing functionality

size(960,540);

float innerPetal = 100;

void setup(){}

void draw(){

	//This is a conditional statement - 
	//it says if the position of the mouse is not the same as the previous position of the mouse, 
	//execute the code inside the braces
	//I set this up so it only draws when you move the mouse as it is a little processor intensive.
	//mouseX==mouseX would be true - mouseX!=mouseX would be false (! is 'not') || means 'or' && means and

	if(mouseX != pmouseX || mouseY != pmouseY){

		fill(255,100);

		//rect is like ellipse, but here you define the upper left corner and the lower right corner

		rect(0,0,width,height);

		//I'm connecting the number of petals to the mouse position - but I need to use the 'ceil' function
		//which rounds it up to the nearest integer.

		int petals = ceil(mouseX/50)+3;
		float outerPetal = mouseY;

		//pushMatrix() is a function which allows you to move things in processing - 
		//if I didn't translate my frame like this the drawing would all happen in the upper left corner

		pushMatrix();
		translate(width/2,height/2);

		//Most loops are for and while loops
		//a for loop has three terms, an integer you (usually) create, 
		//while it's less than a certain number (in this case 'petals' )
		//execute the code inside the braces and increment up the variable
		//loops are a deep and complex topic, have a look here for a quick start
		//http://processing.org/reference/for.html

		for(int i = 0 ; i < petals ; i++){

			float q = (i/petals)*(PI*2);
			float p = PI/petals*2;

			bezier(
				sin(q)*innerPetal,cos(q)*innerPetal,
				sin(q)*outerPetal,cos(q)*outerPetal,
				sin(q+p)*outerPetal,cos(q+p)*outerPetal,
				sin(q+p)*innerPetal,cos(q+p)*innerPetal);
		}

		//when I popMatrix() it means that everything follows will be in the place I tell it to be,
		//instead of being translated by my previous command
		popMatrix();

		fill(10,255);
		rect(0,height-20,120,80);
		fill(255);

		//the following demonstrates string concatenation - 
		//this is how you can mix explicit text wrapped in "quotes" and variable names
		text("petals: " + petals + " " + "size: " + outerPetal,5,height-5);
	}
}
