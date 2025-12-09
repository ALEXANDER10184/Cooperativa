// ============================================
// REGISTRATION FORM LOGIC
// Cooperativa Pro-Vivienda mi Esperanza
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar fecha de ingreso con fecha actual
    const fechaIngresoInput = document.getElementById('fechaIngreso');
    if (fechaIngresoInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaIngresoInput.value = today;
    }

    // Inicializar miembros de la familia
    const numMiembrosInput = document.getElementById('numMiembros');
    if (numMiembrosInput) {
        numMiembrosInput.addEventListener('input', updateMiembrosFamilia);
    }

    // Inicializar con 1 miembro
    updateMiembrosFamilia();

    // Form submission
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

// ============================================
// FAMILY MEMBERS MANAGEMENT
// ============================================

function updateMiembrosFamilia() {
    const count = parseInt(document.getElementById('numMiembros').value) || 1;
    const container = document.getElementById('miembrosContainer');

    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'card';
        memberDiv.style.background = '#f9fafb';
        memberDiv.style.padding = '1.5rem';
        memberDiv.style.marginBottom = '1rem';
        memberDiv.style.border = '1px solid #e5e7eb';

        memberDiv.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: var(--color-primary);">Miembro ${i + 1}</h4>
            
            <div class="form-group">
                <label class="form-label required">Nombre completo</label>
                <input type="text" class="form-input member-nombre" data-index="${i}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Documento</label>
                <select class="form-select member-tipo-doc" data-index="${i}" required>
                    <option value="">Seleccionar...</option>
                    <option value="dni">DNI</option>
                    <option value="nie">NIE</option>
                    <option value="pasaporte">Pasaporte</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Número de documento</label>
                <input type="text" class="form-input member-doc-num" data-index="${i}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Fecha de nacimiento</label>
                <input type="date" class="form-input member-fecha-nac" data-index="${i}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Nacionalidad</label>
                <input type="text" class="form-input member-nacionalidad" data-index="${i}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Domicilio actual</label>
                <input type="text" class="form-input member-domicilio" data-index="${i}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Profesión</label>
                <input type="text" class="form-input member-profesion" data-index="${i}" required>
            </div>
        `;

        container.appendChild(memberDiv);
    }
}

// ============================================
// VALIDATION HELPERS
// ============================================

function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{9,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function showError(input, message) {
    if (!input) return;
    
    clearError(input);
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
    
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function clearError(input) {
    if (!input) return;
    input.classList.remove('error');
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

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

    if (!form) return false;

    clearAllErrors(form);

    // Validar número de miembros
    const numMiembros = document.getElementById('numMiembros');
    if (!numMiembros || !validateRequired(numMiembros.value) || parseInt(numMiembros.value) < 1) {
        if (numMiembros) showError(numMiembros, 'Debe haber al menos 1 miembro');
        isValid = false;
    }

    // Validar todos los miembros de la familia
    const memberNombres = document.querySelectorAll('.member-nombre');
    const memberTipoDocs = document.querySelectorAll('.member-tipo-doc');
    const memberDocNums = document.querySelectorAll('.member-doc-num');
    const memberFechasNac = document.querySelectorAll('.member-fecha-nac');
    const memberNacionalidades = document.querySelectorAll('.member-nacionalidad');
    const memberDomicilios = document.querySelectorAll('.member-domicilio');
    const memberProfesiones = document.querySelectorAll('.member-profesion');

    memberNombres.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, 'Campo requerido');
            isValid = false;
        }
    });

    memberTipoDocs.forEach((select, index) => {
        if (!validateRequired(select.value)) {
            showError(select, 'Selecciona un tipo de documento');
            isValid = false;
        }
    });

    memberDocNums.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, 'Campo requerido');
            isValid = false;
        }
    });

    memberFechasNac.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, 'Campo requerido');
            isValid = false;
        }
    });

    memberNacionalidades.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, 'Campo requerido');
            isValid = false;
        }
    });

    memberDomicilios.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, 'Campo requerido');
            isValid = false;
        }
    });

    memberProfesiones.forEach((input, index) => {
        if (!validateRequired(input.value)) {
            showError(input, 'Campo requerido');
            isValid = false;
        }
    });

    // Validar teléfono
    const telefono = document.getElementById('telefono');
    if (!validateRequired(telefono.value)) {
        showError(telefono, 'Campo requerido');
        isValid = false;
    } else if (!validatePhone(telefono.value)) {
        showError(telefono, 'Teléfono inválido');
        isValid = false;
    }

    // Validar email
    const email = document.getElementById('email');
    if (!validateRequired(email.value)) {
        showError(email, 'Campo requerido');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, 'Email inválido');
        isValid = false;
    }

    // Validar fecha de ingreso
    const fechaIngreso = document.getElementById('fechaIngreso');
    if (!validateRequired(fechaIngreso.value)) {
        showError(fechaIngreso, 'Campo requerido');
        isValid = false;
    }

    // Validar cuota mensual
    const cuotaMensual = document.getElementById('cuotaMensual');
    if (!validateRequired(cuotaMensual.value) || parseFloat(cuotaMensual.value) < 0) {
        showError(cuotaMensual, 'Cuota mensual inválida');
        isValid = false;
    }

    // Validar checkboxes de autorización
    const consentimientoDatos = document.getElementById('consentimientoDatos');
    if (!consentimientoDatos || !consentimientoDatos.checked) {
        if (consentimientoDatos) showError(consentimientoDatos, 'Debes aceptar el consentimiento');
        isValid = false;
    }

    const aceptacionNormas = document.getElementById('aceptacionNormas');
    if (!aceptacionNormas || !aceptacionNormas.checked) {
        if (aceptacionNormas) showError(aceptacionNormas, 'Debes aceptar las normas');
        isValid = false;
    }

    // Validar disponibilidad
    const disponibilidadHoras = document.getElementById('disponibilidadHoras');
    if (!validateRequired(disponibilidadHoras.value) || parseInt(disponibilidadHoras.value) < 0) {
        showError(disponibilidadHoras, 'Campo requerido');
        isValid = false;
    }

    return isValid;
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleSubmit(event) {
    event.preventDefault();

    const btnEnviar = document.getElementById('btnEnviar');
    if (!btnEnviar) {
        console.error('Botón btnEnviar no encontrado');
        return;
    }

    if (!validateForm()) {
        return;
    }

    // Recopilar información de miembros de la familia
    const miembros = [];
    const memberNombres = document.querySelectorAll('.member-nombre');
    const memberTipoDocs = document.querySelectorAll('.member-tipo-doc');
    const memberDocNums = document.querySelectorAll('.member-doc-num');
    const memberFechasNac = document.querySelectorAll('.member-fecha-nac');
    const memberNacionalidades = document.querySelectorAll('.member-nacionalidad');
    const memberDomicilios = document.querySelectorAll('.member-domicilio');
    const memberProfesiones = document.querySelectorAll('.member-profesion');

    for (let i = 0; i < memberNombres.length; i++) {
        miembros.push({
            nombreCompleto: memberNombres[i].value.trim(),
            tipoDocumento: memberTipoDocs[i].value,
            numeroDocumento: memberDocNums[i].value.trim(),
            fechaNacimiento: memberFechasNac[i].value,
            nacionalidad: memberNacionalidades[i].value.trim(),
            domicilioActual: memberDomicilios[i].value.trim(),
            profesion: memberProfesiones[i].value.trim()
        });
    }

    // Recopilar áreas de colaboración
    const areasSelect = document.getElementById('areasColaboracion');
    const areasColaboracion = [];
    if (areasSelect) {
        for (let option of areasSelect.selectedOptions) {
            areasColaboracion.push(option.value);
        }
    }
    const otrasAreas = document.getElementById('otrasAreas')?.value.trim() || '';
    const observaciones = document.getElementById('observaciones')?.value.trim() || '';

    // Preparar datos completos
    const socioData = {
        // Datos básicos del socio principal (primer miembro)
        nombre: miembros[0]?.nombreCompleto.split(' ')[0] || '',
        apellido: miembros[0]?.nombreCompleto.split(' ').slice(1).join(' ') || miembros[0]?.nombreCompleto || '',
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        contactoEmergencia: document.getElementById('contactoEmergencia')?.value.trim() || '',
        
        // Información de todos los miembros
        miembros: miembros,
        numMiembros: miembros.length,
        
        // Situación en la cooperativa
        fechaIngreso: document.getElementById('fechaIngreso').value,
        
        // Aportaciones
        cuotaMensual: parseFloat(document.getElementById('cuotaMensual').value) || 0,
        
        // Autorizaciones
        consentimientoDatos: document.getElementById('consentimientoDatos').checked,
        aceptacionNormas: document.getElementById('aceptacionNormas').checked,
        fechaConsentimiento: new Date().toISOString(),
        
        // Participación
        areasColaboracion: areasColaboracion,
        otrasAreas: otrasAreas,
        disponibilidadHoras: parseInt(document.getElementById('disponibilidadHoras').value) || 0,
        
        // Observaciones
        observaciones: observaciones,
        
        // Estado y registro
        estado: 'Activo',
        fechaRegistro: new Date().toISOString()
    };

    // Actualizar botón
    btnEnviar.innerHTML = "Enviando...";
    btnEnviar.disabled = true;

    // Guardar usando db.js (ahora async)
    try {
        if (typeof window.addItem !== 'function') {
            throw new Error('window.addItem no está disponible');
        }

        await window.addItem('socios', socioData);
        
        btnEnviar.innerHTML = "Enviado ✔️";
        btnEnviar.disabled = false;
        
        // Mostrar modal personalizado con la contraseña destacada
        const passwordModal = document.getElementById('passwordSuccessModal');
        if (passwordModal) {
            passwordModal.style.display = 'flex';
            // Scroll al inicio para asegurar que se vea el modal
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Redirigir después de 8 segundos (más tiempo para que lean la contraseña)
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 8000);
        } else {
            // Fallback a alert si no se encuentra el modal
            const mensajeExito = `¡Registro completado con éxito! ✔️\n\n` +
                                `Para acceder a la aplicación, utiliza la siguiente contraseña:\n\n` +
                                `🔑 Contraseña: coopmiesperanza\n\n` +
                                `Serás redirigido a la página de acceso en unos segundos...`;
            alert(mensajeExito);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }
    } catch (err) {
        console.error("Error al guardar socio:", err);
        btnEnviar.innerHTML = "Error";
        btnEnviar.disabled = false;
        alert('Error al registrar ❌\n' + (err.message || 'Error al guardar los datos'));
    }
}
