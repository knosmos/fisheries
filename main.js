let sw = window.innerWidth;
let sh = window.innerHeight;

let gridSize = 150;

let gridw = 20;
let gridh = 10;

let selected = false;
let pirateCtr = 0;

ships = [];
shipyards = [];
fisheries = [];
commandcenters = [];

kraken = [];
enemyShips = [];

fishwater = [];

explosions = [];

let shipImage;
let enemyShipImage;
let waterImage;
let shipyardImage;
let fishImage;
let fisheryImage;
let krakenImage;
let commandcenterImage;
let explosionImage;

let money = 1000;

let placingStructure = false;
let readyToPlace = false;

let clearClick = false;

let headStart = 1000;

let krakenCtr = 0;

let fishHarvested = 0;
let daysPassed = 1;

let message = false;
let pmessage = false;
let messageCtr = 100;

let nothingClicked;

let dragging = false;
let offsetX = -gridw*gridSize/2+sw/2;
let offsetY = -gridh*gridSize/2+sh/2;

let prevMouseX = 0;
let prevMouseY = 0;

let poffsetX = -gridw*gridSize/2+sw/2;
let poffsetY = -gridh*gridSize/2+sh/2;

let title = true;
let titleFade = 255;
let start = false;
let end = false;

function preload(){
    shipImage = loadImage('assets/ship.png');
    enemyShipImage = loadImage('assets/pirate.png');
    waterImage = loadImage('assets/water.png');
    shipyardImage = loadImage('assets/shipyard.png');
    fishImage = loadImage('assets/fishwater.png');
    fisheryImage = loadImage('assets/fishery.png');
    krakenImage = loadImage('assets/kraken.png');
    commandcenterImage = loadImage('assets/commandcenter.png');
    explosionImage = loadImage('assets/explosion.png');
}

function setup(){
    createCanvas(sw,sh);
    /*for(let i=0;i<5;i++){
        for(let j=0;j<5;j++){
            ships.push(new ship(i,j));
            //ships[i*5+j].redirect(randint(0,20),randint(0,20));
        }
    }*/
    for(let i of [[-1,0],[0,-1],[1,0],[0,1]]){
        ships.push(new battleship(round(gridw/2)+i[0],round(gridh/2)+i[1]));
    }
    commandcenters.push(new commandcenter(round(gridw/2),round(gridh/2)));

    makeFish();

    textAlign(LEFT,TOP);
    textFont('Georgia');

    drawbackground();
    darkenScreen();
    noStroke();
}

function buttonHovered(x,y,w,h){
    if(mouseX>x&&mouseX<x+w&&mouseY>y&&mouseY<y+h){
        return true;
    }
    return false;
}

function buttonPressed(x,y,w,h){
    if(mouseIsPressed&&mouseX>x&&mouseX<x+w&&mouseY>y&&mouseY<y+h){
        return true;
    }
    return false;
}

/*Math functions*/
function reduce(numerator,denominator){
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(numerator,denominator);
    return [numerator/gcd, denominator/gcd];
}

function randint(min,max){
    return Math.round(Math.random()*(max-min)+min);
}

function distance(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

/*Classes*/
class ship{
    constructor(x,y){
        this.pos = [x,y];
        this.rpos = [x,y];
        this.dest = [x,y];
        this.health = 100;
        this.dir = false;
        this.moveCtr = 0;
        this.name = "Generic Potato-looking Thing";
    }
    render(){
        fill(100,255,100);
        image(shipImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    redirect(x,y){
        this.dest = [x,y];
        this.dir = [x-this.pos[0],y-this.pos[1]];
        //this.dir = reduce(this.dir[0],this.dir[1]);
        if(abs(this.dir[0])>abs(this.dir[1])){
            this.dir = [this.dir[0]/abs(this.dir[0]),this.dir[1]/abs(this.dir[0])];
        }
        else{
            this.dir = [this.dir[0]/abs(this.dir[1]),this.dir[1]/abs(this.dir[1])];
        }
        //console.log(this.dir);
    }
    isClicked(){
        if(mouseX>(this.pos[0])*gridSize+offsetX&&mouseX<(this.pos[0]+1)*gridSize+offsetX){
            if(mouseY>(this.pos[1])*gridSize+offsetY&&mouseY<(this.pos[1]+1)*gridSize+offsetY){
                return true;
            }
        }
        return false;
    }
    obstacleDetected(){
        for(let type of [ships,shipyards,enemyShips,fisheries,commandcenters]){
            for(let s of type){
                if(s.pos[0]===this.pos[0]&&s.pos[1]===this.pos[1]&&s!=this){
                    return true;
                }
            }
        }
        return false;
    }
    move(){
        if(this.dir!=false){
            if(this.moveCtr>=10){
                if(this.pos[0]!=this.dest[0]||this.pos[1]!=this.dest[1]){
                    this.rpos[0]+=this.dir[0];
                    this.rpos[1]+=this.dir[1];
                    this.pos[0]=Math.round(this.rpos[0]);
                    this.pos[1]=Math.round(this.rpos[1]);
                    //console.log(this.pos,this.dest);
                    this.moveCtr=0;
                    if(this.obstacleDetected()){
                        this.rpos[0]-=this.dir[0];
                        this.rpos[1]-=this.dir[1];
                        this.pos[0]=Math.round(this.rpos[0]);
                        this.pos[1]=Math.round(this.rpos[1]);
                    }
                }
                else{
                    this.dir=false;
                }
            }
            else{
                this.moveCtr+=1;
            }
        }
    }
    showMenu(){
        if(this.isClicked()){
            popupmenu(this.pos[0],this.pos[1],this.name,this.health,false,[]);
        }
    }
}

class battleship extends ship{
    constructor(x,y){
        super(x,y);
        this.target = false;
        this.damageCtr = 0;
        this.name = "Bobbian Galley";
    }
    drawattack(){
        if(this.target){
            drawingContext.setLineDash([5,5]);
            stroke(255,100,100);
            line((this.pos[0]+1/2)*gridSize+offsetX,(this.pos[1]+1/2)*gridSize+offsetY,(this.target.pos[0]+1/2)*gridSize+offsetX,(this.target.pos[1]+1/2)*gridSize+offsetY)
        }
    }
    findattack(){
        let found = false;
        for(let t of [enemyShips,kraken]){
            for(let s of t){
                if(distance(this.pos[0],this.pos[1],s.pos[0],s.pos[1])<=2){
                    this.target = s;
                    found = true;
                }
            }
        }
        if(found===false){
            this.target = false;
        }
    }
    damage(){
        if(this.target){
            if(this.damageCtr>=30){
                this.target.health-=10;
                if(this.target.health<=0){
                    this.target=false;
                }
                this.damageCtr=0;                
            }
            else{
                this.damageCtr+=1;
            }
        }
    }
    destruct(){
        if(this.health<=0){
            return true;
        }
    }
}

class pirateship extends ship{
    constructor(x,y){
        super(x,y);
        this.target = false;
        this.damageCtr=0;
        this.name = "Pirate Ship";
    }
    render(){
        fill(255,100,100);
        image(enemyShipImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    drawattack(){
        if(this.target){
            drawingContext.setLineDash([5,5]);
            stroke(255,100,100);
            line((this.pos[0]+1/2)*gridSize+offsetX,(this.pos[1]+1/2)*gridSize+offsetY,(this.target.pos[0]+1/2)*gridSize+offsetX,(this.target.pos[1]+1/2)*gridSize+offsetY)
        }
    }
    findattack(){
        for(let t of [ships,fisheries,shipyards,commandcenters]){
            for(let s of t){
                if(distance(this.pos[0],this.pos[1],s.pos[0],s.pos[1])<=2){
                    this.target = s;
                }
            }            
        }
    }
    damage(){
        if(this.target){
            if(this.damageCtr>=40){
                this.target.health-=10;
                if(this.target.health<=0){
                    this.target=false;
                }
                this.damageCtr=0;                
            }
            else{
                this.damageCtr+=1;
            }
        }
    }
    destruct(){
        if(this.health<=0){
            return true;
        }
    }
}

class fishery extends ship{
    constructor(x,y){
        super(x,y);
        this.name = "Fishery";
    }
    render(){
        image(fisheryImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    findFish(){
        let moreFish = 0;
        let xMove = 0;
        let yMove = 0;
        for(let i of [-1,0,1]){
            for(let j of [-1,0,1]){
                if(i!=0||j!=0){
                    try{
                        if(fishwater[this.pos[0]+i][this.pos[1]+j]>moreFish){
                            let theresNothingThere = true;
                            for(let type of [kraken,ships,shipyards,enemyShips,fisheries,commandcenters]){
                                for(let s of type){
                                    if(s.pos[0]===this.pos[0]+i&&s.pos[1]===this.pos[1]+j&&s!=this){
                                        theresNothingThere = false;
                                    }
                                }
                            }
                            if(theresNothingThere){
                                xMove = i;
                                yMove = j;
                                moreFish = fishwater[this.pos[0]+i][this.pos[1]+j];
                            }
                        }
                    }
                    catch(err){
                        console.log('We hit the end of the world :(');
                    }
                }
            }
        }
        this.pos[0]+=xMove;
        this.pos[1]+=yMove;
        this.rpos[0]+=xMove;
        this.rpos[1]+=yMove;
    }
    fish(){
        if(fishwater[this.pos[0]][this.pos[1]]){
            fishwater[this.pos[0]][this.pos[1]]-=1;
            money += 1;
            fishHarvested += 1;
        }
        else if(this.dir==false){
            this.findFish();
        }
    }
    move(){
        if(this.dir!=false){
            if(this.moveCtr>=20){
                if(this.pos[0]!=this.dest[0]||this.pos[1]!=this.dest[1]){
                    this.rpos[0]+=this.dir[0];
                    this.rpos[1]+=this.dir[1];
                    this.pos[0]=Math.round(this.rpos[0]);
                    this.pos[1]=Math.round(this.rpos[1]);
                    //console.log(this.pos,this.dest);
                    this.moveCtr=0;
                    if(this.obstacleDetected()){
                        this.rpos[0]-=this.dir[0];
                        this.rpos[1]-=this.dir[1];
                        this.pos[0]=Math.round(this.rpos[0]);
                        this.pos[1]=Math.round(this.rpos[1]);
                    }
                }
                else{
                    this.dir=false;
                }
            }
            else{
                this.moveCtr+=1;
            }
        }
    }
    destruct(){
        if(this.health<=0){
            return true;
        }
    }
}

class building{
    constructor(x,y){
        this.health = 1000;
        this.pos = [x,y];
        this.repairing = false;
        this.repairMessage = 'Repair';
    }
    isClicked(){
        if(mouseX>(this.pos[0])*gridSize+offsetX&&mouseX<(this.pos[0]+1)*gridSize+offsetX){
            if(mouseY>(this.pos[1])*gridSize+offsetY&&mouseY<(this.pos[1]+1)*gridSize+offsetY){
                return true;
            }
        }
        return false;
    }
    render(){
        fill(100);
        rect((this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    repair(){
        if(this.repairing){
            if(this.health<1000&&money>0){
                this.health+=1;
                money -= 1;
            }
            else{
                this.repairing = false;
                this.repairMessage = 'Repair';
            }
        }
    }
}

class commandcenter extends building{
    constructor(x,y){
        super(x,y);
        this.selected = false;
        this.justBuiltShip = false;
        this.currentlyBuilding = false;
        this.buildCtr = 0;
        this.results = false;
    }
    findEmpty(){
        let empty = [];
        let squareEmpty;
        for(let i=-1;i<2;i++){
            for(let j=-1;j<2;j++){
                squareEmpty = true;
                for(let type of [ships,enemyShips,shipyards,fisheries]){
                    for(let s of type){
                        if(s.pos[0]===this.pos[0]+i&&s.pos[1]===this.pos[1]+j){
                            squareEmpty = false;
                        }
                    }
                }
                if(squareEmpty){
                    empty.push([i,j]);
                }
            }
        }
        return empty;
    }
    build(){
        if(this.isClicked()){
            this.selected = true;
        }
        else{
            if(this.justBuiltShip){
                this.justBuiltShip = false;
            }
        }
        if(this.selected){
            if(this.currentlyBuilding===false){
                this.results = popupmenu(this.pos[0],this.pos[1],'Command Center',(this.health/10).toString()+'%',false,[this.repairMessage,'Build Shipyard']);
                if(this.results[0]&&this.justBuiltShip===false){
                    if(this.results[0]==='Build Shipyard'){
                        this.buildTotal = 400;
                        this.currentlyBuilding = true;
                        this.buildCtr = 0;
                    }
                    if(this.results[0]===this.repairMessage){
                        if(this.repairMessage='Repair'){
                            this.repairing = true;
                            this.repairMessage='Stop Repairing';
                        }
                        else{
                            console.log('repair stopped');
                            this.repairing = false;
                            this.repairMessage='Repair';
                        }
                    }                    
                    //console.log(this.findEmpty());
                }
            }
            else if(this.currentlyBuilding&&this.buildCtr<this.buildTotal){
                popupmenu(this.pos[0],this.pos[1],'Shipyard',(this.health/10).toString()+'%',this.buildCtr.toString()+'/'+this.buildTotal.toString(),[]);
            }
            else{
                this.results2 = popupmenu(this.pos[0],this.pos[1],'Command Center',(this.health/10).toString()+'%',false,[this.repairMessage,'Place']);
                if(this.results2[0]){
                    placingStructure = 'shipyard';
                }
                if(this.results2[2]===false&&this.isClicked()===false){
                    this.selected = false;
                }
                if(this.results2[0]===this.repairMessage){
                    if(this.repairMessage='Repair'){
                        this.repairing = true;
                        this.repairMessage='Stop Repairing';
                    }
                    else{
                        this.repairing = false;
                        this.repairMessage='Repair';
                    }
                }     
            }
            if(this.results[1]===false&&this.isClicked()===false){
                this.selected = false;
            }
        }
        if(this.currentlyBuilding&&this.buildCtr<this.buildTotal&&money>0){
            this.buildCtr+=1;
            money -= 1;
        }
        if(this.buildCtr>=this.buildTotal){
        }
    }
    render(){
        image(commandcenterImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    destruct(){
        if(this.health<=0){
            return true;
        }
    }
}

class shipyard extends building{
    constructor(x,y){
        super(x,y);
        this.selected = false;
        this.justBuiltShip = false;
        this.currentlyBuilding = false;
        this.buildCtr = 0;
        this.results = false;
    }
    findEmpty(){
        let empty = [];
        let squareEmpty;
        for(let i=-1;i<2;i++){
            for(let j=-1;j<2;j++){
                squareEmpty = true;
                for(let type of [ships,enemyShips,shipyards,fisheries,commandcenters]){
                    for(let s of type){
                        if(s.pos[0]===this.pos[0]+i&&s.pos[1]===this.pos[1]+j){
                            squareEmpty = false;
                        }
                    }
                }
                if(squareEmpty){
                    empty.push([i,j]);
                }
            }
        }
        return empty;
    }
    build(){
        if(this.isClicked()){
            this.selected = true;
        }
        else{
            if(this.justBuiltShip){
                this.justBuiltShip = false;
            }
        }
        if(this.selected){
            if(this.currentlyBuilding===false){
                this.results = popupmenu(this.pos[0],this.pos[1],'Shipyard',(this.health/10).toString()+'%',false,['Build Galley','Build Fishery']);
                if(this.results[0]&&this.justBuiltShip===false){
                    if(this.results[0]==='Build Galley'){
                        this.buildTotal = 100;
                    }
                    if(this.results[0]==='Build Fishery'){
                        this.buildTotal = 150;
                    }
                    this.currentlyBuilding = true;
                    this.buildCtr = 0;
                    //console.log(this.findEmpty());
                }
            }
            else{
                popupmenu(this.pos[0],this.pos[1],'Shipyard',(this.health/10).toString()+'%',this.buildCtr.toString()+'/'+this.buildTotal.toString(),[]);
            }
            if(this.results[1]===false&&this.isClicked()===false){
                this.selected = false;
            }
        }
        if(this.currentlyBuilding&&money>0){
            this.buildCtr+=1;
            money -= 1;
        }
        if(this.buildCtr>=this.buildTotal){
            let emptySlots = this.findEmpty();
            if(emptySlots.length!=0){
                let shipPos = emptySlots[randint(0,emptySlots.length-1)];
                if(this.results[0]==='Build Galley'){
                    ships.push(new battleship(shipPos[0]+this.pos[0],shipPos[1]+this.pos[1]));
                    message = 'Bobbian Galley Deployed';
                }
                if(this.results[0]==='Build Fishery'){
                    fisheries.push(new fishery(shipPos[0]+this.pos[0],shipPos[1]+this.pos[1]));
                    message = 'Fishery Deployed';
                }
                this.justBuiltShip = true;
                this.buildCtr = false;
                this.currentlyBuilding = false;
            }
            else{
                console.log('You tried to build nine ships in a shipyard made for eight');
                message = 'Nowhere to place ship!';
            }
        }
    }
    render(){
        image(shipyardImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    destruct(){
        if(this.health<=0){
            return true;
        }
    }
}

class radarunit extends building{

}

class squid{
    constructor(x,y){
        this.pos=[x,y];
        this.health=100;
        this.moveCtr=0;
    }
    obstacleDetected(){
        for(let type of [ships,shipyards,enemyShips,fisheries,commandcenters]){
            for(let s of type){
                if(s.pos[0]===this.pos[0]&&s.pos[1]===this.pos[1]&&s!=this){
                    return true;
                }
            }
        }
        return false;
    }
    isClicked(){
        if(mouseX>(this.pos[0])*gridSize+offsetX&&mouseX<(this.pos[0]+1)*gridSize+offsetX){
            if(mouseY>(this.pos[1])*gridSize+offsetY&&mouseY<(this.pos[1]+1)*gridSize+offsetY){
                return true;
            }
        }
        return false;
    }
    obstacleDetected(){
        for(let type of [shipyards,commandcenters]){
            for(let s of type){
                if(s.pos[0]===this.pos[0]&&s.pos[1]===this.pos[1]&&s!=this){
                    return true;
                }
            }
        }
        return false;
    }
    devour(){
        for(let t of [ships,enemyShips,fisheries]){
            //console.log(t);
            for(let j=0; j<t.length; j++){
                if(t[j].pos[0]===this.pos[0]&&t[j].pos[1]===this.pos[1]){
                    t.splice(j,1);
                    explosions.push(new explosion(this.pos[0],this.pos[1]));
                    console.log('devouring...');
                }
            }
        }
    }
    render(){
        image(krakenImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
    }
    move(){
        if(this.moveCtr>100){
            let xmove = randint(-1,1);
            let ymove = randint(-1,1);
            this.pos[0]+=xmove;
            this.pos[1]+=ymove;
            if(this.obstacleDetected()){
                this.pos[0]-=xmove;
                this.pos[1]-=ymove;
            }
            else{
                this.moveCtr=0;
            }
        }
        this.moveCtr+=1;
    }
    showMenu(){
        if(this.isClicked()){
            popupmenu(this.pos[0],this.pos[1],'Kraken',this.health,false,[]);
        }
    }
    destruct(){
        if(this.health<=0){
            return true;
        }
    }
}

class explosion{
    constructor(x,y){
        this.pos = [x,y];
        this.fade = 255;
        console.log('Explodium!');
    }
    render(){
        //tint(255,this.fade);
        image(explosionImage,(this.pos[0])*gridSize+offsetX,(this.pos[1])*gridSize+offsetY,gridSize,gridSize);
        //tint(255);
        this.fade -=10;
    }
}

/*Drawing functions*/

function drawbackground(){
    //background(0);
    for(let i=0;i<=sw/gridSize+2;i++){
        for(let j=0;j<=sh/gridSize+2;j++){
            image(waterImage,(i-1)*gridSize+offsetX%gridSize,(j-1)*gridSize+offsetY%gridSize,gridSize,gridSize);
        }
    }
}

function testCoordinates(){
    for(let i=0;i<gridw;i++){
        for(let j=0;j<gridh;j++){
            text(`(${i},${j})`,i*gridSize+offsetX,j*gridSize+offsetY);
        }
    }
}

function updatebackground(){
    for(let t of [ships,enemyShips,kraken,commandcenters,fisheries,shipyards]){
        for(let i of t){
            image(waterImage,(t.pos[0]+offsetX)*gridSize,(t.pos[1]+offsetY)*gridSize,gridSize,gridSize);            
        }   
    }
    for(let i=0;i<=sw/gridSize+2;i++){
            image(waterImage,(i-1)*gridSize,0,gridSize,gridSize);
    }
}

function drawfish(){
    for(let i=0;i<gridw;i++){
        for(let j=0;j<gridh;j++){
            if(fishwater[i][j]){
                //tint(255,255/100*fishwater[i][j]);
                image(fishImage,(i)*gridSize+offsetX,(j)*gridSize+offsetY,gridSize,gridSize);                
            }
        }
    }
}

function drawmap(){
    background(0);
}

function drawbuildings(){
    for(i of shipyards){
        i.render();
    }
    for(i of commandcenters){
        i.render();
    }
}

function drawunits(){
    for(i of ships){
        i.render();
    }
    for(i of fisheries){
        i.render();
    }
    for(i of enemyShips){
        i.render();
    }
}

function drawkraken(){
    for(i of kraken){
        i.render();
        i.move();
        i.devour();
    }
}

function drawenemybuildings(){

}

function drawExplosions(){
    for(let i=0;i<explosions.length;i++){
        explosions[i].render();
        if(explosions[i].fade<=0){
            explosions.splice(i,1);
        }
    }
    //tint(255);
}

/*Story Functions*/

function darkenScreen(){
    background(0,100);
}

function startStartScreen(){
    textAlign(CENTER,CENTER);
    background(3, 0, 10);
    textSize(60);
    fill(255);
    text('The Fisheries of Bob',sw/2,sh/2-20);
    image(krakenImage,sw/2-150/2,sh/2+40,150,150);
    background(3,0,10,255-titleFade);
    if(titleFade<=0){
        drawbackground();
        darkenScreen();
        noStroke();
        title = false;
        start = true;
        textAlign(LEFT,TOP);
    }
    else{
        titleFade-=5;
    }
}

function startScreen(){
    let rectwidth;
    let rectheight;
    if(sw<800){
        rectwidth = sw-40;
    }
    else{
        rectwidth = sw*1/2;
    }
    if(sh<700){
        rectheight = sh-40;
    }
    else{
        rectheight = sh*1/2;
    }
    fill(255);
    rect((sw-rectwidth)/2,(sh-rectheight)/2,rectwidth,rectheight);
    fill(0);
    textSize(30);
    text('Assignment Briefing',(sw-rectwidth)/2+10,(sh-rectheight)/2+10,rectwidth-20);
    textSize(20);
    text('The business conglomerate Bob Inc. is nearing bankruptcy. In a last-ditch attempt to save the company, the CEO has decided to commence fishing operations in the Red Herring Sea, home of the rare and extremely valuable Red Herring - as well as fleets of pirate ships and monstrous kraken that devour ships whole. Only one person has volunteered for the dangerous job of managing the fisheries:\nYou.',(sw-rectwidth)/2+10,(sh-rectheight)/2+50,rectwidth-20);
    if(buttonHovered((sw-rectwidth)/2+10,(sh-rectheight)/2+rectheight-60,rectwidth-20,50,10)){
        fill(104,35,95);
        if(mouseIsPressed){
            start=false;
            clearClick = true;
        }
    }
    else{
        fill(50,50,100);
    }
    rect((sw-rectwidth)/2+10,(sh-rectheight)/2+rectheight-60,rectwidth-20,50,10);
    fill(255);
    text('Start Game',(sw-rectwidth)/2+20,(sh-rectheight)/2+rectheight-60+50/4);
}

function endScreen(){
    let rectwidth;
    let rectheight;
    textAlign(LEFT,TOP);
    if(sw<800){
        rectwidth = sw-40;
    }
    else{
        rectwidth = sw*1/2;
    }
    if(sh<700){
        rectheight = sh-40;
    }
    else{
        rectheight = sh*1/2;
    }
    fill(255);
    rect((sw-rectwidth)/2,(sh-rectheight)/2,rectwidth,rectheight);
    fill(0);
    textSize(30);
    text('Game Over',(sw-rectwidth)/2+10,(sh-rectheight)/2+10,rectwidth-20);
    textSize(20);
    text(`The pirates destroyed your command center in an (I hope) epic naval battle.\n\nYour fisheries harvested ${fishHarvested} fish and lasted ${daysPassed} days.`,(sw-rectwidth)/2+10,(sh-rectheight)/2+50,rectwidth-20);
    if(buttonHovered((sw-rectwidth)/2+10,(sh-rectheight)/2+rectheight-60,rectwidth-20,50,10)){
        fill(104,35,95);
        if(mouseIsPressed){
            end = false;
            reset();
            clearClick = true;
        }
    }
    else{
        fill(50,50,100);
    }
    rect((sw-rectwidth)/2+10,(sh-rectheight)/2+rectheight-60,rectwidth-20,50,10);
    fill(255);
    text('Replay',(sw-rectwidth)/2+20,(sh-rectheight)/2+rectheight-60+50/4);
}

/*Primary Functions*/
function manageunits(){
    for(let j=0; j<ships.length; j++){
        i=ships[j];
        i.move();
        i.findattack();
        i.drawattack();
        i.damage();
        i.showMenu();
        if(i.destruct()){
            explosions.push(new explosion(i.pos[0],i.pos[1]));
            ships.splice(j,1);
            message = 'Bobbian Galley Destroyed';
            explosions.push(new explosion())
        }
    }
    for(let j=0; j<fisheries.length; j++){
        i=fisheries[j];
        i.move();
        i.fish();
        i.showMenu();
        if(i.destruct()){
            explosions.push(new explosion(i.pos[0],i.pos[1]));
            fisheries.splice(j,1);
            message = 'Fishery Destroyed';
        }
    }
    for(let j=0;j<enemyShips.length; j++){
        i=enemyShips[j];
        i.move();
        i.findattack();
        i.drawattack();
        i.damage();
        i.showMenu();
        if(i.destruct()){
            explosions.push(new explosion(i.pos[0],i.pos[1]));
            enemyShips.splice(j,1);
            message = 'Pirate Ship Destroyed';
        }
    }
}

function manageBuildings(){
    for(let j=0;j<shipyards.length;j++){
        shipyards[j].build();
        if(shipyards[j].destruct()){
            explosions.push(new explosion(i.pos[0],i.pos[1]));
            shipyards.splice(j,1);
            message = 'Shipyard Destroyed';
        }
    }
    for(i of commandcenters){
        i.build();
        i.repair();
        if(i.health<=0){
            end=true;
            darkenScreen();
        }
    }
}

function makeFish(){
    for(let i=0;i<gridw;i++){
        ln = [];
        for(let j=0;j<gridh;j++){
            let k = randint(0,100);
            if(k<70){
                k=0;
            }
            else if(k<90){
                k=50;
            }
            else{
                k=100;
            }
            ln.push(k);
        }
        fishwater.push(ln);
    }
}

function manageKraken(){
    for(let i=0;i<kraken.length;i++){
        kraken[i].showMenu();
        if(kraken[i].destruct()){
            explosions.push(new explosion(kraken[i].pos[0],kraken[i].pos[1]));
            kraken.splice(i,1);
        }
    }
}

function makePirates(){
    if(pirateCtr>500&&headStart<=0){
        console.log(headStart);
        for(let i=0;i<randint(3,5);i++){
            enemyShips.push(new pirateship(randint(-30,-10),randint(-50,50)));
        }
        for(let s of enemyShips){
            s.redirect(round(gridw/2),round(gridh/2));
        }
        pirateCtr = 0;
    }
    else if(headStart>0){
        headStart--;
    }
    else{
        pirateCtr++;    
    }
}

function makeKraken(){
    if(krakenCtr>300){ //TESTING PURPOSES (ORIGINAL 300)
        let x=randint(0,30);
        let y=randint(0,20);
        let nothingHere = true;
        for(let t of [ships,enemyShips,kraken,fisheries]){
            for(let j=0; j<t.length; t++){
                let i=t[j];
                if(i.pos[0]===x&&i.pos[1]===y){
                    nothingHere=false;
                }
            }
        }
        console.log('kraken');
        if(nothingHere){
            kraken.push(new squid(x,y));
            krakenCtr=0;
            console.log(kraken);
        }
    }
    krakenCtr+=1;
}

function incrementDays(){
    if(end==false&&start==false&&title==false){
        daysPassed++;
    }
}

setInterval(incrementDays,3000);

function reset(){
    selected = false;
    pirateCtr = 0;
    
    ships = [];
    shipyards = [];
    fisheries = [];
    commandcenters = [];
    
    kraken = [];
    enemyShips = [];
    fishwater = [];
    explosions = [];
    
    money = 1000;
    
    placingStructure = false;
    
    clearClick = false;
    
    headStart = 1000;
    krakenCtr = 0;
    
    fishHarvested = 0;
    daysPassed = 1;

    start = false;
    end = false;

    for(let i of [[-1,0],[0,-1],[1,0],[0,1]]){
        ships.push(new battleship(round(gridw/2)+i[0],round(gridh/2)+i[1]));
    }
    commandcenters.push(new commandcenter(round(gridw/2),round(gridh/2)));

    makeFish();

    textAlign(LEFT,TOP);
    textFont('Georgia');

    drawbackground();
    darkenScreen();
    noStroke();
}

/*Interface Functions*/
function popupmenu(x,y,title,health,message,options){
    /*
    title: header.
    health: healthbar.
    message: optional message.
    options: an array like ['Repair','Build']
    */
    let boxwidth = 200;
    let boxheight = (2+options.length)*25;
    if(message){
        boxheight+=25;
    }
    let hovering = false;
    let chosen = false;
    let triangleWidth = 50;

    textSize(15);
    noStroke();
    fill(100,200);
    rect((x+1/2)*gridSize-boxwidth/2+offsetX,(y)*gridSize-boxheight-20+offsetY,boxwidth,boxheight);
    triangle((x+1/2)*gridSize-triangleWidth/2+offsetX,(y)*gridSize-20+offsetY,(x+1/2)*gridSize+triangleWidth/2+offsetX,(y)*gridSize-20+offsetY,(x+1/2)*gridSize+offsetX,(y)*gridSize+offsetY);
    if(buttonHovered((x+1/2)*gridSize-boxwidth/2+offsetX,(y)*gridSize-boxheight-20+offsetY,boxwidth,boxheight+20)){
        hovering = true;
        clearClick = true;
    }
    fill(100,255,100);

    textAlign(LEFT,TOP);
    text(title,(x+1/2)*gridSize-boxwidth/2+5+offsetX,(y)*gridSize-boxheight-20+5+offsetY);
    fill(255);
    text('Health: '+health,(x+1/2)*gridSize-boxwidth/2+5+offsetX,(y)*gridSize-boxheight+5+offsetY);

    let addline;
    if(message){
        addline = 2;
        text(message,(x+1/2)*gridSize-boxwidth/2+5+offsetX,(y)*gridSize-boxheight+30+offsetY);
    }
    else{
        addline = 1;
    }

    for(let i=addline;i<options.length+1;i++){
        if(buttonHovered((x+1/2)*gridSize-boxwidth/2+5+offsetX,(y)*gridSize-boxheight+5+i*25+offsetY,boxwidth-10,20)){
            if(mouseIsPressed){
                chosen = options[i-1];
                clearClick = true;
            }
            fill(100,255,100);
        }
        else{
            fill(100,100,100);
        }
        rect((x+1/2)*gridSize-boxwidth/2+5+offsetX,(y)*gridSize-boxheight+5+i*25+offsetY,boxwidth-10,20);

        fill(255);
        textAlign(CENTER,CENTER);
        text(options[i-1],(x+1/2)*gridSize-boxwidth/2+5+(boxwidth-10)/2+offsetX,(y)*gridSize-boxheight+5+i*25+10+offsetY);
    }
    
    return [chosen,hovering];
}

function sidemenu(){

}

function setattack(){
    if(selected){
        drawingContext.setLineDash([]);
        stroke(255);
        strokeWeight(2);
        //line((selected.pos[0]+1/2)*gridSize+offsetX,(selected.pos[1]+1/2)*gridSize+offsetY,floor(mouseX/gridSize)*gridSize+gridSize/2-offsetX%gridSize,floor(mouseY/gridSize)*gridSize+gridSize/2-offsetY%gridSize);
        line((selected.pos[0]+1/2)*gridSize+offsetX,(selected.pos[1]+1/2)*gridSize+offsetY,floor((mouseX-offsetX)/gridSize)*gridSize+offsetX+gridSize/2,floor((mouseY-offsetY)/gridSize)*gridSize+offsetY+gridSize/2);
    }
}

function setBuilding(){
    if(placingStructure){
        noFill();
        drawingContext.setLineDash([]);
        let x = floor((mouseX-offsetX)/gridSize)*gridSize+offsetX;
        let y = floor((mouseY-offsetY)/gridSize)*gridSize+offsetY;
        //let x = floor(mouseX/gridSize)*gridSize+offsetX%gridSize;
        //let y = floor(mouseY/gridSize)*gridSize+offsetY%gridSize;
        //if()
        stroke(100,100,255);
        strokeWeight(2);
        rect(x,y,gridSize,gridSize);
    }
}

function constructionmenu(){

}

function messenger(){
    if(message!=false){
        if(message!=pmessage){
            messageCtr=100;
            pmessage = message;
        }
        pmessage = message;
        let tw = textWidth(message);
        fill(100,messageCtr);
        rect((sw-tw-10)/2,0,tw+20,30/0.75+20);
        textAlign(CENTER,TOP);
        fill(255);
        text(message,sw/2,10);
        messageCtr-=1;
        if(messageCtr<=0){
            message = false;
            messageCtr=100;
        }
    }
}

function gridDrag(){
    if(dragging){
        let ox = mouseX-prevMouseX+poffsetX;
        let oy = mouseY-prevMouseY+poffsetY;
        if(ox<=0&&ox>=-gridw*gridSize+sw){
            offsetX = ox;
        }
        if(oy<=0&&oy>=-gridh*gridSize+sh){
            offsetY = oy;
        }
    }
}

function mousePressed(){
    if(clearClick==false){
        if(selected){
            selected.redirect(floor((mouseX-offsetX)/gridSize),floor((mouseY-offsetY)/gridSize));
            selected = false;
        }
        else if(placingStructure){
            if(placingStructure==='shipyard'){
                shipyards.push(new shipyard(floor((mouseX-offsetX)/gridSize),floor((mouseY-offsetY)/gridSize)));
                message = 'Shipyard Placed';
            }
            readyToPlace = false;
            placingStructure = false;
            commandcenters[0].justBuilt = true;
            commandcenters[0].buildCtr = false;
            commandcenters[0].currentlyBuilding = false;
            commandcenters[0].buildPos = false;
        }
        else{
            nothingClicked = true;
            for(i of ships){
                if(i.isClicked()){
                    selected = i;
                    nothingClicked = false;
                }
            }
            for(i of fisheries){
                if(i.isClicked()){
                    selected = i;
                    nothingClicked = false;
                }
            }
            for(i of shipyards){
                if(i.isClicked()){
                    i.build();
                    nothingClicked = false;
                }
            }
            for(i of commandcenters){
                if(i.isClicked()){
                    i.build();
                    nothingClicked = false;
                }
            }
            if(nothingClicked){
                dragging = true;
                prevMouseX = mouseX;
                prevMouseY = mouseY;
            }
        }        
    }
}

function mouseReleased(){
    if(dragging){
        dragging = false;
        poffsetX = offsetX;
        poffsetY = offsetY;
    }
}

function keyPressed(){
    if(keyCode===UP_ARROW){
        offsetY+=1;
    }
    if(keyCode===DOWN_ARROW){
        offsetY-=1;
    }
    if(keyCode===RIGHT_ARROW){
        offsetX-=1;
    }
    if(keyCode===LEFT_ARROW){
        offsetX+=1;
    }
}

function windowResized(){
    sw = window.innerWidth;
    sh = window.innerHeight;
    resizeCanvas(sw, sh);
    if(start||end){
        drawbackground();
        darkenScreen();
    }
}

function draw(){
    clearClick = false;
    if(title){
        startStartScreen();
    }
    else if(start){
        startScreen();
    }
    else if(end){
        endScreen();
    }
    else{
        drawbackground();
        drawfish();
        
        drawunits();
        drawbuildings();
        drawkraken();
        drawExplosions();

        manageKraken();
        manageunits();
        manageBuildings();
        setattack();
        setBuilding();
        makePirates();
        makeKraken();
        textSize(30);
        fill(255);
        noStroke();
        gridDrag();
        textAlign(LEFT,TOP);
        text('$'+money.toString(),20,20);
        text(fishHarvested.toString()+' fish harvested',20,50);
        text('Day '+daysPassed.toString(),sw-textWidth('Day '+daysPassed.toString())-10,20);
        messenger();
        //testCoordinates();
    }
}
