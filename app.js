// app.js - Gym Log Pro Logic (v2 - Grouped Log & Dashboard Widgets)

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and State ---
    const WORKOUT_STORAGE_KEY = 'gymLogProWorkouts';
    const EXERCISE_STORAGE_KEY = 'gymLogProCustomExercises';
    const PR_STORAGE_KEY = 'gymLogProPersonalRecords';
    const BODYWEIGHT_STORAGE_KEY = 'gymLogProBodyweight'; // NEW: For weight chart

    let workouts = loadData(WORKOUT_STORAGE_KEY, []);
    let customExercises = loadData(EXERCISE_STORAGE_KEY, []);
    let personalRecords = loadData(PR_STORAGE_KEY, {}); // { exerciseName: { weight: val, volume: val, e1rm: val, date: '' }, ... }
    let bodyWeightLog = loadData(BODYWEIGHT_STORAGE_KEY, []); // NEW: [{date: 'YYYY-MM-DD', weight: 75.5}, ...]

    let predefinedExercises = []; // Loaded from JSON
    // let currentSort = { column: 'date', order: 'desc' }; // REMOVED: Sorting handled differently now
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
    // const workoutTableBody = document.querySelector('#workoutTable tbody'); // REMOVED: Table replaced
    const workoutLogContainer = document.getElementById('workoutLogContainer'); // NEW: Container for grouped log
    const noDataMessage = document.getElementById('noDataMessage');
    const filterDateInput = document.getElementById('filterDate');
    const filterExerciseInput = document.getElementById('filterExercise');
    const filterMuscleGroupSelect = document.getElementById('filterMuscleGroup');
    const clearFiltersBtn = document.getElementById('clearFilters');
    // const tableHeaders = document.querySelectorAll('#workoutTable th[data-column]'); // REMOVED: Table headers gone

    // Dashboard Tab
    const dashboardPeriodSelect = document.getElementById('dashboardPeriodSelect');
    // Summary Stats (Existing)
    const statsExercises = document.getElementById('statsExercises');
    const statsSets = document.getElementById('statsSets');
    const statsReps = document.getElementById('statsReps');
    const statsAvgWeight = document.getElementById('statsAvgWeight');
    const statsTotalVolume = document.getElementById('statsTotalVolume');
    // Weekly Averages (Existing)
    const weeklyAvgWorkouts = document.getElementById('weeklyAvgWorkouts');
    const weeklyAvgSets = document.getElementById('weeklyAvgSets');
    const weeklyAvgReps = document.getElementById('weeklyAvgReps');
    const weeklyAvgRepsPerSet = document.getElementById('weeklyAvgRepsPerSet');
    const weeklyAvgVolume = document.getElementById('weeklyAvgVolume');
    // Existing PR List (Historical)
    const personalRecordsList = document.getElementById('personalRecordsList');
    const noPrMessage = document.getElementById('noPrMessage');
    // Existing Charts
    const d3MusclesChartContainer = document.getElementById('musclesWorkedChartContainer');
    const d3MusclesChartSvg = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const d3VolumeChartDashSvg = document.getElementById('d3VolumeChartDash');
    const d3ProgressChartDashSvg = document.getElementById('d3ProgressChartDash');
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');
    // NEW Dashboard Widget Elements
    const focusWidgetContent = document.querySelector('.focus-widget-content'); // Assuming one element
    const newPrZoneList = document.getElementById('newPrZoneList');
    const noNewPrMessage = document.getElementById('noNewPrMessage');
    const recentSessionsList = document.getElementById('recentSessionsList');
    const noRecentSessionsMessage = document.getElementById('noRecentSessionsMessage');
    const weightProgressChartContainer = document.getElementById('weightProgressChartContainer');
    const consistencyHeatmapContainer = document.getElementById('consistencyHeatmapContainer');
    const heatmapTooltip = document.getElementById('heatmapTooltip');

    // Settings Tab (Existing)
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
        renderWorkoutLog(); // Use new render function
        updateDashboard(); // Initial dashboard render
        renderCustomExercisesList();
        setupEventListeners();
        addSetRow(); // Add the first set row by default
    }

    // --- Data Handling (loadData, saveData, loadPredefinedExercises remain the same) ---
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

    // --- UI Functions (showToast, setDefaultDate, populateExerciseDropdown, populateMuscleGroupFilter, resetForm, addSetRow, validateSets, getSetsData remain largely the same) ---
    function showToast(title, message, type = 'success') {
        toastTitleElement.textContent = title;
        toastBodyElement.textContent = message;
        toastElement.classList.remove('text-bg-success', 'text-bg-warning', 'text-bg-danger', 'text-bg-info', 'text-bg-secondary');
        if (type === 'success') toastElement.classList.add('text-bg-success');
        else if (type === 'warning') toastElement.classList.add('text-bg-warning');
        else if (type === 'danger') toastElement.classList.add('text-bg-danger');
        else if (type === 'info') toastElement.classList.add('text-bg-info');
        else toastElement.classList.add('text-bg-secondary');
        toast.show();
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function populateExerciseDropdown() {
        const allExercises = [...new Set([...predefinedExercises, ...customExercises])].sort(); // Ensure uniqueness
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
        progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';

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
             progressExerciseSelectDash.appendChild(option.cloneNode(true));
         });
    }

    function populateMuscleGroupFilter() {
        const muscleGroups = [...new Set(workouts.flatMap(w => w.muscleGroups))].sort();
        filterMuscleGroupSelect.innerHTML = '<option value="">Filtrează grupă...</option>';
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
        muscleGroupsSelect.selectedIndex = -1;
        exerciseSelect.value = "";
        setsContainer.innerHTML = '';
        addSetRow();
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
             validateSets();
        });
        setDiv.querySelectorAll('.reps-input, .weight-input').forEach(input => {
             input.addEventListener('input', validateSets);
         });
         validateSets();
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
         setsWarning.classList.toggle('d-none', isValid); // More concise toggle
         return isValid;
     }

    function getSetsData() {
        const sets = [];
        setsContainer.querySelectorAll('.set-row').forEach(row => {
            const reps = row.querySelector('.reps-input').value;
            const weight = row.querySelector('.weight-input').value;
            if (reps && weight && reps >= 0 && weight >= 0) {
                sets.push({ reps: parseInt(reps, 10), weight: parseFloat(weight) });
            }
        });
        return sets;
    }

    // --- NEW: Render Workout Log (Grouped by Day) ---
    function renderWorkoutLog() {
        workoutLogContainer.innerHTML = ''; // Clear previous log
        const filteredWorkouts = filterWorkouts(); // Get filtered data

        if (filteredWorkouts.length === 0) {
            noDataMessage.classList.remove('d-none');
            return;
        }
        noDataMessage.classList.add('d-none');

        // Group workouts by date
        const groupedByDate = filteredWorkouts.reduce((acc, workout) => {
            const date = workout.date; // Use YYYY-MM-DD as key
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(workout);
            return acc;
        }, {});

        // Sort dates descending
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

        // Sort all workouts by date descending ONCE for previous workout lookup
        const allWorkoutsSorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)); // Sort by date then ID

        // Render each day group
        sortedDates.forEach(date => {
            const dayGroupDiv = document.createElement('div');
            dayGroupDiv.className = 'log-day-group mb-4 card'; // Use Bootstrap card for styling

            const dateHeader = document.createElement('h5');
            dateHeader.className = 'log-date-header card-header bg-opacity-10 bg-secondary text-white py-2 px-3 fs-6';
            dateHeader.textContent = formatDateForDisplay(date); // Format date nicely
            dayGroupDiv.appendChild(dateHeader);

            const dayEntriesDiv = document.createElement('div');
            dayEntriesDiv.className = 'log-day-entries list-group list-group-flush';

            // Sort workouts within the day if needed (e.g., by time if available, or keep order)
            const workoutsForDay = groupedByDate[date];

            workoutsForDay.forEach(workout => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'log-exercise-entry list-group-item bg-transparent px-3 py-2';
                entryDiv.dataset.id = workout.id; // Store ID for actions

                const currentVolume = calculateVolume([workout]);
                const currentE1RM = calculateMaxE1RM(workout.sets);
                const isPR = checkForPR(workout.exercise, currentVolume, currentE1RM, workout.date); // Check if this entry matches a PR date

                // Find previous workout for comparison
                const previousWorkout = findPreviousWorkout(workout, allWorkoutsSorted);
                let volumeComparisonHTML = '<span class="comparison-indicator volume-comparison text-muted"><i class="bi bi-dash-lg"></i></span>'; // Default: no comparison
                let e1rmComparisonHTML = '<span class="comparison-indicator e1rm-comparison text-muted"><i class="bi bi-dash-lg"></i></span>'; // Default: no comparison

                if (previousWorkout) {
                    const previousVolume = calculateVolume([previousWorkout]);
                    const previousE1RM = calculateMaxE1RM(previousWorkout.sets);

                    // Volume Comparison
                    if (currentVolume > previousVolume) {
                        const diff = ((currentVolume - previousVolume) / previousVolume * 100).toFixed(0);
                        volumeComparisonHTML = `<span class="comparison-indicator volume-comparison text-success" title="vs ${previousVolume.toFixed(0)}"><i class="bi bi-arrow-up-short"></i> +${diff}%</span>`;
                    } else if (currentVolume < previousVolume && previousVolume > 0) {
                        const diff = ((previousVolume - currentVolume) / previousVolume * 100).toFixed(0);
                        volumeComparisonHTML = `<span class="comparison-indicator volume-comparison text-danger" title="vs ${previousVolume.toFixed(0)}"><i class="bi bi-arrow-down-short"></i> -${diff}%</span>`;
                    } else if (currentVolume === previousVolume && currentVolume > 0) {
                         volumeComparisonHTML = `<span class="comparison-indicator volume-comparison text-secondary" title="vs ${previousVolume.toFixed(0)}"><i class="bi bi-arrow-right-short"></i></span>`;
                    }

                    // e1RM Comparison
                     if (currentE1RM > previousE1RM) {
                        const diff = ((currentE1RM - previousE1RM) / previousE1RM * 100).toFixed(0);
                        e1rmComparisonHTML = `<span class="comparison-indicator e1rm-comparison text-success" title="vs ${previousE1RM.toFixed(1)} kg"><i class="bi bi-arrow-up-short"></i> +${diff}%</span>`;
                    } else if (currentE1RM < previousE1RM && previousE1RM > 0) {
                        const diff = ((previousE1RM - currentE1RM) / previousE1RM * 100).toFixed(0);
                        e1rmComparisonHTML = `<span class="comparison-indicator e1rm-comparison text-danger" title="vs ${previousE1RM.toFixed(1)} kg"><i class="bi bi-arrow-down-short"></i> -${diff}%</span>`;
                    } else if (currentE1RM === previousE1RM && currentE1RM > 0) {
                         e1rmComparisonHTML = `<span class="comparison-indicator e1rm-comparison text-secondary" title="vs ${previousE1RM.toFixed(1)} kg"><i class="bi bi-arrow-right-short"></i></span>`;
                    }
                }

                // Build Sets Summary String (using badges)
                const setsSummaryHTML = workout.sets.map((set, index) =>
                    `<span class="badge text-bg-secondary me-1 fw-normal" title="Set ${index + 1}">${set.reps}r @ ${set.weight}kg</span>`
                ).join(' ');

                entryDiv.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-start flex-wrap">
                        <div class="entry-main-info mb-1 me-2"> <!-- Added me-2 -->
                            <h6 class="mb-0 exercise-name d-inline-block">${workout.exercise}</h6>
                            ${isPR ? '<span class="pr-indicator text-warning ms-1" title="Record Personal stabilit la această dată!"><i class="bi bi-star-fill"></i></span>' : ''}
                            <small class="text-muted muscle-groups ms-2 d-block d-sm-inline">(${workout.muscleGroups.join(', ')})</small>
                        </div>
                        <div class="entry-actions text-nowrap ms-sm-auto mb-1"> <!-- Use ms-sm-auto -->
                            <button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" title="Editează"><i class="bi bi-pencil-fill"></i></button>
                            <button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" title="Șterge"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>
                    <div class="sets-summary mb-1">
                        ${setsSummaryHTML || '<span class="text-muted small">Fără seturi valide.</span>'}
                    </div>
                    <div class="exercise-stats small">
                         <span class="me-3" title="Volum Total (Reps * Greutate)"><strong class="me-1">Vol:</strong> <span class="volume-value">${currentVolume.toFixed(0)}</span> ${volumeComparisonHTML}</span>
                         <span class="me-3" title="Estimare 1 Rep Max (Formula Brzycki)"><strong class="me-1">e1RM:</strong> <span class="e1rm-value">${currentE1RM.toFixed(1)}</span> kg ${e1rmComparisonHTML}</span>
                         ${workout.notes ? '<a href="#" class="details-toggle text-decoration-none text-info" title="Vezi/Ascunde notițe">[+] Notițe</a>' : ''}
                    </div>
                    ${workout.notes ? `
                    <div class="exercise-details d-none mt-2 border-top border-secondary border-opacity-25 pt-2">
                         <p class="mb-0 small notes-text text-muted"><em>${workout.notes}</em></p>
                    </div>` : ''}
                `;
                dayEntriesDiv.appendChild(entryDiv);
            });

            dayGroupDiv.appendChild(dayEntriesDiv);
            workoutLogContainer.appendChild(dayGroupDiv);
        });

        // Add event listeners for the newly rendered items
        addLogEntryActionListeners();
    }

    // --- NEW: Helper to find the previous workout entry for the same exercise ---
    function findPreviousWorkout(currentWorkout, sortedWorkouts) {
        // Find the index of the current workout in the fully sorted list
        const currentIndex = sortedWorkouts.findIndex(w => w.id === currentWorkout.id);
        if (currentIndex === -1) return null; // Should not happen

        // Search backwards from the current index for the next entry with the same exercise name
        for (let i = currentIndex + 1; i < sortedWorkouts.length; i++) {
            if (sortedWorkouts[i].exercise === currentWorkout.exercise) {
                return sortedWorkouts[i]; // Found the previous one
            }
        }
        return null; // No previous entry found
    }


    // --- NEW: Add Listeners for Log Entries ---
    function addLogEntryActionListeners() {
        workoutLogContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        workoutLogContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
        workoutLogContainer.querySelectorAll('.details-toggle').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const detailsDiv = e.target.closest('.log-exercise-entry').querySelector('.exercise-details');
                if (detailsDiv) {
                    detailsDiv.classList.toggle('d-none');
                    e.target.textContent = detailsDiv.classList.contains('d-none') ? '[+] Notițe' : '[-] Notițe';
                }
            });
        });
    }

    function showTab(tabId) {
        tabContents.forEach(tab => tab.classList.remove('active'));
        bottomNavButtons.forEach(btn => btn.classList.remove('active'));

        const activeTab = document.getElementById(tabId);
        const activeButton = document.querySelector(`#bottomNav button[data-target="${tabId}"]`);

        if (activeTab) activeTab.classList.add('active');
        if (activeButton) activeButton.classList.add('active');

        if (tabId === 'dashboardTabContent') updateDashboard();
        else if (tabId === 'settingsTabContent') renderCustomExercisesList();
        else if (tabId === 'logTabContent') {
            renderWorkoutLog(); // Use new render function
            populateExerciseDropdown();
            populateMuscleGroupFilter();
        }
    }

    // --- Calculations (calculateVolume, calculateE1RM, calculateMaxE1RM remain the same) ---
    function calculateVolume(workoutArray) {
        return workoutArray.reduce((totalVol, workout) => {
            const entryVol = workout.sets.reduce((vol, set) => vol + (set.reps * set.weight), 0);
            return totalVol + entryVol;
        }, 0);
    }
    function calculateE1RM(weight, reps) {
        if (reps <= 0) return 0;
        if (reps === 1) return weight;
        const denominator = 1.0278 - (0.0278 * reps);
        return denominator > 0 ? weight / denominator : 0;
    }
    function calculateMaxE1RM(sets) {
        if (!sets || sets.length === 0) return 0;
        return Math.max(0, ...sets.map(set => calculateE1RM(set.weight, set.reps))); // Ensure non-negative
    }

    // --- Update PRs (Modified to store date with PR) ---
     function updatePersonalRecords(exercise, sets, workoutDate) { // Added workoutDate
         const currentMaxWeightSet = sets.reduce((maxSet, currentSet) => {
             return currentSet.weight > (maxSet.weight || 0) ? currentSet : maxSet;
         }, { weight: 0, reps: 0 });
         const currentMaxWeight = currentMaxWeightSet.weight;
         const currentMaxE1RM = calculateMaxE1RM(sets);
         const currentVolume = sets.reduce((vol, set) => vol + (set.reps * set.weight), 0);

         let recordUpdated = false;
         if (!personalRecords[exercise]) {
             personalRecords[exercise] = { weight: 0, volume: 0, e1rm: 0, weightDate: '', volumeDate: '', e1rmDate: '' }; // Added date fields
         }

         const record = personalRecords[exercise];

         // Update only if the new value is strictly greater
         if (currentMaxWeight > record.weight) {
             record.weight = currentMaxWeight;
             record.weightDate = workoutDate; // Store date of PR
             recordUpdated = true;
         }
         if (currentVolume > record.volume) {
             record.volume = currentVolume;
             record.volumeDate = workoutDate; // Store date of PR
             recordUpdated = true;
         }
          if (currentMaxE1RM > record.e1rm) {
             record.e1rm = currentMaxE1RM;
             record.e1rmDate = workoutDate; // Store date of PR
             recordUpdated = true;
         }

         if (recordUpdated) {
             saveData(PR_STORAGE_KEY, personalRecords);
             console.log(`PR updated for ${exercise} on ${workoutDate}:`, record);
             return true;
         }
         return false;
     }

     // --- Check for PR (Modified to check against stored PR date) ---
     function checkForPR(exercise, volume, maxE1RM, workoutDate) {
        const record = personalRecords[exercise];
        if (!record) return false;

        // Check if the current workout date matches the date when any of the PRs were set
        return (record.volume > 0 && record.volumeDate === workoutDate) ||
               (record.e1rm > 0 && record.e1rmDate === workoutDate) ||
               (record.weight > 0 && record.weightDate === workoutDate); // Check weight PR date too
     }

    // --- Event Handlers ---
    function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const isValid = workoutForm.checkValidity();
        const areSetsValid = validateSets();

        workoutForm.classList.add('was-validated');

        if (!isValid || !areSetsValid) {
             if (!areSetsValid) showToast('Eroare Formular', 'Verificați seturile introduse (Rep. și Kg obligatorii).', 'warning');
             else showToast('Eroare Formular', 'Vă rugăm completați câmpurile obligatorii.', 'warning');
            return;
        }

        const workoutData = {
            id: editingId || Date.now().toString(),
            date: dateInput.value,
            muscleGroups: Array.from(muscleGroupsSelect.selectedOptions).map(option => option.value),
            exercise: exerciseSelect.value,
            sets: getSetsData(),
            notes: notesInput.value.trim()
        };

        if (editingId) {
            const index = workouts.findIndex(w => w.id === editingId);
            if (index > -1) {
                workouts[index] = workoutData;
                showToast('Succes', 'Antrenament actualizat cu succes!');
            }
        } else {
            workouts.push(workoutData);
            showToast('Succes', 'Antrenament adăugat cu succes!');
        }

        // Pass the date when updating PRs
        const prSet = updatePersonalRecords(workoutData.exercise, workoutData.sets, workoutData.date);
        if (prSet && !editingId) { // Show PR toast only for new entries setting a PR
            showToast('Record Personal!', `Nou record stabilit pentru ${workoutData.exercise}!`, 'info');
        }

        saveData(WORKOUT_STORAGE_KEY, workouts);
        renderWorkoutLog(); // Use new render function
        populateMuscleGroupFilter();
        populateExerciseDropdown();
        resetForm();
        updateDashboard(); // Update dashboard after adding/editing data
    }

    function handleEdit(event) {
        const button = event.target.closest('button');
        const entryDiv = button.closest('.log-exercise-entry'); // Target new structure
        const id = entryDiv.dataset.id;
        const workout = workouts.find(w => w.id === id);

        if (!workout) return;

        editingId = id;
        editIdInput.value = id;
        formTitle.textContent = 'Editează Exercițiu';
        submitBtn.textContent = 'Actualizează';
        cancelEditBtn.classList.remove('d-none');

        dateInput.value = workout.date;
        Array.from(muscleGroupsSelect.options).forEach(option => {
            option.selected = workout.muscleGroups.includes(option.value);
        });
        exerciseSelect.value = workout.exercise;
        notesInput.value = workout.notes;

        setsContainer.innerHTML = '';
        workout.sets.forEach(set => addSetRow(set.reps, set.weight));
        validateSets();
        workoutForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to top of form
    }

    function handleDelete(event) {
        const button = event.target.closest('button');
        const entryDiv = button.closest('.log-exercise-entry'); // Target new structure
        const id = entryDiv.dataset.id;
        const workout = workouts.find(w => w.id === id);

        if (!workout) return;

        if (confirm(`Sunteți sigur că doriți să ștergeți înregistrarea pentru ${workout.exercise} din ${formatDateForDisplay(workout.date)}?`)) {
            workouts = workouts.filter(w => w.id !== id);
            saveData(WORKOUT_STORAGE_KEY, workouts);
            renderWorkoutLog(); // Use new render function
            populateMuscleGroupFilter();
            // Consider recalculating PRs if a deleted entry was the PR date
            // For now, PRs remain until overwritten by a new higher value
            showToast('Șters', 'Înregistrarea a fost ștearsă.', 'success');
            updateDashboard(); // Update dashboard after deleting data
        }
    }

    function handleCancelEdit() {
        resetForm();
    }

    function handleFilterChange() {
        renderWorkoutLog(); // Use new render function
    }

    function handleClearFilters() {
        filterDateInput.value = '';
        filterExerciseInput.value = '';
        filterMuscleGroupSelect.value = '';
        renderWorkoutLog(); // Use new render function
    }

    // REMOVED: handleSort function as table headers are gone

    // --- Modified: Filter Workouts (Sorting removed, done in render) ---
    function filterWorkouts() {
        const dateFilter = filterDateInput.value;
        const exerciseFilter = filterExerciseInput.value.toLowerCase();
        const muscleGroupFilter = filterMuscleGroupSelect.value;

        return workouts.filter(w => {
            const matchDate = !dateFilter || w.date === dateFilter;
            const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter);
            const matchMuscleGroup = !muscleGroupFilter || w.muscleGroups.includes(muscleGroupFilter);
            return matchDate && matchExercise && matchMuscleGroup;
        });
        // Sorting is now handled within renderWorkoutLog by date descending
    }

    // --- Dashboard ---
    function getWorkoutsForPeriod(period) {
        const now = new Date();
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Start of day for comparison

        switch (period) {
            case 'last7days':
                startDate.setDate(now.getDate() - 6); // Include today + 6 previous days
                break;
            case 'last30days':
                startDate.setDate(now.getDate() - 29); // Include today + 29 previous days
                break;
            case 'allTime':
                return workouts;
            default: // Default to last 7 days
                startDate.setDate(now.getDate() - 6);
        }
        const startTime = startDate.getTime();
        // Filter based on date string comparison (YYYY-MM-DD) or Date object comparison
        const startDateString = startDate.toISOString().split('T')[0];
        return workouts.filter(w => w.date >= startDateString);
    }

    function updateDashboard() {
        const period = dashboardPeriodSelect.value;
        const periodWorkouts = getWorkoutsForPeriod(period);

        // --- 1. Calculate Summary Stats (Existing logic is fine) ---
        const totalEntries = periodWorkouts.length;
        const totalSets = periodWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
        const totalReps = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0);
        const totalWeightSum = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.weight, 0), 0);
        const totalWeightEntries = periodWorkouts.reduce((sum, w) => sum + w.sets.filter(s => s.weight > 0).length, 0);
        const avgWeight = totalWeightEntries > 0 ? (totalWeightSum / totalWeightEntries) : 0;
        const totalVolume = calculateVolume(periodWorkouts);

        statsExercises.textContent = totalEntries;
        statsSets.textContent = totalSets;
        statsReps.textContent = totalReps;
        statsAvgWeight.textContent = avgWeight.toFixed(1) + ' kg';
        statsTotalVolume.textContent = (totalVolume / 1000).toFixed(2) + ' T';

        // --- 2. Calculate Weekly Averages (Existing logic is fine, but ensure date sorting for 'allTime') ---
        let daysInPeriod = 7;
        if (period === 'last30days') daysInPeriod = 30;
        else if (period === 'allTime') {
            const sortedByDate = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
            const minDate = sortedByDate.length > 0 ? new Date(sortedByDate[0].date) : new Date();
            const maxDate = sortedByDate.length > 0 ? new Date(sortedByDate[sortedByDate.length - 1].date) : new Date();
            daysInPeriod = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24) + 1); // Add 1 to include start/end day
        }
        const weeksInPeriod = Math.max(1, daysInPeriod / 7);
        const uniqueWorkoutDays = new Set(periodWorkouts.map(w => w.date)).size;

        weeklyAvgWorkouts.textContent = (uniqueWorkoutDays / weeksInPeriod).toFixed(1);
        weeklyAvgSets.textContent = (totalSets / weeksInPeriod).toFixed(1);
        weeklyAvgReps.textContent = (totalReps / weeksInPeriod).toFixed(1);
        weeklyAvgRepsPerSet.textContent = totalSets > 0 ? (totalReps / totalSets).toFixed(1) : '0';
        weeklyAvgVolume.textContent = ((totalVolume / 1000) / weeksInPeriod).toFixed(2) + ' T';

        // --- 3. Render Historical Personal Records (Existing logic is fine) ---
        renderPersonalRecords();

        // --- 4. Render Muscle Groups Chart (Existing logic is fine) ---
        renderMuscleGroupsChart(periodWorkouts);

        // --- 5. Render Volume Chart (Existing logic is fine) ---
        renderVolumeChartDash(periodWorkouts);

        // --- 6. Render Progress Chart (Existing logic is fine) ---
        handleProgressExerciseChangeDash(); // Render based on current selection

        // --- 7. NEW: Render New Dashboard Widgets ---
        renderFocusWidget(); // Placeholder implementation
        renderPrZoneWidget();
        renderRecentSessionsWidget();
        renderWeightProgressChart(); // Placeholder implementation
        renderConsistencyHeatmap(); // Use existing workout data
    }

    // --- Render Historical PRs (Top 5) ---
    function renderPersonalRecords() {
        personalRecordsList.innerHTML = '';
        const sortedRecords = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => record.e1rm > 0 || record.weight > 0 || record.volume > 0)
            .sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0));

        noPrMessage.classList.toggle('d-none', sortedRecords.length > 0);

        const topRecords = sortedRecords.slice(0, 5); // Show top 5 historical

        topRecords.forEach(record => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap'); // Added flex-wrap
            li.innerHTML = `
                <span class="pr-exercise me-2">${record.exercise}</span>
                <div class="text-end"> <!-- Wrap badges -->
                    ${record.e1rm > 0 ? `<span class="badge bg-primary rounded-pill me-1 mb-1" title="Estimat 1 Rep Max (${formatDateForDisplay(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)} <span class="pr-type">kg</span></span>` : ''}
                    ${record.weight > 0 ? `<span class="badge bg-success rounded-pill me-1 mb-1" title="Greutate maximă (${formatDateForDisplay(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)} <span class="pr-type">kg</span></span>` : ''}
                    ${record.volume > 0 ? `<span class="badge bg-warning text-dark rounded-pill mb-1" title="Volum maxim (${formatDateForDisplay(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(1)} <span class="pr-type">vol</span></span>` : ''}
                </div>
            `;
            personalRecordsList.appendChild(li);
        });
    }

    // --- Dashboard Chart Rendering (renderMuscleGroupsChart, renderVolumeChartDash, handleProgressExerciseChangeDash remain the same) ---
     function renderMuscleGroupsChart(data) {
         const muscleCounts = data.reduce((acc, workout) => {
             workout.muscleGroups.forEach(group => { acc[group] = (acc[group] || 0) + 1; });
             return acc;
         }, {});
         const sortedMuscles = Object.entries(muscleCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
         const svg = d3.select("#d3MusclesChart");
         svg.selectAll("*").remove();

         noMuscleDataMessage.classList.toggle('d-none', sortedMuscles.length > 0);
         d3MusclesChartContainer.style.display = 'block';
         svg.style('display', sortedMuscles.length > 0 ? 'block' : 'none');
         if (sortedMuscles.length === 0) return;

         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 20, bottom: 70, left: 40 };
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;
         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
         const x = d3.scaleBand().range([0, chartWidth]).padding(0.2).domain(sortedMuscles.map(d => d[0]));
         const y = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(sortedMuscles, d => d[1]) || 1]).nice();
         g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x)).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-45)");
         g.append("g").call(d3.axisLeft(y).ticks(Math.min(5, d3.max(sortedMuscles, d => d[1]) || 1)).tickFormat(d3.format("d"))).append("text").attr("class", "axis-label").attr("fill", "#adb5bd").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "-3.0em").attr("text-anchor", "end").text("Nr. Sesiuni");
         g.selectAll(".muscle-bar").data(sortedMuscles).enter().append("rect").attr("class", "muscle-bar").attr("x", d => x(d[0])).attr("y", d => y(d[1])).attr("width", x.bandwidth()).attr("height", d => chartHeight - y(d[1])).append("title").text(d => `${d[0]}: ${d[1]} sesiuni`);
         g.selectAll(".bar-label").data(sortedMuscles).enter().append("text").attr("class", "bar-label").attr("x", d => x(d[0]) + x.bandwidth() / 2).attr("y", d => y(d[1]) - 5).attr("text-anchor", "middle").text(d => d[1]);
     }

     function renderVolumeChartDash(data) {
         const svg = d3.select("#d3VolumeChartDash");
         svg.selectAll("*").remove();
         if (data.length === 0) {
             svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Nu există date de volum.");
             return;
         }
         const volumeByDate = d3.rollup(data, v => d3.sum(v, d => calculateVolume([d])), d => d.date);
         const aggregatedData = Array.from(volumeByDate, ([date, volume]) => ({ date: new Date(date), volume })).sort((a, b) => a.date - b.date);
         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 40, bottom: 50, left: 50 };
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;
         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
         const x = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(aggregatedData, d => d.date));
         const y = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(aggregatedData, d => d.volume) || 100]).nice();
         g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b"))).selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-30)");
         g.append("g").call(d3.axisLeft(y).ticks(5)).append("text").attr("class", "axis-label").attr("fill", "#adb5bd").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "-3.5em").attr("text-anchor", "end").text("Volum Total (kg)");
         const line = d3.line().x(d => x(d.date)).y(d => y(d.volume)).curve(d3.curveMonotoneX);
         g.append("path").datum(aggregatedData).attr("fill", "none").attr("stroke", "var(--htb-accent)").attr("stroke-width", 2).attr("d", line);
         g.selectAll(".volume-dot").data(aggregatedData).enter().append("circle").attr("class", "volume-dot").attr("cx", d => x(d.date)).attr("cy", d => y(d.volume)).attr("r", 3).attr("fill", "var(--htb-accent)").append("title").text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}: ${d.volume.toFixed(1)} kg`);
     }

     function handleProgressExerciseChangeDash() {
         const selectedExercise = progressExerciseSelectDash.value;
         const svg = d3.select("#d3ProgressChartDash");
         svg.selectAll("*").remove();
         if (!selectedExercise) {
             svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Selectați un exercițiu."); return;
         }
         const exerciseData = workouts.filter(w => w.exercise === selectedExercise).sort((a, b) => new Date(a.date) - new Date(b.date));
         if (exerciseData.length === 0) {
              svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Nu există date."); return;
         }
         const progressData = exerciseData.map(workout => ({ date: new Date(workout.date), maxE1RM: calculateMaxE1RM(workout.sets), maxWeight: Math.max(0, ...workout.sets.map(s => s.weight)) }));
         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 50, bottom: 50, left: 50 };
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;
         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
         const x = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(progressData, d => d.date));
         const yMaxWeight = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(progressData, d => d.maxWeight) || 1]).nice();
         const yMaxE1RM = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(progressData, d => d.maxE1RM) || 1]).nice();
         g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b"))).selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-30)");
         g.append("g").call(d3.axisLeft(yMaxWeight).ticks(5)).append("text").attr("class", "axis-label").attr("fill", "var(--htb-tag-red)").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "-3.5em").attr("text-anchor", "end").text("Greutate Max (kg)");
         g.append("g").attr("transform", `translate(${chartWidth}, 0)`).call(d3.axisRight(yMaxE1RM).ticks(5)).append("text").attr("class", "axis-label").attr("fill", "var(--htb-accent)").attr("transform", "rotate(-90)").attr("y", -6).attr("dy", "3.0em").attr("text-anchor", "end").text("e1RM Estimat (kg)");
         const lineE1RM = d3.line().x(d => x(d.date)).y(d => yMaxE1RM(d.maxE1RM)).curve(d3.curveMonotoneX);
         g.append("path").datum(progressData).attr("fill", "none").attr("stroke", "var(--htb-accent)").attr("stroke-width", 2).attr("class", "line-e1rm").attr("d", lineE1RM);
         g.selectAll(".dot-weight").data(progressData).enter().append("circle").attr("class", "dot-weight").attr("cx", d => x(d.date)).attr("cy", d => yMaxWeight(d.maxWeight)).attr("r", 4).append("title").text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}:\nGreutate Max: ${d.maxWeight.toFixed(1)} kg\ne1RM Est: ${d.maxE1RM.toFixed(1)} kg`);
         const legend = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top - 15})`);
         legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).style("fill", "var(--htb-tag-red)");
         legend.append("text").attr("x", 10).attr("y", 0).text("Greutate Max").style("font-size", "10px").attr("alignment-baseline","middle").attr("fill", "var(--htb-text-secondary)");
         legend.append("line").attr("x1", 100).attr("y1", 0).attr("x2", 120).attr("y2", 0).attr("stroke", "var(--htb-accent)").attr("stroke-width", 2);
         legend.append("text").attr("x", 130).attr("y", 0).text("e1RM Est.").style("font-size", "10px").attr("alignment-baseline","middle").attr("fill", "var(--htb-text-secondary)");
     }

    // --- NEW Dashboard Widget Rendering Functions ---

    function renderFocusWidget() {
        // Placeholder: Implement logic to determine today's focus
        // Could be based on last workout, a plan, or just static
        if (focusWidgetContent) {
             // Keep existing placeholder HTML or update dynamically
             // Example: focusWidgetContent.querySelector('.focus-text').textContent = "Zi de Picioare";
        }
    }

    function renderPrZoneWidget() {
        newPrZoneList.innerHTML = ''; // Clear list
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const recentPRs = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => // Check if any PR date is within the last 30 days
                (record.e1rmDate && record.e1rmDate >= thirtyDaysAgoStr) ||
                (record.weightDate && record.weightDate >= thirtyDaysAgoStr) ||
                (record.volumeDate && record.volumeDate >= thirtyDaysAgoStr)
            )
            .sort((a, b) => { // Sort by most recent PR date descending
                const latestDateA = Math.max(new Date(a.e1rmDate || 0).getTime(), new Date(a.weightDate || 0).getTime(), new Date(a.volumeDate || 0).getTime());
                const latestDateB = Math.max(new Date(b.e1rmDate || 0).getTime(), new Date(b.weightDate || 0).getTime(), new Date(b.volumeDate || 0).getTime());
                return latestDateB - latestDateA;
            });


        noNewPrMessage.classList.toggle('d-none', recentPRs.length > 0);

        if (recentPRs.length === 0) {
            newPrZoneList.innerHTML = '<div class="list-group-item text-muted small text-center">Niciun record nou în ultima lună.</div>';
            return;
        }

        recentPRs.slice(0, 5).forEach(record => { // Show top 5 recent
            const li = document.createElement('div');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'py-1', 'px-2'); // Smaller padding
            li.innerHTML = `
                <span class="pr-exercise small me-2">${record.exercise}</span>
                <div class="text-end small"> <!-- Wrap badges -->
                    ${(record.e1rmDate && record.e1rmDate >= thirtyDaysAgoStr) ? `<span class="badge bg-primary rounded-pill me-1 mb-1" title="e1RM (${formatDateForDisplay(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)}kg</span>` : ''}
                    ${(record.weightDate && record.weightDate >= thirtyDaysAgoStr) ? `<span class="badge bg-success rounded-pill me-1 mb-1" title="Greutate (${formatDateForDisplay(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)}kg</span>` : ''}
                    ${(record.volumeDate && record.volumeDate >= thirtyDaysAgoStr) ? `<span class="badge bg-warning text-dark rounded-pill mb-1" title="Volum (${formatDateForDisplay(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(0)}</span>` : ''}
                </div>
            `;
            newPrZoneList.appendChild(li);
        });
    }

    function renderRecentSessionsWidget() {
        recentSessionsList.innerHTML = ''; // Clear list

        // Group workouts by date and get unique dates
        const uniqueDates = [...new Set(workouts.map(w => w.date))].sort((a, b) => b.localeCompare(a)); // Sort dates descending

        noRecentSessionsMessage.classList.toggle('d-none', uniqueDates.length > 0);

        if (uniqueDates.length === 0) {
             recentSessionsList.innerHTML = '<li class="list-group-item text-muted small">Nu există sesiuni înregistrate.</li>';
            return;
        }

        const recentDates = uniqueDates.slice(0, 5); // Show last 5 workout days

        recentDates.forEach(date => {
            const workoutsOnDate = workouts.filter(w => w.date === date);
            const exercisesString = workoutsOnDate.map(w => w.exercise).slice(0, 3).join(', ') + (workoutsOnDate.length > 3 ? '...' : ''); // Show first few exercises
            const totalSets = workoutsOnDate.reduce((sum, w) => sum + w.sets.length, 0);

            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1', 'px-2'); // Smaller padding
            li.innerHTML = `
                <div class="small">
                    <strong class="d-block">${formatDateForDisplay(date)}</strong>
                    <span class="text-muted">${exercisesString}</span>
                </div>
                <span class="badge bg-secondary rounded-pill">${totalSets} seturi</span>
            `;
            recentSessionsList.appendChild(li);
        });
    }

    function renderWeightProgressChart() {
        weightProgressChartContainer.innerHTML = ''; // Clear placeholder
        const svg = d3.select(weightProgressChartContainer)
                      .append("svg")
                      .attr("width", "100%")
                      .attr("height", "255"); // Match height from HTML structure

        // --- BODY WEIGHT DATA NEEDED ---
        // const weightData = bodyWeightLog; // Use data from state
        const weightData = []; // Use empty array for now

        if (!weightData || weightData.length < 2) {
            svg.append("text")
               .attr("x", "50%")
               .attr("y", "50%")
               .attr("text-anchor", "middle")
               .attr("fill", "var(--htb-text-muted)")
               .style("font-size", "0.8rem")
               .text("Nu există suficiente date despre greutatea corporală.");
            // Add a link/button to log weight?
            return;
        }

        // --- D3 Charting Code for Body Weight (Similar to Volume/Progress Charts) ---
        // 1. Parse dates: weightData.forEach(d => d.date = new Date(d.date));
        // 2. Setup margins, width, height
        // 3. Create scales (xScale = time, yScale = linear for weight)
        // 4. Create axes
        // 5. Create line generator
        // 6. Append axes and line path to SVG
        // Example placeholder text:
         svg.append("text").attr("x", 10).attr("y", 20).text("Body Weight Chart Placeholder").attr("fill", "grey");
         console.warn("Body weight chart rendering skipped: No data or implementation pending.");
    }

    function renderConsistencyHeatmap() {
        const svg = d3.select(consistencyHeatmapContainer);
        svg.selectAll("*").remove(); // Clear placeholder/previous render

        // --- Configuration ---
        const numberOfWeeks = 4;
        const cellSize = 12; // Smaller cells for dashboard
        const cellSpacing = 2;

        // --- Data Prep ---
        // Use all workouts, no period filtering needed for heatmap structure
        const workoutDates = new Set(workouts.map(w => w.date)); // Get unique workout dates

        // Calculate date range
        const today = d3.timeDay.floor(new Date());
        const endDate = d3.timeDay.offset(today, 1);
        const startDate = d3.timeSunday.offset(today, -numberOfWeeks + 1);
        const allDays = d3.timeDays(startDate, endDate);

        // --- D3 Setup ---
        const tooltip = d3.select(heatmapTooltip); // Use existing tooltip element

        const weekCount = d3.timeWeek.count(startDate, endDate);
        const svgHeight = weekCount * (cellSize + cellSpacing);
        const svgWidth = 7 * (cellSize + cellSpacing);

        svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
           .attr('width', Math.min(svgWidth, 250)) // Limit max width
           .attr('height', svgHeight)
           .attr('preserveAspectRatio', 'xMidYMin meet');

        // --- Draw Rectangles ---
        svg.selectAll('.heatmap-day')
            .data(allDays)
            .enter()
            .append('rect')
            .attr('class', d => {
                const dateString = d3.timeFormat("%Y-%m-%d")(d);
                // Simple intensity: 1 if workout exists, 0 otherwise
                // Could be enhanced later with actual intensity data if logged
                const intensity = workoutDates.has(dateString) ? 1 : 0;
                return `heatmap-day heatmap-day-level-${intensity}`; // Use level 1 for any workout
            })
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('rx', 2).attr('ry', 2)
            .attr('x', d => d3.timeFormat('%w')(d) * (cellSize + cellSpacing)) // Sun=0
            .attr('y', d => d3.timeWeek.count(startDate, d) * (cellSize + cellSpacing))
            .on('mouseover', (event, d) => {
                const dateString = d3.timeFormat("%Y-%m-%d")(d);
                const workedOut = workoutDates.has(dateString);
                const dateFormatted = formatDateForDisplay(dateString);

                tooltip.style('opacity', 1)
                       .html(`${dateFormatted}: ${workedOut ? 'Antrenament' : 'Pauză'}`);
                tooltip.style('left', (event.pageX + 10) + 'px')
                       .style('top', (event.pageY - 20) + 'px');
            })
            .on('mousemove', (event) => {
                 tooltip.style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
    }


    // --- Settings (renderCustomExercisesList, handleAddCustomExercise, handleDeleteCustomExercise, handleBackupData, handleRestoreData, Export functions remain the same) ---
    function renderCustomExercisesList() {
        existingExercisesListSettings.innerHTML = '';
        if (customExercises.length === 0) {
            existingExercisesListSettings.innerHTML = '<li class="list-group-item text-muted">Nu ai adăugat exerciții custom.</li>'; return;
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
                 showToast('Eroare', 'Acest exercițiu există deja.', 'warning'); return;
             }
            customExercises.push(newExercise);
            customExercises.sort();
            saveData(EXERCISE_STORAGE_KEY, customExercises);
            renderCustomExercisesList();
            populateExerciseDropdown();
            newExerciseNameSettings.value = '';
            showToast('Succes', `Exercițiul "${newExercise}" a fost adăugat.`, 'success');
        } else { showToast('Atenție', 'Introduceți un nume valid pentru exercițiu.', 'warning'); }
    }
    function handleDeleteCustomExercise(index) {
        const exerciseToDelete = customExercises[index];
        const isUsed = workouts.some(workout => workout.exercise === exerciseToDelete);
        let proceed = true;
        if (isUsed) {
             proceed = confirm(`Atenție! Exercițiul "${exerciseToDelete}" este folosit în jurnal. Ștergerea lui NU va șterge înregistrările existente.\n\nContinuați cu ștergerea?`);
         } else {
             proceed = confirm(`Sunteți sigur că doriți să ștergeți exercițiul custom "${exerciseToDelete}"?`);
         }
        if (proceed) {
            customExercises.splice(index, 1);
            saveData(EXERCISE_STORAGE_KEY, customExercises);
            renderCustomExercisesList();
            populateExerciseDropdown();
            showToast('Succes', `Exercițiul "${exerciseToDelete}" a fost șters.`, 'success');
        }
    }
    function handleBackupData() {
        const allData = { workouts, customExercises, personalRecords, bodyWeightLog }; // Include bodyweight
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym_log_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast('Backup', 'Backup-ul datelor a fost descărcat.', 'info');
    }
    function handleRestoreData(event) {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith('.json')) {
            showToast('Eroare', 'Selectați un fișier .json valid.', 'warning'); return;
         }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const restoredData = JSON.parse(e.target.result);
                if (confirm('ATENȚIE: Datele curente vor fi suprascrise. Continuați?')) {
                    if (restoredData.workouts && Array.isArray(restoredData.workouts) &&
                        restoredData.customExercises && Array.isArray(restoredData.customExercises) &&
                        restoredData.personalRecords && typeof restoredData.personalRecords === 'object') {
                        workouts = restoredData.workouts;
                        customExercises = restoredData.customExercises;
                        personalRecords = restoredData.personalRecords;
                        bodyWeightLog = restoredData.bodyWeightLog || []; // Restore bodyweight or default to empty

                        saveData(WORKOUT_STORAGE_KEY, workouts);
                        saveData(EXERCISE_STORAGE_KEY, customExercises);
                        saveData(PR_STORAGE_KEY, personalRecords);
                        saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog); // Save bodyweight

                        initializeApp();
                        showToast('Restaurare Completă', 'Datele au fost restaurate.', 'success');
                        showTab('logTabContent');
                    } else { throw new Error("Structura JSON invalidă."); }
                } else { showToast('Anulat', 'Restaurarea a fost anulată.', 'info'); }
            } catch (err) {
                console.error("Error parsing restore file:", err);
                showToast('Eroare Restaurare', `Nu s-a putut restaura: ${err.message}`, 'danger');
            } finally { restoreFileSettings.value = ''; }
        };
        reader.onerror = () => { showToast('Eroare Fișier', 'Nu s-a putut citi fișierul.', 'danger'); restoreFileSettings.value = ''; };
        reader.readAsText(file);
    }
    function handleExportCSV() {
         if (workouts.length === 0) { showToast('Info', 'Nu există date.', 'info'); return; }
         const headers = ["Data", "Exercitiu", "Grupe Musculare", "Set", "Repetari", "Greutate (kg)", "Note"];
         let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
         const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
         sortedWorkouts.forEach(workout => {
             workout.sets.forEach((set, index) => {
                 const row = [
                     formatDateForDisplay(workout.date), `"${workout.exercise}"`, `"${workout.muscleGroups.join(', ')}"`,
                     index + 1, set.reps, set.weight,
                     index === 0 ? `"${workout.notes ? workout.notes.replace(/"/g, '""') : ''}"` : '""'
                 ];
                 csvContent += row.join(",") + "\n";
             });
         });
         const encodedUri = encodeURI(csvContent);
         const link = document.createElement("a"); link.setAttribute("href", encodedUri);
         link.setAttribute("download", `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
         document.body.appendChild(link); link.click(); document.body.removeChild(link);
         showToast('Export CSV', 'Datele exportate în CSV.', 'success');
    }
    function handleExportTXT() {
         if (workouts.length === 0) { showToast('Info', 'Nu există date.', 'info'); return; }
         let txtContent = "Jurnal Antrenamente Gym Log Pro\n=================================\n\n";
         const groupedByDate = workouts.reduce((acc, workout) => {
             const date = formatDateForDisplay(workout.date); // Use display format
             if (!acc[date]) acc[date] = [];
             acc[date].push(workout); return acc;
         }, {});
         const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
             // Convert DD.MM.YYYY back to compare
             const dateA = a.split('.').reverse().join('-');
             const dateB = b.split('.').reverse().join('-');
             return dateA.localeCompare(dateB);
         });
         sortedDates.forEach(date => {
             txtContent += `Data: ${date}\n-----------------\n`;
             groupedByDate[date].forEach(workout => {
                 txtContent += `- ${workout.exercise} (${workout.muscleGroups.join(', ')})\n`;
                 workout.sets.forEach((set, index) => { txtContent += `  Set ${index + 1}: ${set.reps} reps @ ${set.weight} kg\n`; });
                 if (workout.notes) txtContent += `  Notițe: ${workout.notes}\n`;
                 txtContent += "\n";
             });
             txtContent += "\n";
         });
         const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
         const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url;
         a.download = `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.txt`;
         document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
         showToast('Export TXT', 'Datele exportate în TXT.', 'success');
    }
    function handleExportPDF() {
        if (workouts.length === 0) { showToast('Info', 'Nu există date.', 'info'); return; }
        if (typeof jspdf === 'undefined' || typeof jspdf.plugin.autotable === 'undefined') {
            showToast('Eroare PDF', 'Librăria jsPDF/AutoTable lipsește.', 'danger'); console.error("jsPDF or AutoTable not loaded!"); return;
        }
        const { jsPDF } = window.jspdf; const doc = new jsPDF();
        const tableColumn = ["Data", "Exercițiu", "Grupe", "Seturi", "Rep. Totale", "Greutate Med.", "Volum", "e1RM Max"];
        const tableRows = [];
        const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
        sortedWorkouts.forEach(workout => {
             const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);
             const totalWeight = workout.sets.reduce((sum, set) => sum + set.weight, 0);
             const avgWeight = workout.sets.length > 0 ? (totalWeight / workout.sets.length) : 0;
             const volume = calculateVolume([workout]); const maxE1RM = calculateMaxE1RM(workout.sets);
             tableRows.push([
                 formatDateForDisplay(workout.date), workout.exercise, workout.muscleGroups.join(', '), workout.sets.length,
                 totalReps, avgWeight.toFixed(1) + ' kg', volume.toFixed(1), maxE1RM.toFixed(1) + ' kg'
             ]);
        });
         doc.setFontSize(18); doc.text("Jurnal Antrenamente - Gym Log Pro", 14, 20);
         doc.setFontSize(11); doc.setTextColor(100);
         doc.autoTable({
             head: [tableColumn], body: tableRows, startY: 30, theme: 'grid',
             headStyles: { fillColor: [22, 160, 133] }, styles: { fontSize: 8 },
             columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 35 }, 2: { cellWidth: 30 }, 3: { cellWidth: 15, halign: 'center' }, 4: { cellWidth: 20, halign: 'center' }, 5: { cellWidth: 25, halign: 'right' }, 6: { cellWidth: 20, halign: 'right' }, 7: { cellWidth: 25, halign: 'right' } }
         });
        doc.save(`gym_log_pro_export_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Export PDF', 'Datele exportate în PDF.', 'success');
    }

    // --- Utility Functions ---
    function formatDate(dateString) { // Keep internal format consistent
        if (!dateString) return new Date().toISOString().split('T')[0]; // Default to today if null/undefined
        // Assuming input might be Date object or string
        if (dateString instanceof Date) {
            return dateString.toISOString().split('T')[0];
        }
        // Basic validation for YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        // Fallback / attempt to parse other formats if needed, or return today's date
        try {
             return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
             return new Date().toISOString().split('T')[0];
        }
    }
    function formatDateForDisplay(dateString) {
        if (!dateString) return '-';
        try {
            // Convert YYYY-MM-DD to Date object then format
            const [year, month, day] = dateString.split('-');
            const dateObj = new Date(year, month - 1, day); // Month is 0-indexed
            // Use Intl for locale-aware formatting (e.g., "15 Apr 2024" or "15.04.2024")
            return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj);
            // Or simple DD.MM.YYYY: return `${day}.${month}.${year}`;
        } catch (e) {
            return dateString; // Return original if parsing fails
        }
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Form
        workoutForm.addEventListener('submit', handleFormSubmit);
        addSetBtn.addEventListener('click', () => addSetRow());
        cancelEditBtn.addEventListener('click', handleCancelEdit);

        // Log Filtering
        filterDateInput.addEventListener('change', handleFilterChange);
        filterExerciseInput.addEventListener('input', handleFilterChange);
        filterMuscleGroupSelect.addEventListener('change', handleFilterChange);
        clearFiltersBtn.addEventListener('click', handleClearFilters);
        // REMOVED: Table header sort listeners

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
        newExerciseNameSettings.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddCustomExercise(); });
        backupDataBtnSettings.addEventListener('click', handleBackupData);
        restoreFileSettings.addEventListener('change', handleRestoreData);
        exportCSVSettings.addEventListener('click', handleExportCSV);
        exportTXTSettings.addEventListener('click', handleExportTXT);
        exportPDFSettings.addEventListener('click', handleExportPDF);

        // Note: No initial sort icon setup needed as table headers are gone
    }

    // --- Start the application ---
    initializeApp();

}); // End DOMContentLoaded