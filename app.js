/**
 * ISP Payment Report Application Script
 */

// 🔽 CAMBIA ESTA URL POR LA TUYA DESPUÉS DE DESPLEGAR EN APPS SCRIPT
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyKbOYZAhzNQYAEdXFZms4soLYIWjuOW09AbhdSq0WZ5iIaqhWw2PCi75QFqIPOkWpe/exec';

document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('paymentForm');
    const formCard = document.getElementById('formCard');
    const successCard = document.getElementById('successCard');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    const nombreInput = document.getElementById('nombre');
    const cedulaInput = document.getElementById('cedula');
    const telefonoInput = document.getElementById('telefono');
    const sectorSelect = document.getElementById('sector');
    const corteSelect = document.getElementById('corte');
    const referenciaInput = document.getElementById('referencia');
    const capturaInput = document.getElementById('captura');
    
    const nombreError = document.getElementById('nombreError');
    const cedulaError = document.getElementById('cedulaError');
    const telefonoError = document.getElementById('telefonoError');
    const sectorError = document.getElementById('sectorError');
    const corteError = document.getElementById('corteError');
    const referenciaError = document.getElementById('referenciaError');
    const capturaError = document.getElementById('capturaError');
    
    const successClient = document.getElementById('successClient');
    const successRef = document.getElementById('successRef');
    const resetBtn = document.getElementById('resetBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    // Helpers de validación
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

    // Validaciones en tiempo real
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
    sectorSelect.addEventListener('change', () => {
        if (sectorSelect.value !== '') clearInputError(sectorSelect, sectorError);
    });
    corteSelect.addEventListener('change', () => {
        if (corteSelect.value !== '') clearInputError(corteSelect, corteError);
    });
    referenciaInput.addEventListener('input', () => {
        const cleaned = referenciaInput.value.replace(/\D/g, '');
        if (cleaned.length >= 4) clearInputError(referenciaInput, referenciaError);
    });

    // Preview y validación de imagen
    capturaInput.addEventListener('change', function(e) {
        const file = this.files[0];
        if (file) {
            // Size limit removed: previously checked file.size > 5 MB
            if (!file.type.startsWith('image/')) {
                showInputError(capturaInput, capturaError, '❌ Solo se permiten archivos de imagen (JPG, PNG).');
                this.value = '';
                imagePreview.style.display = 'none';
                return;
            }
            clearInputError(capturaInput, capturaError);
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });

    // Validación completa del formulario
    function validateForm() {
        let isValid = true;
        if (nombreInput.value.trim().length < 3) {
            showInputError(nombreInput, nombreError, 'Introduce el nombre y apellido completos (mín. 3 letras).');
            isValid = false;
        } else clearInputError(nombreInput, nombreError);
        if (cedulaInput.value.trim().length < 5) {
            showInputError(cedulaInput, cedulaError, 'Ingresa una cédula válida (Ej. V-12345678).');
            isValid = false;
        } else clearInputError(cedulaInput, cedulaError);
        const phoneDigits = telefonoInput.value.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            showInputError(telefonoInput, telefonoError, 'Introduce un teléfono válido (mín. 10 dígitos).');
            isValid = false;
        } else clearInputError(telefonoInput, telefonoError);
        if (sectorSelect.value === '') {
            showInputError(sectorSelect, sectorError, 'Selecciona tu sector o zona.');
            isValid = false;
        } else clearInputError(sectorSelect, sectorError);
        if (corteSelect.value === '') {
            showInputError(corteSelect, corteError, 'Selecciona tu día de corte.');
            isValid = false;
        } else clearInputError(corteSelect, corteError);
        const refDigits = referenciaInput.value.replace(/\D/g, '');
        if (refDigits.length < 4) {
            showInputError(referenciaInput, referenciaError, 'Ingresa el número de referencia (mín. 4 dígitos).');
            isValid = false;
        } else clearInputError(referenciaInput, referenciaError);
        const file = capturaInput.files[0];
        if (!file) {
            showInputError(capturaInput, capturaError, '❌ Sube la captura de pantalla del pago.');
            isValid = false;
        } else clearInputError(capturaInput, capturaError);
        return isValid;
    }

    // Envío del formulario
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        loadingOverlay.style.display = 'flex';

        const nombre = nombreInput.value.trim();
        const cedula = cedulaInput.value.trim();
        const telefono = telefonoInput.value.trim().replace(/\D/g, '');
        const referencia = referenciaInput.value.trim();
        const sector = sectorSelect.value || '';
        const corte = corteSelect.value || '';
        const file = capturaInput.files[0];

        // Generar nombre de archivo: pago_[referencia]_[nombre_limpio]
        const nombreLimpio = nombre.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        const extension = file.name.split('.').pop();
        const nombreArchivo = `pago_${referencia}_${nombreLimpio}.${extension}`;

        const payload = {
            cedula,
            telefono,
            referencia,
            nombre,
            sector,
            corte,
            imageName: nombreArchivo
        };
        console.log('Payload fields:', { cedula, telefono, referencia, nombre, sector, corte, imageName: nombreArchivo });

        try {
            const reader = new FileReader();
            const imageData = await new Promise((resolve, reject) => {
                reader.onload = e => resolve(e.target.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            payload.image = imageData;

            if (SCRIPT_URL.includes('AKfycbz_XXXXXXXXXXXXXX')) {
                throw new Error('La URL de Google Apps Script no está configurada.');
            }

            console.log('Payload enviado:', payload);
const response = await fetch(SCRIPT_URL, {
  method: 'POST',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(payload)
});
            const result = await response.json();

            if (result.status === 'success') {
                successClient.textContent = nombre;
                successRef.textContent = `#${referencia}`;
                formCard.style.display = 'none';
                successCard.style.display = 'block';
                paymentForm.reset();
                imagePreview.style.display = 'none';
            } else {
                throw new Error(result.message || 'Error desconocido.');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            alert(`❌ Error al registrar el pago: ${error.message}`);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    resetBtn.addEventListener('click', () => {
        successCard.style.display = 'none';
        formCard.style.display = 'block';
        imagePreview.style.display = 'none';
    });
});
