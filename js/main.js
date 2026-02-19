/* ===========================
   POWER TO MOVE — Main JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // === Navbar scroll shadow ===
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
    }

    // === Mobile hamburger menu ===
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            const spans = hamburger.querySelectorAll('span');
            if (mobileNav.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    }

    // === Category nav: smooth scroll + IntersectionObserver ===
    const categoryBtns = document.querySelectorAll('.category-btn[data-target]');
    const productSections = document.querySelectorAll('.product-section[id]');

    // Smooth scroll on click
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-target');
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // IntersectionObserver for active state
    if (productSections.length && categoryBtns.length) {
        const observerOptions = {
            rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) + 80}px 0px -40% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    categoryBtns.forEach(btn => {
                        btn.classList.toggle('active', btn.getAttribute('data-target') === id);
                    });
                }
            });
        }, observerOptions);

        productSections.forEach(section => observer.observe(section));
    }

    // === Blog filter tabs ===
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // In a real app, this would filter posts. For now, visual only.
        });
    });

    // === Newsletter form (prevent default for demo) ===
    const nlForms = document.querySelectorAll('.newsletter-form');
    nlForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                alert('Obrigado por subscrever!');
                input.value = '';
            }
        });
    });

});
