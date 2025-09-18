int[] px;
int[] py;
float time;

void setup() {

  size(1170, 100);
  time=0;
  px = new int[width*height];
  py = new int[height];
  background(0);
  //noStroke();
  textSize(80);
  textAlign(CENTER);
  text("Creative Code For Designers",width/2,height-25);
  

  loadPixels();
  // for (int i = 0; i < pixels.length; i++) {
  //   if(pixels[i]>-16000000)
  //   pixels[i] = color(random(100,255),random(100,255),0);
  // }
  for (int x = 0; x < width; x++) {
    // Loop through every pixel row
    for (int y = 0; y < height; y++) {
      // Use the formula to find the 1D location
      int loc = x + y * width;
      
      if (pixels[loc] >-2) { // If we are an even column
        px[loc]=1;
        //py[loc]=1;
      } 
    }
  }
}

void draw(){
  time+=1;
background(255);
//  loadPixels();
//  // for (int i = 0; i < pixels.length; i++) {
//  //   if(pixels[i]>-16000000)
//  //   pixels[i] = color(random(100,255),random(100,255),0);
//  // }
//  for (int x = 0; x < width; x++) {
//    // Loop through every pixel row
//    for (int y = 0; y < height; y++) {
//      // Use the formula to find the 1D location
//      int loc = x + y * width;
//      if (pixels[loc] >-16000000) { // If we are an even column
//        px[x]=1;
//        py[y]=1;
//      } 
//    }
//  }
  for (int x = 0; x < width; x+=5) {
    // Loop through every pixel row
    for (int y = 0; y < height; y+=5) {
      // Use the formula to find the 1D location
        int loc = x + y * width;

      if (px[loc]>0){//[loc] >-16000000) { // If we are an even column
        fill(0);
       float n = (noise(loc+time*.01)*map(dist(mouseX,mouseY,x,y),0,50,100,0));
       float r = (noise(loc+time*.01)*map(dist(mouseX,mouseY,x,y),0,300,100,0));

       float nx = x;
       float ny = y;
        if(n<0)
        n=0;
        if(r<0)
        r=0;
                        strokeWeight(1);

         stroke(128);
         line(nx+n,-15+ny+(5*sin((nx*.03)+time*.02)),nx+n,15+ny+(5*sin((nx*.03)+time*.02)));
        strokeWeight(0);
        
        ellipse(nx+n,ny+(5*noise((nx*.03)+time*.01)),5,5);
        //ellipse(x+n,y+(5*sin((x*.03)+time*.02)),25,1);
       
      } 
    }
  }
  
  
}