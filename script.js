(function () {
  "use strict";

  var root = document.getElementById("ms-site");
  if (!root) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var year = root.querySelector("#current-year");
  var header = root.querySelector(".site-header");
  var progress = root.querySelector(".scroll-progress span");
  if (year) year.textContent = String(new Date().getFullYear());

  var typingText = root.querySelector("[data-typing-text]");
  if (typingText && !reducedMotion) {
    var typingPhrases = ["Le Coran.", "La Sunnah.", "La langue arabe.", "Les sciences religieuses."];
    var typingIndex = 0;
    var typingPosition = typingPhrases[0].length;
    var typingDeleting = true;

    function animateTypingText() {
      var currentPhrase = typingPhrases[typingIndex];
      if (typingDeleting) {
        typingPosition -= 1;
        typingText.textContent = currentPhrase.slice(0, typingPosition);
        if (typingPosition === 0) {
          typingDeleting = false;
          typingIndex = (typingIndex + 1) % typingPhrases.length;
          window.setTimeout(animateTypingText, 400);
          return;
        }
        window.setTimeout(animateTypingText, 45);
        return;
      }

      var nextPhrase = typingPhrases[typingIndex];
      typingPosition += 1;
      typingText.textContent = nextPhrase.slice(0, typingPosition);
      if (typingPosition >= nextPhrase.length) {
        typingDeleting = true;
        window.setTimeout(animateTypingText, 1600);
        return;
      }
      window.setTimeout(animateTypingText, 85);
    }

    window.setTimeout(animateTypingText, 1700);
  }

  var headingTypewriteGroups = Array.prototype.slice.call(root.querySelectorAll("[data-heading-typewrite-group]"));
  if (!reducedMotion && "IntersectionObserver" in window && headingTypewriteGroups.length) {
    var headingTypewriteTimers = new WeakMap();

    function resetHeadingGroup(group) {
      var pendingTimer = headingTypewriteTimers.get(group);
      if (pendingTimer) window.clearTimeout(pendingTimer);
      headingTypewriteTimers.delete(group);
      group.classList.remove("is-typing");
      var text = group.querySelector("[data-heading-typewrite]");
      if (text) {
        if (typeof text.dataset.typewritePhrase === "undefined") text.dataset.typewritePhrase = text.textContent;
        text.textContent = "";
      }
    }

    function typeHeadingGroup(group) {
      var text = group.querySelector("[data-heading-typewrite]");
      if (!text) return;
      var pendingTimer = headingTypewriteTimers.get(group);
      if (pendingTimer) window.clearTimeout(pendingTimer);
      if (typeof text.dataset.typewritePhrase === "undefined") text.dataset.typewritePhrase = text.textContent;
      var phrase = text.dataset.typewritePhrase;
      var position = 0;
      text.textContent = "";
      group.classList.add("is-typing");

      function writeNextCharacter() {
        position += 1;
        text.textContent = phrase.slice(0, position);
        if (position < phrase.length) {
          headingTypewriteTimers.set(group, window.setTimeout(writeNextCharacter, 65));
        } else {
          headingTypewriteTimers.delete(group);
          group.classList.remove("is-typing");
        }
      }

      headingTypewriteTimers.set(group, window.setTimeout(writeNextCharacter, 180));
    }

    try {
      var headingTypewriteObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) typeHeadingGroup(entry.target);
          else resetHeadingGroup(entry.target);
        });
      }, { threshold: 0.2, rootMargin: "0px 0px -4% 0px" });

      headingTypewriteGroups.forEach(function (group) { headingTypewriteObserver.observe(group); });
    } catch (error) {
      // En cas d’échec du navigateur, les textes restent visibles sans animation.
    }
  }

  var menuButton = root.querySelector(".menu-toggle");
  var nav = root.querySelector(".site-nav");
  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
    nav.classList.remove("is-open");
  }
  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      nav.classList.toggle("is-open", open);
    });
    nav.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 950) closeMenu(); }, { passive: true });
  }

  var supportMethods = Array.prototype.slice.call(root.querySelectorAll("[data-support-method]"));
  var supportProceed = root.querySelector("[data-support-proceed]");
  if (supportMethods.length && supportProceed) {
    function selectSupportMethod(input) {
      supportMethods.forEach(function (method) {
        var card = method.closest(".support-payment-card");
        if (card) card.classList.toggle("is-selected", method === input);
      });
      supportProceed.href = input.value;
      supportProceed.setAttribute("aria-label", "Procéder au don avec " + input.getAttribute("data-support-method"));
    }
    supportMethods.forEach(function (method) {
      method.addEventListener("change", function () { if (method.checked) selectSupportMethod(method); });
      if (method.checked) selectSupportMethod(method);
    });
  }

  var contactForm = root.querySelector("[data-contact-form]");
  if (contactForm) {
    var contactStatus = contactForm.querySelector("[data-contact-form-status]");

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      var data = new FormData(contactForm);
      var firstName = String(data.get("firstName") || "").trim();
      var email = String(data.get("email") || "").trim();
      var subject = String(data.get("subject") || "").trim();
      var message = String(data.get("message") || "").trim();

      var emailSubject = "Question au Merkez Salsabil — " + subject;
      var emailBody = [
        "Salam alaykoum,",
        "",
        "Prénom : " + firstName,
        email ? "Adresse pour me répondre : " + email : "",
        "Sujet : " + subject,
        "",
        message
      ].filter(Boolean).join("\n");
      var mailtoUrl = "mailto:contact.merkezsalsabil@gmail.com?subject=" + encodeURIComponent(emailSubject)
        + "&body=" + encodeURIComponent(emailBody);
      if (contactStatus) contactStatus.textContent = "Votre application de messagerie va s’ouvrir avec le brouillon. Relisez-le puis envoyez-le.";
      window.location.assign(mailtoUrl);
    });
  }

  var testimonialCarousel = root.querySelector("[data-testimonial-carousel]");
  if (testimonialCarousel) {
    var testimonialTrack = testimonialCarousel.querySelector("[data-testimonial-track]");
    var testimonialSlides = Array.prototype.slice.call(testimonialCarousel.querySelectorAll("[data-testimonial-slide]"));
    var testimonialToggle = testimonialCarousel.querySelector("[data-testimonial-toggle]");

    if (testimonialTrack && testimonialSlides.length) {
      var testimonialUserPaused = false;
      var testimonialFrame = null;
      var testimonialLastTime = 0;
      var testimonialOffset = 0;
      var testimonialCardAdvance = 0;
      var testimonialGap = 16;
      var testimonialSpeed = 24;

      function testimonialColumns() {
        if (window.innerWidth <= 620) return 1;
        if (window.innerWidth <= 980) return 2;
        return 3;
      }

      function sizeTestimonialTrack() {
        var columns = testimonialColumns();
        testimonialGap = parseFloat(window.getComputedStyle(testimonialTrack).columnGap) || 16;
        var slideWidth = Math.max(220, (testimonialCarousel.querySelector(".student-carousel-viewport").clientWidth - testimonialGap * (columns - 1)) / columns);
        testimonialSlides.forEach(function (slide) { slide.style.width = slideWidth + "px"; });
        testimonialCardAdvance = testimonialSlides[0].getBoundingClientRect().width + testimonialGap;
        if (testimonialCardAdvance) {
          testimonialOffset %= testimonialCardAdvance;
          testimonialTrack.style.transform = "translate3d(-" + testimonialOffset + "px, 0, 0)";
        }
      }

      function stopTestimonialMotion() {
        if (testimonialFrame) window.cancelAnimationFrame(testimonialFrame);
        testimonialFrame = null;
        testimonialLastTime = 0;
      }

      function animateTestimonialTrack(timestamp) {
        if (testimonialLastTime) {
          var elapsed = Math.min(48, timestamp - testimonialLastTime);
          testimonialOffset += testimonialSpeed * elapsed / 1000;
          while (testimonialCardAdvance && testimonialOffset >= testimonialCardAdvance) {
            testimonialTrack.appendChild(testimonialTrack.firstElementChild);
            testimonialOffset -= testimonialCardAdvance;
          }
          testimonialTrack.style.transform = "translate3d(-" + testimonialOffset + "px, 0, 0)";
        }
        testimonialLastTime = timestamp;
        testimonialFrame = window.requestAnimationFrame(animateTestimonialTrack);
      }

      function updateTestimonialMotion() {
        var shouldMove = !reducedMotion && !testimonialUserPaused;
        if (shouldMove && !testimonialFrame) testimonialFrame = window.requestAnimationFrame(animateTestimonialTrack);
        else if (!shouldMove) stopTestimonialMotion();
      }

      if (testimonialToggle) {
        if (reducedMotion) testimonialToggle.hidden = true;
        testimonialToggle.addEventListener("click", function () {
          testimonialUserPaused = !testimonialUserPaused;
          var label = testimonialToggle.querySelector(".testimonial-toggle-label");
          var icon = testimonialToggle.querySelector("[aria-hidden='true']");
          testimonialToggle.setAttribute("aria-pressed", String(testimonialUserPaused));
          testimonialToggle.setAttribute("aria-label", testimonialUserPaused ? "Reprendre le défilement continu" : "Mettre le défilement en pause");
          if (label) label.textContent = testimonialUserPaused ? "Reprendre" : "Pause";
          if (icon) icon.textContent = testimonialUserPaused ? "▶" : "Ⅱ";
          updateTestimonialMotion();
        });
      }
      window.addEventListener("resize", sizeTestimonialTrack, { passive: true });

      if (!reducedMotion) {
        testimonialCarousel.classList.add("is-looping");
        sizeTestimonialTrack();
        updateTestimonialMotion();
      } else {
        testimonialCarousel.classList.add("is-static");
      }
    }
  }

  var revealItems = Array.prototype.slice.call(root.querySelectorAll("[data-reveal]"));
  if (!reducedMotion && "IntersectionObserver" in window && revealItems.length) {
    root.classList.add("has-reveal");
    try {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
      revealItems.forEach(function (item) {
        if (item.getBoundingClientRect().top < window.innerHeight * 0.9) item.classList.add("is-visible");
        else revealObserver.observe(item);
      });
    } catch (error) {
      root.classList.remove("has-reveal");
      revealItems.forEach(function (item) { item.classList.add("is-visible"); });
    }
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  var scrollFrame = 0;
  function updateScrollEffects() {
    scrollFrame = 0;
    var scrollY = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", scrollY > 36);
    if (progress) {
      var pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (pageHeight > 0 ? Math.min(1, Math.max(0, scrollY / pageHeight)) : 0) + ")";
    }
  }
  window.addEventListener("scroll", function () {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  var ramadanProgram = root.querySelector("[data-ramadan-program]");
  if (ramadanProgram) {
    var ramadanDays = Array.prototype.slice.call(ramadanProgram.parentElement.querySelectorAll(".ramadan-day[data-day]"));
    var allowedDays = new Set(ramadanDays.map(function (button) { return Number(button.getAttribute("data-day")); }));
    var completedDays = new Set();
    var progressKey = "merkez-salsabil-ramadan-reading-v1";
    var completedCount = ramadanProgram.querySelector("[data-completed-count]");
    var progressBar = ramadanProgram.querySelector("[data-progress-bar]");
    var progressFill = ramadanProgram.querySelector("[data-progress-fill]");
    var resetProgress = ramadanProgram.querySelector("[data-reset-progress]");

    try {
      var storedDays = JSON.parse(window.localStorage.getItem(progressKey) || "[]");
      if (Array.isArray(storedDays)) {
        storedDays.forEach(function (day) {
          var dayNumber = Number(day);
          if (allowedDays.has(dayNumber)) completedDays.add(dayNumber);
        });
      }
    } catch (error) {
      completedDays.clear();
    }

    function renderRamadanProgress(saveProgress) {
      ramadanDays.forEach(function (button) {
        var dayNumber = Number(button.getAttribute("data-day"));
        var completed = completedDays.has(dayNumber);
        var status = button.querySelector(".ramadan-day-status span");
        button.classList.toggle("is-complete", completed);
        button.setAttribute("aria-pressed", String(completed));
        if (status) status.textContent = completed ? "Terminé" : "À lire";
      });

      var count = completedDays.size;
      if (completedCount) completedCount.textContent = String(count);
      if (progressBar) progressBar.setAttribute("aria-valuenow", String(count));
      if (progressFill) progressFill.style.width = (count / Math.max(1, ramadanDays.length) * 100) + "%";
      if (resetProgress) resetProgress.disabled = count === 0;

      if (saveProgress) {
        try { window.localStorage.setItem(progressKey, JSON.stringify(Array.from(completedDays))); }
        catch (error) { /* Le suivi reste utilisable durant cette visite si le stockage est bloqué. */ }
      }
    }

    ramadanDays.forEach(function (button) {
      button.addEventListener("click", function () {
        var dayNumber = Number(button.getAttribute("data-day"));
        if (completedDays.has(dayNumber)) completedDays.delete(dayNumber);
        else completedDays.add(dayNumber);
        renderRamadanProgress(true);
      });
    });

    if (resetProgress) {
      resetProgress.addEventListener("click", function () {
        if (!completedDays.size || !window.confirm("Effacer la progression de lecture enregistrée sur cet appareil ?")) return;
        completedDays.clear();
        renderRamadanProgress(true);
      });
    }

    renderRamadanProgress(false);
  }

  var filterButtons = root.querySelectorAll(".poster-filter");
  var audienceButtons = root.querySelectorAll(".audience-filter");
  var audiencePanels = root.querySelectorAll("[data-audience-panel]");
  var posterCards = root.querySelectorAll(".poster-card[data-category]");
  var activeCategory = "all";
  var activeAudience = "all";

  function applyPosterFilters() {
    posterCards.forEach(function (card) {
      var categoryMatches = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
      var cardAudience = card.getAttribute("data-gender") || "all";
      var audienceMatches = activeAudience === "all" || cardAudience === "all" || cardAudience === activeAudience;
      card.hidden = !categoryMatches || !audienceMatches;
    });
    audiencePanels.forEach(function (panel) {
      panel.hidden = activeAudience !== "all" && panel.getAttribute("data-audience-panel") !== activeAudience;
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeCategory = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyPosterFilters();
    });
  });

  audienceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeAudience = button.getAttribute("data-audience-filter") || "all";
      audienceButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyPosterFilters();
    });
  });
  applyPosterFilters();

  var carousel = root.querySelector("[data-carousel]");
  var syncCarouselTimer = null;
  if (carousel) {
    var heroSection = carousel.closest(".hero");
    var brandTransition = heroSection && heroSection.querySelector("[data-brand-transition]");
    var brandParticleLayer = brandTransition && brandTransition.querySelector("[data-brand-particles]");
    var brandResetTimer = 0;
    var brandParticleTimer = 0;
    var track = carousel.querySelector(".hero-carousel-track");
    var allSlides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var slides = [];
    var carouselAudienceButtons = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-audience]"));
    var count = carousel.querySelector("[data-carousel-count]");
    var total = carousel.querySelector("[data-carousel-total]");
    var caption = carousel.querySelector(".hero-carousel-caption");
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var toggle = carousel.querySelector("[data-carousel-toggle]");
    var activeIndex = 0;
    var carouselAudience = "hommes";
    var timer = 0;
    var userPaused = false;
    var pointerInside = false;
    var focusInside = false;

    function animateBrandTransition(audience) {
      if (!brandTransition) return;
      brandTransition.classList.toggle("is-rose", audience === "femmes");
      if (reducedMotion) return;

      brandTransition.classList.remove("is-switching");
      void brandTransition.offsetWidth;
      brandTransition.classList.add("is-switching");
      if (brandResetTimer) window.clearTimeout(brandResetTimer);
      brandResetTimer = window.setTimeout(function () {
        brandTransition.classList.remove("is-switching");
      }, 1350);

      if (!brandParticleLayer) return;
      if (brandParticleTimer) window.clearTimeout(brandParticleTimer);
      brandParticleLayer.replaceChildren();
      var particleCount = 18;
      for (var particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
        var angle = (Math.PI * 2 * particleIndex) / particleCount;
        var radius = 33 + (particleIndex % 3) * 7;
        var particle = document.createElement("span");
        particle.className = "hero-brand-particle";
        particle.style.setProperty("--spark-left", (50 + Math.cos(angle) * radius) + "%");
        particle.style.setProperty("--spark-top", (50 + Math.sin(angle) * radius) + "%");
        particle.style.setProperty("--spark-x", (Math.cos(angle) * (28 + (particleIndex % 4) * 8)) + "px");
        particle.style.setProperty("--spark-y", (Math.sin(angle) * (28 + (particleIndex % 4) * 8)) + "px");
        particle.style.setProperty("--spark-size", (3 + (particleIndex % 3)) + "px");
        particle.style.setProperty("--spark-delay", ((particleIndex % 6) * 35) + "ms");
        particle.style.setProperty("--spark-color", audience === "femmes" ? "#c9877b" : "#d4b46b");
        brandParticleLayer.appendChild(particle);
      }
      brandParticleTimer = window.setTimeout(function () {
        brandParticleLayer.replaceChildren();
      }, 1500);
    }

    function selectSlide(index) {
      if (!slides.length || !track) return;
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (activeIndex * 100) + "%)";
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
        slide.tabIndex = active ? 0 : -1;
        if ("inert" in slide) slide.inert = !active;
      });
      if (count) count.textContent = String(activeIndex + 1).padStart(2, "0");
      if (caption) caption.textContent = slides[activeIndex].getAttribute("data-caption") || "Affiche du Merkez Salsabil";
    }

    function setCarouselAudience(audience) {
      var audienceChanged = carouselAudience !== audience;
      carouselAudience = audience;
      if (heroSection) heroSection.classList.toggle("is-women", carouselAudience === "femmes");
      if (audienceChanged) animateBrandTransition(carouselAudience);
      slides = allSlides.filter(function (slide) { return slide.getAttribute("data-audience") === carouselAudience; });
      allSlides.forEach(function (slide) {
        var inAudience = slide.getAttribute("data-audience") === carouselAudience;
        slide.hidden = !inAudience;
        slide.setAttribute("aria-hidden", "true");
        slide.tabIndex = -1;
        if ("inert" in slide) slide.inert = true;
      });
      carouselAudienceButtons.forEach(function (button) {
        var selected = button.getAttribute("data-carousel-audience") === carouselAudience;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      if (total) total.textContent = String(slides.length).padStart(2, "0");
      activeIndex = 0;
      selectSlide(0);
      syncCarouselTimer();
    }

    function stopCarouselTimer() {
      if (timer) window.clearInterval(timer);
      timer = 0;
    }

    syncCarouselTimer = function () {
      stopCarouselTimer();
      if (reducedMotion || userPaused || pointerInside || focusInside || document.hidden || (viewer && viewer.open) || slides.length < 2) return;
      timer = window.setInterval(function () {
        if (!viewer || !viewer.open) selectSlide(activeIndex + 1);
      }, 5000);
    };

    if (allSlides.length && track) {
      carouselAudienceButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          setCarouselAudience(button.getAttribute("data-carousel-audience") || "hommes");
        });
      });
      setCarouselAudience("hommes");
      if (previous) previous.addEventListener("click", function () { selectSlide(activeIndex - 1); syncCarouselTimer(); });
      if (next) next.addEventListener("click", function () { selectSlide(activeIndex + 1); syncCarouselTimer(); });
      if (toggle) toggle.addEventListener("click", function () {
        userPaused = !userPaused;
        toggle.setAttribute("aria-pressed", String(userPaused));
        toggle.setAttribute("aria-label", userPaused ? "Reprendre le défilement automatique" : "Mettre en pause le défilement automatique");
        toggle.textContent = userPaused ? "▶" : "Ⅱ";
        syncCarouselTimer();
      });
      carousel.addEventListener("mouseenter", function () { pointerInside = true; syncCarouselTimer(); });
      carousel.addEventListener("mouseleave", function () { pointerInside = false; syncCarouselTimer(); });
      carousel.addEventListener("focusin", function (event) {
        focusInside = !event.target.closest("[data-carousel-audience]");
        syncCarouselTimer();
      });
      carousel.addEventListener("focusout", function () {
        window.setTimeout(function () {
          focusInside = carousel.contains(document.activeElement) && !document.activeElement.closest("[data-carousel-audience]");
          syncCarouselTimer();
        }, 0);
      });
      document.addEventListener("visibilitychange", syncCarouselTimer);
    }
  }

  var viewer = document.querySelector(".poster-viewer");
  var viewerImage = viewer && viewer.querySelector(".viewer-image");
  var viewerTitle = viewer && viewer.querySelector(".viewer-title");
  var viewerClose = viewer && viewer.querySelector(".viewer-close");
  if (viewer && viewerImage && viewerTitle && typeof viewer.showModal === "function") {
    root.querySelectorAll(".poster-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var image = trigger.getAttribute("data-image");
        var title = trigger.getAttribute("data-title") || "Affiche du Merkez Salsabil";
        if (!image) return;
        function openViewer() {
          viewerImage.src = image;
          viewerImage.alt = title;
          viewerTitle.textContent = title;
          viewer.showModal();
          if (viewerClose) viewerClose.focus();
        }

        // L’affiche « s’envole » de sa vignette vers la visionneuse quand le navigateur le permet.
        var thumbnail = trigger.querySelector("img");
        if (reducedMotion || !thumbnail || typeof document.startViewTransition !== "function") {
          openViewer();
          return;
        }
        var page = document.documentElement;
        page.classList.add("fx-vt-poster");
        thumbnail.style.viewTransitionName = "fx-poster";
        var transition = document.startViewTransition(function () {
          thumbnail.style.viewTransitionName = "";
          openViewer();
          viewerImage.style.viewTransitionName = "fx-poster";
          return typeof viewerImage.decode === "function" ? viewerImage.decode().catch(function () {}) : undefined;
        });
        if (transition.ready) transition.ready.catch(function () {});
        transition.finished.catch(function () {}).then(function () {
          viewerImage.style.viewTransitionName = "";
          thumbnail.style.viewTransitionName = "";
          page.classList.remove("fx-vt-poster");
        });
      });
    });
    if (viewerClose) viewerClose.addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("click", function (event) { if (event.target === viewer) viewer.close(); });
    viewer.addEventListener("close", function () {
      viewerImage.removeAttribute("src");
      if (typeof syncCarouselTimer === "function") syncCarouselTimer();
    });
  }

  root.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var target = root.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
})();

/* ==========================================================================
   Effets modernes — couche additive (novembre 2026)
   Aucune dépendance. Chaque effet se désactive si l’utilisateur a demandé
   moins d’animations, et les effets de souris ne s’activent pas au tactile.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("ms-site");
  if (!root) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var header = root.querySelector(".site-header");
  var nav = root.querySelector(".site-nav");
  function all(selector, scope) { return Array.prototype.slice.call((scope || root).querySelectorAll(selector)); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  /* Bouton de retour en haut (utile même sans animation) */
  var topButton = document.createElement("button");
  topButton.type = "button";
  topButton.className = "fx-top";
  topButton.setAttribute("aria-label", "Revenir en haut de la page");
  topButton.innerHTML = '<svg viewBox="0 0 50 50" aria-hidden="true"><circle class="fx-top-track" cx="25" cy="25" r="22"/><circle class="fx-top-ring" cx="25" cy="25" r="22"/></svg><span aria-hidden="true">↑</span>';
  document.body.appendChild(topButton);
  var topRing = topButton.querySelector(".fx-top-ring");
  var ringLength = 2 * Math.PI * 22;
  topButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  /* Découpe d’un titre en lettres ou en mots, sans casser l’arabe ni l’accessibilité */
  function splitHeading(heading, byChar) {
    var index = 0;
    var label = heading.textContent.replace(/\s+/g, " ").trim();
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) {
          if (child.classList.contains("sr-only") || child.getAttribute("lang") === "ar") return;
          walk(child);
          return;
        }
        if (child.nodeType !== 3 || !child.textContent.trim()) return;
        var fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(" ")); return; }
          var word = document.createElement("span");
          word.className = "fx-word";
          if (byChar) {
            Array.from(part).forEach(function (character) {
              var letter = document.createElement("span");
              letter.className = "fx-char";
              letter.textContent = character;
              letter.style.setProperty("--i", String(index));
              index += 1;
              word.appendChild(letter);
            });
          } else {
            word.textContent = part;
            word.style.setProperty("--i", String(index));
            index += 1;
          }
          fragment.appendChild(word);
        });
        child.parentNode.replaceChild(fragment, child);
      });
    }
    walk(heading);
    heading.setAttribute("aria-label", label);
    heading.classList.add("fx-split");
    if (!byChar) heading.classList.add("fx-split-words");
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { heading.classList.add("is-in"); });
    });
  }

  if (!reduced) {
    all("main h1:not(.sr-only)").forEach(function (heading) {
      splitHeading(heading, heading.textContent.trim().length <= 26);
    });

    /* Cascade : les éléments voisins apparaissent l’un après l’autre */
    var revealGroups = new Map();
    all("[data-reveal]").forEach(function (item) {
      var position = revealGroups.get(item.parentElement) || 0;
      item.style.setProperty("--fx-delay", Math.min(position, 4) * 90 + "ms");
      revealGroups.set(item.parentElement, position + 1);
    });

    /* Les cartes et listes sans animation d’origine montent en douceur */
    if ("IntersectionObserver" in window) {
      var riseItems = all(".poster-card, .program-item, .faq-item, .pricing-fee-item, .merkez-foundation-card, .merkez-quote-card, .support-payment-card, .contact-channel, .intensive-info-card, .ramadan-day")
        .filter(function (item) { return !item.hasAttribute("data-reveal") && !item.closest("[data-reveal]"); });
      var riseObserver = new IntersectionObserver(function (entries) {
        var batch = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.setProperty("--fx-delay", Math.min(batch, 7) * 70 + "ms");
          batch += 1;
          entry.target.classList.add("is-in");
          riseObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
      riseItems.forEach(function (item) { item.classList.add("fx-rise"); riseObserver.observe(item); });
    }
  }

  /* Paragraphes éclairés mot à mot au fil du défilement */
  var wordBlocks = [];
  if (!reduced) {
    all(".intro-lead, .approach-copy blockquote, [data-fx-words]").forEach(function (block) {
      if (block.children.length) return;
      var words = block.textContent.split(/(\s+)/);
      block.textContent = "";
      var spans = [];
      words.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { block.appendChild(document.createTextNode(" ")); return; }
        var span = document.createElement("span");
        span.className = "fx-w";
        span.textContent = part;
        block.appendChild(span);
        spans.push(span);
      });
      block.classList.add("fx-words");
      wordBlocks.push({ element: block, spans: spans, lit: -1 });
    });
  }

  /* Trame « MERKEZ SALSABIL » dans l’accueil */
  var hero = root.querySelector(".hero");
  if (hero && !reduced) {
    var lattice = document.createElement("div");
    lattice.className = "fx-lattice";
    lattice.setAttribute("aria-hidden", "true");
    var latticeLine = new Array(15).join("MERKEZ SALSABIL    ");
    for (var latticeRow = 0; latticeRow < 34; latticeRow += 1) {
      var latticeText = document.createElement("span");
      latticeText.textContent = latticeLine;
      lattice.appendChild(latticeText);
    }
    // Placée après le voile rose de la section Femmes, sinon celui-ci la recouvre.
    var heroWash = hero.querySelector(".hero-theme-wash");
    hero.insertBefore(lattice, heroWash ? heroWash.nextSibling : hero.firstChild);
    if (finePointer) {
      hero.addEventListener("pointermove", function (event) {
        var bounds = hero.getBoundingClientRect();
        lattice.style.setProperty("--fx-lx", (event.clientX - bounds.left) + "px");
        lattice.style.setProperty("--fx-ly", (event.clientY - bounds.top) + "px");
      }, { passive: true });
    } else {
      lattice.classList.add("is-drifting");
    }
  }

  if (finePointer && !reduced) {
    /* Inclinaison 3D de l’affiche */
    var carousel = root.querySelector(".hero-carousel");
    var stage = carousel && carousel.querySelector(".hero-carousel-stage");
    if (stage) {
      var glare = document.createElement("span");
      glare.className = "fx-glare";
      glare.setAttribute("aria-hidden", "true");
      stage.appendChild(glare);
      carousel.classList.add("fx-tilt");
      stage.addEventListener("pointermove", function (event) {
        var bounds = stage.getBoundingClientRect();
        var x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
        var y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
        stage.style.setProperty("--fx-ry", ((x - 0.5) * 13).toFixed(2) + "deg");
        stage.style.setProperty("--fx-rx", ((0.5 - y) * 10).toFixed(2) + "deg");
        stage.style.setProperty("--fx-gx", (x * 100).toFixed(1) + "%");
        stage.style.setProperty("--fx-gy", (y * 100).toFixed(1) + "%");
        carousel.classList.add("is-tilting");
      }, { passive: true });
      stage.addEventListener("pointerleave", function () {
        carousel.classList.remove("is-tilting");
        stage.style.setProperty("--fx-rx", "0deg");
        stage.style.setProperty("--fx-ry", "0deg");
      });
    }

    /* Halo sur les cartes */
    all(".student-testimonial, .merkez-foundation-card, .merkez-quote-card, .support-payment-card, .intensive-info-card, .contact-channel, .pricing-fee-item").forEach(function (card) {
      if (window.getComputedStyle(card).position === "static") card.style.position = "relative";
      var glow = document.createElement("span");
      glow.className = "fx-glow";
      glow.setAttribute("aria-hidden", "true");
      card.appendChild(glow);
      card.classList.add("fx-glow-host");
      card.addEventListener("pointermove", function (event) {
        var bounds = card.getBoundingClientRect();
        glow.style.setProperty("--fx-x", (event.clientX - bounds.left) + "px");
        glow.style.setProperty("--fx-y", (event.clientY - bounds.top) + "px");
      }, { passive: true });
    });

    /* Boutons aimantés */
    all(".nav-contact, .line-link, .carousel-arrow, .carousel-toggle, .support-proceed, .contact-form-submit, .testimonial-toggle").concat([topButton]).forEach(function (button) {
      button.classList.add("fx-magnetic");
      button.addEventListener("pointermove", function (event) {
        var bounds = button.getBoundingClientRect();
        var x = (event.clientX - bounds.left - bounds.width / 2) * 0.28;
        var y = (event.clientY - bounds.top - bounds.height / 2) * 0.38;
        button.classList.add("is-pulled");
        button.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      }, { passive: true });
      button.addEventListener("pointerleave", function () {
        button.classList.remove("is-pulled");
        button.style.translate = "";
      });
    });
  }

  /* Effets liés au défilement, regroupés dans une seule boucle */
  var approachWord = root.querySelector(".approach-arabic");
  var lastScroll = window.scrollY || 0;
  var frame = 0;

  function onScrollFrame() {
    frame = 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var viewport = window.innerHeight;
    var pageHeight = document.documentElement.scrollHeight - viewport;
    var delta = scrollY - lastScroll;

    topButton.classList.toggle("is-shown", scrollY > 520);
    topRing.style.strokeDashoffset = String(ringLength * (1 - (pageHeight > 0 ? clamp(scrollY / pageHeight, 0, 1) : 0)));

    if (header && !reduced) {
      var menuOpen = nav && nav.classList.contains("is-open");
      if (scrollY < 220 || delta < -4 || menuOpen || header.contains(document.activeElement)) header.classList.remove("fx-header-hidden");
      else if (delta > 6) header.classList.add("fx-header-hidden");
    }

    if (!reduced) {
      if (approachWord) {
        var bounds = approachWord.parentElement.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < viewport) {
          var offset = (bounds.top + bounds.height / 2 - viewport / 2) / viewport;
          approachWord.style.translate = "0 " + (offset * -70).toFixed(1) + "px";
        }
      }

      wordBlocks.forEach(function (block) {
        var rect = block.element.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > viewport + 200) return;
        var progress = clamp((viewport * 0.9 - rect.top) / (viewport * 0.45 + rect.height), 0, 1);
        var lit = Math.round(progress * block.spans.length);
        if (lit === block.lit) return;
        block.lit = lit;
        block.spans.forEach(function (span, spanIndex) { span.classList.toggle("is-lit", spanIndex < lit); });
      });
    }
    lastScroll = scrollY;
  }

  window.addEventListener("scroll", function () {
    if (!frame) frame = window.requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  window.addEventListener("resize", function () {
    if (!frame) frame = window.requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  onScrollFrame();
})();

/* Une transition de page interrompue (retour rapide, onglet masqué) ne doit pas remonter d’erreur. */
window.addEventListener("pagereveal", function (event) {
  if (!event.viewTransition) return;
  event.viewTransition.ready.catch(function () {});
  event.viewTransition.finished.catch(function () {});
});

/* Sous-menus de la navigation : ouverture au clic (tactile, clavier), fermeture à l’extérieur ou avec Échap. */
(function () {
  "use strict";
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-nav-group]"));
  if (!groups.length) return;
  var compact = window.matchMedia("(max-width: 950px)");

  function setOpen(group, open) {
    var toggle = group.querySelector(".nav-group-toggle");
    group.classList.toggle("is-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  }
  function closeAll(except) {
    groups.forEach(function (group) { if (group !== except) setOpen(group, false); });
  }

  groups.forEach(function (group) {
    var toggle = group.querySelector(".nav-group-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var open = !group.classList.contains("is-open");
      closeAll(group);
      setOpen(group, open);
    });
    group.addEventListener("mouseleave", function () {
      if (!compact.matches) setOpen(group, false);
    });
    // Dans le menu mobile, le groupe de la page en cours est déjà déplié.
    if (compact.matches && group.classList.contains("is-current")) setOpen(group, true);
  });

  document.addEventListener("click", function (event) {
    // Dans le menu mobile, les groupes restent dans l’état choisi par le visiteur.
    if (!compact.matches && !event.target.closest("[data-nav-group]")) closeAll(null);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var active = document.activeElement && document.activeElement.closest("[data-nav-group]");
    closeAll(null);
    if (active) {
      var toggle = active.querySelector(".nav-group-toggle");
      if (toggle) { toggle.focus(); toggle.blur(); }
    }
  });
})();
