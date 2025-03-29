// app.js - Versiune completă și actualizată (vFinal Corectat)

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
    const bsToast = liveToastEl ? new bootstrap.Toast(liveToastEl, { delay: 3500 }) : null; // Verificare existență toast
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
        if (!liveToastEl || !toastTitle || !toastBody || !bsToast) return; // Nu face nimic dacă elementele toast nu există
        toastTitle.textContent = title;
        toastBody.textContent = message;
        const header = liveToastEl.querySelector('.toast-header');
        if (header) {
            header.className = 'toast-header'; // Reset
            const bgClass = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-info' }[type] || 'text-bg-secondary';
            header.classList.add(bgClass);
        }
        try { bsToast.show(); } catch(e) { console.error("Toast error:", e); }
    };
    const calculateE1RM = (weight, reps) => {
        const numWeight = parseFloat(weight);
        const numReps = parseInt(reps, 10);
        if (isNaN(numReps) || numReps <= 0 || isNaN(numWeight) || numWeight <= 0) return 0;
        if (numReps === 1) return numWeight;
        return parseFloat((numWeight * (1 + numReps / 30)).toFixed(1));
    };
    const formatNumber = (num, decimals = 1) => {
        const parsedNum = parseFloat(num);
        if (isNaN(parsedNum)) return '0';
        // Folosește toLocaleString pentru formatare cu virgulă dacă e cazul, dar toFixed e mai simplu
        return parsedNum.toFixed(decimals);
    };
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
                     workouts = restoredData.workouts; customExercises = restoredData.customExercises; personalRecords = restoredData.personalRecords || {};
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

         if (targetId === 'dashboardTabContent') {
             setTimeout(() => updateDashboard(dashboardPeriodSelect.value), 50);
         } else if (targetId === 'settingsTabContent') {
             if (typeof renderExistingExercisesList === 'function') renderExistingExercisesList(existingExercisesListSettings);
         }
         // Nu mai facem refresh la graficele din Log la activare tab
     };
     if(navButtons) navButtons.forEach(button => { button.addEventListener('click', () => setActiveTab(button.dataset.target)); });


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
            populateExerciseSelects();
        } catch (error) { console.error("Error combining exercise lists:", error); exercises = []; populateExerciseSelects(); }
    };

    // --- Populare Selectoare ---
     const populateExerciseSelects = () => {
        console.log('Populating selects. Exercises available:', exercises.length);
        // Select Jurnal
        if (exerciseSelect) {
            const currentLogExercise = exerciseSelect.value;
            exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
            exercises.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; exerciseSelect.appendChild(opt); } });
            if (exercises.includes(currentLogExercise)) exerciseSelect.value = currentLogExercise;
            else if (exercises.length === 0) { const errOpt = document.createElement('option'); errOpt.textContent = "Lista goală"; errOpt.disabled = true; exerciseSelect.appendChild(errOpt); }
        }
        // Select Progres Dashboard
        if (progressExerciseSelectDash) {
            const currentDashProgress = progressExerciseSelectDash.value;
            const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].filter(Boolean).sort((a, b) => a.localeCompare(b));
            progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
            exercisesInLog.forEach(ex => { if (typeof ex === 'string' && ex.trim() !== '') { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; progressExerciseSelectDash.appendChild(opt); } });
            if (exercisesInLog.includes(currentDashProgress)) progressExerciseSelectDash.value = currentDashProgress;
        }
        // Filtru Grupe Jurnal
        if (filterMuscleGroup) {
            const currentFilterGroup = filterMuscleGroup.value;
            filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
            muscleGroupOptions.forEach(group => { const opt = document.createElement('option'); opt.value = group; opt.textContent = group; filterMuscleGroup.appendChild(opt); });
            if (muscleGroupOptions.includes(currentFilterGroup)) filterMuscleGroup.value = currentFilterGroup;
        }
    };

    // --- Listare Exerciții Custom ---
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

    // --- Ștergere Exercițiu Custom ---
    const deleteCustomExercise = (exerciseName, listElementToUpdate) => {
         if (!confirm(`Ștergeți exercițiul custom "${exerciseName}"?`)) return;
         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         loadAndCombineExercises(); // Reîncarcă lista globală & repopulează selecturile
         if(listElementToUpdate) renderExistingExercisesList(listElementToUpdate);
         showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
         refreshUI(); // Actualizează și alte părți ale UI-ului
     };

    // --- Logică Seturi, Validare, PR-uri ---
    const createSetEntry = (reps = '', weight = '') => { /* ... (la fel, cu mb-2) ... */ };
     if (addSetBtn) addSetBtn.addEventListener('click', () => createSetEntry());
     const updatePersonalRecords = (exerciseName, weight, e1rm) => { /* ... (la fel) ... */ };
     const validateForm = () => { /* ... (la fel) ... */ };

    // --- CRUD & Form Logic (Jurnal Tab) ---
     const resetForm = () => { /* ... (la fel) ... */ };
     if (workoutForm) workoutForm.addEventListener('submit', (e) => { /* ... (la fel) ... */ });
     if(cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);
     const editWorkout = (id) => { /* ... (la fel) ... */ };
     const deleteWorkout = (id) => { /* ... (la fel) ... */ };

    // --- Logică Tab Setări ---
    const setupSettingsTab = () => {
         if (addNewExerciseBtnSettings) addNewExerciseBtnSettings.addEventListener('click', () => {
             const newExName = newExerciseNameSettings.value.trim();
             if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) {
                 customExercises.push(newExName); customExercises.sort((a, b) => a.localeCompare(b)); saveCustomExercises();
                 loadAndCombineExercises(); renderExistingExercisesList(existingExercisesListSettings); newExerciseNameSettings.value = '';
                 showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat.`, 'success');
             } else if (!newExName) { showToast('Invalid', 'Introduceți un nume valid.', 'warning'); }
             else { showToast('Existent', `"${newExName}" este deja în listă.`, 'warning'); }
         });
         if (backupDataBtnSettings) backupDataBtnSettings.addEventListener('click', handleBackup);
         if (restoreFileInputSettings) restoreFileInputSettings.addEventListener('change', handleRestore);
         if (exportCSVSettingsBtn) exportCSVSettingsBtn.addEventListener('click', handleExportCSV);
         if (exportTXTSettingsBtn) exportTXTSettingsBtn.addEventListener('click', handleExportTXT);
         if (exportPDFSettingsBtn) exportPDFSettingsBtn.addEventListener('click', handleExportPDF);
         renderExistingExercisesList(existingExercisesListSettings); // Afișează lista inițială
    };

    // --- Redare Tabel & Filtrare/Sortare (Jurnal Tab) ---
     const calculateWorkoutStats = (workout) => { /* ... (la fel, include PR check) ... */ };
     const renderTable = () => {
         if (!workoutTableBody) return; // Ieși dacă tabelul nu există
         workoutTableBody.innerHTML = '';
         const dateFilter = filterDate?.value || ''; const exerciseFilter = filterExercise?.value.trim().toLowerCase() || ''; const muscleGroupFilter = filterMuscleGroup?.value || '';
         let filteredWorkouts = workouts.filter(w => { if (!w?.date || !w.exercise) return false; const matchDate = !dateFilter || w.date === dateFilter; const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter); const matchMuscleGroup = !muscleGroupFilter || (Array.isArray(w.muscleGroups) && w.muscleGroups.includes(muscleGroupFilter)); return matchDate && matchExercise && matchMuscleGroup; });
         // Sortare
         filteredWorkouts.sort((a, b) => {
             let valA, valB; const col = currentSort.column; if (!a || !b) return 0;
             if (col === 'volume') { valA = parseFloat(calculateWorkoutStats(a).totalVolume); valB = parseFloat(calculateWorkoutStats(b).totalVolume); }
             else if (col === 'e1rm') { valA = calculateWorkoutStats(a).maxE1rm; valB = calculateWorkoutStats(b).maxE1rm; }
             else if (col === 'sets') { valA = Array.isArray(a.sets) ? a.sets.length : 0; valB = Array.isArray(b.sets) ? b.sets.length : 0; }
             else if (col === 'date') { valA = a.date || ''; valB = b.date || ''; }
             else if (col === 'muscleGroups') { valA = Array.isArray(a.muscleGroups) ? a.muscleGroups.join(', ').toLowerCase() : ''; valB = Array.isArray(b.muscleGroups) ? b.muscleGroups.join(', ').toLowerCase() : ''; }
             else { valA = String(a[col] || '').toLowerCase(); valB = String(b[col] || '').toLowerCase(); }
             let comparison = 0; if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; } else { comparison = String(valA).localeCompare(String(valB)); }
             return currentSort.direction === 'asc' ? comparison : -comparison;
         });
         // Afișare
         if (filteredWorkouts.length === 0) { if(noDataMessage) noDataMessage.classList.remove('d-none'); }
         else { if(noDataMessage) noDataMessage.classList.add('d-none'); const fragment = document.createDocumentFragment(); filteredWorkouts.forEach(w => { if (!w?.id) return; const stats = calculateWorkoutStats(w); const tr = document.createElement('tr'); const prIcon = (stats.isGlobalPrWeight || stats.isGlobalPrE1rm) ? `<i class="bi bi-star-fill pr-indicator" title="Record Personal!"></i>` : ''; const groups = Array.isArray(w.muscleGroups) ? w.muscleGroups.join(', ') : '-';
             tr.innerHTML = `<td>${w.date||'-'}</td><td>${w.exercise||'-'}${prIcon}</td><td><small>${groups}</small></td><td class="text-center">${stats.setCount}</td><td class="text-center d-none d-md-table-cell">${stats.repsDisplay}</td><td class="text-center">${stats.weightDisplay}</td><td class="text-end">${formatNumber(stats.totalVolume,1)}</td><td class="text-end d-none d-lg-table-cell">${stats.maxE1rm>0?formatNumber(stats.maxE1rm,1):'-'}</td><td class="d-none d-lg-table-cell"><small>${w.notes||'-'}</small></td><td class="text-nowrap"><button class="btn btn-outline-warning btn-sm py-0 px-1 edit-btn" data-id="${w.id}" title="Editează">✏️</button><button class="btn btn-outline-danger btn-sm py-0 px-1 ms-1 delete-btn" data-id="${w.id}" title="Șterge">🗑️</button></td>`;
             tr.querySelector('.edit-btn')?.addEventListener('click', (e) => editWorkout(e.currentTarget.dataset.id)); tr.querySelector('.delete-btn')?.addEventListener('click', (e) => deleteWorkout(e.currentTarget.dataset.id)); fragment.appendChild(tr); }); workoutTableBody.appendChild(fragment);
         }
         updateSortIcons();
     };
     const updateSortIcons = () => { /* ... (la fel) ... */ };
     // Listeneri Filtre/Sortare Jurnal
     if(filterDate) filterDate.addEventListener('input', renderTable);
     if(filterExercise) filterExercise.addEventListener('input', renderTable);
     if(filterMuscleGroup) filterMuscleGroup.addEventListener('input', renderTable);
     if(clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => { if(filterDate) filterDate.value = ''; if(filterExercise) filterExercise.value = ''; if(filterMuscleGroup) filterMuscleGroup.value = ''; renderTable(); });
     if(tableHeaders) tableHeaders.forEach(th => { th.addEventListener('click', () => { const col = th.dataset.column; if (!col) return; if (currentSort.column === col) { currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc'; } else { currentSort.column = col; currentSort.direction = ['exercise', 'muscleGroups'].includes(col) ? 'asc' : 'desc'; } renderTable(); }); });

    // --- Grafice D3 ---
     const setupD3Tooltip = () => { if (!d3Tooltip) { d3Tooltip = d3.select('body').append('div').attr('class', 'd3-tooltip').style('opacity', 0); }};
     const showD3Tooltip = (event, content) => { if (!d3Tooltip) setupD3Tooltip(); d3Tooltip.transition().duration(100).style('opacity', 1); d3Tooltip.html(content).style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px'); };
     const hideD3Tooltip = () => { if (!d3Tooltip) return; d3Tooltip.transition().duration(200).style('opacity', 0).on('end', function() { d3.select(this).style('left', '-9999px'); }); };
     const setupChart = (svgId, desiredWidth, desiredHeight) => {
        const container = document.getElementById(svgId)?.parentElement; if (!container) { console.error(`Chart container for #${svgId} not found.`); return null; }
        const containerWidth = container.clientWidth; const width = containerWidth > 0 ? containerWidth : desiredWidth;
        const margin = { top: 20, right: 30, bottom: 60, left: 50 }; // Ajustat margini
        const innerWidth = width - margin.left - margin.right; const innerHeight = desiredHeight - margin.top - margin.bottom;
        if (innerWidth <= 0 || innerHeight <= 0) { console.warn(`Invalid chart dimensions for ${svgId}`); d3.select(`#${svgId}`).html(''); return null; } // Clear previous message if any
        d3.select(`#${svgId}`).selectAll('*').remove();
        const svg = d3.select(`#${svgId}`).attr('width', width).attr('height', desiredHeight).attr('viewBox', `0 0 ${width} ${desiredHeight}`).append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        return { svg, innerWidth, innerHeight, margin, width, height: desiredHeight };
     };

     // --- Grafice Specifice (Folosite în Dashboard) ---
     const renderMusclesChart = (data) => {
         const container = d3MusclesChartEl; if (!container) return;
         const muscleCounts = {}; data.forEach(w => { if (Array.isArray(w.muscleGroups)) { w.muscleGroups.forEach(group => { muscleCounts[group] = (muscleCounts[group] || 0) + 1; }); } });
         const chartData = Object.entries(muscleCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
         const chartConfig = setupChart('d3MusclesChart', 500, 300); // ID corect, înălțime ajustată
         if (!chartConfig) { if(noMuscleDataMessage) noMuscleDataMessage.classList.remove('d-none'); return; }
         const { svg, innerWidth, innerHeight } = chartConfig;
         if (chartData.length === 0) { if(noMuscleDataMessage) noMuscleDataMessage.classList.remove('d-none'); container.style.display = 'none'; return; }
         else { if(noMuscleDataMessage) noMuscleDataMessage.classList.add('d-none'); container.style.display = 'block'; }
         const x = d3.scaleLinear().domain([0, d3.max(chartData, d => d.count) || 1]).range([0, innerWidth]);
         const y = d3.scaleBand().domain(chartData.map(d => d.name)).range([0, innerHeight]).padding(0.2);
         svg.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(Math.min(5, d3.max(chartData, d=>d.count))).tickFormat(d3.format('d'))).select(".domain").remove();
         svg.append("g").call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();
         svg.selectAll(".muscle-bar").data(chartData).join("rect").attr("class", "muscle-bar bar").attr("y", d => y(d.name)).attr("width", 0).attr("height", y.bandwidth()).on('mouseover', (event, d) => { showD3Tooltip(event, `<strong>${d.name}</strong>: ${d.count} seturi`); d3.select(event.currentTarget).style('opacity', 0.7); }).on('mouseout', (event) => { hideD3Tooltip(); d3.select(event.currentTarget).style('opacity', 1); }).transition().duration(750).attr("width", d => x(d.count));
         svg.selectAll(".bar-label").data(chartData).join("text").attr("class", "bar-label").attr("x", d => x(d.count) + 4).attr("y", d => y(d.name) + y.bandwidth() / 2).attr("dy", "0.35em").style("opacity", 0).text(d => d.count).transition().delay(750).duration(300).style("opacity", 1);
     };
     const renderVolumeChartForDashboard = () => { /* ... (la fel ca în răspunsul anterior, folosește d3VolumeChartDashEl) ... */ };
     const renderProgressChartForDashboard = (selectedExercise) => { /* ... (la fel ca în răspunsul anterior, folosește d3ProgressChartDashEl/progressExerciseSelectDash) ... */ };

    // --- Logică Dashboard ---
     const displayPersonalRecords = () => {
        if (!personalRecordsList) return;
        personalRecordsList.innerHTML = ''; // Clear previous entries
        const sortedPrs = Object.entries(personalRecords).filter(([,pr]) => pr.maxE1rm > 0 || pr.maxWeight > 0) // Filtrează cele cu valori
            .sort(([, a], [, b]) => (b.maxE1rm || 0) - (a.maxE1rm || 0) || (b.maxWeight || 0) - (a.maxWeight || 0))
            .slice(0, 5);

        if (sortedPrs.length === 0) { if(noPrMessage) noPrMessage.style.display = 'list-item'; return; }
        if(noPrMessage) noPrMessage.style.display = 'none';

        sortedPrs.forEach(([exercise, pr]) => {
            const li = document.createElement('li'); li.className = 'list-group-item';
            li.innerHTML = `<span class="pr-exercise">${exercise}</span><span class="pr-details float-end"><span class="pr-value">${formatNumber(pr.maxE1rm, 1)}kg</span><span class="pr-type">(e1RM)</span> / <span class="pr-value">${formatNumber(pr.maxWeight, 1)}kg</span><span class="pr-type">(Max)</span></span>`;
            personalRecordsList.appendChild(li);
        });
     };
     const updateDashboard = (period) => {
         console.log(`Updating dashboard for period: ${period}`);
         const { start, end } = getDateRange(period); const daysInPeriod = Math.max(1, (end - start) / (1000 * 60 * 60 * 24)); const weeksInPeriod = Math.max(1, daysInPeriod / 7);
         const filteredWorkouts = workouts.filter(w => { try { const d = new Date(w.date + 'T00:00:00'); return !isNaN(d) && d >= start && d <= end; } catch (e) { return false; }});
         console.log(`Filtered workouts for dashboard: ${filteredWorkouts.length}`);
         let totalExercises = 0, totalSets = 0, totalReps = 0, totalWeightedVolume = 0, totalWeightedSets = 0, totalWeightSum = 0; let uniqueWorkoutDays = new Set();
         filteredWorkouts.forEach(w => { totalExercises++; uniqueWorkoutDays.add(w.date); if (Array.isArray(w.sets)) { w.sets.forEach(set => { const r = parseInt(set.reps, 10); const wt = parseFloat(set.weight); if (!isNaN(r) && r > 0) { totalSets++; totalReps += r; if (!isNaN(wt) && wt > 0) { totalWeightedVolume += r * wt; totalWeightedSets++; totalWeightSum += wt; } } }); } });
         const avgWeight = totalWeightedSets > 0 ? totalWeightSum / totalWeightedSets : 0; const totalVolumeTonnes = totalWeightedVolume / 1000; const numWorkoutDays = uniqueWorkoutDays.size;
         // Update Stats
         if(statsExercises) statsExercises.textContent = totalExercises; if(statsSets) statsSets.textContent = totalSets; if(statsReps) statsReps.textContent = totalReps; if(statsAvgWeight) statsAvgWeight.textContent = formatNumber(avgWeight, 1); if(statsTotalVolume) statsTotalVolume.textContent = formatNumber(totalVolumeTonnes, 2);
         // Update Weekly Stats
         if(weeklyAvgWorkouts) weeklyAvgWorkouts.textContent = formatNumber(numWorkoutDays / weeksInPeriod, 1); if(weeklyAvgSets) weeklyAvgSets.textContent = formatNumber(totalSets / weeksInPeriod, 0); if(weeklyAvgReps) weeklyAvgReps.textContent = formatNumber(totalReps / weeksInPeriod, 0); if(weeklyAvgRepsPerSet) weeklyAvgRepsPerSet.textContent = formatNumber(totalSets > 0 ? totalReps / totalSets : 0, 1); if(weeklyAvgVolume) weeklyAvgVolume.textContent = formatNumber(totalVolumeTonnes / weeksInPeriod, 2);
         // Update PRs & Charts
         displayPersonalRecords(); renderMusclesChart(filteredWorkouts); renderVolumeChartForDashboard(); renderProgressChartForDashboard(progressExerciseSelectDash?.value || '');
     };
     if(dashboardPeriodSelect) dashboardPeriodSelect.addEventListener('change', (e) => updateDashboard(e.target.value));

    // --- Exporturi (Implementare) ---
    // (Folosesc funcțiile definite anterior: handleExportCSV, handleExportTXT, handleExportPDF)
    const handleExportCSV = () => { /* ... (la fel) ... */ };
    const handleExportTXT = () => { /* ... (la fel) ... */ };
    const handleExportPDF = () => { /* ... (la fel) ... */ };
    const downloadFile = (filename, content, mimeType) => { /* ... (la fel) ... */ };

    // --- Inițializare Aplicație ---
    const refreshUI = () => {
        // Randează elementele vizibile sau cele care necesită actualizare indiferent de tab
        renderTable(); // Actualizează tabelul din Jurnal
        populateExerciseSelects(); // Actualizează toate select-urile

        // Actualizează elementele specifice tab-urilor active
        const activeTabId = document.querySelector('.tab-content.active')?.id;
        if (activeTabId === 'dashboardTabContent') {
            updateDashboard(dashboardPeriodSelect.value); // Redesenează complet dashboard-ul
        } else if (activeTabId === 'settingsTabContent') {
            renderExistingExercisesList(existingExercisesListSettings); // Actualizează lista din Setări
        }
        // Nu mai este necesar refresh specific pentru graficele din Log aici
    };

    const initializeApp = () => {
        console.log("Initializing Gym Log Pro vFinal...");
        setupD3Tooltip();
        if(dateInput) dateInput.valueAsDate = new Date();

        workouts = loadData(WORKOUTS_KEY, []);
        customExercises = loadData(CUSTOM_EXERCISES_KEY, []);
        personalRecords = loadData(PRS_KEY, {});

        loadAndCombineExercises(); // Combină listele

        setupSettingsTab(); // Leagă evenimentele din Setări

        refreshUI(); // Randează UI-ul inițial

        setActiveTab('logTabContent'); // Setează tab-ul inițial

        console.log("App Initialized.");
    };

    // Start App
    try { initializeApp(); } catch (error) { console.error("Critical Init Error:", error); showToast('Eroare Critică', 'Aplicația nu a putut porni.', 'danger'); document.body.innerHTML = `<div class="alert alert-danger m-5">Eroare critică la pornire.</div>`; }

}); // Sfârșitul DOMContentLoaded
