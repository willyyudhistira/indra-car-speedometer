let elements = {};
let speedMode = 1; // 0: KMH, 1: MPH, 2: Knots

// --- Audio System (Dikembalikan) ---
let audioOn = new Audio('on.mp3');
let audioOff = new Audio('off.mp3');
let audioSeatbelt = new Audio('seatbelt.mp3');

// State Tracking
let isEngineOn = false;
let isSeatbeltOn = false;
let indicators = 0;

/**
 * Memutar audio dari awal
 */
function playAudio(audioObj) {
    audioObj.pause();
    audioObj.currentTime = 0;
    audioObj.play().catch(e => console.log("Audio play error:", e));
}

/**
 * Menghentikan audio
 */
function stopAudio(audioObj) {
    audioObj.pause();
    audioObj.currentTime = 0;
}

/**
 * Updates the display of the engine state.
 * @param {boolean} state If true, the engine is on; otherwise, it is off.
 */
function setEngine(state) {
    if (state !== isEngineOn) {
        if (state) {
            playAudio(audioOn);
            if (elements.statusEng) elements.statusEng.classList.add('active');
        } else {
            playAudio(audioOff);
            stopAudio(audioSeatbelt); // Mematikan suara seatbelt jika mesin dimatikan
            if (elements.statusEng) elements.statusEng.classList.remove('active');
        }
        isEngineOn = state;
    }
}

/**
 * Updates the speed display based on the current speed mode.
 * @param {number} speed The speed value in meters per second (m/s).
 */
function setSpeed(speed) {
    let speedVal = 0;
    
    switch(speedMode) {
        case 1: 
            speedVal = Math.round(speed * 2.236936); // MPH
            if(elements.unit) elements.unit.innerText = 'MPH';
            break;
        case 2:
            speedVal = Math.round(speed * 1.943844); // Knots
            if(elements.unit) elements.unit.innerText = 'KNOTS';
            break;
        default: 
            speedVal = Math.round(speed * 3.6); // KMH
            if(elements.unit) elements.unit.innerText = 'KPH';
    }

    // Format menjadi 3 digit (misal: 048)
    let speedStr = speedVal.toString().padStart(3, '0');
    let firstDigit = speedStr.charAt(0);
    let restDigits = speedStr.substring(1);
    
    if (elements.speedDigit1) elements.speedDigit1.innerText = firstDigit;
    if (elements.speed) elements.speed.innerText = restDigits;
    
    // Efek redup untuk angka nol di depan
    if (elements.speedDigit1) {
        if (firstDigit === '0') {
             elements.speedDigit1.classList.add('digit-dim');
        } else {
             elements.speedDigit1.classList.remove('digit-dim');
        }
    }
}

/**
 * Updates the RPM display & Dynamic Glow.
 * @param {number} rpm The RPM value to display (0 to 1).
 */
function setRPM(rpm) {
    if (!elements.rpmFill) return;
    let percentage = Math.max(0, Math.min(1, rpm)) * 100;
    elements.rpmFill.style.width = percentage + '%';
    
    // Efek Redline: Merah dan glow merah jika melebihi 85%
    if (percentage > 85) {
        elements.rpmFill.style.backgroundColor = '#ff3333';
        elements.rpmFill.style.boxShadow = '0 0 10px #ff3333';
    } else {
        elements.rpmFill.style.backgroundColor = '#ffffff';
        elements.rpmFill.style.boxShadow = '0 0 8px #ffffff';
    }
}

/**
 * Updates the fuel level display & Dynamic Glow.
 * @param {number} fuel The fuel level (0 to 1).
 */
function setFuel(fuel) {
    if (!elements.fuelFill) return;
    let percentage = Math.max(0, Math.min(1, fuel)) * 100;
    elements.fuelFill.style.width = percentage + '%';
    
    // Efek Kritis: Merah dan glow merah jika bensin di bawah 15%
    if (percentage < 15) {
        elements.fuelFill.style.backgroundColor = '#ff3333';
        elements.fuelFill.style.boxShadow = '0 0 10px #ff3333';
    } else {
        elements.fuelFill.style.backgroundColor = '#ffaa00';
        elements.fuelFill.style.boxShadow = '0 0 8px #ffaa00';
    }
}

/**
 * Updates the vehicle health display & Dynamic Glow.
 * @param {number} health The vehicle health level (0 to 1).
 */
function setHealth(health) {
    if (!elements.healthFill) return;
    let percentage = Math.max(0, Math.min(1, health)) * 100;
    elements.healthFill.style.width = percentage + '%';
    
    // Efek Kritis: Merah dan glow merah jika health di bawah 30%
    if (percentage < 30) {
        elements.healthFill.style.backgroundColor = '#ff3333';
        elements.healthFill.style.boxShadow = '0 0 10px #ff3333';
    } else {
        elements.healthFill.style.backgroundColor = '#00ffaa';
        elements.healthFill.style.boxShadow = '0 0 8px #00ffaa';
    }
}

/**
 * Updates the current gear display.
 * @param {string|number} gear The current gear to display.
 */
function setGear(gear) {
    if (!elements.gear) return;
    if (gear === 0 || gear === '0') {
        elements.gear.innerText = 'R'; 
    } else {
        elements.gear.innerText = String(gear);
    }
}

/**
 * Updates the headlights status display.
 * @param {number} state The headlight state (0: Off, 1: On, 2: High Beam).
 */
function setHeadlights(state) {
    if (!elements.headlights) return;
    
    // Hapus semua indikator aktif terlebih dahulu
    elements.headlights.classList.remove('active', 'active-blue');
    
    if (state === 1) {
        // State 1: Lampu menyala (Hijau)
        elements.headlights.classList.add('active');
    } else if (state === 2) {
        // State 2: Lampu Jauh / High Beam (Biru)
        elements.headlights.classList.add('active-blue');
    }
}

/**
 * Sets the state of the left turn indicator and updates the display.
 * @param {boolean} state If true, turns the left indicator on.
 */
function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
    if (!elements.indLeft) return;
    if (state) elements.indLeft.classList.add('active');
    else elements.indLeft.classList.remove('active');
}

/**
 * Sets the state of the right turn indicator and updates the display.
 * @param {boolean} state If true, turns the right indicator on.
 */
function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    if (!elements.indRight) return;
    if (state) elements.indRight.classList.add('active');
    else elements.indRight.classList.remove('active');
}

/**
 * Updates the seatbelt status display.
 * @param {boolean} state If true, indicates seatbelts are fastened.
 */
function setSeatbelts(state) {
    if (state !== isSeatbeltOn) {
        isSeatbeltOn = state;
        if (state) {
            // Seatbelt terpasang -> Ikon menyala, matikan suara alarm
            if (elements.statusSbt) elements.statusSbt.classList.add('active'); 
            stopAudio(audioSeatbelt);
        } else {
            // Seatbelt dilepas -> Ikon mati, nyalakan alarm jika mesin hidup
            if (elements.statusSbt) elements.statusSbt.classList.remove('active');
            if (isEngineOn) {
                playAudio(audioSeatbelt);
            }
        }
    }
}

/**
 * Sets the speed display mode and updates the speed unit display.
 * @param {number} mode The speed mode to set (0: KMH, 1: MPH, 2: Knots).
 */
function setSpeedMode(mode) {
    speedMode = mode;
}

/**
 * Sets the Odometer value of the Speedometer.
 * @param {number} distance The distance in miles.
 */
function setOdometer(distance) {
    if (!elements.odometer) return;
    
    // Format odometer menjadi 8 digit (contoh: 00467.27)
    let distStr = distance.toFixed(2).padStart(8, '0');
    
    // Sesuaikan akhiran satuan secara otomatis
    let unitLabel = (speedMode === 1) ? 'M' : 'KM'; 
    if (speedMode === 2) unitLabel = 'NM'; 
    
    elements.odometer.innerText = `${distStr} ${unitLabel}`;
}

// Inisialisasi DOM Elements saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        speedDigit1: document.getElementById('speed-digit-1'),
        speed: document.getElementById('speed'),
        unit: document.getElementById('unit'),
        statusEng: document.getElementById('status-eng'),
        statusSbt: document.getElementById('status-sbt'),
        headlights: document.getElementById('status-headlights'), 
        gear: document.getElementById('gear'),
        indLeft: document.getElementById('ind-left'),
        indRight: document.getElementById('ind-right'),
        rpmFill: document.getElementById('rpm-fill'),
        fuelFill: document.getElementById('fuel-fill'),
        healthFill: document.getElementById('health-fill'),
        odometer: document.getElementById('odometer'),
    };
});
