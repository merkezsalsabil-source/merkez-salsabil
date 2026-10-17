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
        viewerImage.src = image;
        viewerImage.alt = title;
        viewerTitle.textContent = title;
        viewer.showModal();
        if (viewerClose) viewerClose.focus();
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
