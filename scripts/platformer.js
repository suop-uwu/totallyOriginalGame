var $, window; //only so that my code checker doesn't get angry at me
$(function () {
    var canvas = $('#mainCanvas')[0];
    var ctx = canvas.getContext('2d');
    var blockSize;

    function resizeCanvas() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        blockSize = canvas.width / 20;
    }
    window.onresize = resizeCanvas;
    resizeCanvas();

    function loadImage(src) {
        var temp = new Image();
        temp.src = src;
        return temp;
    }

    var mode = 'menu';

    function makeDot(x, y) {
        ctx.fillRect(x, y, blockSize, 2);
    }

    var dot = {
        x: 0,
        y: 0
    };
    var char = {
        idleR: loadImage('img/sprites/zeeTee/idleR.png')
    };

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    function mainGameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (mode) {
            case 'menu':
                dot.x += 1;
                dot.y += 1;
                ctx.drawImage(char.idleR, dot.x, dot.y, blockSize, blockSize);
                break;
            default:
                break;
        }
        window.requestAnimationFrame(mainGameLoop);
    }
    window.requestAnimationFrame(mainGameLoop);
});
