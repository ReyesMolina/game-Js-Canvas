const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');

//constantes eventos y botones
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');
const btnResetRecord = document.querySelector('#resetRecord');
const btnReloadGame = document.querySelector('#reloadGame');
var gifLose = document.querySelector('#giftLose');


let canvasSize;
let elementSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;  //variable donde se guarda la ejecucuin de un nuevo intervalo

//posicion del jugador
const playerPOsition = {
    x: undefined,
    y: undefined,
};

//colision regalito
const giftPOsition = {
    x: undefined,
    y: undefined,
};

const firePos={
    x: undefined,
    y: undefined,
};

//colision bombas
let enemiesPositions = [];

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function setCanvasSize(){
    if (window.innerHeight > window.innerWidth){
        canvasSize = window.innerWidth * 0.7;
    } else{
        canvasSize = window.innerHeight * 0.7;
    }

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    elementSize = canvasSize / 10.2;

    playerPOsition.x = undefined;
    playerPOsition.y = undefined;
    startGame();
}


//REFACTORIZANDO LA FUNCION satartGame()
function startGame(){     

    game.font = (elementSize - 11) + 'px Verdana';
    game.textAlign = 'end';

    const map = maps[level];
    if (!map){
        gameWin();
        return;
    };

    if(!timeStart){
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
    }

    const mapRows = map.trim().split('\n');
    const mapRowCols = mapRows.map(row => row.trim().split(''));

    showLives();

    enemiesPositions = [];
    game.clearRect(0,0, canvasSize, canvasSize);
    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementSize * (colI + 1); 
            const posY = elementSize * (rowI + 1);
            
            
            //creamos una condicion para ubicar el jugador en la posicion inicial(donde esta la puerta)
            if(col == 'O'){
                if(!playerPOsition.x && !playerPOsition.y){
                    playerPOsition.x = posX;
                    playerPOsition.y = posY;
                    console.log({playerPOsition});
                }
            } 
            //condicion para ubicar el objeto reglo
            else if(col == 'I'){
                giftPOsition.x = posX;
                giftPOsition.y = posY;
            }
            //condicional para las bombas
            else if(col == 'X'){
                enemiesPositions.push({
                    x: posX,
                    y: posY
                });
            }
            
            game.fillText(emoji, posX, posY);
                });
    });
    movePLayer();
}

function movePLayer(){
    //limitando los bordes
    if (playerPOsition.x < elementSize){
        playerPOsition.x = elementSize;
    }
    if (playerPOsition.x > elementSize * 10){
        playerPOsition.x = elementSize * 10;
    }
    if (playerPOsition.y < elementSize){
        playerPOsition.y = elementSize;
    }
    if (playerPOsition.y > elementSize * 10){
        playerPOsition.y = elementSize * 10;
    }

    //buscando si colisiona con el regalo
    const giftColisionX = playerPOsition.x.toFixed(3) == giftPOsition.x.toFixed(3);
    const giftColisionY = playerPOsition.y.toFixed(3) == giftPOsition.y.toFixed(3);
    const giftColision = giftColisionX && giftColisionY;

    if (giftColision){
        levelWin();
    }

    //buscando colision con bomba
    const enemyCollision =enemiesPositions.find(enemy => {
        const enemyColisionx = enemy.x.toFixed(3) == playerPOsition.x.toFixed(3);
        const enemyColisiony = enemy.y.toFixed(3) == playerPOsition.y.toFixed(3);
        return enemyColisionx && enemyColisiony;
    });

    if (enemyCollision){
        showFire();
        setTimeout(levelFail, 250);
        playerPOsition.x = undefined;
        playerPOsition.y = undefined;
    }

    //renderizando jugador
    game.fillText(emojis['PLAYER'], playerPOsition.x, playerPOsition.y);
}
function showFire(){
    firePos.x = playerPOsition.x;
    firePos.y = playerPOsition.y;
    fireExp();
}
function fireExp(){
    game.fillText(emojis['BOMB_COLLISION'], firePos.x, firePos.y);
}


//colision, llegada a puerta de cambio de mundo
function levelWin(){
    console.log('pasaste nivel');
    level++;
    startGame();
}

//colision con enemigo
function levelFail(){
    lives--;
    if (lives <= 0){    
        gifShowLose();
        level = 0;
        lives = 3;
        timeStart = undefined; //reinicia el tiempo
    }
    else{
        playerPOsition.x = undefined;
        playerPOsition.y = undefined;
        startGame();
    }
}
//gif de derrota
function gifShowLose(){
        game.clearRect(0,0, canvasSize, canvasSize);  
        game.drawImage(gifLose, 0, 0, canvasSize, canvasSize);
        setTimeout(startGame, 1500);
}



//funcion que reinicia luego de perder vidas
function reloadGame(){
    level = 0;
    lives = 3;
    timeStart = undefined; //reinicia el tiempo
}


//finalizando el juego
function gameWin(){
    console.log('terminaste');
    clearInterval(timeInterval);

    //creando el registro de recor de juego
    const recordTime = localStorage.getItem('record_time');
    const playerTime = Date.now() - timeStart;
    if(recordTime){
        if(recordTime >= playerTime){
            localStorage.setItem('record_time', playerTime);
            pResult.innerHTML = 'Superaste el record';
        }else{
            pResult.innerHTML = 'no superaste el record';
        }
    }else{
        localStorage.setItem('record_time', playerTime);
        pResult.innerHTML = 'primera vez,  ahora supera tu tiempo';
    }

    console.log({recordTime, playerTime});
}

//mostrar vidas restantes
function showLives(){
    const heartsArray = Array(lives).fill(emojis['HEART']);  //crea un array con los elemento de live
    console.log(heartsArray);
    spanLives.innerHTML = "";
    heartsArray.forEach(heart => spanLives.append(heart));
}

//mostrar tiempo de juego
function showTime(){
    if(gameWin){
        spanTime.innerHTML = time;
    }
    spanTime.innerHTML = Date.now() - timeStart;
}

//mostrar record
function showRecord(){
    spanRecord.innerHTML = localStorage.getItem('record_time');
}


// eventos y botones
//evento teclado
window.addEventListener('keydown', moveByKeys);

//evento botones
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);
btnResetRecord.addEventListener('click', resetRecord);
//evento reiniciar juego
btnReloadGame.addEventListener('click',reloadGame);

//funcion recargar juego
function reloadGame(){
    location.reload();
}

//funcion reiniciar el record
function resetRecord(){
    localStorage.removeItem('record_time');
}

//funcion para teclas
function moveByKeys(event){
    if (event.key == "ArrowUp") moveUp();
    else if (event.key == "ArrowLeft") moveLeft();
    else if (event.key == "ArrowRight") moveRight();
    else if (event.key == "ArrowDown") moveDown();
    else{
        console.log(`tecla incorrecta, presionaste ${event.code}`);
    }
}

//funciones para cada evento tanto boton como accion
function moveUp(){
    console.log('arriba');
        playerPOsition.y -= elementSize;
        startGame();
}
function moveLeft(){
    console.log('izquierda');
    playerPOsition.x -= elementSize;
    startGame();
}
function moveRight(){
    console.log('derecha');
    playerPOsition.x += elementSize;
    startGame();
}
function moveDown(){
        playerPOsition.y += elementSize;
        startGame();
}
