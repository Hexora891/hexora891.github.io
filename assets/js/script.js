// ===== Globals =====
let zIndexCounter = 10;

// Utility: get taskbar height dynamically
function getTaskbarHeight(){
  const tb = document.getElementById('taskbar');
  return tb ? tb.offsetHeight : 36;
}

// ===== Start Menu =====
function toggleStartMenu() {
  const menu = document.getElementById("startMenu");
  const btn = document.getElementById("startButton");
  const open = menu.style.display === "block";
  if (open){
    menu.style.display = "none";
    btn.setAttribute('aria-expanded', 'false');
  } else {
    menu.style.display = "block";
    btn.setAttribute('aria-expanded', 'true');
    // Make sure menu never overflows vertically
    const maxH = Math.round(window.innerHeight - getTaskbarHeight() - 8);
    menu.style.maxHeight = Math.min(maxH, Math.round(window.innerHeight * 0.7)) + "px";
  }
}

// Close start menu when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
  const menu = document.getElementById("startMenu");
  const button = document.getElementById("startButton");
  if (!menu.contains(e.target) && e.target !== button && !button.contains(e.target)) {
    if (menu.style.display === 'block') {
      menu.style.display = 'none';
      button.setAttribute('aria-expanded', 'false');
    }
  }
});
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape'){
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    if (menu.style.display === 'block'){
      menu.style.display = 'none';
      button.setAttribute('aria-expanded', 'false');
    }
  }
});

// ===== Clock =====
function updateClock(){
  const clock = document.getElementById('clock');
  if (!clock) return;
  const d = new Date();
  const h = String(d.getHours()).padStart(2,'0');
  const m = String(d.getMinutes()).padStart(2,'0');
  clock.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 15 * 1000); // 15s keeps it crisp without cost

// ===== Window management =====
function bringToFront(win){
  if (!win) return;
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;

  // Mark active button
  const allBtns = document.querySelectorAll('#taskButtons button');
  allBtns.forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('task-' + win.id);
  if (btn) btn.classList.add('active');
}

function openWindow(id){
  const win = document.getElementById(id);
  if (!win) return;

  // Close start menu when opening a window
  const sm = document.getElementById('startMenu');
  if (sm && sm.style.display === 'block') toggleStartMenu();

  win.style.display = 'block';
  win.dataset.minimized = "false";
  bringToFront(win);
  addTaskbarButton(id);
}

function closeWindow(id){
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  win.dataset.minimized = "false";
  win.dataset.maximized = "false";
  removeTaskbarButton(id);
}

function minimizeWindow(id){
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  win.dataset.minimized = "true";
  const btn = document.getElementById('task-' + id);
  if (btn) btn.classList.remove('active');
}

function maximizeWindow(id){
  const win = document.getElementById(id);
  if (!win) return;

  const tbH = getTaskbarHeight();

  if (win.dataset.maximized === "true"){
    // Restore
    win.style.top = win.dataset.prevTop || "100px";
    win.style.left = win.dataset.prevLeft || "100px";
    win.style.width = win.dataset.prevWidth || "520px";
    win.style.height = win.dataset.prevHeight || "340px";
    win.dataset.maximized = "false";
  } else {
    // Save previous pos/size
    win.dataset.prevTop = win.style.top || "100px";
    win.dataset.prevLeft = win.style.left || "100px";
    win.dataset.prevWidth = win.style.width || "520px";
    win.dataset.prevHeight = win.style.height || "340px";

    // Maximize within viewport, above taskbar
    win.style.top = "0px";
    win.style.left = "0px";
    win.style.width = window.innerWidth + "px";
    win.style.height = (window.innerHeight - tbH) + "px";
    win.dataset.maximized = "true";
  }
  bringToFront(win);
}

// Keep windows inside viewport on drag and on resize
function clampToViewport(win){
  const tbH = getTaskbarHeight();
  const maxLeft = window.innerWidth - win.offsetWidth;
  const maxTop  = window.innerHeight - tbH - win.offsetHeight;

  const left = Math.max(0, Math.min(win.offsetLeft, Math.max(0, maxLeft)));
  const top  = Math.max(0, Math.min(win.offsetTop,  Math.max(0, maxTop)));

  win.style.left = left + "px";
  win.style.top  = top  + "px";
}

window.addEventListener('resize', ()=>{
  document.querySelectorAll('.window').forEach(w=>{
    if (w.style.display !== 'none' && w.dataset.maximized !== "true"){
      clampToViewport(w);
    }
    if (w.dataset.maximized === "true"){
      // Maintain maximized size on resize
      w.style.width = window.innerWidth + "px";
      w.style.height = (window.innerHeight - getTaskbarHeight()) + "px";
    }
  });
});

// Dragging
let dragged = null;
document.querySelectorAll('.window-header').forEach(header=>{
  header.addEventListener('mousedown', (e)=>{
    const win = header.parentElement;
    if (win.dataset.maximized === "true") return; // don't drag when maximized
    dragged = win;
    bringToFront(dragged);
    const offsetX = e.clientX - dragged.offsetLeft;
    const offsetY = e.clientY - dragged.offsetTop;

    function moveHandler(ev){
      const tbH = getTaskbarHeight();
      const nextLeft = Math.min(window.innerWidth - dragged.offsetWidth, Math.max(0, ev.clientX - offsetX));
      const nextTop  = Math.min(window.innerHeight - tbH - dragged.offsetHeight, Math.max(0, ev.clientY - offsetY));
      dragged.style.left = nextLeft + 'px';
      dragged.style.top  = nextTop  + 'px';
    }

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', function up(){
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', up);
      dragged = null;
    }, { once:true });
  });
});

// Also bring to front when clicking inside the window
document.querySelectorAll('.window').forEach(win=>{
  win.addEventListener('mousedown', ()=> bringToFront(win));
});

// ===== Taskbar buttons =====
function addTaskbarButton(id){
  const zone = document.getElementById('taskButtons');
  const existing = document.getElementById('task-' + id);
  if (existing) { existing.classList.add('active'); return; }

  const btn = document.createElement('button');
  btn.id = 'task-' + id;
  btn.type = 'button';
  btn.textContent = document.getElementById(id).querySelector('.window-title')?.textContent.trim() || id.replace('Window','');
  btn.classList.add('active');
  btn.onclick = ()=>{
    const win = document.getElementById(id);
    if (win.style.display === 'none' || win.dataset.minimized === "true"){
      // restore
      win.style.display = 'block';
      win.dataset.minimized = "false";
      bringToFront(win);
    } else {
      // minimize
      minimizeWindow(id);
    }
  };
  zone.appendChild(btn);
}

function removeTaskbarButton(id){
  const btn = document.getElementById('task-' + id);
  if (btn) btn.remove();
}

// ===== Desktop keyboard accessibility (Enter opens) =====
document.querySelectorAll('.desktop-icon').forEach(icon=>{
  icon.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      const dbl = icon.getAttribute('ondblclick');
      // dblclick string is like openWindow('bioWindow')
      const idMatch = dbl && dbl.match(/openWindow\('([^']+)'\)/);
      if (idMatch) openWindow(idMatch[1]);
    }
  });
});

// ===== Dummy resume download =====
function downloadResume(){
  alert('Downloading résumé...');
}

// Expose for inline HTML handlers
window.toggleStartMenu = toggleStartMenu;
window.openWindow = openWindow;
window.closeWindow = closeWindow;
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.downloadResume = downloadResume;
