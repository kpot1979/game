var Core = new function () {

    var sky = new Image();
    sky.src = "img/sky.svg";
    var sun = new Image();
    sun.src = "img/sun.svg";
    var submarine = new Image();
    submarine.src = "img/submarine.svg";
    var aim = new Image();
    aim.src = "img/aim.svg";
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

    var aimX, lineX, seaBackground, skyBackgroundHeight, seaBackgroundHeight, alphaDeg, alphaDegConst, h, gipotenusa,
        alpha, bulletAnimationConst;
    var DEFAULT_WIDTH = 1800,
        DEFAULT_HEIGHT = 600,
        SHIP_DELAY_MIN = 2000, //ms
        SHIP_DELAY_MAX = 3500; //ms
    var ORGANISM_ENEMY = 'enemy';
    var world = {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    };
    var canvas;
    var ships = [];
    var lastspawn = 0;
    var velocity = {x: 0, y: 0};
    var score = 0;
    var playing = false;
    var time = 0;
    var duration = 0;
    var enemyCount = 0;
    var enemyBurnCount = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    var hitStat = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    var enemyBurnCountFull = 0;
    var enemyBurnCountFullConst;
    var bulletCount = 0;
    var bullet = {x: 0, y: 0, dg: 0, dGipotenusa: 0, animation: false,};
    var enemyBulletStatus = false;
    var relativeX = 0;
    var relX = 0;
    var fire = false;
    var aimHeight = 28;
    var aimWidth = 28;
    var ballRadius = 5;
    var skys = [];
    var submarinePadding = 20;
    var submarineHeight = 50;
    var bubbles = [];
    var explosion = [];
    var newSky;
    var skyW = 1765;
    var health = 100;
    var bonusScore = 4000;

    this.init = function () {
        canvas = document.getElementById('world');
        startButton = document.getElementById('startButton');
        message = document.getElementById('message');
        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            canvas.width = DEFAULT_WIDTH;
            canvas.height = DEFAULT_HEIGHT;
            aimX = (canvas.width - aimWidth) / 2;
            lineX = canvas.width / 2;
            seaBackground = 70; //%
            skyBackgroundHeight = canvas.height - (canvas.height * seaBackground / 100); //%
            seaBackgroundHeight = canvas.height - skyBackgroundHeight;
            bullet = {
                x: canvas.width / 2,
                y: canvas.height - submarinePadding,
                dg: 10,
                deflection: 0,
                dGipotenusa: 0,
                animation: false
            };
            message.setAttribute("style", "margin-top:" + (canvas.height / 2 - 100) + "px;");
            document.addEventListener("mousemove", mouseMoveHandler, false);
            document.addEventListener("click", mouseClickHandler, false);
            animate();
        }
    };

    function gameOver() {
        playing = false;
        duration = new Date().getTime() - time;
        message.setAttribute("style", "display:block;margin-top:" + (canvas.height / 2 - 100) + "px;");
        startButton.classList.add("game-over");
        startButton.childNodes[0].nodeValue = "Игра окончена!";
        setTimeout(function () {
            startButton.classList.remove("game-over");
            startButton.childNodes[0].nodeValue = "Начать игру";
        }, 4000);
    }

    function mouseMoveHandler(event) {
        relativeX = event.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            aimX = relativeX - aimWidth / 2;
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
        if (event.target == startButton) {
            if (playing == false) {
                message.setAttribute("style", "display:none;");
                playing = true;
                health = 100;
                ships = [];
                enemyCount = 0;
                enemyBurnCount = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                hitStat = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                enemyBurnCountFull = 0;
                enemyBurnCountFullConst;
                bulletCount = 0;
                enemyBulletStatus = false;
                time = new Date().getTime();

            }
        } else {
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
                enemyBurnCountFullConst = (function () {
                    return enemyBurnCountFull;
                })();
            }
        }
    }

    function drawSkyBackground() {
        context.beginPath();
        let gradient = context.createLinearGradient(0, 0, 0, skyBackgroundHeight);
        gradient.addColorStop(0, "#5087a5");
        gradient.addColorStop(1, "#ebf6f0");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, skyBackgroundHeight);
        context.closePath();
    }

    function drawSeaBackground() {
        context.beginPath();
        let gradient = context.createLinearGradient(0, skyBackgroundHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgba(9,103,130,1)"); //096782
        gradient.addColorStop(1, "rgba(4,24,23,1)"); //#041817
        context.fillStyle = gradient;
        context.fillRect(0, skyBackgroundHeight, canvas.width, canvas.height);
        context.closePath();
    }

    function drawSeaBackground2() {
        context.beginPath();
        let gradient = context.createLinearGradient(0, skyBackgroundHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgba(9,103,130,0.2)"); //096782
        gradient.addColorStop(1, "rgba(4,24,23,1)"); //#041817
        context.fillStyle = gradient;
        context.fillRect(0, skyBackgroundHeight, canvas.width, canvas.height);
        context.closePath();
    }

    function drawHealth(x, y, health) {
        let widthMax = 135;
        let height = 12;
        let width = health * widthMax / 100;
        let r = 255 - Math.round(health * 255 / 100);
        let g = Math.round(health * 155 / 100);
        let color = "rgba(" + r + ", " + g + ", 0, 1)";
        context.beginPath();
        context.fillStyle = "rgba(0,0,0,0.5)";
        context.fillRect(x, y, widthMax, height);
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
        context.closePath();
    }

    function drawSky(x, y) {
        context.drawImage(sky, x, y);
    }

    function drawSun() {
        context.drawImage(sun, canvas.width - 90, -10);
    }

    function drawSubmarine() {
        context.drawImage(submarine, canvas.width / 2 - submarinePadding, canvas.height - 50);
    }

    function drawAim() {
        context.drawImage(aim, aimX, skyBackgroundHeight - aimHeight / 2 - 3, aimWidth, aimHeight);
    }

    // function drawLine() {
    //     context.beginPath();
    //     context.moveTo(canvas.width / 2, canvas.height - submarinePadding);
    //     let x = lineX;
    //     context.lineTo(x, skyBackgroundHeight);
    //     context.lineWidth = 1;
    //     context.strokeStyle = "#043837";
    //     context.closePath();
    //     context.stroke();
    // }

    function drawText(text, x, y, size) {
        context.beginPath();
        context.font = size + 'px sans-serif';
        context.fillStyle = "#fff";
        context.fillText(text, x, y);
        context.fill();
        context.closePath();
    }

    function drawBullet(x, y) {
        context.beginPath();
        context.arc(x, y, ballRadius, 0, Math.PI * 2);
        context.fillStyle = "#000";
        context.fill();
        context.closePath();
    }

    function drawEnemyBullet(x, y) {
        context.beginPath();
        context.arc(x, y, ballRadius, 0, Math.PI * 2);
        context.fillStyle = "red";
        context.fill();
        context.closePath();
    }

    function emitBubbles(position, direction, spread, seed) {
        let q = seed + (Math.random() * seed);
        while (--q >= 0) {
            let p = new Point();
            p.position.x = position.x + (Math.sin(q) * spread);
            p.position.y = position.y + (Math.cos(q) * spread);
            p.velocity = {x: direction.x + (-2 + Math.random() * 2), y: direction.y + (-1 + Math.random() * 2)};
            p.alpha = 1;
            bubbles.push(p);
        }
    }

    function emitFire(position, direction, spread, seed) {
        let q = seed + (Math.random() * seed);
        while (--q >= 0) {
            let p = new Point();
            p.position.x = position.x + (Math.sin(q) * spread);
            p.position.y = position.y + (Math.cos(q) * spread);
            p.velocity = {x: direction.x + (-2 + Math.random() * 2), y: direction.y + (-1 + Math.random() * 2)};
            p.alpha = 1;
            explosion.push(p);
        }
    }

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawSkyBackground();
        drawSeaBackground();
        drawSun();

        if (playing) {

            for (i = 0; i < skys.length; i++) {
                s = skys[i];
                s.position.x += 0.25;
                drawSky(s.position.x, s.position.y);
                if (s.position.x == canvas.width) {
                    skys.splice(i, 1);
                    i--;
                }
            }
            if (skys.length < 1) {
                newSky = giveSky(new Sky());
                skys.push(newSky);
            } else if (skys.length > 0 && skys.length < 2) {
                newSky = giveSky(new Sky());
                newSky.position.x = canvas.width - ((skys.length + 1) * skyW);
                skys.push(newSky);
            }


            h = (canvas.width / 2 - lineX);
            gipotenusa = Math.sqrt(Math.pow(h, 2) + Math.pow(seaBackgroundHeight - submarinePadding, 2));
            alpha = Math.atan(h / (seaBackgroundHeight - submarinePadding));
            alphaDeg = alpha * 180 / Math.PI;

            if (fire == true) {
                bullet.animation = true;
                drawBullet(bullet.x, bullet.y);
                drawSky(s.position.x, s.position.y);
                bullet.dGipotenusa += bullet.dg;
                bullet.x = canvas.width / 2 - (bullet.dGipotenusa * Math.sin(alphaDegConst));
                bullet.y = (canvas.height - submarinePadding) - (bullet.dGipotenusa * Math.cos(alphaDegConst));
            }

            // Go through each enemy and draw it + update its properties
            for (i = 0; i < ships.length; i++) {

                p = ships[i];
                if (p.status == 'live') {
                    p.position.x += p.velocity.x;
                    p.position.y = skyBackgroundHeight;
                }
                context.beginPath();
                context.drawImage(boatImg(p.size, p.status), p.position.x, p.position.y - p.draft);

                if (p.position.x > canvas.width / 2) {
                    drawEnemyBullet(p.enemyBullet.x, p.enemyBullet.y);
                    p.enemyBullet.x = canvas.width / 2;
                    p.enemyBullet.y += p.enemyBullet.dy;
                    if (p.enemyBullet.y > canvas.height - submarineHeight && p.enemyBullet.y < canvas.height) {
                        p.enemyBullet.y = p.enemyBullet.y;
                        enemyBulletStatus = true;
                    } else if (p.enemyBullet.y > canvas.height) {
                        enemyBulletStatus = false;
                    }
                }


                if (p.position.x > canvas.width || p.position.y > canvas.height) {
                    p.status = 'dead';
                    if (p.position.x > canvas.width) {
                        score -= 300;
                    }
                }

                if (p.status == 'live' && bullet.x > p.position.x - bullet.deflection && bullet.x < p.position.x + p.width + bullet.deflection && bullet.y < skyBackgroundHeight + p.height) {
                    p.status = 'burn';
                    p.timeDeath = new Date().getTime();
                    enemyBurnSizeCount(p.size);
                    score += p.score;
                    ++enemyBurnCountFull;
                }
                if (p.status == 'burn' || p.status == 'sink') {
                    if (p.status == 'burn') {
                        emitFire({x: p.position.x + p.width / 2, y: p.position.y}, {
                            x: 30 * 0.03,
                            y: -30 * 0.01
                        }, 1, p.size * 10);
                        p.position.x += 0;
                        p.position.y = p.position.y;
                        p.y += p.velocity.y / 2;
                    }

                    if (new Date().getTime() - p.timeDeath > 200) {
                        p.status = 'sink';
                    }
                    if (p.status == 'sink') {
                        p.position.x += 0;
                        p.position.y += p.velocity.y / 2;
                        var seeds = p.size - (p.size * (p.position.y - skyBackgroundHeight) / seaBackgroundHeight * 2);
                        if (seeds > 0) {
                            emitBubbles({x: p.position.x + p.width / 10 * 4, y: p.position.y}, {
                                x: 40 * 0.03,
                                y: -40 * 0.01
                            }, 2, seeds);
                        }
                    }
                }

                if (p.status == 'dead') {
                    ships.splice(i, 1);
                    i--;
                }

                context.fill();

            }


            drawSeaBackground2();
            if (new Date().getTime() - lastspawn > 100) {
                var newEnemy = giveLife(new Enemy());
                newEnemy.enemyBullet.y = skyBackgroundHeight;
                ships.push(newEnemy);
                enemyCount++;
                var delay = randomInteger(SHIP_DELAY_MIN, SHIP_DELAY_MAX);
                lastspawn = new Date().getTime() + delay;
            }

            for (i = 0; i < bubbles.length; i++) {
                p = bubbles[i];

                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;

                p.alpha -= 0.02;

                context.fillStyle = 'rgba(255,255,255,' + Math.max(p.alpha, 0) + ')';
                context.fillRect(p.position.x, p.position.y, 1, 1);

                if (p.alpha <= 0) {
                    bubbles.splice(i, 1);
                }
            }

            for (i = 0; i < explosion.length; i++) {
                p = explosion[i];

                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;

                p.alpha -= 0.02;

                context.fillStyle = getRandomColor() + Math.max(p.alpha, 0) + ')';
                context.fillRect(p.position.x, p.position.y, 1, 1);

                if (p.alpha <= 0) {
                    explosion.splice(i, 1);
                }
            }

            if (bullet.y < skyBackgroundHeight + ballRadius) {
                bullet.x = canvas.width / 2;
                bullet.y = canvas.height;
                hitStatCount(enemyBurnCountFull - enemyBurnCountFullConst);
                fire = false;
                bullet.animation = false;
            }

            if (enemyBulletStatus == true) {
                emitBubbles({x: canvas.width / 2, y: canvas.height - submarineHeight}, {
                    x: 30 * 0.03,
                    y: -30 * 0.01
                }, 2, 2);
                health = health - 0.5;
            }
        }
        if (health < 0) {
            setTimeout(function () {
                gameOver();
            }, 800);
            health = 0;
        }
        if (health < 100 && score > bonusScore) {
            score = score - bonusScore;
            health = health + 10;
            if (health > 100) health = 100;
        }
        drawText('Всего врагов: ' + enemyCount, 10, canvas.height - 190, 18);
        drawText(enemyBurnTextCount()[0], 10, canvas.height - 160, 18);
        drawText(enemyBurnTextCount()[1], 10, canvas.height - 140, 12);
        drawText(enemyBurnTextCount()[2], 10, canvas.height - 120, 12);
        drawText(enemyBurnTextCount()[3], 10, canvas.height - 100, 12);
        drawText(enemyBurnTextCount()[4], 10, canvas.height - 80, 12);
        drawText(enemyBurnTextCount()[5], 10, canvas.height - 60, 12);
        drawText('Использовано торпед: ' + bulletCount, 10, canvas.height - 30, 18);
        drawAim();
        drawHealth(canvas.width - 150, canvas.height - 180, health);
        drawText('Здоровье: ' + Math.round(health) + '%', canvas.width - 150, canvas.height - 150, 18);
        drawText('Промахов:  ' + hitStat[0], canvas.width - 150, canvas.height - 120, 12);
        drawText('Попаданий: ' + hitStat[1], canvas.width - 150, canvas.height - 100, 12);
        drawText('Комбо: ' + hitStat[2], canvas.width - 150, canvas.height - 80, 12);
        drawText('Трипл: ' + hitStat[3], canvas.width - 150, canvas.height - 60, 12);
        drawText('Очков: ' + score, canvas.width - 150, canvas.height - 30, 18);
        //drawLine();
        drawSubmarine();
        requestAnimationFrame(animate);
    }

    function giveLife(ship) {
        ship.position.x = 0;
        ship.position.y = skyBackgroundHeight;
        ship.velocity.x = (world.width - ship.position.x) * 0.006 * ship.speed / 10;
        ship.velocity.y = (world.width - ship.position.y) * 0.006 * ship.speed / 10;
        return ship;
    }

    function giveSky(sky) {
        sky.position.x = 0;
        sky.position.y = -5;
        sky.velocity.x = 0.1;
        return sky;
    }

    function enemyBurnSizeCount(size) {
        ++enemyBurnCount[size];
    }

    function hitStatCount(type) {
        ++hitStat[type];
        switch (type) {
            case 0:
                score -= 300;
                break;
            case 1:
                score += 0;
                break;
            case 2:
                score += 1000;
                break;
            case 3:
                score += 2000;
                break;
            case 4:
                score += 3000;
                break;
            case 5:
                score += 4000;
                break;
        }
    }

    function enemyBurnTextCount() {
        var text = [];
        text.push('Потоплено: ' + enemyBurnCountFull);
        text.push(enemySize[1].name + ': ' + enemyBurnCount[1]);
        text.push(enemySize[2].name + ': ' + enemyBurnCount[2]);
        text.push(enemySize[3].name + ': ' + enemyBurnCount[3]);
        text.push(enemySize[4].name + ': ' + enemyBurnCount[4]);
        text.push(enemySize[5].name + ': ' + enemyBurnCount[5]);
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
    1: {width: 30, height: 10, name: 'Лодка', draft: 8, id: 'boatSmall', img: 'boatSmall.svg', speed: 1, score: 50}, //8
    2: {width: 50, height: 11, name: 'Катер', draft: 13, id: 'boat', img: 'boat.svg', speed: 0.95, score: 100}, //13
    3: {width: 60, height: 12, name: 'Крейсер', draft: 19, id: 'cruiser', img: 'cruiser.svg', speed: 0.85, score: 300}, //19
    4: {
        width: 70,
        height: 13,
        name: 'Линкор',
        draft: 20,
        id: 'battleship',
        img: 'battleship.svg',
        speed: 0.9,
        score: 500
    }, //20
    5: {width: 80, height: 15, name: 'Баржа', draft: 14, id: 'barge', img: 'barge.svg', speed: 0.7, score: 200}, //14
};

function Point(x, y) {
    this.position = {x: x, y: y};
}

function Enemy() {
    this.position = {x: 0, y: 0};
    this.velocity = {x: 0, y: 0};
    this.size = randomInteger(1, 5);
    this.width = enemySize[this.size].width;
    this.height = enemySize[this.size].height;
    this.speed = enemySize[this.size].speed;
    this.type = 'enemy';
    this.status = 'live'; //live,burn,sink,dead
    this.name = enemySize[this.size].name;
    this.draft = enemySize[this.size].draft;
    this.timeDeath = null;
    this.score = enemySize[this.size].score;
    this.enemyBullet = {x: 0, y: 0, dy: 2, status: false};
}

function Sky() {
    this.position = {x: 0, y: 0};
    this.velocity = {x: 0, y: 0};
}

function randomInteger(min, max) {
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
}

function getRandomColor() {
    color = ["rgba(255, 100, 0,", "rgba(82, 0, 0,", "rgba(105, 0, 0,", "rgba(140, 0, 0,", "rgba(185, 0, 0,", "rgba(245, 0, 0,"];
    return color[randomInteger(0, 5)];
}

Core.init();
