document.addEventListener('DOMContentLoaded', () => {

    const appState = {
        fontScale: 1.0,
        isProUnlocked: false,
        colleges: [
            {
                id: 'midwest-cc',
                name: 'Midwest Community College Innovation Hub',
                location: 'Des Plaines & Skokie Region, IL',
                state: 'IL',
                program: 'Manufacturing Tech & Sustainable Polymer Cert.',
                rcerFocus: 'Circular Economy & Neurodivergent Workforce Innovation',
                supportLevel: 'High',
                accommodations: 'Innovation Hub, Disability Services, Dedicated Peer Mentors & Sensory Breaks',
                mapPinClass: 'pin-oakton'
            }
        ]
    };

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            link.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // Theme switching
    const themeBtns = document.querySelectorAll('.sensory-btn[data-theme]');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const theme = btn.getAttribute('data-theme');
            document.body.className = document.body.className.replace(/\btheme-\S+/g, '');
            document.body.classList.add(`theme-${theme}`);
        });
    });

    // Font Controls
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontSizeIndicator = document.getElementById('font-size-indicator');

    if (fontDecreaseBtn && fontIncreaseBtn) {
        fontDecreaseBtn.addEventListener('click', () => {
            if (appState.fontScale > 0.8) {
                appState.fontScale -= 0.1;
                updateFontScale();
            }
        });

        fontIncreaseBtn.addEventListener('click', () => {
            if (appState.fontScale < 1.4) {
                appState.fontScale += 0.1;
                updateFontScale();
            }
        });
    }

    function updateFontScale() {
        document.documentElement.style.setProperty('--font-scale', appState.fontScale);
        if (fontSizeIndicator) fontSizeIndicator.textContent = `${Math.round(appState.fontScale * 100)}%`;
    }

    // Assessment Radar Chart & Sliders
    const sliderIndependence = document.getElementById('score-independence');
    const sliderEnvironment = document.getElementById('score-environment');
    const sliderAssistance = document.getElementById('score-assistance');
    const sliderSafety = document.getElementById('score-safety');
    const sliderSocial = document.getElementById('score-social');

    const ctxEl = document.getElementById('assessmentRadarChart');
    let radarChart = null;

    if (ctxEl) {
        const ctx = ctxEl.getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Independence', 'Env Tolerance', 'Task Autonomy', 'Safety Tolerance', 'Social Preference'],
                datasets: [{
                    data: [7, 8, 6, 7, 5],
                    backgroundColor: 'rgba(59, 130, 246, 0.25)',
                    borderColor: '#3b82f6',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 10 } }, plugins: { legend: { display: false } } }
        });
    }

    const sliders = [
        { el: sliderIndependence, idx: 0 },
        { el: sliderEnvironment, idx: 1 },
        { el: sliderAssistance, idx: 2 },
        { el: sliderSafety, idx: 3 },
        { el: sliderSocial, idx: 4 }
    ];

    sliders.forEach(item => {
        if (item.el) {
            item.el.addEventListener('input', () => {
                const valEl = document.getElementById(`val-${item.el.id.replace('score-', '')}`);
                if (valEl) valEl.textContent = `${item.el.value} / 10`;
                if (radarChart) {
                    radarChart.data.datasets[0].data[item.idx] = parseInt(item.el.value, 10);
                    radarChart.update();
                }
            });
        }
    });

    // Clean PDF Exports Engine
    function downloadElementAsPDF(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error("PDF element not found:", elementId);
            return;
        }

        // Clone target form element to strip out UI buttons, headers, and navigation overlays
        const clone = element.cloneNode(true);
        clone.querySelectorAll('.btn, .preset-dropdown, .badge-info, button').forEach(el => el.remove());
        
        // Add a clean document title header to the exported PDF report
        const docHeader = document.createElement('div');
        docHeader.style.cssText = 'text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px; font-weight: bold; color: #0f172a;';
        docHeader.innerHTML = '<div style="font-size: 22px; color: #3b82f6; margin-bottom: 4px; font-weight: 800;">NEURODIVERGENT SPACE</div><div style="font-size: 13px; color: #475569; letter-spacing: 0.5px;">FUNCTIONAL ASSESSMENT & SUPPORT SUMMARY REPORT</div>';
        clone.insertBefore(docHeader, clone.firstChild);

        // Container wrapper for clean, crisp PDF rendering
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'padding: 24px; background: #ffffff; color: #0f172a; font-family: Lexend, sans-serif;';
        wrapper.appendChild(clone);

        const opt = {
            margin:       [0.4, 0.4, 0.4, 0.4],
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        if (window.html2pdf) {
            window.html2pdf().set(opt).from(wrapper).save().then(() => {
                console.log("Clean PDF downloaded successfully:", filename);
            }).catch(err => {
                console.error("html2pdf error, falling back to window.print():", err);
                window.print();
            });
        } else {
            window.print();
        }
    }

    const dlAssessmentBtn = document.getElementById('download-assessment-pdf');
    const dlAssessmentBtn2 = document.getElementById('download-assessment-pdf-2');

    if (dlAssessmentBtn) {
        dlAssessmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadElementAsPDF('assessment-form-printable', 'Functional_Assessment_Summary.pdf');
        });
    }

    if (dlAssessmentBtn2) {
        dlAssessmentBtn2.addEventListener('click', (e) => {
            e.preventDefault();
            downloadElementAsPDF('assessment-form-printable', 'Functional_Assessment_Summary.pdf');
        });
    }

    const dlRcerBtn = document.getElementById('download-rcer-pdf');
    if (dlRcerBtn) {
        dlRcerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadElementAsPDF('rcer-form-printable', 'Annual_Student_Support_Booklet.pdf');
        });
    }

    // RevenueCat Web SDK Integration
    const REVENUECAT_API_KEY = "test_htDOrLlAjytogAcwHXyODXNUFLp";
    let rcPurchases = null;

    async function initRevenueCat() {
        if (window.Purchases) {
            try {
                rcPurchases = window.Purchases.configure({
                    apiKey: REVENUECAT_API_KEY,
                    appUserId: "nd_space_user_" + Math.floor(Math.random() * 10000)
                });
                console.log("RevenueCat SDK Initialized");
            } catch (e) {
                console.log("RevenueCat SDK fallback mode active:", e.message);
            }
        }
    }
    initRevenueCat();

    const paywallModal = document.getElementById('paywall-modal');
    const openPaywallBtn = document.getElementById('open-paywall-btn');
    const closePaywallBtn = document.getElementById('close-paywall-btn');

    if (openPaywallBtn && paywallModal) {
        openPaywallBtn.addEventListener('click', () => paywallModal.classList.add('active'));
    }
    if (closePaywallBtn && paywallModal) {
        closePaywallBtn.addEventListener('click', () => paywallModal.classList.remove('active'));
    }

    // --- DE-ESCALATION BOX BREATHING ENGINE ---
    const toggleBreathingBtn = document.getElementById('toggle-breathing-btn');
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    let isBreathingActive = false;
    let breathingTimer = null;

    if (toggleBreathingBtn) {
        toggleBreathingBtn.addEventListener('click', () => {
            isBreathingActive = !isBreathingActive;
            if (isBreathingActive) {
                toggleBreathingBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Box Breathing';
                runBoxBreathingCycle();
            } else {
                toggleBreathingBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Box Breathing Guide';
                clearInterval(breathingTimer);
                if (breathingCircle) breathingCircle.classList.remove('expand');
                if (breathingText) breathingText.textContent = 'Inhale (4s)';
            }
        });
    }

    function runBoxBreathingCycle() {
        let step = 0;
        const steps = [
            { text: 'Inhale (4s)', expand: true },
            { text: 'Hold (4s)', expand: true },
            { text: 'Exhale (4s)', expand: false },
            { text: 'Hold (4s)', expand: false }
        ];

        function cycle() {
            const currentStep = steps[step];
            if (breathingText) breathingText.textContent = currentStep.text;
            if (breathingCircle) {
                if (currentStep.expand) breathingCircle.classList.add('expand');
                else breathingCircle.classList.remove('expand');
            }
            step = (step + 1) % steps.length;
        }
        cycle();
        breathingTimer = setInterval(cycle, 4000);
    }

    // --- SPOON ENERGY BUDGET TRACKER ---
    let spoonsRemaining = 10;
    const spoonNumberEl = document.getElementById('spoon-number');
    const spoonFillEl = document.getElementById('spoon-fill');
    const spendSpoonBtn = document.getElementById('spend-spoon-btn');
    const addSpoonBtn = document.getElementById('add-spoon-btn');

    if (spendSpoonBtn && addSpoonBtn) {
        spendSpoonBtn.addEventListener('click', () => {
            if (spoonsRemaining >= 2) {
                spoonsRemaining -= 2;
                updateSpoonUI();
            }
        });

        addSpoonBtn.addEventListener('click', () => {
            if (spoonsRemaining <= 8) {
                spoonsRemaining += 2;
                updateSpoonUI();
            }
        });
    }

    function updateSpoonUI() {
        if (spoonNumberEl) spoonNumberEl.textContent = spoonsRemaining;
        if (spoonFillEl) spoonFillEl.style.width = `${(spoonsRemaining / 10) * 100}%`;
    }

    // Print Wallet Emergency Card
    const printCardBtn = document.getElementById('print-emergency-card');
    if (printCardBtn) {
        printCardBtn.addEventListener('click', () => {
            window.print();
        });
    }

});
