var Core = new function () {

    var sky = new Image();
    sky.src = "img/sky.svg";
    var sun = new Image();
    sun.src = "img/sun.svg";
    var submarine = new Image();
    submarine.src = "img/submarine.svg";

    var linkor = new Image();
    linkor.src = "img/battleship.svg";
    var linkorDead = new Image();
    linkorDead.src = "img/battleshipDead.svg";
    var barge = new Image();
    barge.src = "img/barge.svg";
    var bargeDead = new Image();
    bargeDead.src = "img/bargeDead.svg";
    var cruiser = new Image();
    cruiser.src = "img/cruiser.svg";
    var cruiserDead = new Image();
    cruiserDead.src = "img/cruiserDead.svg";
    var boat = new Image();
    boat.src = "img/boat.svg";
    var boatDead = new Image();
    boatDead.src = "img/boatDead.svg";
    var boatSmall = new Image();
    boatSmall.src = "img/boatSmall.svg";
    var boatSmallDead = new Image();
    boatSmallDead.src = "img/boatSmallDead.svg";

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
    var velocity = {x: 0, y: 0};

    ////////////////////////////
    var enemyCount = 0;
    var enemyBurnCount = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    var enemyBurnCountFull = 0;
    var bulletCount = 0;
    var bullet = {x: 0, y: 0, dg: 0, dGipotenusa: 0, animation: false,};
    var paddleX, lineX, seaBackground, skyBackgroundHeight, seaBackgroundHeight, alphaDeg, alphaDegConst, h, gipotenusa,
        alpha, bulletAnimationConst;
    var relativeX = 0;
    var relX = 0;
    var fire = false;
    var paddleHeight = 5;
    var paddleWidth = 50;
    var ballRadius = 10;
    var skyX = 0;
    var skyDx = 0.1;

    this.init = function () {
        canvas = document.getElementById('world');
        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            canvas.width = DEFAULT_WIDTH;
            canvas.height = DEFAULT_HEIGHT;
            paddleX = (canvas.width - paddleWidth) / 2;
            lineX = canvas.width / 2;
            seaBackground = 70; //%
            skyBackgroundHeight = canvas.height - (canvas.height * seaBackground / 100); //%
            seaBackgroundHeight = canvas.height - skyBackgroundHeight;
            bullet = {
                x: canvas.width / 2,
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
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
        if (relativeX < 0) {
            relX = 0;
            lineX = 0;
        } else if (relativeX > 0 && relativeX < canvas.width) {
            relX = relativeX * 180 / canvas.width;
            lineX = relativeX;
        } else if (relativeX > canvas.width) {
            relX = 180;
            lineX = canvas.width;
        }
    }

    function mouseClickHandler(event) {
        fire = true;
        bulletAnimationConst = (function () {
            return bullet.animation;
        })();
        if (!bulletAnimationConst) {
            bullet.x = canvas.width / 2;
            bullet.dGipotenusa = 0;
            bulletCount++;
            alphaDegConst = (function () {
                return alpha;
            })();
        }
        //console.log(bulletAnimationConst);
    }

    function drawSkyBackground() {
        context.beginPath();
        var gradient = context.createLinearGradient(0, 0, 0, skyBackgroundHeight);
        gradient.addColorStop(0, "#5087a5");
        gradient.addColorStop(1, "#ebf6f0");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, skyBackgroundHeight);
        context.closePath();
    }

    function drawSeaBackground() {
        context.beginPath();
        var gradient = context.createLinearGradient(0, skyBackgroundHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgba(9,103,130,1)"); //096782
        gradient.addColorStop(1, "rgba(4,24,23,1)"); //#041817
        context.fillStyle = gradient;
        context.fillRect(0, skyBackgroundHeight, canvas.width, canvas.height);
        context.closePath();
    }

    function drawSeaBackground2() {
        context.beginPath();
        var gradient = context.createLinearGradient(0, skyBackgroundHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgba(9,103,130,0.2)"); //096782
        gradient.addColorStop(1, "rgba(4,24,23,1)"); //#041817
        context.fillStyle = gradient;
        context.fillRect(0, skyBackgroundHeight, canvas.width, canvas.height);
        context.closePath();
    }

    function drawSky() {
        context.drawImage(sky, skyX, -3);
    }

    function drawSun() {
        context.drawImage(sun, canvas.width - 90, -10);
    }

    function drawSubmarine() {
        context.drawImage(submarine, canvas.width / 2 - 20, canvas.height - 50);
    }

    function drawPaddle() {
        context.beginPath();
        paddleX = paddleX;
        context.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        context.fillStyle = "red";
        context.fill();
        context.closePath();
    }

    function drawLine() {
        context.beginPath();
        context.moveTo(canvas.width / 2, canvas.height);
        var x = lineX;
        context.lineTo(x, skyBackgroundHeight);
        context.lineWidth = 1;
        context.strokeStyle = "#043837";
        context.closePath();
        context.stroke();
    }

    function drawText(text, x, y) {
        context.beginPath();
        context.font = '26px sans-serif';
        context.fillStyle = "#aaa";
        context.fillText(text, x, y);
        context.fill();
        context.closePath();
    }

    function drawBullet(x, y) {
        context.beginPath();
        context.arc(x, y, ballRadius, 0, Math.PI * 2);
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
    }

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawSkyBackground();
        drawSeaBackground();
        drawSun();
        drawSky();
        drawPaddle();

        skyX += skyDx;

        h = (canvas.width / 2 - lineX);
        gipotenusa = Math.sqrt(Math.pow(h, 2) + Math.pow(seaBackgroundHeight, 2));
        alpha = Math.atan(h / seaBackgroundHeight);
        alphaDeg = alpha * 180 / Math.PI;

        drawText('Врагов: ' + enemyCount, 10, 40);
        drawText(enemyBurnTextCount(), 10, 80);
        drawText('Торпед: ' + bulletCount, 10, 120);

        if (fire == true) {
            bullet.animation = true;
            drawBullet(bullet.x, bullet.y);
            bullet.dGipotenusa += bullet.dg;
            bullet.x = canvas.width / 2 - (bullet.dGipotenusa * Math.sin(alphaDegConst));
            bullet.y = canvas.height - (bullet.dGipotenusa * Math.cos(alphaDegConst));
        }

        // Go through each enemy and draw it + update its properties
        for (i = 0; i < ships.length; i++) {

            p = ships[i];
            if (p.status == 'live') {
                p.position.x += p.velocity.x;
                p.position.y = skyBackgroundHeight;
            }
            context.fillStyle = fillStyle(p.status);
            context.beginPath();
            //context.rect(p.position.x, p.position.y, p.width, p.height);
            context.drawImage(boatImg(p.size, p.status), p.position.x, p.position.y - p.draft);

            if (p.position.x > canvas.width || p.position.y > canvas.height) {
                p.status = 'dead';
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
                p.position.y += p.velocity.y / 2;
            }

            if (p.status == 'dead') {
                ships.splice(i, 1);
                i--;
            }

            context.fill();

        }
        // If there are less enemies than intended for this difficulty, add another one

        if (new Date().getTime() - lastspawn > 100) {
            var newEnemy = giveLife(new Enemy());
            //console.log(newEnemy);
            ships.push(newEnemy);
            enemyCount++;
            var delay = randomInteger(SHIP_DELAY_MIN, SHIP_DELAY_MAX);
            //console.log(delay);
            lastspawn = new Date().getTime() + delay;
        }

        if (bullet.y < skyBackgroundHeight + ballRadius) {
            bullet.x = canvas.width / 2;
            bullet.y = canvas.height;
            fire = false;
            bullet.animation = false;
        }
        drawSeaBackground2();
        drawLine();
        drawSubmarine();
        requestAnimationFrame(animate);
    }

    function giveLife(ship) {
        ship.position.x = 0;
        ship.position.y = skyBackgroundHeight;
        ship.speed = randomInteger(SHIP_SPEED_MIN, SHIP_SPEED_MAX) / 1000;
        ship.velocity.x = (world.width - ship.position.x) * 0.006 * ship.speed;
        ship.velocity.y = (world.width - ship.position.y) * 0.006 * ship.speed;
        return ship;
    }

    function fillStyle(status) {
        var fill;
        switch (status) {
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
        ++enemyBurnCountFull;
    }

    function enemyBurnTextCount() {
        var text = 'Всего: ' + enemyBurnCountFull + '  ';
        text += enemySize[1].name + ': ' + enemyBurnCount[1] + '   ';
        text += enemySize[2].name + ': ' + enemyBurnCount[2] + '   ';
        text += enemySize[3].name + ': ' + enemyBurnCount[3] + '   ';
        text += enemySize[4].name + ': ' + enemyBurnCount[4] + '   ';
        text += enemySize[5].name + ': ' + enemyBurnCount[5] + '   ';
        return text;
    }

    function boatImg(size, status) {
        switch (size) {
            case 1:
                return status == 'live' ? boatSmall : boatSmallDead;
                break;
            case 2:
                return status == 'live' ? boat : boatDead;
                break;
            case 3:
                return status == 'live' ? cruiser : cruiserDead;
                break;
            case 4:
                return status == 'live' ? linkor : linkorDead;
                break;
            case 5:
                return status == 'live' ? barge : bargeDead;
                break;
        }
    }

};

var enemySize = {
    1: {width: 30, height: 10, name: 'Лодка', draft: 8, id: 'boatSmall', img: 'boatSmall.svg'}, //8
    2: {width: 50, height: 11, name: 'Катер', draft: 13, id: 'boat', img: 'boat.svg'}, //13
    3: {width: 60, height: 12, name: 'Крейсер', draft: 19, id: 'cruiser', img: 'cruiser.svg'}, //19
    4: {width: 70, height: 13, name: 'Линкор', draft: 20, id: 'battleship', img: 'battleship.svg'}, //20
    5: {width: 80, height: 15, name: 'Баржа', draft: 14, id: 'barge', img: 'barge.svg'}, //14
}

function Enemy() {
    this.position = {x: 0, y: 0};
    this.velocity = {x: 0, y: 0};
    this.size = randomInteger(1, 5);
    this.width = enemySize[this.size].width;
    this.height = enemySize[this.size].height;
    this.speed = 1;
    this.type = 'enemy';
    this.status = 'live'; //live,burn,dead
    this.name = enemySize[this.size].name;
    this.draft = enemySize[this.size].draft;
}

function randomInteger(min, max) {
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
}

Core.init();
