(function() {
    // --- State & Constants ---
    const messages = [
        "Re-thinking your request…", "Counting electrons…", "Petting imaginary cats…",
        "Downloading faster internet…", "Polishing pixels…", "Optimizing the unoptimized…",
        "Reversing gravity…", "Charging quantum battery…", "Negotiating with the progress bar union…",
        "Defragmenting the cloud…", "Stirring the entropy soup…", "Aligning the UI chakras…",
        "Reticulating splines…", "Summoning rubber duck…", "Warming up the cold start…",
        "Refactoring the spaghetti…", "Installing more RAM…", "Turning it off and on again…",
        "Counting to infinity (backwards)…", "Consulting the manual…"
    ];

    const crashMessages = [
        "Oops, we crashed. Rebooting illusions…", "Everything went fine. Then it didn’t.",
        "Kernel panic, but for vibes.", "Quantum decoherence detected. Rolling back reality…",
        "Unexpected success avoided. Restarting…"
    ];

    const randomJumps = [98, 97, 95, 92, 88, 85]; // Jumps to these percentages

    // --- DOM Elements ---
    const statusEl = document.getElementById('statusText');
    const percentEl = document.getElementById('percentText');
    const barFill = document.getElementById('barFill');
    const messageLog = document.getElementById('messageLog');
    const mainCard = document.getElementById('mainCard');
    const btnPause = document.getElementById('btnPause');
    const btnCancel = document.getElementById('btnCancel');
    const btnSpeed = document.getElementById('btnSpeed');
    const btnSound = document.getElementById('btnSound');
    const btnReset = document.getElementById('btnReset');
    const achEl = document.getElementById('achievements');
    const timerText = document.getElementById('timerText');
    const popup = document.getElementById('popup');
    const leaderboardEl = document.getElementById('leaderboard');
    const crashSound = document.getElementById('crashSound');

    // --- State Variables ---
    let progress = 99;
    let baseIntervalMs = 1600;
    let intervalJitter = [1500, 3000]; // [min, max] dynamic range per tick
    let speedMultiplier = 1;
    let paused = false;
    let cancelBoost = 1;
    let boostTimer = null;
    let startTime = Date.now();
    let totalTimeWasted = Number(localStorage.getItem('apb_total_ms') || 0);
    let sessionCrashes = 0;
    let soundOn = false;

    // --- Core Functions ---
    function updateUI() {
        const p = Math.round(progress);
        percentEl.textContent = Math.max(0, Math.min(100, p));
        barFill.style.width = Math.max(0, Math.min(100, progress)) + '%';
        document.querySelector('.bar').setAttribute('aria-valuenow', p);
    }

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function setStatus(msg) { statusEl.textContent = msg; }
    function setMessage(msg) { messageLog.textContent = msg; }

    function showPopup(text) {
        popup.textContent = text;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 2800);
    }

    function vibrate(ms = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(ms);
        }
    }

    function playCrash() {
        if (!soundOn) return;
        try {
            crashSound.currentTime = 0;
            crashSound.play();
        } catch (e) {
            console.error("Audio playback failed:", e);
        }
    }

    function screenShake() {
        mainCard.classList.remove('crash');
        void mainCard.offsetWidth; // Force reflow to replay animation
        mainCard.classList.add('crash');
    }

    function tick() {
        // Random jump every ~15 ticks
        if (Math.random() < 1 / 15) {
            const target = pick(randomJumps);
            const newP = Math.max(target, progress);
            if (newP !== progress && newP <= 99) {
                progress = newP;
                setStatus("Fixing unexpected issues…");
                setMessage(pick(messages));
                updateUI();
            }
        }

        // Decrease progress
        const step = (Math.random() * 4 + 1) * speedMultiplier * cancelBoost; // 1–5 scaled
        progress -= step;
        if (progress < 0) progress = 0;
        
        setMessage(pick(messages));
        updateUI();

        // Crash at 0%
        if (progress <= 0) {
            crashAndRestart();
        }
    }
    
    function crashAndRestart() {
    sessionCrashes++;
    setStatus(pick(crashMessages));
    setMessage("Restarting…");
    playCrash();
    vibrate(200); // Longer vibration for a crash
    earnAchievements();

    // 1. Trigger the shake animation on the card.
    screenShake();

    // 2. After a brief moment, add the 'dropping' class to make the card fall.
    setTimeout(() => {
        mainCard.classList.add('dropping');
    }, 150);

    // 3. Animate the progress bar fill to zero.
    barFill.style.transition = 'width 400ms ease-in';
    barFill.style.width = '0%';

    // 4. Set a timeout to reset the UI after the animations have finished.
    const resetDelay = 1200; // Gives time for shake (450ms) + drop (700ms) to play out.
    setTimeout(() => {
        // Remove the animation class to reset the card's position and opacity.
        mainCard.classList.remove('dropping');

        // Reset the progress bar to a new "almost done" state.
        const newHigh = Math.floor(85 + Math.random() * 14); // 85–99
        progress = Math.min(99, newHigh);
        
        // Use the smooth transition for the bar's reappearance.
        barFill.style.transition = 'width 600ms cubic-bezier(.2,.7,.2,1)';
        
        setStatus("Almost done…");
        setMessage("Resolving previous success attempt…");
        updateUI(); // Updates text and bar width, triggering the fill animation.
    }, resetDelay);
}

    // --- Achievements & Timers ---
    function earnAchievements() {
        const totalSec = Math.floor(totalTimeWasted / 1000);

        if (totalSec >= 60 * 5 && !localStorage.getItem('apb_ach_5m')) {
            localStorage.setItem('apb_ach_5m', '1');
            addAchievement("🏆 5 minutes wasted!");
            showPopup("🏆 New Achievement: 5 minutes wasted!");
        }
        if (sessionCrashes >= 5 && !localStorage.getItem('apb_ach_5crash')) {
            localStorage.setItem('apb_ach_5crash', '1');
            addAchievement("🥇 Witnessed 5 crashes!");
            showPopup("🥇 New Achievement: Witnessed 5 crashes!");
        }
        
        refreshAchievementsUI();
    }
    
    function addAchievement(text) {
        const arr = JSON.parse(localStorage.getItem('apb_ach_list') || '[]');
        if (!arr.includes(text)) {
            arr.push(text);
            localStorage.setItem('apb_ach_list', JSON.stringify(arr));
        }
    }
    
    function refreshAchievementsUI() {
        const arr = JSON.parse(localStorage.getItem('apb_ach_list') || '[]');
        achEl.innerHTML = '';
        if (arr.length === 0) {
            achEl.innerHTML = '<div class="subtle">No achievements yet. Keep wasting time!</div>';
        } else {
            arr.forEach(t => {
                const div = document.createElement('div');
                div.className = 'pill';
                div.textContent = t;
                achEl.appendChild(div);
            });
        }
    }
    
    function formatMs(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}h ${m}m ${sec}s`;
        if (m > 0) return `${m}m ${sec}s`;
        return `${sec}s`;
    }

    function updateTimer() {
        const sessionMs = Date.now() - startTime;
        const totalMs = totalTimeWasted + (Date.now() - startTime); // Use live session time for total
        timerText.textContent = `Time wasted: ${formatMs(sessionMs)} (session) · ${formatMs(totalMs)} (all time)`;
    }

    function updateLeaderboard() {
        const fake = [
            { name: "John W.", ms: 12 * 3600 * 1000 },
            { name: "AI Bot", ms: Number.POSITIVE_INFINITY },
            { name: "You", ms: totalTimeWasted + (Date.now() - startTime) }
        ];

        let html = '';
        fake.sort((a, b) => b.ms - a.ms).forEach(row => {
            let timeStr = row.ms === Infinity ? 'Infinite hours wasted' : formatMs(row.ms);
            html += `<div class="pill"><strong>${row.name}</strong> — ${timeStr}</div>`;
        });
        leaderboardEl.innerHTML = html;
    }
    
    // --- Control Handlers ---
    function speedBoost(mult, ms) {
        speedMultiplier *= mult;
        clearTimeout(boostTimer);
        boostTimer = setTimeout(() => {
            speedMultiplier /= mult;
            setStatus("Returning to normal reverse speed.");
        }, ms);
    }
    
    btnPause.addEventListener('click', () => {
        setStatus("Pausing… just kidding. Reversing faster!");
        setMessage("Applying negative inertia…");
        speedBoost(2, 5000);
    });

    btnCancel.addEventListener('click', () => {
        setStatus("Canceling cancellation…");
        setMessage("Negotiating with the cancel button…");
        paused = true;
        const oldMult = cancelBoost;
        cancelBoost = 0; // "Stops" progress
        setTimeout(() => {
            paused = false;
            cancelBoost = oldMult;
            setStatus("Cancellation canceled. Accelerating.");
            speedBoost(2.2, 4000);
        }, 2000);
    });
    
    btnSpeed.addEventListener('click', () => {
        setStatus("Boosting reverse thrust!");
        speedBoost(1.6, 4000);
    });

    btnSound.addEventListener('click', () => {
        soundOn = !soundOn;
        btnSound.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
        if (soundOn) showPopup("Sound enabled. Prepare for disappointment.");
    });
    
    btnReset.addEventListener('click', () => {
        setStatus("Forcing inevitable crash…");
        progress = 1; // Set close to 0 to trigger crash on next tick
        updateUI();
        crashAndRestart();
    });

    // --- Main Loop Logic ---
    let loopHandle;
    function scheduleNextTick() {
        const [min, max] = intervalJitter;
        const jitter = Math.random() * (max - min) + min;
        const wait = jitter / Math.max(1, speedMultiplier);
        
        loopHandle = setTimeout(() => {
            if (!paused) tick();
            scheduleNextTick();
        }, wait);
    }
    
    // --- Initialization ---
    function init() {
        updateUI();
        refreshAchievementsUI();
        updateLeaderboard();
        updateTimer();
        
        // Timer for UI updates that don't need to be in the main tick loop
        setInterval(() => {
            updateTimer();
            updateLeaderboard();
            localStorage.setItem('apb_total_ms', String(totalTimeWasted + (Date.now() - startTime)));
            if (Math.random() < 0.05) earnAchievements(); // Check for achievements periodically
        }, 1000);
        
        // Start the main loop
        setTimeout(() => scheduleNextTick(), 600);
    }

    // Start the application
    init();

})();