// App State
let currentCalculation = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await initDefaultShifts();
    
    setupNavigation();
    setupCalculator();
    setupSettings();
    setupHistory();
    
    // Set default date to today
    setDefaultDate();
    
    // Load initial data
    await loadShifts();
    await loadHistory();
});

// Set default date to today
function setDefaultDate() {
    const dateInput = document.getElementById('work-date');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
}

// Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and pages
            navButtons.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding page
            const pageId = btn.id.replace('nav-', '') + '-page';
            document.getElementById(pageId).classList.add('active');
        });
    });
}

// Calculator
function setupCalculator() {
    const form = document.getElementById('calculator-form');
    const saveBtn = document.getElementById('save-calculation');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await calculateEarnings();
    });
    
    saveBtn.addEventListener('click', async () => {
        if (currentCalculation) {
            await addHistory(currentCalculation);
            await loadHistory();
            alert('Berechnung in Historie gespeichert!');
        }
    });
}

async function calculateEarnings() {
    const workDate = document.getElementById('work-date').value;
    const startTimeInput = document.getElementById('start-time').value;
    const endTimeInput = document.getElementById('end-time').value;
    const overnight = document.getElementById('overnight').checked;
    
    if (!workDate || !startTimeInput || !endTimeInput) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    }
    
    const shifts = await getAllShifts();
    if (shifts.length === 0) {
        alert('Bitte fügen Sie zuerst Schichten in den Einstellungen hinzu!');
        return;
    }
    
    // Convert time strings to minutes since midnight
    const startMinutes = timeToMinutes(startTimeInput);
    let endMinutes = timeToMinutes(endTimeInput);
    
    // Handle overnight shifts
    if (overnight && endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Add 24 hours
    }
    
    if (!overnight && endMinutes <= startMinutes) {
        alert('Endzeit muss nach Startzeit liegen! Aktivieren Sie "Über Nacht" wenn die Schicht über Mitternacht geht.');
        return;
    }
    
    // Sort shifts by start time
    const sortedShifts = shifts.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    // Calculate earnings for each overlap
    const breakdown = [];
    let totalEarnings = 0;
    
    for (const shift of sortedShifts) {
        const shiftStart = timeToMinutes(shift.startTime);
        let shiftEnd = timeToMinutes(shift.endTime);
        
        // Handle shifts that cross midnight
        if (shiftEnd < shiftStart) {
            shiftEnd += 24 * 60;
        }
        
        // Check for multiple occurrences in 24h+ period
        const occurrences = [];
        occurrences.push({ start: shiftStart, end: shiftEnd });
        
        // If work period is overnight (> 24h), check next day occurrence
        if (endMinutes > 24 * 60) {
            occurrences.push({ start: shiftStart + 24 * 60, end: shiftEnd + 24 * 60 });
        }
        
        for (const occurrence of occurrences) {
            const overlapStart = Math.max(startMinutes, occurrence.start);
            const overlapEnd = Math.min(endMinutes, occurrence.end);
            
            if (overlapStart < overlapEnd) {
                const hours = (overlapEnd - overlapStart) / 60;
                const earnings = hours * shift.rate;
                totalEarnings += earnings;
                
                breakdown.push({
                    time: `${minutesToTime(occurrence.start % (24 * 60))} - ${minutesToTime(occurrence.end % (24 * 60))}`,
                    hours: hours.toFixed(2),
                    rate: shift.rate,
                    earnings: earnings.toFixed(2)
                });
            }
        }
    }
    
    const totalHours = (endMinutes - startMinutes) / 60;
    
    // Display result
    displayResult(workDate, startTimeInput, endTimeInput, overnight, totalHours, totalEarnings, breakdown);
    
    // Store current calculation
    currentCalculation = {
        timestamp: Date.now(),
        workDate: workDate,
        startTime: startTimeInput,
        endTime: endTimeInput,
        overnight: overnight,
        totalHours: totalHours,
        totalEarnings: totalEarnings,
        breakdown: breakdown
    };
}

function displayResult(workDate, startTime, endTime, overnight, totalHours, totalEarnings, breakdown) {
    const resultDiv = document.getElementById('result');
    const hoursSpan = document.getElementById('result-hours');
    const totalSpan = document.getElementById('result-total');
    const breakdownDiv = document.getElementById('result-breakdown');
    
    hoursSpan.textContent = totalHours.toFixed(2);
    totalSpan.textContent = `€${totalEarnings.toFixed(2)}`;
    
    // Display breakdown
    breakdownDiv.innerHTML = '<h4>Aufschlüsselung:</h4>';
    breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        div.innerHTML = `
            <span>${item.time} (${item.hours}h × €${item.rate}/h)</span>
            <strong>€${item.earnings}</strong>
        `;
        breakdownDiv.appendChild(div);
    });
    
    resultDiv.classList.remove('hidden');
}

// Settings
function setupSettings() {
    const form = document.getElementById('shift-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const startTime = document.getElementById('shift-start').value;
        const endTime = document.getElementById('shift-end').value;
        const rate = parseFloat(document.getElementById('shift-rate').value);
        
        if (!startTime || !endTime || !rate) {
            alert('Bitte alle Felder ausfüllen!');
            return;
        }
        
        await addShift({ startTime, endTime, rate });
        await loadShifts();
        
        // Reset form
        form.reset();
    });
}

async function loadShifts() {
    const shifts = await getAllShifts();
    const list = document.getElementById('shifts-list');
    
    if (shifts.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>Keine Schichten vorhanden. Fügen Sie Ihre erste Schicht hinzu!</p>
            </div>
        `;
        return;
    }
    
    // Sort shifts by start time
    const sortedShifts = shifts.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    list.innerHTML = '';
    sortedShifts.forEach(shift => {
        const div = document.createElement('div');
        div.className = 'shift-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'shift-info';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'shift-time';
        timeDiv.textContent = `${shift.startTime} - ${shift.endTime}`;
        
        const rateDiv = document.createElement('div');
        rateDiv.className = 'shift-rate';
        rateDiv.textContent = `€${shift.rate.toFixed(2)}/h`;
        
        infoDiv.appendChild(timeDiv);
        infoDiv.appendChild(rateDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'shift-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-small';
        deleteBtn.textContent = 'Löschen';
        deleteBtn.addEventListener('click', () => deleteShiftHandler(shift.id));
        
        actionsDiv.appendChild(deleteBtn);
        
        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);
        list.appendChild(div);
    });
}

async function deleteShiftHandler(id) {
    if (confirm('Möchten Sie diese Schicht wirklich löschen?')) {
        await deleteShift(id);
        await loadShifts();
    }
}

// History
function setupHistory() {
    const clearBtn = document.getElementById('clear-history');
    
    clearBtn.addEventListener('click', async () => {
        if (confirm('Möchten Sie die gesamte Historie wirklich löschen?')) {
            await clearHistory();
            await loadHistory();
        }
    });
}

async function loadHistory() {
    const history = await getAllHistory();
    const list = document.getElementById('history-list');
    
    if (history.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>Keine Einträge in der Historie. Berechnen Sie Ihren ersten Verdienst!</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    history.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const savedDate = new Date(entry.timestamp);
        const savedDateStr = savedDate.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Format work date if available, otherwise use saved timestamp
        let workDateStr = '';
        if (entry.workDate) {
            const [year, month, day] = entry.workDate.split('-');
            workDateStr = `${day}.${month}.${year}`;
        } else {
            workDateStr = savedDate.toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric'
            });
        }
        
        let breakdownHtml = '';
        if (entry.breakdown && entry.breakdown.length > 0) {
            breakdownHtml = '<div style="margin-top: 0.5rem; font-size: 0.85rem;">';
            entry.breakdown.forEach(item => {
                breakdownHtml += `<div>${item.time}: ${item.hours}h × €${item.rate}/h = €${item.earnings}</div>`;
            });
            breakdownHtml += '</div>';
        }
        
        div.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-date">${workDateStr}</span>
                <span class="history-item-total">€${entry.totalEarnings.toFixed(2)}</span>
            </div>
            <div class="history-item-details">
                ${entry.startTime} - ${entry.endTime}${entry.overnight ? ' (über Nacht)' : ''} 
                | ${entry.totalHours.toFixed(2)} Stunden
                <div style="font-size: 0.75rem; color: #999; margin-top: 0.25rem;">Gespeichert: ${savedDateStr}</div>
                ${breakdownHtml}
            </div>
        `;
        list.appendChild(div);
    });
}

// Helper Functions
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const mins = minutes % (24 * 60);
    const hours = Math.floor(mins / 60);
    const mins2 = mins % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins2).padStart(2, '0')}`;
}
