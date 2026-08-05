// Elements
const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');
const mobileToggle = document.getElementById('mobileToggle');
const brandLogo = document.querySelector('.sidebar .logo');
const navVertical = document.getElementById('navVertical');
const yearEl = document.getElementById('year');
const navLinks = navVertical.querySelectorAll('a');

// Footer year
yearEl.textContent = new Date().getFullYear();

const themeToggles = document.querySelectorAll('.theme-toggle');

if (themeToggles.length) {
  const root = document.documentElement;

  const syncButtons = (theme) => {
    themeToggles.forEach((btn) => {
      const icon = btn.querySelector('.theme-toggle-icon');
      const label = btn.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
      if (label) label.textContent = theme === 'light' ? 'Light mode' : 'Dark mode';
      btn.setAttribute(
        'aria-label',
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      );
    });
  };

  syncButtons(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  themeToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';

      if (next === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }

      localStorage.setItem('theme', next);
      syncButtons(next);
    });
  });
}

// Desktop collapse toggle 
if (collapseBtn) {
  collapseBtn.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    collapseBtn.textContent = collapsed ? '⇥' : '⇤';
  });
}

// Brand logo scrolls to top on click
if (brandLogo) {
  brandLogo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Mobile nav toggle
if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    navVertical.classList.toggle('mobile-open');
    mobileToggle.textContent = expanded ? '☰' : '✕';
  });
}

// Close mobile nav when clicking a link, and mark it active immediately.
// (Immediate, not just scroll-derived: Certifications/Resume/Contact are
// short enough together that they can all share the same maximum scroll
// position near the bottom of the page, so scroll position alone can't
// always tell them apart — see isClickScrolling below.)
let isClickScrolling = false;
let clickScrollTimeout;

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navVertical.classList.remove('mobile-open');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.textContent = '☰';
    }

    const targetId = link.getAttribute('href')?.replace('#', '');
    if (targetId) {
      setActiveLink(targetId);
      isClickScrolling = true;
      clearTimeout(clickScrollTimeout);
      // Roughly the duration of the smooth-scroll animation; scroll-based
      // detection resumes after this so it can't immediately override the
      // tab the user just picked.
      clickScrollTimeout = setTimeout(() => {
        isClickScrolling = false;
      }, 700);
    }
  });
});

// Scroll reveal using IntersectionObserver
const revealElements = document.querySelectorAll('.hidden');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

// Fallback: if IntersectionObserver is not supported, show everything
if (!('IntersectionObserver' in window)) {
  revealElements.forEach((el) => el.classList.add('show'));
}

// Sections corresponding to nav links, used by updateActiveLink below.
const sections = document.querySelectorAll('main section[id]');

function setActiveLink(id) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
}

const navSectionIds = new Set(
  Array.from(navLinks).map((link) => link.getAttribute('href')?.replace('#', ''))
);

const navSections = Array.from(sections).filter((section) =>
  navSectionIds.has(section.getAttribute('id'))
);

function updateActiveLink() {
  // While a clicked link's smooth-scroll animation is still settling, don't
  // let position-based detection fight the tab the user just picked.
  if (isClickScrolling) return;

  // Last section whose top has been scrolled past. Simpler and more
  // predictable than a "most visible area" calculation, which itself broke
  // down for the same reason described above the click handler: several
  // short sections can be visible at once near the bottom of the page.
  const scrollPos = window.scrollY + 2; // tiny epsilon for sub-pixel rounding

  let currentId = navSections[0]?.getAttribute('id') ?? null;

  navSections.forEach((section) => {
    if (section.offsetTop <= scrollPos) {
      currentId = section.getAttribute('id');
    }
  });

  // Organic scroll (not a click) reaching the true bottom of the page:
  // always land on the last nav section, since it may be unreachable by
  // offsetTop comparison alone when trailing content is short.
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom && navSections.length > 0) {
    currentId = navSections[navSections.length - 1].getAttribute('id');
  }

  if (currentId) setActiveLink(currentId);
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);
window.addEventListener('resize', updateActiveLink);

// Resume preview toggle
const resumeToggle = document.getElementById('resumeToggle');
const resumePreview = document.getElementById('resumePreview');

if (resumeToggle && resumePreview) {
  resumeToggle.addEventListener('click', () => {
    const isVisible = resumePreview.style.display === 'block';

    resumePreview.style.display = isVisible ? 'none' : 'block';
    resumeToggle.textContent = isVisible ? '▶ Show Resume Preview' : '▼ Hide Resume Preview';
  });
}

document.addEventListener("click", (e) => {
  if (!navVertical.classList.contains("mobile-open")) return;

  // The hamburger toggle handles its own open/close, so clicking it
  // shouldn't be treated as an "outside" click.
  if (mobileToggle.contains(e.target)) return;

  // Anything that isn't the nav panel itself (e.g. theme toggle, logo,
  // or content outside the sidebar) closes the dropdown.
  if (!navVertical.contains(e.target)) {
    navVertical.classList.remove("mobile-open");
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.textContent = "☰";
  }
});
