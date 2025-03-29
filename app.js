// app.js - Versiune completă și actualizată (vFinal)

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
    // Generale
    const liveToastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(liveToastEl, { delay: 3500 });
    // Navigare & Tab-uri
    const bottomNav = document.getElementById('bottomNav');
    const navButtons = bottomNav.querySelectorAll('button');
    const tabContents = document.querySelectorAll('.tab-content');
    // Tab Jurnal
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
    const personalRecordsList = document.getElementById('personalRecordsList');
    const noPrMessage = document.getElementById('noPrMessage');
    const d3MusclesChartEl = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const d3VolumeChartDashEl = document.getElementById('d3VolumeChartDash'); // Grafic volum din Dashboard
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash'); // Select progres din Dashboard
    const d3ProgressChartDashEl = document.getElementById('d3ProgressChartDash'); // Grafic progres din Dashboard
    // Tab Setări
    const settingsTabContent = document.getElementById('settingsTabContent');
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileInputSettings = document.getElementById('restoreFileSettings');
    const exportCSVSettingsBtn = document.getElementById('exportCSVSettings'); // Buton export din Setări
    const exportTXTSettingsBtn = document.getElementById('exportTXTSettings'); // Buton export din Setări
    const exportPDFSettingsBtn = document.getElementById('exportPDFSettings'); // Buton export din Setări

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
    const WORKOUTS_KEY = 'workouts_v3'; // Incrementat versiunea pt a asigura reset la prima rulare după update major
    const CUSTOM_EXERCISES_KEY = 'customExercises_v3';
    const PRS_KEY = 'personalRecords_v3';

    // --- Funcții Utilitare ---
    const generateId = () => '_' + Math.random().toString(36).substring(2, 9);
    const showToast = (title, message, type = 'info') => {
         toastTitle.textContent = title;
         toastBody.textContent = message;
         const header = liveToastEl.querySelector('.toast-header');
         header.className = 'toast-header'; // Reset
         const bgClass = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-info' }[type] || 'text-bg-secondary';
         if(header) header.classList.add(bgClass); // Adaugă clasa doar dacă header există
         try {
            if (bsToast) bsToast.show();
         } catch(e) { console.error("Toast error:", e); }
     };
    const calculateE1RM = (weight, reps) => {
         if (reps <= 0 || weight <= 0 || isNaN(weight) || isNaN(reps)) return 0;
         if (reps === 1) return parseFloat(weight); // Asigură float
         return parseFloat((weight * (1 + reps / 30)).toFixed(1));
     };
    const formatNumber = (num, decimals = 1) => {
        const parsedNum = parseFloat(num);
        if (isNaN(parsedNum)) return '0';
        return parsedNum.toFixed(decimals);
    };
    const getDateRange = (period) => {
        const end = new Date(); end.setHours(23, 59, 59, 999);
        let start = new Date(); start.setHours(0, 0, 0, 0); // Începutul zilei de azi
        switch (period) {
            case 'last7days': start.setDate(end.getDate() - 6); break;
            case 'last30days': start.setDate(end.getDate() - 29); break;
            case 'allTime': default: start = new Date(0); break; // Epoch
        }
        return { start, end };
    };
    const formatDate = (date) => date.toISOString().split('T')[0];

    // --- Încărcare & Salvare Date ---
     const saveData = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(`Save Error ${key}:`, e); showToast('Eroare Salvare', `Nu am putut salva datele (${key}).`, 'danger'); } };
     const loadData = (key, defaultValue = []) => { try { const data = localStorage.getItem(key); if (data === null) return defaultValue; const parsedData = JSON.parse(data); if (key === PRS_KEY && (typeof parsedData !== 'object' || Array.isArray(parsedData))) return {}; if (key !== PRS_KEY && !Array.isArray(parsedData)) return defaultValue; return parsedData; } catch (e) { console.error(`Load Error ${key}:`, e); return defaultValue; } };
     const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
     const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
     const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);

    // --- Backup & Restore ---
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
                 if (confirm(`ATENȚIE! Suprascrieți TOATE datele curente cu cele din "${file.name}"?`)) {
                     workouts = restoredData.workouts; customExercises = restoredData.customExercises; personalRecords = restoredData.personalRecords || {}; // Asigură că PRs este obiect
                     saveWorkouts(); saveCustomExercises(); savePersonalRecords();
                     showToast('Restaurare Succes', 'Datele au fost restaurate. Aplicația se va reîncărca.', 'success');
                     setTimeout(() => window.location.reload(), 1500);
                 }
             } catch (err) { console.error("Restore Error:", err); showToast('Eroare Restaurare', `Nu s-a putut restaura: ${err.message}`, 'danger');
             } finally { event.target.value = ''; }
         };
         reader.onerror = () => { showToast('Eroare Fișier', 'Nu s-a putut citi fișierul.', 'danger'); event.target.value = ''; };
         reader.readAsText(file);
     };

    // --- Logică Tab-uri ---
     const setActiveTab = (targetId) => {
         tabContents.forEach(tab => tab.classList.remove('active'));
         navButtons.forEach(btn => btn.classList.remove('active'));
         const targetTab = document.getElementById(targetId);
         const targetButton = bottomNav.querySelector(`button[data-target="${targetId}"]`);
         if (targetTab) targetTab.classList.add('active');
         if (targetButton) targetButton.classList.add('active');

         // Acțiuni specifice la activarea tab-urilor
         if (targetId === 'dashboardTabContent') {
             // Delay mic pentru a permite DOM-ului să devină vizibil înainte de D3
             setTimeout(() => updateDashboard(dashboardPeriodSelect.value), 50);
         } else if (targetId === 'settingsTabContent') {
             if (typeof renderExistingExercisesList === 'function') renderExistingExercisesList(existingExercisesListSettings);
         }
         // Nu mai facem nimic specific pt 'logTabContent' la activare, se actualizează la modificări
     };
     navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });


    // --- Combinare Liste Exerciții ---
    const loadAndCombineExercises = () => {
        console.log("Combining exercise lists...");
        try {
            const baseExercises = Array.isArray(BASE_EXERCISES) ? BASE_EXERCISES : [];
            const safeCustomExercises = Array.isArray(customExercises) ? customExercises : [];
            const combinedMap = new Map();
            [...baseExercises, ...safeCustomExercises].forEach(ex => { if(typeof ex === 'string' && ex.trim() !== '') { combinedMap.set(ex.trim().toLowerCase(), ex.trim()); }});
            exercises = Array.from(combinedMap.values()).sort((a, b) => a.localeCompare(b));
            console.log('Final combined exercises list:', exercises.length);
            populateExerciseSelects(); // Populează DUPĂ combinare
        } catch (error) { console.error("Error combining exercise lists:", error); exercises = []; populateExerciseSelects(); }
    };

    // --- Populare Selectoare, etc. ---
     const populateExerciseSelects = () => {
        console.log('Populating selects. Exercises available:', exercises.length);
        // Selectul din Jurnal
        const currentLogExercise = exerciseSelect.value;
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
        exercises.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; exerciseSelect.appendChild(opt); } });
        if (exercises.includes(currentLogExercise)) exerciseSelect.value = currentLogExercise;
        else if (exercises.length === 0) { const errOpt = document.createElement('option'); errOpt.textContent = "Lista goală"; errOpt.disabled = true; exerciseSelect.appendChild(errOpt); }

        // Selectul de progres din Dashboard
        const currentDashProgress = progressExerciseSelectDash.value;
        const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
        progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
        exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; progressExerciseSelectDash.appendChild(opt); } });
        if (exercisesInLog.includes(currentDashProgress)) progressExerciseSelectDash.value = currentDashProgress;

        // Filtrul de grupe din Jurnal
        const currentFilterGroup = filterMuscleGroup.value;
        filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
        muscleGroupOptions.forEach(group => { const opt = document.createElement('option'); opt.value = group; opt.textContent = group; filterMuscleGroup.appendChild(opt); });
        if (muscleGroupOptions.includes(currentFilterGroup)) filterMuscleGroup.value = currentFilterGroup;
    };

    // --- Listare Exerciții Custom ---
    const renderExistingExercisesList = (listElement) => {
        if (!listElement) return;
        listElement.innerHTML = '';
        const relevantCustomExercises = Array.isArray(customExercises) ? customExercises : [];
        if (relevantCustomExercises.length === 0) {
            const li = document.createElement('li'); li.className = 'list-group-item text-muted'; li.textContent = 'Nu ai adăugat exerciții custom.'; listElement.appendChild(li); return;
        }
        relevantCustomExercises.forEach(ex => {
            const li = document.createElement('li'); li.className = 'list-group-item d-flex justify-content-between align-items-center list-group-item-action'; li.textContent = ex;
            const deleteBtn = document.createElement('button'); deleteBtn.className = 'btn btn-outline-danger btn-sm py-0 px-1'; deleteBtn.innerHTML = '×'; deleteBtn.title = `Șterge "${ex}"`;
            deleteBtn.onclick = () => deleteCustomExercise(ex, listElement); li.appendChild(deleteBtn); listElement.appendChild(li);
        });
    };

    // --- Ștergere Exercițiu Custom ---
    const deleteCustomExercise = (exerciseName, listElementToUpdate) => {
         if (!confirm(`Ștergeți exercițiul custom "${exerciseName}"?`)) return;
         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         loadAndCombineExercises(); // Reîncarcă lista globală & repopulează selecturile
         if(listElementToUpdate) renderExistingExercisesList(listElementToUpdate); // Re-randează lista specifică dacă e furnizată
         showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
         refreshUI(); // Actualizează și alte părți ale UI-ului (ex: filtre dacă e cazul)
     };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => {
         const setDiv = document.createElement('div'); setDiv.className = 'input-group input-group-sm set-entry mb-2'; // Adăugat mb-2
         setDiv.innerHTML = `<span class="input-group-text">Set</span><input type="number" class="form-control reps-input" placeholder="Rep." min="1" step="1" value="${reps}" required aria-label="Repetări"><span class="input-group-text">@</span><input type="number" class="form-control weight-input" placeholder="kg" min="0" step="0.25" value="${weight}" required aria-label="Greutate"><span class="input-group-text">kg</span><button type="button" class="btn btn-outline-danger remove-set-btn" title="Șterge Set">×</button>`;
         setsContaine
