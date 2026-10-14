/*====================== Préparation =======================*/
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const header = document.querySelector('header');
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('header nav a');
const sections = document.querySelectorAll('section[id]');

/*====================== Menu mobile =======================*/
function closeMenu() {
    if (menuIcon) menuIcon.classList.remove('bx-x');
    if (navbar) navbar.classList.remove('active');
}

if (menuIcon) {
    const toggleMenu = () => {
        menuIcon.classList.toggle('bx-x');
        if (navbar) navbar.classList.toggle('active');
    };

    menuIcon.addEventListener('click', toggleMenu);

    menuIcon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
}

navLinks.forEach(link => link.addEventListener('click', closeMenu));

/*====================== Barre de progression de lecture =======================*/
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
progressBar.setAttribute('aria-hidden', 'true');
document.body.appendChild(progressBar);

/*====================== Scroll : lien actif, header, progression =======================*/
let lastScrollY = window.scrollY;
let ticking = false;

function updateActiveLink() {
    const scrollY = window.scrollY;
    let currentId = null;

    sections.forEach(sec => {
        const top = sec.offsetTop - 150;
        if (scrollY >= top && scrollY < top + sec.offsetHeight) {
            // Les sections services-3 et services-4 pointent vers le lien "Services"
            currentId = sec.id.startsWith('services') ? 'services' : sec.id;
        }
    });

    if (!currentId) return;

    navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function updateHeader() {
    const y = window.scrollY;
    const menuOpen = navbar?.classList.contains('active');

    header.classList.toggle('sticky', y > 100);

    // Le header se cache en descendant et réapparaît en remontant (toujours visible si le menu mobile est ouvert)
    const goingDown = y > lastScrollY;
    header.classList.toggle('hide', goingDown && y > 300 && !menuOpen);

    lastScrollY = y;
}

function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
}

function onScroll() {
    updateActiveLink();
    updateHeader();
    updateProgress();
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });

onScroll();

/*====================== Apparition au défilement =======================*/
// Chaque élément glisse depuis une direction, avec un léger décalage entre frères
const REVEAL_TARGETS = [
    ['.heading', 'up'],
    ['.contact-intro', 'up'],
    ['.about-img', 'left'],
    ['.about-content', 'right'],
    ['.services-box', 'up'],
    ['.portfolio-link', 'up'],
    ['.contact-info', 'left'],
    ['.contact form', 'right']
];

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    REVEAL_TARGETS.forEach(([selector, direction]) => {
        document.querySelectorAll(selector).forEach(el => {
            const siblings = el.parentElement
                ? Array.from(el.parentElement.children).filter(child => child.matches(selector))
                : [el];
            const index = siblings.indexOf(el);

            el.dataset.reveal = direction;
            el.style.setProperty('--delay', `${Math.min(index, 6) * 120}ms`);
            revealObserver.observe(el);
        });
    });
}

/*====================== Effet 3D sur les cartes Projets =======================*/
if (canHover && !prefersReducedMotion) {
    const MAX_TILT = 8; // degrés

    document.querySelectorAll('.portfolio-box').forEach(box => {
        box.addEventListener('pointermove', (e) => {
            const rect = box.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            box.style.setProperty('--tilt-x', `${(-y * MAX_TILT).toFixed(2)}deg`);
            box.style.setProperty('--tilt-y', `${(x * MAX_TILT).toFixed(2)}deg`);
        });

        box.addEventListener('pointerleave', () => {
            box.style.setProperty('--tilt-x', '0deg');
            box.style.setProperty('--tilt-y', '0deg');
        });
    });
}

/*====================== Typed.js (texte qui se tape) =======================*/
if (typeof Typed === 'function' && document.querySelector('.multiple-text')) {
    new Typed('.multiple-text', {
        strings: [
            'Développeur Full-Stack',
            'Développeur Frontend',
            'Développeur Backend',
            'Développeur Mobile',
            'Passionné de Web3',
            'Bassiste'
        ],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
}

/*====================== Modal de confirmation =======================*/
const modal = document.getElementById('confirm-modal');
const modalClose = modal?.querySelector('.modal-close');
const modalOk = document.getElementById('modal-ok');
let lastFocusedElement = null;

function openModal() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modalClose?.focus();
}

function closeModal() {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    lastFocusedElement?.focus();
}

modalClose?.addEventListener('click', closeModal);
modalOk?.addEventListener('click', closeModal);

// Clic sur le fond sombre = fermer
modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeMenu();
    }
});

/*====================== Formulaire de contact (Formspree) =======================*/
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm && formStatus) {
    const submitBtn = contactForm.querySelector('input[type="submit"]');
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let clearTimer = null;

    function showStatus(type, text) {
        formStatus.className = type ? `form-status ${type}` : '';
        formStatus.textContent = text;
    }

    function scheduleStatusClear() {
        clearTimeout(clearTimer);
        clearTimer = setTimeout(() => showStatus('', ''), 7000);
    }

    function validateContactForm() {
        const name = contactForm.querySelector('input[name="name"]').value.trim();
        const email = contactForm.querySelector('input[name="email"]').value.trim();
        const message = contactForm.querySelector('textarea[name="message"]').value.trim();
        const errors = [];

        if (!name) errors.push('Veuillez saisir votre nom.');
        if (!EMAIL_REGEX.test(email)) errors.push('Veuillez saisir une adresse email valide.');
        if (message.length < 15) errors.push('Le message doit contenir au moins 15 caractères.');

        return errors;
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errors = validateContactForm();
        if (errors.length) {
            showStatus('error', errors.join(' '));
            scheduleStatusClear();
            return;
        }

        const action = contactForm.getAttribute('action') || '';
        if (action.includes('yourFormID')) {
            showStatus('error', 'Remplacez "yourFormID" dans l\'attribut action du formulaire par votre identifiant Formspree.');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        contactForm.setAttribute('aria-busy', 'true');
        showStatus('loading', 'Envoi en cours...');

        try {
            const res = await fetch(action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });

            if (res.ok) {
                contactForm.reset();
                showStatus('success', 'Merci, votre message a bien été envoyé.');
                openModal();
            } else {
                let text = "Erreur lors de l'envoi. Réessayez plus tard.";
                try {
                    const result = await res.json();
                    if (Array.isArray(result?.errors)) {
                        text = result.errors.map(err => err.message).join(' ');
                    }
                } catch (_) { /* réponse non JSON : message par défaut */ }
                showStatus('error', text);
            }
        } catch (err) {
            showStatus('error', "Impossible d'envoyer le message. Vérifiez votre connexion.");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            contactForm.removeAttribute('aria-busy');
            scheduleStatusClear();
        }
    });
}