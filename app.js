// app.js

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Selectoare DOM (Extinse) ---
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
    // ... (restul selectorilor pentru formular: editIdInput, dateInput, etc.) ...
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
    const d3VolumeChartEl = document.getElementById('d3VolumeChart'); // Renamed selector
    const progressExerciseSelect = document.getElementById('progressExerciseSelect');
    const d3ProgressChartEl = document.getElementById('d3ProgressChart'); // Renamed selector


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
    const d3MusclesChartEl = document.getElementById('d3MusclesChart'); // Renamed selector
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
    const showToast = (title, message, type = 'info') => {
         // Implementare showToast (la fel ca înainte)
         toastTitle.textContent = title;
         toastBody.textContent = message;
         const header = liveToastEl.querySelector('.toast-header');
         header.className = 'toast-header'; // Reset
         const bgClass = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-info' }[type] || 'text-bg-secondary';
         header.classList.add(bgClass);
         bsToast.show();
     };
    const calculateE1RM = (weight, reps) => { /* ... (la fel ca înainte) ... */ };
    const saveData = (key, data) => { /* ... (la fel ca înainte) ... */ };
    const loadData = (key, defaultValue = []) => { /* ... (la fel ca înainte) ... */ };
    const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
    const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
    const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);

    // --- Logică Tab-uri ---
    const setActiveTab = (targetId) => {
        // Ascunde toate tab-urile
        tabContents.forEach(tab => tab.classList.remove('active'));
        // Dezactivează toate butoanele
        navButtons.forEach(btn => btn.classList.remove('active'));

        // Găsește și activează tab-ul și butonul țintă
        const targetTab = document.getElementById(targetId);
        const targetButton = bottomNav.querySelector(`button[data-target="${targetId}"]`);

        if (targetTab) {
            targetTab.classList.add('active');
        }
        if (targetButton) {
            targetButton.classList.add('active');
        }

        // Dacă activăm dashboard-ul, actualizăm datele
        if (targetId === 'dashboardTabContent') {
            updateDashboard(dashboardPeriodSelect.value);
        }
        // Poți adăuga logica similară pentru alte tab-uri dacă necesită refresh la activare
         // ex: re-render charts in log tab if they were hidden
         if (targetId === 'logTabContent') {
             // Verifică dacă graficele D3 trebuie re-desenate (dacă dimensiunile s-au schimbat etc.)
             // Pentru simplitate, putem doar re-apela funcțiile de randare
             renderVolumeChart(); // S-ar putea să fie nevoie de o versiune a datelor filtrată/nefiltrată
             renderProgressChart(progressExerciseSelect.value);
         }
    };

    // Adaugă event listeners la butoanele de navigare
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.dataset.target;
            setActiveTab(targetTabId);
        });
    });

    // --- Logică Dashboard ---

    // Filtrează workouts după perioadă
    const filterWorkoutsByPeriod = (period) => {
        const now = new Date();
        let startDate = new Date(0); // Începutul timpului

        if (period === 'last7days') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); // Ultimele 7 zile inclusiv azi
        } else if (period === 'last30days') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // Ultimele 30 zile inclusiv azi
        }
         // 'allTime' nu necesită startDate specific

        startDate.setHours(0, 0, 0, 0); // Comparare de la începutul zilei

        return workouts.filter(w => {
            if (!w || !w.date) return false;
            try {
                 // Comparare sigură, chiar dacă w.date este string YYYY-MM-DD
                 const workoutDate = new Date(w.date + 'T00:00:00'); // Asigură comparare corectă a datei locale
                 return workoutDate >= startDate;
            } catch (e) {
                console.warn(`Data invalidă pentru workout ${w.id}: ${w.date}`);
                return false;
            }
        });
    };

    // Funcția principală de actualizare Dashboard
    const updateDashboard = (period) => {
        console.log(`Updating dashboard for period: ${period}`);
        const filteredWorkouts = filterWorkoutsByPeriod(period);
        console.log(`Filtered workouts count: ${filteredWorkouts.length}`);

        let totalExercises = 0;
        let totalSets = 0;
        let totalReps = 0;
        let totalVolumeKg = 0;
        let totalWeightSumForAvg = 0; // Suma greutăților pentru calculul mediei
        let totalWeightedReps = 0; // Număr total de repetări cu greutate > 0
        const muscleGroupCounts = {};
        const workoutDates = new Set(); // Pentru a număra zilele unice de antrenament

        filteredWorkouts.forEach(w => {
             if (!w || !Array.isArray(w.sets)) return;
             totalExercises++; // Numără fiecare intrare ca un exercițiu în perioada respectivă
             workoutDates.add(w.date); // Adaugă data pentru a număra zilele de antrenament

            (w.sets || []).forEach(set => {
                 const reps = parseInt(set.reps, 10);
                 const weight = parseFloat(set.weight);
                 if (!isNaN(reps) && reps > 0 && !isNaN(weight) && weight >= 0) {
                    totalSets++;
                    totalReps += reps;
                    const volumeForSet = reps * weight;
                    totalVolumeKg += volumeForSet;
                     if (weight > 0) {
                         totalWeightSumForAvg += weight * reps; // Suma ponderată a greutății
                         totalWeightedReps += reps;
                     }
                 }
            });

            // Contorizează grupele musculare
             if (Array.isArray(w.muscleGroups)) {
                 w.muscleGroups.forEach(group => {
                     if (group) { // Ignoră grupe goale
                         muscleGroupCounts[group] = (muscleGroupCounts[group] || 0) + 1;
                     }
                 });
             }
        });

         // Calculează metricile
         const avgWeightPerRep = totalWeightedReps > 0 ? (totalWeightSumForAvg / totalWeightedReps) : 0;
         const totalVolumeTon = totalVolumeKg / 1000; // Conversie în tone

         // Calcule Medii Săptămânale
         const numberOfWorkoutDays = workoutDates.size;
         const periodInDays = calculatePeriodDays(period, filteredWorkouts); // Zile în perioada efectivă a datelor
         const numberOfWeeks = Math.max(1, periodInDays / 7); // Evită împărțirea la zero, minim o săptămână

         const weeklyAvgWorkoutCount = numberOfWorkoutDays / numberOfWeeks;
         const weeklyAvgSetCount = totalSets / numberOfWeeks;
         const weeklyAvgRepCount = totalReps / numberOfWeeks;
         const weeklyAvgRepsPerSetCalc = totalSets > 0 ? totalReps / totalSets : 0;
         const weeklyAvgVolumeTon = totalVolumeTon / numberOfWeeks;


         // Actualizează DOM-ul Dashboard
         statsExercises.textContent = totalExercises;
         statsSets.textContent = totalSets;
         statsReps.textContent = totalReps;
         statsAvgWeight.textContent = avgWeightPerRep.toFixed(1);
         statsTotalVolume.textContent = totalVolumeTon.toFixed(2);

         weeklyAvgWorkouts.textContent = weeklyAvgWorkoutCount.toFixed(1);
         weeklyAvgSets.textContent = weeklyAvgSetCount.toFixed(0);
         weeklyAvgReps.textContent = weeklyAvgRepCount.toFixed(0);
         weeklyAvgRepsPerSet.textContent = weeklyAvgRepsPerSetCalc.toFixed(1);
         weeklyAvgVolume.textContent = weeklyAvgVolumeTon.toFixed(2);

         // Actualizează graficul grupelor musculare
         renderMusclesWorkedChart(muscleGroupCounts);
    };

     // Funcție ajutătoare pentru a calcula durata perioadei în zile
     const calculatePeriodDays = (period, filteredData) => {
        if (period === 'allTime') {
             if (filteredData.length === 0) return 1;
             const dates = filteredData.map(w => new Date(w.date + 'T00:00:00')).sort((a, b) => a - b);
             const firstDate = dates[0];
             const lastDate = dates[dates.length - 1];
             // +1 pentru a include ambele capete
             return Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24) + 1);
        } else if (period === 'last30days') {
            return 30;
        } else if (period === 'last7days') {
            return 7;
        }
         return 1; // Default
     };


    // Event listener pentru selectorul de perioadă
    dashboardPeriodSelect.addEventListener('change', (e) => {
        updateDashboard(e.target.value);
    });

    // --- Logică Gestionare Exerciții și Backup/Restore (în tabul Setări) ---
    // Leagă funcțiile existente la noile butoane/inputuri din tabul Setări
    const setupSettingsTab = () => {
         // Adăugare exercițiu
         addNewExerciseBtnSettings.addEventListener('click', () => {
             // Folosește inputul din tabul Setări
             const newExName = newExerciseNameSettings.value.trim();
              if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) {
                 customExercises.push(newExName);
                 customExercises.sort((a, b) => a.localeCompare(b));
                 saveCustomExercises();
                 // Actualizează lista globală și UI-ul
                 loadAndCombineExercises().then(() => {
                     newExerciseNameSettings.value = ''; // Golește inputul din setări
                     showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat.`, 'success');
                 });
             } else if (!newExName) {
                 showToast('Invalid', 'Introduceți un nume valid.', 'warning');
             } else {
                 showToast('Existent', `"${newExName}" este deja în listă.`, 'warning');
             }
         });

         // Backup/Restore - leagă la butoanele/inputurile din tabul Setări
         backupDataBtnSettings.addEventListener('click', () => backupDataBtn.click()); // Simulează click pe butonul logic
         restoreFileInputSettings.addEventListener('change', (event) => restoreFileInput.dispatchEvent(new Event('change', event))); // Transferă eventul

          // Afișează lista inițială
         renderExistingExercisesList(existingExercisesListSettings); // Pasează elementul listei din Setări
    };

    // Modifică renderExistingExercisesList pentru a accepta elementul listei ca parametru
    const renderExistingExercisesList = (listElement) => {
         if (!listElement) return; // Verificare siguranță
         listElement.innerHTML = ''; // Clear list
        const displayExercises = customExercises; // Afișăm doar cele custom în setări
        if (displayExercises.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted list-group-item-sm';
            li.textContent = 'Nu ai adăugat exerciții proprii.';
            listElement.appendChild(li);
            return;
        }
        displayExercises.forEach(ex => {
             const li = document.createElement('li');
             li.className = 'list-group-item list-group-item-sm d-flex justify-content-between align-items-center';
             li.textContent = ex;
             const deleteBtn = document.createElement('button');
             deleteBtn.className = 'btn btn-outline-danger btn-sm py-0 px-1';
             deleteBtn.innerHTML = '×';
             deleteBtn.title = `Șterge "${ex}"`;
             deleteBtn.onclick = () => deleteCustomExercise(ex, listElement); // Pasează și elementul listei
             li.appendChild(deleteBtn);
             listElement.appendChild(li);
         });
    };

     // Modifică deleteCustomExercise pentru a re-randa lista corectă
     const deleteCustomExercise = (exerciseName, listElementToUpdate) => {
          // ... (logica de confirmare rămâne la fel) ...
         customExercises = customExercises.filter(ex => ex !== exerciseName);
         saveCustomExercises();
         loadAndCombineExercises().then(() => {
             renderExistingExercisesList(listElementToUpdate); // Re-randează lista specifică
             showToast('Exercițiu Șters', `"${exerciseName}" a fost șters.`, 'info');
         });
     };


    // --- Funcții Core (Formular, Tabel, Grafice - majoritatea adaptate ușor) ---
    const validateForm = () => { /* ... (adaptat pt grupe) ... */ };
    const createSetEntry = (reps = '', weight = '') => { /* ... (la fel) ... */ };
    const updatePersonalRecords = (exerciseName, weight, e1rm) => { /* ... (la fel) ... */ };
    const resetForm = () => { /* ... (adaptat pt grupe) ... */ };
    workoutForm.addEventListener('submit', (e) => { /* ... (adaptat pt grupe, PR) ... */ });
    cancelEditBtn.addEventListener('click', resetForm);
    const editWorkout = (id) => { /* ... (adaptat pt grupe) ... */ };
    const deleteWorkout = (id) => { /* ... (la fel, dar refreshUI la final) ... */ };
    const recalculateAllPRs = () => { /* ... (la fel) ... */ };
    const calculateWorkoutStats = (workout) => { /* ... (adaptat pt PR-uri) ... */ };
    const renderTable = () => { /* ... (adaptat pt filtrare grupe, afișare PR) ... */ };
    const updateSortIcons = () => { /* ... (la fel) ... */ };
    // Event listeners filtre/sortare (inclusiv filterMuscleGroup)
    filterDate.addEventListener('input', renderTable);
    filterExercise.addEventListener('input', renderTable);
    filterMuscleGroup.addEventListener('input', renderTable); // NOU
    clearFiltersBtn.addEventListener('click', () => {
        filterDate.value = '';
        filterExercise.value = '';
        filterMuscleGroup.value = ''; // Resetează filtrul nou
        renderTable();
    });
    tableHeaders.forEach(th => { th.addEventListener('click', () => { /* ... (logica sortare adaptată pt coloane noi) ... */ }); });

    // --- Grafice D3 ---
    const setupD3Tooltip = () => { /* ... (la fel) ... */ };
    const showD3Tooltip = (event, content) => { /* ... (la fel) ... */ };
    const hideD3Tooltip = () => { /* ... (la fel) ... */ };
    const setupChart = (svgId, desiredWidth, desiredHeight) => { /* ... (la fel) ... */ };
    const renderVolumeChart = () => { /* ... (la fel, folosește d3VolumeChartEl) ... */ };
    const renderProgressChart = (selectedExercise) => { /* ... (la fel, folosește d3ProgressChartEl, tooltip adaptat pt e1RM) ... */ };

    // NOU: Grafic Grupe Musculare (Dashboard) - Bar Chart simplu
    const renderMusclesWorkedChart = (muscleCounts) => {
        const chartConfig = setupChart('d3MusclesChart', 500, 250); // ID și dimensiuni noi
        if (!chartConfig) return;
        const { svg, innerWidth, innerHeight, margin } = chartConfig;

        const data = Object.entries(muscleCounts)
            .map(([group, count]) => ({ group, count }))
            .filter(d => d.count > 0) // Afișează doar grupele lucrate
            .sort((a, b) => b.count - a.count); // Sortează descrescător

        if (data.length === 0) {
            noMuscleDataMessage.classList.remove('d-none');
             d3.select('#d3MusclesChart').selectAll('*').remove(); // Curăță SVG-ul explicit
            return;
        } else {
            noMuscleDataMessage.classList.add('d-none');
        }

        const x = d3.scaleBand()
            .domain(data.map(d => d.group))
            .range([0, innerWidth])
            .padding(0.4); // Spațiere mai mare între bare

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 1])
            .nice()
            .range([innerHeight, 0]);

        // Axe (simplificate)
  
