var $, window, document, Image; //only so that my code checker doesn't get angry at me
/*pitfalls:
linter doesn't recognize the use of nonexistent properties of objects
*/
//TODO make scrolling levels and custom stage system.
$(function() {
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
            if (c.indexOf(name) == 0) {
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
        fallSpeed: 1,
        jumpHeight: 2,
        jumpSpeed: 3//higher means slower jump
    };

    window.onresize = resizeCanvas;
    resizeCanvas();

    function loadImage(src) { // a simple way to load images
        var temp = new Image();
        temp.src = src;
        return temp;
    }

    $(document).keydown(function(event, char) {
        char = event.which; //identify what char was pressed
        keysDown[event.keyCode] = true;
    });
    $(document).keyup(function(event, char) { //removes char from array
        char = event.which;
        delete keysDown[event.keyCode];
    });
    var mode = 'menu';


    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    function drawStuff() {
        ctx.fillRect(0, canvas.height - blockSize * 2, canvas.width, blockSize * 2);
        ctx.drawImage(mc.idleR, mc.x * blockSize, canvas.height - mc.y * blockSize, blockSize, blockSize);
    }

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
    }

function updateVerVel() {
    if (keysDown[38] === true ||//up
        keysDown[32] === true ||//space
        keysDown[90] === true) {//z
            if (mc.onGround === true) {
                mc.vely += mc.jumpHeight;
                mc.onGround = false;
            }
    }
    if (mc.onGround === false && mc.vely > mc.fallSpeed * -1) {//TODO: make stage system so that collision actually works.
        mc.vely -= mc.gravity;
    }
}

    if (!getCookie('level')) {
        setCookie('level', 1, 9999);
        console.log(getCookie('level'));
    } else {
        console.log(getCookie('level'));
    }

    function mainGameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (mode) {
            case 'menu':
                updateHorVel();
                updateVerVel();
                mc.x += mc.velx;
                mc.y += mc.vely / 3;
                drawStuff();
                break;
            default:
                break;
        }
        window.requestAnimationFrame(mainGameLoop);
    }
    window.requestAnimationFrame(mainGameLoop);
});
