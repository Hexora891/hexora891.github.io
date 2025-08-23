// Toggle start menu
function toggleStartMenu() {
    const menu = document.getElementById("startMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Open a window
function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "block";
    win.style.zIndex = 10;
}

// Close a window
function closeWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "none";
}

// Minimize/Maximize
function minimizeWindow(id) {
    const win = document.getElementById(id);
    win.querySelector('.window-content').style.display = 'none';
    win.style.height = '30px';
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    const content = win.querySelector('.window-content');
    if (win.style.height === '30px') {
        content.style.display = 'block';
        win.style.height = '300px';
    } else {
        content.style.display = 'none';
        win.style.height = '30px';
    }
}

// Fake resume download
function downloadResume() {
    alert("Downloading résumé... (add real file later!)");
}

// Draggable windows
let dragged;
document.querySelectorAll('.window-header').forEach(header => {
    header.onmousedown = function(e) {
        dragged = this.parentElement;
        let offsetX = e.clientX - dragged.offsetLeft;
        let offsetY = e.clientY - dragged.offsetTop;
        function moveHandler(e) {
            dragged.style.left = (e.clientX - offsetX) + 'px';
            dragged.style.top = (e.clientY - offsetY) + 'px';
        }
        document.addEventListener('mousemove', moveHandler);
        document.onmouseup = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.onmouseup = null;
        }
    }
});
