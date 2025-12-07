// ============================================
// REGISTRATION FORM LOGIC
// Cooperativa Provivienda "Mi Esperanza"
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Translate page
    i18n.translatePage();

    // Initialize urgency slider
    const urgencySlider = document.getElementById('urgencyLevel');
    const urgencyValue = document.getElementById('urgencyValue');

    urgencySlider.addEventListener('input', function () {
        urgencyValue.textContent = this.value;
    });

    // Initialize household members
    const householdCountInput = document.getElementById('householdCount');
    householdCountInput.addEventListener('input', updateHouseholdMembers);

    // Initialize with 1 member
    updateHouseholdMembers();

    // Form submission
    const form = document.getElementById('registrationForm');
    form.addEventListener('submit', handleSubmit);
});

// ============================================
// HOUSEHOLD MEMBERS MANAGEMENT
// ============================================

function updateHouseholdMembers() {
    const count = parseInt(document.getElementById('householdCount').value) || 1;
    const container = document.getElementById('householdMembersContainer');

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'card';
        memberDiv.style.background = 'var(--color-secondary)';
        memberDiv.style.padding = 'var(--spacing-md)';
        memberDiv.style.marginBottom = 'var(--spacing-sm)';

        memberDiv.innerHTML = `
      <h4 style="margin-bottom: var(--spacing-sm);">${i18n.t('memberName')} ${i + 1}</h4>
      
      <div class="form-group">
        <label class="form-label required" data-i18n="memberName">${i18n.t('memberName')}</label>
        <input type="text" class="form-input member-name" data-index="${i}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label required" data-i18n="memberLastName">${i18n.t('memberLastName')}</label>
        <input type="text" class="form-input member-lastname" data-index="${i}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label required" data-i18n="memberAge">${i18n.t('memberAge')}</label>
        <input type="number" class="form-input member-age" data-index="${i}" min="0" max="120" required>
      </div>
    `;

        container.appendChild(memberDiv);
    }
}

// ============================================
// FORM VALIDATION
// ============================================

function validateForm() {
    let isValid = true;
    const form = document.getElementById('registrationForm');

    // Clear previous errors
    clearAllErrors(form);

    // Validate name
    const name = document.getElementById('nombre');
    if (!name || !validateRequired(name.value)) {
        if (name) showError(name, i18n.t('required'));
        isValid = false;
    }

    // Validate last name
    const lastName = document.getElementById('apellido');
    if (!lastName || !validateRequired(lastName.value)) {
        if (lastName) showError(lastName, i18n.t('required'));
        isValid = false;
    }

    // Validate age
    const age = document.getElementById('edad');
    if (!age || !validateRequired(age.value)) {
        if (age) showError(age, i18n.t('required'));
        isValid = false;
    }

    // Validate city
    const city = document.getElementById('city');
    if (!validateRequired(city.value)) {
        showError(city, i18n.t('required'));
        isValid = false;
    }

    // Validate country
    const country = document.getElementById('country');
    if (!validateRequired(country.value)) {
        showError(country, i18n.t('required'));
        isValid = false;
    }

    // Validate phone
    const phone = document.getElementById('phone');
    if (!validateRequired(phone.value)) {
        showError(phone, i18n.t('required'));
        isValid = false;
    } else if (!validatePhone(phone.value)) {
        showError(phone, i18n.t('invalidPhone'));
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email');
    if (!validateRequired(email.value)) {
        showError(email, i18n.t('required'));
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, i18n.t('invalidEmail'));
        isValid = false;
    }

    // Validate employment status
    const employmentStatus = document.getElementById('employmentStatus');
    if (!validateRequired(employmentStatus.value)) {
        showError(employmentStatus, i18n.t('required'));
        isValid = false;
    }

    // Validate housing type
    const housingType = document.getElementById('housingType');
    if (!validateRequired(housingType.value)) {
        showError(housingType, i18n.t('required'));
        isValid = false;
    }

    // Validate household count
    const householdCount = document.getElementById('householdCount');
    if (!validateNumber(householdCount.value, 1)) {
        showError(householdCount, i18n.t('minMembers'));
        isValid = false;
    }

    // Validate household members
    const memberNames = document.querySelectorAll('.member-name');
    const memberLastnames = document.querySelectorAll('.member-lastname');
    const memberAges = document.querySelectorAll('.member-age');

    memberNames.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, i18n.t('required'));
            isValid = false;
        }
    });

    memberLastnames.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, i18n.t('required'));
            isValid = false;
        }
    });

    memberAges.forEach((input, index) => {
        if (!validateNumber(input.value, 0, 120)) {
            showError(input, i18n.t('required'));
            isValid = false;
        }
    });

    return isValid;
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleSubmit(event) {
    event.preventDefault();

    // Get submit button and save original state
    const submitBtn = document.getElementById('btnEnviar');
    if (!submitBtn) {
        console.error('Botón btnEnviar no encontrado');
        return;
    }

    const originalText = submitBtn.innerHTML;
    const originalDisabled = submitBtn.disabled;

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-round spinner">sync</span> Enviando...';

    try {
        // Prepare payload for Cloudflare Worker (exact format required)
        const workerPayload = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            edad: document.getElementById('edad').value.trim(),
            info: document.getElementById('info').value.trim() || '',
            timestamp: Date.now()
        };

        // Validate payload has required fields
        if (!workerPayload.nombre || !workerPayload.apellido || !workerPayload.edad) {
            throw new Error('Faltan campos requeridos');
        }

        // Send to Cloudflare Worker
        console.log('Enviando datos al Worker:', workerPayload);
        
        const response = await fetch('https://rough-lake-0310.cacero1018.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workerPayload)
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse response
        const data = await response.json();
        console.log('Respuesta del Worker:', data);

        // Check if Worker returned ok: true
        if (data.ok === true) {
            // Success - show alert and reset form
            alert('Registro completado ✔️');
            showAlert('Registro completado con éxito ✔️', 'success');
            document.getElementById('registrationForm').reset();
            
            // Navigate after short delay
            setTimeout(() => {
                navigateTo('index.html');
            }, 2000);
        } else {
            throw new Error('Worker no devolvió ok: true');
        }

    } catch (error) {
        // Error handling
        console.error('Error al enviar al Worker:', error);
        alert('Error al registrar ❌\n' + error.message);
        showAlert('Error al registrar. Verifique su conexión. ❌', 'error');
        
        // Restore button state
        submitBtn.disabled = originalDisabled;
        submitBtn.innerHTML = originalText;
    }
}

