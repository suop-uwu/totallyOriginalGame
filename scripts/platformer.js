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
    var debugOverlay = false;
    var temporaryValues = {
        debugOverlay: false
    };

    function resizeCanvas() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        blockSize = canvas.width / 30;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var mc = { //all the info on the mc
        idleR: loadImage('img/sprites/zeeTee/idleR.png'),
        x: 0,
        y: 3,
        velx: 0,
        vely: 0,
        onGround: true,
        accelx: 0.1,
        friction: 0.1,
        airFriction: 0.05, //todo
        maxVel: 0.3,
        gravity: 0.1,
        fallSpeed: 1.5,
        jumpHeight: 2,
        jumpSpeed: 3 //higher means slower jump
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
    ctx.font = '20px Ubuntu Mono';

    function drawChar() {
        ctx.drawImage(mc.idleR, mc.x * blockSize, canvas.height - mc.y * blockSize, blockSize, blockSize);
    }

    // .o88b. db   db  .d8b.  d8888b.  .d8b.   .o88b. d888888b d88888b d8888b.      d8888b. db   db db    db .d8888. d888888b  .o88b. .d8888. 
    //d8P  Y8 88   88 d8' `8b 88  `8D d8' `8b d8P  Y8 `~~88~~' 88'     88  `8D      88  `8D 88   88 `8b  d8' 88'  YP   `88'   d8P  Y8 88'  YP 
    //8P      88ooo88 88ooo88 88oobY' 88ooo88 8P         88    88ooooo 88oobY'      88oodD' 88ooo88  `8bd8'  `8bo.      88    8P      `8bo.   
    //8b      88~~~88 88~~~88 88`8b   88~~~88 8b         88    88~~~~~ 88`8b        88~~~   88~~~88    88      `Y8b.    88    8b        `Y8b. 
    //Y8b  d8 88   88 88   88 88 `88. 88   88 Y8b  d8    88    88.     88 `88.      88      88   88    88    db   8D   .88.   Y8b  d8 db   8D 
    // `Y88P' YP   YP YP   YP 88   YD YP   YP  `Y88P'    YP    Y88888P 88   YD      88      YP   YP    YP    `8888Y' Y888888P  `Y88P' `8888Y' 
    function updateHorVel() {
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
                        if (mc.velx + mc.friction < 0) { //velocity plus friction is not less than zero
                            mc.velx += mc.friction;
                        } else {
                            mc.velx = 0;
                        }
                    }
                    break;
            }
        }
    }

    function updateVerVel() {
        if (38 in keysDown === true || //up
            32 in keysDown === true || //space
            90 in keysDown === true) { //z
            if (mc.onGround === true) {
                mc.vely += mc.jumpHeight;
                mc.onGround = false;
            }
        }
        if (mc.onGround === false && mc.vely > mc.fallSpeed * -1) { //TODO: make stage system so that collision actually works.
            mc.vely -= mc.gravity;
        }
    }

    function debugInfo() { //TODO
        if (192 in keysDown === true &&
            temporaryValues.debugOverlay === false) {
            if (debugOverlay === false) {
                debugOverlay = true;
            } else if (debugOverlay === true) {
                debugOverlay = false;
            }
            temporaryValues.debugOverlay = true;
        }

        if (192 in keysDown === false &&
            temporaryValues.debugOverlay === true) {
            temporaryValues.debugOverlay = false;
        }
        if (debugOverlay === true) {
            ctx.fillStyle = '#263238';
            ctx.fillText('x: ' + Math.round(100 * mc.x) / 100, 0, 20);
            ctx.fillText('y: ' + Math.round(100 * mc.y) / 100, 0, 40);
        }
    }

    //sets the current level
    if (!getCookie('level')) {
        setCookie('level', 1, 9999);
        console.log(getCookie('level'));
    } else {
        console.log(getCookie('level'));
    }

    function drawStage() { //TODO
        $.each(stage, function (index1, val1) { //for each block in stage
            var column = val1;
            $.each(column, function (index2, val2) {
                switch (val2) {
                    case 'bl': //black block
                        ctx.fillRect(index1 * blockSize, canvas.height - index2 * blockSize, blockSize, blockSize); //TODO
                        break;
                    default:
                        break;
                }
            });
        });
        //        ctx.fillRect(0, canvas.height - blockSize * 2, canvas.width, blockSize * 2);
    }

    //Load current level
    var stage = $.getJSON('levels/level' + getCookie('level') + '.json', (function () {
        stage = stage.responseJSON;
        console.log(stage);
    }));

    function mainGameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (mode) {
            case 'menu':
                updateHorVel();
                updateVerVel();
                mc.x += mc.velx;
                mc.y += mc.vely / 3;
                drawStage();
                drawChar();
                debugInfo();
                break;
            default:
                break;
        }
        window.requestAnimationFrame(mainGameLoop);
    }
    window.requestAnimationFrame(mainGameLoop);
});
