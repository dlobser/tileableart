String[] poems = {
"Up the airy mountain down the rushy glenn we dare not go a hunting for fear of little men Wee folk good folk Trooping all together Green jacket red cap And a white owl's feather"
,"We are the music makers And we are the dreamers of dreams Wandering by lone sea breakers And sitting by desolate streams World losers and world forsakers Upon whom the pale moon gleams Yet we are the movers and shakers Of the world forever it seems"
,"I am he as you are he as you are me and we are all together See how they run like pigs from a gun, see how they flynI'm crying Sitting on a cornflake waiting for the van to come Corporation tee-shirt stupid bloody tuesday Man you been a naughty boy, you let your face grow long I am the eggman"
,"Shall I compare thee to a summer's day thou art more lovely and more temperate rough winds do shake the darling buds of may and summer's lease hath all too short a date"
};
int pickPoem = int(random(4));

String[] type = split(poems[pickPoem]," ");
int numBalls = type.length;
Ball[] balls = new Ball[numBalls];

int w = 960;
int h = 540;

void setup() {
  //println(type[0]);
  size(w,h);

  for (int i = 0; i<numBalls; i++) {
    balls[i] = new Ball(balls, i, random(width), random(height), random(2), color(random(128,255), random(128,255), random(128,255)), i, random(2,5),type[i]);
  }
}

void draw() {
  fill(255,200);
  rect(0,0,width,height);
  noStroke();

  for (int i = 0; i<numBalls; i++) {


    balls[i].noiseMove();
    balls[i].collide();
    balls[i].move();
    balls[i].display();
    balls[i].mover();
  }
  text(poems[pickPoem],width/2,height-5);
}

class Ball {

  float tx, ty, rad, q, offset, vx, vy,happyLine,counter,speed;
  color shade;
  Ball[] others;
  int id,lineCount;
  String word;
  
  

  Ball(Ball[] myOthers, int myid, float mytx, float myty, float myrad, color myColor, float myOffset,float mySpeed,String myWord) {
    tx = mytx;
    ty = myty;
    rad = myrad;
    shade = myColor;
    offset = myOffset;
    others = myOthers;
    id = myid;
    speed = mySpeed;
    word = myWord;
    lineCount = 0;
    
  }

  void display() {    

    fill(shade);
    pushMatrix();
    translate(tx, ty);
    scale(rad, rad);
    ellipse(0, 0, 40, 40);
    textAlign(CENTER);
    fill(0);
    if (q*100%((noise(offset)*10)+10)>0 && q*100%((noise(offset)*10)+10) < 10) {
      text("(-)-(-)", 0, 0);
    }
    else {
      text("(*)-(*)", 0, 0);
    }
    text(word,0,15);
    popMatrix();
  }

  void happy() {
    pushMatrix();
    pushStyle();
    fill(0,0);
    strokeWeight(happyLine);
    stroke(255,255,0);
    translate(tx, ty);
    scale(rad, rad);
    ellipse(0, 0, 40, 40);
    popMatrix();
  }


  void collide() {
    counter--;
    if(happyLine>0){

    happyLine--;
    }
    for (int i = id+1; i < numBalls; i++) {

      // defining dx and dy for the first time, (distance x and y)
      // in this case (confusing) .x and .y is the others x subtract this x and y
      float dx = others[i].tx - tx;
      float dy = others[i].ty - ty;

      //this is a slightly more efficient way of doing "dist"
      float distance = sqrt(dx*dx + dy*dy);

      //the minimum distance is this diameter *s the others diameter
      float minDist = others[i].rad*40/2 + rad*40/2;
      //println(rad);
      if (distance < minDist) { 

        if (counter<0) {
          color temp = shade;     
          shade = others[i].shade;
          others[i].shade = temp;
          others[i].counter=350;
          counter=350;
          print(word + " " + others[i].word + " ");
          lineCount +=5;
          if(lineCount>10){
            println("");
            lineCount = 0;
          }
        
        }
        if(counter>0){
            happyLine=10;
        }

        float angle = atan2(dy, dx);

        //defining new float target x goes in the right direction
        float targetX = tx + cos(angle) * minDist;
        float targetY = ty + sin(angle) * minDist;

        //defining new float ax and ay as ... *.1 is the damping amount
        float ax = (targetX - others[i].tx);
        float ay = (targetY - others[i].ty);


        vx -= ax;
        vy -= ay;

        others[i].vx += ax;
        others[i].vy += ay;

      }
    }
  }

  void move() {
    tx+=vx;
    ty+=vy;
    vx*=.9;
    vy*=.9;
    if (tx>width) {
      tx=0;
    }
    if (ty>height) {
      ty=0;
    }
    if(tx<0){
      tx=width;
    }
    if(ty<0){
      ty=height;
    }
  }

  void chango() {
    for (int i = 0; i < others.length ; i++) {
      if (i==id&&i<others.length-1) {
        i++;
      }
      float ox = others[i].tx-tx;
      float oy = others[i].ty-ty;

      if (abs(ox)<(others[i].rad+rad)*10&&abs(oy)<others[i].rad+rad*10) {

        others[i].tx -= ox;
        others[i].ty -= oy;
        tx+=ox;
        ty+=oy;
      }
    }
  }

  void mover() {
    float vx = tx-mouseX;
    float vy = ty-mouseY;

    if (dist(tx, ty, mouseX, mouseY)<100) {
      tx-=vx*.1;
      ty-=vy*.1;
    }
  }

  void noiseMove() {
    if (counter<0) {
      tx+=map(noise(q+offset), 0, .9, -speed, speed);
      ty+=map(noise(q+100+offset), 0, .9, -speed, speed);
      q+=.01;
    }
  }
}

