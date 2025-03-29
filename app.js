// app.js

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
    // (Copiate din fișierul furnizat, asigură-te că toate sunt corecte)
    const liveToastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(liveToastEl, { delay: 3500 });
    const bottomNav = document.getElementById('bottomNav');
    const navButtons = bottomNav.querySelectorAll('button');
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
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportTXTBtn = document.getElementById('exportTXT');
    const exportPDFBtn = document.getElementById('exportPDF');
    const d3VolumeChartEl = document.getElementById('d3VolumeChart');
    const progressExerciseSelect = document.getElementById('progressExerciseSelect');
    const d3ProgressChartEl = document.getElementById('d3ProgressChart');
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
    const d3MusclesChartEl = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const settingsTabContent = document.getElementById('settingsTabContent');
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileInputSettings = document.getElementById('restoreFileSettings');

    // --- State-ul Aplicației ---
    let workouts = [];
    let exercises = [];
    let customExercises = [];
    let personalRecords = {};
    let editingWorkoutId = null;
    let currentSort = { column: 'date', direction: 'desc' };
    let d3Tooltip = null;
    const muscleGroupOptions = Array.from(muscleGroupsSelect.options).map(opt => opt.value);

    // --- Constante & Configurare ---
    const WORKOUTS_KEY = 'workouts_v2';
    const CUSTOM_EXERCISES_KEY = 'customExercises';
    const PRS_KEY = 'personalRecords';

    // --- Funcții Utilitare ---
    const generateId = () => '_' + Math.random().toString(36).substring(2, 9);
    const showToast = (title, message, type = 'info') => { /* ... (rămâne la fel) ... */ };
    const calculateE1RM = (weight, reps) => { /* ... (rămâne la fel) ... */ };
    const formatNumber = (num, decimals = 1) => {
        if (isNaN(num) || num === null || num === undefined) return '0';
        return parseFloat(num).toFixed(decimals);
    };
    // Funcție pentru a obține range-ul de date
    const getDateRange = (period) => {
        const end = new Date();
        end.setHours(23, 59, 59, 999); // Sfârșitul zilei curente
        let start = new Date(end);
        switch (period) {
            case 'last7days':
                start.setDate(end.getDate() - 6); // Include ziua curentă + 6 zile în urmă
                start.setHours(0, 0, 0, 0); // Începutul primei zile
                break;
            case 'last30days':
                start.setDate(end.getDate() - 29);
                start.setHours(0, 0, 0, 0);
                break;
            case 'allTime':
            default:
                start = new Date(0); // Epoch time
                break;
        }
        return { start, end };
    };
    // Funcție pentru a formata data ca YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];


    // --- Încărcare & Salvare Date ---
    // (saveData, loadData, saveWorkouts, saveCustomExercises, savePersonalRecords rămân la fel)
     const saveData = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(`Save Error ${key}:`, e); showToast('Eroare Salvare', `Nu am putut salva datele (${key}).`, 'danger'); } };
     const loadData = (key, defaultValue = []) => { try { const data = localStorage.getItem(key); if (data === null) return defaultValue; const parsedData = JSON.parse(data); if (key === PRS_KEY && (typeof parsedData !== 'object' || Array.isArray(parsedData))) return {}; if (key !== PRS_KEY && !Array.isArray(parsedData)) return defaultValue; return parsedData; } catch (e) { console.error(`Load Error ${key}:`, e); return defaultValue; } };
     const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
     const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
     const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);


    // --- Backup & Restore ---
     // (Funcțiile handleBackup și handleRestore rămân la fel, dar sunt redefinite aici pt completitudine)
     const handleBackup = () => {
         try {
             const backupData = { workouts: workouts, customExercises: customExercises, personalRecords: personalRecords, backupDate: new Date().toISOString() };
             const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a'); a.href = url; a.download = `gym_log_backup_${new Date().toISOString().split('T')[0]}.json`;
             document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
             showToast('Backup Succes', 'Fișierul de backup a fost descărcat.', 'success');
         } catch (e) { console.error("Backup Error:", e); showToast('Eroare Backup', 'Nu s-a putut genera backup.', 'danger'); }
     };
     const handleRestore = (event) => {
         const file = event.target.files[0]; if (!file) return;
         const reader = new FileReader();
         reader.onload = (e) => {
             try {
                 const restoredData = JSON.parse(e.target.result);
                 // Validări
                 if (typeof restoredData !== 'object' || !Array.isArray(restoredData.workouts) || !Array.isArray(restoredData.customExercises) || typeof restoredData.personalRecords !== 'object') {
                     throw new Error("Format fișier invalid.");
                 }
                 // Confirmare suprascriere
                 if (confirm(`ATENȚIE! Suprascrieți TOATE datele curente cu cele din "${file.name}"?`)) {
                     workouts = restoredData.workouts;
                     customExercises = restoredData.customExercises;
                     personalRecords = restoredData.personalRecords;
                     // Salvează datele restaurate
                     saveWorkouts();
                     saveCustomExercises();
                     savePersonalRecords();
                     showToast('Restaurare Succes', 'Datele au fost restaurate. Aplicația se va reîncărca.', 'success');
                     setTimeout(() => window.location.reload(), 1500); // Reîncarcă pagina
                 }
             } catch (err) { console.error("Restore Error:", err); showToast('Eroare Restaurare', `Nu s-a putut restaura: ${err.message}`, 'danger');
             } finally { event.target.value = ''; } // Resetează inputul file
         };
         reader.onerror = () => { showToast('Eroare Fișier', 'Nu s-a putut citi fișierul.', 'danger'); event.target.value = ''; };
         reader.readAsText(file);
     };


    // --- Logică Tab-uri ---
    // (setActiveTab rămâne la fel, dar include updateDashboard)
     const setActiveTab = (targetId) => {
         tabContents.forEach(tab => tab.classList.remove('active'));
         navButtons.forEach(btn => btn.classList.remove('active'));
         const targetTab = document.getElementById(targetId);
         const targetButton = bottomNav.querySelector(`button[data-target="${targetId}"]`);
         if (targetTab) targetTab.classList.add('active');
         if (targetButton) targetButton.classList.add('active');

         // Acțiuni specifice la activarea tab-urilor
         if (targetId === 'dashboardTabContent') {
             updateDashboard(dashboardPeriodSelect.value); // Actualizează dashboard-ul
         } else if (targetId === 'logTabContent') {
              // Redesenează graficele din Log (cu delay pt. layout)
             setTimeout(() => {
                 if (typeof renderVolumeChart === 'function') renderVolumeChart();
                 if (typeof renderProgressChart === 'function') renderProgressChart(progressExerciseSelect.value);
             }, 50);
         } else if (targetId === 'settingsTabContent') {
             // Reafisează lista de exerciții din Setări
             if (typeof renderExistingExercisesList === 'function') renderExistingExercisesList(existingExercisesListSettings);
         }
     };
     navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });


    // --- Combinare Liste Exerciții ---
    // (loadAndCombineExercises rămâne la fel, folosește BASE_EXERCISES)
    const loadAndCombineExercises = () => { /* ... (la fel ca în codul anterior) ... */ };


    // --- Populare Selectoare, etc. ---
    // (populateExerciseSelects rămâne la fel)
     const populateExerciseSelects = () => { /* ... (la fel) ... */ };

    // --- Listare Exerciții Custom (Modificat să accepte elementul listei) ---
    const renderExistingExercisesList = (listElement) => {
        if (!listElement) return; // Verificare element
        listElement.innerHTML = ''; // Clear list
        const relevantCustomExercises = Array.isArray(customExercises) ? customExercises : [];
        if (relevantCustomExercises.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'Nu ai adăugat exerciții custom.';
            listElement.appendChild(li);
            return;
        }
        relevantCustomExercises.forEach(ex => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center list-group-item-action'; // Adăugat action pt hover
            li.textContent = ex;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-outline-danger btn-sm py-0 px-1';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = `Șterge "${ex}"`;
            // IMPORTANT: Folosim o funcție anonimă pentru a pasa elementul listei
            deleteBtn.onclick = () => deleteCustomExercise(ex, listElement);
            li.appendChild(deleteBtn);
            listElement.appendChild(li);
        });
    };

    // --- Ștergere Exercițiu Custom (Modificat să accepte elementul listei) ---
    const deleteCustomExercise = (exerciseName, listElementToUpdate = existingExercisesListSettings) => {
         if (!confirm(`Ștergeți exercițiul custom "${exerciseName}"?`)) return;
         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         loadAndCombineExercises(); // Reîncarcă lista globală și repopulează select-urile
         renderExistingExercisesList(listElementToUpdate); // Re-randează lista specifică
         showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
     };

    // --- Logică Seturi, Validare, PR-uri ---
    // (createSetEntry, addSetBtn listener, updatePersonalRecords, validateForm rămân la fel)
     const createSetEntry = (reps = '', weight = '') => { /* ... (la fel) ... */ };
     addSetBtn.addEventListener('click', () => createSetEntry());
     const updatePersonalRecords = (exerciseName, weight, e1rm) => { /* ... (la fel) ... */ };
     const validateForm = () => { /* ... (la fel) ... */ };


    // --- CRUD & Form Logic ---
    // (resetForm, workoutForm submit listener, editWorkout, deleteWorkout rămân la fel)
    const resetForm = () => { /* ... (la fel) ... */ };
    workoutForm.addEventListener('submit', (e) => { /* ... (la fel) ... */ });
    cancelEditBtn.addEventListener('click', resetForm);
    const editWorkout = (id) => { /* ... (la fel) ... */ };
    const deleteWorkout = (id) => { /* ... (la fel, dar include refreshUI) ... */ };


    // --- Logică Tab Setări (Legare funcții) ---
    const setupSettingsTab = () => {
         addNewExerciseBtnSettings.addEventListener('click', () => {
             const newExName = newExerciseNameSettings.value.trim();
             // Folosește logica existentă, dar cu elementele din Setări
             if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) {
                 customExercises.push(newExName);
                 customExercises.sort((a, b) => a.localeCompare(b));
                 saveCustomExercises();
                 loadAndCombineExercises(); // Reîncarcă lista globală
                 renderExistingExercisesList(existingExercisesListSettings); // Actualizează lista din Setări
                 newExerciseNameSettings.value = '';
                 showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat.`, 'success');
             } else if (!newExName) { showToast('Invalid', 'Introduceți un nume valid.', 'warning'); }
             else { showToast('Existent', `"${newExName}" este deja în listă.`, 'warning'); }
         });

         backupDataBtnSettings.addEventListener('click', handleBackup);
         restoreFileInputSettings.addEventListener('change', handleRestore);

         // Afișează lista inițială în Setări la încărcare
         renderExistingExercisesList(existingExercisesListSettings);
    };

    // --- Redare Tabel & Filtrare/Sortare ---
    // (calculateWorkoutStats, renderTable, updateSortIcons, listeners filtre/sortare rămân la fel)
     const calculateWorkoutStats = (workout) => { /* ... (la fel) ... */ };
     const renderTable = () => { /* ... (la fel) ... */ };
     const updateSortIcons = () => { /* ... (la fel) ... */ };
     filterDate.addEventListener('input', renderTable);
     filterExercise.addEventListener('input', renderTable);
     filterMuscleGroup.addEventListener('input', renderTable);
     clearFiltersBtn.addEventListener('click', () => { filterDate.value = ''; filterExercise.value = ''; filterMuscleGroup.value = ''; renderTable(); });
     tableHeaders.forEach(th => { th.addEventListener('click', () => { /* ... (logica sortare) ... */ renderTable(); }); });


    // --- Grafice D3 (Log Tab) ---
    // (setupD3Tooltip, showD3Tooltip, hideD3Tooltip, setupChart, renderVolumeChart, renderProgressChart, update
