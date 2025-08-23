let topZ = 1;

// Toggle start menu
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Open window
function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'block';
    win.style.zIndex = ++topZ;
}

// Close window
function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
}

// Download résumé
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'assets/docs/resume.pdf';
    link.download = 'resume.pdf';
    link.click();
}

// Draggable windows
document.querySelectorAll('.window-header').forEach(header => {
    header.onmousedown = function(e) {
        const dragged = this.parentElement;
        dragged.style.zIndex = ++topZ;
        const offsetX = e.clientX - dragged.offsetLeft;
        const offsetY = e.clientY - dragged.offsetTop;

        function moveHandler(e) {
            dragged.style.left = (e.clientX - offsetX) + 'px';
            dragged.style.top = (e.clientY - offsetY) + 'px';
        }

        document.addEventListener('mousemove', moveHandler);
        document.onmouseup = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.onmouseup = null;
        };
    };
});
