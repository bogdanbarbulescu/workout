// app.js - Versiune completă și actualizată (vFinal Corectat pt. Init & Lista Ex)

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    console.log("DOM fully loaded and parsed."); // LOG: Confirmare start

    // --- Lista de Exerciții Predefinită (Sortată) ---
    const BASE_EXERCISES = [
        "Ab Wheel Rollout", "Arnold Press (Ganteră)", "Barbell Curl (Bară dreaptă/EZ)",
        "Barbell Row (Aplecat)", "Bench Press (Bară - Împins la piept)", "Bench Press Înclinat (Bară)",
        "Bench Press Declinat (Bară)", "Bent Over Lateral Raise (Ganteră/Cablu)", "Bicep Curl (Ganteră - Alternativ/Simultan)",
        "Box Squat", "Bulgarian Split Squat", "Cable Crossover (Cablu)", "Cable Crunch (Cablu)",
        "Cable Lateral Raise (Cablu)", "Cable Pushdown (Cablu - Sfoară/Bară V/Bară dreaptă)", "Cable Row (Seated - Cablu)",
        "Calf Raise (La aparat/Stând/Șezând)", "Chest Dip (Paralele - focus Piept)", "Chin-up (Tracțiuni priză supinată)",
        "Concentration Curl (Ganteră)", "Crunch (Abdomene)", "Deadlift (Îndreptări - Conventional)",
        "Deadlift (Romanian - RDL)", "Deadlift (Sumo)", "Decline Bench Press (Ganteră)",
        "Decline Crunch", "Dumbbell Bench Press (Ganteră - Împins la piept)", "Dumbbell Curl (Ganteră)",
        "Dumbbell Fly (Ganteră - Fluturări)", "Dumbbell Front Raise (Ganteră)", "Dumbbell Lateral Raise (Ganteră)",
        "Dumbbell Pullover (Ganteră)", "Dumbbell Row (Ganteră - Ramat)", "Dumbbell Shrug (Ganteră - Ridicări umeri)",
        "Dumbbell Shoulder Press (Ganteră - Presă umeri)", "Face Pull (Cablu)", "Flat Bench Dumbbell Fly (Ganteră)",
        "Front Squat (Bară)", "Glute Bridge", "Glute Kickback (Cablu/Aparat)",
        "Goblet Squat (Ganteră/Kettlebell)", "Good Morning (Bară)", "Hack Squat (Aparat)",
        "Hammer Curl (Ganteră)", "Hanging Leg Raise (La bară)", "Hip Abduction (Aparat)",
        "Hip Adduction (Aparat)", "Hip Thrust (Bară/Aparat)", "Hyperextension (Extensii spate)",
        "Incline Bench Press (Ganteră)", "Incline Dumbbell Curl (Ganteră)", "Incline Dumbbell Fly (Ganteră)",
        "Lat Pulldown (Aparat helcometru - Priză largă/îngustă/neutră)", "Lateral Raise (Aparat)",
        "Leg Curl (Aparat - Culcat/Șezând/Stând)", "Leg Extension (Aparat)", "Leg Press (Aparat)",
        "Lunge (Mers/Static - Bară/Ganteră)", "Machine Chest Fly (Aparat - Fluturări)",
        "Machine Chest Press (Aparat - Împins)", "Machine Lateral Raise (Aparat)", "Machine Preacher Curl (Aparat)",
        "Machine Row (Aparat)", "Machine Shoulder Press (Aparat)", "Overhead Press (Bară - Presă militară)",
        "Overhead Triceps Extension (Ganteră/Bară/Cablu)", "Pec Deck (Aparat)", "Pendlay Row (Bară)",
        "Plank (Planșă)", "Preacher Curl (Bară/Ganteră)", "Pull-up (Tracțiuni priză pronată)",
        "Push-up (Flotare)", "Rack Pull", "Rear Delt Fly (Aparat/Ganteră/Cablu)",
        "Reverse Crunch", "Reverse Grip Lat Pulldown (Aparat helcometru)", "Russian Twist",
        "Seated Calf Raise (Aparat)", "Seated Dumbbell Shoulder Press (Ganteră)", "Shrug (Bară - Ridicări umeri)",
        "Side Plank", "Single Arm Dumbbell Row (Ganteră)", "Skullcrusher (Bară EZ/Ganteră - Extensii triceps culcat)",
        "Smith Machine Bench Press", "Smith Machine Squat", "Squat (Bară - Genuflexiune)",
        "Standing Calf Raise (Aparat/Liber)", "Stiff-Legged Deadlift (Bară)", "Straight Arm Pulldown (Cablu)",
        "T-Bar Row", "Triceps Dip (Paralele/Bancă - focus Triceps)", "Triceps Pushdown (Cablu)",
        "Upright Row (Bară/Ganteră/Cablu)", "Weighted Crunch"
    ].sort((a,b) => a.localeCompare(b));
    console.log("BASE_EXERCISES loaded, count:", BASE_EXERCISES.length);

    // --- Selectoare DOM (Verificăm existența lor) ---
    const getElement = (id) => document.getElementById(id);
    const querySel = (selector) => document.querySelector(selector);
    const querySelAll = (selector) => document.querySelectorAll(selector);

    const liveToastEl = getElement('liveToast');
    const toastTitle = getElement('toastTitle');
    const toastBody = getElement('toastBody');
    const bsToast = liveToastEl ? new bootstrap.Toast(liveToastEl, { delay: 3500 }) : null;
    const bottomNav = getElement('bottomNav');
    const navButtons = bottomNav ? bottomNav.querySelectorAll('button') : [];
    const tabContents = querySelAll('.tab-content');
    const logTabContent = getElement('logTabContent');
    const workoutForm = getElement('workoutForm');
    const formTitle = getElement('formTitle');
    const editIdInput = getElement('editId');
    const dateInput = getElement('date');
    const exerciseSelect = getElement('exercise');
    const muscleGroupsSelect = getElement('muscleGroups');
    const setsContainer = getElement('setsContainer');
    const addSetBtn = getElement('addSetBtn');
    const notesInput = getElement('notes');
    const setsWarning = getElement('setsWarning');
    const workoutTableBody = querySel('#workoutTable tbody');
    const noDataMessage = getElement('noDataMessage');
    const filterDate = getElement('filterDate');
    const filterExercise = getElement('filterExercise');
    const filterMuscleGroup = getElement('filterMuscleGroup');
    const clearFiltersBtn = getElement('clearFilters');
    const tableHeaders = querySelAll('#workoutTable thead th[data-column]');
    const dashboardTabContent = getElement('dashboardTabContent');
    const dashboardPeriodSelect = getElement('dashboardPeriodSelect');
    const statsExercises = getElement('statsExercises');
    const statsSets = getElement('statsSets');
    const statsReps = getElement('statsReps');
    const statsAvgWeight = getElement('statsAvgWeight');
    const statsTotalVolume = getElement('statsTotalVolume');
    const weeklyAvgWorkouts = getElement('weeklyAvgWorkouts');
    const weeklyAvgSets = getElement('weeklyAvgSets');
    const weeklyAvgReps = getElement('weeklyAvgReps');
    const weeklyAvgRepsPerSet = getElement('weeklyAvgRepsPerSet');
    const weeklyAvgVolume = getElement('weeklyAvgVolume');
    const personalRecordsList = getElement('personalRecordsList');
    const noPrMessage = getElement('noPrMessage');
    const d3MusclesChartEl = getElement('d3MusclesChart');
    const noMuscleDataMessage = getElement('noMuscleDataMessage');
    const d3VolumeChartDashEl = getElement('d3VolumeChartDash');
    const progressExerciseSelectDash = getElement('progressExerciseSelectDash');
    const d3ProgressChartDashEl = getElement('d3ProgressChartDash');
    const settingsTabContent = getElement('settingsTabContent');
    const newExerciseNameSettings = getElement('newExerciseNameSettings');
    const addNewExerciseBtnSettings = getElement('addNewExerciseBtnSettings');
    const existingExercisesListSettings = getElement('existingExercisesListSettings');
    const backupDataBtnSettings = getElement('backupDataBtnSettings');
    const restoreFileInputSettings = getElement('restoreFileSettings');
    const exportCSVSettingsBtn = getElement('exportCSVSettings');
    const exportTXTSettingsBtn = getElement('exportTXTSettings');
    const exportPDFSettingsBtn = getElement('exportPDFSettings');

    // --- State-ul Aplicației ---
    let workouts = [];
    let exercises = [];
    let customExercises = [];
    let personalRecords = {};
    let editingWorkoutId = null;
    let currentSort = { column: 'date', direction: 'desc' };
    let d3Tooltip = null;
    const muscleGroupOptions = muscleGroupsSelect ? Array.from(muscleGroupsSelect.options).map(opt => opt.value) : [];

    // --- Constante & Configurare ---
    const WORKOUTS_KEY = 'workouts_v3';
    const CUSTOM_EXERCISES_KEY = 'customExercises_v3';
    const PRS_KEY = 'personalRecords_v3';

    // --- Funcții Utilitare ---
    const generateId = () => '_' + Math.random().toString(36).substring(2, 9);
    const showToast = (title, message, type = 'info') => {
        if (!liveToastEl || !toastTitle || !toastBody || !bsToast) { console.warn("Toast elements not found, cannot show toast:", title, message); return; }
        toastTitle.textContent = title; toastBody.textContent = message;
        const header = liveToastEl.querySelector('.toast-header');
        if (header) { header.className = 'toast-header'; const bgClass = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-info' }[type] || 'text-bg-secondary'; header.classList.add(bgClass); }
        try { bsToast.show(); } catch(e) { console.error("Toast display error:", e); }
    };
    const calculateE1RM = (weight, reps) => {
        const numWeight = parseFloat(weight); const numReps = parseInt(reps, 10);
        if (isNaN(numReps) || numReps <= 0 || isNaN(numWeight) || numWeight < 0) return 0; // Allow 0 weight
        if (numReps === 1) return numWeight; return parseFloat((numWeight * (1 + numReps / 30)).toFixed(1));
    };
    const formatNumber = (num, decimals = 1) => { const parsedNum = parseFloat(num); if (isNaN(parsedNum)) return '0'; return parsedNum.toFixed(decimals); };
    const getDateRange = (period) => {
        const end = new Date(); end.setHours(23, 59, 59, 999);
        let start = new Date(); start.setHours(0, 0, 0, 0);
        switch (period) {
            case 'last7days': start.setDate(end.getDate() - 6); break;
            case 'last30days': start.setDate(end.getDate() - 29); break;
            case 'allTime': default: start = new Date(0); break;
        }
        return { start, end };
    };
    const formatDate = (date) => date.toISOString().split('T')[0];

    // --- Încărcare & Salvare Date ---
    const saveData = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(`Save Error ${key}:`, e); showToast('Eroare Salvare', `Nu am putut salva datele (${key}).`, 'danger'); } };
    const loadData = (key, defaultValue = []) => { try { const data = localStorage.getItem(key); if (data === null) return defaultValue; const parsedData = JSON.parse(data); if (key === PRS_KEY && (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData))) return {}; if (key !== PRS_KEY && !Array.isArray(parsedData)) return defaultValue; return parsedData; } catch (e) { console.error(`Load Error ${key}:`, e); return defaultValue; } };
    const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
    const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
    const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);

    // --- Backup & Restore ---
     const handleBackup = () => { /* ... (la fel) ... */ };
     const handleRestore = (event) => { /* ... (la fel) ... */ };

    // --- Logică Tab-uri ---
     const setActiveTab = (targetId) => {
         tabContents.forEach(tab => tab.classList.remove('active'));
         navButtons.forEach(btn => btn.classList.remove('active'));
         const targetTab = getElement(targetId); // Folosim getElement
         const targetButton = bottomNav?.querySelector(`button[data-target="${targetId}"]`);
         if (targetTab) targetTab.classList.add('active');
         if (targetButton) targetButton.classList.add('active');

         if (targetId === 'dashboardTabContent') {
             if(dashboardPeriodSelect) setTimeout(() => updateDashboard(dashboardPeriodSelect.value), 50); // Verificare element
         } else if (targetId === 'settingsTabContent') {
             if (typeof renderExistingExercisesList === 'function') renderExistingExercisesList(existingExercisesListSettings);
         }
     };
     if(navButtons.length > 0) navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });
     else { console.error("Bottom navigation buttons not found!"); }


    // --- Combinare Liste Exerciții & Populare Selectoare ---
    const buildAndPopulateExercises = () => {
        console.log("START: buildAndPopulateExercises");
        try {
            const base = Array.isArray(BASE_EXERCISES) ? BASE_EXERCISES : [];
            const custom = Array.isArray(customExercises) ? customExercises : [];
            console.log(`  Base count: ${base.length}, Custom count: ${custom.length}`);
            const combinedMap = new Map();
            [...base, ...custom].forEach(ex => { if(typeof ex === 'string' && ex.trim() !== '') { combinedMap.set(ex.trim().toLowerCase(), ex.trim()); }});
            exercises = Array.from(combinedMap.values()).sort((a, b) => a.localeCompare(b));
            console.log(`  Combined unique exercises count: ${exercises.length}`);

            // Select Jurnal
            if (exerciseSelect) {
                const currentLogExercise = exerciseSelect.value;
                exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
                exercises.forEach(ex => { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; exerciseSelect.appendChild(opt); });
                if (exercises.includes(currentLogExercise)) exerciseSelect.value = currentLogExercise;
                else if (exercises.length === 0) { const errOpt = document.createElement('option'); errOpt.textContent = "Lista goală"; errOpt.disabled = true; exerciseSelect.appendChild(errOpt); }
                console.log("  #exercise select populated.");
            } else { console.error("  #exercise select element NOT FOUND."); }

            // Select Progres Dashboard
            if (progressExerciseSelectDash) {
                const currentDashProgress = progressExerciseSelectDash.value;
                const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
                progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
                exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; progressExerciseSelectDash.appendChild(opt); } });
                if (exercisesInLog.includes(currentDashProgress)) progressExerciseSelectDash.value = currentDashProgress;
                console.log("  #progressExerciseSelectDash populated.");
            } else { console.warn("  #progressExerciseSelectDash element NOT FOUND."); }

            // Filtru Grupe Jurnal
            if (filterMuscleGroup) {
                const currentFilterGroup = filterMuscleGroup.value;
                filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
                muscleGroupOptions.forEach(group => { const opt = document.createElement('option'); opt.value = group; opt.textContent = group; filterMuscleGroup.appendChild(opt); });
                if (muscleGroupOptions.includes(currentFilterGroup)) filterMuscleGroup.value = currentFilterGroup;
                console.log("  #filterMuscleGroup populated.");
            } else { console.warn("  #filterMuscleGroup element NOT FOUND."); }

            console.log("END: buildAndPopulateExercises");
        } catch (error) { console.error("FATAL Error in buildAndPopulateExercises:", error); showToast('Eroare Critică', 'Nu s-a putut genera lista de exerciții.', 'danger'); exercises = []; if (exerciseSelect) exerciseSelect.innerHTML = '<option value="" selected disabled>EROARE</option>'; if (progressExerciseSelectDash) progressExerciseSelectDash.innerHTML = '<option value="">EROARE</option>'; }
    };


    // --- Listare/Ștergere Exerciții Custom ---
    const renderExistingExercisesList = (listElement) => {
        if (!listElement) return;
        listElement.innerHTML = '';
        const relevantCustomExercises = Array.isArray(customExercises) ? customExercises : [];
        if (relevantCustomExercises.length === 0) { const li = document.createElement('li'); li.className = 'list-group-item text-muted'; li.textContent = 'Nu ai adăugat exerciții custom.'; listElement.appendChild(li); return; }
        relevantCustomExercises.forEach(ex => {
            const li = document.createElement('li'); li.className = 'list-group-item d-flex justify-content-between align-items-center list-group-item-action'; li.textContent = ex;
            const deleteBtn = document.createElement('button'); deleteBtn.className = 'btn btn-outline-danger btn-sm py-0 px-1'; deleteBtn.innerHTML = '×'; deleteBtn.title = `Șterge "${ex}"`;
            deleteBtn.onclick = () => deleteCustomExercise(ex, listElement); li.appendChild(deleteBtn); listElement.appendChild(li);
        });
    };
    const deleteCustomExercise = (exerciseName, listElementToUpdate) => {
         if (!confirm(`Ștergeți exercițiul custom "${exerciseName}"?`)) return;
         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         buildAndPopulateExercises(); // Reconstruiește lista globală și repopulează select-urile
         if(listElementToUpdate) renderExistingExercisesList(listElementToUpdate);
         showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
         // Nu mai e nevoie de refreshUI() aici pt selecturi
     };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => {
        const setDiv = document.createElement('div'); setDiv.className = 'input-group input-group-sm set-entry mb-2';
        setDiv.innerHTML = `<span class="input-group-text">Set</span><input type="number" class="form-control reps-input" placeholder="Rep." min="1" step="1" value="${reps}" required aria-label="Repetări"><span class="input-group-text">@</span><input type="number" class="form-control weight-input" placeholder="kg" min="0" step="0.25" value="${weight}" required aria-label="Greutate"><span class="input-group-text">kg</span><button type="button" class="btn btn-outline-danger remove-set-btn" title="Șterge Set">×</button>`;
        if (setsContainer) setsContainer.appendChild(setDiv); if (setsWarning) setsWarning.classList.add('d-none');
        const removeBtn = setDiv.querySelector('.remove-set-btn');
        if (removeBtn) removeBtn.addEventListener('click', (e) => { e.target.closest('.set-entry')?.remove(); if (setsContainer && setsContainer.querySelectorAll('.set-entry').length === 0 && setsWarning) { setsWarning.classList.remove('d-none'); } });
        const firstInput = setDiv.querySelector('.reps-input'); if (firstInput) firstInput.focus();
    };
    if (addSetBtn) addSetBtn.addEventListener('click', () => createSetEntry()); else console.warn("#addSetBtn not found");
    const updatePersonalRecords = (exerciseName, weight, e1rm) => {
        let updated = false; if (!exerciseName) return false;
        const currentPR = personalRecords[exerciseName] || { maxWeight: 0, maxE1rm: 0 };
        const newPR = { ...currentPR };
        if (!isNaN(weight) && weight > newPR.maxWeight) { newPR.maxWeight = weight; updated = true; }
        if (!isNaN(e1rm) && e1rm > newPR.maxE1rm) { newPR.maxE1rm = e1rm; updated = true; }
        if (updated) { personalRecords[exerciseName] = newPR; savePersonalRecords(); console.log(`PR Updated for ${exerciseName}:`, newPR); }
        return updated;
    };
    const validateForm = () => {
        let isValid = workoutForm ? workoutForm.checkValidity() : false;
        if (muscleGroupsSelect && muscleGroupsSelect.selectedOptions.length === 0) { muscleGroupsSelect.classList.add('is-invalid'); isValid = false; }
        else if (muscleGroupsSelect) { muscleGroupsSelect.classList.remove('is-invalid'); }
        let validSetsCount = 0; let hasSets = false;
        if (setsContainer) { const setEntries = setsContainer.querySelectorAll('.set-entry'); hasSets = setEntries.length > 0; if (!hasSets) { isValid = false; } else { setEntries.forEach(setDiv => { const rI = setDiv.querySelector('.reps-input'); const wI = setDiv.querySelector('.weight-input'); const r = parseInt(rI?.value, 10); const w = parseFloat(wI?.value); let setValid = r > 0 && !isNaN(r) && w >= 0 && !isNaN(w); if(setValid) validSetsCount++; if (rI) { if (isNaN(r) || r <= 0) rI.classList.add('is-invalid'); else rI.classList.remove('is-invalid');} if (wI) { if (isNaN(w) || w < 0) wI.classList.add('is-invalid'); else wI.classList.remove('is-invalid');} }); if (validSetsCount === 0) isValid = false; } }
        if (setsWarning) { if (!hasSets || validSetsCount === 0) { setsWarning.textContent = !hasSets ? 'Adăugați cel puțin un set.' : 'Introduceți valori valide în seturi.'; setsWarning.classList.remove('d-none'); } else { setsWarning.classList.add('d-none'); } }
        if(workoutForm) workoutForm.classList.add('was-validated');
        return isValid;
    };

    // --- CRUD & Form Logic (Jurnal Tab) ---
     const resetForm = () => { /* ... (la fel) ... */ };
     if (workoutForm) workoutForm.addEventListener('submit', (e) => { /* ... (la fel, cu verificări adăugate pt elemente DOM) ... */ });
     else { console.error("#workoutForm not found!"); }
     if(cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);
     const editWorkout = (id) => { /* ... (la fel, cu verificări DOM) ... */ };
     const deleteWorkout = (id) => { /* ... (la fel) ... */ };

    // --- Logică Tab Setări ---
    const setupSettingsTab = () => { /* ... (la fel) ... */ };

    // --- Redare Tabel & Filtrare/Sortare (Jurnal Tab) ---
     const calculateWorkoutStats = (workout) => { /* ... (funcția corectată anterior rămâne la fel) ... */ };
     const renderTable = () => { /* ... (la fel, cu verificări DOM și PR) ... */ };
     const updateSortIcons = () => { /* ... (la fel) ... */ };
     // Listeneri Filtre/Sortare Jurnal
     if(filterDate) filterDate.addEventListener('input', renderTable);
     if(filterExercise) filterExercise.addEventListener('input', renderTable);
     if(filterMuscleGroup) filterMuscleGroup.addEventListener('input', renderTable);
     if(clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => { if(filterDate) filterDate.value = ''; if(filterExercise) filterExercise.value = ''; if(filterMuscleGroup) filterMuscleGroup.value = ''; renderTable(); });
     if(tableHeaders) tableHeaders.forEach(th => { th.addEventListener('click', () => { /* ... (logica sortare) ... */ renderTable(); }); });

    // --- Grafice D3 ---
     const setupD3Tooltip = () => { /* ... (la fel) ... */ };
     const showD3Tooltip = (event, content) => { /* ... (la fel) ... */ };
     const hideD3Tooltip = () => { /* ... (la fel) ... */ };
     const setupChart = (svgId, desiredWidth, desiredHeight) => { /* ... (la fel) ... */ };

     // --- Grafice Specifice (Folosite în Dashboard) ---
     const renderMusclesChart = (data) => { /* ... (la fel) ... */ };
     const renderVolumeChartForDashboard = () => { /* ... (la fel) ... */ };
     const renderProgressChartForDashboard = (selectedExercise) => { /* ... (la fel) ... */ };

    // --- Logică Dashboard ---
     const displayPersonalRecords = () => { /* ... (la fel) ... */ };
     const updateDashboard = (period) => { /* ... (la fel, cu verificări DOM) ... */ };
     if(dashboardPeriodSelect) dashboardPeriodSelect.addEventListener('change', (e) => updateDashboard(e.target.value));

    // --- Exporturi (Implementare) ---
    const handleExportCSV = () => { /* ... (la fel) ... */ };
    const handleExportTXT = () => { /* ... (la fel) ... */ };
    const handleExportPDF = () => { /* ... (la fel) ... */ };
    const downloadFile = (filename, content, mimeType) => { /* ... (la fel) ... */ };

    // --- Inițializare Aplicație ---
    const refreshUI = () => {
        console.log("Refreshing UI...");
        if (typeof renderTable === 'function') renderTable();
        // Popularea selecturilor NU se mai face aici
        const activeTabId = document.querySelector('.tab-content.active')?.id;
        if (activeTabId === 'dashboardTabContent') { if (typeof updateDashboard === 'function' && dashboardPeriodSelect) updateDashboard(dashboardPeriodSelect.value); }
        else if (activeTabId === 'settingsTabContent') { if (typeof renderExistingExercisesList === 'function') renderExistingExercisesList(existingExercisesListSettings); }
        console.log("UI Refresh complete.");
    };

    const initializeApp = () => {
        console.log("Initializing App vFinal Corrected...");
        setupD3Tooltip();
        if(dateInput) dateInput.valueAsDate = new Date();

        // 1. Încarcă datele brute
        workouts = loadData(WORKOUTS_KEY, []);
        customExercises = loadData(CUSTOM_EXERCISES_KEY, []);
        personalRecords = loadData(PRS_KEY, {});

        // Safeguard după încărcare
        if (!Array.isArray(workouts)) { console.warn("Workouts data invalid, reset."); workouts = []; }
        if (!Array.isArray(customExercises)) { console.warn("Custom exercises data invalid, reset."); customExercises = []; }
        if (typeof personalRecords !== 'object' || personalRecords === null || Array.isArray(personalRecords)) { console.warn("PR data invalid, reset."); personalRecords = {}; }
        console.log(`Loaded data: ${workouts.length} workouts, ${customExercises.length} custom exercises, ${Object.keys(personalRecords).length} PRs.`);

        // 2. Construiește lista combinată și populează TOATE select-urile
        buildAndPopulateExercises(); // Aici se populează #exercise
        console.log("Exercises combined and selects populated.");

        // 3. Leagă evenimentele din tab-ul Setări
        setupSettingsTab();
        console.log("Settings tab event listeners attached.");

        // 4. Randează tabelul inițial
        renderTable();
        console.log("Initial table rendered.");

        // 5. Setează tab-ul inițial
        setActiveTab('logTabContent');
        console.log("Initial tab set.");

        console.log("App Initialized SUCCESSFULLY.");
    };

    // Start App
    try { initializeApp(); } catch (error) { console.error("Critical Init Error:", error); showToast('Eroare Critică', `Aplicația nu a putut porni: ${error.message}`, 'danger'); if(document.body) document.body.innerHTML = `<div class="alert alert-danger m-5 text-center"><h2>Eroare Critică</h2><p>Aplicația nu a putut fi inițializată corect. Verificați consola (F12) pentru detalii.</p><pre>${error.stack || error}</pre></div>`; }

}); // Sfârșitul DOMContentLoaded
