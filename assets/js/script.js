let zIndexCounter = 10;

// Start menu toggle
function toggleStartMenu() {
    const menu = document.getElementById("startMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    if (!menu.contains(e.target) && e.target !== button) {
        menu.style.display = 'none';
    }
});

// Open window
function openWindow(event, id) {
    // Remove 'desktop-icon-large' from all icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.classList.remove('desktop-icon-large');
    });

    // Add 'desktop-icon-large' to the clicked icon
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('desktop-icon-large');
    }

    const win = document.getElementById(id);
    win.style.display = "block";
    bringToFront(win);
    removeTaskbarButton(id);
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
    addTaskbarButton(id);
}

// Maximize / Restore window
function maximizeWindow(id) {
    const win = document.getElementById(id);

    if (win.dataset.maximized === "true") {
        // Restore previous position & size
        win.style.width = win.dataset.prevWidth;
        win.style.height = win.dataset.prevHeight;
        win.style.top = win.dataset.prevTop;
        win.style.left = win.dataset.prevLeft;
        win.dataset.maximized = "false";
    } else {
        // Save current position & size
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;

        // Maximize (fill screen except taskbar)
        win.style.top = "0";
        win.style.left = "0";
        win.style.width = "100%";
        win.style.height = "calc(100% - 30px)";
        win.dataset.maximized = "true";
    }
}

// Dummy resume download
function downloadResume() {
    alert("Downloading resume...");
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
            dragged.style.left = Math.min(window.innerWidth - dragged.offsetWidth, Math.max(0, e.clientX - offsetX)) + 'px';
            dragged.style.top = Math.min(window.innerHeight - dragged.offsetHeight - 30, Math.max(0, e.clientY - offsetY)) + 'px';
        }
        document.addEventListener('mousemove', moveHandler);
        document.onmouseup = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.onmouseup = null;
        };
    };
});

// Taskbar buttons
function addTaskbarButton(id) {
    const taskbarWindows = document.getElementById("taskbar-windows");
    if (document.getElementById("task-" + id)) return;
    const btn = document.createElement("button");
    btn.id = "task-" + id;
    const headerTitle = document.querySelector(`#${id} .window-header span`);
    btn.innerText = headerTitle ? headerTitle.innerText : id.replace("Window","");
    btn.onclick = () => {
        const win = document.getElementById(id);
        if (win.style.display === "none") {
            win.style.display = "block";
            bringToFront(win);
            // Remove the taskbar button on restore
            removeTaskbarButton(id);
        } else {
            minimizeWindow(id);
        }
    };
    taskbarWindows.appendChild(btn);
}

function removeTaskbarButton(id) {
    const btn = document.getElementById("task-" + id);
    if(btn) btn.remove();
    
    // Remove desktop-icon-large class when window is closed
    const desktopIcon = document.querySelector(`.desktop-icon[onclick*='${id}']`);
    if (desktopIcon) {
        desktopIcon.classList.remove('desktop-icon-large');
    }
}

// Resume function
function downloadResume() {
  const link = document.createElement('a');
  link.href = "assets/files/Ayush-Resume.pdf";
  link.download = "Ayush-Resume.pdf";
  link.click();
}

function openResumeNewTab() {
  window.open("assets/files/Ayush-Resume.pdf", "_blank");
}
