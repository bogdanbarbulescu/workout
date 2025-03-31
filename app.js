// app.js - Versiune completă (vFinal Corectat pt Lista Ex + Ordine Form)

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    console.log("DOM fully loaded and parsed."); // LOG: Confirmare start

    // --- Lista de Exerciții Predefinită (Sortată) ---
    const BASE_EXERCISES = [
        "Ab Wheel Rollout", "Arnold Press (Ganteră)", /* ... (restul listei BASE_EXERCISES) ... */ "Weighted Crunch"
    ].sort((a,b) => a.localeCompare(b));
    console.log("BASE_EXERCISES loaded, count:", BASE_EXERCISES.length);

    // --- Selectoare DOM (Verificăm existența lor) ---
    const getElement = (id) => {
        const element = document.getElementById(id);
        // Eliminăm log-ul pt fiecare element, dar păstrăm ideea de verificare
        // if (!element) console.warn(`Element with ID "${id}" not found.`);
        return element;
    };
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
    const exerciseSelect = getElement('exercise'); // Select Jurnal Exercițiu
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
    const progressExerciseSelectDash = getElement('progressExerciseSelectDash'); // Select Dashboard Progres
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
    let exercises = []; // Lista combinată finală
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
     const setActiveTab = (targetId) => { /* ... (la fel, include updateDashboard cu delay) ... */ };
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

            // -- Populare Select Jurnal --
            if (exerciseSelect) {
                console.log("  Populating #exercise select...");
                exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
                if (exercises.length > 0) {
                    exercises.forEach(ex => { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; exerciseSelect.appendChild(opt); });
                    console.log(`  Added ${exercises.length} options to #exercise.`);
                } else {
                     const errOpt = document.createElement('option'); errOpt.textContent = "Lista goală/Eroare"; errOpt.disabled = true; exerciseSelect.appendChild(errOpt);
                     console.warn("  #exercise select populated with error message.");
                }
            } else { console.error("  #exercise select element NOT FOUND in DOM."); }

            // -- Populare Select Progres Dashboard --
            if (progressExerciseSelectDash) {
                console.log("  Populating #progressExerciseSelectDash...");
                const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
                progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
                exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; progressExerciseSelectDash.appendChild(opt); } });
                console.log(`  Added ${exercisesInLog.length} options to #progressExerciseSelectDash.`);
            } else { console.warn("  #progressExerciseSelectDash element NOT FOUND."); } // Warn, nu e critic pt funcția de bază

            // -- Populare Filtru Grupe Jurnal --
            if (filterMuscleGroup) {
                console.log("  Populating #filterMuscleGroup...");
                filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
                muscleGroupOptions.forEach(group => { const opt = document.createElement('option'); opt.value = group; opt.textContent = group; filterMuscleGroup.appendChild(opt); });
                console.log(`  Added ${muscleGroupOptions.length} options to #filterMuscleGroup.`);
            } else { console.warn("  #filterMuscleGroup element NOT FOUND."); }

            console.log("END: buildAndPopulateExercises");

        } catch (error) {
            console.error("FATAL Error in buildAndPopulateExercises:", error);
            showToast('Eroare Critică', 'Nu s-a putut genera lista de exerciții.', 'danger');
            exercises = []; // Asigură reset
            if (exerciseSelect) exerciseSelect.innerHTML = '<option value="" selected disabled>EROARE</option>';
            if (progressExerciseSelectDash) progressExerciseSelectDash.innerHTML = '<option value="">EROARE</option>';
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
         // Nu mai e nevoie de refreshUI() aici pt selecturi
     };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => { /* ... (la fel) ... */ };
     if (addSetBtn) addSetBtn.addEventListener('click', () => createSetEntry()); else console.error("#addSetBtn not found");
     const updatePersonalRecords = (exerciseName, weight, e1rm) => { /* ... (la fel) ... */ };
     const validateForm = () => { /* ... (la fel) ... */ };

    // --- CRUD & Form Logic (Jurnal Tab) ---
     const resetForm = () => { /* ... (la fel) ... */ };
     if (workoutForm) workoutForm.addEventListener('submit', (e) => { /* ... (la fel) ... */ });
     else { console.error("#workoutForm not found!"); }
     if(cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);
     const editWorkout = (id) => { /* ... (la fel) ... */ };
     const deleteWorkout = (id) => { /* ... (la fel) ... */ };

    // --- Logică Tab Setări ---
    const setupSettingsTab = () => {
         if (addNewExerciseBtnSettings) addNewExerciseBtnSettings.addEventListener('click', () => {
             const newExName = newExerciseNameSettings.value.trim();
             if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) {
                 customExercises.push(newExName); customExercises.sort((a, b) => a.localeCompare(b)); saveCustomExercises();
                 buildAndPopulateExercises(); // Reconstruiește și repopulează
                 renderExistingExercisesList(existingExercisesListSettings); newExerciseNameSettings.value = '';
                 showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat.`, 'success');
             } else if (!newExName) { showToast('Invalid', 'Introduceți un nume valid.', 'warning'); }
             else { showToast('Existent', `"${newExName}" este deja în listă.`, 'warning'); }
         });
         if (backupDataBtnSettings) backupDataBtnSettings.addEventListener('click', handleBackup);
         if (restoreFileInputSettings) restoreFileInputSettings.addEventListener('change', handleRestore);
         if (exportCSVSettingsBtn) exportCSVSettingsBtn.addEventListener('click', handleExportCSV);
         if (exportTXTSettingsBtn) exportTXTSettingsBtn.addEventListener('click', handleExportTXT);
         if (exportPDFSettingsBtn) exportPDFSettingsBtn.addEventListener('click', handleExportPDF);
         // Afișează lista inițială în Setări la încărcare
         if(existingExercisesListSettings) renderExistingExercisesList(existingExercisesListSettings);
         else console.error("#existingExercisesListSettings not found");
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
     const updateDashboard = (period) => { /* ... (la fel) ... */ };
     if(dashboardPeriodSelect) dashboardPeriodSelect.addEventListener('change', (e) => updateDashboard(e.target.value));

    // --- Exporturi (Implementare) ---
    const handleExportCSV = () => { /* ... (la fel) ... */ };
    const handleExportTXT = () => { /* ... (la fel) ... */ };
    const handleExportPDF = () => { /* ... (la fel) ... */ };
    const downloadFile = (filename, content, mimeType) => { /* ... (la fel) ... */ };

    // --- Inițializare Aplicație ---
    const refreshUI = () => {
        console.log("Refreshing UI...");
        renderTable(); // Actualizează tabelul din Jurnal
        // Selecturile sunt populate doar la initializare sau la adaugare/stergere exercitiu custom

        const activeTabId = document.querySelector('.tab-content.active')?.id;
        if (activeTabId === 'dashboardTabContent') {
            updateDashboard(dashboardPeriodSelect.value); // Actualizează Dashboard dacă e activ
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
        console.log(`Loaded data: ${workouts.length} workouts, ${customExercises.length} custom exercises, ${Object.keys(personalRecords).length} PRs.`);

        // 2. Construiește lista combinată și populează TOATE select-urile OBLIGATORIU acum
        buildAndPopulateExercises();

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
    try {
        initializeApp();
    } catch (error) {
        console.error("Critical Init Error:", error);
        showToast('Eroare Critică', `Aplicația nu a putut porni: ${error.message}`, 'danger');
        if(document.body) document.body.innerHTML = `<div class="alert alert-danger m-5 text-center"><h2>Eroare Critică</h2><p>Aplicația nu a putut fi inițializată corect. Verificați consola (F12) pentru detalii.</p><pre>${error.stack || error}</pre></div>`;
    }

}); // Sfârșitul DOMContentLoaded
