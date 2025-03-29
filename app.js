// app.js

// ... (alte selectoare - asigură-te că ai ID-urile noi pt grafice/butoane export)
const d3VolumeChartDashEl = document.getElementById('d3VolumeChartDash');
const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');
const d3ProgressChartDashEl = document.getElementById('d3ProgressChartDash');
const personalRecordsList = document.getElementById('personalRecordsList');
const noPrMessage = document.getElementById('noPrMessage');
const exportCSVSettingsBtn = document.getElementById('exportCSVSettings');
const exportTXTSettingsBtn = document.getElementById('exportTXTSettings');
const exportPDFSettingsBtn = document.getElementById('exportPDFSettings');

// --- Grafice D3 ---
// Modifică funcțiile de randare să accepte elementul SVG/Select sau folosește wrapper
const renderVolumeChart = (targetSvgElement = d3VolumeChartDashEl) => { // Default la cel din Dashboard
    if (!targetSvgElement) return;
    const svgId = targetSvgElement.id;
    const chartConfig = setupChart(svgId, 600, 300); // Folosește ID-ul corect
    // ... restul logicii renderVolumeChart ...
};

const renderProgressChart = (selectedExercise, targetSvgElement = d3ProgressChartDashEl, sourceSelectElement = progressExerciseSelectDash) => { // Default la cele din Dashboard
    if (!targetSvgElement || !sourceSelectElement) return;
    const svgId = targetSvgElement.id;
    const chartConfig = setupChart(svgId, 600, 275);
    // ... restul logicii renderProgressChart ...
    // Asigură-te că populezi sourceSelectElement corect
};

// --- Logică Dashboard ---
const displayPersonalRecords = () => {
    personalRecordsList.innerHTML = ''; // Clear previous entries
    const sortedPrs = Object.entries(personalRecords)
        // Sortează după e1RM desc, apoi maxWeight desc
        .sort(([, a], [, b]) => (b.maxE1rm || 0) - (a.maxE1rm || 0) || (b.maxWeight || 0) - (a.maxWeight || 0))
        .slice(0, 5); // Afișează top 5

    if (sortedPrs.length === 0) {
        if(noPrMessage) noPrMessage.style.display = 'list-item'; // Afișează mesajul default
        return;
    }

    if(noPrMessage) noPrMessage.style.display = 'none'; // Ascunde mesajul default

    sortedPrs.forEach(([exercise, pr]) => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <span class="pr-exercise">${exercise}</span>
            <span class="pr-details float-end">
                 <span class="pr-value">${formatNumber(pr.maxE1rm, 1)}kg</span><span class="pr-type">(e1RM)</span> /
                 <span class="pr-value">${formatNumber(pr.maxWeight, 1)}kg</span><span class="pr-type">(Max)</span>
            </span>
        `;
        personalRecordsList.appendChild(li);
    });
};

const updateDashboard = (period) => {
    // ... (calcul statistici - rămâne la fel) ...

    // Actualizează elementele HTML cu statisticile
    statsExercises.textContent = totalExercises;
    // ... (restul statisticilor) ...
    weeklyAvgWorkouts.textContent = formatNumber(avgWorkoutsPerWeek, 1);
    // ... (restul mediilor) ...

    // Afișează PR-urile
    displayPersonalRecords();

    // Actualizează graficele din Dashboard
    renderMusclesChart(filteredWorkouts);
    renderVolumeChart(d3VolumeChartDashEl); // Pasează elementul corect
    renderProgressChart(progressExerciseSelectDash.value, d3ProgressChartDashEl, progressExerciseSelectDash); // Pasează elementele corecte
};

// --- Logică Tab Setări ---
const setupSettingsTab = () => {
    // ... (legare adăugare/ștergere exercițiu la butoane/liste ...Settings) ...
     addNewExerciseBtnSettings.addEventListener('click', () => { /* ... folosind newExerciseNameSettings */ });
     backupDataBtnSettings.addEventListener('click', handleBackup);
     restoreFileInputSettings.addEventListener('change', handleRestore);

     // NOU: Legare butoane export
     exportCSVSettingsBtn.addEventListener('click', () => { /* ... logica export CSV ... */ });
     exportTXTSettingsBtn.addEventListener('click', () => { /* ... logica export TXT ... */ });
     exportPDFSettingsBtn.addEventListener('click', () => { /* ... logica export PDF ... */ });

     renderExistingExercisesList(existingExercisesListSettings); // Afișează lista inițială
};


// --- Inițializare & UI Refresh ---
const refreshUI = () => {
    renderTable(); // Întotdeauna actualizăm tabelul
    populateExerciseSelects(); // Actualizăm toate select-urile
    renderExistingExercisesList(existingExercisesListSettings); // Actualizăm lista din Setări

    // Actualizăm dashboard/grafice DOAR dacă tab-ul relevant este activ
    const activeTabId = document.querySelector('.tab-content.active')?.id;
    if (activeTabId === 'dashboardTabContent') {
        updateDashboard(dashboardPeriodSelect.value);
    }
    // Graficele din Log nu mai există, deci nu mai trebuie actualizate aici
};

const initializeApp = () => {
    console.log("Initializing App vNext...");
    setupD3Tooltip();
    dateInput.valueAsDate = new Date();

    workouts = loadData(WORKOUTS_KEY, []);
    customExercises = loadData(CUSTOM_EXERCISES_KEY, []);
    personalRecords = loadData(PRS_KEY, {});

    loadAndCombineExercises(); // Combină listele (nu mai e async)
    setupSettingsTab(); // Leagă evenimentele din Setări **înainte** de primul refreshUI

    // Populăm selectul de progres din Dashboard inițial
     const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
     progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
     exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const option = document.createElement('option'); option.value = ex; option.textContent = ex; progressExerciseSelectDash.appendChild(option); } });
     // Listener pentru selectul de progres din Dashboard
     progressExerciseSelectDash.addEventListener('change', (e) => { renderProgressChart(e.target.value, d3ProgressChartDashEl, progressExerciseSelectDash); });


    refreshUI(); // Randează tot UI-ul inițial

    setActiveTab('logTabContent'); // Setează tab-ul inițial

    console.log("App Initialized.");
};

// ... (Restul codului, inclusiv listenerii de filtre/sortare din Log etc.) ...

// Start App
try { initializeApp(); } catch (error) { /* ... (error handling) ... */ }

}); // DOMContentLoaded End
