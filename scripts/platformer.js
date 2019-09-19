var $, window, document, Image; //only so that my code checker doesn't get angry at me
/*pitfalls:
linter doesn't recognize the use of nonexistent properties of objects
*/
//TODO make scrolling levels 
$(function () {
    var canvas = $('#mainCanvas')[0];
    var ctx = canvas.getContext('2d');
    var blockSize;
    var keysDown = [];
    var debugOverlay = true;
    var temporaryValues = {
        debugOverlay: false
    };
    var collisions = [];

    function resizeCanvas() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        blockSize = canvas.width / 30;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.translate(0, -blockSize);
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
    //compares to see if num1 and 2 are within range of each other. returns true or false
    function isWithin(num, range1, range2) {
        if (num > range1 && num < range2 || num < range1 && num > range2) {
            return true;
        }
        else {
            return false;
        }
    }

    function insideBlock(objectOne, objectTwo) {
        var xin = false;
        var yin = false;
        if (isWithin(objectOne.x[0], objectTwo.x[0], objectTwo.x[1]) || isWithin(objectOne.x[1], objectTwo.x[0], objectTwo.x[1]) || isWithin(objectTwo.x[0], objectOne.x[0], objectOne.x[1]) || isWithin(objectTwo.x[1], objectOne.x[0], objectOne.x[1])) {
            xin = true;
        }
        if (isWithin(objectOne.y[0], objectTwo.y[0], objectTwo.y[1]) || isWithin(objectOne.y[1], objectTwo.y[0], objectTwo.y[1]) || isWithin(objectTwo.y[0], objectOne.y[0], objectOne.y[1]) || isWithin(objectTwo.y[1], objectOne.y[0], objectOne.y[1])) {
            yin = true;
        }
        return {
            'x': xin
            , 'y': yin
        };
    }

    function delay(code, timeMs) {
        window.setInterval(code(), timeMs);
    }
    var blocks = {
        basic: loadImage('img/sprites/blocks/basic.png')
    };
    var sprites = {
        idle: [loadImage('img/sprites/zeeTee/idleL.png'), loadImage('img/sprites/zeeTee/idleR.png')]
        , jumpsquat: [loadImage('img/sprites/zeeTee/jumpsquatL.png'), loadImage('img/sprites/zeeTee/jumpsquatR.png')]
        , currentSprite: loadImage('img/sprites/zeeTee/idleR.png')
    }
    var mc = { //all the info on the mc
        facing: 1, // 0 is left, 1 is right
        x: 17
        , y: 10
        , velx: 0
        , vely: 1
        , onGround: false
        , accelx: 0.05
        , airAccelx: 0.04
        , friction: 0.05
        , airFriction: 0.02
        , walkSpeed: 0.15
        , runSpeed: 0.3
        , gravity: 0.1
        , fallSpeed: 4
        , fullHop: 1.6, //enough to jump around 5 blocks
        shortHop: 0.8
        , jumpsquatDuration: 3, //in frames
        jumpSpeed: 3
        , displayWidth: 1
        , width: 0.8
        , height: 1
        , state: 'idle'
    };
    var controls = {
        left: 65
        , right: 68
        , down: 83
        , up: 87
        , sprint: 16
        , jump: 32
    };
    window.onresize = resizeCanvas;
    resizeCanvas();

    function loadImage(src) { // a simple way to load images
        var temp = new Image();
        temp.src = src;
        return temp;
    }

    function absoluteValue(number) {
        return Math.sqrt(number * number);
    }
    //keyhandler
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
        ctx.drawImage(mc.currentSprite, (mc.x * blockSize) - ((blockSize * mc.width) / 2), canvas.height - mc.y * blockSize, blockSize * mc.displayWidth, blockSize * mc.height);
    }

    function absoluteValue(number) {
        return Math.sqrt(Math.pow(number, 2));
    }

    function leftRightControls() {
        var currentAccel = mc.airAccelx;
        var currentMaxSpeed = mc.walkSpeed;
        var currentFriction = mc.airFriction;
        if (mc.onGround === true) {
            currentFriction = mc.friction;
            currentAccel = mc.accelx;
        }
        if (controls.sprint in keysDown === true) {
            currentMaxSpeed = mc.runSpeed;
        }
        if (controls.right in keysDown !== controls.left in keysDown) {
            if (absoluteValue(mc.velx) < mc.walkSpeed || absoluteValue(mc.velx) < mc.runSpeed && controls.sprint in keysDown === true) { //if is below max speed
                if (mc.velx + currentAccel <= mc.walkSpeed || mc.velx + currentAccel <= mc.runSpeed && 16 in keysDown === true) { //if will be below max speed
                    if (controls.right in keysDown) {
                        mc.velx += currentAccel;
                    }
                    else {
                        mc.velx -= currentAccel;
                    }
                }
                else {
                    if (controls.right in keysDown) {
                        mc.velx = currentMaxSpeed;
                    }
                    else {
                        mc.velx = currentMaxSpeed * -1;
                    }
                }
            }
            else if (mc.velx > mc.walkSpeed && controls.sprint in keysDown === false && mc.onGround === true) {
                mc.velx -= mc.friction;
            }
        }
        if (controls.right in keysDown === controls.left in keysDown && mc.velx !== 0) { //if theyre both up or down
            if (mc.velx - currentFriction >= 0) {
                mc.velx -= currentFriction;
            }
            else {
                mc.velx = 0;
            }
        }
    }

    function updateVerVel() {
        if (controls.jump in keysDown === true) {
            if (mc.onGround === true) { //jump part
                mc.state = 'jumpsquat';
                window.setTimeout(function () {
                    mc.state = 'air';
                    switch (38 in keysDown === true || //up
                        32 in keysDown === true || //space
                        90 in keysDown === true) { //z
                    case false:
                        mc.vely = mc.shortHop;
                        break;
                    default:
                        mc.vely = mc.fullHop;
                        break;
                    }
                    mc.onGround = false;
                }, 1000 / 60 * mc.jumpsquatDuration); // four frame jumpsquat
            }
        }
        if (mc.vely > mc.fallSpeed * -1) {
            mc.vely -= mc.gravity;
        }
    }

    function updateFacing() {
        if (controls.left in keysDown === true && controls.right in keysDown === false) { //left arrow
            mc.facing = 0;
        }
        if (controls.right in keysDown === true && controls.left in keysDown === false) { //right arrow
            mc.facing = 1;
        }
    }

    function updateSprite() {
        switch (mc.state) {
        case 'jumpsquat':
            mc.currentSprite = sprites.jumpsquat[mc.facing];
            break; //TODO add air
        default:
            mc.currentSprite = sprites.idle[mc.facing];
            break;
        }
    }

    function updatePos() {
        var newLocation = {
            'x': mc.x + mc.velx
            , 'y': mc.y + mc.vely * (mc.jumpSpeed / 10)
        };
        var truncatedLocation = truncatedCoordinates(newLocation);
        var charBounds = {
            'x': [newLocation.x - mc.width / 2, newLocation.x + mc.width / 2]
            , 'y': [newLocation.y, newLocation.y + mc.height]
        };
        var oldCharBounds = {
            'x': [mc.x - mc.width / 2, mc.x + mc.width / 2]
            , 'y': [mc.y, mc.y + mc.height]
        };
        ctx.fillRect(truncatedLocation.x * blockSize, canvas.height - truncatedLocation.y * blockSize, blockSize, blockSize);
        for (let i = 0; i < 2; i++) {
            for (let i2 = 0; i2 < 3; i2++) {
                var testingBlock = getBlock(truncatedLocation.x - 1 + i2, truncatedLocation.y + i);
                var wasInsideBlock = insideBlock(oldCharBounds, testingBlock.bounds);
                var willBeInsideBlock = insideBlock(charBounds, testingBlock.bounds);
                if (willBeInsideBlock.x === true && willBeInsideBlock.y === true) {
                    if (testingBlock.collision !== false) {
                        if (wasInsideBlock.x === true && wasInsideBlock.y == false) {
                            if (mc.vely > 0) {
                                newLocation.y = testingBlock.bounds.y[0] - mc.height;
                            }
                            else if (mc.vely < 0) {
                                newLocation.y = testingBlock.bounds.y[1];
                                mc.onGround = true;
                            }
                            mc.vely = 0;
                        }
                        else if (wasInsideBlock.y === true && wasInsideBlock.x === false) {
                            console.log('Inside x');
                            if (mc.velx > 0) {
                                newLocation.x = testingBlock.bounds.x[0] - mc.width / 2;
                            }
                            else if (mc.velx < 0) {
                                newLocation.x = testingBlock.bounds.x[1] + mc.width / 2;
                            }
                            mc.velx = 0;
                        }
                        else {
                            console.log('catch all');
                        }
                    }
                }
            }
        }
        mc.y = newLocation.y;
        mc.x = newLocation.x;
    }

    function getBlock(x, y) {
        x = Math.trunc(x);
        y = Math.trunc(y);
        var blockName = '   ';
        var block = {
            'name': '   '
            , 'collision': false
        }
        block.bounds = {
            'x': [x, x + 1]
            , 'y': [y, y + 1]
        };
        if (stage[x] && stage[x][y]) {
            blockName = stage[x][y];
            block.name = stage[x][y];
        }
        if (blockData[blockName]) {
            block = blockData[blockName];
            block.name = blockName;
            block.bounds = {
                'x': [x, x + 1]
                , 'y': [y, y + 1]
            };
        }
        return block;
    }

    function truncatedCoordinates(object) {
        return {
            x: Math.trunc(object.x)
            , y: Math.trunc(object.y)
        };
    }

    function debugInfo() {
        if (192 in keysDown === true && temporaryValues.debugOverlay === false) {
            if (debugOverlay === false) {
                debugOverlay = true;
            }
            else if (debugOverlay === true) {
                debugOverlay = false;
            }
            temporaryValues.debugOverlay = true;
        }
        if (192 in keysDown === false && temporaryValues.debugOverlay === true) {
            temporaryValues.debugOverlay = false;
        }
        if (debugOverlay === true) {
            ctx.fillStyle = '#263238';
            ctx.fillText('x: ' + Math.round(100 * mc.x) / 100, 0, 80);
            ctx.fillText('y: ' + Math.round(100 * mc.y) / 100, 0, 100);
            ctx.fillText('vx: ' + Math.round(100 * mc.velx) / 100, 0, 120);
            ctx.fillText('vy: ' + Math.round(100 * mc.vely) / 100, 0, 140);
            ctx.fillText('onground: ' + mc.onGround, 0, 160);
            ctx.fillText('facing: ' + mc.facing, 0, 180);
            ctx.fillText('state: ' + mc.state, 0, 200);
            //debug grid
            for (let i = 0; i < 30; i++) {
                for (let j = 0; j < Math.round(canvas.height / blockSize) + 1; j++) {
                    ctx.strokeStyle = "#000";
                    ctx.beginPath();
                    ctx.rect(i * blockSize, canvas.height - j * blockSize, blockSize, blockSize);
                    ctx.stroke();
                }
            }
        }
    }
    //sets the current level
    if (!getCookie('level')) {
        setCookie('level', 1, 9999);
    }
    else {
        //        console.log(getCookie('level'));
    }

    function drawStage() {
        $.each(stage, function (index1, val1) { //for each block in stage
            var column = val1;
            $.each(column, function (index2, val2) { //TODO make a dynamic system for blocks that can be easily
                switch (val2) {
                case 'blk': //black block
                    ctx.fillStyle = "#000";
                    ctx.fillRect(index1 * blockSize, canvas.height - ((index2) * blockSize), blockSize, blockSize);
                    break;
                case 'bsc': //basic block
                    ctx.drawImage(blocks.basic, index1 * blockSize, canvas.height - index2 * blockSize, blockSize, blockSize);
                    break;
                default:
                    break;
                }
            });
        });
    }
    var blockData;
    //Load current level
    var stage = $.getJSON('levels/level' + getCookie('level') + '.json', (function () {
        blockData = stage.responseJSON.blocks;
        stage = stage.responseJSON.stage;
        window.requestAnimationFrame(mainGameLoop);
    }));

    function mainGameLoop() {
        switch (mode) {
        case 'menu':
            ctx.clearRect(0, 0, canvas.width, canvas.height + blockSize);
            leftRightControls();
            updateVerVel();
            updatePos();
            updateFacing();
            drawStage();
            updateSprite();
            drawChar();
            debugInfo();
            break;
        default:
            break;
        }
        window.requestAnimationFrame(mainGameLoop);
    }
});