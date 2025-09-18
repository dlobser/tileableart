
//setting up some colors to pick by name - not necessary but makes for easier reading
color white = color(255,255,255);
color red; 
color blue;

void setup(){
  size(960,540);
}

void draw(){

  //CORNERS is a mode that lets you set the corners of rectangles explicityly
  //normally you'd set the upper left of a rectangle and then the offset in x and y
  rectMode(CORNERS);
  frameRate(2);
  //amount determines the amount of recursion
  int amount = int(random(6,10));

  //All the rectangles are classes, the following lines begin the process of recursion
  Rect brecht = new Rect(0,0,width,height,amount);
  brecht.split(1);
  brecht.display();

}

class Rect{
  
  //upper X, upper Y, lower X, lower Y - for the rectangles
  float uX,uY,lX,lY;

  //amt is a number that counts down for each recursion
  //when it gets to one it will stop recursing
  int amt;
  
  color myColor;

  //Each recursion creates new rectangles which are added to the arraylist of the parent
  ArrayList<Rect> children;

  //this is just an array I'm using to keep track of the random X and Y positions
  int[][] grid;

  //This class constructor defines simply the corners of a rectangle and recursion depth (amount)
  Rect(float ux, float uy, float lx, float ly, int amount){
    
    uX = ux;
    uY = uy;
    lX = lx;
    lY = ly;    
   
    amt = amount;
   
    children = new ArrayList<Rect>();
    
    grid = new int[1][3];
    
    for(int i = 0 ; i < grid.length ; i ++){

      for(int j = 0 ; j < grid[i].length ; j+=3){
        
        //This assigns a random value between the X values of the present rectangle
        //as well as the Y values, and the third value is used to set the line width of the rectangles

        grid[i][j]   = int(lerp(uX,lX,random(.2,.8)));
        grid[i][j+1] = int(lerp(uY,lY,random(.2,.8)));
        grid[i][j+2] = 2+int(pow(amount,.5))*8;
                
      }
    }
    
    //This section sets up rules for picking the colors of the squares

    int colorPick;

    if(dist(uX,uY,lX,lY)>300)
      colorPick=0;
    else
      colorPick = int(random(4,9));
        
    red = color(random(200,255),random(70),0);
    blue = color(0,random(40),random(200,255));
    
    switch(colorPick){
      case 7: myColor = red;
        break;
      case 8: myColor = blue;
        break;
      default: myColor = white;
        break;
    }

  }

  void display(){  

  	//The rectangles will only be drawn if they're at the end of the chain
  	//This is determined by the 'amt' being 0 - where no more recursion is possible

    if(amt==0){
      fill(myColor,255);
      strokeWeight(grid[0][2]);
      rect(uX,uY,lX,lY); 
    }
    
    //The display function is recursive, it will perform this same operation for all children
    //So display() only needs to be called on the top node

    if(!children.isEmpty()){
      for (int i = 0 ; i < children.size() ; i++){
        Rect drect = children.get(i);
        drect.display();
      }
    }
  }

  void split(int minus){

    if (amt>0){
    
      amt-=minus;
      
      Rect nrect;
      Rect orect;

      //This number determines whether we split horizontally or vertically
      float r = random(1);  

      if(r<.5){
        
        //This number has been set in the split function - it's a random number between uX and lX
        float pos = grid[0][0];
        
        //I want to split the larger square, this keeps it from getting too squished up too fast
        if(pos-uX > lX-pos){
        	//I create 2 new rectangles for each split
          nrect = new Rect(uX,uY,pos,lY,amt);
          orect = new Rect(pos,uY,lX,lY,amt);
        }
        else{
          nrect = new Rect(pos,uY,lX,lY,amt);
          orect = new Rect(uX,uY,pos,lY,amt); 
        }
      }
      else{
       
       	//this section is the same - but using my random Y number
        float pos = grid[0][1];
        
        if(pos-uY > lY-pos){
          nrect = new Rect(uX,uY,lX,pos,amt);
          orect = new Rect(uX,pos,lX,lY,amt);
        }
        else{
          nrect = new Rect(uX,pos,lX,lY,amt);
          orect = new Rect(uX,uY,lX,pos,amt);
        }
      }
      
      //These newly generated rectangles are added to the children so they can be recursively displayed
      children.add(nrect);

      //Splitting both rectangles results in a very different look than just splitting one, so in this case
      //I'm randomly setting one of the Rect's amt value to 0, meaning it will have no children,
      //and its legacy will die with it

      if(random(1)>.2)
        orect.amt = 0 ;

      children.add(orect);
     
     	//split is called on both of the new rectangles
      nrect.split(1);
      orect.split(1);
    }  
  }  
}

//function to expand arrays, like append() but I prefer this syntax
float[] expand(float[] array, float value){
  float[] tempArray = new float[array.length+1];
  for(int i = 0 ; i < array.length ; i++){
   tempArray[i] = array[i]; 
  }
  tempArray[tempArray.length-1] = value;
  return tempArray;
}