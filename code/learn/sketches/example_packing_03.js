float largeSize = 200;
int num = 500;

size(960,540);

float[] things    = new float[num*3];
float[][] circmat = new float[num][3];
float widthx = width;
float widthy = height;

void setup(){   
    ellipseMode(RADIUS);
    float[][] circmat = initializeCoords(num);
    background(0);
    findAllRadii(circmat,2);
}

void draw(){} 

boolean findAllRadii(float[][] cmat, int indx){
    if (indx == num) return false; 
    return findAllRadii(findNextRadius(cmat,indx),indx+1);    
}

float[][] findNextRadius(float[][] cmat, int indx){
    float[] distArr = new float[num-1];
    float radius,r;
    for(int i=0; i<num-1; i++){
        r = sqrt(pow(cmat[i][0]-cmat[indx][0],2)
                +pow(cmat[i][1]-cmat[indx][1],2))
                    -cmat[i][2];
        if(cmat[i][2]==0) r=largeSize;
        distArr[i] = r;
    }
    radius = min(min(distArr),largeSize);
   
    if(radius>1){
        cmat[indx][2] = radius;
        fill(128);
        flower(cmat[indx][0],cmat[indx][1],radius);
        return cmat;
    }
    cmat[indx][0] = random(widthx);
    cmat[indx][1] = random(widthy);
    return findNextRadius(cmat,indx);
   
}

float[][] initializeCoords(int numell){
    float[][] outmat = new float[numell][3];
    for(int i=0; i<numell; i++){
        outmat[i][0] = random(widthx);
        outmat[i][1] = random(widthy);
        outmat[i][2] = 0;
    }
    return outmat;
}


void flower(float tx, float ty, float radius){

    pushMatrix();
    translate(tx,ty);

    float innerPetal = radius*.45;
    float outerPetal = radius*1.25;
    int petals = int(random(6,12));

    for(int i = 0 ; i < petals ; i++){

        float q = (i/petals)*(PI*2);
        float p = PI/petals*2;

        fill(map(sin(i*3),-1,1,100,255));

        bezier(
            sin(q)*innerPetal,cos(q)*innerPetal,
            sin(q)*outerPetal,cos(q)*outerPetal,
            sin(q+p)*outerPetal,cos(q+p)*outerPetal,
            sin(q+p)*innerPetal,cos(q+p)*innerPetal
        );
    }

    face(1,radius*.002);

    popMatrix();

}


void face(float mouthOpen, float size){

    //In this version I'm no longer basing the positions of all the points on a variable axis
    //rather, everything is centered at zero and the position will be modified elsewhere

    headPosX = 0;
    headPosY = 0;

    int black = 0;
    int white = 255;

    float headSize = 250;

    float eyeOffsetX = random(50,100);
    float eyeOffsetY = random(50,100);
    float eyeSize = random(20,40);

    float mouthEdgesX = 115;
    float mouthEdgesY = 30;

    float upperMouthX = 30;
    float upperMouthY = random(-40,40) * mouthOpen;

    float lowerMouthY = 185 * mouthOpen;
    float lowerMouthX = 50;

    float highLightSize = 10;
    float highLightOffset = 8;

    pushMatrix();

    scale(size);
    fill(255);
    ellipse(headPosX,headPosY,headSize,headSize);
    fill(black);
    ellipse(eyeOffsetX,-eyeOffsetY,eyeSize,eyeSize);
    ellipse(-eyeOffsetX,-eyeOffsetY,eyeSize,eyeSize);

    //upper mouth
    bezier(
        -mouthEdgesX,mouthEdgesY+1,
        -upperMouthX,-upperMouthY,
        upperMouthX,-upperMouthY,
        mouthEdgesX,mouthEdgesY+1
        );

    //lower mouth
    bezier(
        -mouthEdgesX,mouthEdgesY,
        -lowerMouthX,lowerMouthY,
        lowerMouthX,lowerMouthY,
        mouthEdgesX,mouthEdgesY
        );

    fill(white);

    ellipse(eyeOffsetX-highLightOffset,-eyeOffsetY-highLightOffset,highLightSize,highLightSize);
    ellipse(-eyeOffsetX-highLightOffset,-eyeOffsetY-highLightOffset,highLightSize,highLightSize);

    popMatrix();
}
