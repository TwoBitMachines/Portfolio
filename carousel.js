// carousel.js

// Initialize a single carousel container (expects Swiper markup)
function initCarousel(container) {
    const wrapper = container.querySelector('.swiper-wrapper');
    if (!wrapper) { console.error('[carousel] missing .swiper-wrapper in', container); return; }

    const nextEl = container.querySelector('.swiper-button-next');
    const prevEl = container.querySelector('.swiper-button-prev');
    const pagEl = container.querySelector('.swiper-pagination');

    const swiper = new Swiper(container, {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        loop: true,
        navigation: nextEl && prevEl ? { nextEl, prevEl } : undefined,
        pagination: pagEl ? { el: pagEl, type: 'fraction' } : undefined,
        autoplay: { delay: getDuration(container), disableOnInteraction: false },
        speed: 600, // fade duration
    });

    // Reset GIFs on slide change
    swiper.on('slideChangeTransitionStart', () => {
        swiper.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                const src = img.src;
                img.src = '';
                img.src = src;
            }
        });
    });

    // Per-slide custom duration
    swiper.on('slideChangeTransitionEnd', () => {
        const active = swiper.slides[swiper.activeIndex];
        const dur = parseInt(active?.dataset.duration || 4000, 10);
        swiper.params.autoplay.delay = dur;
        swiper.autoplay.start();
    });

    console.log('[carousel] initialized', container);
}

// Helper: get first slide duration
function getDuration(container) {
    const first = container.querySelector('.swiper-slide');
    return parseInt(first?.dataset.duration || 4000, 10);
}

// Initialize all carousels in a root element
function initAllCarousels(root = document) {
    const containers = root.querySelectorAll('.image-carousel');
    containers.forEach(container => initCarousel(container));
}

// Inject CSS for carousel
function styleCarouselElements() {
    const style = document.createElement('style');
    style.textContent = `
        .swiper-slide {
            background-color: #fff; /* match page background */
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .swiper-slide img {
            border-radius: 16px; /* bigger rounded corners */
            display: block;
            width: 100%;
            height: auto;
            object-fit: contain;
        }

        .swiper-button-next,
        .swiper-button-prev {
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            top: 50%;
            transform: translateY(-50%);
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
            color: #fff;
            font-size: 20px;
        }

        .swiper-pagination {
    color: #fff;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;
}
    `;
    document.head.appendChild(style);
}

// Call once to inject styles
styleCarouselElements();

// Add to carousel.js after styleCarouselElements()

// Update the createFullscreenOverlay function
function createFullscreenOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.innerHTML = `
        <button class="fullscreen-close">&times;</button>
        <img class="fullscreen-image" src="" alt="">
    `;
    document.body.appendChild(overlay);

    // Close on overlay click or close button
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('fullscreen-close')) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    });

    return overlay;
}

// Update initFullscreenImages to disable scrolling when opening
function initFullscreenImages() {
    const overlay = createFullscreenOverlay();
    const fullscreenImg = overlay.querySelector('.fullscreen-image');

    // Add click handlers only to images inside .fullscreen-enabled carousels
    document.addEventListener('click', (e) => {
        if (e.target.matches('.swiper-slide img')) {
            // Check if image is inside a .fullscreen-enabled carousel
            if (!e.target.closest('.fullscreen-enabled')) {
                return; // Skip - fullscreen not enabled for this carousel
            }

            fullscreenImg.src = e.target.src;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

// Add CSS for fullscreen overlay
function styleFullscreenOverlay() {
    const style = document.createElement('style');
    style.textContent = `
        .fullscreen-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(8, 8, 8, 0.95);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: zoom-out;
        }

        .fullscreen-overlay.active {
            display: flex;
        }

        .fullscreen-image {
            max-width: 95%;
            max-height: 95%;
            object-fit: contain;
            border-radius: 8px;
        }

        .fullscreen-close {
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 50px;
            color: white;
            background: none;
            border: none;
            cursor: pointer;
            z-index: 10000;
        }

        .fullscreen-close:hover {
            color: #ccc;
        }

        .fullscreen-enabled .swiper-slide img {
            cursor: zoom-in;
        }
    `;
    document.head.appendChild(style);
}
// Call these after your existing code
styleFullscreenOverlay();
initFullscreenImages();