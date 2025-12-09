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
// VALIDATION HELPERS
// ============================================

/**
 * Valida que un campo no esté vacío
 */
function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Valida un email
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida un teléfono (mínimo 9 dígitos)
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{9,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida un número en un rango
 */
function validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

/**
 * Muestra un error en un campo del formulario
 */
function showError(input, message) {
    if (!input) return;
    
    // Remover error anterior si existe
    clearError(input);
    
    // Agregar clase de error
    input.classList.add('error');
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
    
    // Insertar después del input
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

/**
 * Limpia el error de un campo
 */
function clearError(input) {
    if (!input) return;
    
    input.classList.remove('error');
    
    // Remover mensaje de error si existe
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * Limpia todos los errores de un formulario
 */
function clearAllErrors(form) {
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => clearError(input));
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

    // Get submit button
    const btnEnviar = document.getElementById('btnEnviar');
    if (!btnEnviar) {
        console.error('Botón btnEnviar no encontrado');
        return;
    }

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Get form values
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const edad = parseInt(document.getElementById('edad').value) || 0;
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const aporteMensual = parseFloat(document.getElementById('aporteMensual').value) || 0;
    const employmentStatus = document.getElementById('employmentStatus').value;
    const housingType = document.getElementById('housingType').value;
    const urgencyLevel = parseInt(document.getElementById('urgencyLevel').value) || 3;
    const householdCount = parseInt(document.getElementById('householdCount').value) || 1;
    const info = document.getElementById('info').value.trim() || '';
    
    // Validate required fields
    if (!nombre || !apellido || !edad || !city || !country || !phone || !email || !employmentStatus || !housingType) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Recopilar información de miembros del hogar
    const householdMembers = [];
    const memberNames = document.querySelectorAll('.member-name');
    const memberLastnames = document.querySelectorAll('.member-lastname');
    const memberAges = document.querySelectorAll('.member-age');
    
    for (let i = 0; i < memberNames.length; i++) {
        householdMembers.push({
            nombre: memberNames[i].value.trim(),
            apellido: memberLastnames[i].value.trim(),
            edad: parseInt(memberAges[i].value) || 0
        });
    }

    // Update button state
    btnEnviar.innerHTML = "Enviando...";
    btnEnviar.disabled = true;

    // Usar addItem de db.js
    try {
        // Importar addItem si no está disponible globalmente
        let addItemFunc;
        if (typeof addItem !== 'undefined') {
            addItemFunc = addItem;
        } else if (window.addItem) {
            addItemFunc = window.addItem;
        } else {
            // Intentar importar dinámicamente
            const dbModule = await import('./db.js');
            addItemFunc = dbModule.addItem;
        }
        
        if (!addItemFunc || typeof addItemFunc !== 'function') {
            throw new Error('addItem no está disponible');
        }

        // Preparar datos completos
        const socioData = {
            nombre,
            apellido,
            edad,
            ciudad: city,
            country,
            telefono: phone,
            email,
            aporteMensual,
            employmentStatus,
            housingType,
            urgencyLevel,
            householdCount,
            householdMembers,
            info,
            estado: 'activo',
            fechaRegistro: new Date().toISOString()
        };

        // Guardar usando addItem
        addItemFunc('socios', socioData);
        btnEnviar.innerHTML = "Enviado ✔️";
        btnEnviar.disabled = false;
        
        // Clear form
        const form = document.getElementById('registrationForm');
        if (form) {
            form.reset();
        }
        
        // Show success message
        if (typeof showAlert === 'function') {
            showAlert('Registro completado con éxito ✔️', 'success');
        } else {
            alert('Registro completado ✔️');
        }
        
        // Navigate after short delay
        setTimeout(() => {
            if (typeof navigateTo === 'function') {
                navigateTo('index.html');
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    } catch (err) {
        console.error("Error al guardar socio:", err);
        btnEnviar.innerHTML = "Error";
        btnEnviar.disabled = false;
        
        // Show error message
        if (typeof showAlert === 'function') {
            showAlert('Error al registrar. Verifique su conexión. ❌', 'error');
        } else {
            alert('Error al registrar ❌\n' + (err.message || 'Error de conexión'));
        }
    }
}

