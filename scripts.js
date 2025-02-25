let keysCollected = 0;
let timeElapsed = 0;

document.addEventListener('DOMContentLoaded', function () {
    setupKeyCollection();
    setupPortalTeleport();
    startTimer();
});

//key obtination
function setupKeyCollection() {
    const keys = ['key1', 'key2', 'key3'];
    const portal = document.querySelector('#portal');

    keys.forEach((keyId) => {
        const key = document.querySelector(`#${keyId}`);
        if (!key) {
            console.error(`Key ${keyId} not found!`);
            return;
        }

        key.addEventListener('body-collision', (event) => {
            const cameraRig = document.querySelector('#cameraRig');
            if (event.detail.body.id === cameraRig.id) {
                key.parentNode.removeChild(key);

                keysCollected++;
                console.log(`Keys collected: ${keysCollected}`);

                if (keysCollected === 3) {
                    unlockPortal(portal);
                }
            }
        });
    });
}

function unlockPortal(portal) {
    portal.setAttribute('color', 'green'); //change portal colour to green when unlocked 
    console.log('Portal unlocked!');
}

//portal stuff
function setupPortalTeleport() {
    const portal = document.querySelector('#portal');
    const cameraRig = document.querySelector('#cameraRig');
    const timerText = document.querySelector('#timer');
    const gameOverText = document.querySelector('#gameOverText');

    if (!portal || !cameraRig || !timerText || !gameOverText) {
        console.error('Portal, camera rig, timer, or game over text not found!');
        return;
    }

    portal.addEventListener('body-collision', (event) => {
        if (event.detail.body.id === cameraRig.id && keysCollected === 3) {

            cameraRig.setAttribute('position', { x: 0, y: 1.6, z: 0 });

            //timer reset after winning
            timeElapsed = 0;
            timerText.setAttribute('value', `Time: ${timeElapsed}`);

            //you won message
            gameOverText.setAttribute('value', 'Game Over, You Won!');
            gameOverText.setAttribute('visible', true);
            console.log('Player teleported to start!');
        }
    });
}

//timer
function startTimer() {
    const timerText = document.querySelector('#timer');

    setInterval(() => {
        timeElapsed++;
        timerText.setAttribute('value', `Time: ${timeElapsed}`);
    }, 1000);
}