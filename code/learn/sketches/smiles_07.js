
int recursions = 10;

void setup(){
  size(960,540);
}

void draw(){
  strokeWeight(10);	
  background(255);
  branch(width/2,height-50,1,0,recursions);
}


void branch(float x, float y, float sc, float rot, int levels){
  
  //this if statement means we won't enter an infinite loop
  if(levels>0){
    pushMatrix();
      translate(x,y);
      rotate(rot);
      scale(sc,sc);
      line(0,0,0,-120);
      float mx = mouseX; //convert to a float
      
      //notice that the function calls itself
      branch(0,-120,sc*.9,mx/100,levels-1);
      branch(0,-120,sc*.9,-mx/100,levels-1);
      
    popMatrix();
  }
}