// app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Strict Mode ---
    'use strict';

    // --- Selectoare DOM Globale ---
    const workoutForm = document.getElementById('workoutForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editIdInput = document.getElementById('editId');
    const dateInput = document.getElementById('date');
    const typeInput = document.getElementById('type');
    const exerciseSelect = document.getElementById('exercise');
    const setsContainer = document.getElementById('setsContainer');
    const addSetBtn = document.getElementById('addSetBtn');
    const notesInput = document.getElementById('notes');
    const setsWarning = document.getElementById('setsWarning');
    const workoutTableBody = document.querySelector('#workoutTable tbody');
    const noDataMessage = document.getElementById('noDataMessage');
    const filterDate = document.getElementById('filterDate');
    const filterType = document.getElementById('filterType');
    const filterExercise = document.getElementById('filterExercise');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const tableHeaders = document.querySelectorAll('#workoutTable thead th[data-column]');
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportTXTBtn = document.getElementById('exportTXT');
    const exportPDFBtn = document.getElementById('exportPDF');
    const newExerciseNameInput = document.getElementById('newExerciseName');
    const addNewExerciseBtn = document.getElementById('addNewExerciseBtn');
    const existingExercisesList = document.getElementById('existingExercisesList'); // For listing exercises
    const progressExerciseSelect = document.getElementById('progressExerciseSelect');
    const liveToastEl = document.getElementById('liveToast'); // Renamed variable
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(liveToastEl, { delay: 3000 }); // Auto-hide after 3s

    // --- State-ul Aplicației ---
    let workouts = [];
    let exercises = []; // Va fi populat din JSON și localStorage
    let customExercises = [];
    let editingWorkoutId = null;
    let currentSort = { column: 'date', direction: 'desc' }; // Sortare implicită
    let d3Tooltip = null; // To hold the D3 tooltip element

    // --- Funcții Utilitare ---

    // Generează un ID unic simplu
    const generateId = () => '_' + Math.random().toString(36).substring(2, 9);

    // Afișează notificări Toast
    const showToast = (title, message, type = 'info') => {
        toastTitle.textContent = title;
        toastBody.textContent = message;
        // Set header color based on type using Bootstrap text/bg utilities
        const header = liveToastEl.querySelector('.toast-header');
        header.className = 'toast-header'; // Reset classes
        switch(type) {
            case 'success': header.classList.add('text-bg-success'); break;
            case 'danger': header.classList.add('text-bg-danger'); break;
            case 'warning': header.classList.add('text-bg-warning'); break;
            case 'info': default: header.classList.add('text-bg-info'); break;
        }
        bsToast.show();
    };

     // Validare Formular Bootstrap și seturi
     const validateForm = () => {
        let isValid = workoutForm.checkValidity(); // Check basic HTML5 validation

        // Custom validation: Check if at least one valid set exists
        const setEntries = setsContainer.querySelectorAll('.set-entry');
        let validSetsCount = 0;
        if (setEntries.length === 0) {
            isValid = false;
            setsWarning.classList.remove('d-none');
        } else {
            setEntries.forEach(setDiv => {
                const repsInput = setDiv.querySelector('.reps-input');
                const weightInput = setDiv.querySelector('.weight-input');
                const reps = parseInt(repsInput.value, 10);
                const weight = parseFloat(weightInput.value); // Allow 0 weight

                // Check if reps is a positive number and weight is a non-negative number
                if (reps > 0 && !isNaN(reps) && weight >= 0 && !isNaN(weight)) {
                    validSetsCount++;
                     repsInput.classList.remove('is-invalid'); // Mark as valid if checks pass
                     weightInput.classList.remove('is-invalid');
                } else {
                    // Mark specific invalid fields
                    if (isNaN(reps) || reps <= 0) repsInput.classList.add('is-invalid'); else repsInput.classList.remove('is-invalid');
                    if (isNaN(weight) || weight < 0) weightInput.classList.add('is-invalid'); else weightInput.classList.remove('is-invalid');
                }
            });

            if (validSetsCount === 0) {
                 isValid = false; // No valid sets found
                 setsWarning.textContent = 'Introduceți valori valide (Repetări > 0, Greutate >= 0) în cel puțin un set.';
                 setsWarning.classList.remove('d-none');
            } else {
                 setsWarning.classList.add('d-none'); // Hide warning if at least one set is valid
            }
        }

        workoutForm.classList.add('was-validated'); // Trigger Bootstrap visual feedback
        return isValid;
    };

    // Resetare formular și stare editare
    const resetForm = () => {
        workoutForm.reset();
        workoutForm.classList.remove('was-validated');
        setsContainer.innerHTML = '';
        setsWarning.classList.add('d-none');
        setsWarning.textContent = 'Adăugați cel puțin un set valid.'; // Reset warning text
         // Remove potential invalid states from set inputs if any remain visually
        setsContainer.querySelectorAll('input').forEach(input => input.classList.remove('is-invalid'));
        editingWorkoutId = null;
        editIdInput.value = '';
        formTitle.textContent = 'Adaugă Exercițiu Nou';
        submitBtn.textContent = 'Adaugă Exercițiu';
        cancelEditBtn.classList.add('d-none');
        dateInput.valueAsDate = new Date(); // Setare dată curentă
        // Scroll to top smoothly
        // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: disable if jarring
    };

    // --- Încărcare și Populare Date Inițiale ---

     // Încarcă datele din localStorage
    const loadData = () => {
        try {
            workouts = JSON.parse(localStorage.getItem('workouts')) || [];
            // Basic validation: ensure it's an array
            if (!Array.isArray(workouts)) workouts = [];
            // Further validation could be added here to check object structure if needed

            customExercises = JSON.parse(localStorage.getItem('customExercises')) || [];
             if (!Array.isArray(customExercises)) customExercises = [];

        } catch (e) {
            console.error("Eroare la parsarea datelor din localStorage:", e);
            showToast('Eroare Date', 'Nu am putut încărca datele salvate. Se folosește o listă goală.', 'danger');
            workouts = [];
            customExercises = [];
            // Optionally clear corrupted storage
            // localStorage.removeItem('workouts');
            // localStorage.removeItem('customExercises');
        }
    };

    // Încarcă exercițiile din JSON și combină cu cele custom
    const loadAndCombineExercises = async () => {
        let baseExercises = [];
        try {
            const response = await fetch('exercises.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            baseExercises = await response.json();
             if (!Array.isArray(baseExercises)) baseExercises = []; // Basic validation
        } catch (error) {
            console.error('Eroare la încărcarea fișierului exercises.json:', error);
            showToast('Atenție', 'Nu am putut încărca lista de exerciții predefinită.', 'warning');
        }
        // Combină, elimină duplicate, sortează
        exercises = [...new Set([...baseExercises, ...customExercises])].sort((a, b) => a.localeCompare(b));
        populateExerciseSelects();
        renderExistingExercisesList(); // Update the list in the accordion
    };

    // Populează dropdown-urile de exerciții
    const populateExerciseSelects = () => {
        const currentExerciseVal = exerciseSelect.value;
        const currentProgressVal = progressExerciseSelect.value;

        // Selectul din formular
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>';
        exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            exerciseSelect.appendChild(option);
        });
         // Restore selected value if it still exists
        if (exercises.includes(currentExerciseVal)) {
            exerciseSelect.value = currentExerciseVal;
        }


        // Selectul pentru graficul de progres (folosind exerciții din log)
        const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].sort((a, b) => a.localeCompare(b));
        progressExerciseSelect.innerHTML = '<option value="">Alege un exercițiu pentru grafic...</option>';
        exercisesInLog.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            progressExerciseSelect.appendChild(option);
        });
         // Restore selected value if it still exists
        if (exercisesInLog.includes(currentProgressVal)) {
            progressExerciseSelect.value = currentProgressVal;
        }
    };

     // Afișează lista de exerciții în acordeon
    const renderExistingExercisesList = () => {
        existingExercisesList.innerHTML = ''; // Clear list
        if (exercises.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'Nu există exerciții în listă.';
            existingExercisesList.appendChild(li);
            return;
        }
        exercises.forEach(ex => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.textContent = ex;
             // Adaugă buton de ștergere doar pentru exercițiile custom
             if (customExercises.includes(ex)) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-danger btn-sm py-0 px-1'; // Smaller delete button
                deleteBtn.innerHTML = '×'; // Use '×' symbol
                deleteBtn.title = `Șterge "${ex}"`;
                deleteBtn.onclick = () => deleteCustomExercise(ex); // Attach delete handler
                li.appendChild(deleteBtn);
            }
            existingExercisesList.appendChild(li);
        });
    };

    // --- Funcționalitate Seturi Dinamice ---

    // Creează input-urile pentru un set nou
    const createSetEntry = (reps = '', weight = '') => {
        const setDiv = document.createElement('div');
        setDiv.className = 'input-group input-group-sm set-entry'; // Use input-group-sm
        setDiv.innerHTML = `
            <span class="input-group-text">Set</span>
            <input type="number" class="form-control reps-input" placeholder="Repetări" min="1" step="1" value="${reps}" required aria-label="Repetări">
            <span class="input-group-text">@</span>
            <input type="number" class="form-control weight-input" placeholder="Greutate (kg)" min="0" step="0.25" value="${weight}" required aria-label="Greutate">
            <span class="input-group-text">kg</span>
            <button type="button" class="btn btn-outline-danger remove-set-btn" title="Șterge Set">×</button>
        `;
        setsContainer.appendChild(setDiv);
        setsWarning.classList.add('d-none'); // Ascunde warning-ul la adăugare

        // Adaugă event listener pentru butonul de ștergere (using event delegation might be better, but this works for now)
        setDiv.querySelector('.remove-set-btn').addEventListener('click', (e) => {
             e.target.closest('.set-entry').remove();
             // Arată warning dacă nu mai sunt seturi
            if (setsContainer.querySelectorAll('.set-entry').length === 0) {
               setsWarning.classList.remove('d-none');
            }
        });
         // Focus pe inputul de repetări al noului set
         const firstInput = setDiv.querySelector('.reps-input');
         if(firstInput) firstInput.focus();
    };

    // Event listener pentru butonul "Adaugă Set"
    addSetBtn.addEventListener('click', () => createSetEntry());

    // --- CRUD Operații & Salvare Date ---

    // Salvează workouts în localStorage
    const saveWorkouts = () => {
        try {
            localStorage.setItem('workouts', JSON.stringify(workouts));
        } catch (e) {
            console.error("Eroare la salvarea workouts în localStorage:", e);
            showToast('Eroare Salvare', 'Nu am putut salva antrenamentele.', 'danger');
        }
    };

    // Salvează exercițiile custom în localStorage
    const saveCustomExercises = () => {
         try {
            localStorage.setItem('customExercises', JSON.stringify(customExercises));
        } catch (e) {
            console.error("Eroare la salvarea exercițiilor custom în localStorage:", e);
            showToast('Eroare Salvare', 'Nu am putut salva lista de exerciții.', 'danger');
        }
    };

     // Adaugă/Actualizează un workout
     workoutForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        e.stopPropagation();

        if (!validateForm()) { // Validate using our enhanced function
             showToast('Eroare Formular', 'Vă rugăm corectați câmpurile marcate și adăugați seturi valide.', 'warning');
            return;
        }

        const setsData = [];
        setsContainer.querySelectorAll('.set-entry').forEach(setDiv => {
            // Parse values rigorously
            const reps = parseInt(setDiv.querySelector('.reps-input').value, 10);
            const weight = parseFloat(setDiv.querySelector('.weight-input').value);

             // Only add if valid according to our rules (reps>0, weight>=0)
             if (reps > 0 && !isNaN(reps) && weight >= 0 && !isNaN(weight)) {
                setsData.push({ reps, weight });
            }
        });

         // Double-check if any valid sets were actually collected (should be covered by validateForm, but good practice)
         if (setsData.length === 0) {
             showToast('Eroare Seturi', 'Nu s-au găsit seturi cu valori valide.', 'warning');
             setsWarning.classList.remove('d-none');
             return;
         }

        // Sanitize inputs
        const typeValue = typeInput.value.trim();
        const notesValue = notesInput.value.trim();

        const workoutData = {
            id: editingWorkoutId || generateId(), // Use existing ID or generate new one
            date: dateInput.value, // Already in YYYY-MM-DD format
            type: typeValue,
            exercise: exerciseSelect.value, // Value from select
            sets: setsData,
            notes: notesValue
        };

        if (editingWorkoutId) {
            // Update existing workout
            const index = workouts.findIndex(w => w.id === editingWorkoutId);
            if (index > -1) {
                workouts[index] = workoutData;
                showToast('Succes', `Antrenamentul pentru ${workoutData.exercise} a fost actualizat.`, 'success');
            } else {
                 console.error(`Workout with ID ${editingWorkoutId} not found for update.`);
                 showToast('Eroare', 'Nu am găsit antrenamentul pentru actualizare.', 'danger');
                 // Optionally add it as new if not found? Or just reset form.
                 editingWorkoutId = null; // Reset editing state
            }
        } else {
            // Add new workout
            workouts.push(workoutData);
            showToast('Succes', `Antrenamentul pentru ${workoutData.exercise} a fost adăugat.`, 'success');
        }

        saveWorkouts();
        resetForm(); // Reset form fields and state
        refreshUI(); // Update table, charts, and selects
    });

    // Anulează modul de editare
    cancelEditBtn.addEventListener('click', resetForm);

    // Funcție pentru a popula formularul pentru editare
    const editWorkout = (id) => {
        const workout = workouts.find(w => w.id === id);
        if (!workout) {
             console.error(`Workout with ID ${id} not found for editing.`);
             showToast('Eroare', 'Antrenamentul selectat nu a fost găsit.', 'danger');
            return;
            }

        editingWorkoutId = id;
        editIdInput.value = id;
        dateInput.value = workout.date;
        typeInput.value = workout.type;
        exerciseSelect.value = workout.exercise; // Ensure this exercise exists in the select!
        notesInput.value = workout.notes;

        // Populează seturile
        setsContainer.innerHTML = ''; // Clear existing sets in form
        workout.sets.forEach(set => createSetEntry(set.reps, set.weight));
        if (workout.sets.length === 0) { // Show warning if editing an entry with no sets somehow
            setsWarning.classList.remove('d-none');
        } else {
            setsWarning.classList.add('d-none');
        }

        formTitle.textContent = `Editează: ${workout.exercise} (${workout.date})`;
        submitBtn.textContent = 'Actualizează Exercițiu';
        cancelEditBtn.classList.remove('d-none');
        workoutForm.classList.remove('was-validated'); // Remove validation state on load
        // Scroll form into view
         workoutForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Funcție pentru a șterge un workout (event listener added in renderTable)
    const deleteWorkout = (id) => {
        const workoutToDelete = workouts.find(w => w.id === id);
         if (!workoutToDelete) {
             showToast('Eroare', 'Antrenamentul selectat pentru ștergere nu a fost găsit.', 'danger');
             return;
         }

        if (confirm(`Sunteți sigur că doriți să ștergeți intrarea pentru ${workoutToDelete.exercise} din data de ${workoutToDelete.date}?`)) {
            workouts = workouts.filter(w => w.id !== id);
            saveWorkouts();
             // Dacă elementul șters era în curs de editare, resetează formularul
            if (editingWorkoutId === id) {
                resetForm();
            }
            showToast('Șters', 'Intrarea a fost ștearsă.', 'info');
            refreshUI(); // Update table, charts, selects
        }
    };

     // Adaugă un exercițiu nou la lista custom
     addNewExerciseBtn.addEventListener('click', () => {
        const newExName = newExerciseNameInput.value.trim();
        if (newExName && !exercises.some(ex => ex.toLowerCase() === newExName.toLowerCase())) { // Case-insensitive check
            customExercises.push(newExName);
            customExercises.sort((a, b) => a.localeCompare(b)); // Keep custom list sorted too
            saveCustomExercises();
            exercises = [...new Set([...exercises, newExName])].sort((a, b) => a.localeCompare(b)); // Update main list
            populateExerciseSelects(); // Actualizează dropdown-urile
            renderExistingExercisesList(); // Update the list in the accordion
            newExerciseNameInput.value = ''; // Golește inputul
            showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat în lis
