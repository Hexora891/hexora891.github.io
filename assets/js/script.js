let zIndexCounter = 1;

// Toggle start menu
function toggleStartMenu() {
    const menu = document.getElementById("startMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Open a window
function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "block";
    bringToFront(win);
    addTaskbarButton(id);
}

// Close window
function closeWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "none";
    removeTaskbarButton(id);
}

// Bring window to front
function bringToFront(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
}

// Minimize window
function minimizeWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "none";
}

// Maximize window
function maximizeWindow(id) {
    const win = document.getElementById(id);
    const content = win.querySelector('.window-content');
    if (win.style.width !== "90%" || win.style.height !== "80%") {
        win.style.width = "90%";
        win.style.height = "80%";
        win.style.top = "10%";
        win.style.left = "5%";
    } else {
        win.style.width = "500px";
        win.style.height = "300px";
        win.style.top = "100px";
        win.style.left = "100px";
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
        bringToFront(dragged);
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

// Taskbar buttons
function addTaskbarButton(id) {
    const taskbar = document.getElementById("taskbar");
    if (document.getElementById("task-" + id)) return;
    const btn = document.createElement("button");
    btn.id = "task-" + id;
    btn.innerText = id.replace("Window",""); 
    btn.onclick = () => {
        const win = document.getElementById(id);
        win.style.display = "block";
        bringToFront(win);
    };
    taskbar.appendChild(btn);
}

function removeTaskbarButton(id) {
    const btn = document.getElementById("task-" + id);
    if(btn) btn.remove();
}
