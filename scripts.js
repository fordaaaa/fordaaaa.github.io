document.addEventListener('DOMContentLoaded', function () {
    console.log('Scripts loaded successfully!');

    disableCollisionForAllEntities();
});

function disableCollisionForAllEntities() {
    const entities = document.querySelectorAll('[static-body], [dynamic-body]');

    entities.forEach(entity => {
        if (entity.hasAttribute('static-body')) {
            entity.removeAttribute('static-body');
            console.log('Removed static-body from:', entity);
        }
        if (entity.hasAttribute('dynamic-body')) {
            entity.removeAttribute('dynamic-body');
            console.log('Removed dynamic-body from:', entity);
        }
    });
}