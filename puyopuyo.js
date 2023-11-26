let KEY_SPACE = 32;
let KEY_LEFT = 37;
let KEY_RIGHT = 39;
let KEY_UP = 38;
let KEY_DOWN = 40;

let STAGE_WIDTH;
let STAGE_HEIGHT;
let BLOCK_SIZE = 32;

let MyBlockList = [];
let StageList = [];
let StageMap = [];
let colortable = ["red", "blue","yellow"];

let canvas;
let context;
let pattern;
let mode;

let list = [];
let fontElement;
let rensacnt = 0;

let MODE_NORMAL = 0;
let MODE_DOWN = 1;
let MODE_JUDGE = 2;

let LoopMode = MODE_NORMAL;

// ビジーwaitを使う方法
function sleep(waitMsec) {
    var startMsec = new Date();
  
    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}
  

document.onkeydown = function(e) {
	var keyCode = false;

	if (e) event = e;

	if (event) {
		if (event.keyCode) {
			keyCode = event.keyCode;
		} else if (event.which) {
			keyCode = event.which;
		}
	}
    keyaction(keyCode);
};

class Pos{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

class Puyo{
    constructor(x,y, color){
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class StageData{
    constructor(puyoflag, color){
        this.puyoflag = puyoflag;
        this.color = color;
        this.checked = false;
    }

}

// 落下
function Down(){
    return move(0,1);
}

function init(){
    canvas = document.querySelector('#canvas');
    context = canvas.getContext('2d');
    STAGE_WIDTH = canvas.width / BLOCK_SIZE;
    STAGE_HEIGHT = canvas.height / BLOCK_SIZE;

    let countElement = document.getElementById("count");
    fontElement = countElement.querySelector('font');

    // ステージ表示
    InitStage();

    // 初期ブロック表示
    CreateBlock();
    ShowBlock();
}

function InitStage(){

    StageList = new Array(STAGE_HEIGHT); // Y
    for (let i = 0; i < STAGE_HEIGHT; i++) {
        StageList[i] = new Array(STAGE_WIDTH); // X 
    }
  
    for (let y = 0; y < STAGE_HEIGHT; y++) {
        for (let x = 0; x < STAGE_WIDTH; x++) {
            StageList[y][x] = new StageData(0, "black");
        }
    }
}


// ■ ■
function Pattern(){
    let array = [new Pos(0,1), new Pos(1,1)];
    mode = 0;
    return array;
}

// 
// 1 2
//

//   1
//   2
// 

//
//   2 1
//     

// 
//   2
//   1

function PatternOffset(){
    let array;
    switch(mode){
        case 0:
            array = [new Pos(1,-1), new Pos(0,0)];
            mode = 1;
            break;
        case 1:
            array = [new Pos(1,1), new Pos(0,0)];
            mode = 2;
            break;
        case 2:
            array = [new Pos(-1,1), new Pos(0,0)];
            mode = 3;
            break;
        case 3:
            array = [new Pos(-1,-1), new Pos(0,0)];
            mode = 0;
            break;
    }
    return array;
}

function GetRandColor(){
    let colorIndex = Math.floor(Math.random() * colortable.length);
    return colortable[colorIndex];
}


function CreateBlock(){
    let offsetx = 10;
    let offsety = 0;

    let array = Pattern();

    MyBlockList.length = 0;
    for (let index = 0; index < array.length; index++) {
        let color = GetRandColor();
        MyBlockList.push(new Puyo(offsetx + array[index].x, offsety + array[index].y, color)); 
    }

}

function ShowBlock(){
    for (let index = 0; index < MyBlockList.length; index++) {
        DrawScreen(MyBlockList[index].x, MyBlockList[index].y, MyBlockList[index].color); 
    }
    for (let y = 0; y < STAGE_HEIGHT; y++) {
        for (let x = 0; x < STAGE_WIDTH; x++) {
            if(StageList[y][x].puyoflag){
                DrawScreen(x,y,StageList[y][x].color);
            }
        }
    }
}

function DrawScreen(x,y,color){
    context.fillStyle = color;
    context.fillRect( x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function AddStageBlock(){
    for (let index = 0; index < MyBlockList.length; index++) {
        let x = MyBlockList[index].x;
        let y = MyBlockList[index].y; 
        StageList[y][x].puyoflag = 1;
        StageList[y][x].color = MyBlockList[index].color;
    }
    MyBlockList.length = 0;
}

function DownBlock(){
    for (let y = STAGE_HEIGHT-2; y >= 0; y--) {
        for (let x = 0; x < STAGE_WIDTH; x++) {
            if(StageList[y][x].puyoflag){
                for (let index = y; index < STAGE_HEIGHT-1; index++) {
                    if(!StageList[index+1][x].puyoflag){
                        StageList[index][x].puyoflag = 0;
                        StageList[index+1][x].puyoflag = 1;
                        StageList[index+1][x].color = StageList[index][x].color;
                    }   
                }            
            }
        }
    }
}


function loop(){
    context.fillStyle = "black";
    context.fillRect(0, 0, STAGE_WIDTH * BLOCK_SIZE, STAGE_HEIGHT * BLOCK_SIZE)
    ShowBlock();

    if(MODE_DOWN == LoopMode){
        AddStageBlock();
        DownBlock();
        LoopMode = MODE_JUDGE;
    }
    else if(MODE_JUDGE == LoopMode){
        if(true == DeletePuyo()){
            LoopMode = MODE_DOWN;
            rensacnt++;
            UpdateMaxCnt(rensacnt);
        }
        else{
            rensacnt = 0;
            CreateBlock();
            LoopMode = MODE_NORMAL;
        }
    }
    else{
        if(false == Down()){
            LoopMode = MODE_DOWN;
        }
        else{
            LoopMode = MODE_NORMAL;
        }
    }
}

function keyaction(keycode){
    switch(keycode){
        case KEY_SPACE:
            // スペースで回転
            lotation();
            break;
        case KEY_LEFT:
            move(-1,0);
            break;
        case KEY_RIGHT:
            move(1,0);
            break;
        case KEY_DOWN:
            move(0,1);
            break;
        default:
            break;
    }
    // 方向で移動

}

function lotation(){
    //右回転
    let tempmode = mode;
    let array = PatternOffset();
    for (let index = 0; index < array.length; index++) {
        let tempx = MyBlockList[index].x + array[index].x;
        let tempy = MyBlockList[index].y + array[index].y;
        let bRet = IsExit(tempx,tempy);
        if(bRet){
            mode = tempmode;
            return;
        }
    }
    
    for (let index = 0; index < MyBlockList.length; index++) {
        MyBlockList[index].x += array[index].x;
        MyBlockList[index].y += array[index].y; 
    }

}

// 衝突判定
function IsExit(x,y){
    // 欄外にいるかを判定
    if((y >= STAGE_HEIGHT)||(x < 0)||(STAGE_WIDTH <= x)){
        return true;
    }   

    // ステージにあるブロックを判定
    for (let index = 0; index < StageList.length; index++) {
        if(StageList[y][x].puyoflag == 1){
            return true;
        }
    }
    return false;
}

function AddDelPuyoList(tempx,tempy,color){
    if(StageList[tempy][tempx].checked == true){
        return false;
    }
    if(StageList[tempy][tempx].puyoflag == 1 && StageList[tempy][tempx].color == color){
        StageList[tempy][tempx].checked = true;
        list.push(new Puyo(tempx,tempy,color));
        return true;
    }
    return false;
}


function JudgeHeight(y){
    return (y < STAGE_HEIGHT);
}

function JudgeY0(y){
    return (y >= 0);
}

function JudgeWidth(x){
    return (x < STAGE_WIDTH);
}

function JudgeX0(x){
    return (x >= 0);
}

let functable = [];

function JudgeDelPuyo(x, y, color){
    let tempx = 0;
    let tempy = 0;
    if(JudgeHeight(y+1)){
        tempx = x;
        tempy = y+1; 
        AddDelPuyoList(tempx,tempy,color);
    }
    if(JudgeWidth(x+1)){
        tempx = x+1;
        tempy = y; 
        AddDelPuyoList(tempx,tempy,color);
    }
    if(JudgeY0(y-1)){
        tempx = x;
        tempy = y-1; 
        AddDelPuyoList(tempx,tempy,color);
    }
    if(JudgeX0(x-1)){
        tempx = x-1;
        tempy = y;
        AddDelPuyoList(tempx,tempy,color);
    }
}


function DelStagePuyo(){
    for (let y = 0; y < STAGE_HEIGHT; y++) {
        for (let x = 0; x < STAGE_WIDTH; x++) {
            if(StageList[y][x].checked == true){
                StageList[y][x].puyoflag = 0;
                StageList[y][x].color = "black";
                StageList[y][x].checked = false;
            }
        }
    }
}

function InitChecked(){
    for (let y = 0; y < STAGE_HEIGHT; y++) {
        for (let x = 0; x < STAGE_WIDTH; x++) {
            StageList[y][x].checked = false;
        }
    }
}

function UpdateMaxCnt(cnt){
    if(parseInt(fontElement.textContent)  < cnt){
        fontElement.textContent = cnt;
    }
}

function CheckRensa(x,y){
    let ret = false;
    let cnt = 0;
    if(StageList[y][x].puyoflag == 1 && StageList[y][x].checked == false){
        StageList[y][x].checked = true;
        list.push(new Puyo(x,y,StageList[y][x].color));
        while(true){
            let cPuyo = list.pop();
            JudgeDelPuyo(cPuyo.x,cPuyo.y,cPuyo.color);
            if(list.length == 0){
                break;
            }
            cnt++;
        }
        if(cnt >= 3){
            DelStagePuyo();
            ret = true;
        }
        cnt = 0;
    }      
    InitChecked();
    return ret;
}

// 削除
function DeletePuyo(){
    let ret = false;
    let retTemp = false;
    for (let y = 0; y < STAGE_HEIGHT; y++) {
        for (let x = 0; x < STAGE_WIDTH ; x++) {    
            retTemp = CheckRensa(x,y);
            if(retTemp){
                ret = true;  
            }
        }
    }
    return ret;
}

function move(movex,movey){
    let x;
    let y;
    for (let index = 0; index < MyBlockList.length; index++) {
        x = MyBlockList[index].x + movex;
        y = MyBlockList[index].y + movey; 

        if(IsExit(x,y)){
            return false;
        }
    }
    for (let index = 0; index < MyBlockList.length; index++) {
        MyBlockList[index].x += movex;
        MyBlockList[index].y += movey; 
    }
    return true;
}

init();
setInterval(loop, 200);