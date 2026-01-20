document.addEventListener('DOMContentLoaded', () => { // attend que le DOM soit prêt puis exécute la fonction
    const welcomeSection = document.getElementById('welcome'); // récupère l'élément avec id "welcome"
    const arrow = document.querySelector('.arrow'); // récupère le premier élément avec la classe "arrow"
    const mainContent = document.querySelector('.main-content'); // récupère l'élément principal à afficher après transition
    const navbar = document.querySelector('.navbar'); // récupère la barre de navigation
    const titre = document.querySelector('.titre'); // récupère l'élément titre

    // Bloque le scroll au départ
    document.body.style.overflow = 'hidden'; // empêche le scroll sur le body
    document.documentElement.style.overflow = 'hidden'; // empêche le scroll sur l'élément racine (sécurité)
    let transitionDone = false; // flag pour s'assurer que la transition d'intro ne se déclenche qu'une fois

    setTimeout(() => {
        titre.classList.add('active'); // ajoute la classe "active" au titre (déclenche animation CSS)
        arrow.classList.add('active'); // ajoute la classe "active" à la flèche (animation)
    }, 500); // exécute après 500ms

    setTimeout(() => {
        navbar.classList.add('visible'); // rend la navbar visible (ajoute classe)
    }, 1000); // exécute après 1000ms

    function triggerTransition() { // fonction qui déclenche la fin de l'intro
        if (transitionDone) return; // si déjà exécutée, ne rien faire
        transitionDone = true; // marque comme exécutée
        
        welcomeSection.classList.add('lift'); // ajoute la classe "lift" pour animer la section d'accueil
        mainContent.style.display = 'block'; // affiche le contenu principal
        
        setTimeout(() => {
            welcomeSection.style.display = 'none'; // après l'animation, masque la section d'accueil
            document.body.style.overflow = 'auto'; // restaure le scroll du body
            document.documentElement.style.overflow = 'auto'; // restaure le scroll de la racine
        }, 2000); // délai correspondant à la durée de l'animation
    }

    arrow.addEventListener('click', triggerTransition); // clique sur la flèche déclenche la transition

    window.addEventListener('wheel', (e) => { // écouteur wheel global pour intercepter le scroll pendant l'intro
        if (!transitionDone) { // si la transition n'est pas terminée
            e.preventDefault(); // empêche le comportement par défaut (scroll)
            e.stopPropagation(); // stoppe la propagation de l'événement
            e.stopImmediatePropagation(); // empêche d'autres listeners de recevoir l'événement
            if (e.deltaY > 0) { // si l'utilisateur scrolle vers le bas
                triggerTransition(); // déclenche la transition
            }
            return false; // renvoie false pour sécurité
        }
    }, { passive: false, capture: true }); // passive:false pour pouvoir preventDefault, capture:true pour intercepter tôt

    window.addEventListener('touchmove', (e) => { // bloque le touchmove sur mobile pendant l'intro
        if (!transitionDone) {
            e.preventDefault(); // empêche le scroll tactile
            e.stopPropagation(); // stoppe propagation
        }
    }, { passive: false, capture: true });
    
    // Gestion du swipe sur mobile pour déclencher la transition
    let touchStartY = 0;
    
    window.addEventListener('touchstart', (e) => {
        if (!transitionDone) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        if (!transitionDone) {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            // Si swipe vers le haut (delta > 50px)
            if (deltaY > 50) {
                triggerTransition();
            }
        }
    }, { passive: true });

    // Carousel Animation
    const carouselContainers = document.querySelectorAll('.carousel-container'); // sélectionne tous les conteneurs de carrousel
    
    carouselContainers.forEach(container => { // pour chaque conteneur de carrousel
        let scrollOffset = 0; // position actuelle du translateX
        const carousel = container.querySelector('.carousel'); // élément qui contient les éléments défilants
        const imageCount = 10; // nombre d'images attendu (valeur codée en dur)
        let isScrolling = false; // flag pour indiquer si l'utilisateur scroll manuellement
        let scrollTimeout; // timeout pour repasser en animation automatique après interaction
        const imageWidth = 355 + 30; // largeur estimée d'une image + gap (valeur codée)
        let isAnimating = true; // flag pour l'animation automatique active
        let animationInterval; // référence à l'interval d'animation
        
        function startAnimation() { // démarre le défilement automatique
            animationInterval = setInterval(() => {
                if (!isScrolling && isAnimating) { // n'avance que si pas d'interaction manuelle
                    scrollOffset -= 1; // décrémente l'offset pour déplacer vers la gauche
                    carousel.style.transform = `translateX(${scrollOffset}px)`; // applique la translation
                    
                    if (Math.abs(scrollOffset) > (imageCount / 2) * imageWidth) { // si on a parcouru une moitié (boucle)
                        scrollOffset = 0; // remet à zéro pour boucle
                        carousel.style.transition = 'none'; // supprime transition pour reset instantané
                        carousel.style.transform = `translateX(0)`; // réinitialise la position
                    }
                }
            }, 30); // cadence de l'animation automatique (30ms)
        }
        
        startAnimation(); // lance l'animation automatique
        
        container.addEventListener('wheel', (e) => { // interaction de la souris sur le carrousel
            if (!transitionDone) return; // ignore si l'intro n'est pas terminée
            
            const maxScroll = -((imageCount / 2) * imageWidth + 490); // calcule une limite de scroll (valeur ajustée)
            const isAtEnd = scrollOffset <= maxScroll; // vrai si on est au bout droit
            const isAtStart = scrollOffset >= 0; // vrai si on est au début gauche
            
            if ((isAtEnd && e.deltaY > 0) || (isAtStart && e.deltaY < 0)) { // empêche d'aller plus loin que les bornes
                return;
            }
            
            e.preventDefault(); // empêche le scroll de page
            isScrolling = true; // marque interaction manuelle
            isAnimating = false; // arrête l'animation automatique
            carousel.style.transition = 'none'; // supprime transition pour réponse immédiate
            
            clearTimeout(scrollTimeout); // nettoie le timeout précédent
            clearInterval(animationInterval); // arrête l'interval d'animation
            
            let newOffset = scrollOffset - e.deltaY * 0.3; // calcule le nouvel offset en fonction du deltaY
            
            if (newOffset > 0) { // borne supérieure
                newOffset = 0;
            } else if (newOffset < maxScroll) { // borne inférieure
                newOffset = maxScroll;
            }
            
            scrollOffset = newOffset; // met à jour l'offset
            carousel.style.transform = `translateX(${scrollOffset}px)`; // applique la translation
            
            scrollTimeout = setTimeout(() => { // après une pause sans interaction
                isScrolling = false; // quitte le mode manuel
                isAnimating = true; // réactive l'animation automatique
                clearInterval(animationInterval); // nettoie l'interval au cas où
                startAnimation(); // relance l'animation automatique
            }, 2000); // délai avant reprise automatique
        });

        container.addEventListener('mouseleave', () => { // si la souris quitte le conteneur
            if (isScrolling) { // si on était en interaction manuelle
                isScrolling = false; // remettre en automatique
                isAnimating = true;
                clearInterval(animationInterval);
                startAnimation(); // relancer animation automatique
            }
        });
    });

    // Timeline Animation - Observer
    const observerOptions = { // options pour l'IntersectionObserver
        threshold: [0, 0.5], // déclenchement aux seuils 0 et 0.3
        rootMargin: '-50px 0px' // ajustement de la zone racine
    };

    const observer = new IntersectionObserver((entries) => { // crée l'observer
        entries.forEach(entry => { // pour chaque entrée observée
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) { // si suffisamment visible
                entry.target.classList.add('visible'); // ajoute la classe visible
            } else if (!entry.isIntersecting) { // si pas intersecté
                entry.target.classList.remove('visible'); // retire la classe visible
            }
        });
    }, observerOptions);

    // Observer pour les histoire-blocks
    document.querySelectorAll('.histoire-block').forEach(block => {
        observer.observe(block);
    });
    
    // ==================== ANIMATION AU SCROLL GLOBAL ====================
    
    // Ajouter la classe scroll-animate aux éléments
    const animatedElements = [
        '.section-titre',
        '.masonry-card',
        '.tech-card',
        '.culture-slide',
        '.text-content',
        '.carousel-wrapper',
        '.accordion-item'
    ];
    
    // Ajouter les classes d'animation et observer
    animatedElements.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            // Ajouter la classe d'animation si pas déjà présente
            if (!el.classList.contains('scroll-animate') && 
                !el.classList.contains('scroll-animate-left') && 
                !el.classList.contains('scroll-animate-right') &&
                !el.classList.contains('scroll-animate-scale')) {
                el.classList.add('scroll-animate');
            }
            // Ajouter un délai échelonné pour les cards
            if (selector === '.masonry-card' || selector === '.tech-card' || selector === '.accordion-item') {
                const delay = (index % 6) + 1;
                el.classList.add(`scroll-animate-delay-${Math.min(delay, 5)}`);
            }
            // Observer l'élément
            observer.observe(el);
        });
    });

    // Expansion des blocs histoire
    const histoireBlocks = document.querySelectorAll('.histoire-block'); // sélectionne tous les blocs histoire
    const overlay = document.querySelector('.histoire-overlay'); // overlay pour modal
    let scrollPosition = 0; // stocke la position de scroll avant ouverture
    let expandedClone = null; // référence au clone élargi actuellement ouvert
    
    function disableScroll() { // empêche le scroll de fond quand modal ouvert
        scrollPosition = window.scrollY; // conserve la position actuelle
        document.body.style.position = 'fixed'; // fixe le body pour bloquer
        document.body.style.top = `-${scrollPosition}px`; // décale pour garder l'apparence
        document.body.style.width = '100%'; // évite les sauts de largeur
    }
    
    function enableScroll() { // restaure le scroll après fermeture
        document.body.style.position = ''; // réinitialise les styles
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo({ top: scrollPosition, left: 0, behavior: 'instant' }); // remet la page instantanément
    }
    
    function closeExpandedBlock() { // ferme le clone agrandi si présent
        if (expandedClone) { // si un clone existe
            expandedClone.classList.remove('expanded'); // lance l'animation de fermeture en retirant la classe
            if (overlay) overlay.classList.remove('active'); // désactive l'overlay
            
            // Supprime aussi le bouton croix
            const closeBtn = document.querySelector('.histoire-close-btn');
            if (closeBtn) closeBtn.remove();
            
            setTimeout(() => { // attend la fin de l'animation avant de supprimer le DOM
                if (expandedClone && expandedClone.parentNode) {
                    expandedClone.parentNode.removeChild(expandedClone); // supprime le clone du DOM
                }
                expandedClone = null; // réinitialise la référence
            }, 500); // délai synchronisé avec la durée de l'animation
        }
        enableScroll(); // restaure le scroll de la page
    }
    
    histoireBlocks.forEach(block => { // pour chaque bloc histoire
        block.addEventListener('click', (e) => { // écoute le clic pour l'ouvrir
            e.stopPropagation(); // évite la propagation vers le body
            
            if (expandedClone) { // si déjà un clone ouvert, ferme-le (toggle)
                closeExpandedBlock();
                return;
            }
            
            disableScroll(); // bloque le scroll de fond
            if (overlay) overlay.classList.add('active'); // affiche l'overlay s'il existe
            
            expandedClone = block.cloneNode(true); // clone le bloc (copie profonde)
            expandedClone.classList.add('histoire-block-clone'); // ajoute une classe spécifique au clone
            expandedClone.classList.remove('visible'); // retire la classe visible pour éviter conflit d'animation
            
            document.body.appendChild(expandedClone); // ajoute le clone directement dans le body
            
            // Ajoute le bouton croix de fermeture EN DEHORS de la carte
            const closeBtn = document.createElement('button');
            closeBtn.className = 'card-close-btn histoire-close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeExpandedBlock();
            });
            document.body.appendChild(closeBtn);
            
            void expandedClone.offsetHeight; // force un reflow pour déclencher correctement la transition CSS
            
            setTimeout(() => {
                expandedClone.classList.add('expanded'); // ajoute la classe expanded pour l'animation d'ouverture
            }, 10); // petit délai pour garantir le reflow avant l'animation
            
            expandedClone.addEventListener('click', (e) => { // clic sur le clone ferme la vue étendue
                e.stopPropagation(); // évite de propager
                closeExpandedBlock(); // ferme le clone
            });
        });
    });
    
    if (overlay) { // si l'overlay existe
        overlay.addEventListener('click', (e) => { // clic sur l'overlay ferme le clone
            e.stopPropagation();
            closeExpandedBlock();
        });
    }
    
    document.addEventListener('keydown', (e) => { // écoute la touche Escape pour fermer
        if (e.key === 'Escape' && expandedClone) {
            closeExpandedBlock(); // ferme si ouvert
        }
    });

    // Timeline Animation - Tracé
    const timelineContainer = document.querySelector('.timeline-container');
    const circle = document.querySelector('.timeline-progress-circle');
    const pathElement = document.querySelector('#animatedPath');
    const startCircle = document.querySelector('.timeline-start-circle');

    if (timelineContainer && circle && pathElement) {
        
        function getTimelineX() {
            const width = window.innerWidth;
            if (width <= 375) return 12;
            if (width <= 480) return 15;
            if (width <= 768) return 18;
            return 50;
        }
        
        function isMobile() {
            return window.innerWidth <= 768;
        }

        let lastCircleY = 0; // Position du cercle (plus rapide)
        let lastPathY = 0;   // Position du tracé (plus lent)

        function getStartY() {
            const width = window.innerWidth;
            if (width <= 375) return 8;
            if (width <= 768) return 10;
            return 0;
        }

        function updateTimeline() {
            const containerRect = timelineContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const containerHeight = containerRect.height;
            const mobile = isMobile();
            const centerX = getTimelineX();
            const startY = getStartY();
            
            // Met à jour le cercle de départ
            if (startCircle) {
                startCircle.setAttribute('cx', mobile ? centerX : 50);
                startCircle.setAttribute('cy', startY);
            }
            
            // Calcul de la progression
            const containerTop = containerRect.top;
            const containerBottom = containerRect.bottom;
            
            const startTrigger = viewportHeight * 0.8;
            const endTrigger = viewportHeight * 0.2;
            
            let scrollProgress;
            
            if (containerTop > startTrigger) {
                scrollProgress = 0;
            } else if (containerBottom < endTrigger) {
                scrollProgress = 1;
            } else {
                const visibleStart = startTrigger - containerTop;
                const totalScrollDistance = containerHeight + startTrigger - endTrigger;
                scrollProgress = Math.max(0, Math.min(1, visibleStart / totalScrollDistance));
            }
            
            // Minimum 5% de tracé initial
            const minProgress = 0.05;
            const adjustedProgress = minProgress + (scrollProgress * (1 - minProgress));
            
            // Position Y cible
            let targetY = startY + (adjustedProgress * (containerHeight - startY));
            
            // ====== DIFFÉRENCE DE VITESSE ======
            // Le cercle suit plus rapidement (smoothFactor plus élevé)
            const circleSmoothFactor = 0.4;
            // Le tracé suit plus lentement (smoothFactor plus bas)
            const pathSmoothFactor = 0.15;
            
            // Initialisation
            if (lastCircleY === 0 || lastCircleY < startY) {
                lastCircleY = targetY;
                lastPathY = targetY;
            } else {
                // Le cercle rattrape plus vite
                lastCircleY = lastCircleY + (targetY - lastCircleY) * circleSmoothFactor;
                // Le tracé rattrape plus lentement
                lastPathY = lastPathY + (targetY - lastPathY) * pathSmoothFactor;
            }
            
            // Le tracé ne peut pas dépasser le cercle
            const pathY = Math.min(lastPathY, lastCircleY);
            const circleY = lastCircleY;
            
            if (mobile) {
                // Mobile: ligne droite verticale à gauche
                pathElement.setAttribute('d', `M ${centerX} ${startY} L ${centerX} ${pathY}`);
                circle.setAttribute('cx', centerX);
                circle.setAttribute('cy', circleY);
            } else {
                // Desktop: zigzag pour le cercle
                const segment = Math.floor(circleY / 500);
                const segmentProgress = (circleY % 500) / 500;
                
                let xPosition;
                if (segment % 2 === 0) {
                    xPosition = 50 + Math.sin(segmentProgress * Math.PI) * 35;
                } else {
                    xPosition = 50 - Math.sin(segmentProgress * Math.PI) * 35;
                }
                
                circle.setAttribute('cy', circleY);
                circle.setAttribute('cx', xPosition);
                
                // Tracé zigzag (plus lent)
                const pathProgress = (pathY - startY) / (containerHeight - startY);
                let pathData = 'M 50 0';
                const steps = Math.max(1, Math.floor(pathProgress * 500));
                
                for (let i = 1; i <= steps; i++) {
                    const t = i / 500;
                    const y = startY + (t * (containerHeight - startY));
                    
                    const seg = Math.floor(y / 500);
                    const segProg = (y % 500) / 500;
                    
                    let x;
                    if (seg % 2 === 0) {
                        x = 50 + Math.sin(segProg * Math.PI) * 35;
                    } else {
                        x = 50 - Math.sin(segProg * Math.PI) * 35;
                    }
                    
                    pathData += ` L ${x} ${y}`;
                }
                
                pathElement.setAttribute('d', pathData);
            }
            
            circle.style.opacity = '1';
        }

        // Initialisation avec requestAnimationFrame pour une mise à jour fluide
        function animateTimeline() {
            updateTimeline();
            requestAnimationFrame(animateTimeline);
        }
        
        // Démarre l'animation
        animateTimeline();
        
        // Mise à jour au resize
        window.addEventListener('resize', () => {
            lastCircleY = 0;
            lastPathY = 0;
        });
    }

    // Culture Slider
    const cultureSlides = document.querySelectorAll('.culture-slide'); // collection de slides
    const cultureDots = document.querySelectorAll('.culture-dot'); // collection de points de navigation
    const arrowLeft = document.querySelector('.culture-arrow-left'); // flèche gauche
    const arrowRight = document.querySelector('.culture-arrow-right'); // flèche droite
    const slidesContainer = document.querySelector('.culture-slides'); // container qui contient les slides
    
    let currentSlide = 0; // index de la slide courante
    const totalSlides = cultureSlides.length; // nombre total de slides initial
    let isSlideAnimating = false; // verrou pour éviter les actions concurrentes
    
    // Clone les slides pour l'effet de boucle infinie
    function setupInfiniteSlider() {
        if (!slidesContainer || cultureSlides.length === 0) return; // sortie si éléments manquants
        
        // Clone la première et dernière slide
        const firstClone = cultureSlides[0].cloneNode(true); // clone de la première
        const lastClone = cultureSlides[totalSlides - 1].cloneNode(true); // clone de la dernière
        
        firstClone.classList.add('clone'); // marque le clone
        lastClone.classList.add('clone');
        
        // Ajoute les clones
        slidesContainer.appendChild(firstClone); // ajoute clone en fin
        slidesContainer.insertBefore(lastClone, cultureSlides[0]); // ajoute clone en début
        
        // Décale pour commencer sur la vraie première slide (index 1 car clone au début)
        slidesContainer.style.transform = `translateX(-100%)`; // translate pour montrer la vraie 1ère
    }
    
    setupInfiniteSlider(); // initialise le slider infini
    
    function goToSlide(index) { // navigation vers une slide donnée
        if (isSlideAnimating) return; // ignore si une transition est en cours
        isSlideAnimating = true; // verrouille les actions
        
        const totalSlides = cultureSlides.length; // recalcule (réutilisation locale)
        const translateValue = -((index + 1) * 100); // calcule le pourcentage à déplacer (compte le clone)
    
        slidesContainer.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; // applique la transition
        slidesContainer.style.transform = `translateX(${translateValue}%)`; // effectue la translation
    
        let dotIndex = ((index % totalSlides) + totalSlides) % totalSlides; // index normalisé pour les dots
        cultureDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === dotIndex); // met à jour la classe active sur les dots
        });
        cultureSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === dotIndex); // met à jour la slide active (pour styles)
        });
    
        setTimeout(() => { // après la transition
            // Boucle droite (dernière vers première)
            if (index >= totalSlides) { // si on a dépassé la dernière
                slidesContainer.style.transition = 'none'; // supprime transition pour reset instantané
                slidesContainer.style.transform = `translateX(-100%)`; // remet la vraie première en place
                currentSlide = 0; // remet l'index courant
                void slidesContainer.offsetHeight; // force reflow
            }
            // Boucle gauche (première vers dernière)
            else if (index < 0) { // si on est avant la première
                slidesContainer.style.transition = 'none';
                slidesContainer.style.transform = `translateX(-${totalSlides * 100}%)`; // place la vraie dernière
                currentSlide = totalSlides - 1; // met à jour currentSlide
                void slidesContainer.offsetHeight; // force reflow
            } else {
                currentSlide = index; // cas normal : met à jour currentSlide
            }
            isSlideAnimating = false; // libère le verrou d'animation
        }, 600); // délai calé sur la durée de transition
    }
    
    if (arrowLeft && arrowRight) { // si les flèches existent
        arrowLeft.addEventListener('click', () => {
            goToSlide(currentSlide - 1); // va à la slide précédente
        });
        
        arrowRight.addEventListener('click', () => {
            goToSlide(currentSlide + 1); // va à la slide suivante
        });
    }
    
    // Culture Slider - Ajoute les flèches mobiles
    const arrowLeftMobile = document.querySelector('.culture-arrow-left-mobile');
    const arrowRightMobile = document.querySelector('.culture-arrow-right-mobile');
    
    if (arrowLeftMobile) {
        arrowLeftMobile.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }
    
    if (arrowRightMobile) {
        arrowRightMobile.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }
    
    cultureDots.forEach((dot, index) => { // pour chaque dot
        dot.addEventListener('click', () => {
            if (currentSlide === index) return; // si déjà sur la bonne slide, ne rien faire
            goToSlide(index); // navigation vers l'index cliqué
        });
    });
    
    // Auto-slide toutes les 5 secondes
    let autoSlideInterval = setInterval(() => {
        goToSlide(currentSlide + 1); // avance automatiquement d'une slide
    }, 5000);
    
    // Pause l'auto-slide au hover
    const cultureSlider = document.querySelector('.culture-slider'); // container global du slider
    if (cultureSlider) { // si présent
        cultureSlider.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval); // stoppe l'auto-slide au survol
        });
        
        cultureSlider.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(() => { // relance l'auto-slide au départ de la souris
                goToSlide(currentSlide + 1);
            }, 5000);
        });
    }

    // Tech Cards - Expansion au clic (comme histoire)
    const techCards = document.querySelectorAll('.tech-card');
    let expandedTechCard = null;
    
    function closeTechCard() {
        if (expandedTechCard) {
            expandedTechCard.classList.remove('expanded');
            if (overlay) overlay.classList.remove('active');
            
            // Supprime aussi le bouton croix
            const closeBtn = document.querySelector('.tech-close-btn');
            if (closeBtn) closeBtn.remove();
            
            setTimeout(() => {
                if (expandedTechCard && expandedTechCard.parentNode) {
                    expandedTechCard.parentNode.removeChild(expandedTechCard);
                }
                expandedTechCard = null;
            }, 500);
        }
        enableScroll();
    }
    
    // Fonction pour ouvrir une tech card en plein écran
    function openTechCardExpanded(card) {
        if (expandedTechCard) {
            closeTechCard();
            return;
        }
        
        disableScroll();
        if (overlay) overlay.classList.add('active');
        
        // Crée le clone agrandi
        expandedTechCard = document.createElement('div');
        expandedTechCard.className = 'tech-card-expanded';
        
        // Récupère le contenu de la carte
        const title = card.querySelector('h3').textContent;
        const shortText = card.querySelector('.tech-card-back p').textContent;
        const detailsEl = card.querySelector('.tech-card-details');
        const details = detailsEl ? detailsEl.innerHTML : '';
        
        expandedTechCard.innerHTML = `
            <h3>${title}</h3>
            <p class="tech-intro">${shortText}</p>
            <div class="tech-details">${details}</div>
        `;
        
        document.body.appendChild(expandedTechCard);
        
        // Ajoute le bouton croix EN DEHORS de la carte
        const closeBtn = document.createElement('button');
        closeBtn.className = 'card-close-btn tech-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTechCard();
        });
        document.body.appendChild(closeBtn);
        
        void expandedTechCard.offsetHeight; // force reflow
        
        setTimeout(() => {
            expandedTechCard.classList.add('expanded');
        }, 10);
        
        expandedTechCard.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTechCard();
        });
    }

    // Clic sur la carte OU sur le bouton "+" pour ouvrir en plein écran
    techCards.forEach(card => {
        // Clic sur toute la carte
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            openTechCardExpanded(card);
        });
        
        // Clic sur le "+" (empêche la propagation pour ne pas doubler)
        const plusBtn = card.querySelector('.tech-card-plus');
        if (plusBtn) {
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openTechCardExpanded(card);
            });
        }
    });
    
    // Fermer avec l'overlay
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (expandedTechCard) {
                e.stopPropagation();
                closeTechCard();
            }
        });
    }
    
    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && expandedTechCard) {
            closeTechCard();
        }
    });

    // ==================== ACCORDÉON MOBILE (Société) ====================
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            // Ferme tous les autres accordéons
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle l'accordéon cliqué
            item.classList.toggle('active');
        });
    });

    // ==================== MASONRY CARDS - Expansion au clic ====================
    const masonryCards = document.querySelectorAll('.masonry-card');
    let expandedMasonryCard = null;
    let masonryCloseBtn = null;

    function closeMasonryCard() {
        if (expandedMasonryCard) {
            expandedMasonryCard.classList.remove('expanded');
            if (overlay) overlay.classList.remove('active');
            
            // Supprime le bouton croix
            if (masonryCloseBtn && masonryCloseBtn.parentNode) {
                masonryCloseBtn.parentNode.removeChild(masonryCloseBtn);
                masonryCloseBtn = null;
            }
            
            setTimeout(() => {
                if (expandedMasonryCard && expandedMasonryCard.parentNode) {
                    expandedMasonryCard.parentNode.removeChild(expandedMasonryCard);
                }
                expandedMasonryCard = null;
            }, 500);
        }
        enableScroll();
    }

    masonryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (expandedMasonryCard) {
                closeMasonryCard();
                return;
            }
            
            disableScroll();
            if (overlay) overlay.classList.add('active');
            
            // Crée la card agrandie
            expandedMasonryCard = document.createElement('div');
            expandedMasonryCard.className = 'masonry-card-expanded';
            
            // Récupère le contenu
            const title = card.querySelector('h3').textContent;
            const introP = card.querySelector('p').textContent;
            const detailsEl = card.querySelector('.masonry-details');
            const details = detailsEl ? detailsEl.innerHTML : '';
            
            expandedMasonryCard.innerHTML = `
                <h3>${title}</h3>
                <p class="masonry-intro">${introP}</p>
                <div class="masonry-full-details">${details}</div>
            `;
            
            document.body.appendChild(expandedMasonryCard);
            
            // Crée le bouton croix
            masonryCloseBtn = document.createElement('button');
            masonryCloseBtn.className = 'card-close-btn societe-close-btn';
            masonryCloseBtn.innerHTML = '×';
            masonryCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMasonryCard();
            });
            document.body.appendChild(masonryCloseBtn);
            
            void expandedMasonryCard.offsetHeight;
            
            setTimeout(() => {
                expandedMasonryCard.classList.add('expanded');
            }, 10);
            
            expandedMasonryCard.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMasonryCard();
            });
        });
    });

    // ==================== CAROUSEL IMAGES - Expansion au clic ====================
    const carouselImages = document.querySelectorAll('.carousel img');
    let expandedCarouselImage = null;
    let carouselCloseBtn = null;

    function closeCarouselImage() {
        if (expandedCarouselImage) {
            expandedCarouselImage.classList.remove('expanded');
            if (overlay) overlay.classList.remove('active');
            
            // Supprime le bouton croix
            if (carouselCloseBtn && carouselCloseBtn.parentNode) {
                carouselCloseBtn.parentNode.removeChild(carouselCloseBtn);
                carouselCloseBtn = null;
            }
            
            setTimeout(() => {
                if (expandedCarouselImage && expandedCarouselImage.parentNode) {
                    expandedCarouselImage.parentNode.removeChild(expandedCarouselImage);
                }
                expandedCarouselImage = null;
            }, 500);
        }
        enableScroll();
    }

    carouselImages.forEach(img => {
        img.style.cursor = 'pointer';
        
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (expandedCarouselImage) {
                closeCarouselImage();
                return;
            }
            
            disableScroll();
            if (overlay) overlay.classList.add('active');
            
            // Crée l'image agrandie
            expandedCarouselImage = document.createElement('img');
            expandedCarouselImage.className = 'carousel-image-expanded';
            expandedCarouselImage.src = img.src.replace('w=800', 'w=1600'); // meilleure résolution
            expandedCarouselImage.alt = img.alt;
            
            document.body.appendChild(expandedCarouselImage);
            
            // Crée le bouton croix
            carouselCloseBtn = document.createElement('button');
            carouselCloseBtn.className = 'card-close-btn carousel-close-btn';
            carouselCloseBtn.innerHTML = '×';
            carouselCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeCarouselImage();
            });
            document.body.appendChild(carouselCloseBtn);
            
            void expandedCarouselImage.offsetHeight;
            
            setTimeout(() => {
                expandedCarouselImage.classList.add('expanded');
            }, 10);
            
            expandedCarouselImage.addEventListener('click', (e) => {
                e.stopPropagation();
                closeCarouselImage();
            });
        });
    });

    // Escape pour fermer masonry et carousel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (expandedMasonryCard) closeMasonryCard();
            if (expandedCarouselImage) closeCarouselImage();
        }
    });

    // Overlay pour fermer masonry et carousel
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (expandedMasonryCard) {
                e.stopPropagation();
                closeMasonryCard();
            }
            if (expandedCarouselImage) {
                e.stopPropagation();
                closeCarouselImage();
            }
        });
    }

    // ==================== INDICATEURS DANS LES CARTES (bord du bas) ====================
    
    // Ajouter indicateur "+" dans les cartes Société
    masonryCards.forEach(card => {
        const hint = document.createElement('span');
        hint.className = 'card-expand-hint masonry-hint';
        hint.innerHTML = '+';
        card.appendChild(hint);
    });
    
    // Ajouter indicateur "+" dans les cartes Histoire
    histoireBlocks.forEach(block => {
        const hint = document.createElement('span');
        hint.className = 'card-expand-hint histoire-hint';
        hint.innerHTML = '+';
        block.appendChild(hint);
    });
    
    // Ajouter indicateur "agrandir" dans les images carousel
    carouselImages.forEach(img => {
        // Pour les images, on a besoin d'un wrapper car img ne peut pas contenir d'enfants
        const wrapper = document.createElement('div');
        wrapper.className = 'carousel-img-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        const hint = document.createElement('span');
        hint.className = 'card-expand-hint carousel-expand-hint';
        hint.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>`;
        wrapper.appendChild(hint);
        
        // Clic sur le hint déclenche l'agrandissement
        hint.addEventListener('click', (e) => {
            e.stopPropagation();
            img.click(); // Déclenche le clic sur l'image
        });
    });

}); // fin du DOMContentLoaded

// Masquer le loader quand la page est prête
window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.classList.add('hidden');
    }
});

// ==================== MENU HAMBURGER ====================
    
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
let menuScrollPosition = 0;

function disableMenuScroll() {
    menuScrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${menuScrollPosition}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
}

function enableMenuScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: menuScrollPosition, left: 0, behavior: 'instant' });
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    
    // Bloquer/débloquer le scroll
    if (mobileMenu.classList.contains('active')) {
        disableMenuScroll();
    } else {
        enableMenuScroll();
    }
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    enableMenuScroll();
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

// Fermer le menu quand on clique sur un lien
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

// Fermer le menu avec la touche Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

// ==================== BOUTON RETOUR EN HAUT ====================

const scrollToTopBtn = document.querySelector('.scroll-to-top');

if (scrollToTopBtn) {
    // Afficher/masquer le bouton selon le scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Clic pour remonter en haut
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}