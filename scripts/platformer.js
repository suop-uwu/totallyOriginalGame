var $, window, document, Image; //only so that my code checker doesn't get angry at me
/*pitfalls: 
linter doesn't recognize the use of nonexistent properties of objects
*/
//TODO make scrolling levels and custom stage system.
$(function () {
    var canvas = $('#mainCanvas')[0];
    var ctx = canvas.getContext('2d');
    var blockSize;
    var keysDown = [];

    function resizeCanvas() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        blockSize = canvas.width / 30;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        mc.accelx = blockSize / 10;
        mc.maxVel = blockSize / 3;
        mc.friction = blockSize / 10;
    }

    var mc = { //all the info on the mc
        idleR: loadImage('img/sprites/zeeTee/idleR.png'),
        x: 0,
        y: 0,
        velx: 0,
        vely: 0,
        onGround: true,
        accelx: blockSize / 10,
        friction: blockSize / 10,
        airFriction: 0.5, //todo
        maxVel: blockSize / 30,
    };

    window.onresize = resizeCanvas;
    resizeCanvas();

    function loadImage(src) { // a simple way to load images
        var temp = new Image();
        temp.src = src;
        return temp;
    }

    $(document).keydown(function (event, char) {
        char = event.which; //identify what char was pressed
        keysDown[event.keyCode] = true;
    });
    $(document).keyup(function (event, char) { //removes char from array
        char = event.which;
        delete keysDown[event.keyCode];
    });
    var mode = 'menu';


    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    function drawStuff() {
        ctx.drawImage(mc.idleR, mc.x, mc.y, blockSize, blockSize);
        ctx.fillRect(0, canvas.height - blockSize * 2, canvas.width, blockSize * 2);
    }

    function mainGameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (mode) {
            case 'menu':
                if (keysDown[37] === true && keysDown[39] === undefined) { //left arrow & not right
                    if (Math.sqrt(Math.pow(mc.velx, 2)) < mc.maxVel || mc.velx >= 0) { //if aboslute value is less than max vel or vel is in the opposite direction being pressed
                        mc.velx -= mc.accelx;
                    }
                }
                if (keysDown[39] === true && keysDown[37] === undefined) { //right arrow & not left
                    if (Math.sqrt(Math.pow(mc.velx, 2)) < mc.maxVel || mc.velx <= 0) { //if aboslute value is less than max vel or vel is in the opposite direction being pressed
                        mc.velx += mc.accelx;
                    }
                }
                if (keysDown[37] === undefined && keysDown[39] === undefined || keysDown[37] === true && keysDown[39] === true) { //neither left or right or both left and right
                    switch (mc.onGround) {
                        case true:
                            if (mc.velx > 0) { //if user is heading right
                                if (mc.velx - mc.friction > 0) { //if velocity after friction isn't in the opposite direction
                                    mc.velx -= mc.friction;
                                } else {
                                    mc.velx = 0;
                                }
                            } else if (mc.velx < 0) { //if user is heading left
                                console.log(mc.velx + mc.friction < 0);
                                if (mc.velx + mc.friction < 0) { //velocity plus friction is not less than zero
                                    mc.velx += mc.friction;
                                } else {
                                    mc.velx = 0;
                                }
                            }
                            break;
                        default:
                            if (mc.velx > 0) { //if user is heading right
                                if (mc.velx - mc.friction > 0) { //if velocity after friction isn't in the opposite direction
                                    mc.velx -= mc.friction;
                                } else {
                                    mc.velx = 0;
                                }
                            } else if (mc.velx < 0) { //if user is heading left
                                console.log(mc.velx + mc.friction < 0);
                                if (mc.velx + mc.friction < 0) { //velocity plus friction is not less than zero
                                    mc.velx += mc.friction;
                                } else {
                                    mc.velx = 0;
                                }
                            }
                            break;
                    }
                }
                mc.x += mc.velx;
                mc.y += mc.vely;
                drawStuff();
                break;
            default:
                break;
        }
        window.requestAnimationFrame(mainGameLoop);
    }
    window.requestAnimationFrame(mainGameLoop);
});
