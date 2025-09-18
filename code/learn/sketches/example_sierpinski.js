
Tri tri;
float tx,ty;
float sizer = 300;


void setup(){
  
  size(960,540);
  noStroke();
  
 
  translate(width/2,height/2+70);
  tx=(-size)+width/2;
  ty=(-size)+height/2;
  
  float b = (PI*2)/3;
  rotate(PI/3);
  tri = new Tri(sin(0)*sizer,cos(0)*sizer,sin(b)*sizer,cos(b)*sizer,sin(b*2)*sizer,cos(b*2)*sizer,7);
  tri.display();
  
}

void draw(){}



class Tri{
  
  float p1x,p1y,p2x,p2y,p3x,p3y;
  int amt;
  
  Tri(float $1x, float $1y, float $2x, float $2y, float $3x, float $3y,int depth){
    p1x = $1x;
    p2x = $2x;
    p3x = $3x;
    p1y = $1y;
    p2y = $2y;
    p3y = $3y;
    amt = depth;
  }
  
  void display(){
    fill(0);
    triangle(p1x,p1y,p2x,p2y,p3x,p3y);
    float l1x = lerp(p1x,p2x,.5);
    float l1y = lerp(p1y,p2y,.5);
    float l2x = lerp(p2x,p3x,.5);
    float l2y = lerp(p2y,p3y,.5);
    float l3x = lerp(p3x,p1x,.5);
    float l3y = lerp(p3y,p1y,.5);
    fill(255);
    triangle(l1x,l1y,l2x,l2y,l3x,l3y);
    
    if(amt-1>0){
      Tri tri1 = new Tri(p1x,p1y,l1x,l1y,l3x,l3y,amt-1);
      tri1.display();
      Tri tri2 = new Tri(p2x,p2y,l2x,l2y,l1x,l1y,amt-1);
      tri2.display();
      Tri tri3 = new Tri(p3x,p3y,l3x,l3y,l2x,l2y,amt-1);
      tri3.display();
    }
  }
}