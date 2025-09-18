void setup() {  
  size(1000,1000);
}
//this is for swapping the BG color when mouse is pressed
int value = 0;
  
   
void draw(){
  smooth();
  fill(value);
  //make some random variables
   float bob=random(-30,30);
   float bobby=random(-30,30);
   float bob2=random(-100,100);
   float bobby2=random(-100,100);
  
  //making the dots and line spray
  
  stroke(random(0,.5)*mouseX,random(.1,.3)*mouseX,random(.12,.5)*mouseY,random(0,255));
  strokeWeight(random(1,10));
  fill(random(0,5)*mouseX,random(1,3)*mouseX,random(12,5)*mouseY,random(0,255));
  float chuckx = random(0,1000);
  float chucky = random(0,1000);
  
  ellipse(bob+chuckx,bobby+chucky,20,20);
  ellipse(bob2+chuckx,bobby2+chucky,10,10);
  
  //laying them out for tiling
  
    ellipse(bob+chuckx+1000,bobby+chucky+1000,20,20);
  ellipse(bob2+chuckx+1000,bobby2+chucky+1000,10,10);
    ellipse(bob+chuckx+1000,bobby+chucky,20,20);
  ellipse(bob2+chuckx+1000,bobby2+chucky,10,10);
    ellipse(bob+chuckx,bobby+chucky+1000,20,20);
  ellipse(bob2+chuckx,bobby2+chucky+1000,10,10);
    ellipse(bob+chuckx-1000,bobby+chucky+1000,20,20);
  ellipse(bob2+chuckx-1000,bobby2+chucky+1000,10,10);
    ellipse(bob+chuckx-1000,bobby+chucky-1000,20,20);
  ellipse(bob2+chuckx-1000,bobby2+chucky-1000,10,10);
    ellipse(bob+chuckx+1000,bobby+chucky-1000,20,20);
  ellipse(bob2+chuckx+1000,bobby2+chucky-1000,10,10);
    ellipse(bob+chuckx-1000,bobby+chucky,20,20);
  ellipse(bob2+chuckx-1000,bobby2+chucky,10,10);
    ellipse(bob+chuckx,bobby+chucky-1000,20,20);
  ellipse(bob2+chuckx,bobby2+chucky-1000,10,10);
 
  //draw a line between two circles
  
  line(bob+chuckx,bobby+chucky,bob2+chuckx,bobby2+chucky);
  
  //layout for tiling
  
  line(bob+chuckx+1000,  bobby+chucky+1000,  bob2+chuckx+1000,  bobby2+chucky+1000);
  line(bob+chuckx+1000,  bobby+chucky,       bob2+chuckx+1000,  bobby2+chucky);
  line(bob+chuckx,       bobby+chucky+1000,  bob2+chuckx,       bobby2+chucky+1000);
  line(bob+chuckx-1000,  bobby+chucky+1000,  bob2+chuckx-1000,  bobby2+chucky+1000);
  line(bob+chuckx-1000,  bobby+chucky-1000,  bob2+chuckx-1000,  bobby2+chucky-1000);
  line(bob+chuckx+1000,  bobby+chucky-1000,  bob2+chuckx+1000,  bobby2+chucky-1000);
  line(bob+chuckx-1000,  bobby+chucky,       bob2+chuckx-1000,  bobby2+chucky);
  line(bob+chuckx,       bobby+chucky-1000,  bob2+chuckx,       bobby2+chucky-1000);

for (int i=0;i<100;i++)
fill(random(0,.2)*mouseX,random(.1,.4)*mouseY,random(.12,.6)*mouseX,random(0,255));
noStroke();
beginShape();
//float chuckx = random(0,1000);
//float chucky = random(0,1000);
float rand1 = random(-200,200);
float rand2 = random(-200,200);
float rand3 = random(-200,200);
float rand4 = random(-200,200);
float rand5 = random(-200,200);
float rand6 = random(-200,200);
curveVertex (chuckx,chucky);
curveVertex (chuckx+rand1,chucky+rand2);
curveVertex (chuckx+rand3,chucky+rand4);
curveVertex (chuckx+rand5,chucky+rand6);
endShape(CLOSE);
//this section duplicates and offsets - ++,+0,0+,-+,--,+-,-0,0-
beginShape();
curveVertex (chuckx+1000,chucky+1000);
curveVertex (chuckx+rand1+1000,chucky+rand2+1000);
curveVertex (chuckx+rand3+1000,chucky+rand4+1000);
curveVertex (chuckx+rand5+1000,chucky+rand6+1000);
endShape(CLOSE);
beginShape();
curveVertex (chuckx+1000,chucky);
curveVertex (chuckx+rand1+1000,chucky+rand2);
curveVertex (chuckx+rand3+1000,chucky+rand4);
curveVertex (chuckx+rand5+1000,chucky+rand6);
endShape(CLOSE);
beginShape();
curveVertex (chuckx,chucky+1000);
curveVertex (chuckx+rand1,chucky+rand2+1000);
curveVertex (chuckx+rand3,chucky+rand4+1000);
curveVertex (chuckx+rand5,chucky+rand6+1000);
endShape(CLOSE);
beginShape();
curveVertex (chuckx-1000,chucky+1000);
curveVertex (chuckx+rand1-1000,chucky+rand2+1000);
curveVertex (chuckx+rand3-1000,chucky+rand4+1000);
curveVertex (chuckx+rand5-1000,chucky+rand6+1000);
endShape(CLOSE);
beginShape();
curveVertex (chuckx-1000,chucky-1000);
curveVertex (chuckx+rand1-1000,chucky+rand2-1000);
curveVertex (chuckx+rand3-1000,chucky+rand4-1000);
curveVertex (chuckx+rand5-1000,chucky+rand6-1000);
endShape(CLOSE);
beginShape();
curveVertex (chuckx+1000,chucky-1000);
curveVertex (chuckx+rand1+1000,chucky+rand2-1000);
curveVertex (chuckx+rand3+1000,chucky+rand4-1000);
curveVertex (chuckx+rand5+1000,chucky+rand6-1000);
endShape(CLOSE);
beginShape();
curveVertex (chuckx-1000,chucky);
curveVertex (chuckx+rand1-1000,chucky+rand2);
curveVertex (chuckx+rand3-1000,chucky+rand4);
curveVertex (chuckx+rand5-1000,chucky+rand6);
endShape(CLOSE);
beginShape();
curveVertex (chuckx,chucky-1000);
curveVertex (chuckx+rand1,chucky+rand2-1000);
curveVertex (chuckx+rand3,chucky+rand4-1000);
curveVertex (chuckx+rand5,chucky+rand6-1000);
endShape(CLOSE);
}

void mouseClicked() {
  saveFrame("line-######.png");
  background(value);
  if (value == 0) {
    value = 255;
  } else {
    value = 0;
  }
}

