var canvas = document.getElementById('canvas');

canvas.width = 800;
canvas.height = 250;

var ctx = document.getElementById('canvas').getContext('2d', {});
var source = document.getElementById('source');
var playerSource = document.getElementById('playerSource');

var sourcePosX = 0;
var sourcePosY = 500;

var groundLevel = 120;
var distanceX = 10;
var viewportDX = 10;

var camera = {
    pos: {
        x: 0,
        y: 0
    },
    speed: 5,
    speedDefault: 5,
    friction: 1,
    frictionDefault: 1
}

// Physics parameters
var physics = {
    speed: 5,
    speedDefault: 5,
    friction: 1,
    frictionDefault: 1,
    gravity: 1,
    jumpVelocity: 10,
    jumpVelocityDefault: 10,
}

// Player sprite
var playerSprite = {
    type: {
        stand: {
            right: {
                x: 210,
                y: 0
            },
            left: {
                x: 180,
                y: 0
            }
        },
        walkToRight: {
            x: 240,
            y: 0
        },
        walkToLeft: {
            x: 150,
            y: 0
        },
        jump: {
            right: {
                x: 360,
                y: 0
            },
            left: {
                x: 30,
                y: 0
            }
        }
    }
}


// Player
var player = {
    width: 30,
    height: 30,
    x: canvas.width / 4,
    y: groundLevel,
}

// States
var states = {
    moveType: 0,
    restType: 0,
    jumpType: 0,
    isJumping: false,
    isMoving: {
        left: false,
        right: false,
    },
    cameraMoving: {
        left: false,
        right: false,
        locked: false,
    }
}

//  Init
function initDraw() {
    // ctx.drawImage(source, sourcePosX, 460, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    // ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw player
    // ctx.drawImage(playerSource, player.x, player.y, player.width, player.width)
}

function refreshFrame() {
    window.requestAnimationFrame(refreshFrame); // better than setInterval method 
    ctx.drawImage(
        source,
        sourcePosX,
        460,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
    );
    // ctx.fillRect(player.x, player.y, player.width, player.height);


    drawPlayer();

    // Player
    playerJump();
    playerMove();
    setPlayerWalkState();
    // Camera

    // Helper
    // helper();
}

function drawPlayer() {
    switch (states.moveType) {
        // Stand
        case 0:
            ctx.drawImage(
                playerSource,
                playerSprite.type.stand.right.x,
                playerSprite.type.stand.right.y,
                player.width,
                player.height,
                player.x,
                player.y,
                player.width,
                player.height
            )
            break;

        case 1:
            ctx.drawImage(
                playerSource,
                playerSprite.type.stand.left.x,
                playerSprite.type.stand.left.y,
                player.width,
                player.height,
                player.x,
                player.y,
                player.width,
                player.height
            )
            break;

        // Walk to right
        case 2:
            ctx.drawImage(
                playerSource,
                playerSprite.type.walkToRight.x,
                playerSprite.type.walkToRight.y,
                player.width,
                player.height,
                player.x,
                player.y,
                player.width,
                player.height
            )
            break;

        // Walk to left
        case 3:
            ctx.drawImage(
                playerSource,
                playerSprite.type.walkToLeft.x,
                playerSprite.type.walkToLeft.y,
                player.width,
                player.height,
                player.x,
                player.y,
                player.width,
                player.height
            )
            break;

        // Jump to right
        case 4:
            ctx.drawImage(
                playerSource,
                playerSprite.type.jump.right.x,
                playerSprite.type.jump.right.y,
                player.width,
                player.height,
                player.x,
                player.y,
                player.width,
                player.height
            )
            break;

        // Jump to left
        case 5:
            ctx.drawImage(
                playerSource,
                playerSprite.type.jump.left.x,
                playerSprite.type.jump.left.y,
                player.width,
                player.height,
                player.x,
                player.y,
                player.width,
                player.height
            )
            break;
    }

}

// Player Move
function playerMove() {
    // Move to right
    if (states.isMoving.right) {
        if (player.x < canvas.width / 2) {
            easePlayerMovement();
            // let isDone = easePlayerMovement();
            // if (isDone)
            //     states.isMoving.right = false;
        } else {
            states.cameraMoving.right = true;
            cameraMove();

            // Check if camera locked
            if (states.cameraMoving.locked) {
                // calc the remaining space to the right end 
                if ((canvas.width - player.x - player.width) < distanceX) {
                    player.x += canvas.width - player.x - player.width;
                    // states.isMoving.right = false;
                } else {
                    easePlayerMovement();
                    // let isDone = easePlayerMovement();
                    // if (isDone)
                    //     states.isMoving.right = false;
                }
            }
        }
    }

    // Move to left
    if (states.isMoving.left) {
        if (sourcePosX <= 0) { // to the left end
            if (player.x > player.width) {
                let isDone = easePlayerMovement();
                if (isDone)
                    states.isMoving.left = false;
            } else {
                player.x = 0;
                states.isMoving.left = false;
            }
        } else {
            if (player.x > canvas.width / 2 - 50) {
                let isDone = easePlayerMovement();
                if (isDone)
                    states.isMoving.left = false;
            } else {
                states.cameraMoving.left = true;
                cameraMove();
            }
        }
    }
}

function playerJump() {
    // player at ground
    if (states.isJumping) {
        physics.jumpVelocity -= physics.gravity;

        // Player touches the ground
        if ((player.y - physics.jumpVelocity) >= groundLevel) {
            player.y = groundLevel;
            physics.jumpVelocity = physics.jumpVelocityDefault; // Reset
        } else {
            player.y -= physics.jumpVelocity;
        }
    }

    if (states.isJumping && playerOnTheGround()) {
        states.isJumping = false;
    }

    function playerOnTheGround() {
        return player.y === groundLevel;
    }
}

// Camera Move
// Move canvas source the oposite way, to create camera movement effecs  
function cameraMove() {
    if (states.cameraMoving.right) {
        // If not hit the right end  
        if (viewportToRight() > viewportDX) {
            let isDone = easeCameraMovement();
            // if (isDone) {
            //     states.isMoving.right = false;
            //     states.cameraMoving.right = false;
            //     states.isMoving.left = false;
            //     states.cameraMoving.left = false;
            // }
        } else { // Camera to the right edge
            if (viewportToRight() !== 0)
                sourcePosX += viewportToRight(); // Move viewport to the right edge
        }
    }

    if (states.cameraMoving.left) {
        let isDone = easeCameraMovement();
        if (isDone) {
            states.isMoving.right = false;
            states.cameraMoving.right = false;
            states.isMoving.left = false;
            states.cameraMoving.left = false;
        }
    }
    setCameraLockState();
}

// Set states functions
function setCameraLockState() {
    // Camera to the right edge
    if (viewportToRight() <= 0 || sourcePosX === 0) {
        states.cameraMoving.locked = true;
    } else {
        states.cameraMoving.locked = false;
    }
}

function setPlayerWalkState() {
    if (states.isMoving.right) {
        states.moveType = 2;
        states.restType = 0;
        states.jumpType = 0;
    } else if (states.isMoving.left) {
        states.moveType = 3;
        states.restType = 1;
        states.jumpType = 1;
    } else if (states.isJumping) {
        if (states.jumpType === 0)
            states.moveType = 4;
        else
            states.moveType = 5;
    } else {
        if (states.restType === 0)
            states.moveType = 0;
        else
            states.moveType = 1;
    }
}

// Utilities
function viewportToRight() {
    return (source.width - sourcePosX - canvas.width);
}

function easePlayerMovement() {
    if (physics.friction >= 0.1)
        physics.friction *= 0.5;
    else
        physics.friction = 0

    physics.speed -= physics.friction;
    // console.log('speed: ' + physics.speed);
    // console.log('friction: ' + physics.friction);

    if (physics.speed > 0) {
        if (states.isMoving.right) {
            player.x += physics.speed;
        }
        if (states.isMoving.left) {
            player.x -= physics.speed;
        }

    } else {
        physics.speed = physics.speedDefault; // reset
        physics.friction = physics.frictionDefault;
        return true;
    }
}

function easeCameraMovement() {
    if (camera.friction >= 0.1)
        camera.friction *= 0.5;
    else
        camera.friction = 0

    camera.speed -= camera.friction;
    if (camera.speed > 0) {
        if (states.cameraMoving.right)
            sourcePosX += camera.speed;
        if (states.cameraMoving.left)
            sourcePosX -= camera.speed;
    } else {
        camera.speed = camera.speedDefault; // reset
        camera.friction = camera.frictionDefault; // reset
        return true;
    }
}

function keydownHandler(e) {
    // Right Arrow
    if (e.keyCode === 39) {
        states.isMoving.right = true;
        // console.log('right key');
    }

    // Left Arrow
    if (e.keyCode === 37) {
        states.isMoving.left = true;
    }

    // Jump
    if (e.keyCode === 32) {
        states.isJumping = true;
    }
}

function keyupHandler(e) {
    clearAllStates();
}

function clearAllStates() {
    states.isMoving.right = false;
    states.isMoving.left = false;
    // states.isJumping = false;
    states.cameraMoving.right = false;
    states.cameraMoving.left = false;
}

// Helper
function helper() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(canvas.width / 2, 0, 5, canvas.height);
}

// Event listeners 
document.addEventListener('keydown', function (e) {
    keydownHandler(e);
});

document.addEventListener('keyup', function (e) {
    keyupHandler(e);
});

initDraw();
window.requestAnimationFrame(refreshFrame); // better than setInterval method 
