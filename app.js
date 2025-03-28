// app.js

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Selectoare DOM ---
    const workoutForm = document.getElementById('workoutForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editIdInput = document.getElementById('editId');
    const dateInput = document.getElementById('date');
    const exerciseSelect = document.getElementById('exercise');
    const muscleGroupsSelect = document.getElementById('muscleGroups'); // NOU
    const setsContainer = document.getElementById('setsContainer');
    const addSetBtn = document.getElementById('addSetBtn');
    const notesInput = document.getElementById('notes');
    const setsWarning = document.getElementById('setsWarning');
    const workoutTableBody = document.querySelector('#workoutTable tbody');
    const noDataMessage = document.getElementById('noDataMessage');
    const filterDate = document.getElementById('filterDate');
    const filterExercise = document.getElementById('filterExercise');
    const filterMuscleGroup = document.getElementById('filterMuscleGroup'); // NOU
    const clearFiltersBtn = document.getElementById('clearFilters');
    const tableHeaders = document.querySelectorAll('#workoutTable thead th[data-column]');
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportTXTBtn = document.getElementById('exportTXT');
    const exportPDFBtn = document.getElementById('exportPDF');
    const newExerciseNameInput = document.getElementById('newExerciseName');
    const addNewExerciseBtn = document.getElementById('addNewExerciseBtn');
    const existingExercisesList = document.getElementById('existingExercisesList');
    const progressExerciseSelect = document.getElementById('progressExerciseSelect');
    const liveToastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(liveToastEl, { delay: 3500 }); // Timp puțin mai lung
    const backupDataBtn = document.getElementById('backupDataBtn'); // NOU
    const restoreFileInput = document.getElementById('restoreFile'); // NOU


    // --- State-ul Aplicației ---
    let workouts = [];
    let exercises = [];
    let customExercises = [];
    let personalRecords = {}; // NOU: { exerciseName: { maxWeight: 100, maxE1rm: 110 }, ... }
    let editingWorkoutId = null;
    let currentSort = { column: 'date', direction: 'desc' };
    let d3Tooltip = null;
    const muscleGroupOptions = Array.from(muscleGroupsSelect.options).map(opt => opt.value); // Preluare grupe din HTML

    // --- Constante & Configurare ---
    const WORKOUTS_KEY = 'workouts_v2'; // Cheie nouă pentru a evita conflicte dacă structura se schimbă major
    const CUSTOM_EXERCISES_KEY = 'customExercises';
    const PRS_KEY = 'personalRecords'; // Cheie pentru PR-uri

    // --- Funcții Utilitare ---
    const generateId = () => '_' + Math.random().toString(36).substring(2, 9);
    const showToast = (title, message, type = 'info') => { /* ... (funcția showToast rămâne la fel) ... */ };

    // NOU: Calcul e1RM (Formula Epley)
    const calculateE1RM = (weight, reps) => {
        if (reps <= 0 || weight <= 0) return 0;
        if (reps === 1) return weight;
        // Formula Epley este rezonabilă pentru reps < 10-12
        return parseFloat((weight * (1 + reps / 30)).toFixed(1));
    };

    // --- Încărcare & Salvare Date (localStorage) ---
    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Eroare la salvarea datelor pentru cheia ${key}:`, e);
            showToast('Eroare Salvare', `Nu am putut salva datele (${key}). Verificați spațiul de stocare.`, 'danger');
        }
    };
    const loadData = (key, defaultValue = []) => {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return defaultValue; // Cheia nu există
            const parsedData = JSON.parse(data);
            // Validare de bază (ex: array pentru workouts/exercises, object pentru PRs)
            if (key === PRS_KEY && (typeof parsedData !== 'object' || Array.isArray(parsedData))) return {};
            if (key !== PRS_KEY && !Array.isArray(parsedData)) return defaultValue;
            return parsedData;
        } catch (e) {
            console.error(`Eroare la încărcarea/parsarea datelor pentru cheia ${key}:`, e);
            // showToast('Eroare Date', `Nu am putut încărca datele pentru ${key}.`, 'warning'); // Poate deveni enervant
            return defaultValue;
        }
    };

    // Funcții specifice de salvare
    const saveWorkouts = () => saveData(WORKOUTS_KEY, workouts);
    const saveCustomExercises = () => saveData(CUSTOM_EXERCISES_KEY, customExercises);
    const savePersonalRecords = () => saveData(PRS_KEY, personalRecords);

    // --- Backup & Restore --- NOU
    backupDataBtn.addEventListener('click', () => {
        try {
            const backupData = {
                workouts: workouts,
                customExercises: customExercises,
                personalRecords: personalRecords,
                backupDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gym_log_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Backup Succes', 'Fișierul de backup a fost descărcat.', 'success');
        } catch (e) {
            console.error("Eroare la crearea backup-ului:", e);
            showToast('Eroare Backup', 'Nu s-a putut genera fișierul de backup.', 'danger');
        }
    });

    restoreFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const restoredData = JSON.parse(e.target.result);
                // Validări simple ale datelor restaurate
                if (typeof restoredData !== 'object' || restoredData === null ||
                    !Array.isArray(restoredData.workouts) ||
                    !Array.isArray(restoredData.customExercises) ||
                    typeof restoredData.personalRecords !== 'object') {
                    throw new Error("Format fișier backup invalid.");
                }

                if (confirm(`ATENȚIE! Aceasta va suprascrie TOATE datele curente (antrenamente, exerciții custom, PR-uri) cu cele din fișierul "${file.name}". Sunteți sigur?`)) {
                    workouts = restoredData.workouts;
                    customExercises = restoredData.customExercises;
                    personalRecords = restoredData.personalRecords;

                    // Salvează datele restaurate în localStorage
                    saveWorkouts();
                    saveCustomExercises();
                    savePersonalRecords();

                    // Reîncarcă complet aplicația pentru a reflecta noile date
                    showToast('Restaurare Succes', 'Datele au fost restaurate. Aplicația se va reîncărca.', 'success');
                    setTimeout(() => window.location.reload(), 1500); // Reîncarcă pagina după un scurt delay
                }
            } catch (err) {
                console.error("Eroare la restaurarea datelor:", err);
                showToast('Eroare Restaurare', `Nu s-a putut restaura din fișier: ${err.message}`, 'danger');
            } finally {
                // Resetează inputul file pentru a permite reîncărcarea aceluiași fișier
                restoreFileInput.value = '';
            }
        };
        reader.onerror = () => {
            showToast('Eroare Fișier', 'Nu s-a putut citi fișierul selectat.', 'danger');
            restoreFileInput.value = '';
        };
        reader.readAsText(file);
    });


    // --- Funcții Core --- (Adaptate)

    const loadAndCombineExercises = async () => { /* ... (rămâne la fel, dar asigură popularea listei 'exercises') ... */ };

    const populateExerciseSelects = () => {
        /* ... (rămâne la fel, populează #exercise și #progressExerciseSelect) ... */

        // NOU: Populează filtrul de grupe musculare
        filterMuscleGroup.innerHTML = '<option value="">Filtrează grupă...</option>';
        muscleGroupOptions.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            filterMuscleGroup.appendChild(option);
        });
    };

    const renderExistingExercisesList = () => { /* ... (rămâne la fel, gestionează ștergerea ex. custom) ... */ };

    const createSetEntry = (reps = '', weight = '') => { /* ... (rămâne la fel) ... */ };

    addSetBtn.addEventListener('click', () => createSetEntry());

    // NOU: Funcție pentru actualizarea PR-urilor
    const updatePersonalRecords = (exerciseName, weight, e1rm) => {
        let updated = false;
        if (!personalRecords[exerciseName]) {
            personalRecords[exerciseName] = { maxWeight: 0, maxE1rm: 0 };
        }
        if (weight > personalRecords[exerciseName].maxWeight) {
            personalRecords[exerciseName].maxWeight = weight;
            updated = true;
            console.log(`New PR Weight for ${exerciseName}: ${weight}kg`);
        }
        if (e1rm > personalRecords[exerciseName].maxE1rm) {
            personalRecords[exerciseName].maxE1rm = e1rm;
            updated = true;
            console.log(`New PR e1RM for ${exerciseName}: ${e1rm}kg`);
        }
        if (updated) {
            savePersonalRecords(); // Salvează doar dacă s-a modificat ceva
        }
        return updated; // Returnează dacă s-a înregistrat un PR nou în acest apel
    };

    // Verificare formular (adaptată pentru grupe musculare)
    const validateForm = () => {
        let isValid = workoutForm.checkValidity(); // Validare HTML5 de bază

        // Validare specifică select multi-opțiune
        if (muscleGroupsSelect.selectedOptions.length === 0) {
            muscleGroupsSelect.classList.add('is-invalid'); // Adaugă clasă invalid
            // Asigură-te că mesajul de invaliditate este vizibil (poate fi necesar CSS specific)
             isValid = false;
        } else {
            muscleGroupsSelect.classList.remove('is-invalid');
        }

        // Validare seturi (rămâne la fel)
        const setEntries = setsContainer.querySelectorAll('.set-entry');
        let validSetsCount = 0;
        if (setEntries.length === 0) {
            isValid = false;
            setsWarning.classList.remove('d-none');
             setsWarning.textContent = 'Adăugați cel puțin un set.';
        } else {
            setEntries.forEach(setDiv => { /* ... (validare seturi rămâne la fel) ... */ });
            if (validSetsCount === 0) { /* ... (mesaj warning seturi invalide) ... */ }
            else { setsWarning.classList.add('d-none'); }
        }

        workoutForm.classList.add('was-validated');
        return isValid;
    };


    // Adăugare/Actualizare Workout (adaptat)
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!validateForm()) {
            showToast('Eroare Formular', 'Verificați câmpurile marcate și adăugați seturi valide.', 'warning');
            return;
        }

        const setsData = [];
        let currentMaxWeight = 0;
        let currentMaxE1rm = 0;
        let newPrDetected = false; // Flag pentru a vedea dacă setul curent conține un PR

        setsContainer.querySelectorAll('.set-entry').forEach(setDiv => {
            const reps = parseInt(setDiv.querySelector('.reps-input').value, 10);
            const weight = parseFloat(setDiv.querySelector('.weight-input').value);

            if (reps > 0 && !isNaN(reps) && weight >= 0 && !isNaN(weight)) {
                const e1rm = calculateE1RM(weight, reps);
                setsData.push({ reps, weight, e1rm }); // Salvăm și e1rm calculat per set
                currentMaxWeight = Math.max(currentMaxWeight, weight);
                currentMaxE1rm = Math.max(currentMaxE1rm, e1rm);
            }
        });

        if (setsData.length === 0) { /* ... (eroare seturi) ... */ return; }

        const exerciseName = exerciseSelect.value;
        // NOU: Verifică și actualizează PR-urile pentru acest exercițiu
        newPrDetected = updatePersonalRecords(exerciseName, currentMaxWeight, currentMaxE1rm);

        // Colectează grupele musculare selectate
        const selectedMuscleGroups = Array.from(muscleGroupsSelect.selectedOptions).map(option => option.value);

        const workoutData = {
            id: editingWorkoutId || generateId(),
            date: dateInput.value,
            exercise: exerciseName,
            muscleGroups: selectedMuscleGroups, // NOU
            sets: setsData,
            notes: notesInput.value.trim(),
            isPr: newPrDetected // NOU: Marcăm dacă această intrare conține un nou PR
        };

        if (editingWorkoutId) {
            const index = workouts.findIndex(w => w.id === editingWorkoutId);
            if (index > -1) {
                // La editare, trebuie re-evaluat dacă intrarea mai este PR (comparativ cu *alte* intrări)
                // Pentru simplitate, eliminăm flagul isPr la editare sau îl recalculăm complex
                // Aici alegem să îl eliminăm, va fi recalculat la afișare dacă e cazul
                 workoutData.isPr = false; // Sau necesită recalculare globală
                workouts[index] = workoutData;
                showToast('Succes', `Antrenamentul pentru ${workoutData.exercise} a fost actualizat.`, 'success');
            } else { /* ... (eroare ID negăsit) ... */ }
        } else {
            workouts.push(workoutData);
            const prMessage = newPrDetected ? ' Felicitări pentru noul Record Personal! ⭐' : '';
            showToast('Succes', `Antrenamentul pentru ${workoutData.exercise} a fost adăugat.${prMessage}`, 'success');
        }

        saveWorkouts();
        resetForm();
        refreshUI();
    });

     const resetForm = () => {
        workoutForm.reset();
        workoutForm.classList.remove('was-validated');
        muscleGroupsSelect.classList.remove('is-invalid'); // Resetează validarea custom
        setsContainer.innerHTML = '';
        setsWarning.classList.add('d-none');
        editingWorkoutId = null;
        editIdInput.value = '';
        formTitle.textContent = 'Adaugă Exercițiu Nou';
        submitBtn.textContent = 'Adaugă Exercițiu';
        cancelEditBtn.classList.add('d-none');
        dateInput.valueAsDate = new Date();
        // Deselectează toate grupele musculare
        Array.from(muscleGroupsSelect.options).forEach(opt => opt.selected = false);
    };

     // Editare Workout (adaptat pentru grupe musculare)
    const editWorkout = (id) => {
        const workout = workouts.find(w => w.id === id);
        if (!workout) { /* ... (eroare workout negăsit) ... */ return; }

        editingWorkoutId = id;
        editIdInput.value = id;
        dateInput.value = workout.date;
        exerciseSelect.value = workout.exercise;
        notesInput.value = workout.notes;

        // Populează seturile (rămâne la fel)
        setsContainer.innerHTML = '';
        (workout.sets || []).forEach(set => createSetEntry(set.reps, set.weight));
        setsWarning.classList.add('d-none');

        // NOU: Pre-selectează grupele musculare
        Array.from(muscleGroupsSelect.options).forEach(option => {
            option.selected = Array.isArray(workout.muscleGroups) && workout.muscleGroups.includes(option.value);
        });

        formTitle.textContent = `Editează: ${workout.exercise} (${workout.date})`;
        submitBtn.textContent = 'Actualizează Exercițiu';
        cancelEditBtn.classList.remove('d-none');
        workoutForm.classList.remove('was-validated');
        muscleGroupsSelect.classList.remove('is-invalid');
        workoutForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Ștergere Workout (rămâne la fel, dar logica de PR poate necesita reevaluare - simplu: nu o facem la ștergere)
    const deleteWorkout = (id) => { /* ... (funcția deleteWorkout rămâne la fel) ... */ };
    const addNewExerciseBtnHandler = () => { /* ... (funcția de adăugare exercițiu rămâne la fel) ... */ };
    addNewExerciseBtn.addEventListener('click', addNewExerciseBtnHandler);
    const deleteCustomExercise = (exerciseName) => { /* ... (funcția de ștergere exercițiu custom rămâne la fel) ... */ };


    // --- Redare Tabel (Adaptat) ---

    // Recalculează PR-urile pe baza tuturor datelor (util după restore sau dacă se suspectează inconsistențe)
    const recalculateAllPRs = () => {
        const newPRs = {};
         workouts.forEach(w => {
            if (!w || !Array.isArray(w.sets) || !w.exercise) return;
             let sessionMaxWeight = 0;
             let sessionMaxE1rm = 0;
             w.sets.forEach(set => {
                 const weight = parseFloat(set.weight);
                 const reps = parseInt(set.reps, 10);
                 if (weight >= 0 && !isNaN(weight) && reps > 0 && !isNaN(reps)) {
                    const e1rm = calculateE1RM(weight, reps);
                     sessionMaxWeight = Math.max(sessionMaxWeight, weight);
                     sessionMaxE1rm = Math.max(sessionMaxE1rm, e1rm);
                 }
             });

             if (!newPRs[w.exercise]) {
                 newPRs[w.exercise] = { maxWeight: 0, maxE1rm: 0 };
             }
             newPRs[w.exercise].maxWeight = Math.max(newPRs[w.exercise].maxWeight, sessionMaxWeight);
             newPRs[w.exercise].maxE1rm = Math.max(newPRs[w.exercise].maxE1rm, sessionMaxE1rm);
         });
        personalRecords = newPRs;
        savePersonalRecords();
        console.log('Recalculated All PRs:', personalRecords);
    };


    // Calculează statistici pentru tabel (include e1RM max, verifică PR)
    const calculateWorkoutStats = (workout) => {
        const stats = { /* ... (setCount, repsMin/Max, weightMin/Max, totalVolume - la fel ca înainte) ... */
            maxE1rm: 0,
            isGlobalPrWeight: false,
            isGlobalPrE1rm: false
        };
        let sessionMaxWeight = 0; // Greutate max din această intrare specifică

        if (stats.setCount > 0) {
            let validSetFound = false;
            (workout.sets || []).forEach(set => {
                 const reps = set.reps;
                 const weight = set.weight;
                 if (typeof reps === 'number' && reps > 0 && typeof weight === 'number' && weight >= 0) {
                     validSetFound = true;
                     stats.repsMin = Math.min(stats.repsMin, reps);
                     /* ... (restul min/max) ... */
                     stats.totalVolume += reps * weight;
                     const e1rm = set.e1rm || calculateE1RM(weight, reps); // Folosește e1rm salvat dacă există
                     stats.maxE1rm = Math.max(stats.maxE1rm, e1rm);
                     sessionMaxWeight = Math.max(sessionMaxWeight, weight);
                 }
            });
             /* ... (formatare repsDisplay, weightDisplay) ... */
        }
        stats.totalVolume = parseFloat(stats.totalVolume.toFixed(1));
        stats.maxE1rm = parseFloat(stats.maxE1rm.toFixed(1));

        // Verifică dacă e PR global (compară cu datele din personalRecords)
        const
