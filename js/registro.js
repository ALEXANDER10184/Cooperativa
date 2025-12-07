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
    const name = document.getElementById('name');
    if (!validateRequired(name.value)) {
        showError(name, i18n.t('required'));
        isValid = false;
    }

    // Validate last name
    const lastName = document.getElementById('lastName');
    if (!validateRequired(lastName.value)) {
        showError(lastName, i18n.t('required'));
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

function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Collect form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        employmentStatus: document.getElementById('employmentStatus').value,
        housingType: document.getElementById('housingType').value,
        urgencyLevel: document.getElementById('urgencyLevel').value,
        householdCount: document.getElementById('householdCount').value,
        additionalInfo: document.getElementById('additionalInfo').value.trim(),
        registrationDate: new Date().toISOString(),
        status: 'pending', // pending, active, rejected
        householdMembers: []
    };

    // 2. Collect Household Members
    const memberNames = document.querySelectorAll('.member-name');
    const memberLastnames = document.querySelectorAll('.member-lastname');
    const memberAges = document.querySelectorAll('.member-age');

    for (let i = 0; i < memberNames.length; i++) {
        formData.householdMembers.push({
            name: memberNames[i].value.trim(),
            lastName: memberLastnames[i].value.trim(),
            age: parseInt(memberAges[i].value)
        });
    }

    // 3. Prepare data for Cloudflare Worker
    const workerPayload = {
        nombre: formData.name,
        apellido: formData.lastName,
        edad: formData.householdMembers.length > 0 ? formData.householdMembers[0].age : 0,
        info: formData.additionalInfo || '',
        timestamp: Date.now()
    };

    // 4. Save to Firebase and Cloudflare Worker
    const submitBtn = document.getElementById('btnEnviar');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-round spinner">sync</span> Enviando...';

    // Send to Cloudflare Worker
    const workerPromise = fetch('https://rough-lake-0310.cacero1018.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerPayload)
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                console.log('Registro enviado a Cloudflare Worker exitosamente');
            } else {
                console.warn('Worker respondió pero sin ok:true');
            }
        })
        .catch(error => {
            console.error('Error al enviar a Cloudflare Worker:', error);
        });

    // Save to Firebase (if configured)
    const firebasePromise = pushData('socios', formData)
        .catch(error => {
            console.error('Error al guardar en Firebase:', error);
        });

    // Wait for both operations
    Promise.all([workerPromise, firebasePromise])
        .then(() => {
            showAlert(i18n.t('registrationSuccess') || 'Registro completado con éxito ✔️', 'success');
            document.getElementById('registrationForm').reset();
            setTimeout(() => {
                navigateTo('index.html');
            }, 2000);
        })
        .catch(error => {
            console.error(error);
            showAlert('Error al registrar. Verifique su conexión. ❌', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
}

