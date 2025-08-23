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

// Fake resume download
function downloadResume() {
    alert("Downloading résumé... (add real file later!)");
}
