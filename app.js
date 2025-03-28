// app.js

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Lista de Exerciții Predefinită ---
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
    ].sort((a,b) => a.localeCompare(b)); // Sortăm direct aici

    // --- Selectoare DOM ---
    // Generale
    const liveToastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(liveToastEl, { delay: 3500 });
    // Tab-uri & Navigare
    const bottomNav = document.getElementById('bottomNav');
    const navButtons = bottomNav.querySelectorAll('button');
    const tabContents = document.querySelectorAll('.tab-content');
    // Tab Log
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
    // Tab Dashboard
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
    // Tab Setări
    const settingsTabContent = document.getElementById('settingsTabContent');
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileInputSettings = document.getElementById('restoreFileSettings');

    // --- State-ul Aplicației ---
    let workouts = [];
    let exercises = []; // Va fi populat din BASE_EXERCISES + customExercises
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
    // (generateId, showToast, calculateE1RM rămân la fel)
    const generateId = () => '_' + Math.random().toString(36).substring(2, 9);
    const showToast = (title, message, type = 'info') => {
         toastTitle.textContent = title;
         toastBody.textContent = message;
         const header = liveToastEl.querySelector('.toast-header');
         header.className = 'toast-header'; // Reset
         const bgClass = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-info' }[type] || 'text-bg-secondary';
         header.classList.add(bgClass);
         bsToast.show();
     };
    const calculateE1RM = (weight, reps) => {
         if (reps <= 0 || weight <= 0) return 0;
         if (reps === 1) return weight;
         return parseFloat((weight * (1 + reps / 30)).toFixed(1));
     };

    // --- Încărcare & Salvare Date ---
    // (saveData, loadData, saveWorkouts, saveCustomExercises, savePersonalRecords rămân la fel)
    const saveData = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(`Save Error ${key}:`, e); showToast('Eroare Salvare', `Nu am putut salva datele (${key}).`, 'danger'); } };
    const loadData = (key, defaultValue = []) => { try { const data = localStorage.getItem(key); if (data === null) return defaultValue; const parsedData = JSON.parse(data); if (key === PRS_KEY && (typeof parsedData !== 'object' || Array.isArray(parsedData))) return {}; if (key !== PRS_KEY && !Array.isArray(parsedData)) return defaultValue; return parsedData; } catch (e) { console.error(`Load Error ${key}:`, e); return defaultValue; } };
    const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
    const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
    const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);

    // --- Backup & Restore ---
    // (Logica rămâne la fel, dar trebuie să lege la butoanele/inputurile din Setări)
    const handleBackup = () => { /* ... (Implementarea backup-ului - la fel) ... */ };
    const handleRestore = (event) => { /* ... (Implementarea restaurării - la fel) ... */ };
    // Legarea se face în `setupSettingsTab`

    // --- Logică Tab-uri ---
    // (setActiveTab rămâne la fel)
     const setActiveTab = (targetId) => {
         tabContents.forEach(tab => tab.classList.remove('active'));
         navButtons.forEach(btn => btn.classList.remove('active'));
         const targetTab = document.getElementById(targetId);
         const targetButton = bottomNav.querySelector(`button[data-target="${targetId}"]`);
         if (targetTab) targetTab.classList.add('active');
         if (targetButton) targetButton.classList.add('active');
         if (targetId === 'dashboardTabContent') updateDashboard(dashboardPeriodSelect.value);
         if (targetId === 'logTabContent') {
             // Slight delay might help ensure dimensions are ready for D3 redraw
             setTimeout(() => {
                 renderVolumeChart();
                 renderProgressChart(progressExerciseSelect.value);
             }, 50); // Delay mic
         }
         if (targetId === 'settingsTabContent') {
             renderExistingExercisesList(existingExercisesListSettings); // Re-render list on activation
         }
     };
     navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });


    // --- Combinare Liste Exerciții (MODIFICAT) ---
    const loadAndCombineExercises = () => {
        // Nu mai este async, nu mai facem fetch
        console.log("Combining exercise lists...");
        try {
            const baseExercises = Array.isArray(BASE_EXERCISES) ? BASE_EXERCISES : []; // Folosim constanta locală
            const safeCustomExercises = Array.isArray(customExercises) ? customExercises : [];
            // Combină, elimină duplicate (case-insensitive), sortează
            const combinedMap = new Map();
            [...baseExercises, ...safeCustomExercises].forEach(ex => {
                if(typeof ex === 'string' && ex.trim() !== '') {
                    combinedMap.set(ex.trim().toLowerCase(), ex.trim()); // Salvează ultima variantă (cu literele originale)
                }
            });
            exercises = Array.from(combinedMap.values()).sort((a, b) => a.localeCompare(b));

            console.log('Final combined exercises list:', exercises.length);

            // Populăm selectoarele DUPĂ ce avem lista finală
            populateExerciseSelects();

        } catch (error) {
            console.error("Error combining exercise lists:", error);
            showToast('Eroare Critică', 'Nu s-a putut procesa lista de exerciții.', 'danger');
            exercises = []; // Folosim listă goală în caz de eroare
            populateExerciseSelects(); // Încercăm să populăm chiar și cu lista goală
        }
    };

    // --- Populare Selectoare, etc. ---
    // (populateExerciseSelects, renderExistingExercisesList, createSetEntry, updatePersonalRecords, validateForm rămân la fel)
     const populateExerciseSelects = () => {
        console.log('Populating selects. Exercises available:', exercises.length);
        const currentExerciseVal = exerciseSelect.value;
        const currentProgressVal = progressExerciseSelect.value;
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
        if (Array.isArray(exercises) && exercises.length > 0) {
            exercises.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const option = document.createElement('option'); option.value = ex; option.textContent = ex; exerciseSelect.appendChild(option); } });
            if (exercises.includes(currentExerciseVal)) exerciseSelect.value = currentExerciseVal;
        } else { const errorOption = document.createElement('option'); errorOption.value = ""; errorOption.textContent = "Lista goală."; errorOption.disabled = true; exerciseSelect.appendChild(errorOption); }
        const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
        progressExerciseSelect.innerHTML = '<option value="">Alege un exercițiu...</option>';
        exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const option = document.createElement('option'); option.value = ex; option.textContent = ex; progressExerciseSelect.appendChild(option); } });
        if (exercisesInLog.includes(currentProgressVal)) progressExerciseSelect.value = currentProgressVal;
        filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
        muscleGroupOptions.forEach(group => { const option = document.createElement('option'); option.value = group; option.textContent = group; filterMuscleGroup.appendChild(option); });
    };
    const renderExistingExercisesList = (listElement) => { /* ... (la fel, acceptă listElement) ... */ };
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
     const deleteWorkout = (id) => {
         const workoutToDelete = workouts.find(w => w.id === id);
         if (!workoutToDelete) return;
         if (confirm(`Ștergeți intrarea pentru ${workoutToDelete.exercise} din ${workoutToDelete.date}?`)) {
             workouts = workouts.filter(w => w.id !== id);
             saveWorkouts();
             // Nu recalculăm PR-urile la ștergere pentru simplitate
             if (editingWorkoutId === id) resetForm();
             showToast('Șters', 'Intrarea a fost ștearsă.', 'info');
             refreshUI(); // Refresh UI after delete
         }
     };

    // --- Logică Tab Setări (Legare funcții) ---
    const setupSettingsTab = () => {
         // Adăugare exercițiu
         addNewExerciseBtnSettings.addEventListener('click', () => {
             const newExName = newExerciseNameSettings.value.trim();
              if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) {
                 customExercises.push(newExName);
                 customExercises.sort((a, b) => a.localeCompare(b));
                 saveCustomExercises();
                 // Reîncarcă lista globală și UI-ul asociat
                 loadAndCombineExercises(); // Aceasta va repopula select-urile și va re-randa lista din setări
                 newExerciseNameSettings.value = ''; // Golește input
                 showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat.`, 'success');
             } else if (!newExName) { showToast('Invalid', 'Introduceți un nume valid.', 'warning');
             } else { showToast('Existent', `"${newExName}" este deja în listă.`, 'warning'); }
             renderExistingExercisesList(existingExercisesListSettings); // Update list in settings tab
         });

         // Backup/Restore
         backupDataBtnSettings.addEventListener('click', handleBackup); // Folosește funcția definită
         restoreFileInputSettings.addEventListener('change', handleRestore); // Folosește funcția definită

         // Afișează lista inițială în Setări
         renderExistingExercisesList(existingExercisesListSettings);
    };

     // Modifică deleteCustomExercise
     const deleteCustomExercise = (exerciseName, listElementToUpdate = existingExercisesListSettings) => { // Default la lista din Setări
          // ... (logica de confirmare) ...
         if (!confirm(`Ștergeți exercițiul custom "${exerciseName}"?`)) return; // Simplificat

         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         loadAndCombineExercises(); // Reîncarcă lista globală și repopulează select-urile
         renderExistingExercisesList(listElementToUpdate); // Re-randează lista specifică
         showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
     };
     // Definirea funcțiilor Backup/Restore înainte de a fi folosite în setupSettingsTab
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
                 if (typeof restoredData !== 'object' || !Array.isArray(restoredData.workouts) || !Array.isArray(restoredData.customExercises) || typeof restoredData.personalRecords !== 'object') { throw new Error("Format fișier invalid."); }
                 if (confirm(`ATENȚIE! Suprascrieți TOATE datele cu cele din "${file.name}"?`)) {
                     workouts = restoredData.workouts; customExercises = restoredData.customExercises; personalRecords = restoredData.personalRecords;
 
