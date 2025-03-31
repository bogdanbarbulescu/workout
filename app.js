// app.js - Versiune completă și actualizată (vFinal Corectat pt. Lista Exerciții)

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
    // (Rămân la fel ca în versiunea anterioară)
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
    let exercises = []; // Lista combinată va fi stocată aici
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
    const showToast = (title, message, type = 'info') => { /* ... (la fel) ... */ };
    const calculateE1RM = (weight, reps) => { /* ... (la fel) ... */ };
    const formatNumber = (num, decimals = 1) => { /* ... (la fel) ... */ };
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

    // --- Combinare Liste Exerciții & Populare Selectoare (Refactorizat) ---
    const buildAndPopulateExercises = () => {
        console.log("Building and populating exercise lists...");
        try {
            // 1. Combină listele
            const baseExercises = Array.isArray(BASE_EXERCISES) ? BASE_EXERCISES : [];
            const safeCustomExercises = Array.isArray(customExercises) ? customExercises : [];
            const combinedMap = new Map();
            [...baseExercises, ...safeCustomExercises].forEach(ex => { if(typeof ex === 'string' && ex.trim() !== '') { combinedMap.set(ex.trim().toLowerCase(), ex.trim()); }});
            exercises = Array.from(combinedMap.values()).sort((a, b) => a.localeCompare(b)); // Actualizează variabila globală
            console.log('Combined exercises list count:', exercises.length);

            // 2. Populează select-ul din Jurnal
            if (exerciseSelect) {
                const currentLogExercise = exerciseSelect.value;
                exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
                exercises.forEach(ex => { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; exerciseSelect.appendChild(opt); });
                if (exercises.includes(currentLogExercise)) exerciseSelect.value = currentLogExercise;
                 else if (exercises.length === 0) { const errOpt = document.createElement('option'); errOpt.textContent = "Lista goală"; errOpt.disabled = true; exerciseSelect.appendChild(errOpt); }
                console.log("#exercise select populated.");
            } else { console.error("#exercise select not found."); }

            // 3. Populează select-ul de progres din Dashboard
            if (progressExerciseSelectDash) {
                const currentDashProgress = progressExerciseSelectDash.value;
                const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
                progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
                exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; progressExerciseSelectDash.appendChild(opt); } });
                if (exercisesInLog.includes(currentDashProgress)) progressExerciseSelectDash.value = currentDashProgress;
                console.log("#progressExerciseSelectDash populated.");
            }

            // 4. Populează filtrul de grupe (nu depinde de lista 'exercises')
            if (filterMuscleGroup) {
                const currentFilterGroup = filterMuscleGroup.value;
                filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
                muscleGroupOptions.forEach(group => { const opt = document.createElement('option'); opt.value = group; opt.textContent = group; filterMuscleGroup.appendChild(opt); });
                if (muscleGroupOptions.includes(currentFilterGroup)) filterMuscleGroup.value = currentFilterGroup;
                console.log("#filterMuscleGroup populated.");
            }

        } catch (error) {
            console.error("Error in buildAndPopulateExercises:", error);
            showToast('Eroare Critică', 'Nu s-a putut procesa lista de exerciții.', 'danger');
            exercises = []; // Reset în caz de eroare
            // Încercăm să curățăm select-urile în caz de eroare
             if (exerciseSelect) exerciseSelect.innerHTML = '<option value="" selected disabled>Eroare listă</option>';
             if (progressExerciseSelectDash) progressExerciseSelectDash.innerHTML = '<option value="">Eroare listă</option>';
        }
    };


    // --- Listare/Ștergere Exerciții Custom ---
    const renderExistingExercisesList = (listElement) => { /* ... (la fel) ... */ };
    const deleteCustomExercise = (exerciseName, listElementToUpdate) => {
         if (!confirm(`Ștergeți exercițiul custom "${exerciseName}"?`)) return;
         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         buildAndPopulateExercises(); // Reconstruiește lista globală și repopulează select-urile
         if(listElementToUpdate) renderExistingExercisesList(listElementToUpdate);
         showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
         // Nu mai e nevoie de refreshUI() aici, buildAndPopulate face ce trebuie pt selecturi
     };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => { /* ... (la fel) ... */ };
     if (addSetBtn) addSetBtn.addEventListener('click', () => createSetEntry());
     const updatePersonalRecords = (exerciseName, weight, e1rm) => { /* ... (la fel) ... */ };
     const validateForm = () => { /* ... (la fel) ... */ };

    // --- CRUD & Form Logic (Jurnal Tab) ---
     const resetForm = () => { /* ... (la fel) ... */ };
     if (workoutForm) workoutForm.addEventListener('submit', (e) => {
         e.preventDefault(); e.stopPropagation();
         console.log("Form submitted. Validating...");
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
             if (index > -1) { workoutData.isPr = false; workouts[index] = workoutData; showToast('Succes', `Antrenament actualizat.`, 'success'); console.log("Workout updated."); }
             else { console.error(`Workout ID ${editingWorkoutId} not found.`); editingWorkoutId = null; }
         } else {
             workouts.push(workoutData); const prMessage = newPrDetected ? ' Felicitări pentru noul PR! ⭐' : '';
             showToast('Succes', `Antrenament adăugat.${prMessage}`, 'success'); console.log("Workout added.");
         }
         saveWorkouts(); console.log("Workouts saved.");
         resetForm(); console.log("Form reset.");
         refreshUI(); console.log("UI refreshed after save/update."); // Refresh UI după salvare
    });
     if(cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);
     const editWorkout = (id) => { /* ... (la fel) ... */ };
     const deleteWorkout = (id) => { /* ... (la fel) ... */ };

    // --- Logică Tab Setări ---
    const setupSettingsTab = () => {
         if (addNewExerciseBtnSettings) addNewExerciseBtnSettings.addEventListener('click', () => {
             const newExName = newExerciseNameSettings.value.trim();
             if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) {
                 customExercises.push(newExName); customExercises.sort((a, b) => a.localeCompare(b)); saveCustomExercises();
                 buildAndPopulateExercises(); // Reconstruiește lista și repopulează selecturile
                 renderExistingExercisesList(existingExercisesListSettings); // Actualizează lista din Setări
                 newExerciseNameSettings.value = '';
                 showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat.`, 'success');
             } else if (!newExName) { showToast('Invalid', 'Introduceți un nume valid.', 'warning'); }
             else { showToast('Existent', `"${newExName}" este deja în listă.`, 'warning'); }
         });
         if (backupDataBtnSettings) backupDataBtnSettings.addEventListener('click', handleBackup);
         if (restoreFileInputSettings) restoreFileInputSettings.addEventListener('change', handleRestore);
         if (exportCSVSettingsBtn) exportCSVSettingsBtn.addEventListener('click', handleExportCSV);
         if (exportTXTSettingsBtn) exportTXTSettingsBtn.addEventListener('click', handleExportTXT);
         if (exportPDFSettingsBtn) exportPDFSettingsBtn.addEventListener('click', handleExportPDF);
         renderExistingExercisesList(existingExercisesListSettings);
    };

    // --- Redare Tabel & Filtrare/Sortare (Jurnal Tab) ---
     const calculateWorkoutStats = (workout) => { /* ... (funcția corectată anterior rămâne la fel) ... */ };
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
    const refreshUI = () => {
        // Randează elementele care depind de date *după* ce datele și listele sunt gata
        console.log("Refreshing UI...");
        renderTable(); // Actualizează tabelul din Jurnal
        // Popularea selecturilor se face acum centralizat în buildAndPopulateExercises

        // Actualizează elementele specifice tab-urilor active
        const activeTabId = document.querySelector('.tab-content.active')?.id;
        if (activeTabId === 'dashboardTabContent') {
            updateDashboard(dashboardPeriodSelect.value); // Redesenează complet dashboard-ul
        } else if (activeTabId === 'settingsTabContent') {
            renderExistingExercisesList(existingExercisesListSettings); // Actualizează lista din Setări
        }
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
        console.log("Data loaded.");

        // 2. Construiește lista combinată și populează TOATE select-urile o singură dată
        buildAndPopulateExercises();
        console.log("Exercises combined and selects populated.");

        // 3. Leagă evenimentele din tab-ul Setări (care depind de funcții definite global)
        setupSettingsTab();
        console.log("Settings tab event listeners attached.");

        // 4. Randează tabelul inițial (acum că datele și selecturile sunt gata)
        renderTable();
        console.log("Initial table rendered.");

        // 5. Setează tab-ul inițial (nu va declanșa refresh complet pt dashboard imediat)
        setActiveTab('logTabContent');
        console.log("Initial tab set.");

        console.log("App Initialized.");
    };

    // Start App
    try { initializeApp(); } catch (error) { console.error("Critical Init Error:", error); showToast('Eroare Critică', 'Aplicația nu a putut porni.', 'danger'); if(document.body) document.body.innerHTML = `<div class="alert alert-danger m-5">Eroare critică la pornire.</div>`; }

}); // Sfârșitul DOMContentLoaded
