void num = 2000;
void sz = 10;

size(960,540);

void setup(){
}

void draw(){
  background(1,0,1);
  translate(width/2,height/2);
	for (int i = 0; i < num; i++) {
	  colorMode(HSB,1);
	  fill((i/num),1,1);
	  float circle = (i/num)*(PI*2)*(mouseY*.03);
		ellipse(sin(circle)*i*mouseX*.0005,cos(circle)*i*mouseX*.0005,sz,sz);
	}
	
}
