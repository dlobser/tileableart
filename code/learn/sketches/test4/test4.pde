import arb.soundcipher.*;

SoundCipher sc = new SoundCipher(this);

ArrayList<Rect> boxes = new ArrayList<Rect>();

float[] pitches = new float[1]; // c major 7th
int IDer = 1;

float time;

int note,noter;

Rect brecht;

int amount;

Rect[] tangles;

color white = color(255,255,255);
color red;
color blue;
color green = color(0,255,0);

void setup(){

  frameRate(24);
  note=0;
  noter = 6;
  size(960,540 );
  strokeWeight(5);   
  rectMode(CORNERS);

  brecht = new Rect(0,0,width,height,int(random(2,6)),int(random(2,6)),6);
  brecht.split(1);
}

void draw(){
  
  time+=1;
  
  if(note>(pitches.length)+1){
    boxes = new ArrayList<Rect>();
    note=0;
    IDer=0;
    pitches = new float[1];
    amount = int(random(5,map(sin(time*.001),-1,1,6,12)));
    brecht = new Rect(0,0,width,height,int(random(2,6)),int(random(2,6)),amount);
    brecht.split(1);
          
    if(random(1)>.5){
      pitches = sort(pitches);
      
      if(random(1)>.5){
       pitches = reverse(pitches); 
      }
    }
    delay(noter*30);
  }

  noter = int(random(2,10));
  
  for(int i = 0 ; i < boxes.size() ; i++){
    Rect trect = boxes.get(i);
    trect.display(); 
    if(i==note){
     // sc.sendMidi(sc.NOTE_ON, 0, trect.getPitch(),   random(50,150));
    }
  }

  if(time%noter==0)
    note+=1;//noter;

  if (IDer == 0)
    note=0;

}


class Rect{
  
  float uX,uY,lX,lY,vib,plunk,weight,plunkHigh,grow;
  int sX,sY,amt,ID;;

  boolean plunkered;
  
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
    
    grow=0;
    plunk = 0;
    
    plunkered = false;
    
    children = new ArrayList<Rect>();
    
    grid = new int[1][3];
    
    for(int i = 0 ; i < grid.length ; i ++){

      for(int j = 0 ; j < grid[i].length ; j+=3){
        
        grid[i][j] = int(lerp(uX,lX,random(.2,.8)));//int(random(uX,lX));
        grid[i][j+1] = int(lerp(uY,lY,random(.2,.8)));//int(random(uY,lY));
        grid[i][j+2] = 2+int(pow(amount,.5))*8;
        weight = grid[i][j+2];
        
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
      default: myColor = white;
        break;
      
    }
  }

  void display(){  

    if(amt==0){
      
      fill(myColor,255);
      strokeWeight(grid[0][2]);
      stroke(0,255);
      
      show(-5,5,myColor);

      if(ID==note){//>note && ID<note+noter){
        
        fill(255,255,0,random(255));
        fill(255,255);
        plunk(.02*min(dist(uX,uY,lX,uY),dist(uX,uY,uX,lY)));
        
      }
      
    }
  }
  
  float getPitch(){
    return map(dist(uX,uY,lX,lY),0,width,80,25);
  }

  void split(int minus){

    if(amt==0){
      IDer++;
      ID = IDer;
      pitches = expand(pitches,map(dist(uX,uY,lX,lY),0,2000,80,15));
      boxes.add(this);
    }
    
    if (amt>0){
    
     
      amt-=minus;
      
      float r = random(1);
      
      Rect nrect;
      Rect orect;
           
      if(r<.5){
        
        int ind = 0;//int(random(sX*sY));
        float pos = grid[ind][0];

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
      
    children.add(nrect);
    if(random(1)>.2)
      orect.amt = 0 ;
    children.add(orect);

    nrect.split(1);
    orect.split(1);
    }  
  }

  void plunk(float plunked){
    if(!plunkered){
       plunkHigh = plunked;
       plunk = plunked;
       plunkered = true;
       sc.sendMidi(sc.NOTE_ON, 1, getPitch(),   random(50,150));
    }
  }
    
  void showID(){
    text(ID,lerp(uX,lX,.5),lerp(uY,lY,.5));
  }
    
  void show(float low, float high, color myColor){
    
    float ruX = lerp((lX-uX)/2,uX,grow);
    float rlX = lerp((lX-uX)/2,lX,grow);
    
    float XS = lerp(uX,lX,.25);
    float XS2 = lerp(uX,lX,.75);
    float YS = lerp(uY,lY,.25);
    float YS2 = lerp(uY,lY,.75);


    if(plunk>0){
       plunk-=.1; 
    }
    
    if(grow<1)
      grow+=.2;
      
    else if(plunk<0)
      plunk=0;
    
    float wig = map(sin((1.5*time+plunk)+ID),-1,1,low,high);
    strokeWeight(weight);

    color tColor = color(255,255,0,map(plunk,0,plunkHigh,0,255));
    fill(blendColor(myColor,tColor,BLEND));

    float mul = wig*plunk*.2;

    curveDetail(0);

    beginShape();  
      vertex(uX,uY);
      bezierVertex(XS,uY+mul,XS2,uY+mul,rlX,uY);
      bezierVertex(rlX-mul,YS,rlX-mul,YS2,rlX,lY);
      bezierVertex(XS2,lY-mul,XS,lY-mul,ruX,lY);
      bezierVertex(ruX+mul,YS2,ruX+mul,YS,ruX,uY);
    endShape();

      //      bezier(uX,uY,XS,uY+wig*vib*plunk,XS2,uY+wig*vib*plunk,lX,uY);
      //      bezier(uX,lY,XS,lY+wig*vib*plunk,XS2,lY+wig*vib*plunk,lX,lY);
      //      bezier(lX,uY,lX+wig*vib*plunk,YS,lX+wig*vib*plunk,YS2,lX,lY);
      //      bezier(uX,uY,uX+wig*vib*plunk,YS,uX+wig*vib*plunk,YS2,uX,lY);
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

int[] grow(int[] array, int value){
  int[] tempArray = new int[array.length+1];
  for(int i = 0 ; i < array.length ; i++){
   tempArray[i] = array[i]; 
  }
  tempArray[tempArray.length-1] = floor(value);
  return tempArray;
}


