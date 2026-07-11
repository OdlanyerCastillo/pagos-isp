/**
 * ISP Payment Report Application Script
 * Connects frontend form to Google Apps Script Backend
 */

// Replace this with your Google Apps Script Web App URL after deploying it
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_XXXXXXXXXXXXXX/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Form and Card Selectors
    const paymentForm = document.getElementById('paymentForm');
    const formCard = document.getElementById('formCard');
    const successCard = document.getElementById('successCard');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Form Fields
    const nombreInput = document.getElementById('nombre');
    const cedulaInput = document.getElementById('cedula');
    const telefonoInput = document.getElementById('telefono');
    const referenciaInput = document.getElementById('referencia');
    
    // Error Element Selectors
    const nombreError = document.getElementById('nombreError');
    const cedulaError = document.getElementById('cedulaError');
    const telefonoError = document.getElementById('telefonoError');
    const referenciaError = document.getElementById('referenciaError');
    
    // Success Elements
    const successClient = document.getElementById('successClient');
    const successRef = document.getElementById('successRef');
    const resetBtn = document.getElementById('resetBtn');

    // ==========================================
    // Real-time Input Validation helpers
    // ==========================================
    
    function showInputError(inputEl, errorEl, message) {
        const group = inputEl.closest('.form-group');
        group.classList.add('has-error');
        errorEl.textContent = message;
    }

    function clearInputError(inputEl, errorEl) {
        const group = inputEl.closest('.form-group');
        group.classList.remove('has-error');
        errorEl.textContent = '';
    }

    // Clean validation on input typing
    nombreInput.addEventListener('input', () => {
        if (nombreInput.value.trim().length >= 3) clearInputError(nombreInput, nombreError);
    });

    cedulaInput.addEventListener('input', () => {
        if (cedulaInput.value.trim().length >= 5) clearInputError(cedulaInput, cedulaError);
    });

    telefonoInput.addEventListener('input', () => {
        const cleaned = telefonoInput.value.replace(/\D/g, '');
        if (cleaned.length >= 10) clearInputError(telefonoInput, telefonoError);
    });

    referenciaInput.addEventListener('input', () => {
        const cleaned = referenciaInput.value.replace(/\D/g, '');
        if (cleaned.length >= 4) clearInputError(referenciaInput, referenciaError);
    });

    // Form Validator
    function validateForm() {
        let isValid = true;

        // Name validation
        if (nombreInput.value.trim().length < 3) {
            showInputError(nombreInput, nombreError, 'Introduce el nombre y apellido completos del titular (mín. 3 letras).');
            isValid = false;
        } else {
            clearInputError(nombreInput, nombreError);
        }

        // Cédula validation
        if (cedulaInput.value.trim().length < 5) {
            showInputError(cedulaInput, cedulaError, 'Por favor, ingresa una cédula válida (Ej. V-12345678).');
            isValid = false;
        } else {
            clearInputError(cedulaInput, cedulaError);
        }

        // Phone validation (numbers only validation)
        const phoneDigits = telefonoInput.value.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            showInputError(telefonoInput, telefonoError, 'Introduce un número de teléfono válido (Ej. 04141234567, mín. 10 dígitos).');
            isValid = false;
        } else {
            clearInputError(telefonoInput, telefonoError);
        }

        // Reference validation
        const refDigits = referenciaInput.value.replace(/\D/g, '');
        if (refDigits.length < 4) {
            showInputError(referenciaInput, referenciaError, 'Ingresa el número de referencia del pago (mín. 4 dígitos).');
            isValid = false;
        } else {
            clearInputError(referenciaInput, referenciaError);
        }

        return isValid;
    }

    // ==========================================
    // Form Submit handling (Send Data)
    // ==========================================
    
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Run validation
        if (!validateForm()) {
            return;
        }

        // Show Loading state
        loadingOverlay.style.display = 'flex';

        // Prepare payload data
        const payload = {
            cedula: cedulaInput.value.trim(),
            telefono: telefonoInput.value.trim().replace(/\D/g, ''),
            referencia: referenciaInput.value.trim(),
            nombre: nombreInput.value.trim()
        };

        try {
            // Check if Script URL has been replaced
            if (SCRIPT_URL.includes('AKfycbz_XXXXXXXXXXXXXX')) {
                throw new Error('La dirección del servicio de Google Sheets (SCRIPT_URL) no ha sido configurada.');
            }

            // POST request to Google Apps Script Web App
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // Apps script accepts text/plain to avoid CORS preflight issues
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Set success summary info
                successClient.textContent = payload.nombre;
                successRef.textContent = `#${payload.referencia}`;

                // Swap cards
                formCard.style.display = 'none';
                successCard.style.display = 'block';
                
                // Clear inputs
                paymentForm.reset();
            } else {
                throw new Error(result.message || 'Error desconocido al registrar el pago en la base de datos.');
            }

        } catch (error) {
            console.error('Submission Error:', error);
            alert(`Error al registrar el pago: ${error.message}\n\nPor favor, verifica la configuración o comunícate con soporte.`);
        } finally {
            // Hide loading state
            loadingOverlay.style.display = 'none';
        }
    });

    // Reset Form (Report another payment)
    resetBtn.addEventListener('click', () => {
        successCard.style.display = 'none';
        formCard.style.display = 'block';
    });
});
