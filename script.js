/*====================== toggle icon navbar =======================*/
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menuIcon) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        if (navbar) navbar.classList.toggle('active');
    }

    // Make the menu icon keyboard-accessible (Enter / Space)
    menuIcon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            menuIcon.click();
        }
    });
}

/*====================== scroll sections active link =======================*/
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    let top = window.scrollY;

    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector('header nav a[href*="' + id + '"]');
            if (activeLink) activeLink.classList.add('active');
        }
    });

    /*====================== sticky navbar =======================*/
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);
}

/*====================== remove toggle icon and navbar when click navbar link (scroll) =======================*/
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    });
});

/*====================== scroll reveal =======================*/
ScrollReveal({
    // reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/*====================== typed js =======================*/
const typed = new Typed('.multiple-text', {
    strings: ['Développeur', 'Frontend', 'Backend', 'Développeur Web', 'Développeur Mobile', 'Music', 'Crypto'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

/*====================== contact form (Formspree) =======================*/
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
if (contactForm) {
    const submitBtn = contactForm.querySelector('input[type="submit"]');
    const modal = document.getElementById('confirm-modal');
    const modalClose = modal?.querySelector('.modal-close');
    const modalOk = document.getElementById('modal-ok');

    function openModal(){
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
        // focus first actionable
        modal.querySelector('.modal-close')?.focus();
    }

    function closeModal(){
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
    }

    // modal handlers
    modalClose?.addEventListener('click', closeModal);
    modalOk?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    function validateContactForm(){
        const name = (contactForm.querySelector('input[name="name"]')?.value || '').trim();
        const email = (contactForm.querySelector('input[name="email"]')?.value || '').trim();
        const message = (contactForm.querySelector('textarea[name="message"]')?.value || '').trim();
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name) errors.push('Veuillez saisir votre nom.');
        if (!email || !emailRegex.test(email)) errors.push('Veuillez saisir une adresse email valide.');
        if (!message || message.length < 15) errors.push('Le message doit contenir au moins 15 caractères.');
        return errors;
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!formStatus) return;
        // client-side validation
        const errors = validateContactForm();
        if (errors.length){
            formStatus.className = 'form-status error';
            formStatus.innerHTML = errors.join('<br>');
            return;
        }

        const action = contactForm.getAttribute('action') || '';
        if (action.includes('yourFormID')) {
            formStatus.textContent = 'Remplacez "yourFormID" dans l\'attribut action du formulaire par votre identifiant Formspree.';
            formStatus.className = 'form-status error';
            return;
        }

        // UI: disable submit and show loading
        if (submitBtn) submitBtn.disabled = true;
        contactForm.setAttribute('aria-busy', 'true');
        formStatus.className = 'form-status loading';
        formStatus.textContent = 'Envoi en cours...';

        const data = new FormData(contactForm);
        try {
            const res = await fetch(action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: data
            });
            if (res.ok) {
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Merci — votre message a été envoyé.';
                contactForm.reset();
            } else {
                let text = 'Erreur lors de l envoi.';
                try { const result = await res.json(); if (result?.error) text = result.error; } catch(e){}
                formStatus.className = 'form-status error';
                formStatus.textContent = text;
            }
        } catch (err) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Impossible d envoyer le message. Vérifiez votre connexion.';
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            contactForm.removeAttribute('aria-busy');
            // clear message after a while
            setTimeout(() => { formStatus.className = ''; formStatus.textContent = ''; }, 7000);
        }
    });
}
