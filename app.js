// app.js - Gym Log Pro Logic

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and State ---
    const WORKOUT_STORAGE_KEY = 'gymLogProWorkouts';
    const EXERCISE_STORAGE_KEY = 'gymLogProCustomExercises';
    const PR_STORAGE_KEY = 'gymLogProPersonalRecords';
    let workouts = loadData(WORKOUT_STORAGE_KEY, []);
    let customExercises = loadData(EXERCISE_STORAGE_KEY, []);
    let personalRecords = loadData(PR_STORAGE_KEY, {}); // { exerciseName: { weight: val, volume: val, e1rm: val }, ... }
    let predefinedExercises = []; // Loaded from JSON
    let currentSort = { column: 'date', order: 'desc' };
    let editingId = null; // Track if we are editing

    // --- DOM Elements ---
    // General
    const toastElement = document.getElementById('liveToast');
    const toastTitleElement = document.getElementById('toastTitle');
    const toastBodyElement = document.getElementById('toastBody');
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
    const bottomNavButtons = document.querySelectorAll('#bottomNav button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Log Tab
    const workoutForm = document.getElementById('workoutForm');
    const formTitle = document.getElementById('formTitle');
    const dateInput = document.getElementById('date');
    const muscleGroupsSelect = document.getElementById('muscleGroups');
    const exerciseSelect = document.getElementById('exercise');
    const setsContainer = document.getElementById('setsContainer');
    const addSetBtn = document.getElementById('addSetBtn');
    const notesInput = document.getElementById('notes');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editIdInput = document.getElementById('editId');
    const setsWarning = document.getElementById('setsWarning');
    const workoutTableBody = document.querySelector('#workoutTable tbody');
    const noDataMessage = document.getElementById('noDataMessage');
    const filterDateInput = document.getElementById('filterDate');
    const filterExerciseInput = document.getElementById('filterExercise');
    const filterMuscleGroupSelect = document.getElementById('filterMuscleGroup');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const tableHeaders = document.querySelectorAll('#workoutTable th[data-column]');

    // Dashboard Tab
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
    const d3MusclesChartContainer = document.getElementById('musclesWorkedChartContainer');
    const d3MusclesChartSvg = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const d3VolumeChartDashSvg = document.getElementById('d3VolumeChartDash');
    const d3ProgressChartDashSvg = document.getElementById('d3ProgressChartDash');
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');

    // Settings Tab
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileSettings = document.getElementById('restoreFileSettings');
    const exportCSVSettings = document.getElementById('exportCSVSettings');
    const exportTXTSettings = document.getElementById('exportTXTSettings');
    const exportPDFSettings = document.getElementById('exportPDFSettings');

    // --- Initialization ---
    async function initializeApp() {
        showTab('logTabContent'); // Start on Log tab
        setDefaultDate();
        await loadPredefinedExercises();
        populateExerciseDropdown();
        populateMuscleGroupFilter();
        renderWorkoutTable();
        updateDashboard(); // Initial dashboard render
        renderCustomExercisesList();
        setupEventListeners();
        addSetRow(); // Add the first set row by default
    }

    // --- Data Handling ---
    function loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error loading data for key "${key}":`, e);
            showToast('Eroare', 'Nu s-au putut încărca datele.', 'danger');
            return defaultValue;
        }
    }

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving data for key "${key}":`, e);
            showToast('Eroare Salvare', 'Nu s-au putut salva datele (posibil spațiu insuficient).', 'danger');
        }
    }

    async function loadPredefinedExercises() {
        try {
            const response = await fetch('exercises.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            predefinedExercises = await response.json();
            predefinedExercises.sort(); // Sort alphabetically
        } catch (error) {
            console.error('Error loading predefined exercises:', error);
            showToast('Eroare Încărcare', 'Nu s-a putut încărca lista de exerciții predefinite.', 'warning');
            predefinedExercises = ["Bench Press", "Squat", "Deadlift"]; // Fallback basic list
        }
    }

    // --- UI Functions ---
    function showToast(title, message, type = 'success') {
        toastTitleElement.textContent = title;
        toastBodyElement.textContent = message;
        // Reset classes
        toastElement.classList.remove('text-bg-success', 'text-bg-warning', 'text-bg-danger', 'text-bg-info');
        // Add appropriate class
        if (type === 'success') toastElement.classList.add('text-bg-success');
        else if (type === 'warning') toastElement.classList.add('text-bg-warning');
        else if (type === 'danger') toastElement.classList.add('text-bg-danger');
        else if (type === 'info') toastElement.classList.add('text-bg-info');
        else toastElement.classList.add('text-bg-secondary'); // Default

        toast.show();
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function populateExerciseDropdown() {
        const allExercises = [...predefinedExercises, ...customExercises].sort();
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>'; // Reset
        progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>'; // Reset dash select too

        const uniqueExercisesInLog = [...new Set(workouts.map(w => w.exercise))].sort();

        allExercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            exerciseSelect.appendChild(option);
        });

        uniqueExercisesInLog.forEach(ex => {
             const option = document.createElement('option');
             option.value = ex;
             option.textContent = ex;
             progressExerciseSelectDash.appendChild(option.cloneNode(true)); // Clone for dash
         });
    }

    function populateMuscleGroupFilter() {
        const muscleGroups = [...new Set(workouts.flatMap(w => w.muscleGroups))].sort();
        filterMuscleGroupSelect.innerHTML = '<option value="">Filtrează grupă...</option>'; // Reset
        muscleGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            filterMuscleGroupSelect.appendChild(option);
        });
    }

    function resetForm() {
        workoutForm.reset();
        workoutForm.classList.remove('was-validated');
        setDefaultDate();
        muscleGroupsSelect.selectedIndex = -1; // Deselect all in multiple select
        exerciseSelect.value = "";
        setsContainer.innerHTML = ''; // Clear existing sets
        addSetRow(); // Add one empty set row back
        notesInput.value = '';
        editingId = null;
        editIdInput.value = '';
        formTitle.textContent = 'Adaugă Exercițiu';
        submitBtn.textContent = 'Salvează';
        cancelEditBtn.classList.add('d-none');
        setsWarning.classList.add('d-none');
    }

    function addSetRow(reps = '', weight = '') {
        const setDiv = document.createElement('div');
        setDiv.classList.add('row', 'g-2', 'mb-2', 'set-row', 'align-items-center');
        setDiv.innerHTML = `
            <div class="col">
                <input type="number" class="form-control form-control-sm reps-input" placeholder="Rep." min="0" value="${reps}" required>
                <div class="invalid-feedback" style="font-size: 0.75rem;">Rep. necesare.</div>
            </div>
            <div class="col">
                <input type="number" class="form-control form-control-sm weight-input" placeholder="Kg" min="0" step="0.01" value="${weight}" required>
                 <div class="invalid-feedback" style="font-size: 0.75rem;">Greutate necesară.</div>
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-outline-danger btn-sm remove-set-btn" title="Șterge Set"><i class="bi bi-x-lg"></i></button>
            </div>
        `;
        setsContainer.appendChild(setDiv);
        setDiv.querySelector('.remove-set-btn').addEventListener('click', () => {
            if (setsContainer.children.length > 1) {
                setDiv.remove();
            } else {
                showToast('Atenție', 'Trebuie să existe cel puțin un set.', 'warning');
            }
             validateSets(); // Re-validate after removal
        });

        // Add validation listeners for the new inputs
        setDiv.querySelectorAll('.reps-input, .weight-input').forEach(input => {
             input.addEventListener('input', validateSets);
         });
         validateSets(); // Initial validation check
    }

     function validateSets() {
         const setRows = setsContainer.querySelectorAll('.set-row');
         let isValid = true;
         if (setRows.length === 0) {
             isValid = false;
         } else {
             setRows.forEach(row => {
                 const repsInput = row.querySelector('.reps-input');
                 const weightInput = row.querySelector('.weight-input');
                 if (!repsInput.value || repsInput.value < 0 || !weightInput.value || weightInput.value < 0) {
                     isValid = false;
                 }
             });
         }

         if (!isValid) {
             setsWarning.classList.remove('d-none');
         } else {
             setsWarning.classList.add('d-none');
         }
         return isValid;
     }


    function getSetsData() {
        const sets = [];
        const setRows = setsContainer.querySelectorAll('.set-row');
        setRows.forEach(row => {
            const reps = row.querySelector('.reps-input').value;
            const weight = row.querySelector('.weight-input').value;
            if (reps && weight && reps >= 0 && weight >= 0) { // Ensure valid numbers
                sets.push({ reps: parseInt(reps, 10), weight: parseFloat(weight) });
            }
        });
        return sets;
    }

    function renderWorkoutTable() {
        workoutTableBody.innerHTML = ''; // Clear existing rows
        const filteredWorkouts = filterAndSortWorkouts();

        if (filteredWorkouts.length === 0) {
            noDataMessage.classList.remove('d-none');
            workoutTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">Nu s-au găsit înregistrări conform filtrelor.</td></tr>';
            return;
        }

        noDataMessage.classList.add('d-none');

        filteredWorkouts.forEach(workout => {
            const row = workoutTableBody.insertRow();
            row.dataset.id = workout.id;

            const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);
            const totalWeight = workout.sets.reduce((sum, set) => sum + set.weight, 0);
            const avgWeight = workout.sets.length > 0 ? (totalWeight / workout.sets.length) : 0;
            const volume = calculateVolume([workout]); // Calculate volume for this specific entry
            const maxE1RM = calculateMaxE1RM(workout.sets);
            const isPR = checkForPR(workout.exercise, avgWeight, volume, maxE1RM); // Check if this entry set a PR

            row.innerHTML = `
                <td>${formatDate(workout.date)}</td>
                <td>${workout.exercise} ${isPR ? '<span class="pr-indicator" title="Record Personal stabilit la această dată!"><i class="bi bi-star-fill"></i></span>' : ''}</td>
                <td><small>${workout.muscleGroups.join(', ')}</small></td>
                <td class="text-center">${workout.sets.length}</td>
                <td class="text-center d-none d-md-table-cell">${totalReps}</td>
                <td class="text-center">${avgWeight.toFixed(1)} kg</td>
                <td class="text-end">${volume.toFixed(1)}</td>
                <td class="text-end d-none d-lg-table-cell">${maxE1RM.toFixed(1)} kg</td>
                <td class="d-none d-lg-table-cell"><small title="${workout.notes || ''}">${workout.notes ? workout.notes.substring(0, 30) + (workout.notes.length > 30 ? '...' : '') : '-'}</small></td>
                <td class="text-nowrap">
                    <button class="btn btn-sm btn-outline-primary edit-btn" title="Editează"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" title="Șterge"><i class="bi bi-trash-fill"></i></button>
                </td>
            `;
        });

        // Add event listeners for edit/delete buttons after rendering
        addTableActionListeners();
    }

    function addTableActionListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    function showTab(tabId) {
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        bottomNavButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        const activeTab = document.getElementById(tabId);
        const activeButton = document.querySelector(`#bottomNav button[data-target="${tabId}"]`);

        if (activeTab) activeTab.classList.add('active');
        if (activeButton) activeButton.classList.add('active');

        // Refresh dynamic content when tab becomes active
        if (tabId === 'dashboardTabContent') {
            updateDashboard();
        } else if (tabId === 'settingsTabContent') {
            renderCustomExercisesList();
        } else if (tabId === 'logTabContent') {
             renderWorkoutTable(); // Re-render table in case filters changed
             populateExerciseDropdown(); // Refresh dropdown if exercises were added/removed
             populateMuscleGroupFilter(); // Refresh filter options
        }
    }

    // --- Calculations ---
    function calculateVolume(workoutArray) {
        return workoutArray.reduce((totalVol, workout) => {
            const entryVol = workout.sets.reduce((vol, set) => vol + (set.reps * set.weight), 0);
            return totalVol + entryVol;
        }, 0);
    }

    // Brzycki formula for e1RM (estimated 1 Rep Max)
    function calculateE1RM(weight, reps) {
        if (reps <= 0) return 0;
        if (reps === 1) return weight;
        // Formula: weight / ( 1.0278 – 0.0278 × reps )
        // Avoid division by zero or negative numbers if reps are too high
        const denominator = 1.0278 - (0.0278 * reps);
        return denominator > 0 ? weight / denominator : 0;
    }

    function calculateMaxE1RM(sets) {
        if (!sets || sets.length === 0) return 0;
        return Math.max(...sets.map(set => calculateE1RM(set.weight, set.reps)));
    }

     function updatePersonalRecords(exercise, sets) {
         const currentMaxWeightSet = sets.reduce((maxSet, currentSet) => {
             return currentSet.weight > (maxSet.weight || 0) ? currentSet : maxSet;
         }, { weight: 0, reps: 0 });
         const currentMaxWeight = currentMaxWeightSet.weight;
         const currentMaxE1RM = calculateMaxE1RM(sets);
         // Volume for the single entry (not aggregated) - might need rethinking if PR definition changes
         const currentVolume = sets.reduce((vol, set) => vol + (set.reps * set.weight), 0);

         let recordUpdated = false;
         if (!personalRecords[exercise]) {
             personalRecords[exercise] = { weight: 0, volume: 0, e1rm: 0, date: '' };
         }

         const record = personalRecords[exercise];
         const workoutDate = dateInput.value; // Get date from the form

         if (currentMaxWeight > record.weight) {
             record.weight = currentMaxWeight;
             record.weightDate = workoutDate;
             recordUpdated = true;
         }
         if (currentVolume > record.volume) {
             record.volume = currentVolume;
             record.volumeDate = workoutDate;
             recordUpdated = true;
         }
          if (currentMaxE1RM > record.e1rm) {
             record.e1rm = currentMaxE1RM;
             record.e1rmDate = workoutDate;
             recordUpdated = true;
         }


         if (recordUpdated) {
             saveData(PR_STORAGE_KEY, personalRecords);
             console.log(`PR updated for ${exercise}:`, record);
             return true; // Indicate a PR was set/updated
         }
         return false; // No new PR
     }

     function checkForPR(exercise, avgWeight, volume, maxE1RM) {
        // This function checks if the *currently displayed* data point in the table
        // corresponds to the date when a PR was set. It doesn't re-calculate PRs here.
        const record = personalRecords[exercise];
        if (!record) return false;

        // We need the date of the workout entry being checked
        // This requires modifying renderWorkoutTable to pass the date or look it up
        // For simplicity now, we assume this check happens right after adding/editing
        // A better approach would involve storing the workout ID with the PR.
        // Let's compare values for now as a proxy:
        // return record.weight === avgWeight || record.volume === volume || record.e1rm === maxE1RM;
        // A simpler check: was *any* PR for this exercise updated very recently?
        // This isn't perfect but avoids complex date tracking for now.
        return (record.e1rm > 0 && record.e1rm.toFixed(1) === maxE1RM.toFixed(1)) ||
               (record.weight > 0 && record.weight.toFixed(1) === avgWeight.toFixed(1)) || // Comparing avg weight isn't ideal for PRs
               (record.volume > 0 && record.volume.toFixed(1) === volume.toFixed(1));
     }

    // --- Event Handlers ---
    function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const isValid = workoutForm.checkValidity();
        const areSetsValid = validateSets(); // Explicitly validate sets

        workoutForm.classList.add('was-validated');

        if (!isValid || !areSetsValid) {
             if (!areSetsValid) {
                 showToast('Eroare Formular', 'Verificați seturile introduse (Rep. și Kg obligatorii).', 'warning');
             } else {
                 showToast('Eroare Formular', 'Vă rugăm completați câmpurile obligatorii.', 'warning');
             }
            return;
        }

        const selectedMuscleGroups = Array.from(muscleGroupsSelect.selectedOptions).map(option => option.value);
        const workoutData = {
            id: editingId || Date.now().toString(), // Use existing ID if editing, else generate new
            date: dateInput.value,
            muscleGroups: selectedMuscleGroups,
            exercise: exerciseSelect.value,
            sets: getSetsData(),
            notes: notesInput.value.trim()
        };

        if (editingId) {
            // Update existing workout
            const index = workouts.findIndex(w => w.id === editingId);
            if (index > -1) {
                workouts[index] = workoutData;
                showToast('Succes', 'Antrenament actualizat cu succes!');
            }
        } else {
            // Add new workout
            workouts.push(workoutData);
            showToast('Succes', 'Antrenament adăugat cu succes!');
        }

        const prSet = updatePersonalRecords(workoutData.exercise, workoutData.sets);
        if (prSet && !editingId) {
            showToast('Record Personal!', `Nou record stabilit pentru ${workoutData.exercise}!`, 'info');
        }

        saveData(WORKOUT_STORAGE_KEY, workouts);
        renderWorkoutTable();
        populateMuscleGroupFilter(); // Update filters in case of new group combo
        populateExerciseDropdown(); // Update progress dropdown if new exercise logged
        resetForm();
    }

    function handleEdit(event) {
        const button = event.target.closest('button');
        const row = button.closest('tr');
        const id = row.dataset.id;
        const workout = workouts.find(w => w.id === id);

        if (!workout) return;

        editingId = id;
        editIdInput.value = id;
        formTitle.textContent = 'Editează Exercițiu';
        submitBtn.textContent = 'Actualizează';
        cancelEditBtn.classList.remove('d-none');

        dateInput.value = workout.date;
        // Select multiple muscle groups
        Array.from(muscleGroupsSelect.options).forEach(option => {
            option.selected = workout.muscleGroups.includes(option.value);
        });
        exerciseSelect.value = workout.exercise;
        notesInput.value = workout.notes;

        // Populate sets
        setsContainer.innerHTML = ''; // Clear existing before adding
        workout.sets.forEach(set => addSetRow(set.reps, set.weight));

         validateSets(); // Validate sets after populating

        // Scroll to form for better UX
        workoutForm.scrollIntoView({ behavior: 'smooth' });
    }

    function handleDelete(event) {
        const button = event.target.closest('button');
        const row = button.closest('tr');
        const id = row.dataset.id;
        const workout = workouts.find(w => w.id === id);

        if (!workout) return;

        // Confirmation Dialog (using browser's confirm for simplicity)
        if (confirm(`Sunteți sigur că doriți să ștergeți înregistrarea pentru ${workout.exercise} din ${formatDate(workout.date)}?`)) {
            workouts = workouts.filter(w => w.id !== id);
            saveData(WORKOUT_STORAGE_KEY, workouts);
            renderWorkoutTable();
            populateMuscleGroupFilter(); // Update filters
            // Note: PRs are NOT automatically recalculated/removed on delete.
            // Recalculating PRs would require iterating through all remaining workouts.
            showToast('Șters', 'Înregistrarea a fost ștearsă.', 'success');
        }
    }

    function handleCancelEdit() {
        resetForm();
    }

    function handleFilterChange() {
        renderWorkoutTable();
    }

    function handleClearFilters() {
        filterDateInput.value = '';
        filterExerciseInput.value = '';
        filterMuscleGroupSelect.value = '';
        renderWorkoutTable();
    }

    function handleSort(event) {
        const header = event.target.closest('th');
        if (!header || !header.dataset.column) return;

        const column = header.dataset.column;

        if (currentSort.column === column) {
            currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.order = 'asc'; // Default to ascending for new column
        }

        // Update icons
        tableHeaders.forEach(th => {
            const icon = th.querySelector('.sort-icon');
            if (icon) {
                 icon.className = 'sort-icon bi'; // Reset
                 if (th.dataset.column === currentSort.column) {
                     icon.classList.add(currentSort.order === 'asc' ? 'bi-sort-up' : 'bi-sort-down');
                 }
            }
        });


        renderWorkoutTable();
    }

    function filterAndSortWorkouts() {
        const dateFilter = filterDateInput.value;
        const exerciseFilter = filterExerciseInput.value.toLowerCase();
        const muscleGroupFilter = filterMuscleGroupSelect.value;

        let filtered = workouts.filter(w => {
            const matchDate = !dateFilter || w.date === dateFilter;
            const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter);
            const matchMuscleGroup = !muscleGroupFilter || w.muscleGroups.includes(muscleGroupFilter);
            return matchDate && matchExercise && matchMuscleGroup;
        });

        // Sorting
        filtered.sort((a, b) => {
            let valA, valB;

            switch (currentSort.column) {
                case 'date':
                    valA = new Date(a.date);
                    valB = new Date(b.date);
                    break;
                case 'exercise':
                    valA = a.exercise.toLowerCase();
                    valB = b.exercise.toLowerCase();
                    break;
                case 'muscleGroups':
                    valA = a.muscleGroups.join(', ').toLowerCase();
                    valB = b.muscleGroups.join(', ').toLowerCase();
                    break;
                case 'sets':
                     valA = a.sets.length;
                     valB = b.sets.length;
                     break;
                case 'volume':
                    valA = calculateVolume([a]);
                    valB = calculateVolume([b]);
                    break;
                case 'e1rm':
                    valA = calculateMaxE1RM(a.sets);
                    valB = calculateMaxE1RM(b.sets);
                    break;
                default:
                    return 0; // No sort if column unknown
            }

            if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }

    // --- Dashboard ---
    function getWorkoutsForPeriod(period) {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'last7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'last30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'allTime':
                return workouts; // Return all workouts
            default:
                startDate.setDate(now.getDate() - 7); // Default to last 7 days
        }
        const startTime = startDate.getTime();
        return workouts.filter(w => new Date(w.date).getTime() >= startTime);
    }

    function updateDashboard() {
        const period = dashboardPeriodSelect.value;
        const periodWorkouts = getWorkoutsForPeriod(period);

        // --- 1. Calculate Summary Stats ---
        const totalEntries = periodWorkouts.length;
        const totalSets = periodWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
        const totalReps = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0);
        const totalWeightSum = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.weight, 0), 0);
        const totalWeightEntries = periodWorkouts.reduce((sum, w) => sum + w.sets.filter(s => s.weight > 0).length, 0); // Count only sets with weight > 0 for avg
        const avgWeight = totalWeightEntries > 0 ? (totalWeightSum / totalWeightEntries) : 0;
        const totalVolume = calculateVolume(periodWorkouts);

        statsExercises.textContent = totalEntries;
        statsSets.textContent = totalSets;
        statsReps.textContent = totalReps;
        statsAvgWeight.textContent = avgWeight.toFixed(1) + ' kg';
        statsTotalVolume.textContent = (totalVolume / 1000).toFixed(2) + ' T'; // Display in Tonnes

        // --- 2. Calculate Weekly Averages (Estimate) ---
        let daysInPeriod = 7;
        if (period === 'last30days') daysInPeriod = 30;
        else if (period === 'allTime') {
            if (workouts.length > 0) {
                const firstDate = new Date(workouts[0].date); // Assuming sorted by date asc initially or find min date
                const lastDate = new Date(workouts[workouts.length - 1].date); // Assuming sorted by date desc after load or find max date
                 // Make sure dates are sorted for accurate calculation
                 const sortedByDate = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
                 const minDate = sortedByDate.length > 0 ? new Date(sortedByDate[0].date) : new Date();
                 const maxDate = sortedByDate.length > 0 ? new Date(sortedByDate[sortedByDate.length - 1].date) : new Date();
                daysInPeriod = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24)); // Avoid division by zero
            } else {
                daysInPeriod = 1; // Avoid division by zero
            }
        }
        const weeksInPeriod = Math.max(1, daysInPeriod / 7); // Ensure at least 1 week to avoid division by zero

        // Find unique workout days
        const uniqueWorkoutDays = new Set(periodWorkouts.map(w => w.date)).size;

        weeklyAvgWorkouts.textContent = (uniqueWorkoutDays / weeksInPeriod).toFixed(1);
        weeklyAvgSets.textContent = (totalSets / weeksInPeriod).toFixed(1);
        weeklyAvgReps.textContent = (totalReps / weeksInPeriod).toFixed(1);
        weeklyAvgRepsPerSet.textContent = totalSets > 0 ? (totalReps / totalSets).toFixed(1) : '0';
        weeklyAvgVolume.textContent = ((totalVolume / 1000) / weeksInPeriod).toFixed(2) + ' T';

        // --- 3. Render Personal Records (Top 5 based on e1RM) ---
        renderPersonalRecords();

        // --- 4. Render Muscle Groups Chart ---
        renderMuscleGroupsChart(periodWorkouts);

        // --- 5. Render Volume Chart ---
        renderVolumeChartDash(periodWorkouts);

        // --- 6. Render Progress Chart (if an exercise is selected) ---
        handleProgressExerciseChangeDash(); // Render based on current selection
    }

    function renderPersonalRecords() {
        personalRecordsList.innerHTML = ''; // Clear list
        const sortedRecords = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => record.e1rm > 0 || record.weight > 0 || record.volume > 0) // Filter out empty records
            .sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0)); // Sort by e1RM descending

        if (sortedRecords.length === 0) {
            noPrMessage.classList.remove('d-none');
            return;
        }

        noPrMessage.classList.add('d-none');
        const top5 = sortedRecords.slice(0, 5);

        top5.forEach(record => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.innerHTML = `
                <span class="pr-exercise">${record.exercise}</span>
                <div>
                    ${record.e1rm > 0 ? `<span class="badge bg-primary rounded-pill me-1" title="Estimat 1 Rep Max (la data ${formatDate(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)} <span class="pr-type">kg</span></span>` : ''}
                    ${record.weight > 0 ? `<span class="badge bg-success rounded-pill me-1" title="Greutate maximă ridicată (la data ${formatDate(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)} <span class="pr-type">kg</span></span>` : ''}
                    ${record.volume > 0 ? `<span class="badge bg-warning text-dark rounded-pill" title="Volum maxim într-o sesiune (la data ${formatDate(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(1)} <span class="pr-type">vol</span></span>` : ''}
                </div>
            `;
            personalRecordsList.appendChild(li);
        });
    }

     function renderMuscleGroupsChart(data) {
         const muscleCounts = data.reduce((acc, workout) => {
             workout.muscleGroups.forEach(group => {
                 acc[group] = (acc[group] || 0) + 1; // Count occurrences
             });
             return acc;
         }, {});

         const sortedMuscles = Object.entries(muscleCounts)
             .sort(([, a], [, b]) => b - a) // Sort descending by count
             .slice(0, 10); // Take top 10

         const svg = d3.select("#d3MusclesChart");
         svg.selectAll("*").remove(); // Clear previous chart

         if (sortedMuscles.length === 0) {
             noMuscleDataMessage.classList.remove('d-none');
             d3MusclesChartContainer.style.display = 'block'; // Ensure container visible
             svg.style('display', 'none'); // Hide SVG element itself
             return;
         } else {
             noMuscleDataMessage.classList.add('d-none');
             d3MusclesChartContainer.style.display = 'block';
             svg.style('display', 'block');
         }


         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 20, bottom: 70, left: 40 }; // Increased bottom margin for labels
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleBand()
             .range([0, chartWidth])
             .padding(0.2) // Increased padding slightly
             .domain(sortedMuscles.map(d => d[0])); // Muscle names

         const y = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(sortedMuscles, d => d[1]) || 1]); // Max count, ensure domain >= 1

         // X Axis
         g.append("g")
             .attr("transform", `translate(0,${chartHeight})`)
             .call(d3.axisBottom(x))
             .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("dx", "-.8em")
                 .attr("dy", ".15em")
                 .attr("transform", "rotate(-45)"); // Rotate labels

         // Y Axis
         g.append("g")
             .call(d3.axisLeft(y).ticks(Math.min(5, d3.max(sortedMuscles, d => d[1]) || 1)).tickFormat(d3.format("d"))) // Fewer ticks, integer format
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "#adb5bd")
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", "-3.0em") // Adjust position further left
                 .attr("text-anchor", "end")
                 .text("Nr. Sesiuni");

         // Bars
         g.selectAll(".muscle-bar")
             .data(sortedMuscles)
             .enter().append("rect")
                 .attr("class", "muscle-bar") // Use CSS class for fill
                 .attr("x", d => x(d[0]))
                 .attr("y", d => y(d[1]))
                 .attr("width", x.bandwidth())
                 .attr("height", d => chartHeight - y(d[1]))
             .append("title") // Simple tooltip
                 .text(d => `${d[0]}: ${d[1]} sesiuni`);

         // Labels on bars (optional, can get crowded)
         g.selectAll(".bar-label")
             .data(sortedMuscles)
             .enter().append("text")
             .attr("class", "bar-label")
             .attr("x", d => x(d[0]) + x.bandwidth() / 2)
             .attr("y", d => y(d[1]) - 5) // Position above bar
             .attr("text-anchor", "middle")
             .text(d => d[1]);
     }

     function renderVolumeChartDash(data) {
         const svg = d3.select("#d3VolumeChartDash");
         svg.selectAll("*").remove();

         if (data.length === 0) return; // No data to plot

         // Aggregate volume per day
         const volumeByDate = d3.rollup(data,
             v => d3.sum(v, d => calculateVolume([d])), // Sum volume for workouts on the same day
             d => d.date // Group by date string
         );

         // Convert map to array and sort by date
         const aggregatedData = Array.from(volumeByDate, ([date, volume]) => ({ date: new Date(date), volume }))
                                     .sort((a, b) => a.date - b.date);

         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 40, bottom: 50, left: 50 }; // Adjusted margins
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleTime()
             .range([0, chartWidth])
             .domain(d3.extent(aggregatedData, d => d.date));

         const y = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(aggregatedData, d => d.volume) || 100]); // Or a sensible default max

         // X Axis
         g.append("g")
             .attr("transform", `translate(0,${chartHeight})`)
             .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b"))) // Fewer ticks, format Day Month
             .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("transform", "rotate(-30)");


         // Y Axis
         g.append("g")
             .call(d3.axisLeft(y).ticks(5)) // Fewer ticks
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "#adb5bd")
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", "-3.5em") // Adjust position
                 .attr("text-anchor", "end")
                 .text("Volum Total (kg)");

         // Line Generator
         const line = d3.line()
             .x(d => x(d.date))
             .y(d => y(d.volume))
             .curve(d3.curveMonotoneX); // Smoother line


         // Draw the line
         g.append("path")
             .datum(aggregatedData)
             .attr("fill", "none")
             .attr("stroke", "var(--htb-accent)") // Use CSS variable
             .attr("stroke-width", 2)
             .attr("d", line);

          // Optional: Add points
          g.selectAll(".volume-dot")
             .data(aggregatedData)
             .enter().append("circle")
             .attr("class", "volume-dot")
             .attr("cx", d => x(d.date))
             .attr("cy", d => y(d.volume))
             .attr("r", 3)
             .attr("fill", "var(--htb-accent)")
             .append("title")
                  .text(d => `${formatDate(d.date.toISOString().split('T')[0])}: ${d.volume.toFixed(1)} kg`);
     }

     function handleProgressExerciseChangeDash() {
         const selectedExercise = progressExerciseSelectDash.value;
         const svg = d3.select("#d3ProgressChartDash");
         svg.selectAll("*").remove(); // Clear previous chart

         if (!selectedExercise) {
             // Maybe display a message in the SVG area
             svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .attr("fill", "var(--htb-text-muted)")
                .text("Selectați un exercițiu pentru a vedea progresul.");
             return;
         }

         // Filter data for the selected exercise and sort by date
         const exerciseData = workouts
             .filter(w => w.exercise === selectedExercise)
             .sort((a, b) => new Date(a.date) - new Date(b.date));

         if (exerciseData.length === 0) {
              svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .attr("fill", "var(--htb-text-muted)")
                .text("Nu există date pentru acest exercițiu.");
             return;
         }

         // Prepare data for plotting: date, max e1RM for that day, max weight lifted that day
         const progressData = exerciseData.map(workout => ({
             date: new Date(workout.date),
             maxE1RM: calculateMaxE1RM(workout.sets),
             maxWeight: Math.max(0, ...workout.sets.map(s => s.weight)) // Max weight lifted in any set
         }));

         // --- D3 Chart Setup ---
         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 50, bottom: 50, left: 50 }; // Margins
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleTime()
             .range([0, chartWidth])
             .domain(d3.extent(progressData, d => d.date));

         // Use two Y axes if scales are very different, or combine if similar
         const yMaxWeight = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(progressData, d => d.maxWeight) || 1]);

         const yMaxE1RM = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([0, d3.max(progressData, d => d.maxE1RM) || 1]);


         // X Axis
         g.append("g")
             .attr("transform", `translate(0,${chartHeight})`)
             .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b")))
             .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("transform", "rotate(-30)");

         // Y Axis - Max Weight (Left)
         g.append("g")
             .call(d3.axisLeft(yMaxWeight).ticks(5))
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "var(--htb-tag-red)") // Match dot color
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", "-3.5em")
                 .attr("text-anchor", "end")
                 .text("Greutate Max (kg)");

        // Y Axis - e1RM (Right)
         g.append("g")
            .attr("transform", `translate(${chartWidth}, 0)`) // Move to right side
             .call(d3.axisRight(yMaxE1RM).ticks(5)) // Use axisRight
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "var(--htb-accent)") // Match line color
                 .attr("transform", "rotate(-90)") // Still rotate
                 .attr("y", -6) // Adjust position relative to the right axis
                 .attr("dy", "3.0em") // Adjust inward/outward
                 .attr("text-anchor", "end") // Anchor remains end relative to rotation
                 .text("e1RM Estimat (kg)");


         // Line Generator for e1RM
         const lineE1RM = d3.line()
             .x(d => x(d.date))
             .y(d => yMaxE1RM(d.maxE1RM))
             .curve(d3.curveMonotoneX);

         // Draw e1RM line
         g.append("path")
             .datum(progressData)
             .attr("fill", "none")
             .attr("stroke", "var(--htb-accent)")
             .attr("stroke-width", 2)
             .attr("class", "line-e1rm")
             .attr("d", lineE1RM);

         // Draw dots for Max Weight
         g.selectAll(".dot-weight")
             .data(progressData)
             .enter().append("circle")
             .attr("class", "dot-weight") // Use CSS class
             .attr("cx", d => x(d.date))
             .attr("cy", d => yMaxWeight(d.maxWeight))
             .attr("r", 4)
             // .attr("fill", "var(--htb-tag-red)") Defined in CSS now
             .append("title")
                  .text(d => `${formatDate(d.date.toISOString().split('T')[0])}:\nGreutate Max: ${d.maxWeight.toFixed(1)} kg\ne1RM Est: ${d.maxE1RM.toFixed(1)} kg`);

        // Add Legend (simple version)
        const legend = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top - 15})`); // Position above chart

        legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).style("fill", "var(--htb-tag-red)");
        legend.append("text").attr("x", 10).attr("y", 0).text("Greutate Max").style("font-size", "10px").attr("alignment-baseline","middle").attr("fill", "var(--htb-text-secondary)");

        legend.append("line").attr("x1", 100).attr("y1", 0).attr("x2", 120).attr("y2", 0).attr("stroke", "var(--htb-accent)").attr("stroke-width", 2);
        legend.append("text").attr("x", 130).attr("y", 0).text("e1RM Est.").style("font-size", "10px").attr("alignment-baseline","middle").attr("fill", "var(--htb-text-secondary)");

     }

    // --- Settings ---
    function renderCustomExercisesList() {
        existingExercisesListSettings.innerHTML = ''; // Clear
        if (customExercises.length === 0) {
            existingExercisesListSettings.innerHTML = '<li class="list-group-item text-muted">Nu ai adăugat exerciții custom.</li>';
            return;
        }
        customExercises.forEach((ex, index) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.textContent = ex;
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'py-0');
            deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
            deleteBtn.title = 'Șterge Exercițiu Custom';
            deleteBtn.onclick = () => handleDeleteCustomExercise(index);
            li.appendChild(deleteBtn);
            existingExercisesListSettings.appendChild(li);
        });
    }

    function handleAddCustomExercise() {
        const newExercise = newExerciseNameSettings.value.trim();
        if (newExercise) {
            const allExercises = [...predefinedExercises, ...customExercises];
            if (allExercises.map(e => e.toLowerCase()).includes(newExercise.toLowerCase())) {
                 showToast('Eroare', 'Acest exercițiu există deja.', 'warning');
                 return;
             }

            customExercises.push(newExercise);
            customExercises.sort();
            saveData(EXERCISE_STORAGE_KEY, customExercises);
            renderCustomExercisesList();
            populateExerciseDropdown(); // Update main form dropdown
            newExerciseNameSettings.value = ''; // Clear input
            showToast('Succes', `Exercițiul "${newExercise}" a fost adăugat.`, 'success');
        } else {
             showToast('Atenție', 'Introduceți un nume valid pentru exercițiu.', 'warning');
        }
    }

    function handleDeleteCustomExercise(index) {
        const exerciseToDelete = customExercises[index];

        // Check if the exercise is used in any logs
         const isUsed = workouts.some(workout => workout.exercise === exerciseToDelete);

         if (isUsed) {
             if (!confirm(`Atenție! Exercițiul "${exerciseToDelete}" este folosit în jurnalul de antrenamente. Ștergerea lui NU va șterge înregistrările existente, dar nu îl veți mai putea selecta pentru înregistrări noi.\n\nContinuați cu ștergerea?`)) {
                 return; // User cancelled
             }
         } else {
             if (!confirm(`Sunteți sigur că doriți să ștergeți exercițiul custom "${exerciseToDelete}"?`)) {
                 return; // User cancelled
             }
         }

        customExercises.splice(index, 1);
        saveData(EXERCISE_STORAGE_KEY, customExercises);
        renderCustomExercisesList();
        populateExerciseDropdown(); // Update main form dropdown
        showToast('Succes', `Exercițiul "${exerciseToDelete}" a fost șters.`, 'success');
    }

    function handleBackupData() {
        const allData = {
            workouts: workouts,
            customExercises: customExercises,
            personalRecords: personalRecords
        };
        const dataStr = JSON.stringify(allData, null, 2); // Pretty print JSON
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym_log_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Backup', 'Backup-ul datelor a fost descărcat.', 'info');
    }

    function handleRestoreData(event) {
        const file = event.target.files[0];
        if (!file) {
            showToast('Eroare', 'Nu a fost selectat niciun fișier.', 'warning');
            return;
        }
        if (!file.name.endsWith('.json')) {
             showToast('Eroare', 'Fișierul trebuie să fie de tip .json.', 'warning');
             return;
         }


        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const restoredData = JSON.parse(e.target.result);

                if (confirm('ATENȚIE: Datele curente (antrenamente, exerciții custom, recorduri) vor fi suprascrise cu cele din fișierul de backup. Continuați?')) {
                    // Basic validation of structure
                    if (restoredData.workouts && Array.isArray(restoredData.workouts) &&
                        restoredData.customExercises && Array.isArray(restoredData.customExercises) &&
                        restoredData.personalRecords && typeof restoredData.personalRecords === 'object')
                    {
                        workouts = restoredData.workouts;
                        customExercises = restoredData.customExercises;
                        personalRecords = restoredData.personalRecords;

                        // Save restored data immediately
                        saveData(WORKOUT_STORAGE_KEY, workouts);
                        saveData(EXERCISE_STORAGE_KEY, customExercises);
                        saveData(PR_STORAGE_KEY, personalRecords);

                        // Refresh UI completely
                        initializeApp(); // Re-run initialization to load everything
                        showToast('Restaurare Completă', 'Datele au fost restaurate cu succes.', 'success');
                        // Force switch to Log tab maybe?
                        showTab('logTabContent');

                    } else {
                        throw new Error("Structura fișierului JSON nu este validă.");
                    }
                } else {
                     showToast('Anulat', 'Restaurarea datelor a fost anulată.', 'info');
                }

            } catch (err) {
                console.error("Error parsing restore file:", err);
                showToast('Eroare Restaurare', `Nu s-a putut restaura: ${err.message}`, 'danger');
            } finally {
                // Reset file input to allow selecting the same file again if needed
                 restoreFileSettings.value = '';
            }
        };
        reader.onerror = function() {
             showToast('Eroare Fișier', 'Nu s-a putut citi fișierul selectat.', 'danger');
             restoreFileSettings.value = '';
        };
        reader.readAsText(file);
    }

    // --- Export Functions ---
    function handleExportCSV() {
         if (workouts.length === 0) {
            showToast('Info', 'Nu există date de exportat.', 'info');
            return;
        }

        const headers = ["Data", "Exercitiu", "Grupe Musculare", "Set", "Repetari", "Greutate (kg)", "Note"];
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

        // Sort workouts by date before exporting
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedWorkouts.forEach(workout => {
            workout.sets.forEach((set, index) => {
                const row = [
                    formatDate(workout.date),
                    `"${workout.exercise}"`, // Enclose exercise name in quotes
                    `"${workout.muscleGroups.join(', ')}"`, // Enclose groups in quotes
                    index + 1,
                    set.reps,
                    set.weight,
                     // Only add notes on the first set's row for that entry
                    index === 0 ? `"${workout.notes ? workout.notes.replace(/"/g, '""') : ''}"` : '""'
                ];
                csvContent += row.join(",") + "\n";
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Export CSV', 'Datele au fost exportate în format CSV.', 'success');
    }

    function handleExportTXT() {
         if (workouts.length === 0) {
            showToast('Info', 'Nu există date de exportat.', 'info');
            return;
        }
        let txtContent = "Jurnal Antrenamente Gym Log Pro\n";
        txtContent += "=================================\n\n";

        // Group workouts by date
        const groupedByDate = workouts.reduce((acc, workout) => {
            const date = formatDate(workout.date);
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(workout);
            return acc;
        }, {});

        // Sort dates
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
             // Convert formatted date back to compare if needed, or rely on string sort if format is YYYY-MM-DD
             // Assuming formatDate keeps sortable order like 'YYYY-MM-DD' or similar
             const dateA = a; // Assuming YYYY-MM-DD format from formatDate
             const dateB = b;
             if (dateA < dateB) return -1;
             if (dateA > dateB) return 1;
             return 0;
         });


        sortedDates.forEach(date => {
            txtContent += `Data: ${date}\n`;
            txtContent += "-----------------\n";
            groupedByDate[date].forEach(workout => {
                txtContent += `- ${workout.exercise} (${workout.muscleGroups.join(', ')})\n`;
                workout.sets.forEach((set, index) => {
                    txtContent += `  Set ${index + 1}: ${set.reps} reps @ ${set.weight} kg\n`;
                });
                if (workout.notes) {
                    txtContent += `  Notițe: ${workout.notes}\n`;
                }
                txtContent += "\n";
            });
            txtContent += "\n"; // Extra line break between dates
        });

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Export TXT', 'Datele au fost exportate în format TXT.', 'success');
    }

    function handleExportPDF() {
        if (workouts.length === 0) {
            showToast('Info', 'Nu există date de exportat.', 'info');
            return;
        }
        if (typeof jspdf === 'undefined' || typeof jspdf.plugin.autotable === 'undefined') {
            showToast('Eroare PDF', 'Librăria jsPDF sau plugin-ul AutoTable nu este încărcată.', 'danger');
             console.error("jsPDF or AutoTable not loaded!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const tableColumn = ["Data", "Exercițiu", "Grupe", "Seturi", "Rep. Totale", "Greutate Med.", "Volum", "e1RM Max"];
        const tableRows = [];

        // Sort workouts by date for PDF consistency
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));


        sortedWorkouts.forEach(workout => {
             const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);
             const totalWeight = workout.sets.reduce((sum, set) => sum + set.weight, 0);
             const avgWeight = workout.sets.length > 0 ? (totalWeight / workout.sets.length) : 0;
             const volume = calculateVolume([workout]);
             const maxE1RM = calculateMaxE1RM(workout.sets);

            const workoutData = [
                formatDate(workout.date),
                workout.exercise,
                workout.muscleGroups.join(', '),
                workout.sets.length,
                totalReps,
                avgWeight.toFixed(1) + ' kg',
                volume.toFixed(1),
                maxE1RM.toFixed(1) + ' kg'
                // Notes could be added as a separate section or below each row if needed
            ];
            tableRows.push(workoutData);
        });

         doc.setFontSize(18);
         doc.text("Jurnal Antrenamente - Gym Log Pro", 14, 20);
         doc.setFontSize(11);
         doc.setTextColor(100);

         doc.autoTable({
             head: [tableColumn],
             body: tableRows,
             startY: 30,
             theme: 'grid', // 'striped', 'grid', 'plain'
             headStyles: { fillColor: [22, 160, 133] }, // Teal-like color
             styles: { fontSize: 8 },
             columnStyles: {
                 0: { cellWidth: 20 }, // Data
                 1: { cellWidth: 35 }, // Exercitiu
                 2: { cellWidth: 30 }, // Grupe
                 3: { cellWidth: 15, halign: 'center' }, // Seturi
                 4: { cellWidth: 20, halign: 'center' }, // Rep Totale
                 5: { cellWidth: 25, halign: 'right' }, // Greutate Med
                 6: { cellWidth: 20, halign: 'right' }, // Volum
                 7: { cellWidth: 25, halign: 'right' }  // e1RM Max
             }
         });


        doc.save(`gym_log_pro_export_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Export PDF', 'Datele au fost exportate în format PDF.', 'success');
    }


    // --- Utility Functions ---
    function formatDate(dateString) {
        if (!dateString) return '-';
        // Basic formatting, assuming YYYY-MM-DD input
        const [year, month, day] = dateString.split('-');
        // return `${day}.${month}.${year}`; // DD.MM.YYYY format
        return `${year}-${month}-${day}`; // Keep ISO format for consistency & sorting
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Form
        workoutForm.addEventListener('submit', handleFormSubmit);
        addSetBtn.addEventListener('click', () => addSetRow());
        cancelEditBtn.addEventListener('click', handleCancelEdit);

        // Table Filtering & Sorting
        filterDateInput.addEventListener('change', handleFilterChange);
        filterExerciseInput.addEventListener('input', handleFilterChange);
        filterMuscleGroupSelect.addEventListener('change', handleFilterChange);
        clearFiltersBtn.addEventListener('click', handleClearFilters);
        tableHeaders.forEach(th => th.addEventListener('click', handleSort));

        // Bottom Navigation
        bottomNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.target;
                showTab(targetTab);
            });
        });

        // Dashboard
        dashboardPeriodSelect.addEventListener('change', updateDashboard);
         progressExerciseSelectDash.addEventListener('change', handleProgressExerciseChangeDash);

        // Settings
        addNewExerciseBtnSettings.addEventListener('click', handleAddCustomExercise);
        newExerciseNameSettings.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddCustomExercise();
            }
        });
        backupDataBtnSettings.addEventListener('click', handleBackupData);
        restoreFileSettings.addEventListener('change', handleRestoreData);
        exportCSVSettings.addEventListener('click', handleExportCSV);
        exportTXTSettings.addEventListener('click', handleExportTXT);
        exportPDFSettings.addEventListener('click', handleExportPDF);

         // Add initial sort icon state
        const initialSortIcon = document.querySelector(`#workoutTable th[data-column="${currentSort.column}"] .sort-icon`);
        if (initialSortIcon) {
            initialSortIcon.classList.add(currentSort.order === 'asc' ? 'bi-sort-up' : 'bi-sort-down');
        }
    }

    // --- Start the application ---
    initializeApp();

}); // End DOMContentLoaded