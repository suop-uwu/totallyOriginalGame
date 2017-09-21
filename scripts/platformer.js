var $, window, document, Image; //only so that my code checker doesn't get angry at me
$(function () {
    var canvas = $('#mainCanvas')[0];
    var ctx = canvas.getContext('2d');
    var blockSize;
    var keysDown = [];

    function resizeCanvas() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        blockSize = canvas.width / 30;
    }
    window.onresize = resizeCanvas;
    resizeCanvas();

    function loadImage(src) {
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
    var mc = {
        idleR: loadImage('img/sprites/zeeTee/idleR.png'),
        x: 0,
        y: 0,
        velx: 0,
        vely: 0,
        onground: true,
        accelx: 1,
        friction: 1,
        maxVel: 3
    };

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
                if (keysDown[37] === true)
                    mc.velx -= mc.accelx;
                if (keysDown[39] === true)
                    mc.velx += mc.accelx;
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
