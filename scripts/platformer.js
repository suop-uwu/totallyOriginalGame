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
    var debugOverlay = false;
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
    function isWithin(num1, num2, range) {
        if (Math.sqrt(Math.pow(num1 - num2, 2)) < range) {
            return true;
        } else {
            return false;
        }
    }
    var blocks = {
        basic: loadImage('img/sprites/blocks/basic.png')
    };
    var mc = { //all the info on the mc
        idle: [loadImage('img/sprites/zeeTee/idleL.png'), loadImage('img/sprites/zeeTee/idleR.png')],
        jumpsquat: [loadImage('img/sprites/zeeTee/jumpsquatL.png'), loadImage('img/sprites/zeeTee/jumpsquatR.png')],
        currentSprite: loadImage('img/sprites/zeeTee/idleR.png'),
        facing: 1, // 0 is left, 1 is right
        x: 15,
        y: 10,
        velx: 0,
        vely: 1,
        onGround: false,
        accelx: 0.05,
        airAccelx: 0.02,
        friction: 0.1,
        airFriction: 0.01,
        walkSpeed: 0.15,
        runSpeed: 0.21,
        gravity: 0.1,
        fallSpeed: 1.75,
        fullHop: 1.6, //enough to jump around 5 blocks
        shortHop: 0.8,
        jumpsquatDuration: 4, //in frames
        jumpSpeed: 3, //higher means slower jump
        collisionWidth: 0.9,
        width: 1,
        height: 1
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
        ctx.drawImage(mc.currentSprite, mc.x * blockSize, canvas.height - mc.y * blockSize, blockSize * mc.width, blockSize * mc.height);
    }

    function absoluteValue(number) {
        return Math.sqrt(Math.pow(number, 2));
    }

    // .o88b. db   db  .d8b.  d8888b.  .d8b.   .o88b. d888888b d88888b d8888b.      d8888b. db   db db    db .d8888. d888888b  .o88b. .d8888. 
    //d8P  Y8 88   88 d8' `8b 88  `8D d8' `8b d8P  Y8 `~~88~~' 88'     88  `8D      88  `8D 88   88 `8b  d8' 88'  YP   `88'   d8P  Y8 88'  YP 
    //8P      88ooo88 88ooo88 88oobY' 88ooo88 8P         88    88ooooo 88oobY'      88oodD' 88ooo88  `8bd8'  `8bo.      88    8P      `8bo.   
    //8b      88~~~88 88~~~88 88`8b   88~~~88 8b         88    88~~~~~ 88`8b        88~~~   88~~~88    88      `Y8b.    88    8b        `Y8b. 
    //Y8b  d8 88   88 88   88 88 `88. 88   88 Y8b  d8    88    88.     88 `88.      88      88   88    88    db   8D   .88.   Y8b  d8 db   8D 
    // `Y88P' YP   YP YP   YP 88   YD YP   YP  `Y88P'    YP    Y88888P 88   YD      88      YP   YP    YP    `8888Y' Y888888P  `Y88P' `8888Y' 
    function updateHorVel() { //TODO refactor sometime
        var keys = 'none';
        var modifier = 1;
        var absoluteVel = absoluteValue(mc.velx);
        var currentMax = mc.walkSpeed;
        var currentAccel = mc.accelx;
        var currentFriction = mc.friction;
        if (37 in keysDown === true && 39 in keysDown === false) {
            keys = 'left';
        }

        if (39 in keysDown === true && 37 in keysDown === false) {
            keys = 'right';
        }

        if (16 in keysDown === true) {
            currentMax = mc.runSpeed;
        }

        if (mc.facing === 0) {
            modifier = -1;
        }

        if (mc.onGround === false) {
            currentAccel = mc.airAccelx;
            currentFriction = mc.airFriction;
        }

        if (keys === 'left' || keys === 'right') {
            if (absoluteVel < currentMax || keys === 'left' && mc.velx > 1 || keys === 'right' && mc.velx < 1) {
                if (absoluteVel + currentAccel > currentMax) {
                    mc.velx = currentMax * modifier;
                } else {
                    mc.velx += currentAccel * modifier;
                }
            }
        } else {
            if (mc.velx + currentFriction * modifier * -1 > 0) { //if velx will be larger than zero
                switch (mc.facing) {
                    case 0:
                        mc.velx = 0;
                        break;
                    case 1:
                        mc.velx += currentFriction * modifier * -1;
                        console.log('test');
                        break;
                }

            } else if (mc.velx + currentFriction * modifier * -1 < 0) { //if velx will be less than zero
                switch (mc.facing) {
                    case 1:
                        mc.velx = 0;
                        break;
                    case 0:
                        mc.velx += currentFriction * modifier * -1;
                        console.log('test');
                        break;
                }

            }

        }


        //        if (keysDown[37] === true && keysDown[39] === undefined) { //left arrow & not right
        //            if (absoluteValue(mc.velx, 2) < mc.runSpeed || mc.velx >= 0) { //if aboslute value is less than max vel or vel is in the opposite direction being pressed
        //                switch (mc.onGround) {
        //                    case true:
        //                        if (absoluteValue(mc.velx) < mc.walkSpeed || absoluteValue(mc.velx) < mc.runSpeed && keysDown[16] === true) {
        //                            mc.velx -= mc.accelx;
        //                            mc.currentSprite = mc.idle[mc.facing]; //todo make actual walking / running sprites
        //                        }
        //                        break;
        //                    default:
        //                        if (absoluteValue(mc.velx) < mc.walkSpeed || absoluteValue(mc.velx) < mc.runSpeed && keysDown[16] === true) {
        //                            mc.velx -= mc.airAccelx;
        //                        }
        //                        break; //TODO fix bug that causes you to keep moving after you release when you hit another key. seems to be affected by velocity.
        //                        //todo also fix bug that allows you to clip through corners of boxes and when your feet are below a platform
        //                }
        //            }
        //
        //        }
        //        if (keysDown[39] === true && keysDown[37] === undefined) { //right arrow & not left
        //            if (absoluteValue(mc.velx, 2) < mc.runSpeed || mc.velx <= 0) { //if aboslute value is less than max vel or vel is in the opposite direction being pressed
        //                switch (mc.onGround) {
        //                    case true:
        //                        if (absoluteValue(mc.velx) < mc.walkSpeed || absoluteValue(mc.velx) < mc.runSpeed && keysDown[16] === true) {
        //                            mc.velx += mc.accelx;
        //                            mc.currentSprite = mc.idle[mc.facing];
        //                        }
        //                        break;
        //                    default:
        //                        if (absoluteValue(mc.velx) < mc.walkSpeed || absoluteValue(mc.velx) < mc.runSpeed && keysDown[16] === true) {
        //                            mc.velx += mc.airAccelx;
        //                        }
        //                        break;
        //                }
        //            }
        //        }
        //
        //
        //
        //
        //
        //
        //        if (keysDown[37] === undefined && keysDown[39] === undefined || keysDown[37] === true && keysDown[39] === true) { //neither left or right or both left and right, basically friction
        //            switch (mc.onGround) {
        //                case true:
        //                    if (mc.velx > 0) { //if user is heading right
        //                        if (mc.velx - mc.friction > 0) { //if velocity after friction isn't in the opposite direction
        //                            mc.velx -= mc.friction;
        //                        } else {
        //                            mc.velx = 0;
        //                        }
        //                    } else if (mc.velx < 0) { //if user is heading left
        //                        if (mc.velx + mc.friction < 0) { //velocity plus friction is not less than zero
        //                            mc.velx += mc.friction;
        //                        } else {
        //                            mc.velx = 0;
        //                        }
        //                    }
        //                    break;
        //                default:
        //                    if (mc.velx > 0) { //if user is heading right
        //                        if (mc.velx - mc.airFriction > 0) { //if velocity after friction isn't in the opposite direction
        //                            mc.velx -= mc.airFriction;
        //                        } else {
        //                            mc.velx = 0;
        //                        }
        //                    } else if (mc.velx < 0) { //if user is heading left
        //                        if (mc.velx + mc.airFriction < 0) { //velocity plus friction is not less than zero
        //                            mc.velx += mc.airFriction;
        //                        } else {
        //                            mc.velx = 0;
        //                        }
        //                    }
        //                    break;
        //            }
        //        }
        //        if (16 in keysDown === false && absoluteValue(mc.velx) > mc.walkSpeed + 0.1) {
        //
        //        }

    }

    function updateVerVel() {
        if (38 in keysDown === true || //up
            32 in keysDown === true || //space
            90 in keysDown === true) { //z
            if (mc.onGround === true) { //jump part
                mc.currentSprite = mc.jumpsquat[mc.facing];
                window.setTimeout(function () {
                    mc.currentSprite = mc.idle[mc.facing]; //TODO replace with actual air sprite
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
        if (mc.onGround === false && //gravity part
            mc.vely > mc.fallSpeed * -1) {
            mc.vely -= mc.gravity;
        }
    }

    function updateFacing() {
        if (37 in keysDown === true && 39 in keysDown === false) { //left arrow
            mc.facing = 0;
        }
        if (39 in keysDown === true && 37 in keysDown === false) { //right arrow
            mc.facing = 1;
        }
    }

    function updatePos() {
        var tempPartOfArray = 1;
        var tempOffset = 0;
        var tempOffset2 = -1;


        //x
        if (mc.velx > 0) { //is going right
            tempPartOfArray = 0;
            tempOffset = 1;
            tempOffset2 = 2;
        } else if (typeof mc.velx !== 'number') { //error message
            console.log('horizontal velocity is invalid somehow. currently returns \'' + mc.velx + '\'');
        }
        if (collisions[Math.trunc(mc.x) + tempOffset] && Array.isArray(collisions[Math.trunc(mc.x + tempOffset)][Math.trunc(mc.y)]) !== true && //if block 2 to right / left is not an array
            collisions[Math.trunc(mc.x) + tempOffset2] && Array.isArray(collisions[Math.trunc(mc.x + tempOffset2)][Math.trunc(mc.y)]) !== true) { //if block to right / left is not an array
            mc.x += mc.velx;
        } else { //if it is
            switch (tempOffset === 0) {
                case true: //left
                    if (collisions[Math.trunc(mc.x) - 1] && collisions[Math.trunc(mc.x) - 1][Math.trunc(mc.y)] && //if it exists
                        mc.x + mc.velx <= collisions[Math.trunc(mc.x) - 1][Math.trunc(mc.y)][1]) { // if pos of next frame is less than rightmost collision of block to left
                        mc.x = Math.trunc(mc.x);
                        mc.velx = 0;
                    } else {
                        mc.x += mc.velx;

                    }
                    break;
                case false: //right
                    if (collisions[Math.trunc(mc.x + 1.5)] && collisions[Math.trunc(mc.x + 1.5)][Math.trunc(mc.y)] && //if it exists
                        mc.x + mc.velx + mc.width >= collisions[Math.trunc(mc.x + 1.5)][Math.trunc(mc.y)][0]) { // if pos of next frame is greater than
                        mc.x = Math.trunc(mc.x + 0.5);
                        mc.velx = 0;
                    } else {
                        mc.x += mc.velx;
                    }
                    break;
            }
        }



        //y
        for (let i = 0; i < 2; i++) {
            $.each(collisions[Math.trunc(mc.x) + i], function (index, val) {

                if (mc.y + mc.vely / mc.jumpSpeed < val[3] && mc.onGround === false && mc.y > val[3] && mc.x + 1 !== val[0]) { //if y on next frame is less than top collision and y is  greater than top value.
                    mc.onGround = true;
                    mc.y = val[3];
                    mc.vely = 0;
                }

                if (mc.y + mc.height + mc.vely / mc.jumpSpeed > val[2] && mc.y + mc.height <= val[2] && mc.x + 1 !== val[0]) { // if top of char on next frame will be greater than bottom collision.
                    if (mc.y + 1 === val[2]) {
                        mc.vely = 0;
                        mc.onGround = true;
                    } else {
                        mc.y = val[2] - mc.height;
                        mc.vely = 0;
                    }
                }

            });
        }
        if (mc.onGround === false) { //changes y by vel / 3. works because if mc hits a block, vel is set to 0
            mc.y += mc.vely / 3;
        }

    }

    function updateGroundState() { //supposed to detect when player walks off platform
        var tempOnGround = false;
        if (Array.isArray(collisions[Math.trunc(mc.x)]) === true) { //if first nested array exists
            if (Array.isArray(collisions[Math.trunc(mc.x)][Math.trunc(mc.y) - 1]) === true) { //if second one exists
                if (collisions[Math.trunc(mc.x)][Math.trunc(mc.y) - 1][3] === mc.y) {
                    tempOnGround = true;
                }
            }
        }
        if (Array.isArray(collisions[Math.trunc(mc.x + 1)]) === true) { //same as above
            if (Array.isArray(collisions[Math.trunc(mc.x + 1)][Math.trunc(mc.y) - 1]) === true) { //saame
                if (collisions[Math.trunc(mc.x + 1)][Math.trunc(mc.y) - 1][3] === mc.y) {
                    tempOnGround = true;
                }
            }
        }
        if ([Math.trunc(mc.x)] in collisions) { //if the value exists. made to prevent errors
            if (collisions[Math.trunc(mc.x)][mc.y - 1] === '  ' && collisions[Math.trunc(mc.x + 1)] !== '  ') { //if the block your truncated x is on is an empty string and in front isn't
                if (isWithin(mc.x, Math.trunc(mc.x), 0.1)) {
                    tempOnGround = false;
                }
            }
        }
        if ([Math.trunc(mc.x + 1)] in collisions) {
            if (collisions[Math.trunc(mc.x + 1)][mc.y - 1] === '  ' && collisions[Math.trunc(mc.x)][mc.y - 1] !== '  ') { //same as above but opposite
                if (isWithin(mc.x, Math.trunc(mc.x + 1), 0.1)) {
                    tempOnGround = false;
                }
            }
        }
        mc.onGround = tempOnGround;
    }

    function debugInfo() {
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
            ctx.fillText('x: ' + Math.round(100 * mc.x) / 100, 0, 80);
            ctx.fillText('y: ' + Math.round(100 * mc.y) / 100, 0, 100);
            ctx.fillText('vx: ' + Math.round(100 * mc.velx) / 100, 0, 120);
            ctx.fillText('vy: ' + Math.round(100 * mc.vely) / 100, 0, 140);
            ctx.fillText('onground: ' + mc.onGround, 0, 160);
            ctx.fillText('facing: ' + mc.facing, 0, 180);
        }
    }

    //sets the current level
    if (!getCookie('level')) {
        setCookie('level', 1, 9999);
    } else {
        //        console.log(getCookie('level'));
    }

    function drawStage() {
        $.each(stage, function (index1, val1) { //for each block in stage
            var column = val1;
            $.each(column, function (index2, val2) { //TODO make a dynamic system for blocks that can be easily
                switch (val2) {
                    case 'blk': //black block
                        ctx.fillStyle = "#000";
                        ctx.fillRect(index1 * blockSize - 1, canvas.height - ((index2) * blockSize) - 1, blockSize + 2, blockSize + 2);
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

    function makeCollisions() {
        $.each(stage, function (index1, val1) { //for each block in stage
            var column = val1;
            collisions.push([]);
            $.each(column, function (index2, val2) {
                switch (val2) {
                    case 'blk': //black block
                        collisions[index1].push([index1, index1 + 1, index2, index2 + 1]);
                        break;
                    case 'bsc':
                        collisions[index1].push([index1, index1 + 1, index2, index2 + 1]);
                        break;
                    default:
                        collisions[index1].push('');
                        break;
                }
            });
        });
        //        console.log(collisions);
    }

    //Load current level
    var stage = $.getJSON('levels/level' + getCookie('level') + '.json', (function () {
        stage = stage.responseJSON;
        //        console.log(stage);
        makeCollisions();
        window.requestAnimationFrame(mainGameLoop);
    }));

    function mainGameLoop() {
        switch (mode) {
            case 'menu':
                ctx.clearRect(0, 0, canvas.width, canvas.height + blockSize);
                updateHorVel();
                updateVerVel();
                updatePos();
                updateFacing();
                if (mc.onGround === true) {
                    updateGroundState();
                }
                drawStage();
                drawChar();
                debugInfo();
                break;
            default:
                break;
        }
        window.requestAnimationFrame(mainGameLoop);
    }
});
