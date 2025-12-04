/* ======================================================
   0) Defensive stubs (no-op globals for inline calls)
====================================================== */
if (typeof window !== 'undefined') {
    window.initializeMusicPlayer = window.initializeMusicPlayer || function() { console.warn('initializeMusicPlayer called before script loaded'); };
    window.togglePlayPause = window.togglePlayPause || function() { console.warn('togglePlayPause called before script loaded'); };
    window.nextTrack = window.nextTrack || function() { console.warn('nextTrack called before script loaded'); };
    window.previousTrack = window.previousTrack || function() { console.warn('previousTrack called before script loaded'); };
    window.selectTrack = window.selectTrack || function() { console.warn('selectTrack called before script loaded'); };
}

/* ======================================================
   1) GLOBALS
====================================================== */
let zIndexCounter = 10;
let nextCascadeLeft = null;
let nextCascadeTop = null;
const CASCADE_STEP_PX = 24;

/* ======================================================
   2) WINDOW POSITIONING (desktop-only cascade)
====================================================== */
function positionWindowWithCascade(win) {
    const taskbarHeight = 30;
    const wasHidden = win.style.display === "none" || getComputedStyle(win).display === "none";
    if (wasHidden) win.style.display = "block";

    const width = win.offsetWidth || 900;
    const height = win.offsetHeight || 700;

    if (nextCascadeLeft === null || nextCascadeTop === null) {
        const centeredLeft = Math.max(0, Math.floor((window.innerWidth - width) / 2) - 60);
        const centeredTop = Math.max(0, Math.floor((window.innerHeight - height - taskbarHeight) / 2));
        nextCascadeLeft = centeredLeft;
        nextCascadeTop = centeredTop;
    } else {
        nextCascadeLeft += CASCADE_STEP_PX;
        nextCascadeTop += CASCADE_STEP_PX;
    }

    if (nextCascadeLeft + width > window.innerWidth - 10) {
        nextCascadeLeft = Math.max(0, Math.floor((window.innerWidth - width) / 2) - 60);
    }
    if (nextCascadeTop + height > window.innerHeight - taskbarHeight) {
        nextCascadeTop = Math.max(0, Math.floor((window.innerHeight - height - taskbarHeight) / 2));
    }

    win.style.left = nextCascadeLeft + 'px';
    win.style.top = nextCascadeTop + 'px';
}

/* ======================================================
   3) START MENU
====================================================== */
function toggleStartMenu() {
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    const isVisible = menu.style.display === "block";
    
    menu.style.display = isVisible ? "none" : "block";
    menu.setAttribute('aria-hidden', isVisible ? 'true' : 'false');
    button.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    if (!menu.contains(e.target) && !button.contains(e.target)) {
        menu.style.display = 'none';
    }
});

/* ======================================================
   4) WINDOW CONTROLS
====================================================== */
function openWindow(event, id) {
    document.querySelectorAll('.desktop-icon')
        .forEach(icon => icon.classList.remove('desktop-icon-large'));

    if (event && event.currentTarget)
        event.currentTarget.classList.add('desktop-icon-large');

    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = "block";
    win.setAttribute('aria-hidden', 'false');

    positionWindowWithCascade(win);
    bringToFront(win);
    removeTaskbarButton(id);

    if (id === 'resumeWindow') setTimeout(loadResumePDF, 200);

    if (id === 'musicWindow') {
        try { initializeMusicPlayer(); } catch (e) {}
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = "none";
        win.setAttribute('aria-hidden', 'true');
    }
    removeTaskbarButton(id);

    if (id === 'musicWindow') stopAllMusic();
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = "none";
    win.setAttribute('aria-hidden', 'true');

    addTaskbarButton(id);
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    if (win.dataset.maximized === "true") {
        win.style.width = win.dataset.prevWidth;
        win.style.height = win.dataset.prevHeight;
        win.style.top = win.dataset.prevTop;
        win.style.left = win.dataset.prevLeft;
        win.dataset.maximized = "false";
    } else {
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;

        win.style.left = "0";
        win.style.top = "0";
        win.style.width = "100%";
        win.style.height = "calc(100% - 30px)";
        win.dataset.maximized = "true";
    }

    if (id === 'resumeWindow') setTimeout(loadResumePDF, 120);
}

function bringToFront(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
}

/* ======================================================
   5) TASKBAR MANAGEMENT
====================================================== */
function addTaskbarButton(id) {
    const bar = document.getElementById("taskbar-windows");
    if (!bar) return;

    if (document.getElementById("task-" + id)) return;

    const btn = document.createElement("button");
    btn.id = "task-" + id;

    const title = document.querySelector(`#${id} .window-header span`);
    btn.innerText = title ? title.innerText : id.replace("Window", "");

    btn.onclick = () => {
        const win = document.getElementById(id);
        if (win.style.display === "none") {
            win.style.display = "block";
            bringToFront(win);
            removeTaskbarButton(id);
        } else {
            minimizeWindow(id);
        }
    };

    bar.appendChild(btn);
}

function removeTaskbarButton(id) {
    const btn = document.getElementById("task-" + id);
    if (btn) btn.remove();

    const icon = document.querySelector(`.desktop-icon[onclick*='${id}']`);
    if (icon) icon.classList.remove('desktop-icon-large');
}

/* ======================================================
   6) DRAGGING (mouse-only)
====================================================== */
document.querySelectorAll('.window-header').forEach(header => {
    let dragged = null;

    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;

        dragged = header.parentElement;
        bringToFront(dragged);

        const offsetX = e.clientX - dragged.offsetLeft;
        const offsetY = e.clientY - dragged.offsetTop;

        function move(e) {
            dragged.style.left = Math.max(0, Math.min(window.innerWidth - dragged.offsetWidth, e.clientX - offsetX)) + 'px';
            dragged.style.top = Math.max(0, Math.min(window.innerHeight - dragged.offsetHeight - 30, e.clientY - offsetY)) + 'px';
        }
        function stop() {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stop);
            dragged = null;
        }

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
    });
});

/* ======================================================
   7) PDF VIEWER (MULTI-PAGE)
====================================================== */
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

let PDF_DOC = null;

function loadResumePDF() {
    const viewer = document.getElementById('pdfViewer');
    if (!viewer) return;

    viewer.innerHTML = '<div style="color:#fff;padding:20px;text-align:center;">Loading PDF...</div>';

    fetch('/assets/files/Ayush-Resume.pdf')
        .then(r => r.arrayBuffer())
        .then(buf => pdfjsLib.getDocument({ data: buf }).promise)
        .then(pdf => {
            PDF_DOC = pdf;
            viewer.innerHTML = "";

            (async function renderAll() {
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1 });

                    const scale = (viewer.clientWidth - 20) / viewport.width;
                    const scaled = page.getViewport({ scale });

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const ratio = window.devicePixelRatio || 1;
                    canvas.width = scaled.width * ratio;
                    canvas.height = scaled.height * ratio;

                    canvas.style.width = scaled.width + "px";
                    canvas.style.height = scaled.height + "px";
                    canvas.style.display = "block";
                    canvas.style.margin = "10px auto";
                    canvas.style.background = "#fff";
                    canvas.style.boxShadow = "0 2px 8px rgba(0,0,0,.3)";

                    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                    viewer.appendChild(canvas);

                    await page.render({ canvasContext: ctx, viewport: scaled }).promise;
                }
            })();
        })
        .catch(err => {
            viewer.innerHTML = `
                <div style="color:#fff;padding:20px;text-align:center;">
                    Could not load PDF.<br>
                    <button onclick="openResumeNewTab()">Open in New Tab</button>
                </div>`;
        });
}

let pdfResizeTimer = null;
window.addEventListener("resize", () => {
    const win = document.getElementById('resumeWindow');
    if (win && win.style.display !== 'none' && PDF_DOC) {
        clearTimeout(pdfResizeTimer);
        pdfResizeTimer = setTimeout(loadResumePDF, 250);
    }
});

/* ======================================================
   8) RESUME DOWNLOAD / OPEN
====================================================== */
function downloadResume() {
    const a = document.createElement('a');
    a.href = '/assets/files/Ayush-Resume.pdf';
    a.download = 'Ayush-Resume.pdf';
    a.click();
}

function openResumeNewTab() {
    window.open('/assets/files/Ayush-Resume.pdf', '_blank');
}

/* ======================================================
   9) 🎵 MUSIC PLAYER (FULLY FIXED — AUTOPLAY + ART WORKING)
====================================================== */
(function initMusicPlayer() {

    /* DOM elements */
    const albumArt = document.getElementById("albumArt");
    const audio = document.getElementById("audioPlayer");

    const playBtn  = document.getElementById("playPauseBtn");
    const prevBtn  = document.getElementById("prevBtn");
    const nextBtn  = document.getElementById("nextBtn");

    const progressBar      = document.getElementById("xpProgressBar");
    const currentTimeLabel = document.getElementById("currentTime");
    const totalTimeLabel   = document.getElementById("totalTime");

    /* Your real artwork paths */
    const ART1 = "/assets/images/song1.gif";
    const ART2 = "/assets/images/song2.png";

    /* Your real tracks — update MP3 names here */
    const tracks = [
        { src: "/assets/music/song1.mp3", art: ART1 },
        { src: "/assets/music/song2.mp3", art: ART2 }
    ];

    let currentTrackIndex = 0;
    let currentArt = 1;

    /* ------------------------------------------
       Initialize default album art
    ------------------------------------------- */
    window.initializeMusicPlayer = function () {
        if (albumArt) albumArt.src = ART1;
    };

    /* ------------------------------------------
       Load a track by index
    ------------------------------------------- */
    window.selectTrack = function (idx) {
        if (!tracks[idx]) return;

        currentTrackIndex = idx;

        audio.src = tracks[idx].src;
        albumArt.src = tracks[idx].art;

        audio.load();
    };

    /* ------------------------------------------
       Play / Pause toggle
    ------------------------------------------- */
    window.togglePlayPause = function () {
        if (!audio.src) selectTrack(0);

        const p = audio.paused ? audio.play() : audio.pause();

        if (p && p.then) {
            p.then(() => {
                playBtn.textContent = audio.paused ? "▶" : "▌▌";
            }).catch(() => {
                playBtn.textContent = "▶";
            });
        }
    };

    /* ------------------------------------------
       Next / Previous Track
    ------------------------------------------- */
    window.nextTrack = function () {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        selectTrack(currentTrackIndex);
        togglePlayPause();
    };

    window.previousTrack = function () {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        selectTrack(currentTrackIndex);
        togglePlayPause();
    };

    /* ------------------------------------------
       Time formatting
    ------------------------------------------- */
    function formatTime(sec) {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    /* ------------------------------------------
       Metadata + Progress updates
    ------------------------------------------- */
    audio.onloadedmetadata = () => {
        totalTimeLabel.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration;
    };

    audio.ontimeupdate = () => {
        currentTimeLabel.textContent = formatTime(audio.currentTime);
        progressBar.value = audio.currentTime;
    };

    audio.onended = () => nextTrack();

    progressBar.oninput = () => {
        audio.currentTime = progressBar.value;
    };

    /* ------------------------------------------
       Album art click = cycle images
    ------------------------------------------- */
    albumArt.onclick = () => {
        currentArt = currentArt === 1 ? 2 : 1;
        albumArt.src = currentArt === 1 ? ART1 : ART2;
    };

    /* ------------------------------------------
       Button bindings
    ------------------------------------------- */
    playBtn.onclick = togglePlayPause;
    prevBtn.onclick = previousTrack;
    nextBtn.onclick = nextTrack;

    /* ------------------------------------------
       Stop music (when closing window)
    ------------------------------------------- */
    window.stopAllMusic = function () {
        audio.pause();
        audio.currentTime = 0;
        playBtn.textContent = "▶";
    };

    /* ------------------------------------------
       AUTOPLAY when window opens
       called automatically from openWindow(...)
    ------------------------------------------- */
    window.initializeMusicPlayer = function () {
        selectTrack(0);
        audio.play().then(() => {
            playBtn.textContent = "▌▌";
        }).catch(err => {
            console.warn("Autoplay blocked, user must interact.", err);
        });
        albumArt.src = ART1;
    };

    /* Initialize immediately */
    initializeMusicPlayer();

})();


/* ======================================================
   10) KEYBOARD SUPPORT
====================================================== */
function addKeyboardSupport() {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                icon.click();
            }
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.window')
                .forEach(win => win.style.display = 'none');

            const menu = document.getElementById("startMenu");
            if (menu) menu.style.display = 'none';
        }
    });
}

window.addEventListener('DOMContentLoaded', addKeyboardSupport);
