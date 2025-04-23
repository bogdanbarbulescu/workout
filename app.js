// app.js - Gym Log Pro Logic (v4 - Pagination, Plan Buttons, Bodyweight Active)

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and State ---
    const WORKOUT_STORAGE_KEY = 'gymLogProWorkouts';
    const EXERCISE_STORAGE_KEY = 'gymLogProCustomExercises';
    const PR_STORAGE_KEY = 'gymLogProPersonalRecords';
    const BODYWEIGHT_STORAGE_KEY = 'gymLogProBodyweight';
    const HISTORY_ITEMS_PER_PAGE = 15; // Items per page for workout history

    let workouts = loadData(WORKOUT_STORAGE_KEY, []);
    let customExercises = loadData(EXERCISE_STORAGE_KEY, []);
    let personalRecords = loadData(PR_STORAGE_KEY, {});
    let bodyWeightLog = loadData(BODYWEIGHT_STORAGE_KEY, []);

    let predefinedExercises = [];
    let editingId = null;
    let filterDebounceTimer = null;
    let historyCurrentPage = 1; // State for pagination

    // --- DOM Elements ---
    // General
    const toastElement = document.getElementById('liveToast');
    const toastTitleElement = document.getElementById('toastTitle');
    const toastBodyElement = document.getElementById('toastBody');
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
    const bottomNavButtons = document.querySelectorAll('#bottomNav button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Log Tab (Form)
    const logTabContent = document.getElementById('logTabContent');
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
    // const focusWidgetContent = document.querySelector('.focus-widget-content'); // REMOVED
    const newPrZoneList = document.getElementById('newPrZoneList');
    const noNewPrMessage = document.getElementById('noNewPrMessage');
    const recentSessionsList = document.getElementById('recentSessionsList');
    const noRecentSessionsMessage = document.getElementById('noRecentSessionsMessage');
    const weightProgressChartContainer = document.getElementById('weightProgressChartContainer');
    const consistencyHeatmapContainer = document.getElementById('consistencyHeatmapContainer');
    const heatmapTooltip = document.getElementById('heatmapTooltip');
    const d3MusclesChartContainer = document.getElementById('musclesWorkedChartContainer');
    const d3MusclesChartSvg = document.getElementById('d3MusclesChart');
    const noMuscleDataMessage = document.getElementById('noMuscleDataMessage');
    const d3VolumeChartDashSvg = document.getElementById('d3VolumeChartDash');
    const d3ProgressChartDashSvg = document.getElementById('d3ProgressChartDash');
    const progressExerciseSelectDash = document.getElementById('progressExerciseSelectDash');
    const personalRecordsList = document.getElementById('personalRecordsList');
    const noPrMessage = document.getElementById('noPrMessage');

    // History Tab (Log Display)
    const historyTabContent = document.getElementById('historyTabContent');
    const workoutLogContainer = document.getElementById('workoutLogContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    const filterDateInput = document.getElementById('filterDate');
    const filterExerciseInput = document.getElementById('filterExercise');
    const filterMuscleGroupSelect = document.getElementById('filterMuscleGroup');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const paginationControlsContainer = document.getElementById('paginationControls'); // NEW

    // Plan Tab
    const planTabContent = document.getElementById('planTabContent'); // For event delegation

    // Settings Tab
    const settingsTabContent = document.getElementById('settingsTabContent');
    const newExerciseNameSettings = document.getElementById('newExerciseNameSettings');
    const addNewExerciseBtnSettings = document.getElementById('addNewExerciseBtnSettings');
    const existingExercisesListSettings = document.getElementById('existingExercisesListSettings');
    const bodyweightForm = document.getElementById('bodyweightForm');
    const bodyweightDateInput = document.getElementById('bodyweightDate');
    const bodyweightValueInput = document.getElementById('bodyweightValue');
    const saveBodyweightBtn = document.getElementById('saveBodyweightBtn');
    const bodyweightLogList = document.getElementById('bodyweightLogList');
    const backupDataBtnSettings = document.getElementById('backupDataBtnSettings');
    const restoreFileSettings = document.getElementById('restoreFileSettings');
    const exportCSVSettings = document.getElementById('exportCSVSettings');
    const exportTXTSettings = document.getElementById('exportTXTSettings');
    const exportPDFSettings = document.getElementById('exportPDFSettings');

    // --- Initialization ---
    async function initializeApp() {
        showTab('logTabContent'); // Start on Log tab
        setDefaultDate();
        setDefaultBodyweightDate();
        await loadPredefinedExercises();
        populateExerciseDropdown();
        renderCustomExercisesList();
        renderBodyWeightLogList();
        setupEventListeners();
        addSetRow();
    }

    // --- Data Handling ---
    function loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            // Ensure bodyweight log is sorted by date ascending on load
            if (key === BODYWEIGHT_STORAGE_KEY && data) {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed.sort((a, b) => a.date.localeCompare(b.date)) : defaultValue;
            }
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error loading data for key "${key}":`, e);
            showToast('Eroare Încărcare Date', `Nu s-au putut încărca datele pentru ${key}.`, 'danger');
            return defaultValue;
        }
    }

    function saveData(key, data) {
        try {
            // Ensure bodyweight log remains sorted when saving
            if (key === BODYWEIGHT_STORAGE_KEY && Array.isArray(data)) {
                data.sort((a, b) => a.date.localeCompare(b.date));
            }
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving data for key "${key}":`, e);
            showToast('Eroare Salvare Date', `Nu s-au putut salva datele pentru ${key} (posibil spațiu insuficient).`, 'danger');
        }
    }

    async function loadPredefinedExercises() {
        try {
            const response = await fetch('exercises.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            predefinedExercises = await response.json();
            predefinedExercises.sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }));
        } catch (error) {
            console.error('Error loading predefined exercises:', error);
            showToast('Eroare Încărcare Exerciții', 'Nu s-a putut încărca lista de exerciții predefinite.', 'warning');
            predefinedExercises = ["Bench Press", "Squat", "Deadlift"];
        }
    }

    // --- UI Functions ---
    function showToast(title, message, type = 'success') {
        toastTitleElement.textContent = title;
        toastBodyElement.textContent = message;
        toastElement.className = 'toast'; // Reset classes
        toastElement.classList.add(`text-bg-${type}`);
        toast.show();
    }

    function setDefaultDate() {
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    }

    function setDefaultBodyweightDate() {
        if (bodyweightDateInput) bodyweightDateInput.value = new Date().toISOString().split('T')[0];
    }

    function populateExerciseDropdown() {
        const allExercises = [...new Set([...predefinedExercises, ...customExercises])].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }));
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
        allExercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            exerciseSelect.appendChild(option);
        });

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
        Array.from(muscleGroupsSelect.options).forEach(option => option.selected = false);
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
        setDiv.querySelector('.remove-set-btn').addEventListener('click', (e) => {
            const rowToRemove = e.currentTarget.closest('.set-row');
            if (setsContainer.children.length > 1) rowToRemove.remove();
            else showToast('Atenție', 'Trebuie să existe cel puțin un set.', 'warning');
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
         if (setRows.length === 0) isValid = false;
         else {
             setRows.forEach(row => {
                 const repsInput = row.querySelector('.reps-input');
                 const weightInput = row.querySelector('.weight-input');
                 if (!repsInput.value || repsInput.value < 0 || !weightInput.value || weightInput.value < 0) {
                     isValid = false;
                 }
             });
         }
         setsWarning.classList.toggle('d-none', isValid);
         return isValid;
     }

    function getSetsData() {
        const sets = [];
        setsContainer.querySelectorAll('.set-row').forEach(row => {
            const reps = row.querySelector('.reps-input').value;
            const weight = row.querySelector('.weight-input').value;
            if (reps && weight && parseFloat(reps) >= 0 && parseFloat(weight) >= 0) {
                sets.push({ reps: parseInt(reps, 10), weight: parseFloat(weight) });
            }
        });
        return sets;
    }

    // --- Workout Log Rendering (History Tab) with Pagination ---
    function renderWorkoutLog() {
        workoutLogContainer.innerHTML = '<div class="text-center p-3"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Se încarcă jurnalul...</div>';
        paginationControlsContainer.innerHTML = ''; // Clear pagination while loading

        const filteredWorkouts = filterWorkouts(); // Get ALL filtered data (already sorted)

        // Calculate pagination details
        const totalItems = filteredWorkouts.length;
        const totalPages = Math.ceil(totalItems / HISTORY_ITEMS_PER_PAGE);
        historyCurrentPage = Math.max(1, Math.min(historyCurrentPage, totalPages)); // Ensure current page is valid

        const startIndex = (historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE;
        const endIndex = startIndex + HISTORY_ITEMS_PER_PAGE;
        const itemsToDisplay = filteredWorkouts.slice(startIndex, endIndex);

        // Use setTimeout to allow loading indicator to render
        setTimeout(() => {
            workoutLogContainer.innerHTML = ''; // Clear loading/previous log

            if (totalItems === 0) {
                noDataMessage.classList.remove('d-none');
                return;
            }
            noDataMessage.classList.add('d-none');

            // Group items for the current page by date
            const groupedByDate = itemsToDisplay.reduce((acc, workout) => {
                const date = workout.date;
                if (!acc[date]) acc[date] = [];
                acc[date].push(workout);
                return acc;
            }, {});

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a)); // Sort dates for display on this page
            const allWorkoutsSorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)); // Needed for previous workout lookup

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
                    const previousWorkout = findPreviousWorkout(workout, allWorkoutsSorted);
                    const volumeComparisonHTML = generateComparisonHTML(currentVolume, previousWorkout ? calculateVolume([previousWorkout]) : null, 'volume');
                    const e1rmComparisonHTML = generateComparisonHTML(currentE1RM, previousWorkout ? calculateMaxE1RM(previousWorkout.sets) : null, 'e1rm');
                    const setsSummaryHTML = workout.sets.map((set, index) => `<span class="badge text-bg-secondary me-1 fw-normal" title="Set ${index + 1}">${set.reps}r @ ${set.weight}kg</span>`).join(' ');
                    const notesExist = workout.notes && workout.notes.trim().length > 0;

                    entryDiv.innerHTML = `
                        <div class="d-flex w-100 justify-content-between align-items-start flex-wrap">
                            <div class="entry-main-info mb-1 me-2 flex-grow-1 ${notesExist ? 'clickable-area' : ''}" ${notesExist ? 'title="Vezi/Ascunde notițe"' : ''}>
                                <h6 class="mb-0 exercise-name d-inline-block">${workout.exercise}</h6>
                                ${isPR ? '<span class="pr-indicator text-warning ms-1" title="Record Personal stabilit la această dată!"><i class="bi bi-star-fill"></i></span>' : ''}
                                <small class="text-muted muscle-groups ms-2 d-block d-sm-inline">(${workout.muscleGroups.join(', ')})</small>
                            </div>
                            <div class="entry-actions text-nowrap ms-sm-auto mb-1">
                                <button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" title="Editează"><i class="bi bi-pencil-fill"></i></button>
                                <button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" title="Șterge"><i class="bi bi-trash-fill"></i></button>
                            </div>
                        </div>
                        <div class="sets-summary mb-1">${setsSummaryHTML || '<span class="text-muted small">Fără seturi valide.</span>'}</div>
                        <div class="exercise-stats small">
                             <span class="me-3" title="Volum Total (Reps * Greutate)"><strong class="me-1">Vol:</strong> <span class="volume-value">${currentVolume.toFixed(0)}</span> ${volumeComparisonHTML}</span>
                             <span class="me-3" title="Estimare 1 Rep Max (Formula Brzycki)"><strong class="me-1">e1RM:</strong> <span class="e1rm-value">${currentE1RM.toFixed(1)}</span> kg ${e1rmComparisonHTML}</span>
                             ${notesExist ? '<a href="#" class="details-toggle text-decoration-none text-info" title="Vezi/Ascunde notițe">[+] Notițe</a>' : ''}
                        </div>
                        ${notesExist ? `<div class="exercise-details d-none mt-2 border-top border-secondary border-opacity-25 pt-2"><p class="mb-0 small notes-text text-muted"><em>${workout.notes}</em></p></div>` : ''}
                    `;
                    dayEntriesDiv.appendChild(entryDiv);
                });
                dayGroupDiv.appendChild(dayEntriesDiv);
                workoutLogContainer.appendChild(dayGroupDiv);
            });

            addLogEntryActionListeners(); // Setup delegated listener
            renderPaginationControls(totalPages, totalItems); // Render pagination after log

        }, 10); // Small delay for loading indicator
    }

    // Render Pagination Controls
    function renderPaginationControls(totalPages, totalItems) {
        paginationControlsContainer.innerHTML = ''; // Clear previous

        if (totalPages <= 1) {
            return; // No need for controls if 0 or 1 page
        }

        const prevDisabled = historyCurrentPage === 1;
        const nextDisabled = historyCurrentPage === totalPages;

        const startItem = Math.min((historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE + 1, totalItems);
        const endItem = Math.min(startItem + HISTORY_ITEMS_PER_PAGE - 1, totalItems);

        paginationControlsContainer.innerHTML = `
            <button class="btn btn-secondary prev-page" ${prevDisabled ? 'disabled' : ''} title="Pagina Anterioară">
                <i class="bi bi-arrow-left-short"></i> Prec.
            </button>
            <span class="page-info">Pagina ${historyCurrentPage} din ${totalPages} (${startItem}-${endItem} din ${totalItems})</span>
            <button class="btn btn-secondary next-page" ${nextDisabled ? 'disabled' : ''} title="Pagina Următoare">
                Urm. <i class="bi bi-arrow-right-short"></i>
            </button>
        `;

        // Add listeners using event delegation on the container
        paginationControlsContainer.removeEventListener('click', handlePaginationClick); // Remove old listener
        paginationControlsContainer.addEventListener('click', handlePaginationClick);
    }

    // Handle Pagination Button Clicks (Delegated)
    function handlePaginationClick(event) {
        const button = event.target.closest('button');
        if (!button) return; // Click wasn't on a button

        if (button.classList.contains('prev-page') && historyCurrentPage > 1) {
            historyCurrentPage--;
            renderWorkoutLog(); // Re-render the log for the new page
            historyTabContent.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to top of history tab
        } else if (button.classList.contains('next-page')) {
            // Calculate total pages again in case filters changed total items
            const totalItems = filterWorkouts().length;
            const totalPages = Math.ceil(totalItems / HISTORY_ITEMS_PER_PAGE);
            if (historyCurrentPage < totalPages) {
                historyCurrentPage++;
                renderWorkoutLog(); // Re-render the log for the new page
                historyTabContent.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to top of history tab
            }
        }
    }


    // Helper for comparison indicators
    function generateComparisonHTML(current, previous, type) {
        let comparisonHTML = `<span class="comparison-indicator ${type}-comparison text-muted" title="vs ${previous?.toFixed(type === 'volume' ? 0 : 1) ?? 'N/A'}"><i class="bi bi-dash-lg"></i></span>`;
        if (previous === null || previous === undefined) return comparisonHTML;
        const unit = type === 'e1rm' ? ' kg' : '';
        const precision = type === 'volume' ? 0 : 1;
        if (current > previous) {
            const diff = previous > 0 ? ((current - previous) / previous * 100).toFixed(0) : 100;
            comparisonHTML = `<span class="comparison-indicator ${type}-comparison text-success" title="vs ${previous.toFixed(precision)}${unit}"><i class="bi bi-arrow-up-short"></i> +${diff}%</span>`;
        } else if (current < previous) {
            const diff = previous > 0 ? ((previous - current) / previous * 100).toFixed(0) : 100;
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
            if (sortedWorkouts[i].exercise === currentWorkout.exercise) return sortedWorkouts[i];
        }
        return null;
    }

    // Add Listeners for Log Entries (Edit/Delete/Toggle Notes) - Delegated
    function addLogEntryActionListeners() {
        workoutLogContainer.removeEventListener('click', handleLogEntryClick); // Remove previous listener
        workoutLogContainer.addEventListener('click', handleLogEntryClick);
    }

    // Delegated click handler for log entries
    function handleLogEntryClick(event) {
        const target = event.target;
        const entryDiv = target.closest('.log-exercise-entry');
        if (!entryDiv) return; // Click was outside an entry

        // Edit Button
        if (target.closest('.edit-btn')) {
            handleEdit(entryDiv.dataset.id); // Pass ID to handler
            return;
        }

        // Delete Button
        if (target.closest('.delete-btn')) {
            handleDelete(entryDiv.dataset.id); // Pass ID to handler
            return;
        }

        // Toggle Notes (Link or Clickable Area)
        if (target.closest('.details-toggle') || target.closest('.clickable-area')) {
            event.preventDefault();
            handleToggleNotes(entryDiv); // Pass the entryDiv
            return;
        }
    }

    // Toggle Notes visibility (takes entryDiv as argument)
    function handleToggleNotes(entryDiv) {
        const detailsDiv = entryDiv.querySelector('.exercise-details');
        const toggleLink = entryDiv.querySelector('.details-toggle');
        if (detailsDiv) {
            detailsDiv.classList.toggle('d-none');
            if (toggleLink) {
                toggleLink.textContent = detailsDiv.classList.contains('d-none') ? '[+] Notițe' : '[-] Notițe';
            }
        }
    }

    // --- Tab Navigation ---
    function showTab(tabId) {
        tabContents.forEach(tab => tab.classList.remove('active'));
        bottomNavButtons.forEach(btn => btn.classList.remove('active'));
        const activeTab = document.getElementById(tabId);
        const activeButton = document.querySelector(`#bottomNav button[data-target="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');
        if (activeButton) activeButton.classList.add('active');

        // Call specific functions based on the activated tab
        if (tabId === 'dashboardTabContent') updateDashboard();
        else if (tabId === 'historyTabContent') {
            populateMuscleGroupFilter();
            historyCurrentPage = 1; // Reset to first page when navigating to history
            renderWorkoutLog();
        }
        else if (tabId === 'settingsTabContent') {
            renderCustomExercisesList();
            renderBodyWeightLogList();
        }
        else if (tabId === 'logTabContent') populateExerciseDropdown();
        // Plan tab is static for now, listener is delegated
    }

    // --- Calculations (Volume, E1RM) ---
    function calculateVolume(workoutArray) {
        return workoutArray.reduce((totalVol, workout) => totalVol + workout.sets.reduce((vol, set) => vol + (set.reps * set.weight), 0), 0);
    }
    function calculateE1RM(weight, reps) {
        if (reps <= 0 || weight <= 0) return 0;
        if (reps === 1) return weight;
        const denominator = 1.0278 - (0.0278 * reps);
        return denominator > 0 ? weight / denominator : 0;
    }
    function calculateMaxE1RM(sets) {
        if (!sets || sets.length === 0) return 0;
        return Math.max(0, ...sets.map(set => calculateE1RM(set.weight, set.reps)));
    }

    // --- Update PRs ---
     function updatePersonalRecords(exercise, sets, workoutDate) {
         const currentMaxWeightSet = sets.reduce((maxSet, currentSet) => (currentSet.weight > (maxSet?.weight || 0) ? currentSet : maxSet), null);
         const currentMaxWeight = currentMaxWeightSet ? currentMaxWeightSet.weight : 0;
         const currentMaxE1RM = calculateMaxE1RM(sets);
         const currentVolume = calculateVolume([{ sets }]);
         let recordUpdated = false;
         if (!personalRecords[exercise]) personalRecords[exercise] = { weight: 0, volume: 0, e1rm: 0, weightDate: '', volumeDate: '', e1rmDate: '' };
         const record = personalRecords[exercise];
         if (currentMaxWeight > record.weight) { record.weight = currentMaxWeight; record.weightDate = workoutDate; recordUpdated = true; }
         if (currentVolume > record.volume) { record.volume = currentVolume; record.volumeDate = workoutDate; recordUpdated = true; }
         if (currentMaxE1RM > record.e1rm) { record.e1rm = currentMaxE1RM; record.e1rmDate = workoutDate; recordUpdated = true; }
         if (recordUpdated) { saveData(PR_STORAGE_KEY, personalRecords); console.log(`PR updated for ${exercise} on ${workoutDate}:`, record); return true; }
         return false;
     }

     // Check if the *current* workout entry matches the date a PR was set
     function checkForPR(exercise, volume, maxE1RM, workoutDate) {
        const record = personalRecords[exercise];
        if (!record) return false;
        // Check if date matches AND value is equal or greater (handles multiple entries on same day)
        const checkWeight = () => {
            if (!record.weightDate || record.weightDate !== workoutDate) return false;
            const maxWeightThisEntry = Math.max(0, ...workouts.find(w => w.date === workoutDate && w.exercise === exercise)?.sets.map(s => s.weight) ?? []);
            return maxWeightThisEntry >= record.weight;
        }
        return (record.volumeDate === workoutDate && volume >= record.volume) ||
               (record.e1rmDate === workoutDate && maxE1RM >= record.e1rm) ||
               checkWeight();
     }

    // --- Event Handlers ---

    // Workout Form Submit (Add/Edit)
    function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        const isValid = workoutForm.checkValidity();
        const areSetsValid = validateSets();
        workoutForm.classList.add('was-validated');
        if (!isValid || !areSetsValid) {
             if (!areSetsValid) showToast('Eroare Formular', 'Verificați seturile introduse (Rep. și Kg > 0 obligatorii).', 'warning');
             else showToast('Eroare Formular', 'Vă rugăm completați câmpurile obligatorii.', 'warning');
            const firstInvalid = workoutForm.querySelector(':invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
        }
        const workoutData = {
            id: editingId || Date.now().toString(), date: dateInput.value,
            muscleGroups: Array.from(muscleGroupsSelect.selectedOptions).map(option => option.value),
            exercise: exerciseSelect.value, sets: getSetsData(), notes: notesInput.value.trim()
        };
        let actionType = 'adăugat';
        if (editingId) {
            const index = workouts.findIndex(w => w.id === editingId);
            if (index > -1) { workouts[index] = workoutData; actionType = 'actualizat'; }
            else { workouts.push(workoutData); console.warn("Editing ID existed but workout not found, adding as new."); }
        } else workouts.push(workoutData);
        const prSetByThisEntry = updatePersonalRecords(workoutData.exercise, workoutData.sets, workoutData.date);
        saveData(WORKOUT_STORAGE_KEY, workouts);
        showToast('Succes', `Antrenament ${actionType} cu succes!`);
        if (prSetByThisEntry && actionType === 'adăugat') {
            setTimeout(() => showToast('Record Personal!', `Nou record stabilit pentru ${workoutData.exercise}!`, 'info'), 600);
        }
        populateMuscleGroupFilter();
        populateExerciseDropdown();
        resetForm();
        // If user was on history tab, update it, otherwise stay on form tab
        if (document.getElementById('historyTabContent').classList.contains('active')) {
             historyCurrentPage = 1; // Go to first page to see the new entry
             renderWorkoutLog();
        }
    }

    // Edit Workout Button Click (takes ID)
    function handleEdit(id) {
        const workout = workouts.find(w => w.id === id);
        if (!workout) { showToast('Eroare', 'Nu s-a găsit înregistrarea pentru editare.', 'danger'); return; }
        showTab('logTabContent'); // Switch to form tab
        editingId = id; editIdInput.value = id;
        formTitle.textContent = 'Editează Exercițiu'; submitBtn.textContent = 'Actualizează';
        cancelEditBtn.classList.remove('d-none'); dateInput.value = workout.date;
        Array.from(muscleGroupsSelect.options).forEach(option => option.selected = workout.muscleGroups.includes(option.value));
        exerciseSelect.value = workout.exercise; notesInput.value = workout.notes;
        setsContainer.innerHTML = '';
        if (workout.sets && workout.sets.length > 0) workout.sets.forEach(set => addSetRow(set.reps, set.weight));
        else addSetRow();
        validateSets();
        logTabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Delete Workout Button Click (takes ID)
    function handleDelete(id) {
        const workout = workouts.find(w => w.id === id);
        if (!workout) { showToast('Eroare', 'Nu s-a găsit înregistrarea pentru ștergere.', 'danger'); return; }
        if (confirm(`Sunteți sigur că doriți să ștergeți înregistrarea pentru ${workout.exercise} din ${formatDateForDisplay(workout.date)}?`)) {
            workouts = workouts.filter(w => w.id !== id);
            saveData(WORKOUT_STORAGE_KEY, workouts);
            // Re-render the current page of history, adjusting page number if needed
            const totalItems = filterWorkouts().length; // Recalculate total after delete
            const totalPages = Math.ceil(totalItems / HISTORY_ITEMS_PER_PAGE);
            if (historyCurrentPage > totalPages && totalPages > 0) {
                historyCurrentPage = totalPages; // Go to last page if current page becomes invalid
            } else if (totalPages === 0) {
                 historyCurrentPage = 1; // Reset if no items left
            }
            renderWorkoutLog(); // Re-render current view
            populateMuscleGroupFilter();
            populateExerciseDropdown();
            showToast('Șters', 'Înregistrarea a fost ștearsă.', 'success');
            // Update dashboard if it's the active tab
            if (document.getElementById('dashboardTabContent').classList.contains('active')) updateDashboard();
        }
    }

    // Cancel Edit Button Click
    function handleCancelEdit() { resetForm(); }

    // --- Filtering (History Tab) ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout); timeout = setTimeout(later, wait);
        };
    }
    function handleFilterChange() {
        historyCurrentPage = 1; // Reset pagination when filters change
        renderWorkoutLog();
    }
    const debouncedFilterHandler = debounce(handleFilterChange, 350);
    function handleClearFilters() {
        filterDateInput.value = ''; filterExerciseInput.value = ''; filterMuscleGroupSelect.value = '';
        historyCurrentPage = 1; // Reset pagination
        renderWorkoutLog();
    }
    function filterWorkouts() { // Returns ALL filtered workouts, sorted
        const dateFilter = filterDateInput.value;
        const exerciseFilter = filterExerciseInput.value.toLowerCase().trim();
        const muscleGroupFilter = filterMuscleGroupSelect.value;
        const filtered = workouts.filter(w => {
            const matchDate = !dateFilter || w.date === dateFilter;
            const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter);
            const matchMuscleGroup = !muscleGroupFilter || w.muscleGroups.includes(muscleGroupFilter);
            return matchDate && matchExercise && matchMuscleGroup;
        });
        // Sort ALL filtered results descending by date, then ID (newest first)
        return filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    }

    // --- Dashboard ---
    function getWorkoutsForPeriod(period) {
        const now = new Date(); let startDate = new Date(); startDate.setHours(0, 0, 0, 0);
        switch (period) {
            case 'last7days': startDate.setDate(now.getDate() - 6); break;
            case 'last30days': startDate.setDate(now.getDate() - 29); break;
            case 'allTime': return [...workouts];
            default: startDate.setDate(now.getDate() - 6);
        }
        const startDateString = startDate.toISOString().split('T')[0];
        return workouts.filter(w => w.date >= startDateString);
    }

    function updateDashboard() {
        const period = dashboardPeriodSelect.value;
        const periodWorkouts = getWorkoutsForPeriod(period);
        // Stats
        const totalEntries = periodWorkouts.length;
        const totalSets = periodWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
        const totalReps = periodWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0);
        const setsWithWeight = periodWorkouts.flatMap(w => w.sets).filter(s => s.weight > 0);
        const totalWeightSum = setsWithWeight.reduce((sum, set) => sum + set.weight, 0);
        const avgWeight = setsWithWeight.length > 0 ? (totalWeightSum / setsWithWeight.length) : 0;
        const totalVolume = calculateVolume(periodWorkouts);
        statsExercises.textContent = totalEntries; statsSets.textContent = totalSets; statsReps.textContent = totalReps;
        statsAvgWeight.textContent = avgWeight.toFixed(1) + ' kg'; statsTotalVolume.textContent = (totalVolume / 1000).toFixed(1) + ' T';
        // Weekly Averages
        let daysInPeriod = 7;
        if (period === 'last30days') daysInPeriod = 30;
        else if (period === 'allTime') {
            if (workouts.length > 0) {
                const sortedByDate = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
                const minDate = new Date(sortedByDate[0].date); const maxDate = new Date(sortedByDate[sortedByDate.length - 1].date);
                daysInPeriod = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
            } else daysInPeriod = 1;
        }
        const weeksInPeriod = Math.max(1, daysInPeriod / 7);
        const uniqueWorkoutDays = new Set(periodWorkouts.map(w => w.date)).size;
        weeklyAvgWorkouts.textContent = (uniqueWorkoutDays / weeksInPeriod).toFixed(1); weeklyAvgSets.textContent = (totalSets / weeksInPeriod).toFixed(1);
        weeklyAvgReps.textContent = (totalReps / weeksInPeriod).toFixed(1); weeklyAvgRepsPerSet.textContent = totalSets > 0 ? (totalReps / totalSets).toFixed(1) : '0';
        weeklyAvgVolume.textContent = ((totalVolume / 1000) / weeksInPeriod).toFixed(2) + ' T';
        // Renders
        renderPersonalRecords(); renderMuscleGroupsChart(periodWorkouts); renderVolumeChartDash(periodWorkouts);
        handleProgressExerciseChangeDash(); renderPrZoneWidget(); renderRecentSessionsWidget();
        renderWeightProgressChart(); renderConsistencyHeatmap();
    }

    // Render Historical PRs (on Dashboard)
    function renderPersonalRecords() {
        personalRecordsList.innerHTML = '';
        const sortedRecords = Object.entries(personalRecords)
            .map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => record.e1rm > 0 || record.weight > 0 || record.volume > 0)
            .sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0));
        noPrMessage.classList.toggle('d-none', sortedRecords.length > 0);
        const topRecords = sortedRecords.slice(0, 5);
        topRecords.forEach(record => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'py-1', 'px-2');
            li.innerHTML = `
                <span class="pr-exercise small me-2">${record.exercise}</span>
                <div class="text-end small">
                    ${record.e1rm > 0 ? `<span class="badge bg-primary rounded-pill me-1 mb-1" title="e1RM (${formatDateForDisplay(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)}kg</span>` : ''}
                    ${record.weight > 0 ? `<span class="badge bg-success rounded-pill me-1 mb-1" title="Greutate (${formatDateForDisplay(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)}kg</span>` : ''}
                    ${record.volume > 0 ? `<span class="badge bg-warning text-dark rounded-pill mb-1" title="Volum (${formatDateForDisplay(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(0)}</span>` : ''}
                </div>`;
            personalRecordsList.appendChild(li);
        });
         if (sortedRecords.length === 0) personalRecordsList.innerHTML = '<li class="list-group-item text-muted small text-center" id="noPrMessage">Nu există recorduri înregistrate.</li>';
    }

    // --- Dashboard Chart Rendering (Muscle, Volume, Progress) ---
     function renderMuscleGroupsChart(data) {
         const svg = d3.select("#d3MusclesChart"); svg.selectAll("*").remove();
         const muscleCounts = data.reduce((acc, workout) => { workout.muscleGroups.forEach(group => { acc[group] = (acc[group] || 0) + 1; }); return acc; }, {});
         const sortedMuscles = Object.entries(muscleCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
         noMuscleDataMessage.classList.toggle('d-none', sortedMuscles.length > 0);
         d3MusclesChartContainer.style.display = 'block'; svg.style('display', sortedMuscles.length > 0 ? 'block' : 'none');
         if (sortedMuscles.length === 0) return;
         const { width, height } = svg.node().getBoundingClientRect(); const margin = { top: 20, right: 20, bottom: 70, left: 40 };
         const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
         const x = d3.scaleBand().range([0, chartWidth]).padding(0.2).domain(sortedMuscles.map(d => d[0]));
         const y = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(sortedMuscles, d => d[1]) || 1]).nice();
         g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x)).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-45)");
         g.append("g").call(d3.axisLeft(y).ticks(Math.min(5, d3.max(sortedMuscles, d => d[1]) || 1)).tickFormat(d3.format("d"))).append("text").attr("class", "axis-label").attr("fill", "var(--htb-text-secondary)").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "-3.0em").attr("text-anchor", "end").text("Nr. Sesiuni");
         g.selectAll(".muscle-bar").data(sortedMuscles).enter().append("rect").attr("class", "muscle-bar").attr("x", d => x(d[0])).attr("y", d => y(d[1])).attr("width", x.bandwidth()).attr("height", d => chartHeight - y(d[1])).append("title").text(d => `${d[0]}: ${d[1]} sesiuni`);
         g.selectAll(".bar-label").data(sortedMuscles).enter().append("text").attr("class", "bar-label").attr("x", d => x(d[0]) + x.bandwidth() / 2).attr("y", d => y(d[1]) - 5).attr("text-anchor", "middle").text(d => d[1]);
     }
     function renderVolumeChartDash(data) {
         const svg = d3.select("#d3VolumeChartDash"); svg.selectAll("*").remove();
         if (data.length === 0) { svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Nu există date de volum."); return; }
         const volumeByDate = d3.rollup(data, v => d3.sum(v, d => calculateVolume([d])), d => d.date);
         const aggregatedData = Array.from(volumeByDate, ([date, volume]) => ({ date: d3.timeParse("%Y-%m-%d")(date), volume })).filter(d => d.date).sort((a, b) => a.date - b.date);
         if (aggregatedData.length === 0) { svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Eroare date volum."); return; }
         const { width, height } = svg.node().getBoundingClientRect(); const margin = { top: 20, right: 40, bottom: 50, left: 50 };
         const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
         const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
         const x = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(aggregatedData, d => d.date));
         const y = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(aggregatedData, d => d.volume) || 100]).nice();
         g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b"))).selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-30)");
         g.append("g").call(d3.axisLeft(y).ticks(5)).append("text").attr("class", "axis-label").attr("fill", "var(--htb-text-secondary)").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "-3.5em").attr("text-anchor", "end").text("Volum Total (kg)");
         const line = d3.line().x(d => x(d.date)).y(d => y(d.volume)).curve(d3.curveMonotoneX);
         g.append("path").datum(aggregatedData).attr("fill", "none").attr("stroke", "var(--htb-accent)").attr("stroke-width", 2).attr("d", line);
         g.selectAll(".volume-dot").data(aggregatedData).enter().append("circle").attr("class", "volume-dot").attr("cx", d => x(d.date)).attr("cy", d => y(d.volume)).attr("r", 3).attr("fill", "var(--htb-accent)").append("title").text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}: ${d.volume.toFixed(1)} kg`);
     }
     function handleProgressExerciseChangeDash() {
         const selectedExercise = progressExerciseSelectDash.value; const svg = d3.select("#d3ProgressChartDash"); svg.selectAll("*").remove();
         if (!selectedExercise) { svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Selectați un exercițiu."); return; }
         const exerciseData = workouts.filter(w => w.exercise === selectedExercise).sort((a, b) => a.date.localeCompare(b.date));
         if (exerciseData.length === 0) { svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Nu există date."); return; }
         const progressData = exerciseData.map(workout => ({ date: d3.timeParse("%Y-%m-%d")(workout.date), maxE1RM: calculateMaxE1RM(workout.sets), maxWeight: Math.max(0, ...workout.sets.map(s => s.weight)) })).filter(d => d.date);
         if (progressData.length === 0) { svg.append("text").attr("x", "50%").attr("y", "50%").attr("text-anchor", "middle").attr("fill", "var(--htb-text-muted)").text("Eroare date progres."); return; }
         const { width, height } = svg.node().getBoundingClientRect(); const margin = { top: 20, right: 50, bottom: 50, left: 50 };
         const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
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
         const legend = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top - 15})`).attr("class", "chart-legend");
         legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).style("fill", "var(--htb-tag-red)"); legend.append("text").attr("x", 10).attr("y", 0).text("Greutate Max");
         legend.append("line").attr("x1", 100).attr("y1", 0).attr("x2", 120).attr("y2", 0).attr("stroke", "var(--htb-accent)").attr("stroke-width", 2); legend.append("text").attr("x", 130).attr("y", 0).text("e1RM Est.");
     }

    // --- Dashboard Widget Rendering ---
    function renderPrZoneWidget() {
        newPrZoneList.innerHTML = ''; const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
        const recentPRs = Object.entries(personalRecords).map(([exercise, data]) => ({ exercise, ...data }))
            .filter(record => (record.e1rmDate && record.e1rmDate >= thirtyDaysAgoStr) || (record.weightDate && record.weightDate >= thirtyDaysAgoStr) || (record.volumeDate && record.volumeDate >= thirtyDaysAgoStr))
            .sort((a, b) => Math.max(new Date(b.e1rmDate||0).getTime(), new Date(b.weightDate||0).getTime(), new Date(b.volumeDate||0).getTime()) - Math.max(new Date(a.e1rmDate||0).getTime(), new Date(a.weightDate||0).getTime(), new Date(a.volumeDate||0).getTime()));
        noNewPrMessage.classList.toggle('d-none', recentPRs.length > 0); if (recentPRs.length === 0) return;
        recentPRs.slice(0, 5).forEach(record => {
            const li = document.createElement('div'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'py-1', 'px-2');
            li.innerHTML = `<span class="pr-exercise small me-2">${record.exercise}</span> <div class="text-end small">
                ${(record.e1rm > 0 && record.e1rmDate >= thirtyDaysAgoStr) ? `<span class="badge bg-primary rounded-pill me-1 mb-1" title="e1RM (${formatDateForDisplay(record.e1rmDate)})"><i class="bi bi-bullseye"></i> ${record.e1rm.toFixed(1)}kg</span>` : ''}
                ${(record.weight > 0 && record.weightDate >= thirtyDaysAgoStr) ? `<span class="badge bg-success rounded-pill me-1 mb-1" title="Greutate (${formatDateForDisplay(record.weightDate)})"><i class="bi bi-barbell"></i> ${record.weight.toFixed(1)}kg</span>` : ''}
                ${(record.volume > 0 && record.volumeDate >= thirtyDaysAgoStr) ? `<span class="badge bg-warning text-dark rounded-pill mb-1" title="Volum (${formatDateForDisplay(record.volumeDate)})"><i class="bi bi-graph-up"></i> ${record.volume.toFixed(0)}</span>` : ''}
                </div>`;
            newPrZoneList.appendChild(li);
        });
    }
    function renderRecentSessionsWidget() {
        recentSessionsList.innerHTML = ''; const uniqueDates = [...new Set(workouts.map(w => w.date))].sort((a, b) => b.localeCompare(a));
        noRecentSessionsMessage.classList.toggle('d-none', uniqueDates.length > 0); if (uniqueDates.length === 0) return;
        const recentDates = uniqueDates.slice(0, 5);
        recentDates.forEach(date => {
            const workoutsOnDate = workouts.filter(w => w.date === date); const exercisesString = workoutsOnDate.map(w => w.exercise).slice(0, 3).join(', ') + (workoutsOnDate.length > 3 ? '...' : '');
            const totalSets = workoutsOnDate.reduce((sum, w) => sum + w.sets.length, 0); const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1', 'px-2');
            li.innerHTML = `<div class="small"><strong class="d-block">${formatDateForDisplay(date)}</strong><span class="text-muted">${exercisesString || 'N/A'}</span></div><span class="badge bg-secondary rounded-pill">${totalSets} seturi</span>`;
            recentSessionsList.appendChild(li);
        });
    }
    function renderWeightProgressChart() {
        const svgContainer = d3.select(weightProgressChartContainer); svgContainer.select("svg").remove(); // Clear previous SVG
        const weightData = [...bodyWeightLog].map(d => ({ ...d, date: d3.timeParse("%Y-%m-%d")(d.date) })).filter(d => d.date && d.weight > 0).sort((a, b) => a.date - b.date);
        if (weightData.length < 2) { svgContainer.html(`<div class="d-flex align-items-center justify-content-center h-100"><p class="text-center text-muted small">Nu există suficiente date (${weightData.length}) pentru grafic.<br>Adaugă greutatea în Setări.</p></div>`); return; }
        const chartSvg = svgContainer.append("svg").attr("width", "100%").attr("height", "255");
        const { width, height } = chartSvg.node().getBoundingClientRect(); const margin = { top: 20, right: 40, bottom: 50, left: 50 };
        const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
        const g = chartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const x = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(weightData, d => d.date));
        const y = d3.scaleLinear().range([chartHeight, 0]).domain([d3.min(weightData, d => d.weight) * 0.95, d3.max(weightData, d => d.weight) * 1.05]).nice();
        g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b"))).selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-30)");
        g.append("g").call(d3.axisLeft(y).ticks(5)).append("text").attr("class", "axis-label").attr("fill", "var(--htb-text-secondary)").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "-3.5em").attr("text-anchor", "end").text("Greutate (kg)");
        const line = d3.line().x(d => x(d.date)).y(d => y(d.weight)).curve(d3.curveMonotoneX);
        g.append("path").datum(weightData).attr("fill", "none").attr("stroke", "var(--htb-tag-blue)").attr("stroke-width", 2).attr("d", line);
        g.selectAll(".weight-dot").data(weightData).enter().append("circle").attr("class", "weight-dot").attr("cx", d => x(d.date)).attr("cy", d => y(d.weight)).attr("r", 3).attr("fill", "var(--htb-tag-blue)").append("title").text(d => `${formatDateForDisplay(d.date.toISOString().split('T')[0])}: ${d.weight.toFixed(1)} kg`);
    }
    function renderConsistencyHeatmap() {
        const svg = d3.select(consistencyHeatmapContainer); svg.selectAll("*").remove();
        const numberOfWeeks = 4; const cellSize = 12; const cellSpacing = 2;
        const workoutStatsByDate = workouts.reduce((acc, w) => { const date = w.date; if (!acc[date]) acc[date] = { sets: 0, volume: 0, count: 0 }; acc[date].sets += w.sets.length; acc[date].volume += calculateVolume([w]); acc[date].count += 1; return acc; }, {});
        // Intensity based on sets: 0=rest, 1=<6 sets, 2=6-11 sets, 3=12-19 sets, 4=20+ sets
        const getIntensityLevel = (dateString) => { const stats = workoutStatsByDate[dateString]; if (!stats) return 0; if (stats.sets >= 20) return 4; if (stats.sets >= 12) return 3; if (stats.sets >= 6) return 2; return 1; };
        const today = d3.timeDay.floor(new Date()); const endDate = d3.timeDay.offset(today, 1); const startDate = d3.timeSunday.offset(today, -(numberOfWeeks - 1)); const allDays = d3.timeDays(startDate, endDate);
        const tooltip = d3.select(heatmapTooltip); const weekCount = d3.timeWeek.count(startDate, endDate); const svgHeight = weekCount * (cellSize + cellSpacing); const svgWidth = 7 * (cellSize + cellSpacing);
        svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`).attr('width', '100%').attr('max-width', `${svgWidth}px`).attr('height', svgHeight).attr('preserveAspectRatio', 'xMidYMin meet');
        svg.selectAll('.heatmap-day').data(allDays).enter().append('rect')
            .attr('class', d => `heatmap-day heatmap-day-level-${getIntensityLevel(d3.timeFormat("%Y-%m-%d")(d))}`)
            .attr('width', cellSize).attr('height', cellSize).attr('rx', 3).attr('ry', 3)
            .attr('x', d => d3.timeFormat('%w')(d) * (cellSize + cellSpacing)).attr('y', d => d3.timeWeek.count(startDate, d) * (cellSize + cellSpacing))
            .attr('data-date', d => d3.timeFormat("%Y-%m-%d")(d))
            .on('mouseover', (event, d) => { const rect = event.currentTarget; const dateString = rect.getAttribute('data-date'); const stats = workoutStatsByDate[dateString]; const dateFormatted = formatDateForDisplay(dateString); let tooltipText = `${dateFormatted}: ${stats ? `Antrenament (${stats.sets} seturi, ${stats.volume.toFixed(0)} vol)` : 'Pauză'}`; tooltip.style('opacity', 1).html(tooltipText); tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 20) + 'px'); })
            .on('mousemove', (event) => { tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 20) + 'px'); })
            .on('mouseout', () => { tooltip.style('opacity', 0); });
    }

    // --- Settings ---
    function renderCustomExercisesList() {
        existingExercisesListSettings.innerHTML = ''; if (customExercises.length === 0) { existingExercisesListSettings.innerHTML = '<li class="list-group-item text-muted">Nu ai adăugat exerciții custom.</li>'; return; }
        [...customExercises].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' })).forEach(ex => {
            const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.textContent = ex;
            const deleteBtn = document.createElement('button'); deleteBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'py-0', 'px-1'); deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>'; deleteBtn.title = 'Șterge Exercițiu Custom'; deleteBtn.dataset.exercise = ex;
            li.appendChild(deleteBtn); existingExercisesListSettings.appendChild(li);
        });
        existingExercisesListSettings.removeEventListener('click', handleDeleteCustomExerciseClick); existingExercisesListSettings.addEventListener('click', handleDeleteCustomExerciseClick);
    }
    function handleDeleteCustomExerciseClick(event) {
        if (event.target.closest('.btn-outline-danger')) { const button = event.target.closest('button'); const exerciseToDelete = button.dataset.exercise; if (exerciseToDelete) handleDeleteCustomExercise(exerciseToDelete); }
    }
    function handleAddCustomExercise() {
        const newExercise = newExerciseNameSettings.value.trim(); if (!newExercise) { showToast('Atenție', 'Introduceți un nume valid.', 'warning'); return; }
        const allExercisesLower = [...predefinedExercises, ...customExercises].map(e => e.toLowerCase()); if (allExercisesLower.includes(newExercise.toLowerCase())) { showToast('Eroare', 'Acest exercițiu există deja.', 'warning'); return; }
        customExercises.push(newExercise); saveData(EXERCISE_STORAGE_KEY, customExercises); renderCustomExercisesList(); populateExerciseDropdown(); newExerciseNameSettings.value = ''; showToast('Succes', `Exercițiul "${newExercise}" a fost adăugat.`, 'success');
    }
    function handleDeleteCustomExercise(exerciseToDelete) {
        const isUsed = workouts.some(workout => workout.exercise === exerciseToDelete); let proceed = true;
        if (isUsed) proceed = confirm(`Atenție! Exercițiul "${exerciseToDelete}" este folosit în ${workouts.filter(w => w.exercise === exerciseToDelete).length} înregistrări. Ștergerea lui NU va șterge înregistrările.\n\nContinuați cu ștergerea exercițiului din lista custom?`);
        else proceed = confirm(`Sunteți sigur că doriți să ștergeți exercițiul custom "${exerciseToDelete}"?`);
        if (proceed) { const index = customExercises.findIndex(ex => ex === exerciseToDelete); if (index > -1) { customExercises.splice(index, 1); saveData(EXERCISE_STORAGE_KEY, customExercises); renderCustomExercisesList(); populateExerciseDropdown(); showToast('Succes', `Exercițiul "${exerciseToDelete}" a fost șters din lista custom.`, 'success'); } else showToast('Eroare', `Exercițiul "${exerciseToDelete}" nu a fost găsit.`, 'danger'); }
    }

    // --- Bodyweight Logging (Settings Tab) ---
    function renderBodyWeightLogList() {
        bodyweightLogList.innerHTML = ''; if (bodyWeightLog.length === 0) { bodyweightLogList.innerHTML = '<li class="list-group-item text-muted">Nu există înregistrări de greutate.</li>'; return; }
        const sortedLog = [...bodyWeightLog].sort((a, b) => b.date.localeCompare(a.date)); // Display descending
        sortedLog.slice(0, 10).forEach(entry => { // Show last 10
            const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1', 'px-2');
            li.innerHTML = `<span>${formatDateForDisplay(entry.date)}: <strong>${entry.weight.toFixed(1)} kg</strong></span> <button class="btn btn-sm btn-outline-danger py-0 px-1 delete-bw-btn" data-id="${entry.id}" title="Șterge Înregistrare Greutate"><i class="bi bi-x-lg"></i></button>`;
            bodyweightLogList.appendChild(li);
        });
        bodyweightLogList.removeEventListener('click', handleDeleteBodyweightClick); bodyweightLogList.addEventListener('click', handleDeleteBodyweightClick);
    }
    function handleDeleteBodyweightClick(event) {
        if (event.target.closest('.delete-bw-btn')) { const button = event.target.closest('button'); const entryId = button.dataset.id; if (entryId) handleDeleteBodyweight(entryId); }
    }
    function handleBodyweightSubmit(event) {
        event.preventDefault(); event.stopPropagation();
        if (!bodyweightForm.checkValidity()) { bodyweightForm.classList.add('was-validated'); showToast('Eroare Formular', 'Introduceți o dată și o greutate valide.', 'warning'); return; }
        bodyweightForm.classList.remove('was-validated');
        const newEntry = { id: Date.now().toString(), date: bodyweightDateInput.value, weight: parseFloat(bodyweightValueInput.value) };
        const existingIndex = bodyWeightLog.findIndex(entry => entry.date === newEntry.date);
        if (existingIndex > -1) {
             bodyWeightLog[existingIndex].weight = newEntry.weight; // Update weight
             // Keep original ID for stability if updating
             showToast('Actualizat', 'Greutatea pentru această dată a fost actualizată.', 'success');
        } else {
            bodyWeightLog.push(newEntry);
            showToast('Succes', 'Greutate corporală salvată.', 'success');
        }
        bodyWeightLog.sort((a, b) => a.date.localeCompare(b.date)); // Sort ASC for chart data
        saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog);
        renderBodyWeightLogList(); // Update list in settings (shows DESC)
        bodyweightValueInput.value = ''; // Clear only weight input
        updateDashboard(); // Update the dashboard chart
    }
    function handleDeleteBodyweight(entryId) {
        const entryToDelete = bodyWeightLog.find(entry => entry.id === entryId); if (!entryToDelete) return;
        if (confirm(`Sunteți sigur că doriți să ștergeți înregistrarea de greutate (${entryToDelete.weight.toFixed(1)} kg) din ${formatDateForDisplay(entryToDelete.date)}?`)) {
            bodyWeightLog = bodyWeightLog.filter(entry => entry.id !== entryId); saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog); showToast('Șters', 'Înregistrarea de greutate a fost ștearsă.', 'success'); renderBodyWeightLogList(); updateDashboard();
        }
    }

    // --- Data Management (Backup/Restore/Export) ---
    function handleBackupData() {
        const allData = { workouts, customExercises, personalRecords, bodyWeightLog }; const dataStr = JSON.stringify(allData, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `gym_log_pro_backup_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); showToast('Backup Complet', 'Backup-ul datelor a fost descărcat.', 'info');
    }
    function handleRestoreData(event) {
        const file = event.target.files[0]; if (!file || !file.name.endsWith('.json')) { showToast('Eroare Fișier', 'Selectați un fișier .json valid.', 'warning'); restoreFileSettings.value = ''; return; }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const restoredData = JSON.parse(e.target.result);
                if (restoredData && typeof restoredData === 'object' && Array.isArray(restoredData.workouts) && Array.isArray(restoredData.customExercises) && typeof restoredData.personalRecords === 'object' && (restoredData.bodyWeightLog === undefined || Array.isArray(restoredData.bodyWeightLog))) {
                    if (confirm('ATENȚIE: Datele curente vor fi suprascrise. Continuați?')) {
                        workouts = restoredData.workouts; customExercises = restoredData.customExercises; personalRecords = restoredData.personalRecords; bodyWeightLog = restoredData.bodyWeightLog || [];
                        saveData(WORKOUT_STORAGE_KEY, workouts); saveData(EXERCISE_STORAGE_KEY, customExercises); saveData(PR_STORAGE_KEY, personalRecords); saveData(BODYWEIGHT_STORAGE_KEY, bodyWeightLog);
                        initializeApp(); // Re-init completely
                        showToast('Restaurare Completă', 'Datele au fost restaurate.', 'success'); showTab('dashboardTabContent');
                    } else showToast('Anulat', 'Restaurarea a fost anulată.', 'info');
                } else throw new Error("Structura JSON invalidă.");
            } catch (err) { console.error("Error parsing restore file:", err); showToast('Eroare Restaurare', `Nu s-a putut restaura: ${err.message}`, 'danger'); }
            finally { restoreFileSettings.value = ''; }
        };
        reader.onerror = () => { showToast('Eroare Fișier', 'Nu s-a putut citi fișierul.', 'danger'); restoreFileSettings.value = ''; }; reader.readAsText(file);
    }
    function handleExportCSV() {
        if (workouts.length === 0) { showToast('Info', 'Nu există date.', 'info'); return; }
        const headers = ["Data", "Exercitiu", "Grupe Musculare", "Set", "Repetari", "Greutate (kg)", "Note"]; let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date) || a.exercise.localeCompare(b.exercise));
        sortedWorkouts.forEach(workout => { workout.sets.forEach((set, index) => { const row = [ formatDateForDisplay(workout.date), `"${workout.exercise.replace(/"/g, '""')}"`, `"${workout.muscleGroups.join(', ')}"`, index + 1, set.reps, set.weight, index === 0 ? `"${workout.notes ? workout.notes.replace(/"/g, '""') : ''}"` : '""' ]; csvContent += row.join(",") + "\n"; }); });
        const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); showToast('Export CSV', 'Datele exportate în CSV.', 'success');
    }
    function handleExportTXT() {
        if (workouts.length === 0) { showToast('Info', 'Nu există date.', 'info'); return; } let txtContent = "Jurnal Antrenamente Gym Log Pro\n=================================\n\n";
        const groupedByDate = workouts.reduce((acc, workout) => { const dateKey = workout.date; if (!acc[dateKey]) acc[dateKey] = []; acc[dateKey].push(workout); return acc; }, {}); const sortedDates = Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b));
        sortedDates.forEach(dateKey => { txtContent += `Data: ${formatDateForDisplay(dateKey)}\n-----------------\n`; const workoutsForDay = groupedByDate[dateKey]; workoutsForDay.forEach(workout => { txtContent += `- ${workout.exercise} (${workout.muscleGroups.join(', ')})\n`; workout.sets.forEach((set, index) => { txtContent += `  Set ${index + 1}: ${set.reps} reps @ ${set.weight} kg\n`; }); if (workout.notes) txtContent += `  Notițe: ${workout.notes}\n`; txtContent += "\n"; }); txtContent += "\n"; });
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `gym_log_pro_export_${new Date().toISOString().split('T')[0]}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); showToast('Export TXT', 'Datele exportate în TXT.', 'success');
    }
    function handleExportPDF() {
        if (workouts.length === 0) { showToast('Info', 'Nu există date.', 'info'); return; } if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof window.jspdf.plugin.autotable === 'undefined') { showToast('Eroare PDF', 'Librăria jsPDF/AutoTable lipsește.', 'danger'); console.error("jsPDF or AutoTable not loaded!"); return; } const { jsPDF } = window.jspdf; const doc = new jsPDF();
        const tableColumn = ["Data", "Exercițiu", "Grupe", "Seturi", "Rep. Totale", "Volum", "e1RM Max"]; const tableRows = []; const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
        sortedWorkouts.forEach(workout => { const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0); const volume = calculateVolume([workout]); const maxE1RM = calculateMaxE1RM(workout.sets); tableRows.push([ formatDateForDisplay(workout.date), workout.exercise, workout.muscleGroups.join(', '), workout.sets.length, totalReps, volume.toFixed(0), maxE1RM.toFixed(1) + ' kg' ]); });
        doc.setFontSize(18); doc.text("Jurnal Antrenamente - Gym Log Pro", 14, 20); doc.setFontSize(11); doc.setTextColor(100);
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30, theme: 'grid', headStyles: { fillColor: [22, 160, 133] }, styles: { fontSize: 8, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 45 }, 2: { cellWidth: 35 }, 3: { cellWidth: 15, halign: 'center' }, 4: { cellWidth: 20, halign: 'center' }, 5: { cellWidth: 25, halign: 'right' }, 6: { cellWidth: 30, halign: 'right' } } });
        doc.save(`gym_log_pro_export_${new Date().toISOString().split('T')[0]}.pdf`); showToast('Export PDF', 'Datele exportate în PDF.', 'success');
    }

    // --- Utility Functions ---
    function formatDate(dateString) { if (!dateString) return new Date().toISOString().split('T')[0]; if (dateString instanceof Date) return dateString.toISOString().split('T')[0]; if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString; try { return new Date(dateString).toISOString().split('T')[0]; } catch (e) { return new Date().toISOString().split('T')[0]; } }
    function formatDateForDisplay(dateString) { if (!dateString) return '-'; try { const dateObj = (dateString instanceof Date) ? dateString : new Date(dateString + 'T00:00:00'); return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj); } catch (e) { console.warn("Error formatting date:", dateString, e); return dateString; } }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Workout Form
        workoutForm.addEventListener('submit', handleFormSubmit);
        addSetBtn.addEventListener('click', () => addSetRow());
        cancelEditBtn.addEventListener('click', handleCancelEdit);

        // Log History Filtering & Pagination (History Tab)
        filterDateInput.addEventListener('change', handleFilterChange);
        filterExerciseInput.addEventListener('input', debouncedFilterHandler);
        filterMuscleGroupSelect.addEventListener('change', handleFilterChange);
        clearFiltersBtn.addEventListener('click', handleClearFilters);
        // Pagination listener added dynamically

        // Bottom Navigation
        bottomNavButtons.forEach(button => {
            button.addEventListener('click', () => showTab(button.dataset.target));
        });

        // Dashboard Controls
        dashboardPeriodSelect.addEventListener('change', updateDashboard);
        progressExerciseSelectDash.addEventListener('change', handleProgressExerciseChangeDash);

        // Settings - Custom Exercises
        addNewExerciseBtnSettings.addEventListener('click', handleAddCustomExercise);
        newExerciseNameSettings.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomExercise(); } });
        // Delete listener delegated

        // Settings - Bodyweight
        bodyweightForm.addEventListener('submit', handleBodyweightSubmit);
        // Delete listener delegated

        // Settings - Data Management
        backupDataBtnSettings.addEventListener('click', handleBackupData);
        restoreFileSettings.addEventListener('change', handleRestoreData);
        exportCSVSettings.addEventListener('click', handleExportCSV);
        exportTXTSettings.addEventListener('click', handleExportTXT);
        exportPDFSettings.addEventListener('click', handleExportPDF);

        // Plan Tab - Log Exercise Button (Delegated)
        planTabContent.addEventListener('click', handleLogPlanExerciseClick);
    }

    // Handle clicking "Log" button from Plan tab
    function handleLogPlanExerciseClick(event) {
        const button = event.target.closest('.log-plan-exercise-btn');
        if (!button) return;

        const exerciseName = button.dataset.exercise;
        if (!exerciseName) return;

        // Check if exercise exists in the dropdown
        const exerciseExists = [...exerciseSelect.options].some(opt => opt.value === exerciseName);

        if (!exerciseExists) {
            showToast('Atenție', `Exercițiul "${exerciseName}" nu este în lista curentă. Adaugă-l din Setări întâi.`, 'warning');
            return;
        }

        showTab('logTabContent'); // Switch to Add tab
        resetForm(); // Start with a clean form
        exerciseSelect.value = exerciseName; // Pre-fill exercise

        // Scroll form into view and focus first set input
        logTabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstRepsInput = setsContainer.querySelector('.reps-input');
        if (firstRepsInput) {
            setTimeout(() => firstRepsInput.focus(), 150); // Slightly longer timeout
        }

        showToast('Info', `Exercițiul "${exerciseName}" pre-selectat. Completează seturile.`, 'info');
    }


    // --- Start the application ---
    initializeApp();

}); // End DOMContentLoaded