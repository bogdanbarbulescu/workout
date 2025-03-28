// app.js

document.addEventListener('DOMContentLoaded', () => {
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
    const progressExerciseSelect = document.getElementById('progressExerciseSelect');
    const liveToast = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(liveToast); // Inițializare Toast Bootstrap

    // --- State-ul Aplicației ---
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    let exercises = []; // Va fi populat din JSON și localStorage
    let customExercises = JSON.parse(localStorage.getItem('customExercises')) || [];
    let editingWorkoutId = null;
    let currentSort = { column: 'date', direction: 'desc' }; // Sortare implicită

    // --- Funcții Utilitare ---

    // Generează un ID unic simplu
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // Afișează notificări Toast
    const showToast = (title, message, type = 'info') => {
        toastTitle.textContent = title;
        toastBody.textContent = message;
        // Adaptează clasa header-ului pentru vizualizare (opțional)
        liveToast.querySelector('.toast-header').className = `toast-header bg-${type}-subtle`;
        bsToast.show();
    };

     // Validare Formular Bootstrap
     const validateForm = () => {
        let isValid = true;
        // Validare standard Bootstrap
        if (!workoutForm.checkValidity()) {
            isValid = false;
        }
        // Validare specifică: cel puțin un set
        if (setsContainer.querySelectorAll('.set-entry').length === 0) {
            setsWarning.classList.remove('d-none');
            isValid = false;
        } else {
            setsWarning.classList.add('d-none');
        }

        workoutForm.classList.add('was-validated');
        return isValid;
    };

    // Resetare formular și stare editare
    const resetForm = () => {
        workoutForm.reset();
        workoutForm.classList.remove('was-validated');
        setsContainer.innerHTML = ''; // Golește seturile
        setsWarning.classList.add('d-none');
        editingWorkoutId = null;
        editIdInput.value = '';
        formTitle.textContent = 'Adaugă Antrenament Nou';
        submitBtn.textContent = 'Adaugă Exercițiu';
        cancelEditBtn.classList.add('d-none');
        dateInput.valueAsDate = new Date(); // Setare dată curentă
    };

    // --- Încărcare și Populare Date Inițiale ---

    // Încarcă exercițiile din JSON și localStorage
    const loadExercises = () => {
        fetch('exercises.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(jsonData => {
                // Combină exercițiile din JSON cu cele custom, elimină duplicate și sortează
                const combined = [...new Set([...jsonData, ...customExercises])].sort();
                exercises = combined;
                populateExerciseSelects();
            })
            .catch(error => {
                console.error('Eroare la încărcarea fișierului exercises.json:', error);
                showToast('Eroare Fișier', 'Nu am putut încărca lista de exerciții predefinită.', 'danger');
                // Continuă cu exercițiile custom dacă există
                 exercises = [...new Set([...customExercises])].sort();
                 populateExerciseSelects();
            });
    };

    // Populează dropdown-urile de exerciții
    const populateExerciseSelects = () => {
        // Selectul din formular
        exerciseSelect.innerHTML = '<option value="" selected disabled>Alegeți...</option>'; // Resetare
        exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            exerciseSelect.appendChild(option);
        });

        // Selectul pentru graficul de progres
        progressExerciseSelect.innerHTML = '<option value="">Alege un exercițiu pentru graficul de progres...</option>'; // Resetare
         // Folosim doar exercițiile care apar în workouts
         const exercisesInLog = [...new Set(workouts.map(w => w.exercise))].sort();
        exercisesInLog.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            progressExerciseSelect.appendChild(option);
        });
    };

    // --- Funcționalitate Seturi Dinamice ---

    // Creează input-urile pentru un set nou
    const createSetEntry = (reps = '', weight = '') => {
        const setDiv = document.createElement('div');
        setDiv.className = 'input-group set-entry';
        setDiv.innerHTML = `
            <span class="input-group-text">Set</span>
            <input type="number" class="form-control reps-input" placeholder="Repetări" min="1" value="${reps}" required>
            <span class="input-group-text">@</span>
            <input type="number" class="form-control weight-input" placeholder="Greutate (kg)" min="0" step="0.5" value="${weight}" required>
            <span class="input-group-text">kg</span>
            <button type="button" class="btn btn-danger btn-sm remove-set-btn">×</button>
        `;
        setsContainer.appendChild(setDiv);
        setsWarning.classList.add('d-none'); // Ascunde warning-ul la adăugare

        // Adaugă event listener pentru butonul de ștergere
        setDiv.querySelector('.remove-set-btn').addEventListener('click', () => {
            setDiv.remove();
             // Arată warning dacă nu mai sunt seturi
            if (setsContainer.querySelectorAll('.set-entry').length === 0) {
               setsWarning.classList.remove('d-none');
            }
        });
    };

    // Event listener pentru butonul "Adaugă Set"
    addSetBtn.addEventListener('click', () => createSetEntry());

    // --- CRUD Operații (Create, Read, Update, Delete) ---

    // Salvează workouts în localStorage
    const saveWorkouts = () => {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    };

    // Salvează exercițiile custom în localStorage
    const saveCustomExercises = () => {
        localStorage.setItem('customExercises', JSON.stringify(customExercises));
    };

     // Adaugă/Actualizează un workout
     workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Oprește propagarea pentru validare

        if (!validateForm()) {
             showToast('Eroare Formular', 'Vă rugăm corectați câmpurile marcate.', 'warning');
            return;
        }

        const setsData = [];
        setsContainer.querySelectorAll('.set-entry').forEach(setDiv => {
            const reps = parseInt(setDiv.querySelector('.reps-input').value, 10);
            const weight = parseFloat(setDiv.querySelector('.weight-input').value) || 0;
             if (!isNaN(reps) && reps > 0) { // Verificare simplă
                setsData.push({ reps, weight });
            }
        });

         // Verificăm dacă s-au adăugat date valide pentru seturi
         if (setsData.length === 0 && setsContainer.querySelectorAll('.set-entry').length > 0) {
             showToast('Eroare Seturi', 'Introduceți valori valide pentru repetări în seturi.', 'warning');
             // Marchează inputurile goale din seturi ca invalide (opțional)
             setsContainer.querySelectorAll('.set-entry').forEach(setDiv => {
                const repsInput = setDiv.querySelector('.reps-input');
                if (!repsInput.value || parseInt(repsInput.value, 10) <= 0) {
                    repsInput.classList.add('is-invalid');
                } else {
                     repsInput.classList.remove('is-invalid');
                }
             });
             return;
         } else if (setsData.length === 0) {
              setsWarning.classList.remove('d-none'); // Arată warning-ul dacă nu există seturi deloc
              showToast('Eroare Seturi', 'Adăugați cel puțin un set valid.', 'warning');
              return;
         }


        const workoutData = {
            id: editingWorkoutId || generateId(), // Folosește ID existent sau generează unul nou
            date: dateInput.value,
            type: typeInput.value.trim(),
            exercise: exerciseSelect.value,
            sets: setsData,
            notes: notesInput.value.trim()
        };

        if (editingWorkoutId) {
            // Actualizează intrarea existentă
            const index = workouts.findIndex(w => w.id === editingWorkoutId);
            if (index > -1) {
                workouts[index] = workoutData;
                showToast('Succes', 'Antrenamentul a fost actualizat.', 'success');
            }
        } else {
            // Adaugă intrare nouă
            workouts.push(workoutData);
            showToast('Succes', 'Antrenamentul a fost adăugat.', 'success');
        }

        saveWorkouts();
        resetForm();
        renderTable();
        updateCharts();
        populateExerciseSelects(); // Re-populează selectul de progres în caz că s-a adăugat primul ex. de un tip
    });

    // Anulează modul de editare
    cancelEditBtn.addEventListener('click', resetForm);

    // Funcție pentru a popula formularul pentru editare
    const editWorkout = (id) => {
        const workout = workouts.find(w => w.id === id);
        if (!workout) return;

        editingWorkoutId = id;
        editIdInput.value = id;
        dateInput.value = workout.date;
        typeInput.value = workout.type;
        exerciseSelect.value = workout.exercise;
        notesInput.value = workout.notes;

        // Populează seturile
        setsContainer.innerHTML = ''; // Golește seturile existente în formular
        workout.sets.forEach(set => createSetEntry(set.reps, set.weight));

        formTitle.textContent = 'Editează Antrenament';
        submitBtn.textContent = 'Actualizează Exercițiu';
        cancelEditBtn.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll sus la formular
    };

    // Funcție pentru a șterge un workout
    const deleteWorkout = (id) => {
        if (confirm('Sunteți sigur că doriți să ștergeți această intrare?')) {
            workouts = workouts.filter(w => w.id !== id);
            saveWorkouts();
            renderTable();
            updateCharts();
            populateExerciseSelects(); // Re-populează selectul de progres
            showToast('Șters', 'Intrarea a fost ștearsă.', 'info');
             // Dacă eram în modul editare pentru elementul șters, resetăm formularul
            if (editingWorkoutId === id) {
                resetForm();
            }
        }
    };

     // Adaugă un exercițiu nou la lista custom
     addNewExerciseBtn.addEventListener('click', () => {
        const newExName = newExerciseNameInput.value.trim();
        if (newExName && !exercises.includes(newExName)) {
            customExercises.push(newExName);
            exercises.push(newExName);
            exercises.sort(); // Menține lista sortată
            saveCustomExercises();
            populateExerciseSelects(); // Actualizează dropdown-urile
            newExerciseNameInput.value = ''; // Golește inputul
            showToast('Exercițiu Adăugat', `"${newExName}" a fost adăugat în listă.`, 'success');
        } else if (exercises.includes(newExName)) {
             showToast('Existent', `Exercițiul "${newExName}" este deja în listă.`, 'warning');
        } else {
             showToast('Invalid', 'Introduceți un nume valid pentru exercițiu.', 'warning');
        }
    });

    // --- Redare Tabel și Filtrare/Sortare ---

    // Calculează date agregate pentru tabel
    const calculateWorkoutStats = (workout) => {
        const stats = {
            setCount: workout.sets.length,
            repsMin: Infinity,
            repsMax: -Infinity,
            weightMin: Infinity,
            weightMax: -Infinity,
            totalVolume: 0,
        };

        if (stats.setCount === 0) {
             return { ...stats, repsMin: '-', repsMax: '-', weightMin: '-', weightMax: '-' };
        }

        workout.sets.forEach(set => {
            stats.repsMin = Math.min(stats.repsMin, set.reps);
            stats.repsMax = Math.max(stats.repsMax, set.reps);
            stats.weightMin = Math.min(stats.weightMin, set.weight);
            stats.weightMax = Math.max(stats.weightMax, set.weight);
            stats.totalVolume += (set.reps || 0) * (set.weight || 0);
        });

         // Formatare output
         stats.repsDisplay = stats.repsMin === stats.repsMax ? `${stats.repsMin}` : `${stats.repsMin}-${stats.repsMax}`;
         stats.weightDisplay = stats.weightMin === stats.weightMax ? `${stats.weightMax.toFixed(1)}` : `${stats.weightMin.toFixed(1)}-${stats.weightMax.toFixed(1)}`;
         stats.totalVolume = stats.totalVolume.toFixed(1);


        return stats;
    };


    // Redă tabelul cu datele filtrate și sortate
    const renderTable = () => {
        workoutTableBody.innerHTML = ''; // Golește tabelul

        // 1. Filtrare
        const dateFilter = filterDate.value;
        const typeFilter = filterType.value.toLowerCase();
        const exerciseFilter = filterExercise.value.toLowerCase();

        let filteredWorkouts = workouts.filter(w => {
            const matchDate = !dateFilter || w.date === dateFilter;
            const matchType = !typeFilter || w.type.toLowerCase().includes(typeFilter);
            const matchExercise = !exerciseFilter || w.exercise.toLowerCase().includes(exerciseFilter);
            return matchDate && matchType && matchExercise;
        });

        // 2. Sortare
        filteredWorkouts.sort((a, b) => {
            let valA, valB;
            const col = currentSort.column;

            // Extrage valorile pentru sortare
             if (col === 'volume') {
                 valA = calculateWorkoutStats(a).totalVolume;
                 valB = calculateWorkoutStats(b).totalVolume;
            } else if (col === 'sets') {
                valA = a.sets.length;
                valB = b.sets.length;
             } else {
                valA = a[col];
                valB = b[col];
            }

             // Tratare numerică/string/dată
             let comparison = 0;
             if (typeof valA === 'number' && typeof valB === 'number') {
                 comparison = valA - valB;
             } else if (valA instanceof Date && valB instanceof Date) {
                 comparison = valA - valB; // Pentru date (deși sunt stringuri acum)
            } else if (col === 'date') { // Sortare corectă date ca string YYYY-MM-DD
                comparison = valA.localeCompare(valB);
             }
              else {
                 // Fallback la comparare de string-uri
                 valA = String(valA).toLowerCase();
                 valB = String(valB).toLowerCase();
                 comparison = valA.localeCompare(valB);
             }


            return currentSort.direction === 'asc' ? comparison : -comparison;
        });

        // 3. Afișare
        if (filteredWorkouts.length === 0) {
            noDataMessage.classList.remove('d-none');
        } else {
            noDataMessage.classList.add('d-none');
            filteredWorkouts.forEach(w => {
                const stats = calculateWorkoutStats(w);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${w.date}</td>
                    <td>${w.type}</td>
                    <td>${w.exercise}</td>
                    <td>${stats.setCount}</td>
                    <td>${stats.repsDisplay}</td>
                    <td>${stats.weightDisplay}</td>
                    <td>${stats.totalVolume}</td>
                    <td>${w.notes || '-'}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${w.id}" title="Editează">✏️</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${w.id}" title="Șterge">🗑️</button>
                    </td>
                `;
                // Adaugă event listeners pentru butoanele edit/delete
                tr.querySelector('.edit-btn').addEventListener('click', (e) => editWorkout(e.target.closest('button').dataset.id));
                tr.querySelector('.delete-btn').addEventListener('click', (e) => deleteWorkout(e.target.closest('button').dataset.id));

                workoutTableBody.appendChild(tr);
            });
        }
        updateSortIcons();
    };

    // Actualizează iconițele de sortare din headere
    const updateSortIcons = () => {
        tableHeaders.forEach(th => {
            const icon = th.querySelector('.sort-icon');
            if (!icon) return;
            const column = th.dataset.column;
            icon.textContent = '↕️'; // Reset
            icon.classList.remove('active');
            if (column === currentSort.column) {
                icon.textContent = currentSort.direction === 'asc' ? '🔼' : '🔽';
                icon.classList.add('active');
            }
        });
    };

    // Event listeners pentru filtre
    filterDate.addEventListener('input', renderTable);
    filterType.addEventListener('input', renderTable);
    filterExercise.addEventListener('input', renderTable);
    clearFiltersBtn.addEventListener('click', () => {
        filterDate.value = '';
        filterType.value = '';
        filterExercise.value = '';
        renderTable();
    });

    // Event listeners pentru sortare (click pe header)
    tableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            if (!column) return; // Nu sorta coloane fără data-column

            if (currentSort.column === column) {
                // Inversează direcția dacă se dă click pe aceeași coloană
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                // Sortează după coloană nouă, implicit descendent (sau ascendent pentru nume/tip)
                 currentSort.column = column;
                 // Poți seta o direcție implicită diferită pentru anum
