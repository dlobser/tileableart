import arb.soundcipher.*;

SoundCipher sc = new SoundCipher(this);

float[] pitches = new float[1]; // c major 7th
int[] IDs = new int[1];
int IDer = 1;

float time;

int note,noter;

//sc.playNote(60, 100, 2.0);
// make a square with a grid inside of it
// choose one grid line, make two new rectangles
// do this recursively
Rect brecht;

int amount;
//float[][] squares = new float[100][3];
String[] words = {"h","e","l","l","o"};
int q = 0;

Rect[] tangles;

color white = color(255,255,255);
color red;// = color(255,0,0);
color blue;// = color(0,0,255);
color green = color(0,255,0);

//ArrayList<Ball> balls;

void setup(){
  note=0;
  noter = 6;
  red = color(255,random(50),0);
  blue = color(0,random(50),255);
  size(1920,1080);
  amount =4;
  fill(0,0);
  strokeWeight(5);
}

void draw(){
  time+=1;
  if(note==0){
    IDer=0;
    pitches = new float[1];
    rectMode(CORNERS);
    frameRate(noter);
    amount = int(random(2,map(sin(time*.001),-1,1,5,15)));
    //background(255);
    brecht = new Rect(0,0,width,height,int(random(2,6)),int(random(2,6)),amount);
    brecht.split(1);
             brecht.display();

   // println(pitches);
    if(random(1)>.5){
      pitches = sort(pitches);
      
      if(random(1)>.5){
       pitches = reverse(pitches); 
      }
    }

  //  sc.playChord(pitches, 80, 4);
        delay(noter*10);

  }
    frameRate(noter);
    brecht.display();

  noter = int(random(2,10));
  note+=1;//noter;
  if (note>pitches.length)
    note=0;
  //println(note);
  
  float[] pitcher = new float[1];
  
  for (int i = note ; i < note+noter ; i++){
    if(i<pitches.length)
    pitcher = expand(pitcher, pitches[i]);  
  }
  
  if(note>pitches.length-3)
    note=0;
    
      for (int i = note ; i < pitcher.length ; i++){
        if(i%3==0)
        sc.sendMidi(sc.NOTE_ON, 0, pitcher[i], random(50,150));

      }
  
  // sc.playChord(pitcher, 80, 4);
 // sc.playNote(pitches[note], 100, 1);
   // sc.sendMidi(sc.PROGRAM_CHANGE, 0, random(1000), 0);
  sc.sendMidi(sc.NOTE_ON, 0, pitches[note], random(50,150));
  sc.sendMidi(sc.NOTE_ON, 0, pitches[note+1], random(50,150));
  sc.sendMidi(sc.NOTE_ON, 0, pitches[note+2], random(50,150));

  println(pitches.length);

}


class Rect{
  
  float uX,uY,lX,lY;
  int sX,sY;
  int amt,ID;
  
  color myColor;

  ArrayList<Rect> children;

  int[][] grid;

  Rect(float ux, float uy, float lx, float ly, int sx, int sy, int amount){
    
    uX = ux;
    uY = uy;
    lX = lx;
    lY = ly;    
    sX = sx;
    sY = sy;
    amt = amount;
   
  
    children = new ArrayList<Rect>();
    
    grid = new int[1][3];
   // println(uX + " " + lX);
    
    for(int i = 0 ; i < grid.length ; i ++){

      for(int j = 0 ; j < grid[i].length ; j+=3){
        
        grid[i][j] = int(lerp(uX,lX,random(.2,.8)));//int(random(uX,lX));
        grid[i][j+1] = int(lerp(uY,lY,random(.2,.8)));//int(random(uY,lY));
        grid[i][j+2] = 2+int(pow(amount,.5))*8;
        
        //ellipse(grid[i][j],grid[i][j+1],10,10);
        
      }
    }
    
    int colorPick;
    if(dist(uX,uY,lX,lY)>450)
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
//        case 6: myColor = green;
//        break;
       default: myColor = white;
       break;
      
    }
  }

  void display(){  
    if(amt==0){
      
      fill(myColor,255);
      strokeWeight(grid[0][2]);
//      if(amt==0)

  
//       else
//         stroke(0,255);
//        
      println("note " + note + " ID " + ID);
     
//noStroke();
      rect(uX,uY,lX,lY); 
      stroke(0,255);
          if(ID>note && ID<note+noter){
       // stroke(255,0,0,128);
        fill(255,255,0,random(255));
        rect(uX,uY,lX,lY); 

      }
      
      fill(0,255);
//       line(uX,uY,lX,lY);
//      line(lX,uY,uX,lY);
     // textSize(lX-uX);
     // text(words[q],lerp(uX,lX,.1),lerp(uY,lY,.9)); 
      q++;
      if(q>words.length-1)
        q=0;
      strokeWeight(.5);
      
    }
    
    if(!children.isEmpty()){
      for (int i = 0 ; i < children.size() ; i++){
        Rect drect = children.get(i);
        drect.display();
      }
    }
  }

  void split(int minus){
    
    if(amt==0){
    IDs = expand(IDs,IDer);
    IDer++;
    ID = IDer;
            pitches = expand(pitches,map(dist(uX,uY,lX,lY),0,2000,80,15));

    }
    if (amt>0){
    
     
      amt-=minus;
      
      //println(ID);
      float r = random(1);
      
      Rect nrect;
      Rect orect;
           
      if(r<.5){
        
        int ind = 0;//int(random(sX*sY));
        float pos = grid[ind][0];
       // println(pos + " " + (pos-uX) + " " + (lX-pos));
        
        if(pos-uX > lX-pos){
          nrect = new Rect(uX,uY,pos,lY,int(random(2,6)),int(random(2,6)),amt);
          orect = new Rect(pos,uY,lX,lY,int(random(2,6)),int(random(2,6)),amt);
        }
        else{
          nrect = new Rect(pos,uY,lX,lY,int(random(2,6)),int(random(2,6)),amt);
          orect = new Rect(uX,uY,pos,lY,int(random(2,6)),int(random(2,6)),amt); 
        }
      }
      else{
        int ind = 0;//int(random(sX*sY));
        float pos = grid[ind][1];
        
        if(pos-uY > lY-pos){
          nrect = new Rect(uX,uY,lX,pos,int(random(2,6)),int(random(2,6)),amt);
          orect = new Rect(uX,pos,lX,lY,int(random(2,6)),int(random(2,6)),amt);
        }
        else{
          nrect = new Rect(uX,pos,lX,lY,int(random(2,6)),int(random(2,6)),amt);
          orect = new Rect(uX,uY,lX,pos,int(random(2,6)),int(random(2,6)),amt);
        }
      }
      
     // 
  
    //println("id" + IDer);
    //if(amt==0)

      children.add(nrect);
       if(random(1)>.2)
        orect.amt = 0 ;
      children.add(orect);
     
//      println(amount);
      nrect.split(1);
     
      orect.split(1);
    }  
  }  
}

float[] expand(float[] array, float value){
  float[] tempArray = new float[array.length+1];
  for(int i = 0 ; i < array.length ; i++){
   tempArray[i] = array[i]; 
  }
  tempArray[tempArray.length-1] = value;
  return tempArray;
}
