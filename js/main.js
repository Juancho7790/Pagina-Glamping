document.addEventListener('DOMContentLoaded', () => {

    // 1. MENÚ HAMBURGUESA MÓVIL
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden'; 
            } else {
                document.body.style.overflow = '';
            }
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 2. GALERÍA DE PORTADA (HERO THUMBNAILS) CON REGRESO AUTOMÁTICO EN CADENA
    const heroVideo = document.getElementById('hero-video');
    const heroImage = document.getElementById('hero-image');
    const heroThumbnails = document.querySelectorAll('.hero-thumbnails img');
    let heroReturnTimer = null;

    if (heroVideo && heroImage && heroThumbnails.length > 0) {
        heroThumbnails.forEach(img => {
            img.addEventListener('click', function() {
                // Cancelar temporizadores activos para crear un encadenamiento limpio
                if (heroReturnTimer) {
                    clearTimeout(heroReturnTimer);
                }

                // Colocar la imagen seleccionada y ocultar el video de fondo
                heroImage.src = this.src;
                heroImage.classList.add('active');
                heroVideo.classList.add('hidden');

                // Cadena: Pasados exactamente 2 segundos, regresa al video automáticamente
                heroReturnTimer = setTimeout(() => {
                    heroImage.classList.remove('active');
                    heroVideo.classList.remove('hidden');
                }, 2000);
            });
        });
    }

    // 3. MASONRY GALLERY + LIGHTBOX
    const galleryItems = document.querySelectorAll('.masonry-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    let currentLightboxIndex = 0;

    const galleryData = Array.from(galleryItems).map(item => ({
        src: item.dataset.src,
        caption: item.dataset.caption
    }));

    function openLightbox(index) {
        currentLightboxIndex = index;
        lightboxImg.src = galleryData[index].src;
        lightboxCaption.textContent = galleryData[index].caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    // Corregido bug de desbordamiento al cerrar lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        if (!document.getElementById('reserva-modal').classList.contains('active')) {
            document.body.style.overflow = '';
        }
        setTimeout(() => { lightboxImg.src = ''; }, 400);
    }

    function nextLightbox() {
        currentLightboxIndex = (currentLightboxIndex + 1) % galleryData.length;
        lightboxImg.src = galleryData[currentLightboxIndex].src;
        lightboxCaption.textContent = galleryData[currentLightboxIndex].caption;
    }

    function prevLightbox() {
        currentLightboxIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length;
        lightboxImg.src = galleryData[currentLightboxIndex].src;
        lightboxCaption.textContent = galleryData[currentLightboxIndex].caption;
    }

    if (lightbox) {
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextLightbox(); });
        lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevLightbox(); });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextLightbox();
            if (e.key === 'ArrowLeft') prevLightbox();
        });
    }

    // 4. MODAL FORMULARIO Y CONTROL DE PANTALLA DE ÉXITO INTERACTIVA
    const btnAbrirReserva = document.getElementById('btn-abrir-reserva');
    const btnNavReserva = document.getElementById('btn-nav-reserva');
    const reservaModal = document.getElementById('reserva-modal');
    const cerrarReservaModal = document.querySelector('.cerrar-reserva-modal');
    const btnEntendidoExito = document.getElementById('btn-entendido-exito');
    
    const formContainerBlock = document.getElementById('form-container-block');
    const successState = document.getElementById('success-state');
    const reservaForm = document.getElementById('reserva-form');
    
    const abrirReservaBtns = [btnAbrirReserva, btnNavReserva];

    // Función para limpiar y restablecer el formulario al estado original
    function resetearEstructuraModal() {
        reservaModal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            reservaForm.reset();
            formContainerBlock.style.display = 'block';
            formContainerBlock.style.opacity = '1';
            successState.classList.remove('visible');
        }, 400); // Espera que termine la animación de cierre
    }

    if (reservaModal) {
        abrirReservaBtns.forEach(btn => {
            if(btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    reservaModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            }
        });

        if (cerrarReservaModal) cerrarReservaModal.addEventListener('click', resetearEstructuraModal);
        if (btnEntendidoExito) btnEntendidoExito.addEventListener('click', resetearEstructuraModal);

        reservaModal.addEventListener('click', (e) => {
            if (e.target === reservaModal) resetearEstructuraModal();
        });
    }

    if (reservaForm) {
        reservaForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const formspreeUrl = 'https://formspree.io/f/xvznrgzy';
            const formData = new FormData(reservaForm);
            const btnSubmit = reservaForm.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerText;
            btnSubmit.innerText = 'Procesando...';

            fetch(formspreeUrl, { 
                method: 'POST', 
                body: formData, 
                headers: { 'Accept': 'application/json' } 
            })
            .then(respuesta => {
                if (respuesta.ok) { 
                    // ANIMACIÓN INTERACTIVA: Se desvanece el formulario y emerge la confirmación
                    formContainerBlock.style.transition = 'opacity 0.3s ease';
                    formContainerBlock.style.opacity = '0';
                    
                    setTimeout(() => {
                        formContainerBlock.style.display = 'none';
                        successState.classList.add('visible');
                    }, 300);

                } else {
                    alert('Hubo un problema con el servidor. Por favor intenta de nuevo.');
                }
            })
            .catch(() => alert('Error de conexión a internet.'))
            .finally(() => { 
                btnSubmit.innerText = textoOriginal; 
            });
        });
    }
});