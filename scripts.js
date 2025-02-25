document.addEventListener('DOMContentLoaded', function () {
    enableArrowKeyLookControls();
});

function enableArrowKeyLookControls() {
    const cameraRig = document.querySelector('#cameraRig');
    if (!cameraRig) {
        console.error('Camera rig not found!');
        return;
    }

    let yaw = 0; 
    let pitch = 0; 

    document.addEventListener('keydown', (event) => {
        const speed = 2; 

        if (event.key === 'ArrowUp') {
            pitch -= speed;
        } else if (event.key === 'ArrowDown') {
            pitch += speed;
        } else if (event.key === 'ArrowLeft') {
            yaw -= speed; 
        } else if (event.key === 'ArrowRight') {
            yaw += speed; 
        }
        cameraRig.setAttribute('rotation', { x: pitch, y: yaw, z: 0 });
    });
}