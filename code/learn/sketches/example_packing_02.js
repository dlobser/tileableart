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
        fill(255);
        ellipse(cmat[indx][0],cmat[indx][1],radius,radius);

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

