var Core = new function(){

	var DEFAULT_WIDTH = 1800,
		DEFAULT_HEIGHT = 600,
		SHIP_SPEED_MIN = 90, 
		SHIP_SPEED_MAX = 100, //max 1000
		SHIP_DELAY_MIN = 2000, //ms
		SHIP_DELAY_MAX = 2500; //ms
	var ORGANISM_ENEMY = 'enemy';
	var world = {
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT
	};
	var canvas;
	var ships = [];
	var lastspawn = 0;
	var velocity = { x: 0, y: 0 };

	////////////////////////////
	var enemyCount = 0;
	var enemyBurnCount = {1:0,2:0,3:0,4:0,5:0};
	var bulletCount = 0;
    var bullet = { x: 0, y: 0, dg: 0, dGipotenusa: 0, animation: false,};
	var paddleX, lineX, seaBackground, skyBackgroundHeight, seaBackgroundHeight, alphaDeg, alphaDegConst, h, gipotenusa, alpha, bulletAnimationConst;
	var relativeX = 0;
    var relX = 0;
    var fire = false;
    var paddleHeight = 5;
    var paddleWidth = 50;
    var ballRadius = 10;

	this.init = function(){
		canvas = document.getElementById('world');
		if (canvas && canvas.getContext) {
			context = canvas.getContext('2d');
			canvas.width = DEFAULT_WIDTH;
			canvas.height = DEFAULT_HEIGHT;
			paddleX = (canvas.width-paddleWidth)/2;
		    lineX = canvas.width/2;
		    seaBackground = 70; //%
		    skyBackgroundHeight = canvas.height - (canvas.height * seaBackground/100); //%
		    seaBackgroundHeight = canvas.height - skyBackgroundHeight;
		    bullet = {
		        x: canvas.width/2,
		        y: canvas.height,
		        dg: 15, 
		        dGipotenusa: 0,
		        animation: false
		    };
			document.addEventListener("mousemove", mouseMoveHandler, false);
    		document.addEventListener("click", mouseClickHandler, false);
			animate();
		}
	};

    function mouseMoveHandler(event) {
        relativeX = event.clientX - canvas.offsetLeft;
        if(relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth/2;
        }
        if(relativeX < 0) {
            relX = 0;
            lineX = 0;
        } else if (relativeX > 0 && relativeX < canvas.width) {
            relX = relativeX * 180/canvas.width;
            lineX = relativeX;
        } else if (relativeX > canvas.width) {
            relX = 180;
            lineX = canvas.width;
        }
    }

    function mouseClickHandler(event) {
        fire = true;
        bulletAnimationConst = (function () {return bullet.animation;})();
        if (!bulletAnimationConst) {
            bullet.x = canvas.width/2;
            bullet.dGipotenusa = 0;
            bulletCount++;
            alphaDegConst = (function () {return alpha;})();
        }
        //console.log(bulletAnimationConst);
    }

    function drawBackground() {
        context.beginPath();
        var gradient = context.createLinearGradient(0, skyBackgroundHeight, 0, canvas.height);
        gradient.addColorStop(0, "#0000e6");
        gradient.addColorStop(1, "#000");
        context.fillStyle = gradient;
        context.fillRect(0, skyBackgroundHeight, canvas.width, canvas.height);
        context.closePath();
    }

    function drawPaddle() {
        context.beginPath();
        paddleX = paddleX;
        context.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
        context.fillStyle = "red";
        context.fill();
        context.closePath();
    }

    function drawLine() {
        context.beginPath();
        context.moveTo(canvas.width/2,canvas.height);
        var x = lineX;
        context.lineTo(x, skyBackgroundHeight);
        context.lineWidth = 1;
        context.strokeStyle  = "#ccccff";
        context.closePath();
        context.stroke();
    }

    function drawText(text, x, y) {
        context.beginPath();
        context.font = '48px serif';
        context.fillStyle = "#aaa";
        context.fillText(text, x, y);
        context.fill();
        context.closePath();
    }

    function drawBullet(x,y) {
        context.beginPath();
        context.arc(x, y, ballRadius, 0, Math.PI*2);
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
    }

	function animate() {
		context.clearRect(0,0,canvas.width,canvas.height);
		drawBackground();
		drawPaddle();
		drawLine();

        h = (canvas.width/2 - lineX);
        gipotenusa = Math.sqrt(Math.pow(h, 2) + Math.pow(seaBackgroundHeight, 2));
        alpha = Math.atan(h/seaBackgroundHeight);
        alphaDeg = alpha * 180 / Math.PI;

        drawText(enemyCount, 10, 40);
        //drawText(enemyBurnCount, 10, 80);
        drawText(bulletCount, 10, 120);

        if (fire == true) {  
            bullet.animation = true;          
            drawBullet(bullet.x,bullet.y);
            bullet.dGipotenusa += bullet.dg;
            bullet.x = canvas.width/2 - (bullet.dGipotenusa * Math.sin(alphaDegConst));
            bullet.y = canvas.height - (bullet.dGipotenusa * Math.cos(alphaDegConst));
        } 

		// Go through each enemy and draw it + update its properties
		for( i = 0; i < ships.length; i++ ) {

			p = ships[i];
			if (p.status == 'live') {
				p.position.x += p.velocity.x;
				p.position.y = skyBackgroundHeight;
			}
			context.fillStyle = fillStyle(p.status);
			context.beginPath();
			//context.arc(p.position.x, p.position.y, p.size/2, 0, Math.PI*2, true);
			context.rect(p.position.x, p.position.y, p.width, p.height);
			
			if ( p.position.x > canvas.width || p.position.y > canvas.height) {
				p.status = 'dead';
				ships.splice( i, 1 );
				i --;
				//console.log(ships);
			}
			///////////////////////////
	        if (p.status == 'live' && bullet.x > p.position.x - 5 && bullet.x < p.position.x + p.width + 5 && bullet.y < skyBackgroundHeight + p.height) {  	
	            p.status = 'burn';
	            enemyBurnSizeCount(p.size);
	        }
	        if (p.status == 'burn') {  	
	            context.fillStyle = fillStyle(p.status);
	            p.position.x += 0;
				p.position.y += p.velocity.x/2;
	        }
			// if( p.status == 'dead') {
			// 	ships.splice( i, 1 );
			// 	i --;
			// } else {
			// 	if( p.type == ORGANISM_ENEMY ) enemyCount ++;
			// }
			/////////////////////////
			//console.log(enemyCount);
			context.fill();
		
		}
		// If there are less enemies than intended for this difficulty, add another one

		if( new Date().getTime() - lastspawn > 100 ) {			
			var newEnemy = giveLife( new Enemy() );
			//console.log(newEnemy);
			ships.push( newEnemy );
			enemyCount ++;
			var delay = randomInteger(SHIP_DELAY_MIN, SHIP_DELAY_MAX);
			//console.log(delay);
			lastspawn = new Date().getTime() + delay;
		}

        if (bullet.y < skyBackgroundHeight + ballRadius) {
            bullet.x = canvas.width/2;
            bullet.y = canvas.height; 
            fire = false;
            bullet.animation = false;
        }

		requestAnimationFrame( animate );
	}

	function giveLife( ship ) {
		ship.position.x = 0;
		ship.position.y = skyBackgroundHeight;
		ship.speed = randomInteger(SHIP_SPEED_MIN, SHIP_SPEED_MAX)/1000;
		ship.velocity.x = ( world.width - ship.position.x ) * 0.006 * ship.speed;
		ship.velocity.y = ( world.width - ship.position.y ) * 0.006 * ship.speed;
		return ship;
	}

	function fillStyle( status ) {
			var fill;
		switch(status) {
			case 'live':
				fill = 'green';
				break;
			case 'burn':
				fill = 'rgba( 255, 0, 0, 1 )';
				break;
			case 'dead':
				fill = 'black';
				break;
		}
		return fill;
	}

	function enemyBurnSizeCount(size) {
		++enemyBurnCount[size];
	}

};

var enemySize = {
		1: {width: 30, height: 10, name: 'Лодка'},
		2: {width: 40, height: 11, name: 'Катер'},
		3: {width: 50, height: 12, name: 'Крейсер'},
		4: {width: 60, height: 13, name: 'Линкор'},
		5: {width: 70, height: 15, name: 'Баржа'},
	}

function Enemy() {
	this.position = { x: 0, y: 0 };
	this.velocity = { x: 0, y: 0 };
	this.size = randomInteger(1, 5);
	this.width = enemySize[this.size].width;
	this.height = enemySize[this.size].height;
	this.speed = 1;
	this.type = 'enemy';
	this.status = 'live'; //live,burn,dead
	this.name = enemySize[this.size].name;
}
function randomInteger(min, max) {
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
}
Core.init();