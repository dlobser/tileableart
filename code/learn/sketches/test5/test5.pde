import arb.soundcipher.*;
import java.util.Collections;

SoundCipher sc = new SoundCipher(this);

ArrayList<Rect> boxes = new ArrayList<Rect>();

float[] pitches = new float[1]; // c major 7th
int IDer = 1;

float time;

int note,noter,repeatBar;

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
  size(960,960 );
  strokeWeight(5);   
  rectMode(CORNERS);

  brecht = new Rect(0,0,width,height,8);
  brecht.split(1);
  repeatBar = 0;
}

void draw(){
  
  time+=1;
  Collections.sort(boxes);
   //Collections.reverse(boxes);

  
  if(note>boxes.size()){
    note=0;
    
      for(int i = 0 ; i < boxes.size() ; i++){
            Rect trect = boxes.get(i);
            trect.plunkered=false;
            boxes.set(i,trect);
           // print(trect.ID + ",");
      }
      //println("");
      if(random(1)<.7){
        boxes = reversie(boxes);
      }
      if(random(1)<.3){
        boxes = shuffle(boxes);
      }

       
    repeatBar++;
    
    if(random(1)<.3 || repeatBar>4){
      repeatBar=0;
      boxes = new ArrayList<Rect>();
      IDer=0;
      pitches = new float[1];
      amount = int(random(5,map(sin(time*.001),-1,1,6,10)));
      println(amount);
      brecht = new Rect(0,0,width,height,amount);
      brecht.split(1);
            
      if(random(1)>.5){
        pitches = sort(pitches);
        
        if(random(1)>.5){
         pitches = reverse(pitches); 
        }
      }
     // delay(noter*30);
      //boxes = shuffle(boxes);
      //Collections.sort(boxes);
                
      int whiteCount = 0;
       for(int i = 0 ; i < boxes.size() ; i++){
            Rect trect = boxes.get(i);
            if(trect.myColor == -1)
              whiteCount++;
              
            if(whiteCount==boxes.size()-1){
              int randy = int(random(boxes.size()));
              Rect crect = boxes.get(randy);
              if(random(1)>.5)
                crect.myColor = color(255,0,0,255);
               else
                crect.myColor = color(0,0,255,255);
              boxes.set(randy,crect);
            }
      
       }
    }

  }
  
 
  //noter = int(random(2,10));

  noter=1;
  for(int i = 0 ; i < boxes.size() ; i++){

    Rect trect = boxes.get(i);
    //print(trect.ID);
    if(i==note){
     
//      println(trect.size%9);
      noter =abs(int(max(1,(trect.size%7))));//int(map(sin(time*.1),-1,1,1,6)))));
      //int((sin(time*.051)+2)*3);
     // println (noter);
//      for(int j = note ; j < note+noter ; j++){
//        if(j<boxes.size()){
//          Rect urect = boxes.get(j);
//          //trect.notes = expand(trect.notes,urect.getPitch());
//        }
//      }
    }
   trect.display(); 
    
    if(random(1)<.02){
    
    }
  }
  //println("");
  
  //int div = int(map(sin(time*.05),-1,1,3,6));
  if(time%int(noter*5)==0){//int((8+(sin(noter))*12))==0){//(noter)==0){
    note+=noter;//noter;
  }
   // println(note + " " + noter + " " + boxes.size());
//println(noter);

  if (IDer == 0)
    note=0;

}

ArrayList<Rect> shuffle(ArrayList<Rect> arList){
  
  int[] id = new int[arList.size()];
  int[] ids = new int[arList.size()];
  ArrayList<Integer> rndmID = new ArrayList<Integer>();
  
  for(int i = 0 ; i < arList.size() ; i++){
     Rect pRect = arList.get(i);
     id[i] = pRect.ID;
     //print(pRect.ID+",");
     rndmID.add(i);
  }
 // println("");
  for(int i = 0 ; i < arList.size() ; i++){
     Rect pRect = arList.get(i);
     int rndm = int(random(rndmID.size()-1));
     pRect.ID = rndmID.remove(rndm);
   //  print(pRect.ID+",");
  }
 // println("");
    return arList;
}

ArrayList<Rect> reversie(ArrayList<Rect> arList){
  int j = arList.size()-1;
  
  ArrayList<Rect> arrayCopy = new ArrayList<Rect>();
  ArrayList<Rect> arrayCopy2 = new ArrayList<Rect>();
  
  int[] id = new int[j+1];
  
  for(int i = 0 ; i < arList.size() ; i++){
     Rect pRect = arList.get(i);
//     arrayCopy.add(pRect);
//     arrayCopy2.add(pRect);
//     print(pRect.ID);
     id[i] = pRect.ID;
  }
  //println("rect");

  for(int i = 0 ; i < arList.size() ; i++){
//     Rect pRect = arrayCopy.get(i);
//     Rect arRect = arrayCopy2.get(j);
    
     Rect myList = arList.get(i);
     myList.ID = id[j];
      //arList.set(i, arRect);
      //arList.set(j, pRect);
     //  print(pRect.ID);
      j--;
  }
 // println("blah");

    return arList;
}

class Rect implements Comparable<Rect>{
  
  float uX,uY,lX,lY,vib,plunk,weight,plunkHigh,grow,bigger,size;
  int amt,ID;

  boolean plunkered;
  
  color myColor;

  ArrayList<Rect> children;

  int[][] grid;
  float[] notes;

  Rect(float ux, float uy, float lx, float ly, int amount){
    
    uX = ux;
    uY = uy;
    lX = lx;
    lY = ly;    

    notes = new float[1];
    notes[0] = getPitch();
    
    amt = amount;
    
    bigger = min(dist(uX,uY,lX,uY),dist(uX,uY,uX,lY));
    size = dist(uX,uY,lX,lY);
    grow=0;
    plunk = 0;
    
    plunkered = false;
    
    children = new ArrayList<Rect>();
    
    grid = new int[1][3];
    
    for(int i = 0 ; i < grid.length ; i ++){

      for(int j = 0 ; j < grid[i].length ; j+=3){
        
        grid[i][j] = int(lerp(uX,lX,random(.5,.5)));//int(random(uX,lX));
        grid[i][j+1] = int(lerp(uY,lY,random(.5,.5)));//int(random(uY,lY));
        grid[i][j+2] = 1+int(pow(amount,1))*8;
        weight = min(min((lX-uX),(lY-uY))*.051,25);//grid[i][j+2];
        
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
  
  public int compareTo(Rect another){
     return int(this.size - another.size); 
  }

  void display(){  

    if(amt==0){
      
      fill(myColor,255);
      strokeWeight(grid[0][2]);
      stroke(0,255);
      
      show(-5,5,myColor);

      if(ID>=note && ID<=note+noter){
        
        fill(255,255,0,random(255));
        fill(255,255);
        plunk(.02*max(dist(uX,uY,lX,uY),dist(uX,uY,uX,lY)));
        
      }
      
    }
  }
  
  float getPitch(){
    return map(dist(uX,uY,lX,lY),0,width,105,35);
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

        if(random(1)>.5){
          nrect = new Rect(uX,uY,pos,lY,amt);
          orect = new Rect(pos,uY,lX,lY,amt);
        }
        else{
          nrect = new Rect(pos,uY,lX,lY,amt);
          orect = new Rect(uX,uY,pos,lY,amt); 
        }
      }
      else{
        int ind = 0;//int(random(sX*sY));
        float pos = grid[ind][1];
        
        if(random(1)>.5){//pos-uY > lY-pos){
          nrect = new Rect(uX,uY,lX,pos,amt);
          orect = new Rect(uX,pos,lX,lY,amt);
        }
        else{
          nrect = new Rect(uX,pos,lX,lY,amt);
          orect = new Rect(uX,uY,lX,pos,amt);
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
       
       for(int i = 0 ; i < notes.length ; i++){
         sc.sendMidi(sc.NOTE_ON, 1, getPitch(), (sin(ID*.5)+2)*30);
         //println(ID);
       }
    }
  }
    
  void showID(){
    text(ID,lerp(uX,lX,.5),lerp(uY,lY,.5));
  }
    
  void show(float low, float high, color myColor){
    
    float ruX = lerp(lerp(uX,lX,.5),uX,grow);
    float rlX = lerp(lerp(uX,lX,.5),lX,grow);
    float ruY = lerp(lerp(uY,lY,.5),uY,grow);
    float rlY = lerp(lerp(uY,lY,.5),lY,grow);
    
    float XS = lerp(uX,lX,.25);
    float XS2 = lerp(uX,lX,.75);
    float YS = lerp(uY,lY,.25);
    float YS2 = lerp(uY,lY,.75);


    if(plunk>0){
       plunk-=.5; 
    }
    
    if(grow<1)
      grow+=.2;
      
    else if(plunk<0)
      plunk=0;
    
    float wig = map(sin((1.5*time+plunk)+ID),-1,1,low,high);
    strokeWeight(0);

 
    float mul = wig*plunk*.1;

    curveDetail(0);
fill(0,255);
    beginShape();  
      vertex(ruX,ruY);
      bezierVertex(XS,ruY+mul,XS2,ruY+mul,rlX,ruY);
      bezierVertex(rlX-mul,YS,rlX-mul,YS2,rlX,rlY);
      bezierVertex(XS2,rlY-mul,XS,rlY-mul,ruX,rlY);
      bezierVertex(ruX+mul,YS2,ruX+mul,YS,ruX,ruY);
    endShape();
    
//    new_y = (float(new_x) / x) * y
//
//or
//
//new_x = (float(new_y) / y) * x
//    
weight=1;
    float aspect,minX,minY;
    
    
    if((lX-uX)<(lY-uY)){
      aspect = (lX-uX)/(lY-uY);
      minX = weight;
      minY = weight*aspect;
    }
    else{
      aspect = (lY-uY)/(lX-uX);
      minX = weight*aspect;
      minY = weight;
    }
minX=5;
minY=5;
    
    println(minX +  "  "  + minY);
    
   ruX = lerp(lerp(uX,lX,.5),uX,grow)+minX;
    rlX = lerp(lerp(uX,lX,.5),lX,grow)-minX;
     ruY = lerp(lerp(uY,lY,.5),uY,grow)+minY;
     rlY = lerp(lerp(uY,lY,.5),lY,grow)-minY;
    
       color tColor = color(255,255,0,map(plunk,0,plunkHigh,0,255));
    fill(blendColor(myColor,tColor,BLEND));

    beginShape();  
      vertex(ruX,ruY);
      bezierVertex(XS,ruY+mul,XS2,ruY+mul,rlX,ruY);
      bezierVertex(rlX-mul,YS,rlX-mul,YS2,rlX,rlY);
      bezierVertex(XS2,rlY-mul,XS,rlY-mul,ruX,rlY);
      bezierVertex(ruX+mul,YS2,ruX+mul,YS,ruX,ruY);
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


