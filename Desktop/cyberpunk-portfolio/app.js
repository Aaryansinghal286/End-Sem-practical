/**
 * ==========================================
 *  CYBERPUNK HACKER PORTFOLIO - CORE ENGINE
 *  Vanilla JS - HTML, CSS & Web Audio
 * ==========================================
 */

// --- DATA STORE ---
const PORTFOLIO_DATA = {
    about: `
>> ACCESSING BIOGRAPHICAL INTERFACE...
[USER] Aaryan Singhal
[ROLE] Cyber-Architect & Full-Stack System Developer
[LOC] ABES Engineering College, Ghaziabad, India
--------------------------------------------
I engineer high-performance web applications, combining visual elegance 
with clean, robust logic. Specialized in building interactive interfaces, 
real-time data visualization, and secure API layers. 

I believe that interfaces should not just be functional, but should be 
an immersive experience. I design systems that feel alive.

Type 'skills' or select the [SKILLS] node to examine engineering stack.
Type 'projects' or select the [PROJECTS] node to view the systems archive.
`,
    skills: `
>> SCANNING SYSTEM CORE COMPILER FOR ACTIVE SKILLS...
--------------------------------------------
[FRONTEND CORE]
  - HTML5 / CSS3 ........... [95% STRENGTH]
  - JavaScript / React .......... [70% STRENGTH]
  - UI/UX Responsive Design .... [90% STRENGTH]

[BACKEND & DATABASES]
  - Node.js ................. [65% STRENGTH]
  - API Design .................. [72% STRENGTH]
  - SQL .......... [85% STRENGTH]

[ENGINEERING PIPELINES]
  - Git / GitHub ............... [92% STRENGTH]
  - Resource Management & Optimization .... [80% STRENGTH]

[SPECIALTIES]
  - Web Audio Synthesizers & Sound Engines ...... [85% STRENGTH]
  - Real-time WebSockets communication .......... [88% STRENGTH]
`,
    projects: [
        {
            name: "Project Netflix clone (Streaming UI)",
            tech: "HTML5 Canvas, CSS Grid",
            desc: "A responsive Netflix homepage clone, replicating the original UI with a focus on layout, styling, and responsiveness.",
            link: "https://aaryansinghal286.github.io"
        },
        {
            name: "Project Amazon Clone (E-commerce UI)",
            tech: "HTML5, CSS3, JavaScript",
            desc: "A responsive Amazon homepage clone, demonstrating proficiency in modern front-end development, layout design, and interactive web interfaces.",
            link: "https://amazon-project-sigma-eight.vercel.app"
        },
        
    ],
    secretProjects: [
        {
            name: "★ Student grade calculator ★",
            tech: "HTML5, CSS3, React.js, Node.js",
            desc: "Developed a responsive Student Grade Calculator, featuring real-time percentage and grade calculation with an intuitive, component-based user interface.",
            link: "https://studentgradecalculator-psi.vercel.app/"
        },
        {
            name: "★ Quantum Shell (Secure Shell Engine) ★",
            tech: "Raw Node.js TCP, Custom Ciphering",
            desc: "A custom terminal protocol wrapper allowing secure remote system diagnostics with dynamic compression.",
            link: "https://github.com/Aaryansinghal286/quantum-shell"
        }
    ],
    contact: `
>> EXPORTING COMM-LINKS PROTOCOL...
--------------------------------------------
Reach out to initiate collaboration or secure consulting resources:

  [Personal EMAIL]    aaryansinghal28@gmail.com
  [College EMAIL]     aaryan.25b01010603@abes.ac.in
  [GITHUB]            https://github.com/Aaryansinghal286
  [LINKEDIN]          https://www.linkedin.com/in/aaryan-singhal-629436373
  
Feel free to drop a message through these channels. Grid is open.
`
};

// --- INITIAL STATE ---
let isSoundEnabled = false;
let isAccessibleMode = false;
let isDecrypted = false;
let terminalInputHistory = [];
let historyIndex = -1;

// --- WEB AUDIO SYNTHESIZER ENGINE ---
const AudioSynth = (() => {
    let audioCtx = null;
    let masterGainNode = null;

    function init() {
        if (audioCtx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        masterGainNode = audioCtx.createGain();
        masterGainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Low volume level
        masterGainNode.connect(audioCtx.destination);
    }

    function playTone(freq, type, duration, slideTo = 0) {
        if (!isSoundEnabled) return;
        init();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (slideTo > 0) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(masterGainNode);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    return {
        playType: () => playTone(800, 'sine', 0.05),
        playEnter: () => playTone(600, 'sine', 0.12, 1000),
        playBoot: () => {
            playTone(200, 'sawtooth', 0.1, 400);
            setTimeout(() => playTone(400, 'sawtooth', 0.1, 800), 100);
            setTimeout(() => playTone(600, 'sine', 0.3, 1200), 200);
        },
        playSelect: () => playTone(523.25, 'triangle', 0.25, 783.99), // C5 to G5
        playAlert: () => {
            playTone(880, 'square', 0.1);
            setTimeout(() => playTone(880, 'square', 0.1), 120);
        },
        playSuccess: () => {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                setTimeout(() => playTone(freq, 'sine', 0.2), idx * 100);
            });
        },
        playFailure: () => {
            playTone(150, 'sawtooth', 0.5, 80);
        },
        playGameBlink: () => playTone(600, 'square', 0.08)
    };
})();

// --- TERMINAL INTERFACE LOGIC ---
const Terminal = (() => {
    const outputArea = document.getElementById('terminal-output');
    const inputField = document.getElementById('terminal-input');

    function writeLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.textContent = text;
        outputArea.appendChild(line);
        outputArea.scrollTop = outputArea.scrollHeight;
    }

    function writeHTML(htmlText, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.innerHTML = htmlText;
        outputArea.appendChild(line);
        outputArea.scrollTop = outputArea.scrollHeight;
    }

    function clear() {
        outputArea.innerHTML = '';
    }

    function executeCommand(cmdStr) {
        const cleanCmd = cmdStr.trim().toLowerCase();
        if (cleanCmd === '') return;

        // Save history
        terminalInputHistory.push(cmdStr);
        historyIndex = terminalInputHistory.length;

        writeLine(`GUEST@CYBERPORTFOLIO:~$ ${cmdStr}`, 'text-muted');

        // Play sound
        AudioSynth.playEnter();

        switch (cleanCmd) {
            case 'help':
                writeLine('AVAILABLE DECRYPTION PROTOCOLS & COMMANDS:', 'text-cyan');
                writeLine('  about    - Access biographical overview');
                writeLine('  skills   - Compile and list technical capabilities');
                writeLine('  projects - Query featured systems archive');
                writeLine('  contact  - Fetch communications channels');
                writeLine('  bypass   - Engage network firewall bypass override');
                writeLine('  system   - View current environment diagnostics');
                writeLine('  clear    - Flush terminal console screen buffer');
                writeLine('  help     - Repeat this operations directory');
                break;
            case 'about':
                writeLine(PORTFOLIO_DATA.about);
                highlightNodeByName('about');
                break;
            case 'skills':
                writeLine(PORTFOLIO_DATA.skills);
                highlightNodeByName('skills');
                break;
            case 'projects':
                displayProjects();
                highlightNodeByName('projects');
                break;
            case 'contact':
                writeLine(PORTFOLIO_DATA.contact);
                highlightNodeByName('contact');
                break;
            case 'bypass':
                BypassGame.open();
                break;
            case 'system':
                displaySystemInfo();
                highlightNodeByName('system');
                break;
            case 'clear':
                clear();
                break;
            default:
                writeLine(`ERR: Command '${cleanCmd}' not recognized. Type 'help' for directory.`, 'text-red');
                AudioSynth.playAlert();
        }
    }

    function displayProjects() {
        writeLine('>> FETCHING SYSTEMS ARCHIVE...', 'text-cyan');
        PORTFOLIO_DATA.projects.forEach((proj, idx) => {
            writeHTML(`
<div class="project-entry" style="margin-bottom: 12px; border-left: 2px solid var(--neon-cyan); padding-left: 10px;">
  <span class="text-green">[${idx + 1}] ${proj.name}</span>
  <div style="font-size: 0.85rem; color: var(--text-muted);">TECHNOLOGY: ${proj.tech}</div>
  <div>${proj.desc}</div>
  <div>LINK: <a href="https://${proj.link}" target="_blank" class="text-cyan" style="text-decoration: underline;">${proj.link}</a></div>
</div>`);
        });

        if (isDecrypted) {
            writeLine('\n>> DETECTING DECRYPTED EXPERIMENTAL ARCHIVES...', 'text-green');
            PORTFOLIO_DATA.secretProjects.forEach((proj, idx) => {
                writeHTML(`
<div class="project-entry" style="margin-bottom: 12px; border-left: 2px solid var(--neon-green); padding-left: 10px;">
  <span class="text-green">[SECURE-${idx + 1}] ${proj.name}</span>
  <div style="font-size: 0.85rem; color: var(--text-muted);">TECHNOLOGY: ${proj.tech}</div>
  <div>${proj.desc}</div>
  <div>LINK: <a href="https://${proj.link}" target="_blank" class="text-green" style="text-decoration: underline;">${proj.link}</a></div>
</div>`);
            });
        } else {
            writeLine('\n[!] DETECTED 2 ENCRYPTED PROJECTS HELD BEHIND FIREWALL CORE.', 'text-yellow');
            writeLine('    Execute \'bypass\' command or double-click the RED firewall node to decrypt.', 'text-yellow');
        }
    }

    function displaySystemInfo() {
        const userAgent = navigator.userAgent;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const time = new Date().toISOString();

        writeLine(`>> RETRIEVING DIAGNOSTIC TELEMETRY...
--------------------------------------------
OS_ENV      : CyberPortfolioOS v4.2.9
BROWSER     : ${userAgent.slice(0, 50)}...
RESOLUTION  : ${width}x${height}px (GRID_SCALE)
TIME_STAMP  : ${time}
AUDIO_SYNTH : ${isSoundEnabled ? 'ACTIVE (GAIN=0.08)' : 'MUTED (OFF)'}
CRT_FILTER  : ACTIVE
DEC_LOCK    : ${isDecrypted ? 'BYPASS_SUCCESS' : 'SECURE_ENCRYPTED'}
STATUS_CODE : ONLINE
--------------------------------------------`, 'text-cyan');
    }

    // Input handlers
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = inputField.value;
            executeCommand(val);
            inputField.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                inputField.value = terminalInputHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < terminalInputHistory.length - 1) {
                historyIndex++;
                inputField.value = terminalInputHistory[historyIndex];
            } else {
                historyIndex = terminalInputHistory.length;
                inputField.value = '';
            }
        } else {
            // Typing clicks
            AudioSynth.playType();
        }
    });

    // Refocus terminal input on panel click
    document.getElementById('terminal-panel-view').addEventListener('click', () => {
        inputField.focus();
    });

    return {
        writeLine,
        writeHTML,
        executeCommand,
        clear
    };
})();

// --- INTERACTIVE PHYSICS NODE NETWORK MAP ---
const NodeNetwork = (() => {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    let nodes = [];
    let hoveredNode = null;
    let draggedNode = null;

    // Define Nodes
    function createNetwork() {
        const rootX = width / 2;
        const rootY = height / 2;

        nodes = [
            { id: 'system', label: 'SYSTEM_INFO', x: rootX, y: rootY - 100, radius: 26, color: '#00f0ff', active: false },
            { id: 'about', label: 'ABOUT_ME.TXT', x: rootX - 110, y: rootY - 30, radius: 26, color: '#00f0ff', active: false },
            { id: 'skills', label: 'SKILLS.EXE', x: rootX - 70, y: rootY + 90, radius: 26, color: '#00f0ff', active: false },
            { id: 'projects', label: 'PROJECTS.BIN', x: rootX + 70, y: rootY + 90, radius: 26, color: '#00f0ff', active: false },
            { id: 'contact', label: 'CONTACT.SYS', x: rootX + 110, y: rootY - 30, radius: 26, color: '#00f0ff', active: false },
            { id: 'firewall', label: '🔥 FIREWALL', x: rootX, y: rootY + 30, radius: 22, color: '#ff0055', active: false, isFirewall: true }
        ];
    }

    // Spring/Connector Physics
    function updatePhysics() {
        if (isAccessibleMode) return; // Skip physics execution in text-only mode

        const springLength = 110;
        const k = 0.05; // spring strength
        const damp = 0.85; // damping

        // 1. Hooke's Law Spring Force towards Center
        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach(node => {
            if (node === draggedNode) return;

            // Rest force towards its initial home region relative to center
            let targetX = centerX;
            let targetY = centerY;

            if (node.id === 'system') { targetY -= 80; }
            else if (node.id === 'about') { targetX -= 100; targetY -= 20; }
            else if (node.id === 'skills') { targetX -= 70; targetY += 70; }
            else if (node.id === 'projects') { targetX += 70; targetY += 70; }
            else if (node.id === 'contact') { targetX += 100; targetY -= 20; }
            else if (node.id === 'firewall') { targetY += 10; }

            const fx = (targetX - node.x) * k;
            const fy = (targetY - node.y) * k;

            node.vx = (node.vx || 0) * damp + fx;
            node.vy = (node.vy || 0) * damp + fy;

            node.x += node.vx;
            node.y += node.vy;
        });

        // 2. Repulsion between nodes to prevent overlapping
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.hypot(dx, dy);
                const minDist = n1.radius + n2.radius + 30;

                if (dist < minDist) {
                    const force = (minDist - dist) * 0.08;
                    const ax = (dx / dist) * force;
                    const ay = (dy / dist) * force;

                    if (n1 !== draggedNode) {
                        n1.x -= ax;
                        n1.y -= ay;
                    }
                    if (n2 !== draggedNode) {
                        n2.x += ax;
                        n2.y += ay;
                    }
                }
            }
        }

        // Boundary constraints
        nodes.forEach(node => {
            node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
            node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
        });
    }

    // Render Canvas Frame
    function draw() {
        ctx.clearRect(0, 0, width, height);

        if (isAccessibleMode) return;

        // Draw Links
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1.5;

        // Connect all nodes to root system and firewall
        const centerNode = nodes.find(n => n.id === 'system');
        const firewallNode = nodes.find(n => n.id === 'firewall');

        nodes.forEach(node => {
            if (node.id !== 'system' && centerNode) {
                ctx.moveTo(centerNode.x, centerNode.y);
                ctx.lineTo(node.x, node.y);
            }
            if (node.id !== 'firewall' && node.id !== 'system' && firewallNode) {
                ctx.moveTo(firewallNode.x, firewallNode.y);
                ctx.lineTo(node.x, node.y);
            }
        });
        ctx.stroke();

        // Draw Nodes
        nodes.forEach(node => {
            const glowColor = node.isFirewall ? 'rgba(255, 0, 85, 0.4)' : 'rgba(0, 240, 255, 0.3)';
            const primaryColor = node.isFirewall ? (isDecrypted ? varColor('neon-green') : varColor('neon-red')) : varColor('neon-cyan');

            ctx.save();
            ctx.shadowBlur = node === hoveredNode || node.active ? 15 : 5;
            ctx.shadowColor = primaryColor;

            // Outer ring
            ctx.beginPath();
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = node === hoveredNode ? 3 : 1.5;
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner circle
            ctx.beginPath();
            ctx.fillStyle = node.active ? primaryColor : 'rgba(8, 9, 13, 0.8)';
            ctx.arc(node.x, node.y, node.radius - 6, 0, Math.PI * 2);
            ctx.fill();
            if (node.active) {
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }

            ctx.restore();

            // Draw Node Text Label
            ctx.font = `bold 11px ${varColor('font-terminal')}`;
            ctx.fillStyle = node.active ? '#fff' : (node.isFirewall ? (isDecrypted ? varColor('neon-green') : varColor('neon-red')) : '#e2e8f0');
            ctx.textAlign = 'center';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText(node.label, node.x, node.y - node.radius - 8);
        });
    }

    function varColor(name) {
        if (name === 'neon-cyan') return '#00f0ff';
        if (name === 'neon-green') return '#39ff14';
        if (name === 'neon-red') return '#ff0055';
        if (name === 'font-terminal') return "'Share Tech Mono', monospace";
        return '#fff';
    }

    // Interactive Animation Loop
    function loop() {
        updatePhysics();
        draw();
        requestAnimationFrame(loop);
    }

    // Highlight node matching name from console inputs
    function highlightNode(name) {
        nodes.forEach(n => n.active = (n.id === name));
    }

    // Canvas resize handler
    window.addEventListener('resize', () => {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
    });

    // Touch/Mouse Interactivity
    function getNodeAt(x, y) {
        return nodes.find(node => Math.hypot(node.x - x, node.y - y) < node.radius + 10);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const previousHover = hoveredNode;
        hoveredNode = getNodeAt(mouseX, mouseY);

        if (hoveredNode) {
            canvas.style.cursor = 'pointer';
            if (hoveredNode !== previousHover) {
                AudioSynth.playType(); // Subtly tick on hover change
            }
        } else {
            canvas.style.cursor = 'crosshair';
        }

        if (draggedNode) {
            draggedNode.x = mouseX;
            draggedNode.y = mouseY;
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const clicked = getNodeAt(mouseX, mouseY);
        if (clicked) {
            draggedNode = clicked;
            // Execute related action
            if (clicked.id === 'firewall') {
                // Firewall interaction
                AudioSynth.playSelect();
                BypassGame.open();
            } else {
                AudioSynth.playSelect();
                Terminal.executeCommand(clicked.id);
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggedNode = null;
    });

    // Double click shortcut for bypass
    canvas.addEventListener('dblclick', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const clicked = getNodeAt(mouseX, mouseY);
        if (clicked && clicked.id === 'firewall') {
            BypassGame.open();
        }
    });

    // Setup Touch compatibility
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;
            const clicked = getNodeAt(touchX, touchY);
            if (clicked) {
                draggedNode = clicked;
                AudioSynth.playSelect();
                if (clicked.id === 'firewall') {
                    BypassGame.open();
                } else {
                    Terminal.executeCommand(clicked.id);
                }
            }
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (draggedNode && e.touches.length === 1) {
            const rect = canvas.getBoundingClientRect();
            draggedNode.x = e.touches[0].clientX - rect.left;
            draggedNode.y = e.touches[0].clientY - rect.top;
        }
    });

    canvas.addEventListener('touchend', () => {
        draggedNode = null;
    });

    // Initialize Network Map
    createNetwork();
    loop();

    return {
        highlightNode,
        resetPositions: createNetwork
    };
})();

// Helper to bridge shell highlights
function highlightNodeByName(name) {
    NodeNetwork.highlightNode(name);
}

// --- FIREWALL BYPASS SECURITY MINI-GAME ---
const BypassGame = (() => {
    const modal = document.getElementById('decrypt-modal');
    const startBtn = document.getElementById('start-game-btn');
    const abortBtn = document.getElementById('abort-game-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const grid = document.getElementById('game-grid');
    const attemptStat = document.getElementById('game-attempts');
    const levelStat = document.getElementById('game-level');
    const timerStat = document.getElementById('game-timer');
    const message = document.getElementById('game-message');

    let sequence = [];
    let userSequence = [];
    let attemptsRemaining = 3;
    let currentLevel = 1;
    let timerVal = 15;
    let timerInterval = null;
    let isShowingPattern = false;
    let cells = [];

    function initGrid() {
        grid.innerHTML = '';
        cells = [];
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => cellClicked(i));
            grid.appendChild(cell);
            cells.push(cell);
        }
    }

    function open() {
        modal.classList.remove('hidden');
        resetGame();
        AudioSynth.playAlert();
    }

    function close() {
        modal.classList.add('hidden');
        clearInterval(timerInterval);
    }

    function resetGame() {
        attemptsRemaining = 3;
        currentLevel = 1;
        sequence = [];
        userSequence = [];
        isShowingPattern = false;
        clearInterval(timerInterval);
        
        attemptStat.textContent = attemptsRemaining;
        levelStat.textContent = `${currentLevel}/3`;
        timerStat.textContent = '15s';
        message.textContent = 'Decryption system standby. Initialize Shunt to begin.';
        
        startBtn.classList.remove('hidden');
        initGrid();
    }

    function startLevel() {
        isShowingPattern = true;
        userSequence = [];
        message.textContent = `SYSTEM ACCESS SHUNT: LEVEL ${currentLevel}`;
        attemptStat.textContent = attemptsRemaining;
        levelStat.textContent = `${currentLevel}/3`;
        
        // Generate random cell sequence (Level 1: 3 nodes, Level 2: 4 nodes, Level 3: 5 nodes)
        const sequenceLength = 2 + currentLevel;
        sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            // Avoid duplicate contiguous patterns to keep it intuitive
            let randomIdx;
            do {
                randomIdx = Math.floor(Math.random() * 16);
            } while (sequence.length > 0 && sequence[sequence.length - 1] === randomIdx);
            sequence.push(randomIdx);
        }

        // Display pattern to user
        showPattern();
    }

    async function showPattern() {
        startBtn.classList.add('hidden');
        cells.forEach(c => c.className = 'grid-cell');
        
        // Brief pause before blink starts
        await sleep(600);

        for (let i = 0; i < sequence.length; i++) {
            const cellIdx = sequence[i];
            cells[cellIdx].classList.add('active-glow');
            AudioSynth.playGameBlink();
            await sleep(500);
            cells[cellIdx].classList.remove('active-glow');
            await sleep(250);
        }

        isShowingPattern = false;
        message.textContent = 'REPLICATE MATRIX DECRYPTION SEQUENCE!';
        
        // Start level countdown timer
        startTimer();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerVal = 10 + currentLevel * 5; // 15s, 20s, 25s
        timerStat.textContent = `${timerVal}s`;
        
        timerInterval = setInterval(() => {
            timerVal--;
            timerStat.textContent = `${timerVal}s`;
            
            if (timerVal <= 0) {
                clearInterval(timerInterval);
                levelFailed('TIME EXPIRED');
            }
        }, 1000);
    }

    async function cellClicked(index) {
        if (isShowingPattern || modal.classList.contains('hidden')) return;
        
        // If game not initialized
        if (sequence.length === 0) {
            AudioSynth.playFailure();
            message.textContent = 'INITIALIZE SECURE SHUNT FIRST!';
            return;
        }

        userSequence.push(index);
        const expectedIndex = sequence[userSequence.length - 1];

        if (index === expectedIndex) {
            // Correct click
            cells[index].classList.add('user-selected-correct');
            AudioSynth.playType();

            // If sequence completed
            if (userSequence.length === sequence.length) {
                clearInterval(timerInterval);
                await sleep(400);
                levelPassed();
            }
        } else {
            // Incorrect click
            cells[index].classList.add('user-selected-wrong');
            AudioSynth.playFailure();
            clearInterval(timerInterval);
            await sleep(600);
            levelFailed('FIREWALL COUNTER-INTELLIGENCE TRAP TRIGGERED');
        }
    }

    function levelPassed() {
        if (currentLevel < 3) {
            currentLevel++;
            message.textContent = 'SECTOR BYPASS CONFIRMED. ENTERING LAYER 2.';
            AudioSynth.playSuccess();
            setTimeout(startLevel, 1000);
        } else {
            // Full Decryption success!
            gameSuccess();
        }
    }

    function levelFailed(reason) {
        attemptsRemaining--;
        attemptStat.textContent = attemptsRemaining;

        cells.forEach(c => c.className = 'grid-cell');

        if (attemptsRemaining > 0) {
            message.textContent = `${reason}. RECALIBRATING SHUNT...`;
            setTimeout(startLevel, 1200);
        } else {
            // Game Over
            gameFailed();
        }
    }

    function gameSuccess() {
        isDecrypted = true;
        message.textContent = 'DECRYPTION COMPLETE. ARCHIVE SECTOR ACCESS GRANTED.';
        AudioSynth.playSuccess();
        
        // Update UI Indicators
        document.getElementById('network-status').textContent = 'SYS_DECRYPTED';
        document.getElementById('network-status').className = 'status-indicator online';
        document.getElementById('hud-node-status').textContent = 'UNLOCKED';
        document.getElementById('hud-node-status').className = 'val text-green';
        document.getElementById('hud-node-progress').textContent = '100%';

        // Dynamically change visual firewall node properties
        const firewallNode = document.getElementById('network-canvas'); 
        
        Terminal.writeLine('\n[SUCCESS] FIREWALL CORE CORRUPTED & DECRYPTED.', 'text-green');
        Terminal.writeLine('>> NEW ARCHIVE FOLDERS UNLOCKED IN PROJECTS LOG.', 'text-green');
        Terminal.writeLine('>> Type \'projects\' command to view secure experimental nodes.', 'text-green');

        setTimeout(close, 2500);
    }

    function gameFailed() {
        message.textContent = 'DECRYPTION ATTEMPT FAILED. SHUNT BLOCKED.';
        AudioSynth.playFailure();
        Terminal.writeLine('\n[WARN] DECRYPTION OVERRIDE BLOCKED: FIREWALL RE-ACTIVATED SECURITY STACK.', 'text-red');
        startBtn.classList.remove('hidden');
        startBtn.textContent = 'RE-INITIALIZE SHUNT';
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Modal Control Bindings
    startBtn.addEventListener('click', startLevel);
    abortBtn.addEventListener('click', close);
    closeBtn.addEventListener('click', close);

    return {
        open,
        close
    };
})();

// --- MATRIX RAIN ANIMATED BACKGROUND ---
const MatrixRain = (() => {
    const canvas = document.getElementById('bg-matrix-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*+=?¥";
    const fontSize = 12;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1);

    function draw() {
        if (isAccessibleMode) return;

        ctx.fillStyle = 'rgba(8, 9, 13, 0.06)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00f0ff'; // Cyberpunk blue rain
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Draw character
            ctx.fillText(char, x, y);

            if (y > height && Math.random() > 0.985) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let interval = setInterval(draw, 33);

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
        columns = Math.floor(width / fontSize);
        drops = Array(columns).fill(1);
    });

    return {
        stop: () => clearInterval(interval),
        restart: () => {
            clearInterval(interval);
            interval = setInterval(draw, 33);
        }
    };
})();

// --- SYSTEM CONTROLS & EVENT BINDINGS ---
document.addEventListener('DOMContentLoaded', () => {
    const soundBtn = document.getElementById('sound-btn');
    const accessBtn = document.getElementById('access-btn');
    const mobileModeBtn = document.getElementById('mobile-mode-btn');
    const fastTravelToggle = document.getElementById('toggle-nav-btn');
    const fastTravelNav = document.getElementById('fast-travel-nav');

    // Boot sequence sound trigger (requires user click)
    document.body.addEventListener('click', function initAudioOnInteraction() {
        if (!audioCtxInit) {
            AudioSynth.playBoot();
            audioCtxInit = true;
            document.body.removeEventListener('click', initAudioOnInteraction);
        }
    });
    let audioCtxInit = false;

    // Toggle Sound Button
    soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        if (isSoundEnabled) {
            soundBtn.innerHTML = `<span class="btn-icon">🔊</span> <span class="btn-text">SOUND: ON</span>`;
            soundBtn.classList.add('active');
            AudioSynth.playEnter();
            Terminal.writeLine('>> SYNTHESIZER AUDIO DRIVERS LOADED.', 'text-green');
        } else {
            soundBtn.innerHTML = `<span class="btn-icon">🔈</span> <span class="btn-text">SOUND: OFF</span>`;
            soundBtn.classList.remove('active');
            Terminal.writeLine('>> SYNTHESIZER AUDIO DRIVERS UNLOADED / MUTED.', 'text-muted');
        }
    });

    // Toggle Accessibility / Plain Text Mode
    accessBtn.addEventListener('click', () => {
        isAccessibleMode = !isAccessibleMode;
        if (isAccessibleMode) {
            document.body.className = 'sound-inactive text-mode-accessible';
            accessBtn.classList.add('active');
            Terminal.clear();
            Terminal.writeLine('>> ACCESSIBILITY HIGH CONTRAST & CLEAR FONTS MODE ENGAGED.', 'text-green');
            Terminal.writeLine('>> CRT Scanlines, matrix rain and layout graphics disabled.', 'text-green');
            Terminal.writeLine('>> Use FAST_TRAVEL menu sidebar on the right for quick accessibility navigation.');
        } else {
            document.body.className = 'crt-active sound-inactive text-mode-normal';
            accessBtn.classList.remove('active');
            Terminal.clear();
            Terminal.writeLine('>> GRAPHICAL SUBSYSTEM RE-INITIALIZED.', 'text-cyan');
            Terminal.writeLine('>> Type \'help\' for list of available terminal operations.');
            NodeNetwork.resetPositions();
        }
        AudioSynth.playSelect();
    });

    // Mobile panel views switcher
    let currentMobileView = 'terminal'; // or 'map'
    const terminalPanel = document.getElementById('terminal-panel-view');
    const networkPanel = document.getElementById('network-panel-view');

    mobileModeBtn.addEventListener('click', () => {
        if (currentMobileView === 'terminal') {
            currentMobileView = 'map';
            terminalPanel.classList.add('hidden-mobile');
            networkPanel.classList.remove('hidden-mobile');
            mobileModeBtn.querySelector('.btn-text').textContent = 'VIEW: CONSOLE';
        } else {
            currentMobileView = 'terminal';
            networkPanel.classList.add('hidden-mobile');
            terminalPanel.classList.remove('hidden-mobile');
            mobileModeBtn.querySelector('.btn-text').textContent = 'VIEW: MAP';
        }
        AudioSynth.playSelect();
    });

    // Fast travel sidebar drawer
    fastTravelToggle.addEventListener('click', () => {
        fastTravelNav.classList.toggle('open');
        AudioSynth.playSelect();
    });

    // Fast Travel Directory button links
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cmd = e.target.dataset.cmd;
            Terminal.executeCommand(cmd);
            fastTravelNav.classList.remove('open');
        });
    });

    // Focus input on load
    document.getElementById('terminal-input').focus();
    
    // Hide map on mobile by default on small viewports
    if (window.innerWidth <= 900) {
        networkPanel.classList.add('hidden-mobile');
    }
});
