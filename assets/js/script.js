let zIndexCounter = 10;
let nextCascadeLeft = null;
let nextCascadeTop = null;
const CASCADE_STEP_PX = 24;

function positionWindowWithCascade(win) {
    const taskbarHeight = 30;
    const wasHidden = win.style.display === "none" || getComputedStyle(win).display === "none";
    // Ensure it's measurable
    if (wasHidden) {
        win.style.display = "block";
    }
    const width = win.offsetWidth || 700;
    const height = win.offsetHeight || 500;

    if (nextCascadeLeft === null || nextCascadeTop === null) {
        const centeredLeft = Math.max(0, Math.floor((window.innerWidth - width) / 2) - 60);
        const centeredTop = Math.max(0, Math.floor((window.innerHeight - height - taskbarHeight) / 2));
        nextCascadeLeft = centeredLeft;
        nextCascadeTop = centeredTop;
    } else {
        nextCascadeLeft += CASCADE_STEP_PX;
        nextCascadeTop += CASCADE_STEP_PX;
    }

    // Wrap to visible area if overflowing
    if (nextCascadeLeft + width > window.innerWidth - 10) {
        nextCascadeLeft = Math.max(0, Math.floor((window.innerWidth - width) / 2) - 60);
    }
    if (nextCascadeTop + height > window.innerHeight - taskbarHeight) {
        nextCascadeTop = Math.max(0, Math.floor((window.innerHeight - height - taskbarHeight) / 2));
    }

    win.style.left = nextCascadeLeft + 'px';
    win.style.top = nextCascadeTop + 'px';
}

// Start menu toggle
function toggleStartMenu() {
    const menu = document.getElementById("startMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    if (!menu.contains(e.target) && !button.contains(e.target)) {
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
    positionWindowForMobile(win);
    bringToFront(win);
    removeTaskbarButton(id);
    
    // Load PDF if it's the Resume window
    if (id === 'resumeWindow') {
        setTimeout(loadResumePDF, 500);
    }
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
        if (window.innerWidth <= 768) {
            // On mobile, restore to mobile-optimized size
            win.style.width = '95vw';
            win.style.height = '80vh';
            win.style.left = '2.5vw';
            win.style.top = '10vh';
        } else {
            // On desktop, restore to saved position
            win.style.width = win.dataset.prevWidth;
            win.style.height = win.dataset.prevHeight;
            win.style.top = win.dataset.prevTop;
            win.style.left = win.dataset.prevLeft;
        }
        win.dataset.maximized = "false";
    } else {
        // Save current position & size
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;

        // Maximize
        if (window.innerWidth <= 768) {
            // On mobile, maximize to full screen minus taskbar
            win.style.top = "0";
            win.style.left = "0";
            win.style.width = "100%";
            win.style.height = "calc(100% - 40px)"; // Account for mobile taskbar height
        } else {
            // On desktop, use existing logic
            win.style.top = "0";
            win.style.left = "0";
            win.style.width = "100%";
            win.style.height = "calc(100% - 30px)";
        }
        win.dataset.maximized = "true";
    }
}

// (Removed custom resume controls)

// Draggable windows
let dragged;
// Mobile touch support for draggable windows
let touchStartX, touchStartY, touchStartLeft, touchStartTop;

document.querySelectorAll('.window-header').forEach(header => {
    // Mouse events (existing)
    header.onmousedown = function(e) {
        if (window.innerWidth <= 768) return; // Disable mouse dragging on mobile
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
    
    // Touch events for mobile - only for dragging, not for buttons
    header.addEventListener('touchstart', function(e) {
        if (window.innerWidth > 768) return; // Only enable touch on mobile
        
        // Don't prevent default here to allow button clicks
        dragged = this.parentElement;
        bringToFront(dragged);
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartLeft = parseInt(dragged.style.left) || 0;
        touchStartTop = parseInt(dragged.style.top) || 0;
    });
    
    header.addEventListener('touchmove', function(e) {
        if (window.innerWidth > 768) return;
        if (!dragged) return;
        
        // Only prevent default if we're actually dragging
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // Only start dragging if movement is significant (not a tap)
        if (deltaX > 5 || deltaY > 5) {
            e.preventDefault();
            
            const newLeft = Math.min(window.innerWidth - dragged.offsetWidth, Math.max(0, touchStartLeft + (touch.clientX - touchStartX)));
            const newTop = Math.min(window.innerHeight - dragged.offsetHeight - 30, Math.max(0, touchStartTop + (touch.clientY - touchStartY)));
            
            dragged.style.left = newLeft + 'px';
            dragged.style.top = newTop + 'px';
        }
    });
    
    header.addEventListener('touchend', function(e) {
        if (window.innerWidth > 768) return;
        dragged = null;
    });
});

// Add touch support for all buttons
function addTouchSupportToButtons() {
    // Desktop icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('touchstart', function(e) {
            // Prevent default to avoid double-tap zoom
            e.preventDefault();
        });
        
        icon.addEventListener('touchend', function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the function call from onclick
                const match = onclick.match(/openWindow\(event,\s*'([^']+)'\)/);
                if (match) {
                    openWindow(e, match[1]);
                }
            }
        });
    });
    
    // Window control buttons
    document.querySelectorAll('.window-controls button').forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the function call from onclick
                const match = onclick.match(/(\w+)Window\('([^']+)'\)/);
                if (match) {
                    const funcName = match[1];
                    const windowId = match[2];
                    if (funcName === 'minimize') {
                        minimizeWindow(windowId);
                    } else if (funcName === 'maximize') {
                        maximizeWindow(windowId);
                    } else if (funcName === 'close') {
                        closeWindow(windowId);
                    }
                }
            }
        });
    });
    
    // Resume buttons
    document.querySelectorAll('.resume-buttons button').forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the function call from onclick
                const match = onclick.match(/(\w+)\(\)/);
                if (match) {
                    const funcName = match[1];
                    if (funcName === 'downloadResume') {
                        downloadResume();
                    } else if (funcName === 'openResumeNewTab') {
                        openResumeNewTab();
                    }
                }
            }
        });
    });
    
    // Start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        
        startButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleStartMenu();
        });
    }
    
    // Start menu items
    document.querySelectorAll('#startMenu ul li').forEach(item => {
        item.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        
        item.addEventListener('touchend', function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the URL from onclick
                const match = onclick.match(/window\.open\('([^']+)'/);
                if (match) {
                    window.open(match[1], '_blank');
                }
            }
        });
    });
}

// Taskbar buttons
function addTaskbarButton(id) {
    const taskbarWindows = document.getElementById("taskbar-windows");
    if (document.getElementById("task-" + id)) return;
    const btn = document.createElement("button");
    btn.id = "task-" + id;
    const headerTitle = document.querySelector(`#${id} .window-header span`);
    btn.innerText = headerTitle ? headerTitle.innerText : id.replace("Window","");
    
    // Add both click and touch support
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
    
    // Add touch support for taskbar buttons
    btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
    });
    
    btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        btn.onclick();
    });
    
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
  link.href = "https://drive.google.com/file/d/1qKZmJfNHu_RzCEbR8kFtqQeBEAW6iJC_/embed";
  link.download = "Ayush-Resume.pdf";
  link.click();
}

function openResumeNewTab() {
  window.open("https://drive.google.com/file/d/1qKZmJfNHu_RzCEbR8kFtqQeBEAW6iJC_/view", "_blank");
}

// PDF.js setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Load PDF when Resume window opens
function loadResumePDF() {
    console.log('Loading PDF...');
    
    const pdfViewer = document.getElementById('pdfViewer');
    
    if (!pdfViewer) {
        console.error('PDF viewer not found');
        return;
    }
    
    // Try to load PDF using Google Drive embed
    const pdfUrl = 'https://drive.google.com/file/d/1qKZmJfNHu_RzCEbR8kFtqQeBEAW6iJC_/preview';
    
    // Create iframe for PDF embedding
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#c0c0c0';
    
    // Add load event to check if PDF loaded successfully
    iframe.onload = function() {
        console.log('PDF iframe loaded successfully');
    };
    
    // Only show fallback if there's a real error
    // Let the iframe handle its own loading
    
    // Try to load the iframe
    try {
        pdfViewer.innerHTML = '';
        pdfViewer.appendChild(iframe);
        
        // Don't use aggressive timeout - let the iframe load naturally
        // The iframe will either load successfully or fail gracefully
        
    } catch (error) {
        console.error('Error creating iframe:', error);
        showFallbackMessage();
    }
    
    function showFallbackMessage() {
        pdfViewer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #333;">
                <h3 style="margin-bottom: 20px; color: #0a64ad;">📄 Resume PDF</h3>
                <p style="margin-bottom: 25px; line-height: 1.5;">
                    Due to browser security restrictions, the PDF cannot be displayed directly in this window.<br>
                    Please use the buttons above to download or view your resume.
                </p>
                <div style="background: #f0f0f0; border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>💡 Tip:</strong> The "Download" button will save the PDF to your device,<br>
                    while "Open in New Tab" will display it in your browser's PDF viewer.
                </div>
            </div>
        `;
    }
}

// Mobile-specific window positioning
function positionWindowForMobile(win) {
    if (window.innerWidth <= 768) {
        // Center the window on mobile
        win.style.left = '2.5vw';
        win.style.top = '10vh';
        win.style.width = '95vw';
        win.style.height = '80vh';
    } else {
        // Use cascade positioning for desktop
        positionWindowWithCascade(win);
    }
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Reposition windows when screen size changes
    document.querySelectorAll('.window').forEach(win => {
        if (win.style.display !== 'none') {
            positionWindowForMobile(win);
        }
    });
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Close start menu when clicking outside (mobile-friendly)
document.addEventListener('click', (e) => {
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    if (!menu.contains(e.target) && !button.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Also close start menu on touch outside
document.addEventListener('touchend', (e) => {
    const menu = document.getElementById("startMenu");
    const button = document.getElementById("startButton");
    if (!menu.contains(e.target) && !button.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Initialize touch support when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addTouchSupportToButtons();
});

// Also add touch support after any dynamic content is added
function addTouchSupportToButtons() {
    // Desktop icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        // Remove existing listeners to avoid duplicates
        icon.removeEventListener('touchstart', icon._touchStartHandler);
        icon.removeEventListener('touchend', icon._touchEndHandler);
        
        icon._touchStartHandler = function(e) {
            e.preventDefault();
        };
        
        icon._touchEndHandler = function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the function call from onclick
                const match = onclick.match(/openWindow\(event,\s*'([^']+)'\)/);
                if (match) {
                    openWindow(e, match[1]);
                }
            }
        };
        
        icon.addEventListener('touchstart', icon._touchStartHandler);
        icon.addEventListener('touchend', icon._touchEndHandler);
    });
    
    // Window control buttons
    document.querySelectorAll('.window-controls button').forEach(button => {
        // Remove existing listeners to avoid duplicates
        button.removeEventListener('touchstart', button._touchStartHandler);
        button.removeEventListener('touchend', button._touchEndHandler);
        
        button._touchStartHandler = function(e) {
            e.preventDefault();
        };
        
        button._touchEndHandler = function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the function call from onclick
                const match = onclick.match(/(\w+)Window\('([^']+)'\)/);
                if (match) {
                    const funcName = match[1];
                    const windowId = match[2];
                    if (funcName === 'minimize') {
                        minimizeWindow(windowId);
                    } else if (funcName === 'maximize') {
                        maximizeWindow(windowId);
                    } else if (funcName === 'close') {
                        closeWindow(windowId);
                    }
                }
            }
        };
        
        button.addEventListener('touchstart', button._touchStartHandler);
        button.addEventListener('touchend', button._touchEndHandler);
    });
    
    // Resume buttons
    document.querySelectorAll('.resume-buttons button').forEach(button => {
        // Remove existing listeners to avoid duplicates
        button.removeEventListener('touchstart', button._touchStartHandler);
        button.removeEventListener('touchend', button._touchEndHandler);
        
        button._touchStartHandler = function(e) {
            e.preventDefault();
        };
        
        button._touchEndHandler = function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the function call from onclick
                const match = onclick.match(/(\w+)\(\)/);
                if (match) {
                    const funcName = match[1];
                    if (funcName === 'downloadResume') {
                        downloadResume();
                    } else if (funcName === 'openResumeNewTab') {
                        openResumeNewTab();
                    }
                }
            }
        };
        
        button.addEventListener('touchstart', button._touchStartHandler);
        button.addEventListener('touchend', button._touchEndHandler);
    });
    
    // Start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        // Remove existing listeners to avoid duplicates
        startButton.removeEventListener('touchstart', startButton._touchStartHandler);
        startButton.removeEventListener('touchend', startButton._touchEndHandler);
        
        startButton._touchStartHandler = function(e) {
            e.preventDefault();
        };
        
        startButton._touchEndHandler = function(e) {
            e.preventDefault();
            toggleStartMenu();
        };
        
        startButton.addEventListener('touchstart', startButton._touchStartHandler);
        startButton.addEventListener('touchend', startButton._touchEndHandler);
    }
    
    // Start menu items
    document.querySelectorAll('#startMenu ul li').forEach(item => {
        // Remove existing listeners to avoid duplicates
        item.removeEventListener('touchstart', item._touchStartHandler);
        item.removeEventListener('touchend', item._touchEndHandler);
        
        item._touchStartHandler = function(e) {
            e.preventDefault();
        };
        
        item._touchEndHandler = function(e) {
            e.preventDefault();
            // Trigger the onclick event
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract the URL from onclick
                const match = onclick.match(/window\.open\('([^']+)'/);
                if (match) {
                    window.open(match[1], '_blank');
                }
            }
        };
        
        item.addEventListener('touchstart', item._touchStartHandler);
        item.addEventListener('touchend', item._touchEndHandler);
    });
}
