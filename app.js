// app.js - Versiune completă și actualizată (vFinal Corectat pt. Save Bug)

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

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

    // --- Selectoare DOM ---
    const liveToastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = liveToastEl ? new bootstrap.Toast(liveToastEl, { delay: 3500 }) : null;
    const bottomNav = document.getElementById('bottomNav');
    const navButtons = bottomNav ? bottomNav.querySelectorAll('button') : [];
    const tabContents = document.querySelectorAll('.tab-content');
    const logTabContent = document.getElementById('logTabContent');
    const workoutForm = document.getElementById('workoutForm');
    const formTitle = document.getElementById('formTitle');
    const editIdInput = document.getElementById('editId');
    const dateInput = document.getElementById('date');
    const exerciseSelect = document.getElementById('exercise');
    const muscleGroupsSelect = document.getElementById('muscleGroups');
    const setsContainer = document.getElementById('setsContainer');
    const addSetBtn = document.getElementById('addSetBtn');
    const notesInput = document.getElementById('notes');
    const setsWarning = document.getElementById('setsWarning');
    const workoutTableBody = document.querySelector('#workoutTable tbody');
    const noDataMessage = document.getElementById('noDataMessage');
    const filterDate = document.getElementById('filterDate');
    const filterExercise = document.getElementById('filterExercise');
    const filterMuscleGroup = document.getElementById('filterMuscleGroup');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const tableHeaders = document.querySelectorAll('#workoutTable thead th[data-column]');
    const dashboardTabContent = document.getElementById('dashboardTabContent');
    const dashboardPeriodSelect = document.getElementById('dashboardPeriodSelect');
    const statsExercises = document.getElementById('statsExercises');
    const statsSets = document.getElementById('statsSets');
    const statsReps = document.getElementById('statsReps');
    const statsAvgWeight = document.getElementById('statsAvgWeight');
    const statsTotalVolume = document.getElementById('statsTotalVolume');
    const weeklyAvgWorkouts = document.getElementById('weeklyAvgWorkouts');
    const weeklyAvgSets = document.getElementById('weeklyAvgSets');
    const weeklyAvgReps = document.getElementById('weeklyAvgReps');
    const weeklyAvgRepsPerSet = document.getElementById('weeklyAvgRepsPerSet');
    const weeklyAvgVolume = document.getElementById('weeklyAvgVolume');
    const personalRecordsList = document.getElementById('personalRecordsList');
    const noPrMessage = document.getElementById('noPrMessage');
    const d3MusclesChartEl = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const d3VolumeChartDashEl = document.getElementById('d3VolumeChartDash');
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');
    const d3ProgressChartDashEl = document.getElementById('d3ProgressChartDash');
    const settingsTabContent = document.getElementById('settingsTabContent');
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileInputSettings = document.getElementById('restoreFileSettings');
    const exportCSVSettingsBtn = document.getElementById('exportCSVSettings');
    const exportTXTSettingsBtn = document.getElementById('exportTXTSettings');
    const exportPDFSettingsBtn = document.getElementById('exportPDFSettings');

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
        if (!liveToastEl || !toastTitle || !toastBody || !bsToast) return;
        toastTitle.textContent = title; toastBody.textContent = message;
        const header = liveToastEl.querySelector('.toast-header');
        if (header) { header.className = 'toast-header'; const bgClass = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-info' }[type] || 'text-bg-secondary'; header.classList.add(bgClass); }
        try { bsToast.show(); } catch(e) { console.error("Toast error:", e); }
    };
    const calculateE1RM = (weight, reps) => {
        const numWeight = parseFloat(weight); const numReps = parseInt(reps, 10);
        if (isNaN(numReps) || numReps <= 0 || isNaN(numWeight) || numWeight <= 0) return 0;
        if (numReps === 1) return numWeight; return parseFloat((numWeight * (1 + numReps / 30)).toFixed(1));
    };
    const formatNumber = (num, decimals = 1) => { const parsedNum = parseFloat(num); if (isNaN(parsedNum)) return '0'; return parsedNum.toFixed(decimals); };
    const getDateRange = (period) => { /* ... (la fel) ... */ };
    const formatDate = (date) => date.toISOString().split('T')[0];

    // --- Încărcare & Salvare Date ---
    const saveData = (key, data) => { /* ... (la fel) ... */ };
    const loadData = (key, defaultValue = []) => { /* ... (la fel) ... */ };
    const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
    const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
    const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);

    // --- Backup & Restore ---
     const handleBackup = () => { /* ... (la fel) ... */ };
     const handleRestore = (event) => { /* ... (la fel) ... */ };

    // --- Logică Tab-uri ---
     const setActiveTab = (targetId) => { /* ... (la fel) ... */ };
     if(navButtons) navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });


    // --- Combinare Liste Exerciții ---
    const loadAndCombineExercises = () => { /* ... (la fel) ... */ };

    // --- Populare Selectoare ---
     const populateExerciseSelects = () => { /* ... (la fel) ... */ };

    // --- Listare/Ștergere Exerciții Custom ---
    const renderExistingExercisesList = (listElement) => { /* ... (la fel) ... */ };
    const deleteCustomExercise = (exerciseName, listElementToUpdate) => { /* ... (la fel) ... */ };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => {
         const setDiv = document.createElement('div'); setDiv.className = 'input-group input-group-sm set-entry mb-2';
         setDiv.innerHTML = `<span class="input-group-text">Set</span><input type="number" class="form-control reps-input" placeholder="Rep." min="1" step="1" value="${reps}" required aria-label="Repetări"><span class="input-group-text">@</span><input type="number" class="form-control weight-input" placeholder="kg" min="0" step="0.25" value="${weight}" required aria-label="Greutate"><span class="input-group-text">kg</span><button type="button" class="btn btn-outline-danger remove-set-btn" title="Șterge Set">×</button>`;
         if (setsContainer) setsContainer.appendChild(setDiv); if (setsWarning) setsWarning.classList.add('d-none');
         const removeBtn = setDiv.querySelector('.remove-set-btn');
         if (removeBtn) removeBtn.addEventListener('click', (e) => { e.target.closest('.set-entry')?.remove(); if (setsContainer && setsContainer.querySelectorAll('.set-entry').length === 0 && setsWarning) { setsWarning.classList.remove('d-none'); } });
         const firstInput = setDiv.querySelector('.reps-input'); if (firstInput) firstInput.focus();
    };
     if (addSetBtn) addSetBtn.addEventListener('click', () => createSetEntry());
     const updatePersonalRecords = (exerciseName, weight, e1rm) => { /* ... (la fel) ... */ };
     const validateForm = () => {
        let isValid = workoutForm ? workoutForm.checkValidity() : false;
        if (muscleGroupsSelect && muscleGroupsSelect.selectedOptions.length === 0) { muscleGroupsSelect.classList.add('is-invalid'); isValid = false; }
        else if (muscleGroupsSelect) { muscleGroupsSelect.classList.remove('is-invalid'); }
        let validSetsCount = 0;
        if (setsContainer) { const setEntries = setsContainer.querySelectorAll('.set-entry'); if (setEntries.length === 0) { isValid = false; if(setsWarning) setsWarning.classList.remove('d-none'); } else { setEntries.forEach(setDiv => { const rI = setDiv.querySelector('.reps-input'); const wI = setDiv.querySelector('.weight-input'); const r = parseInt(rI?.value, 10); const w = parseFloat(wI?.value); if (r > 0 && !isNaN(r) && w >= 0 && !isNaN(w)) { validSetsCount++; rI?.classList.remove('is-invalid'); wI?.classList.remove('is-invalid'); } else { if (isNaN(r) || r <= 0) rI?.classList.add('is-invalid'); else rI?.classList.remove('is-invalid'); if (isNaN(w) || w < 0) wI?.classList.add('is-invalid'); else wI?.classList.remove('is-invalid'); } }); if (validSetsCount === 0) isValid = false; } }
        if (!isValid && setsWarning && validSetsCount === 0 && setsContainer?.querySelectorAll('.set-entry').length > 0) { setsWarning.textContent = 'Introduceți valori valide în seturi.'; setsWarning.classList.remove('d-none'); }
        else if (isValid && setsWarning) { setsWarning.classList.add('d-none'); }
        if(workoutForm) workoutForm.classList.add('was-validated');
        return isValid;
    };

    // --- CRUD & Form Logic (Jurnal Tab) ---
     const resetForm = () => { /* ... (la fel) ... */ };
     if (workoutForm) workoutForm.addEventListener('submit', (e) => {
        e.preventDefault(); e.stopPropagation();
        console.log("Form submitted. Validating..."); // LOG: Confirmare submit
        if (!validateForm()) { showToast('Eroare Formular', 'Verificați câmpurile și adăugați seturi valide.', 'warning'); console.log("Validation failed."); return; }
        console.log("Validation passed.");

        const setsData = []; let currentMaxWeight = 0; let currentMaxE1rm = 0; let newPrDetected = false;
        if(setsContainer) setsContainer.querySelectorAll('.set-entry').forEach(setDiv => {
            const reps = parseInt(setDiv.querySelector('.reps-input')?.value, 10); const weight = parseFloat(setDiv.querySelector('.weight-input')?.value);
            if (reps > 0 && !isNaN(reps) && weight >= 0 && !isNaN(weight)) { const e1rm = calculateE1RM(weight, reps); setsData.push({ reps, weight, e1rm }); currentMaxWeight = Math.max(currentMaxWeight, weight); currentMaxE1rm = Math.max(currentMaxE1rm, e1rm); }
        });
        console.log("Collected setsData:", setsData);
        if (setsData.length === 0) { showToast('Eroare Seturi', 'Nu s-au găsit seturi valide.', 'warning'); return; }

        const exerciseName = exerciseSelect?.value || '';
        newPrDetected = updatePersonalRecords(exerciseName, currentMaxWeight, currentMaxE1rm);
        const selectedMuscleGroups = muscleGroupsSelect ? Array.from(muscleGroupsSelect.selectedOptions).map(option => option.value) : [];
        const workoutData = { id: editingWorkoutId || generateId(), date: dateInput?.value || '', exercise: exerciseName, muscleGroups: selectedMuscleGroups, sets: setsData, notes: notesInput?.value.trim() || '', isPr: newPrDetected };
        console.log("Workout data to save/update:", workoutData);

        if (editingWorkoutId) {
            const index = workouts.findIndex(w => w.id === editingWorkoutId);
            if (index > -1) { workoutData.isPr = false; workouts[index] = workoutData; showToast('Succes', `Antrenament actualizat.`, 'success'); console.log("Workout updated in array."); }
            else { console.error(`Workout ID ${editingWorkoutId} not found.`); editingWorkoutId = null; }
        } else {
            workouts.push(workoutData); const prMessage = newPrDetected ? ' Felicitări pentru noul PR! ⭐' : '';
            showToast('Succes', `Antrenament adăugat.${prMessage}`, 'success'); console.log("Workout added to array.");
        }
        saveWorkouts(); console.log("Workouts saved to localStorage.");
        resetForm(); console.log("Form reset.");
        refreshUI(); console.log("UI refreshed.");
    });
     if(cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);
     const editWorkout = (id) => { /* ... (la fel) ... */ };
     const deleteWorkout = (id) => { /* ... (la fel) ... */ };

    // --- Logică Tab Setări ---
    const setupSettingsTab = () => { /* ... (la fel) ... */ };

    // --- Redare Tabel & Filtrare/Sortare (Jurnal Tab) ---
     // !!! CORECȚIA ESTE AICI !!!
     const calculateWorkoutStats = (workout) => {
         // Am înlocuit comentariul cu definițiile corecte
         const stats = {
             setCount: 0,
             repsMin: Infinity,
             repsMax: -Infinity,
             weightMin: Infinity,
             weightMax: -Infinity,
             totalVolume: 0,
             repsDisplay: '-',
             weightDisplay: '-',
             maxE1rm: 0,
             isGlobalPrWeight: false,
             isGlobalPrE1rm: false
         };
         let sessionMaxWeight = 0;
         let validSetFound = false;

         stats.setCount = Array.isArray(workout?.sets) ? workout.sets.length : 0; // Verificare workout.sets

         if (stats.setCount > 0) {
             workout.sets.forEach(set => {
                 const reps = parseInt(set.reps, 10); // Folosim parseInt pt repetări
                 const weight = parseFloat(set.weight); // Folosim parseFloat pt greutate
                 // Validare mai strictă a numerelor
                 if (!isNaN(reps) && reps > 0 && !isNaN(weight) && weight >= 0) {
                     validSetFound = true;
                     stats.repsMin = Math.min(stats.repsMin, reps);
                     stats.repsMax = Math.max(stats.repsMax, reps);
                     stats.weightMin = Math.min(stats.weightMin, weight);
                     stats.weightMax = Math.max(stats.weightMax, weight);
                     stats.totalVolume += reps * weight;
                     // Folosește e1rm salvat în set dacă există, altfel calculează-l
                     const e1rm = set.e1rm !== undefined ? parseFloat(set.e1rm) : calculateE1RM(weight, reps);
                     if (!isNaN(e1rm)) { // Verifică dacă e1rm este un număr valid
                       stats.maxE1rm = Math.max(stats.maxE1rm, e1rm);
                     }
                     sessionMaxWeight = Math.max(sessionMaxWeight, weight);
                 }
             });

             if (validSetFound) {
                 stats.repsDisplay = (stats.repsMin === Infinity) ? '-' : (stats.repsMin === stats.repsMax ? `${stats.repsMin}` : `${stats.repsMin}-${stats.repsMax}`);
                 stats.weightDisplay = (stats.weightMin === Infinity) ? '-' : (stats.weightMin === stats.weightMax ? formatNumber(stats.weightMax,1) : `${formatNumber(stats.weightMin,1)}-${formatNumber(stats.weightMax,1)}`);
             }
         }
         // Asigură formatarea corectă la final
         stats.totalVolume = parseFloat(stats.totalVolume.toFixed(1));
         stats.maxE1rm = parseFloat(stats.maxE1rm.toFixed(1));

         // Verificare PR global
         const globalPRs = personalRecords[workout?.exercise]; // Verificare workout.exercise
         if (globalPRs && workout?.exercise) {
             if (sessionMaxWeight >= globalPRs.maxWeight && sessionMaxWeight > 0) stats.isGlobalPrWeight = true;
             if (stats.maxE1rm >= globalPRs.maxE1rm && stats.maxE1rm > 0) stats.isGlobalPrE1rm = true;
         }
         return stats;
     };
     const renderTable = () => { /* ... (la fel) ... */ };
     const updateSortIcons = () => { /* ... (la fel) ... */ };
     // Listeneri Filtre/Sortare Jurnal
     if(filterDate) filterDate.addEventListener('input', renderTable);
     if(filterExercise) filterExercise.addEventListener('input', renderTable);
     if(filterMuscleGroup) filterMuscleGroup.addEventListener('input', renderTable);
     if(clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => { if(filterDate) filterDate.value = ''; if(filterExercise) filterExercise.value = ''; if(filterMuscleGroup) filterMuscleGroup.value = ''; renderTable(); });
     if(tableHeaders) tableHeaders.forEach(th => { th.addEventListener('click', () => { const col = th.dataset.column; if (!col) return; if (currentSort.column === col) { currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc'; } else { currentSort.column = col; currentSort.direction = ['exercise', 'muscleGroups'].includes(col) ? 'asc' : 'desc'; } renderTable(); }); });

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
     const updateDashboard = (period) => { /* ... (la fel) ... */ };
     if(dashboardPeriodSelect) dashboardPeriodSelect.addEventListener('change', (e) => updateDashboard(e.target.value));

    // --- Exporturi (Implementare) ---
    const handleExportCSV = () => { /* ... (la fel) ... */ };
    const handleExportTXT = () => { /* ... (la fel) ... */ };
    const handleExportPDF = () => { /* ... (la fel) ... */ };
    const downloadFile = (filename, content, mimeType) => { /* ... (la fel) ... */ };

    // --- Inițializare Aplicație ---
    const refreshUI = () => { /* ... (la fel) ... */ };
    const initializeApp = () => { /* ... (la fel) ... */ };

    // Start App
    try { initializeApp(); } catch (error) { console.error("Critical Init Error:", error); showToast('Eroare Critică', 'Aplicația nu a putut porni.', 'danger'); if(document.body) document.body.innerHTML = `<div class="alert alert-danger m-5">Eroare critică la pornire.</div>`; }

}); // Sfârșitul DOMContentLoaded
