// app.js - Gym Log Pro Logic (v3 - Separate History Tab & Bodyweight)

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and State ---
    const WORKOUT_STORAGE_KEY = 'gymLogProWorkouts';
    const EXERCISE_STORAGE_KEY = 'gymLogProCustomExercises';
    const PR_STORAGE_KEY = 'gymLogProPersonalRecords';
    const BODYWEIGHT_STORAGE_KEY = 'gymLogProBodyweight';

    let workouts = loadData(WORKOUT_STORAGE_KEY, []);
    let customExercises = loadData(EXERCISE_STORAGE_KEY, []);
    let personalRecords = loadData(PR_STORAGE_KEY, {}); // { exerciseName: { weight: val, volume: val, e1rm: val, weightDate:'', volumeDate:'', e1rmDate:'' }, ... }
    let bodyWeightLog = loadData(BODYWEIGHT_STORAGE_KEY, []); // [{id: timestamp, date: 'YYYY-MM-DD', weight: 75.5}, ...]

    let predefinedExercises = []; // Loaded from JSON
    let editingId = null; // Track if we are editing a workout
    let filterDebounceTimer = null; // For debouncing filter input

    // --- DOM Elements ---
    // General
    const toastElement = document.getElementById('liveToast');
    const toastTitleElement = document.getElementById('toastTitle');
    const toastBodyElement = document.getElementById('toastBody');
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
    const bottomNavButtons = document.querySelectorAll('#bottomNav button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Log Tab (Form)
    const logTabContent = document.getElementById('logTabContent'); // Specific tab content
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

    // Dashboard Tab
    const dashboardTabContent = document.getElementById('dashboardTabContent'); // Specific tab content
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
    // Widgets
    const focusWidgetContent = document.querySelector('.focus-widget-content');
    const newPrZoneList = document.getElementById('newPrZoneList');
    const noNewPrMessage = document.getElementById('noNewPrMessage');
    const recentSessionsList = document.getElementById('recentSessionsList');
    const noRecentSessionsMessage = document.getElementById('noRecentSessionsMessage');
    const weightProgressChartContainer = document.getElementById('weightProgressChartContainer');
    const consistencyHeatmapContainer = document.getElementById('consistencyHeatmapContainer');
    const heatmapTooltip = document.getElementById('heatmapTooltip');
    // Charts
    const d3MusclesChartContainer = document.getElementById('musclesWorkedChartContainer');
    const d3MusclesChartSvg = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const d3VolumeChartDashSvg = document.getElementById('d3VolumeChartDash');
    const d3ProgressChartDashSvg = document.getElementById('d3ProgressChartDash');
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');
    // Historical PR List (on Dashboard)
    const personalRecordsList = document.getElementById('personalRecordsList');
    const noPrMessage = document.getElementById('noPrMessage');

    // History Tab (Log Display) - NEW
    const historyTabContent = document.getElementById('historyTabContent'); // Specific tab content
    const workoutLogContainer = document.getElementById('workoutLogContainer'); // Log display area
    const noDataMessage = document.getElementById('noDataMessage'); // Empty state message
    const filterDateInput = document.getElementById('filterDate');
    const filterExerciseInput = document.getElementById('filterExercise');
    const filterMuscleGroupSelect = document.getElementById('filterMuscleGroup');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Plan Tab
    const planTabContent = document.getElementById('planTabContent'); // Specific tab content

    // Settings Tab
    const settingsTabContent = document.getElementById('settingsTabContent'); // Specific tab content
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    // NEW Bodyweight Elements
    const bodyweightForm = document.getElementById('bodyweightForm');
    const bodyweightDateInput = document.getElementById('bodyweightDate');
    const bodyweightValueInput = document.getElementById('bodyweightValue');
    const saveBodyweightBtn = document.getElementById('saveBodyweightBtn');
    const bodyweightLogList = document.getElementById('bodyweightLogList');
    // Data Management
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileSettings = document.getElementById('restoreFileSettings');
    const exportCSVSettings = document.getElementById('exportCSVSettings');
    const exportTXTSettings = document.getElementById('exportTXTSettings');
    const exportPDFSettings = document.getElementById('exportPDFSettings');

    // --- Initialization ---
    async function initializeApp() {
        showTab('logTabContent'); // Start on Log tab (form)
        setDefaultDate();
        setDefaultBodyweightDate(); // Set default for bodyweight input
        await loadPredefinedExercises();
        populateExerciseDropdown(); // Populate form dropdown
        // Initial renders for lists/data that might be visible on first load or needed by other tabs
        renderCustomExercisesList();
        renderBodyWeightLogList();
        // Note: renderWorkoutLog() and updateDashboard() are called by showTab when needed
        setupEventListeners();
        addSetRow(); // Add the first set row by default on the form
    }

    // --- Data Handling (loadData, saveData, loadPredefinedExercises remain the same) ---
    function loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error loading data for key "${key}":`, e);
            showToast('Eroare Încărcare Date', `Nu s-au putut încărca datele pentru ${key}.`, 'danger');
            return defaultValue;
        }
    }

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving data for key "${key}":`, e);
            showToast('Eroare Salvare Date', `Nu s-au putut salva datele pentru ${key} (posibil spațiu insuficient).`, 'danger');
        }
    }

    async function loadPredefinedExercises() {
        try {
            const response = await fetch('exercises.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            predefinedExercises = await response.json();
            predefinedExercises.sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' })); // Sort alphabetically respecting Romanian characters
        } catch (error) {
            console.error('Error loading predefined exercises:', error);
            showToast('Eroare Încărcare Exerciții', 'Nu s-a putut încărca lista de exerciții predefinite.', 'warning');
            predefinedExercises = ["Bench Press", "Squat", "Deadlift"]; // Fallback basic list
        }
    }

    // --- UI Functions ---
    function showToast(title, message, type = 'success') {
        toastTitleElement.textContent = title;
        toastBodyElement.textContent = message;
        // Ensure correct Bootstrap 5.3+ class handling
        toastElement.className = 'toast'; // Reset classes first
        toastElement.classList.add(`text-bg-${type}`);
        toast.show();
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) dateInput.value = today;
    }

    // NEW: Set default date for bodyweight input
    function setDefaultBodyweightDate() {
        const today = new Date().toISOString().split('T')[0];
        if (bodyweightDateInput) bodyweightDateInput.value = today;
    }

    function populateExerciseDropdown() {
        // Populate form dropdown
        const allExercises = [...new Set([...predefinedExercises, ...customExercises])].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }));
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
        allExercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            exerciseSelect.appendChild(option);
        });

        // Populate dashboard progress chart dropdown (only with exercises actually logged)
        const uniqueExercisesInLog = [...new Set(workouts.map(w => w.exercise))].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }));
        progressExerciseSelectDash.innerHTML = '<option value="">Alege un exercițiu...</option>';
        uniqueExercisesInLog.forEach(ex => {
             const option = document.createElement('option');
             option.value = ex;
             option.textContent = ex;
             progressExerciseSelectDash.appendChild(option);
         });
    }

    function populateMuscleGroupFilter() {
        // Populate history tab filter dropdown
        const muscleGroups = [...new Set(workouts.flatMap(w => w.muscleGroups))].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }));
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
        // Reset multi-select properly
        Array.from(muscleGroupsSelect.options).forEach(option => option.selected = false);
        exerciseSelect.value = "";
        setsContainer.innerHTML = '';
        addSetRow(); // Add one default empty set row
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

        // Add listener to the new remove button
        setDiv.querySelector('.remove-set-btn').addEventListener('click', (e) => {
            const button = e.currentTarget;
            const rowToRemove = button.closest('.set-row');
            if (setsContainer.children.length > 1) {
                rowToRemove.remove();
            } else {
                showToast('Atenție', 'Trebuie să existe cel puțin un set.', 'warning');
            }
             validateSets(); // Re-validate after removing
        });

        // Add listeners to the new inputs for validation feedback
        setDiv.querySelectorAll('.reps-input, .weight-input').forEach(input => {
             input.addEventListener('input', validateSets);
         });

         validateSets(); // Validate after adding
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
                 // Check if either is empty or negative
                 if (!repsInput.value || repsInput.value < 0 || !weightInput.value || weightInput.value < 0) {
                     isValid = false;
                     // Optionally add invalid class to specific inputs here if needed
                 } else {
                     // Optionally remove invalid class
                 }
             });
         }
         setsWarning.classList.toggle('d-none', isValid);
         return isValid;
     }

    function getSetsData() {
        const sets = [];
        setsContainer.querySelectorAll('.set-row').forEach(row => {
            const repsInput = row.querySelector('.reps-input');
            const weightInput = row.querySelector('.weight-input');
            const reps = repsInput.value;
            const weight = weightInput.value;
            // Ensure both have valid, non-negative values before adding
            if (reps && weight && parseFloat(reps) >= 0 && parseFloat(weight) >= 0) {
                sets.push({ reps: parseInt(reps, 10), weight: parseFloat(weight) });
            }
        });
        return sets;
    }

    // --- Workout Log Rendering (Now for History Tab) ---
    function renderWorkoutLog() {
        workoutLogContainer.innerHTML = '<div class="text-center p-3"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Se încarcă jurnalul...</div>'; // Loading state
        const filteredWorkouts = filterWorkouts(); // Get filtered data

        // Use setTimeout to allow the loading indicator to render before potentially blocking JS
        setTimeout(() => {
            workoutLogContainer.innerHTML = ''; // Clear loading indicator/previous log

            if (filteredWorkouts.length === 0) {
                noDataMessage.classList.remove('d-none'); // Show the improved empty state message
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
            // Ensure consistent sorting: date desc, then ID desc (newest first if same date)
            const allWorkoutsSorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

            // Render each day group
            sortedDates.forEach(date => {
                const dayGroupDiv = document.createElement('div');
                dayGroupDiv.className = 'log-day-group mb-4 card';

                const dateHeader = document.createElement('h5');
                dateHeader.className = 'log-date-header card-header bg-opacity-10 bg-secondary text-white py-2 px-3 fs-6';
                dateHeader.textContent = formatDateForDisplay(date);
                dayGroupDiv.appendChild(dateHeader);

                const dayEntriesDiv = document.createElement('div');
                dayEntriesDiv.className = 'log-day-entries list-group list-group-flush';

                // Sort workouts within the day by ID descending (newest first)
                const workoutsForDay = groupedByDate[date].sort((a, b) => b.id.localeCompare(a.id));

                workoutsForDay.forEach(workout => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'log-exercise-entry list-group-item bg-transparent px-3 py-2';
                    entryDiv.dataset.id = workout.id; // Store ID for actions

                    const currentVolume = calculateVolume([workout]);
                    const currentE1RM = calculateMaxE1RM(workout.sets);
                    const isPR = checkForPR(workout.exercise, currentVolume, currentE1RM, workout.date);

                    // Find previous workout for comparison
                    const previousWorkout = findPreviousWorkout(workout, allWorkoutsSorted);
                    let volumeComparisonHTML = '<span class="comparison-indicator volume-comparison text-muted"><i class="bi bi-dash-lg"></i></span>';
                    let e1rmComparisonHTML = '<span class="comparison-indicator e1rm-comparison text-muted"><i class="bi bi-dash-lg"></i></span>';

                    if (previousWorkout) {
                        const previousVolume = calculateVolume([previousWorkout]);
                        const previousE1RM = calculateMaxE1RM(previousWorkout.sets);

                        volumeComparisonHTML = generateComparisonHTML(currentVolume, previousVolume, 'volume');
                        e1rmComparisonHTML = generateComparisonHTML(currentE1RM, previousE1RM, 'e1rm');
                    }

                    const setsSummaryHTML = workout.sets.map((set, index) =>
                        `<span class="badge text-bg-secondary me-1 fw-normal" title="Set ${index + 1}">${set.reps}r @ ${set.weight}kg</span>`
                    ).join(' ');

                    const notesExist = workout.notes && workout.notes.trim().length > 0;

                    entryDiv.innerHTML = `
                        <div class="d-flex w-100 justify-content-between align-items-start flex-wrap">
                            <div class="entry-main-info mb-1 me-2 flex-grow-1 ${notesExist ? 'clickable-area' : ''}" ${notesExist ? 'title="Vezi/Ascunde notițe"' : ''}> <!-- Added clickable-area class -->
                                <h6 class="mb-0 exercise-name d-inline-block">${workout.exercise}</h6>
                                ${isPR ? '<span class="pr-indicator text-warning ms-1" title="Record Personal stabilit la această dată!"><i class="bi bi-star-fill"></i></span>' : ''}
                                <small class="text-muted muscle-groups ms-2 d-block d-sm-inline">(${workout.muscleGroups.join(', ')})</small>
                            </div>
                            <div class="entry-actions text-nowrap ms-sm-auto mb-1">
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
                             ${notesExist ? '<a href="#" class="details-toggle text-decoration-none text-info" title="Vezi/Ascunde notițe">[+] Notițe</a>' : ''}
                        </div>
                        ${notesExist ? `
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
        }, 10); // Small delay for loading indicator
    }

    // Helper for comparison indicators
    function generateComparisonHTML(current, previous, type) {
        let comparisonHTML = `<span class="comparison-indicator ${type}-comparison text-muted" title="vs ${previous?.toFixed(type === 'volume' ? 0 : 1) ?? 'N/A'}"><i class="bi bi-dash-lg"></i></span>`; // Default
        if (previous === null || previous === undefined) return comparisonHTML; // No previous data

        const unit = type === 'e1rm' ? ' kg' : '';
        const precision = type === 'volume' ? 0 : 1;

        if (current > previous) {
            const diff = previous > 0 ? ((current - previous) / previous * 100).toFixed(0) : 100; // Handle division by zero
            comparisonHTML = `<span class="comparison-indicator ${type}-comparison text-success" title="vs ${previous.toFixed(precision)}${unit}"><i class="bi bi-arrow-up-short"></i> +${diff}%</span>`;
        } else if (current < previous) {
            const diff = previous > 0 ? ((previous - current) / previous * 100).toFixed(0) : 100; // Handle division by zero
            comparisonHTML = `<span class="comparison-indicator ${type}-comparison text-danger" title="vs ${previous.toFixed(precision)}${unit}"><i class="bi bi-arrow-down-short"></i> -${diff}%</span>`;
        } else if (current === previous && current > 0) {
             comparisonHTML = `<span class="comparison-indicator ${type}-comparison text-secondary" title="vs ${previous.toFixed(precision)}${unit}"><i class="bi bi-arrow-right-short"></i></span>`;
        }
        return comparisonHTML;
    }

    // Helper to find previous workout
    function findPreviousWorkout(currentWorkout, sortedWorkouts) {
        const currentIndex = sortedWorkouts.findIndex(w => w.id === currentWorkout.id);
        if (currentIndex === -1) return null;
        for (let i = currentIndex + 1; i < sortedWorkouts.length; i++) {
            if (sortedWorkouts[i].exercise === currentWorkout.exercise) {
                return sortedWorkouts[i];
            }
        }
        return null;
    }

    // Add Listeners for Log Entries (Edit/Delete/Toggle Notes)
    function addLogEntryActionListeners() {
        workoutLogContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.removeEventListener('click', handleEdit); // Prevent duplicates
            btn.addEventListener('click', handleEdit);
        });
        workoutLogContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.removeEventListener('click', handleDelete); // Prevent duplicates
            btn.addEventListener('click', handleDelete);
        });

        // Toggle notes visibility (clickable area or link)
        const toggleNoteElements = workoutLogContainer.querySelectorAll('.details-toggle, .clickable-area');
        toggleNoteElements.forEach(el => {
            el.removeEventListener('click', handleToggleNotes); // Prevent duplicates
            el.addEventListener('click', handleToggleNotes);
        });
    }

    // NEW: Handler to toggle notes visibility
    function handleToggleNotes(e) {
        e.preventDefault();
        const entryDiv = e.currentTarget.closest('.log-exercise-entry');
        if (!entryDiv) return;

        const detailsDiv = entryDiv.querySelector('.exercise-details');
        const toggleLink = entryDiv.querySelector('.details-toggle'); // Find the link specifically

        if (detailsDiv) {
            detailsDiv.classList.toggle('d-none');
            if (toggleLink) { // Update link text only if it exists
                toggleLink.textContent = detailsDiv.classList.contains('d-none') ? '[+] Notițe' : '[-] Notițe';
            }
        }
    }

    // --- Tab Navigation ---
    function showTab(tabId) {
        // Hide all tabs
        tabContents.forEach(tab => tab.classList.remove('active'));
        // Deactivate all buttons
        bottomNavButtons.forEach(btn => btn.classList.remove('active'));

        // Activate the target tab and button
        const activeTab = document.getElementById(tabId);
        const activeButton = document.querySelector(`#bottomNav button[data-target="${tabId}"]`);

        if (activeTab) activeTab.classList.add('active');
        if (activeButton) activeButton.classList.add('active');

        // Call specific functions based on the activated tab
        if (tabId === 'dashboardTabContent') {
            updateDashboard(); // Update stats, widgets, charts
        } else if (tabId === 'historyTabContent') {
            populateMuscleGroupFilter(); // Ensure filters are up-to-date
            renderWorkoutLog(); // Render the filterable log
        } else if (tabId === 'settingsTabContent') {
            renderCustomExercisesList(); // Render custom exercises
            renderBodyWeightLogList(); // Render bodyweight history
        } else if (tabId === 'logTabContent') {
            populateExerciseDropdown(); // Ensure exercise list is current
            // Optionally reset form if desired when navigating back
            // resetForm();
        }
        // Plan tab currently has static content, no specific function call needed
    }

    // --- Calculations (calculateVolume, calculateE1RM, calculateMaxE1RM remain the same) ---
    function calculateVolume(workoutArray) {
        return workoutArray.reduce((totalVol, workout) => {
            const entryVol = workout.sets.reduce((vol, set) => vol + (set.reps * set.weight), 0);
            return totalVol + entryVol;
        }, 0);
    }
    function calculateE1RM(weight, reps) {
        if (reps <= 0 || weight <= 0) return 0; // Cannot calculate for 0 reps/weight
        if (reps === 1) return weight;
        // Brzycki formula
        const denominator = 1.0278 - (0.0278 * reps);
        return denominator > 0 ? weight / denominator : 0; // Avoid division by zero or negative results
    }
    function calculateMaxE1RM(sets) {
        if (!sets || sets.length === 0) return 0;
        return Math.max(0, ...sets.map(set => calculateE1RM(set.weight, set.reps)));
    }

    // --- Update PRs (Stores date with each PR type) ---
     function updatePersonalRecords(exercise, sets, workoutDate) {
         const currentMaxWeightSet = sets.reduce((maxSet, currentSet) => {
             return currentSet.weight > (maxSet?.weight || 0) ? currentSet : maxSet;
         }, null); // Start with null
         const currentMaxWeight = currentMaxWeightSet ? currentMaxWeightSet.weight : 0;
         const currentMaxE1RM = calculateMaxE1RM(sets);
         const currentVolume = calculateVolume([{ sets }]); // Calculate volume for this entry only

         let recordUpdated = false;
         if (!personalRecords[exercise]) {
             personalRecords[exercise] = { weight: 0, volume: 0, e1rm: 0, weightDate: '', volumeDate: '', e1rmDate: '' };
         }

         const record = personalRecords[exercise];

         // Update only if strictly greater
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
             console.log(`PR updated for ${exercise} on ${workoutDate}:`, record);
             return true; // Indicate a PR was set/updated *by this specific entry*
         }
         return false;
     }

     // Check if the *current* workout entry matches the date a PR was set
     function checkForPR(exercise, volume, maxE1RM, workoutDate) {
        const record = personalRecords[exercise];
        if (!record) return false;

        // Check if this workout's date matches the date when *any* of the current PRs were achieved
        // And ensure the value actually matches (in case multiple entries on the same day had the same max)
        const maxWeightSet = record.weight > 0 && record.weightDate === workoutDate; // Need to check actual weight achieved in *this* workout if checking weight PR
        const volumeSet = record.volume > 0 && record.volumeDate === workoutDate && volume >= record.volume; // Check volume matches or exceeds
        const e1rmSet = record.e1rm > 0 && record.e1rmDate === workoutDate && maxE1RM >= record.e1rm; // Check e1RM matches or exceeds

        // For simplicity, we primarily check if the date matches. A more robust check
        // would involve comparing the exact values achieved in *this* workout entry
        // against the stored PR values if the dates match.
        return (record.volumeDate === workoutDate) || (record.e1rmDate === workoutDate) || (record.weightDate === workoutDate);
     }

    // --- Event Handlers ---

    // Workout Form Submit (Add/Edit)
    function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const isValid = workoutForm.checkValidity();
        const areSetsValid = validateSets(); // Explicitly check sets

        workoutForm.classList.add('was-validated');

        if (!isValid || !areSetsValid) {
             if (!areSetsValid) showToast('Eroare Formular', 'Verificați seturile introduse (Rep. și Kg > 0 obligatorii).', 'warning');
             else showToast('Eroare Formular', 'Vă rugăm completați câmpurile obligatorii.', 'warning');
            // Find first invalid field and focus it
            const firstInvalid = workoutForm.querySelector(':invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const workoutData = {
            id: editingId || Date.now().toString(), // Use existing ID if editing
            date: dateInput.value,
            muscleGroups: Array.from(muscleGroupsSelect.selectedOptions).map(option => option.value),
            exercise: exerciseSelect.value,
            sets: getSetsData(),
            notes: notesInput.value.trim()
        };

        let actionType = 'adăugat';
        if (editingId) {
            const index = workouts.findIndex(w => w.id === editingId);
            if (index > -1) {
                workouts[index] = workoutData;
                actionType = 'actualizat';
            } else {
                // Should not happen if editingId is set, but handle defensively
                workouts.push(workoutData);
                console.warn("Editing ID existed but workout not found, adding as new.");
            }
        } else {
            workouts.push(workoutData);
        }

        // Update PRs, passing the date
        const prSetByThisEntry = updatePersonalRecords(workoutData.exercise, workoutData.sets, workoutData.date);

        saveData(WORKOUT_STORAGE_KEY, workouts);
        showToast('Succes', `Antrenament ${actionType} cu succes!`);

        if (prSetByThisEntry && actionType === 'adăugat') { // Show PR toast only for *new* entries that set a PR
            // Use a slight delay for the second toast
            setTimeout(() => {
                showToast('Record Personal!', `Nou record stabilit pentru ${workoutData.exercise}!`, 'info');
            }, 600);
        }

        // Re-render relevant parts
        // renderWorkoutLog(); // No longer needed here, handled by showTab if on History tab
        populateMuscleGroupFilter(); // Update filter dropdown options
        populateExerciseDropdown(); // Update exercise dropdowns (form & dashboard)
        resetForm();
        // updateDashboard(); // No longer needed here, handled by showTab if on Dashboard tab

        // Optionally switch to the history tab after saving?
        // showTab('historyTabContent');
    }

    // Edit Workout Button Click
    function handleEdit(event) {
        const button = event.target.closest('button');
        const entryDiv = button.closest('.log-exercise-entry');
        const id = entryDiv.dataset.id;
        const workout = workouts.find(w => w.id === id);

        if (!workout) {
            showToast('Eroare', 'Nu s-a găsit înregistrarea pentru editare.', 'danger');
            return;
        }

        // Switch to the Log tab (form)
        showTab('logTabContent');

        // Populate form
        editingId = id;
        editIdInput.value = id;
        formTitle.textContent = 'Editează Exercițiu';
        submitBtn.textContent = 'Actualizează';
        cancelEditBtn.classList.remove('d-none');

        dateInput.value = workout.date;
        // Select muscle groups
        Array.from(muscleGroupsSelect.options).forEach(option => {
            option.selected = workout.muscleGroups.includes(option.value);
        });
        exerciseSelect.value = workout.exercise;
        notesInput.value = workout.notes;

        setsContainer.innerHTML = ''; // Clear existing set rows
        if (workout.sets && workout.sets.length > 0) {
            workout.sets.forEach(set => addSetRow(set.reps, set.weight));
        } else {
            addSetRow(); // Add one empty row if no sets exist
        }
        validateSets(); // Validate the populated sets

        // Scroll form into view
        logTabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Delete Workout Button Click
    function handleDelete(event) {
        const button = event.target.closest('button');
        const entryDiv = button.closest('.log-exercise-entry');
        const id = entryDiv.dataset.id;
        const workout = workouts.find(w => w.id === id);

        if (!workout) {
            showToast('Eroare', 'Nu s-a găsit înregistrarea pentru ștergere.', 'danger');
            return;
        }

        if (confirm(`Sunteți sigur că doriți să ștergeți înregistrarea pentru ${workout.exercise} din ${formatDateForDisplay(workout.date)}?`)) {
            workouts = workouts.filter(w => w.id !== id);
            saveData(WORKOUT_STORAGE_KEY, workouts);

            // Re-render the log view immediately
            renderWorkoutLog();
            // Update filters and potentially dashboard if data changed significantly
            populateMuscleGroupFilter();
            populateExerciseDropdown(); // Update dashboard dropdown too
            // Consider recalculating PRs if a deleted entry was the PR date?
            // For now, PRs remain until overwritten. A full recalc could be added.
            showToast('Șters', 'Înregistrarea a fost ștearsă.', 'success');
            // No need to call updateDashboard unless deletion affects stats significantly
            // updateDashboard();
        }
    }

    // Cancel Edit Button Click
    function handleCancelEdit() {
        resetForm();
    }

    // --- Filtering (History Tab) ---
    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Filter Change Handler (called directly by date/select, debounced by text input)
    function handleFilterChange() {
        renderWorkoutLog(); // Re-render the log with current filters
    }

    // Debounced handler specifically for the text input
    const debouncedFilterHandler = debounce(handleFilterChange, 350); // 350ms delay

    function handleClearFilters() {
        filterDateInput.value = '';
        filterExerciseInput.value = '';
        filterMuscleGroupSelect.value = '';
        renderWorkoutLog(); // Re-render with cleared filters
    }

    // Filter Workouts Logic (used by renderWorkoutLog)
    function filterWorkouts() {
        const dateFilter = filterDateInput.value;
        const exerciseFilter = filterExerciseInput.value.toLowerCase().trim();
        const muscleGroupFilter = filterMuscleGroupSelect.value;

        return workouts.filter(w => {
            const matchDate = !dateFilter || w.date === dateFilter;
            const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter);
            const matchMuscleGroup = !muscleGroupFilter || w.muscleGroups.includes(muscleGroupFilter);
            return matchDate && matchExercise && matchMuscleGroup;
        });
        // Sorting is handled within renderWorkoutLog
    }

    // --- Dashboard ---
    function getWorkoutsForPeriod(period) {
        const now = new Date();
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Start of day

        switch (period) {
            case 'last7days':
                startDate.setDate(now.getDate() - 6);
                break;
            case 'last30days':
                startDate.setDate(now.getDate() - 29);
                break;
            case 'allTime':
                return [...workouts]; // Return a copy
            default: // Default to last 7 days
                startDate.setDate(now.getDate() - 6);
        }
        const startDateString = startDate.toISOString().split('T')[0];
        return workouts.filter(w => w.date >= startDateString);
    }

    function updateDashboard() {
        // Show loading states? (Optional, depends on performance)
        // e.g., clear chart areas, show spinners in widgets

        const period = dashboardPeriodSelect.value;
        const periodWorkouts = getWorkoutsForPeriod(period);

        // --- 1. Calculate Summary Stats ---
        const totalEntries = periodWorkouts.length;
        const totalSets = periodWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
        const totalReps = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0);
        // Calculate avg weight only from sets with weight > 0
        const setsWithWeight = periodWorkouts.flatMap(w => w.sets).filter(s => s.weight > 0);
        const totalWeightSum = setsWithWeight.reduce((sum, set) => sum + set.weight, 0);
        const avgWeight = setsWithWeight.length > 0 ? (totalWeightSum / setsWithWeight.length) : 0;
        const totalVolume = calculateVolume(periodWorkouts);

        statsExercises.textContent = totalEntries;
        statsSets.textContent = totalSets;
        statsReps.textContent = totalReps;
        statsAvgWeight.textContent = avgWeight.toFixed(1) + ' kg';
        statsTotalVolume.textContent = (totalVolume / 1000).toFixed(1) + ' T'; // Use 1 decimal for Tons

        // --- 2. Calculate Weekly Averages ---
        let daysInPeriod = 7;
        if (period === 'last30days') daysInPeriod = 30;
        else if (period === 'allTime') {
            if (workouts.length > 0) {
                // Ensure workouts are sorted by date to find min/max correctly
                const sortedByDate = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
                const minDate = new Date(sortedByDate[0].date);
                const maxDate = new Date(sortedByDate[sortedByDate.length - 1].date);
                // Calculate difference in days + 1
                daysInPeriod = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
            } else {
                daysInPeriod = 1; // Avoid division by zero if no workouts
            }
        }
        const weeksInPeriod = Math.max(1, daysInPeriod / 7);
        const uniqueWorkoutDays = new Set(periodWorkouts.map(w => w.date)).size;

        weeklyAvgWorkouts.textContent = (uniqueWorkoutDays / weeksInPeriod).toFixed(1);
        weeklyAvgSets.textContent = (totalSets / weeksInPeriod).toFixed(1);
        weeklyAvgReps.textContent = (totalReps / weeksInPeriod).toFixed(1);
        weeklyAvgRepsPerSet.textContent = totalSets > 0 ? (totalReps / totalSets).toFixed(1) : '0';
        weeklyAvgVolume.textContent = ((totalVolume / 1000) / weeksInPeriod).toFixed(2) + ' T';

        // --- 3. Render Historical Personal Records (Top 5) ---
        renderPersonalRecords(); // This is on the dashboard

        // --- 4. Render Charts ---
        renderMuscleGroupsChart(periodWorkouts);
        renderVolumeChartDash(periodWorkouts);
        handleProgressExerciseChangeDash(); // Render progress chart based on selection

        // --- 5. Render Widgets ---
        renderFocusWidget(); // Placeholder or simple logic
        renderPrZoneWidget(); // Recent PRs
        renderRecentSessionsWidget(); // Last 5 workout days
        renderWeightProgressChart(); // NEW: Uses bodyWeightLog
        renderConsistencyHeatmap(); // Uses all workouts
    }

    // Render Historical PRs (on Dashboard)
    function renderPersonalRecords() {
        personalRecordsList.innerHTML = '';
        const sortedRecords = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => record.e1rm > 0 || record.weight > 0 || record.volume > 0) // Filter out empty records
            .sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0)); // Sort by e1RM descending

        noPrMessage.classList.toggle('d-none', sortedRecords.length > 0);

        const topRecords = sortedRecords.slice(0, 5); // Show top 5 historical

        topRecords.forEach(record => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'py-1', 'px-2'); // Smaller padding
            li.innerHTML = `
                <span class="pr-exercise small me-2">${record.exercise}</span>
                <div class="text-end small">
                    ${record.e1rm > 0 ? `<span class="badge bg-primary rounded-pill me-1 mb-1" title="Estimat 1 Rep Max (${formatDateForDisplay(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)} <span class="pr-type">kg</span></span>` : ''}
                    ${record.weight > 0 ? `<span class="badge bg-success rounded-pill me-1 mb-1" title="Greutate maximă (${formatDateForDisplay(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)} <span class="pr-type">kg</span></span>` : ''}
                    ${record.volume > 0 ? `<span class="badge bg-warning text-dark rounded-pill mb-1" title="Volum maxim (${formatDateForDisplay(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(0)} <span class="pr-type">vol</span></span>` : ''}
                </div>
            `;
            personalRecordsList.appendChild(li);
        });
         if (sortedRecords.length === 0) {
             personalRecordsList.innerHTML = '<li class="list-group-item text-muted small text-center" id="noPrMessage">Nu există recorduri înregistrate.</li>';
         }
    }

    // --- Dashboard Chart Rendering ---
     function renderMuscleGroupsChart(data) {
         const svg = d3.select("#d3MusclesChart");
         svg.selectAll("*").remove(); // Clear previous chart

         const muscleCounts = data.reduce((acc, workout) => {
             workout.muscleGroups.forEach(group => { acc[group] = (acc[group] || 0) + 1; });
             return acc;
         }, {});
         const sortedMuscles = Object.entries(muscleCounts).sort(([, a], [, b]) => b - a).slice(0, 10); // Top 10

         noMuscleDataMessage.classList.toggle('d-none', sortedMuscles.length > 0);
         d3MusclesChartContainer.style.display = 'block'; // Ensure container is visible
         svg.style('display', sortedMuscles.length > 0 ? 'block' : 'none'); // Hide SVG if no data

         if (sortedMuscles.length === 0) return;

         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 20, bottom: 70, left: 40 }; // Increased bottom margin for rotated labels
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleBand()
             .range([0, chartWidth])
             .padding(0.2)
             .domain(sortedMuscles.map(d => d[0]));

         const y = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(sortedMuscles, d => d[1]) || 1]) // Ensure domain starts at 0
             .nice(); // Adjust domain to nice round values

         // X Axis
         g.append("g")
             .attr("transform", `translate(0,${chartHeight})`)
             .call(d3.axisBottom(x))
             .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("dx", "-.8em")
                 .attr("dy", ".15em")
                 .attr("transform", "rotate(-45)");

         // Y Axis
         g.append("g")
             .call(d3.axisLeft(y).ticks(Math.min(5, d3.max(sortedMuscles, d => d[1]) || 1)).tickFormat(d3.format("d"))) // Max 5 ticks, integer format
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "var(--htb-text-secondary)") // Use CSS variable
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", "-3.0em") // Adjust position
                 .attr("text-anchor", "end")
                 .text("Nr. Sesiuni");

         // Bars
         g.selectAll(".muscle-bar")
             .data(sortedMuscles)
             .enter().append("rect")
                 .attr("class", "muscle-bar") // Use class for styling in CSS
                 .attr("x", d => x(d[0]))
                 .attr("y", d => y(d[1]))
                 .attr("width", x.bandwidth())
                 .attr("height", d => chartHeight - y(d[1]))
             .append("title") // Simple tooltip
                 .text(d => `${d[0]}: ${d[1]} sesiuni`);

         // Bar Labels (Optional, can get cluttered)
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

         if (data.length === 0) {
             svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Nu există date de volum pentru perioada selectată.");
             return;
         }

         // Aggregate volume per date
         const volumeByDate = d3.rollup(data,
             v => d3.sum(v, d => calculateVolume([d])), // Sum volume for all entries on that date
             d => d.date // Group by date string
         );

         const aggregatedData = Array.from(volumeByDate, ([date, volume]) => ({
             date: d3.timeParse("%Y-%m-%d")(date), // Parse date string into Date object
             volume
         })).sort((a, b) => a.date - b.date); // Sort by date ascending

         if (aggregatedData.length === 0 || aggregatedData.every(d => !d.date)) {
              svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Eroare la procesarea datelor de volum.");
              console.error("Failed to parse dates for volume chart:", volumeByDate);
              return;
         }

         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 40, bottom: 50, left: 50 };
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         const x = d3.scaleTime()
             .range([0, chartWidth])
             .domain(d3.extent(aggregatedData, d => d.date)); // Use min/max date from aggregated data

         const y = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(aggregatedData, d => d.volume) || 100]) // Domain from 0 to max volume
             .nice();

         // X Axis
         g.append("g")
             .attr("transform", `translate(0,${chartHeight})`)
             .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b"))) // Format date ticks
             .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("transform", "rotate(-30)");

         // Y Axis
         g.append("g")
             .call(d3.axisLeft(y).ticks(5)) // Max 5 ticks
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "var(--htb-text-secondary)")
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", "-3.5em")
                 .attr("text-anchor", "end")
                 .text("Volum Total (kg)");

         // Line generator
         const line = d3.line()
             .x(d => x(d.date))
             .y(d => y(d.volume))
             .curve(d3.curveMonotoneX); // Smooth curve

         // Draw line
         g.append("path")
             .datum(aggregatedData)
             .attr("fill", "none")
             .attr("stroke", "var(--htb-accent)") // Use CSS variable
             .attr("stroke-width", 2)
             .attr("d", line);

         // Draw dots
         g.selectAll(".volume-dot")
             .data(aggregatedData)
             .enter().append("circle")
                 .attr("class", "volume-dot") // Style in CSS if needed
                 .attr("cx", d => x(d.date))
                 .attr("cy", d => y(d.volume))
                 .attr("r", 3)
                 .attr("fill", "var(--htb-accent)")
             .append("title")
                 .text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}: ${d.volume.toFixed(1)} kg`);
     }

     function handleProgressExerciseChangeDash() {
         const selectedExercise = progressExerciseSelectDash.value;
         const svg = d3.select("#d3ProgressChartDash");
         svg.selectAll("*").remove(); // Clear previous chart

         if (!selectedExercise) {
             svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Selectați un exercițiu.");
             return;
         }

         // Filter ALL workouts for the selected exercise, sort by date
         const exerciseData = workouts
             .filter(w => w.exercise === selectedExercise)
             .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date string ascending

         if (exerciseData.length === 0) {
              svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Nu există date pentru acest exercițiu.");
              return;
         }

         // Calculate max e1RM and max weight lifted for each workout entry
         const progressData = exerciseData.map(workout => ({
             date: d3.timeParse("%Y-%m-%d")(workout.date),
             maxE1RM: calculateMaxE1RM(workout.sets),
             maxWeight: Math.max(0, ...workout.sets.map(s => s.weight)) // Max weight lifted in any set
         })).filter(d => d.date); // Filter out any entries where date parsing failed

          if (progressData.length === 0) {
              svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Eroare la procesarea datelor de progres.");
              return;
         }


         const { width, height } = svg.node().getBoundingClientRect();
         const margin = { top: 20, right: 50, bottom: 50, left: 50 }; // Margins for axes
         const chartWidth = width - margin.left - margin.right;
         const chartHeight = height - margin.top - margin.bottom;

         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

         // Scales
         const x = d3.scaleTime()
             .range([0, chartWidth])
             .domain(d3.extent(progressData, d => d.date));

         const yMaxWeight = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(progressData, d => d.maxWeight) || 1]) // Domain from 0
             .nice();

         const yMaxE1RM = d3.scaleLinear()
             .range([chartHeight, 0])
             .domain([0, d3.max(progressData, d => d.maxE1RM) || 1]) // Domain from 0
             .nice();

         // Axes
         g.append("g") // X Axis
             .attr("transform", `translate(0,${chartHeight})`)
             .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b")))
             .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("transform", "rotate(-30)");

         g.append("g") // Y Axis Left (Max Weight)
             .call(d3.axisLeft(yMaxWeight).ticks(5))
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "var(--htb-tag-red)") // Color for weight
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", "-3.5em")
                 .attr("text-anchor", "end")
                 .text("Greutate Max (kg)");

         g.append("g") // Y Axis Right (e1RM)
             .attr("transform", `translate(${chartWidth}, 0)`)
             .call(d3.axisRight(yMaxE1RM).ticks(5))
             .append("text")
                 .attr("class", "axis-label")
                 .attr("fill", "var(--htb-accent)") // Color for e1RM
                 .attr("transform", "rotate(-90)")
                 .attr("y", -6) // Position relative to axis
                 .attr("dy", "3.0em") // Adjust vertical position
                 .attr("text-anchor", "end")
                 .text("e1RM Estimat (kg)");

         // Line generator for e1RM
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
                 .attr("class", "dot-weight") // Style in CSS
                 .attr("cx", d => x(d.date))
                 .attr("cy", d => yMaxWeight(d.maxWeight))
                 .attr("r", 4) // Slightly larger dots
             .append("title") // Tooltip
                 .text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}:\nGreutate Max: ${d.maxWeight.toFixed(1)} kg\ne1RM Est: ${d.maxE1RM.toFixed(1)} kg`);

         // Legend (Simple version)
         const legend = svg.append("g")
             .attr("transform", `translate(${margin.left}, ${margin.top - 15})`) // Position above chart
             .attr("class", "chart-legend");

         legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).style("fill", "var(--htb-tag-red)");
         legend.append("text").attr("x", 10).attr("y", 0).text("Greutate Max").style("font-size", "10px").attr("alignment-baseline","middle").attr("fill", "var(--htb-text-secondary)");

         legend.append("line").attr("x1", 100).attr("y1", 0).attr("x2", 120).attr("y2", 0).attr("stroke", "var(--htb-accent)").attr("stroke-width", 2);
         legend.append("text").attr("x", 130).attr("y", 0).text("e1RM Est.").style("font-size", "10px").attr("alignment-baseline","middle").attr("fill", "var(--htb-text-secondary)");
     }

    // --- Dashboard Widget Rendering Functions ---

    function renderFocusWidget() {
        // Placeholder: Implement dynamic logic later
        // Could show next planned workout, suggest rest, etc.
        if (focusWidgetContent) {
             // Keep existing placeholder HTML or update dynamically
             // Example: focusWidgetContent.querySelector('.focus-text').textContent = "Zi de Odihnă / Recuperare Activă";
        }
    }

    function renderPrZoneWidget() {
        newPrZoneList.innerHTML = ''; // Clear list
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const recentPRs = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => // Check if *any* PR date is within the last 30 days
                (record.e1rmDate && record.e1rmDate >= thirtyDaysAgoStr) ||
                (record.weightDate && record.weightDate >= thirtyDaysAgoStr) ||
                (record.volumeDate && record.volumeDate >= thirtyDaysAgoStr)
            )
            .sort((a, b) => { // Sort by the *most recent* date among the three PR types
                const latestDateA = Math.max(
                    new Date(a.e1rmDate || 0).getTime(),
                    new Date(a.weightDate || 0).getTime(),
                    new Date(a.volumeDate || 0).getTime()
                );
                const latestDateB = Math.max(
                    new Date(b.e1rmDate || 0).getTime(),
                    new Date(b.weightDate || 0).getTime(),
                    new Date(b.volumeDate || 0).getTime()
                );
                return latestDateB - latestDateA; // Descending order (most recent first)
            });

        noNewPrMessage.classList.toggle('d-none', recentPRs.length > 0);

        if (recentPRs.length === 0) {
            // Handled by toggling noNewPrMessage
            return;
        }

        recentPRs.slice(0, 5).forEach(record => { // Show top 5 most recent PRs
            const li = document.createElement('div');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'py-1', 'px-2');
            // Only show badges for the PR types that were actually set *within* the last 30 days
            li.innerHTML = `
                <span class="pr-exercise small me-2">${record.exercise}</span>
                <div class="text-end small">
                    ${(record.e1rm > 0 && record.e1rmDate >= thirtyDaysAgoStr) ? `<span class="badge bg-primary rounded-pill me-1 mb-1" title="e1RM (${formatDateForDisplay(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)}kg</span>` : ''}
                    ${(record.weight > 0 && record.weightDate >= thirtyDaysAgoStr) ? `<span class="badge bg-success rounded-pill me-1 mb-1" title="Greutate (${formatDateForDisplay(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)}kg</span>` : ''}
                    ${(record.volume > 0 && record.volumeDate >= thirtyDaysAgoStr) ? `<span class="badge bg-warning text-dark rounded-pill mb-1" title="Volum (${formatDateForDisplay(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(0)}</span>` : ''}
                </div>
            `;
            newPrZoneList.appendChild(li);
        });
    }

    function renderRecentSessionsWidget() {
        recentSessionsList.innerHTML = ''; // Clear list

        // Group workouts by date and get unique dates, sorted descending
        const uniqueDates = [...new Set(workouts.map(w => w.date))].sort((a, b) => b.localeCompare(a));

        noRecentSessionsMessage.classList.toggle('d-none', uniqueDates.length > 0);

        if (uniqueDates.length === 0) {
            // Handled by toggling noRecentSessionsMessage
            return;
        }

        const recentDates = uniqueDates.slice(0, 5); // Show last 5 workout days

        recentDates.forEach(date => {
            const workoutsOnDate = workouts.filter(w => w.date === date);
            // Show first 3 exercises + "..." if more
            const exercisesString = workoutsOnDate.map(w => w.exercise).slice(0, 3).join(', ') + (workoutsOnDate.length > 3 ? '...' : '');
            const totalSets = workoutsOnDate.reduce((sum, w) => sum + w.sets.length, 0);

            const li = document.createElement('li');
            // Make the list item clickable? Could link to History tab filtered by date.
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1', 'px-2');
            li.innerHTML = `
                <div class="small">
                    <strong class="d-block">${formatDateForDisplay(date)}</strong>
                    <span class="text-muted">${exercisesString || 'N/A'}</span>
                </div>
                <span class="badge bg-secondary rounded-pill">${totalSets} seturi</span>
            `;
            // Add click listener to filter history tab (optional enhancement)
            // li.addEventListener('click', () => { /* showTab('historyTabContent'); filterDateInput.value = date; renderWorkoutLog(); */ });
            recentSessionsList.appendChild(li);
        });
    }

    // NEW: Render Body Weight Chart
    function renderWeightProgressChart() {
        const svg = d3.select(weightProgressChartContainer).select("svg"); // Select existing or create if needed
        svg.selectAll("*").remove(); // Clear previous render

        // Use the bodyWeightLog state
        const weightData = [...bodyWeightLog] // Create a copy
            .map(d => ({ ...d, date: d3.timeParse("%Y-%m-%d")(d.date) })) // Parse date string
            .filter(d => d.date && d.weight > 0) // Ensure date is valid and weight > 0
            .sort((a, b) => a.date - b.date); // Sort by date ascending

        if (weightData.length < 2) {
            // Display message directly in the container
            weightProgressChartContainer.innerHTML = `<div class="d-flex align-items-center justify-content-center h-100"><p class="text-center text-muted small">Nu există suficiente date (${weightData.length}) pentru grafic.<br>Adaugă greutatea în Setări.</p></div>`;
            return;
        }

        // Ensure SVG exists if cleared previously
        if (d3.select(weightProgressChartContainer).select("svg").empty()) {
             d3.select(weightProgressChartContainer).append("svg")
                .attr("width", "100%")
                .attr("height", "255"); // Match height from HTML structure
        }
        const chartSvg = d3.select(weightProgressChartContainer).select("svg");


        const { width, height } = chartSvg.node().getBoundingClientRect();
        const margin = { top: 20, right: 40, bottom: 50, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = chartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleTime()
            .range([0, chartWidth])
            .domain(d3.extent(weightData, d => d.date));

        const y = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([d3.min(weightData, d => d.weight) * 0.95, d3.max(weightData, d => d.weight) * 1.05]) // Pad domain slightly
            .nice();

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b")))
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-30)");

        g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
                .attr("class", "axis-label")
                .attr("fill", "var(--htb-text-secondary)")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-3.5em")
                .attr("text-anchor", "end")
                .text("Greutate (kg)");

        // Line generator
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.weight))
            .curve(d3.curveMonotoneX);

        // Draw line
        g.append("path")
            .datum(weightData)
            .attr("fill", "none")
            .attr("stroke", "var(--htb-tag-blue)") // Use a different color (e.g., blue)
            .attr("stroke-width", 2)
            .attr("d", line);

        // Draw dots
        g.selectAll(".weight-dot")
            .data(weightData)
            .enter().append("circle")
                .attr("class", "weight-dot")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.weight))
                .attr("r", 3)
                .attr("fill", "var(--htb-tag-blue)")
            .append("title")
                .text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}: ${d.weight.toFixed(1)} kg`);
    }

    // Render Consistency Heatmap with Intensity
    function renderConsistencyHeatmap() {
        const svg = d3.select(consistencyHeatmapContainer);
        svg.selectAll("*").remove(); // Clear placeholder/previous render

        // --- Configuration ---
        const numberOfWeeks = 4; // Show last 4 weeks
        const cellSize = 12;
        const cellSpacing = 2;
        const intensityLevels = 5; // 0 = rest, 1-4 = workout intensity

        // --- Data Prep ---
        // Calculate daily volume/sets from ALL workouts
        const workoutStatsByDate = workouts.reduce((acc, w) => {
            const date = w.date;
            if (!acc[date]) acc[date] = { sets: 0, volume: 0, count: 0 };
            acc[date].sets += w.sets.length;
            acc[date].volume += calculateVolume([w]);
            acc[date].count += 1; // Count exercises logged that day
            return acc;
        }, {});

        // Determine intensity thresholds (example: based on number of sets)
        // More sophisticated: use volume percentile or average comparison
        const getIntensityLevel = (dateString) => {
            const stats = workoutStatsByDate[dateString];
            if (!stats) return 0; // No workout
            if (stats.sets >= 20) return 4; // Very high
            if (stats.sets >= 12) return 3; // High
            if (stats.sets >= 6) return 2;  // Medium
            return 1; // Low / Light workout
        };

        // Calculate date range (last N weeks ending today)
        const today = d3.timeDay.floor(new Date()); // Today at 00:00
        const endDate = d3.timeDay.offset(today, 1); // End date is tomorrow (exclusive)
        // Start date is Sunday of the week N-1 weeks ago
        const startDate = d3.timeSunday.offset(today, -(numberOfWeeks - 1));
        const allDays = d3.timeDays(startDate, endDate); // Array of Date objects

        // --- D3 Setup ---
        const tooltip = d3.select(heatmapTooltip);

        const weekCount = d3.timeWeek.count(startDate, endDate); // Number of weeks to display
        const svgHeight = weekCount * (cellSize + cellSpacing);
        // Width based on 7 days
        const svgWidth = 7 * (cellSize + cellSpacing);

        svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
           .attr('width', '100%') // Let container control width
           .attr('max-width', `${svgWidth}px`) // Max width based on calculation
           .attr('height', svgHeight)
           .attr('preserveAspectRatio', 'xMidYMin meet'); // Maintain aspect ratio

        // --- Draw Rectangles ---
        svg.selectAll('.heatmap-day')
            .data(allDays)
            .enter()
            .append('rect')
            .attr('class', d => {
                const dateString = d3.timeFormat("%Y-%m-%d")(d);
                const intensity = getIntensityLevel(dateString);
                return `heatmap-day heatmap-day-level-${intensity}`; // Class based on intensity
            })
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('rx', 3).attr('ry', 3) // Rounded corners
            // Position: x based on day of week (Sun=0), y based on week number
            .attr('x', d => d3.timeFormat('%w')(d) * (cellSize + cellSpacing)) // %w: Sunday as 0
            .attr('y', d => d3.timeWeek.count(startDate, d) * (cellSize + cellSpacing))
            .attr('data-date', d => d3.timeFormat("%Y-%m-%d")(d)) // Store date for tooltip
            .on('mouseover', (event, d) => {
                const rect = event.currentTarget;
                const dateString = rect.getAttribute('data-date');
                const stats = workoutStatsByDate[dateString];
                const dateFormatted = formatDateForDisplay(dateString);
                let tooltipText = `${dateFormatted}: `;
                if (stats) {
                    tooltipText += `Antrenament (${stats.sets} seturi, ${stats.volume.toFixed(0)} vol)`;
                } else {
                    tooltipText += 'Pauză';
                }

                tooltip.style('opacity', 1)
                       .html(tooltipText);
                // Position tooltip near cursor
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


    // --- Settings ---
    function renderCustomExercisesList() {
        existingExercisesListSettings.innerHTML = '';
        if (customExercises.length === 0) {
            existingExercisesListSettings.innerHTML = '<li class="list-group-item text-muted">Nu ai adăugat exerciții custom.</li>';
            return;
        }
        // Sort custom exercises alphabetically for display
        [...customExercises].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' })).forEach(ex => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.textContent = ex;
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'py-0', 'px-1'); // Smaller padding
            deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
            deleteBtn.title = 'Șterge Exercițiu Custom';
            deleteBtn.dataset.exercise = ex; // Store exercise name for deletion handler
            // deleteBtn.onclick = () => handleDeleteCustomExercise(ex); // Pass name directly
            li.appendChild(deleteBtn);
            existingExercisesListSettings.appendChild(li);
        });
        // Add delegated event listener for delete buttons
        existingExercisesListSettings.removeEventListener('click', handleDeleteCustomExerciseClick); // Remove previous if any
        existingExercisesListSettings.addEventListener('click', handleDeleteCustomExerciseClick);
    }

    // Handler for clicks within the custom exercise list (delegated)
    function handleDeleteCustomExerciseClick(event) {
        if (event.target.closest('.btn-outline-danger')) {
            const button = event.target.closest('button');
            const exerciseToDelete = button.dataset.exercise;
            if (exerciseToDelete) {
                handleDeleteCustomExercise(exerciseToDelete);
            }
        }
    }

    function handleAddCustomExercise() {
        const newExercise = newExerciseNameSettings.value.trim();
        if (!newExercise) {
             showToast('Atenție', 'Introduceți un nume valid pentru exercițiu.', 'warning');
             return;
        }

        // Check against both predefined and existing custom exercises (case-insensitive)
        const allExercisesLower = [...predefinedExercises, ...customExercises].map(e => e.toLowerCase());
        if (allExercisesLower.includes(newExercise.toLowerCase())) {
             showToast('Eroare', 'Acest exercițiu există deja.', 'warning');
             return;
        }

        customExercises.push(newExercise);
        // No need to sort here, sorting happens in render function
        saveData(EXERCISE_STORAGE_KEY, customExercises);
        renderCustomExercisesList(); // Re-render the list
        populateExerciseDropdown(); // Update dropdowns
        newExerciseNameSettings.value = ''; // Clear input
        showToast('Succes', `Exercițiul "${newExercise}" a fost adăugat.`, 'success');
    }

    function handleDeleteCustomExercise(exerciseToDelete) {
        const isUsed = workouts.some(workout => workout.exercise === exerciseToDelete);
        let proceed = true;

        if (isUsed) {
             proceed = confirm(`Atenție! Exercițiul "${exerciseToDelete}" este folosit în ${workouts.filter(w => w.exercise === exerciseToDelete).length} înregistrări din jurnal. Ștergerea lui NU va șterge aceste înregistrări.\n\nContinuați cu ștergerea exercițiului din lista custom?`);
         } else {
             proceed = confirm(`Sunteți sigur că doriți să ștergeți exercițiul custom "${exerciseToDelete}"?`);
         }

        if (proceed) {
            const index = customExercises.findIndex(ex => ex === exerciseToDelete);
            if (index > -1) {
                customExercises.splice(index, 1);
                saveData(EXERCISE_STORAGE_KEY, customExercises);
                renderCustomExercisesList(); // Re-render the list
                populateExerciseDropdown(); // Update dropdowns
                showToast('Succes', `Exercițiul "${exerciseToDelete}" a fost șters din lista custom.`, 'success');
            } else {
                 showToast('Eroare', `Exercițiul "${exerciseToDelete}" nu a fost găsit în lista custom.`, 'danger');
            }
        }
    }

    // --- Bodyweight Logging (Settings Tab) ---
    function renderBodyWeightLogList() {
        bodyweightLogList.innerHTML = ''; // Clear previous list
        if (bodyWeightLog.length === 0) {
            bodyweightLogList.innerHTML = '<li class="list-group-item text-muted">Nu există înregistrări de greutate.</li>';
            return;
        }

        // Sort by date descending for display
        const sortedLog = [...bodyWeightLog].sort((a, b) => b.date.localeCompare(a.date));

        sortedLog.slice(0, 10).forEach(entry => { // Show last 10 entries
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1', 'px-2'); // Compact list item
            li.innerHTML = `
                <span>${formatDateForDisplay(entry.date)}: <strong>${entry.weight.toFixed(1)} kg</strong></span>
                <button class="btn btn-sm btn-outline-danger py-0 px-1 delete-bw-btn" data-id="${entry.id}" title="Șterge Înregistrare Greutate">
                    <i class="bi bi-x-lg"></i>
                </button>
            `;
            bodyweightLogList.appendChild(li);
        });

        // Add delegated listener for delete buttons
        bodyweightLogList.removeEventListener('click', handleDeleteBodyweightClick); // Remove previous
        bodyweightLogList.addEventListener('click', handleDeleteBodyweightClick);
    }

     // Delegated click handler for bodyweight delete buttons
     function handleDeleteBodyweightClick(event) {
         if (event.target.closest('.delete-bw-btn')) {
             const button = event.target.closest('button');
             const entryId = button.dataset.id;
             if (entryId) {
                 handleDeleteBodyweight(entryId);
             }
         }
     }

    function handleBodyweightSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!bodyweightForm.checkValidity()) {
            bodyweightForm.classList.add('was-validated');
            showToast('Eroare Formular', 'Introduceți o dată și o greutate valide.', 'warning');
            return;
        }
        bodyweightForm.classList.remove('was-validated'); // Reset validation state

        const newEntry = {
            id: Date.now().toString(), // Simple unique ID
            date: bodyweightDateInput.value,
            weight: parseFloat(bodyweightValueInput.value)
        };

        // Add or update entry for the same date? For simplicity, just add.
        // Could add logic here to find if an entry for `newEntry.date` exists and update it instead.
        bodyWeightLog.push(newEntry);
        // Sort log by date after adding (important for chart)
        bodyWeightLog.sort((a, b) => a.date.localeCompare(b.date));

        saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog);
        showToast('Succes', 'Greutate corporală salvată.', 'success');

        renderBodyWeightLogList(); // Update the list in settings
        // Reset form fields
        bodyweightValueInput.value = '';
        // Optionally set date to tomorrow or keep it? Keep it for now.
        // setDefaultBodyweightDate(); // Reset to today?

        updateDashboard(); // Update the dashboard chart
    }

    function handleDeleteBodyweight(entryId) {
        const entryToDelete = bodyWeightLog.find(entry => entry.id === entryId);
        if (!entryToDelete) return;

        if (confirm(`Sunteți sigur că doriți să ștergeți înregistrarea de greutate (${entryToDelete.weight.toFixed(1)} kg) din ${formatDateForDisplay(entryToDelete.date)}?`)) {
            bodyWeightLog = bodyWeightLog.filter(entry => entry.id !== entryId);
            saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog);
            showToast('Șters', 'Înregistrarea de greutate a fost ștearsă.', 'success');
            renderBodyWeightLogList(); // Update list in settings
            updateDashboard(); // Update dashboard chart
        }
    }


    // --- Data Management (Backup/Restore/Export) ---
    function handleBackupData() {
        // Include all relevant data
        const allData = {
            workouts,
            customExercises,
            personalRecords,
            bodyWeightLog // Include bodyweight log
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
        showToast('Backup Complet', 'Backup-ul datelor a fost descărcat.', 'info');
    }

    function handleRestoreData(event) {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith('.json')) {
            showToast('Eroare Fișier', 'Selectați un fișier .json valid pentru restaurare.', 'warning');
            restoreFileSettings.value = ''; // Reset file input
            return;
         }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const restoredData = JSON.parse(e.target.result);
                // Basic validation of the restored data structure
                if (restoredData && typeof restoredData === 'object' &&
                    Array.isArray(restoredData.workouts) &&
                    Array.isArray(restoredData.customExercises) &&
                    typeof restoredData.personalRecords === 'object' &&
                    (restoredData.bodyWeightLog === undefined || Array.isArray(restoredData.bodyWeightLog)) // Bodyweight is optional or array
                   )
                {
                    if (confirm('ATENȚIE: Datele curente vor fi suprascrise cu cele din fișierul de backup. Continuați?')) {
                        // Assign restored data to state variables
                        workouts = restoredData.workouts;
                        customExercises = restoredData.customExercises;
                        personalRecords = restoredData.personalRecords;
                        bodyWeightLog = restoredData.bodyWeightLog || []; // Restore bodyweight or default to empty array

                        // Save restored data to localStorage
                        saveData(WORKOUT_STORAGE_KEY, workouts);
                        saveData(EXERCISE_STORAGE_KEY, customExercises);
                        saveData(PR_STORAGE_KEY, personalRecords);
                        saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog);

                        // Re-initialize the app completely to reflect restored data
                        initializeApp(); // This will re-render everything based on new data

                        showToast('Restaurare Completă', 'Datele au fost restaurate cu succes din backup.', 'success');
                        showTab('dashboardTabContent'); // Go to dashboard after restore
                    } else {
                        showToast('Anulat', 'Restaurarea a fost anulată.', 'info');
                    }
                } else {
                    throw new Error("Structura fișierului JSON de backup este invalidă sau incompletă.");
                }
            } catch (err) {
                console.error("Error parsing or validating restore file:", err);
                showToast('Eroare Restaurare', `Nu s-a putut restaura datele: ${err.message}`, 'danger');
            } finally {
                restoreFileSettings.value = ''; // Reset file input regardless of outcome
            }
        };
        reader.onerror = () => {
            showToast('Eroare Citire Fișier', 'Nu s-a putut citi fișierul de backup selectat.', 'danger');
            restoreFileSettings.value = '';
        };
        reader.readAsText(file);
    }

    // Export functions (CSV, TXT, PDF) remain largely the same, ensure they use sorted data if needed.
    function handleExportCSV() {
         if (workouts.length === 0) { showToast('Info', 'Nu există antrenamente de exportat.', 'info'); return; }
         const headers = ["Data", "Exercitiu", "Grupe Musculare", "Set", "Repetari", "Greutate (kg)", "Note"];
         let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
         // Sort workouts by date, then potentially by exercise or ID for consistent export
         const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date) || a.exercise.localeCompare(b.exercise));
         sortedWorkouts.forEach(workout => {
             workout.sets.forEach((set, index) => {
                 const row = [
                     formatDateForDisplay(workout.date), // Use display format for CSV
                     `"${workout.exercise.replace(/"/g, '""')}"`, // Escape quotes
                     `"${workout.muscleGroups.join(', ')}"` ,
                     index + 1,
                     set.reps,
                     set.weight,
                     // Add notes only to the first set row for that exercise entry
                     index === 0 ? `"${workout.notes ? workout.notes.replace(/"/g, '""') : ''}"` : '""'
                 ];
                 csvContent += row.join(",") + "\n";
             });
         });
         const encodedUri = encodeURI(csvContent);
         const link = document.createElement("a");
         link.setAttribute("href", encodedUri);
         link.setAttribute("download", `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
         document.body.appendChild(link); link.click(); document.body.removeChild(link);
         showToast('Export CSV', 'Jurnalul a fost exportat în format CSV.', 'success');
    }

    function handleExportTXT() {
         if (workouts.length === 0) { showToast('Info', 'Nu există antrenamente de exportat.', 'info'); return; }
         let txtContent = "Jurnal Antrenamente - Gym Log Pro\n=================================\n\n";
         // Group by date for structured export
         const groupedByDate = workouts.reduce((acc, workout) => {
             const dateKey = workout.date; // Use YYYY-MM-DD for sorting key
             if (!acc[dateKey]) acc[dateKey] = [];
             acc[dateKey].push(workout); return acc;
         }, {});
         // Sort dates chronologically
         const sortedDates = Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b));

         sortedDates.forEach(dateKey => {
             txtContent += `Data: ${formatDateForDisplay(dateKey)}\n-----------------\n`;
             // Sort workouts within the day (e.g., by ID or keep logged order)
             const workoutsForDay = groupedByDate[dateKey]; //.sort((a,b) => a.id.localeCompare(b.id));
             workoutsForDay.forEach(workout => {
                 txtContent += `- ${workout.exercise} (${workout.muscleGroups.join(', ')})\n`;
                 workout.sets.forEach((set, index) => {
                     txtContent += `  Set ${index + 1}: ${set.reps} reps @ ${set.weight} kg\n`;
                 });
                 if (workout.notes) {
                     txtContent += `  Notițe: ${workout.notes}\n`;
                 }
                 txtContent += "\n"; // Space after each exercise entry
             });
             txtContent += "\n"; // Extra space after each day
         });

         const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.txt`;
         document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
         showToast('Export TXT', 'Jurnalul a fost exportat în format TXT.', 'success');
    }

    function handleExportPDF() {
        if (workouts.length === 0) { showToast('Info', 'Nu există antrenamente de exportat.', 'info'); return; }
        // Check if jsPDF and autoTable are loaded
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof window.jspdf.plugin.autotable === 'undefined') {
            showToast('Eroare PDF', 'Librăria jsPDF sau jsPDF-AutoTable nu a putut fi încărcată.', 'danger');
            console.error("jsPDF or AutoTable not loaded!");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const tableColumn = ["Data", "Exercițiu", "Grupe", "Seturi", "Rep. Totale", "Volum", "e1RM Max"];
        const tableRows = [];

        // Sort workouts by date for the table
        const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

        sortedWorkouts.forEach(workout => {
             const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);
             // const totalWeight = workout.sets.reduce((sum, set) => sum + set.weight, 0);
             // const avgWeight = workout.sets.length > 0 ? (totalWeight / workout.sets.length) : 0;
             const volume = calculateVolume([workout]);
             const maxE1RM = calculateMaxE1RM(workout.sets);
             const rowData = [
                 formatDateForDisplay(workout.date),
                 workout.exercise,
                 workout.muscleGroups.join(', '),
                 workout.sets.length,
                 totalReps,
                 // avgWeight.toFixed(1) + ' kg', // Avg weight might not be the most useful metric here
                 volume.toFixed(0), // Volume is often more relevant
                 maxE1RM.toFixed(1) + ' kg'
             ];
             tableRows.push(rowData);
        });

         doc.setFontSize(18);
         doc.text("Jurnal Antrenamente - Gym Log Pro", 14, 20);
         doc.setFontSize(11);
         doc.setTextColor(100); // Grey color for subtitle maybe?

         doc.autoTable({
             head: [tableColumn],
             body: tableRows,
             startY: 30, // Start table below title
             theme: 'grid', // 'striped', 'grid', 'plain'
             headStyles: { fillColor: [22, 160, 133] }, // Header color (teal)
             styles: { fontSize: 8, cellPadding: 2 }, // General styles
             columnStyles: { // Adjust column widths (total width ~190 for A4 portrait)
                 0: { cellWidth: 20 }, // Data
                 1: { cellWidth: 45 }, // Exercitiu
                 2: { cellWidth: 35 }, // Grupe
                 3: { cellWidth: 15, halign: 'center' }, // Seturi
                 4: { cellWidth: 20, halign: 'center' }, // Rep Totale
                 5: { cellWidth: 25, halign: 'right' }, // Volum
                 6: { cellWidth: 30, halign: 'right' }  // e1RM Max
             }
         });

        doc.save(`gym_log_pro_export_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Export PDF', 'Jurnalul a fost exportat în format PDF.', 'success');
    }

    // --- Utility Functions ---
    // formatDate remains the same - used internally for consistency if needed
    function formatDate(dateString) {
        if (!dateString) return new Date().toISOString().split('T')[0];
        if (dateString instanceof Date) return dateString.toISOString().split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        try { return new Date(dateString).toISOString().split('T')[0]; }
        catch (e) { return new Date().toISOString().split('T')[0]; }
    }

    // formatDateForDisplay remains the same - used for user-facing dates
    function formatDateForDisplay(dateString) {
        if (!dateString) return '-';
        try {
            // Handles both YYYY-MM-DD strings and Date objects
            const dateObj = (dateString instanceof Date) ? dateString : new Date(dateString + 'T00:00:00'); // Ensure correct date parsing
            // Use Romanian locale for formatting
            return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj);
        } catch (e) {
            console.warn("Error formatting date:", dateString, e);
            return dateString; // Fallback to original string if formatting fails
        }
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Workout Form
        workoutForm.addEventListener('submit', handleFormSubmit);
        addSetBtn.addEventListener('click', () => addSetRow()); // Use arrow function to avoid 'this' issues
        cancelEditBtn.addEventListener('click', handleCancelEdit);

        // Log History Filtering (History Tab)
        filterDateInput.addEventListener('change', handleFilterChange);
        filterExerciseInput.addEventListener('input', debouncedFilterHandler); // Use debounced handler
        filterMuscleGroupSelect.addEventListener('change', handleFilterChange);
        clearFiltersBtn.addEventListener('click', handleClearFilters);

        // Bottom Navigation
        bottomNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.target;
                showTab(targetTab);
            });
        });

        // Dashboard Controls
        dashboardPeriodSelect.addEventListener('change', updateDashboard);
        progressExerciseSelectDash.addEventListener('change', handleProgressExerciseChangeDash);

        // Settings - Custom Exercises
        addNewExerciseBtnSettings.addEventListener('click', handleAddCustomExercise);
        newExerciseNameSettings.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent potential form submission if inside one
                handleAddCustomExercise();
            }
        });
        // Note: Delete listener for custom exercises is delegated in renderCustomExercisesList

        // Settings - Bodyweight
        bodyweightForm.addEventListener('submit', handleBodyweightSubmit);
        // Note: Delete listener for bodyweight log is delegated in renderBodyWeightLogList

        // Settings - Data Management
        backupDataBtnSettings.addEventListener('click', handleBackupData);
        restoreFileSettings.addEventListener('change', handleRestoreData);
        exportCSVSettings.addEventListener('click', handleExportCSV);
        exportTXTSettings.addEventListener('click', handleExportTXT);
        exportPDFSettings.addEventListener('click', handleExportPDF);
    }

    // --- Start the application ---
    initializeApp();

}); // End DOMContentLoaded