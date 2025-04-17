// app.js - Gym Log Pro Logic

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and State ---
    const WORKOUT_STORAGE_KEY = 'gymLogProWorkouts';
    const EXERCISE_STORAGE_KEY = 'gymLogProCustomExercises';
    const PR_STORAGE_KEY = 'gymLogProPersonalRecords';
    const WEIGHT_LOG_STORAGE_KEY = 'gymLogProWeightLog'; // New key for body weight

    let workouts = loadData(WORKOUT_STORAGE_KEY, []);
    let customExercises = loadData(EXERCISE_STORAGE_KEY, []);
    // Structure: { exerciseName: { weight: val, weightDate: date, volume: val, volumeDate: date, e1rm: val, e1rmDate: date }, ... }
    let personalRecords = loadData(PR_STORAGE_KEY, {});
    // Structure: [ { date: "YYYY-MM-DD", weight: 75.5 }, ... ]
    let weightLog = loadData(WEIGHT_LOG_STORAGE_KEY, []);
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
    // Summary Stats
    const statsExercises = document.getElementById('statsExercises');
    const statsSets = document.getElementById('statsSets');
    const statsReps = document.getElementById('statsReps');
    const statsAvgWeight = document.getElementById('statsAvgWeight');
    const statsTotalVolume = document.getElementById('statsTotalVolume');
    // Weekly Averages
    const weeklyAvgWorkouts = document.getElementById('weeklyAvgWorkouts');
    const weeklyAvgSets = document.getElementById('weeklyAvgSets');
    const weeklyAvgReps = document.getElementById('weeklyAvgReps');
    const weeklyAvgRepsPerSet = document.getElementById('weeklyAvgRepsPerSet');
    const weeklyAvgVolume = document.getElementById('weeklyAvgVolume');
    // Existing PR List (Historical)
    const personalRecordsList = document.getElementById('personalRecordsList');
    const noPrMessage = document.getElementById('noPrMessage');
    // Muscle Chart
    const d3MusclesChartContainer = document.getElementById('musclesWorkedChartContainer');
    const d3MusclesChartSvg = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    // Volume/Progress Charts
    const d3VolumeChartDashSvg = document.getElementById('d3VolumeChartDash');
    const d3ProgressChartDashSvg = document.getElementById('d3ProgressChartDash');
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');
    // --- New Widget Elements ---
    const newPrZoneList = document.getElementById('newPrZoneList');
    const noNewPrMessage = document.getElementById('noNewPrMessage');
    const recentSessionsList = document.getElementById('recentSessionsList');
    const noRecentSessionsMessage = document.getElementById('noRecentSessionsMessage');
    const weightProgressChartContainer = document.getElementById('weightProgressChartContainer');
    const consistencyHeatmapContainer = document.getElementById('consistencyHeatmapContainer');
    const heatmapTooltip = document.getElementById('heatmapTooltip'); // Tooltip for heatmap

    // Settings Tab
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileSettings = document.getElementById('restoreFileSettings');
    const exportCSVSettings = document.getElementById('exportCSVSettings');
    const exportTXTSettings = document.getElementById('exportTXTSettings');
    const exportPDFSettings = document.getElementById('exportPDFSettings');
    // Add Body Weight Input (Example - could be a dedicated section)
    const bodyWeightInputSettings = document.getElementById('bodyWeightInputSettings'); // Assuming you add this input
    const logBodyWeightBtnSettings = document.getElementById('logBodyWeightBtnSettings'); // Assuming you add this button

    // --- Initialization ---
    async function initializeApp() {
        showTab('logTabContent'); // Start on Log tab
        setDefaultDate();
        await loadPredefinedExercises();
        populateExerciseDropdown();
        populateMuscleGroupFilter();
        renderWorkoutTable();
        updateDashboard(); // Initial dashboard render (will call new widget renders)
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
            // Provide more specific feedback if possible (e.g., quota exceeded)
            if (e.name === 'QuotaExceededError') {
                 showToast('Eroare Salvare', 'Spațiul de stocare local este plin. Ștergeți date vechi sau faceți backup.', 'danger');
            } else {
                showToast('Eroare Salvare', 'Nu s-au putut salva datele.', 'danger');
            }
        }
    }

    async function loadPredefinedExercises() {
        try {
            const response = await fetch('exercises.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            predefinedExercises = await response.json();
            // Clean up potential duplicates and sort
            predefinedExercises = [...new Set(predefinedExercises)].sort((a, b) => a.localeCompare(b));
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
        toastElement.classList.remove('text-bg-success', 'text-bg-warning', 'text-bg-danger', 'text-bg-info', 'text-bg-secondary');
        // Add appropriate class based on type
        toastElement.classList.add(`text-bg-${type}`);
        toast.show();
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function populateExerciseDropdown() {
        const allExercises = [...new Set([...predefinedExercises, ...customExercises])].sort((a, b) => a.localeCompare(b));
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>'; // Reset
        progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>'; // Reset dash select too

        const uniqueExercisesInLog = [...new Set(workouts.map(w => w.exercise))].sort((a, b) => a.localeCompare(b));

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
        const muscleGroups = [...new Set(workouts.flatMap(w => w.muscleGroups))].sort((a, b) => a.localeCompare(b));
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
        // Reset multiple select properly
        Array.from(muscleGroupsSelect.options).forEach(option => option.selected = false);
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
                 // Check if inputs exist and have valid values
                 if (!repsInput || !weightInput || repsInput.value === '' || repsInput.value < 0 || weightInput.value === '' || weightInput.value < 0) {
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
            if (reps !== '' && weight !== '' && reps >= 0 && weight >= 0) { // Ensure valid numbers
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
            // Calculate avg weight only on sets with weight > 0 to avoid skewing by bodyweight exercises
            const weightedSets = workout.sets.filter(set => set.weight > 0);
            const avgWeight = weightedSets.length > 0 ? (weightedSets.reduce((sum, set) => sum + set.weight, 0) / weightedSets.length) : 0;
            const volume = calculateVolume([workout]); // Calculate volume for this specific entry
            const maxE1RM = calculateMaxE1RM(workout.sets);
            const isPR = checkForPR(workout.exercise, workout.date, avgWeight, volume, maxE1RM); // Check if this entry matches a PR date

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
            updateDashboard(); // This will now render all dashboard widgets
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
        if (reps <= 0 || weight <= 0) return 0; // Cannot calculate for 0 reps/weight
        if (reps === 1) return weight;
        // Formula: weight / ( 1.0278 – 0.0278 × reps )
        // Avoid division by zero or negative numbers if reps are too high (e.g., > 36)
        const denominator = 1.0278 - (0.0278 * reps);
        return denominator > 0.01 ? weight / denominator : 0; // Use a small threshold
    }

    function calculateMaxE1RM(sets) {
        if (!sets || sets.length === 0) return 0;
        return Math.max(0, ...sets.map(set => calculateE1RM(set.weight, set.reps)));
    }

     function updatePersonalRecords(exercise, sets, workoutDate) {
         // Find the set with the highest weight
         const currentMaxWeightSet = sets.reduce((maxSet, currentSet) => {
             return currentSet.weight > (maxSet.weight || 0) ? currentSet : maxSet;
         }, { weight: 0, reps: 0 });
         const currentMaxWeight = currentMaxWeightSet.weight;

         // Calculate max e1RM for this specific workout entry
         const currentMaxE1RM = calculateMaxE1RM(sets);

         // Calculate volume for this specific workout entry
         const currentVolume = sets.reduce((vol, set) => vol + (set.reps * set.weight), 0);

         let recordUpdated = false;
         if (!personalRecords[exercise]) {
             // Initialize structure if it doesn't exist
             personalRecords[exercise] = { weight: 0, weightDate: '', volume: 0, volumeDate: '', e1rm: 0, e1rmDate: '' };
         }

         const record = personalRecords[exercise];

         // Update Max Weight PR
         if (currentMaxWeight > record.weight) {
             record.weight = currentMaxWeight;
             record.weightDate = workoutDate; // Store the date the PR was achieved
             recordUpdated = true;
         }
         // Update Max Volume PR
         if (currentVolume > record.volume) {
             record.volume = currentVolume;
             record.volumeDate = workoutDate; // Store the date
             recordUpdated = true;
         }
         // Update Max e1RM PR
          if (currentMaxE1RM > record.e1rm) {
             record.e1rm = currentMaxE1RM;
             record.e1rmDate = workoutDate; // Store the date
             recordUpdated = true;
         }

         if (recordUpdated) {
             saveData(PR_STORAGE_KEY, personalRecords);
             console.log(`PR updated for ${exercise} on ${workoutDate}:`, record);
             return true; // Indicate a PR was set/updated
         }
         return false; // No new PR
     }

     function checkForPR(exercise, workoutDate, avgWeight, volume, maxE1RM) {
        // Checks if the workout on workoutDate matches the date a PR was set for that exercise
        const record = personalRecords[exercise];
        if (!record) return false;

        // Check if the workout date matches any of the stored PR dates for that exercise
        return record.weightDate === workoutDate ||
               record.volumeDate === workoutDate ||
               record.e1rmDate === workoutDate;
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
                 showToast('Eroare Formular', 'Verificați seturile introduse (Rep. și Kg obligatorii și >= 0).', 'warning');
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

        let prSet = false; // Flag to check if a PR was set by this submission

        if (editingId) {
            // Update existing workout
            const index = workouts.findIndex(w => w.id === editingId);
            if (index > -1) {
                workouts[index] = workoutData;
                // Re-check PRs when editing, as values might change
                prSet = updatePersonalRecords(workoutData.exercise, workoutData.sets, workoutData.date);
                showToast('Succes', 'Antrenament actualizat cu succes!');
            }
        } else {
            // Add new workout
            workouts.push(workoutData);
            // Check for PRs only when adding new
            prSet = updatePersonalRecords(workoutData.exercise, workoutData.sets, workoutData.date);
            showToast('Succes', 'Antrenament adăugat cu succes!');
        }

        // Show PR toast only if a new record was actually set/updated
        if (prSet) {
            showToast('Record Personal!', `Nou record stabilit pentru ${workoutData.exercise}!`, 'info');
        }

        saveData(WORKOUT_STORAGE_KEY, workouts);
        renderWorkoutTable();
        populateMuscleGroupFilter(); // Update filters in case of new group combo
        populateExerciseDropdown(); // Update progress dropdown if new exercise logged
        updateDashboard(); // Update dashboard after adding/editing data
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
        workoutForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            updateDashboard(); // Update dashboard after deleting data
            // Note: PRs are NOT automatically recalculated/removed on delete.
            // This would require iterating through all remaining workouts which can be slow.
            // User should manually re-evaluate PRs if needed after deletion.
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
            currentSort.order = (column === 'date' ? 'desc' : 'asc'); // Default date desc, others asc
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
                    // Direct string comparison works for YYYY-MM-DD
                    valA = a.date;
                    valB = b.date;
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
            // Secondary sort by date descending if primary values are equal
             if (a.date < b.date) return 1;
             if (a.date > b.date) return -1;
            return 0;
        });

        return filtered;
    }

    // --- Dashboard ---
    function getWorkoutsForPeriod(period) {
        const now = new Date();
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Start of the day

        switch (period) {
            case 'last7days':
                startDate.setDate(now.getDate() - 6); // Include today + 6 previous days
                break;
            case 'last30days':
                startDate.setDate(now.getDate() - 29); // Include today + 29 previous days
                break;
            case 'allTime':
                return workouts; // Return all workouts
            default: // Default to last 7 days
                startDate.setDate(now.getDate() - 6);
        }
        const startTime = startDate.getTime();
        // Filter workouts within the date range
        return workouts.filter(w => new Date(w.date).getTime() >= startTime);
    }

    function updateDashboard() {
        const period = dashboardPeriodSelect.value;
        const periodWorkouts = getWorkoutsForPeriod(period);

        // --- 1. Calculate Summary Stats ---
        updateSummaryStats(periodWorkouts);

        // --- 2. Calculate Weekly Averages ---
        updateWeeklyAverages(periodWorkouts, period);

        // --- 3. Render Historical Personal Records (Top 5) ---
        renderPersonalRecords();

        // --- 4. Render Muscle Groups Chart ---
        renderMuscleGroupsChart(periodWorkouts);

        // --- 5. Render Volume Chart ---
        renderVolumeChartDash(periodWorkouts);

        // --- 6. Render Progress Chart (if an exercise is selected) ---
        handleProgressExerciseChangeDash(); // Render based on current selection

        // --- 7. Render NEW Widgets ---
        renderRecentSessions(); // Uses all workouts, sorted
        renderPrZone(); // Uses current PR data
        renderWeightProgressChart(); // Uses separate weightLog data
        renderConsistencyHeatmapDash(); // Uses all workouts
    }

    function updateSummaryStats(periodWorkouts) {
        const totalEntries = periodWorkouts.length;
        const totalSets = periodWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
        const totalReps = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0);

        // Calculate average weight based only on sets with weight > 0
        const allSets = periodWorkouts.flatMap(w => w.sets);
        const weightedSets = allSets.filter(s => s.weight > 0);
        const totalWeightSum = weightedSets.reduce((sum, set) => sum + set.weight, 0);
        const avgWeight = weightedSets.length > 0 ? (totalWeightSum / weightedSets.length) : 0;

        const totalVolume = calculateVolume(periodWorkouts);

        statsExercises.textContent = totalEntries;
        statsSets.textContent = totalSets;
        statsReps.textContent = totalReps;
        statsAvgWeight.textContent = avgWeight.toFixed(1) + ' kg';
        statsTotalVolume.textContent = (totalVolume / 1000).toFixed(2) + ' T'; // Display in Tonnes
    }

    function updateWeeklyAverages(periodWorkouts, period) {
         let daysInPeriod;
         const now = new Date();
         const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

         if (period === 'last7days') {
             daysInPeriod = 7;
         } else if (period === 'last30days') {
             daysInPeriod = 30;
         } else { // allTime
             if (workouts.length > 0) {
                 const sortedByDate = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
                 const minDate = new Date(sortedByDate[0].date);
                 const maxDate = new Date(sortedByDate[sortedByDate.length - 1].date);
                 // Calculate difference in days, add 1 to include both start and end date
                 daysInPeriod = Math.max(1, Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
             } else {
                 daysInPeriod = 1; // Avoid division by zero
             }
         }

         const weeksInPeriod = Math.max(1, daysInPeriod / 7); // Ensure at least 1 week

         // Find unique workout days within the period
         const uniqueWorkoutDays = new Set(periodWorkouts.map(w => w.date)).size;
         const totalSets = periodWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
         const totalReps = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0);
         const totalVolume = calculateVolume(periodWorkouts);

         weeklyAvgWorkouts.textContent = (uniqueWorkoutDays / weeksInPeriod).toFixed(1);
         weeklyAvgSets.textContent = (totalSets / weeksInPeriod).toFixed(1);
         weeklyAvgReps.textContent = (totalReps / weeksInPeriod).toFixed(1);
         weeklyAvgRepsPerSet.textContent = totalSets > 0 ? (totalReps / totalSets).toFixed(1) : '0';
         weeklyAvgVolume.textContent = ((totalVolume / 1000) / weeksInPeriod).toFixed(2) + ' T';
    }

    function renderPersonalRecords() { // Historical Top 5 List
        personalRecordsList.innerHTML = ''; // Clear list
        const sortedRecords = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => record.e1rm > 0 || record.weight > 0 || record.volume > 0) // Filter out empty records
            .sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0)); // Sort by e1RM descending

        if (sortedRecords.length === 0) {
            noPrMessage.classList.remove('d-none');
            personalRecordsList.classList.add('d-none'); // Hide list itself
            return;
        }

        noPrMessage.classList.add('d-none');
        personalRecordsList.classList.remove('d-none'); // Show list
        const top5 = sortedRecords.slice(0, 5);

        top5.forEach(record => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'py-1'); // Allow wrap, reduce padding
            li.innerHTML = `
                <span class="pr-exercise me-2">${record.exercise}</span>
                <div class="ms-auto text-end"> <!-- Push badges to right -->
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

         const containerNode = svg.node().parentNode; // Get container for size
         const width = containerNode.clientWidth;
         const height = 300; // Fixed height from HTML
         const margin = { top: 20, right: 20, bottom: 70, left: 40 }; // Increased bottom margin for labels
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         // Ensure dimensions are positive
         if (chartWidth <= 0 || chartHeight <= 0) return;

         const g = svg.attr("viewBox", `0 0 ${width} ${height}`) // Use viewBox for responsiveness
                      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleBand()
             .range([0, chartWidth])
             .padding(0.2) // Increased padding slightly
             .domain(sortedMuscles.map(d => d[0])); // Muscle names

         const y = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(sortedMuscles, d => d[1]) || 1]).nice(); // Max count, ensure domain >= 1, nice() rounds axis

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
                 // .attr("fill", "#adb5bd") // Use CSS
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
                 .attr("y", y(0)) // Start from bottom for animation
                 .attr("width", x.bandwidth())
                 .attr("height", 0) // Start height 0
                 .attr("rx", 2) // Rounded corners
                 .attr("ry", 2)
                 .transition() // Add transition
                 .duration(500)
                 .delay((d, i) => i * 50) // Stagger animation
                 .attr("y", d => y(d[1]))
                 .attr("height", d => chartHeight - y(d[1]));

         // Tooltip on bars
         g.selectAll(".muscle-bar") // Re-select after creation
             .append("title")
                 .text(d => `${d[0]}: ${d[1]} sesiuni`);

         // Labels on bars (optional, check for overlap)
         g.selectAll(".bar-label")
             .data(sortedMuscles)
             .enter().append("text")
             .attr("class", "bar-label")
             .attr("x", d => x(d[0]) + x.bandwidth() / 2)
             .attr("y", d => y(d[1]) - 5) // Position above bar
             .attr("text-anchor", "middle")
             .style("opacity", 0) // Start invisible
             .text(d => d[1])
             .transition()
             .duration(500)
             .delay((d, i) => 300 + i * 50) // Delay after bars animate
             .style("opacity", 1);
     }

     function renderVolumeChartDash(data) {
         const svg = d3.select("#d3VolumeChartDash");
         svg.selectAll("*").remove();

         if (data.length === 0) {
              svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .attr("class", "text-muted small") // Use CSS classes
                .text("Nu există date de volum pentru perioada selectată.");
             return;
         }

         // Aggregate volume per day
         const volumeByDate = d3.rollup(data,
             v => d3.sum(v, d => calculateVolume([d])), // Sum volume for workouts on the same day
             d => d.date // Group by date string
         );

         // Convert map to array and sort by date
         const aggregatedData = Array.from(volumeByDate, ([date, volume]) => ({ date: new Date(date), volume }))
                                     .sort((a, b) => a.date - b.date);

         const containerNode = svg.node().parentNode;
         const width = containerNode.clientWidth;
         const height = 300; // Fixed height
         const margin = { top: 20, right: 40, bottom: 50, left: 50 }; // Adjusted margins
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         if (chartWidth <= 0 || chartHeight <= 0) return;

         const g = svg.attr("viewBox", `0 0 ${width} ${height}`)
                      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleTime()
             .range([0, chartWidth])
             .domain(d3.extent(aggregatedData, d => d.date));

         const y = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(aggregatedData, d => d.volume) || 100]).nice(); // Or a sensible default max

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
                 // .attr("fill", "#adb5bd") // Use CSS
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


         // Draw the line with transition
         const path = g.append("path")
             .datum(aggregatedData)
             .attr("fill", "none")
             .attr("class", "line-volume") // Use CSS class
             .attr("stroke-width", 2)
             .attr("d", line);

         const totalLength = path.node().getTotalLength();

         path.attr("stroke-dasharray", totalLength + " " + totalLength)
             .attr("stroke-dashoffset", totalLength)
             .transition()
             .duration(1000)
             .ease(d3.easeLinear)
             .attr("stroke-dashoffset", 0);

          // Optional: Add points with transition
          g.selectAll(".volume-dot")
             .data(aggregatedData)
             .enter().append("circle")
             .attr("class", "volume-dot") // Use CSS class
             .attr("cx", d => x(d.date))
             .attr("cy", d => y(d.volume))
             .attr("r", 0) // Start radius 0
             .transition()
             .duration(500)
             .delay((d, i) => i * 50 + 500) // Delay after line animation
             .attr("r", 3)
             .append("title")
                  .text(d => `${formatDate(d.date.toISOString().split('T')[0])}: ${d.volume.toFixed(1)} kg`);
     }

     function handleProgressExerciseChangeDash() {
         const selectedExercise = progressExerciseSelectDash.value;
         const svg = d3.select("#d3ProgressChartDash");
         svg.selectAll("*").remove(); // Clear previous chart

         if (!selectedExercise) {
             svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .attr("class", "text-muted small")
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
                .attr("class", "text-muted small")
                .text("Nu există date pentru acest exercițiu.");
             return;
         }

         // Prepare data for plotting: date, max e1RM for that day, max weight lifted that day
         const progressData = exerciseData.map(workout => ({
             date: new Date(workout.date),
             maxE1RM: calculateMaxE1RM(workout.sets),
             maxWeight: Math.max(0, ...workout.sets.map(s => s.weight)) // Max weight lifted in any set
         })).filter(d => d.maxE1RM > 0 || d.maxWeight > 0); // Filter out entries with no valid data

         if (progressData.length < 2) { // Need at least 2 points to draw a meaningful line chart
              svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .attr("class", "text-muted small")
                .text("Nu există suficiente date pentru a afișa progresul.");
             return;
         }

         // --- D3 Chart Setup ---
         const containerNode = svg.node().parentNode;
         const width = containerNode.clientWidth;
         const height = 255; // Fixed height from HTML
         const margin = { top: 30, right: 50, bottom: 50, left: 50 }; // Increased top margin for legend
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         if (chartWidth <= 0 || chartHeight <= 0) return;

         const g = svg.attr("viewBox", `0 0 ${width} ${height}`)
                      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleTime()
             .range([0, chartWidth])
             .domain(d3.extent(progressData, d => d.date));

         // Combine scales if values are similar, otherwise use two
         const maxWeightValue = d3.max(progressData, d => d.maxWeight) || 1;
         const maxE1RMValue = d3.max(progressData, d => d.maxE1RM) || 1;

         const yMaxWeight = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, maxWeightValue]).nice();

         const yMaxE1RM = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([0, maxE1RMValue]).nice();


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
             .defined(d => d.maxE1RM > 0) // Don't draw line for 0 values
             .curve(d3.curveMonotoneX);

         // Draw e1RM line with transition
         const pathE1RM = g.append("path")
             .datum(progressData)
             .attr("fill", "none")
             .attr("class", "line-e1rm") // Use CSS
             .attr("stroke-width", 2)
             .attr("d", lineE1RM);

         const totalLengthE1RM = pathE1RM.node().getTotalLength();
         pathE1RM.attr("stroke-dasharray", totalLengthE1RM + " " + totalLengthE1RM)
             .attr("stroke-dashoffset", totalLengthE1RM)
             .transition()
             .duration(1000)
             .ease(d3.easeLinear)
             .attr("stroke-dashoffset", 0);

         // Draw dots for Max Weight with transition
         g.selectAll(".dot-weight")
             .data(progressData.filter(d => d.maxWeight > 0)) // Only plot dots with actual weight
             .enter().append("circle")
             .attr("class", "dot-weight") // Use CSS class
             .attr("cx", d => x(d.date))
             .attr("cy", d => yMaxWeight(d.maxWeight))
             .attr("r", 0) // Start radius 0
             .transition()
             .duration(500)
             .delay((d, i) => i * 50 + 500) // Delay after line animation
             .attr("r", 4)
             .append("title")
                  .text(d => `${formatDate(d.date.toISOString().split('T')[0])}:\nGreutate Max: ${d.maxWeight.toFixed(1)} kg\ne1RM Est: ${d.maxE1RM.toFixed(1)} kg`);

        // Add Legend (simple version)
        const legend = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top - 15})`); // Position above chart

        legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).attr("class", "dot-weight"); // Use class for color
        legend.append("text").attr("x", 10).attr("y", 0).text("Greutate Max").style("font-size", "10px").attr("alignment-baseline","middle").attr("class", "text-muted"); // Use class

        legend.append("line").attr("x1", 100).attr("y1", 0).attr("x2", 120).attr("y2", 0).attr("class", "line-e1rm").attr("stroke-width", 2); // Use class
        legend.append("text").attr("x", 130).attr("y", 0).text("e1RM Est.").style("font-size", "10px").attr("alignment-baseline","middle").attr("class", "text-muted"); // Use class

     }

    // --- NEW Dashboard Widget Renderers ---

    function renderRecentSessions() {
        recentSessionsList.innerHTML = ''; // Clear
        noRecentSessionsMessage.classList.add('d-none'); // Hide message initially

        // Get all workouts, sort by date descending, take top 5
        const sortedWorkouts = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
        const recent = sortedWorkouts.slice(0, 5);

        if (recent.length === 0) {
            noRecentSessionsMessage.classList.remove('d-none');
            return;
        }

        recent.forEach(workout => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1', 'px-0'); // No padding X
            li.innerHTML = `
                <div class="me-2">
                    <span class="fw-bold d-block">${workout.exercise}</span>
                    <small class="text-muted">${workout.muscleGroups.join(', ')} - ${workout.sets.length} seturi</small>
                </div>
                <small class="text-muted text-nowrap">${formatDate(workout.date)}</small>
            `;
            recentSessionsList.appendChild(li);
        });
    }

    function renderPrZone() {
        newPrZoneList.innerHTML = ''; // Clear
        noNewPrMessage.classList.add('d-none'); // Hide message

        // Get all PRs, filter those with a valid date, sort by most recent date
        const recentPRs = Object.entries(personalRecords)
            .flatMap(([exercise, data]) => [ // Create separate entries for each PR type with its date
                { exercise, type: 'e1RM', value: data.e1rm, date: data.e1rmDate },
                { exercise, type: 'Greutate Max', value: data.weight, date: data.weightDate },
                { exercise, type: 'Volum Max', value: data.volume, date: data.volumeDate },
            ])
            .filter(pr => pr.value > 0 && pr.date) // Keep only valid PRs with dates
            .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

        if (recentPRs.length === 0) {
            noNewPrMessage.classList.remove('d-none');
             newPrZoneList.innerHTML = '<div class="list-group-item text-muted small text-center">Nu există recorduri recente.</div>';
            return;
        }

        const topN = recentPRs.slice(0, 4); // Show top 4 most recent PRs

        topN.forEach(pr => {
            const div = document.createElement('div');
            div.classList.add('list-group-item', 'py-1', 'px-0'); // No padding X
            let iconClass = 'bi-trophy';
            let badgeClass = 'bg-secondary';
            let unit = '';

            if (pr.type === 'e1RM') { iconClass = 'bi-bullseye'; badgeClass = 'bg-primary'; unit = 'kg'; }
            else if (pr.type === 'Greutate Max') { iconClass = 'bi-barbell'; badgeClass = 'bg-success'; unit = 'kg'; }
            else if (pr.type === 'Volum Max') { iconClass = 'bi-graph-up'; badgeClass = 'bg-warning text-dark'; unit = 'vol'; }

            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="me-2">
                        <span class="fw-bold d-block"><i class="bi ${iconClass} me-1"></i> ${pr.exercise}</span>
                        <small class="text-muted">${pr.type}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge ${badgeClass} rounded-pill">${pr.value.toFixed(1)} ${unit}</span>
                        <small class="d-block text-muted">${formatDate(pr.date)}</small>
                    </div>
                </div>
            `;
            newPrZoneList.appendChild(div);
        });
    }

    function renderWeightProgressChart() {
        const svg = d3.select("#weightProgressChartContainer");
        svg.selectAll("*").remove(); // Clear previous

        // Use the weightLog data
        const data = weightLog
            .map(d => ({ date: new Date(d.date), weight: +d.weight })) // Parse dates and ensure numbers
            .filter(d => !isNaN(d.date) && !isNaN(d.weight) && d.weight > 0) // Filter invalid entries
            .sort((a, b) => a.date - b.date); // Sort by date

        if (data.length < 2) {
            svg.html('<p class="text-center text-muted small mt-5 pt-5">Nu există suficiente date despre greutate pentru grafic.</p>');
            return;
        }

        // --- D3 Chart Setup (similar to other line charts) ---
        const containerNode = svg.node();
        const width = containerNode.clientWidth;
        const height = 255; // Fixed height from HTML/CSS
        const margin = { top: 20, right: 40, bottom: 50, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        if (chartWidth <= 0 || chartHeight <= 0) return;

        const g = svg.append('svg') // Append SVG element inside the container div
                     .attr('width', width)
                     .attr('height', height)
                     .attr("viewBox", `0 0 ${width} ${height}`)
                     .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .range([0, chartWidth])
            .domain(d3.extent(data, d => d.date));

        const y = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain(d3.extent(data, d => d.weight)).nice(); // Use extent for min/max, nice() for rounding

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b")))
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-30)");

        // Y Axis
        g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-3.5em")
                .attr("text-anchor", "end")
                .text("Greutate (kg)");

        // Line Generator
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.weight))
            .curve(d3.curveMonotoneX);

        // Draw Line with transition
        const path = g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "var(--htb-tag-blue)") // Use a different color
            .attr("stroke-width", 2)
            .attr("d", line);

        const totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Draw Dots with transition
        g.selectAll(".weight-dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "weight-dot") // Use CSS class
            .attr("fill", "var(--htb-tag-blue)")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.weight))
            .attr("r", 0)
            .transition()
            .duration(500)
            .delay((d, i) => i * 50 + 500)
            .attr("r", 3)
            .append("title")
                 .text(d => `${formatDate(d.date.toISOString().split('T')[0])}: ${d.weight.toFixed(1)} kg`);
    }

    function renderConsistencyHeatmapDash() {
        const container = d3.select("#consistencyHeatmapContainer");
        const tooltip = d3.select("#heatmapTooltip"); // Ensure tooltip element exists
        container.selectAll("*").remove(); // Clear previous

        if (!tooltip.node()) {
            console.error("Heatmap tooltip element not found!");
            return;
        }

        // --- Configuration ---
        const numberOfWeeks = 4;
        const cellSize = 12; // Smaller cells for dashboard
        const cellSpacing = 2;

        // --- Data Processing ---
        // Create a set of dates with workouts for quick lookup
        const workoutDates = new Set(workouts.map(w => w.date));

        // Calculate date range (last 4 weeks ending today)
        const today = d3.timeDay.floor(new Date());
        const endDate = d3.timeDay.offset(today, 1); // End date is the day *after* today
        const startDate = d3.timeSunday.offset(today, -numberOfWeeks + 1); // Start from Sunday of the first week

        const allDays = d3.timeDays(startDate, endDate);

        // --- D3 Setup ---
        const containerNode = container.node();
        // Calculate SVG dimensions based on weeks and cell size
        const weekCount = d3.timeWeek.count(startDate, endDate);
        const svgHeight = weekCount * (cellSize + cellSpacing);
        // Calculate width based on container, but use viewBox for scaling
        const svgWidth = 7 * (cellSize + cellSpacing);

        if (svgWidth <= 0 || svgHeight <= 0 || weekCount <= 0) {
             container.html('<p class="text-center text-muted small mt-4">Nu se poate afișa heatmap.</p>');
             return;
        }

        const svg = container.append('svg')
            .attr('width', '100%') // Responsive width
            .attr('height', svgHeight) // Fixed height based on weeks
            .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
            .attr('preserveAspectRatio', 'xMidYMin meet');

        // --- Draw Heatmap Rectangles ---
        svg.selectAll('.heatmap-day-dash')
            .data(allDays)
            .enter()
            .append('rect')
            .attr('class', d => {
                const dateString = d3.timeFormat("%Y-%m-%d")(d);
                // Simple intensity: 1 if workout exists, 0 otherwise
                const intensity = workoutDates.has(dateString) ? 1 : 0;
                return `heatmap-day heatmap-day-level-${intensity}`; // Use general heatmap classes from style.css
            })
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('x', d => d3.timeFormat('%w')(d) * (cellSize + cellSpacing)) // %w = day of week (0-6, Sun-Sat)
            .attr('y', d => d3.timeWeek.count(startDate, d) * (cellSize + cellSpacing)) // Week number
            .on('mouseover', (event, d) => {
                const dateString = d3.timeFormat("%Y-%m-%d")(d);
                const hasWorkout = workoutDates.has(dateString);
                const dateFormatted = d3.timeFormat("%d %b, %Y")(d);

                tooltip.style('opacity', 1)
                       .html(`${dateFormatted}: ${hasWorkout ? 'Antrenament' : 'Fără antrenament'}`);

                // Position tooltip - adjust as needed
                tooltip.style('left', (event.pageX + 5) + 'px')
                       .style('top', (event.pageY - 25) + 'px');
            })
            .on('mousemove', (event) => {
                 tooltip.style('left', (event.pageX + 5) + 'px')
                        .style('top', (event.pageY - 25) + 'px');
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
    }


    // --- Settings ---
    function renderCustomExercisesList() {
        existingExercisesListSettings.innerHTML = ''; // Clear
        if (customExercises.length === 0) {
            existingExercisesListSettings.innerHTML = '<li class="list-group-item text-muted">Nu ai adăugat exerciții custom.</li>';
            return;
        }
        // Sort custom exercises alphabetically for display
        [...customExercises].sort((a, b) => a.localeCompare(b)).forEach((ex) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.textContent = ex;
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'py-0');
            deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
            deleteBtn.title = 'Șterge Exercițiu Custom';
            // Find original index for deletion as list is sorted for display only
            deleteBtn.onclick = () => handleDeleteCustomExercise(customExercises.indexOf(ex));
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
            // No need to sort the source array, sorting happens on render/populate
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
        if (index < 0 || index >= customExercises.length) return; // Safety check

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
            personalRecords: personalRecords,
            weightLog: weightLog // Include weight log in backup
        };
        const dataStr = JSON.stringify(allData, null, 2); // Pretty print JSON
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' }); // Specify charset
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

                if (confirm('ATENȚIE: Datele curente (antrenamente, exerciții custom, recorduri, greutate corporală) vor fi suprascrise cu cele din fișierul de backup. Continuați?')) {
                    // Basic validation of structure
                    if (restoredData.workouts && Array.isArray(restoredData.workouts) &&
                        restoredData.customExercises && Array.isArray(restoredData.customExercises) &&
                        restoredData.personalRecords && typeof restoredData.personalRecords === 'object')
                        // Weight log is optional in older backups
                    {
                        workouts = restoredData.workouts;
                        customExercises = restoredData.customExercises;
                        personalRecords = restoredData.personalRecords;
                        // Restore weight log if present, otherwise keep existing or default
                        weightLog = (restoredData.weightLog && Array.isArray(restoredData.weightLog)) ? restoredData.weightLog : weightLog;

                        // Save restored data immediately
                        saveData(WORKOUT_STORAGE_KEY, workouts);
                        saveData(EXERCISE_STORAGE_KEY, customExercises);
                        saveData(PR_STORAGE_KEY, personalRecords);
                        saveData(WEIGHT_LOG_STORAGE_KEY, weightLog);

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
        // Add BOM for Excel compatibility with UTF-8 characters
        let csvContent = "\uFEFF" + headers.join(",") + "\n";

        // Sort workouts by date before exporting
        const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

        sortedWorkouts.forEach(workout => {
            workout.sets.forEach((set, index) => {
                const row = [
                    formatDate(workout.date),
                    `"${workout.exercise.replace(/"/g, '""')}"`, // Escape quotes in exercise name
                    `"${workout.muscleGroups.join(', ')}".replace(/"/g, '""')`, // Escape quotes
                    index + 1,
                    set.reps,
                    set.weight,
                     // Only add notes on the first set's row for that entry, escape quotes
                    index === 0 ? `"${workout.notes ? workout.notes.replace(/"/g, '""') : ''}"` : '""'
                ];
                csvContent += row.join(",") + "\n";
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Fallback for older browsers
            navigator.msSaveBlob(blob, `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
        }
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
            const dateKey = workout.date; // Use YYYY-MM-DD directly
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(workout);
            return acc;
        }, {});

        // Sort dates using localeCompare for YYYY-MM-DD strings
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b));

        sortedDates.forEach(date => {
            txtContent += `Data: ${formatDate(date)}\n`; // Format for display if needed
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
        if (typeof jspdf === 'undefined' || typeof jspdf.plugin === 'undefined' || typeof jspdf.plugin.autotable === 'undefined') {
            showToast('Eroare PDF', 'Librăria jsPDF sau plugin-ul AutoTable nu este încărcată.', 'danger');
             console.error("jsPDF or AutoTable not loaded!");
            return;
        }

        const { jsPDF } = window.jspdf;
        // Default export is portrait, 'p', 'mm', 'a4'
        const doc = new jsPDF();

        const tableColumn = ["Data", "Exercițiu", "Grupe", "Seturi", "Rep. Totale", "Greutate Med.", "Volum", "e1RM Max"];
        const tableRows = [];

        // Sort workouts by date for PDF consistency
        const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

        sortedWorkouts.forEach(workout => {
             const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);
             // Avg weight calculation consistent with table display
             const weightedSets = workout.sets.filter(set => set.weight > 0);
             const avgWeight = weightedSets.length > 0 ? (weightedSets.reduce((sum, set) => sum + set.weight, 0) / weightedSets.length) : 0;
             const volume = calculateVolume([workout]);
             const maxE1RM = calculateMaxE1RM(workout.sets);

            const workoutData = [
                formatDate(workout.date),
                workout.exercise, // jsPDF AutoTable handles basic text wrapping
                workout.muscleGroups.join(', '),
                workout.sets.length,
                totalReps,
                avgWeight.toFixed(1) + ' kg',
                volume.toFixed(1),
                maxE1RM.toFixed(1) + ' kg'
                // Notes could be added if needed, but makes table complex
            ];
            tableRows.push(workoutData);
        });

         doc.setFontSize(18);
         doc.text("Jurnal Antrenamente - Gym Log Pro", 14, 20);
         doc.setFontSize(11);
         doc.setTextColor(100); // Grey color for subtitle if needed

         doc.autoTable({
             head: [tableColumn],
             body: tableRows,
             startY: 30,
             theme: 'grid', // 'striped', 'grid', 'plain'
             headStyles: { fillColor: [34, 43, 69] }, // Darker blue-grey header
             styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' }, // Smaller font, padding, allow line breaks
             columnStyles: {
                 0: { cellWidth: 18 }, // Data
                 1: { cellWidth: 35 }, // Exercitiu
                 2: { cellWidth: 30 }, // Grupe
                 3: { cellWidth: 12, halign: 'center' }, // Seturi
                 4: { cellWidth: 18, halign: 'center' }, // Rep Totale
                 5: { cellWidth: 22, halign: 'right' }, // Greutate Med
                 6: { cellWidth: 18, halign: 'right' }, // Volum
                 7: { cellWidth: 22, halign: 'right' }  // e1RM Max
             },
             didDrawPage: function (data) {
                // Footer with page number
                let footerStr = "Pagina " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(footerStr, data.settings.margin.left, doc.internal.pageSize.height - 10);
             }
         });


        doc.save(`gym_log_pro_export_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Export PDF', 'Datele au fost exportate în format PDF.', 'success');
    }

    // --- Body Weight Logging (Example) ---
    function handleLogBodyWeight() {
        // Assuming bodyWeightInputSettings and logBodyWeightBtnSettings exist
        if (!bodyWeightInputSettings || !logBodyWeightBtnSettings) return;

        const weightValue = parseFloat(bodyWeightInputSettings.value);
        const todayDate = new Date().toISOString().split('T')[0];

        if (isNaN(weightValue) || weightValue <= 0) {
            showToast('Eroare', 'Introduceți o valoare validă pentru greutate.', 'warning');
            return;
        }

        // Add or update weight for today
        const existingIndex = weightLog.findIndex(entry => entry.date === todayDate);
        if (existingIndex > -1) {
            weightLog[existingIndex].weight = weightValue;
        } else {
            weightLog.push({ date: todayDate, weight: weightValue });
        }

        // Sort log just in case
        weightLog.sort((a, b) => a.date.localeCompare(b.date));

        saveData(WEIGHT_LOG_STORAGE_KEY, weightLog);
        showToast('Succes', `Greutate corporală (${weightValue} kg) înregistrată pentru azi.`, 'success');
        bodyWeightInputSettings.value = ''; // Clear input

        // Re-render the weight chart if the dashboard is active
        if (document.getElementById('dashboardTabContent').classList.contains('active')) {
            renderWeightProgressChart();
        }
    }


    // --- Utility Functions ---
    function formatDate(dateString) {
        if (!dateString || dateString.length < 10) return '-'; // Basic check for YYYY-MM-DD
        // Keep ISO format for consistency & sorting internally
        // Could format differently for display if needed, e.g.:
        // const [year, month, day] = dateString.substring(0, 10).split('-');
        // return `${day}.${month}.${year}`; // DD.MM.YYYY format
        return dateString.substring(0, 10); // Return YYYY-MM-DD
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
                e.preventDefault(); // Prevent potential form submission if inside one
                handleAddCustomExercise();
            }
        });
        backupDataBtnSettings.addEventListener('click', handleBackupData);
        restoreFileSettings.addEventListener('change', handleRestoreData);
        exportCSVSettings.addEventListener('click', handleExportCSV);
        exportTXTSettings.addEventListener('click', handleExportTXT);
        exportPDFSettings.addEventListener('click', handleExportPDF);

        // Body Weight Logging Listener (Add if elements exist)
        if (logBodyWeightBtnSettings) {
            logBodyWeightBtnSettings.addEventListener('click', handleLogBodyWeight);
        }
        if (bodyWeightInputSettings) {
             bodyWeightInputSettings.addEventListener('keypress', (e) => {
                 if (e.key === 'Enter') {
                     e.preventDefault();
                     handleLogBodyWeight();
                 }
             });
        }

         // Add initial sort icon state
        const initialSortHeader = document.querySelector(`#workoutTable th[data-column="${currentSort.column}"]`);
        if (initialSortHeader) {
             const initialSortIcon = initialSortHeader.querySelector('.sort-icon');
             if (initialSortIcon) {
                initialSortIcon.classList.add(currentSort.order === 'asc' ? 'bi-sort-up' : 'bi-sort-down');
             }
        }

        // Debounced Resize Handler for D3 Charts
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log("Resizing charts...");
                // Re-render charts only if the dashboard tab is active or visible
                if (document.getElementById('dashboardTabContent').classList.contains('active')) {
                    if (document.getElementById('musclesWorkedChartContainer')) renderMuscleGroupsChart(getWorkoutsForPeriod(dashboardPeriodSelect.value));
                    if (document.getElementById('d3VolumeChartDash')) renderVolumeChartDash(getWorkoutsForPeriod(dashboardPeriodSelect.value));
                    if (document.getElementById('d3ProgressChartDash')) handleProgressExerciseChangeDash(); // Re-renders progress chart
                    if (document.getElementById('weightProgressChartContainer')) renderWeightProgressChart();
                    if (document.getElementById('consistencyHeatmapContainer')) renderConsistencyHeatmapDash();
                }
            }, 250); // Debounce timeout
        });
    }

    // --- Start the application ---
    initializeApp();

}); // End DOMContentLoaded