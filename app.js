// app.js - Versiune completă (vFinal Corectat pt. Afișare Tabel)

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    console.log("DOM fully loaded and parsed.");

    // --- Lista de Exerciții Predefinită (Sortată) ---
    const BASE_EXERCISES = [ /* ... Lista ta lungă de exerciții ... */ ].sort((a,b) => a.localeCompare(b));
    // console.log("BASE_EXERCISES loaded, count:", BASE_EXERCISES.length); // O poți decomenta pt debug

    // --- Selectoare DOM ---
    // (Rămân la fel ca în versiunea anterioară)
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
     if(navButtons.length > 0) navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });
     else { console.error("Bottom navigation buttons not found!"); }


    // --- Combinare Liste Exerciții & Populare Selectoare ---
    const buildAndPopulateExercises = () => {
        console.log("START: buildAndPopulateExercises");
        try {
            const base = Array.isArray(BASE_EXERCISES) ? BASE_EXERCISES : [];
            const custom = Array.isArray(customExercises) ? customExercises : [];
            const combinedMap = new Map();
            [...base, ...custom].forEach(ex => { if(typeof ex === 'string' && ex.trim() !== '') { combinedMap.set(ex.trim().toLowerCase(), ex.trim()); }});
            exercises = Array.from(combinedMap.values()).sort((a, b) => a.localeCompare(b));
            console.log(`  Combined unique exercises count: ${exercises.length}`);

            // -- Populare Select Jurnal --
            if (exerciseSelect) {
                const currentLogExercise = exerciseSelect.value; // Salvează valoarea curentă
                exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
                exercises.forEach(ex => { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; exerciseSelect.appendChild(opt); });
                // Încearcă să restaurezi valoarea dacă încă există în noua listă
                if (exercises.includes(currentLogExercise)) exerciseSelect.value = currentLogExercise;
                 else if (exercises.length === 0) { const errOpt = document.createElement('option'); errOpt.textContent = "Lista goală"; errOpt.disabled = true; exerciseSelect.appendChild(errOpt); }
                console.log("  #exercise select populated.");
            } else { console.error("  #exercise select element NOT FOUND in DOM."); }

            // -- Populare Select Progres Dashboard --
            if (progressExerciseSelectDash) {
                const currentDashProgress = progressExerciseSelectDash.value; // Salvează valoarea curentă
                const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
                progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
                exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; progressExerciseSelectDash.appendChild(opt); } });
                // Încearcă să restaurezi valoarea
                if (exercisesInLog.includes(currentDashProgress)) progressExerciseSelectDash.value = currentDashProgress;
                console.log("  #progressExerciseSelectDash populated.");
            } else { console.warn("  #progressExerciseSelectDash element NOT FOUND."); }

            // -- Populare Filtru Grupe Jurnal --
            if (filterMuscleGroup) {
                const currentFilterGroup = filterMuscleGroup.value; // Salvează valoarea curentă
                filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
                muscleGroupOptions.forEach(group => { const opt = document.createElement('option'); opt.value = group; opt.textContent = group; filterMuscleGroup.appendChild(opt); });
                 // Încearcă să restaurezi valoarea
                if (muscleGroupOptions.includes(currentFilterGroup)) filterMuscleGroup.value = currentFilterGroup;
                console.log("  #filterMuscleGroup populated.");
            } else { console.warn("  #filterMuscleGroup element NOT FOUND."); }

            console.log("END: buildAndPopulateExercises");

        } catch (error) { /* ... (error handling) ... */ }
    };


    // --- Listare/Ștergere Exerciții Custom ---
    const renderExistingExercisesList = (listElement) => { /* ... (la fel) ... */ };
    const deleteCustomExercise = (exerciseName, listElementToUpdate) => { /* ... (la fel) ... */ };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => { /* ... (la fel) ... */ };
     if (addSetBtn) addSetBtn.addEventListener('click', () => createSetEntry()); else console.warn("#addSetBtn not found");
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
    const setupSettingsTab = () => { /* ... (la fel) ... */ };

    // --- Redare Tabel & Filtrare/Sortare (Jurnal Tab) ---
     const calculateWorkoutStats = (workout) => { /* ... (funcția corectată anterior rămâne la fel) ... */ };
     const renderTable = () => {
        console.log("--- renderTable START ---"); // Adăugat log start
        if (!workoutTableBody) { console.error("renderTable: workoutTableBody not found!"); return; }
        workoutTableBody.innerHTML = '';

        const dateFilter = filterDate?.value || '';
        const exerciseFilter = filterExercise?.value.trim().toLowerCase() || '';
        const muscleGroupFilter = filterMuscleGroup?.value || '';
        console.log(`  Rendering table with filters: Date='${dateFilter}', Exercise='${exerciseFilter}', Group='${muscleGroupFilter}'`);

        let filteredWorkouts = workouts.filter(w => {
            if (!w?.date || !w.exercise) return false; // Verificare date esențiale
            const matchDate = !dateFilter || w.date === dateFilter;
            const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter);
            const matchMuscleGroup = !muscleGroupFilter || (Array.isArray(w.muscleGroups) && w.muscleGroups.includes(muscleGroupFilter));
            return matchDate && matchExercise && matchMuscleGroup;
        });
        console.log(`  Workouts array length: ${workouts.length}, Filtered workouts count: ${filteredWorkouts.length}`);


        // Sortare (rămâne la fel)
        filteredWorkouts.sort((a, b) => { /* ... (logica sortare) ... */ });

        // Afișare
        if (filteredWorkouts.length === 0) {
            if(noDataMessage) noDataMessage.classList.remove('d-none');
             console.log("  No data to display in table.");
        } else {
            if(noDataMessage) noDataMessage.classList.add('d-none');
            const fragment = document.createDocumentFragment();
            console.log("  Looping through filtered workouts to build rows...");
            filteredWorkouts.forEach((w, index) => {
                console.log(`    Row ${index}: Processing workout ID ${w?.id}, Exercise: ${w?.exercise}`); // Log pt fiecare rând
                if (!w?.id) { console.warn(`    Skipping row ${index}: Invalid workout data.`); return; }
                try {
                    const stats = calculateWorkoutStats(w);
                     // Log the calculated stats for debugging potential issues inside calculateWorkoutStats
                    // if (index < 2) console.log(`      Stats for row ${index}:`, JSON.stringify(stats)); // Log stats pt primele 2
                    const tr = document.createElement('tr');
                    const prIcon = (stats.isGlobalPrWeight || stats.isGlobalPrE1rm) ? `<i class="bi bi-star-fill pr-indicator" title="Record Personal!"></i>` : '';
                    const groups = Array.isArray(w.muscleGroups) ? w.muscleGroups.join(', ') : '-';
                    // Construiește HTML - verifică dacă toate variabilele sunt ok
                    tr.innerHTML = `<td>${w.date||'-'}</td><td>${w.exercise||'-'}${prIcon}</td><td><small>${groups}</small></td><td class="text-center">${stats.setCount}</td><td class="text-center d-none d-md-table-cell">${stats.repsDisplay}</td><td class="text-center">${stats.weightDisplay}</td><td class="text-end">${formatNumber(stats.totalVolume,1)}</td><td class="text-end d-none d-lg-table-cell">${stats.maxE1rm>0?formatNumber(stats.maxE1rm,1):'-'}</td><td class="d-none d-lg-table-cell"><small>${w.notes||'-'}</small></td><td class="text-nowrap"><button class="btn btn-outline-warning btn-sm py-0 px-1 edit-btn" data-id="${w.id}" title="Editează">✏️</button><button class="btn btn-outline-danger btn-sm py-0 px-1 ms-1 delete-btn" data-id="${w.id}" title="Șterge">🗑️</button></td>`;
                    tr.querySelector('.edit-btn')?.addEventListener('click', (e) => editWorkout(e.currentTarget.dataset.id));
                    tr.querySelector('.delete-btn')?.addEventListener('click', (e) => deleteWorkout(e.currentTarget.dataset.id));
                    fragment.appendChild(tr);
                } catch (error) {
                    console.error(`    ERROR processing row ${index} for workout ID ${w?.id}:`, error);
                }
            });
            workoutTableBody.appendChild(fragment);
            console.log(`  Appended ${filteredWorkouts.length} rows to table.`);
        }
        updateSortIcons();
        console.log("--- renderTable END ---"); // Adăugat log end
     };
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
        // !!! CORECȚIE: Apelăm buildAndPopulateExercises AICI pentru a actualiza select-ul din dashboard !!!
        buildAndPopulateExercises(); // Asigură că lista de exerciții pt progres e actualizată
        renderTable(); // Actualizează tabelul din Jurnal

        const activeTabId = document.querySelector('.tab-content.active')?.id;
        if (activeTabId === 'dashboardTabContent') {
            updateDashboard(dashboardPeriodSelect?.value || 'last7days'); // Actualizează Dashboard dacă e activ
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

        // Safeguard după încărcare
        if (!Array.isArray(workouts)) { console.warn("Workouts data invalid, reset."); workouts = []; }
        if (!Array.isArray(customExercises)) { console.warn("Custom exercises data invalid, reset."); customExercises = []; }
        if (typeof personalRecords !== 'object' || personalRecords === null || Array.isArray(personalRecords)) { console.warn("PR data invalid, reset."); personalRecords = {}; }
        console.log(`Loaded data: ${workouts.length} workouts, ${customExercises.length} custom exercises, ${Object.keys(personalRecords).length} PRs.`);

        // 2. Construiește lista combinată și populează TOATE select-urile OBLIGATORIU acum
        buildAndPopulateExercises();
        console.log("Exercises combined and selects populated.");

        // 3. Leagă evenimentele din tab-ul Setări
        setupSettingsTab();
        console.log("Settings tab event listeners attached.");

        // 4. Randează tabelul inițial (Acum ar trebui să funcționeze)
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
