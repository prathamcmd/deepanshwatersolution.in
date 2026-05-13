/* ================================================================
   DEEPANSH WATER SOLUTION — CLIENT DASHBOARD (client.js)
   UI behaviour only. Data fetching is handled separately.
================================================================ */

/* ──────────────────────────────────────────────
   SECTION 1: STATUS BADGE HELPER
   Call this after you load the status string.
   Usage: DWS.setStatus('In Progress');
─────────────────────────────────────────────── */
// ===============================
// GOOGLE DRIVE IMAGE FIX
// ===============================
function convertDriveLink(url) {
  if (!url) return url;

  // Handle drive links
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // fallback (if different format)
    const altMatch = url.match(/id=([^&]+)/);
    if (altMatch && altMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${altMatch[1]}`;
    }
  }

  return url;
}

const DWS = {

  setStatus(statusText) {
    const badge = document.getElementById('status');
    if (!badge) return;

    badge.textContent = statusText || '—';

    // Remove old modifier classes
    badge.className = 'db-status-badge';

    const lower = (statusText || '').toLowerCase();
    if (lower.includes('progress') || lower.includes('ongoing')) {
      badge.classList.add('db-status--progress');
    } else if (lower.includes('complet') || lower.includes('done')) {
      badge.classList.add('db-status--completed');
    } else if (lower.includes('hold') || lower.includes('pause') || lower.includes('delay')) {
      badge.classList.add('db-status--hold');
    } else {
      badge.classList.add('db-status--loading');
    }
  },

  /* ──────────────────────────────────────────────
     SECTION 2: PROGRESS BAR HELPER
     Usage: DWS.setProgress(65);   // 0–100
  ─────────────────────────────────────────────── */
  setProgress(pct) {
    const fill = document.getElementById('progress_bar');
    const label = document.getElementById('progress_pct');
    const clamped = Math.min(100, Math.max(0, Number(pct) || 0));

    if (fill)  fill.style.width = `${clamped}%`;
    if (label) label.textContent = `${clamped}%`;
  },

  /* ──────────────────────────────────────────────
     SECTION 3: DOCUMENT LINK HELPER
     Enables a download button and marks it ready.
     Usage: DWS.setDoc('quotation', 'https://…');
  ─────────────────────────────────────────────── */
  setDoc(docId, url) {
    const btn    = document.getElementById(docId);
    const status = document.getElementById(`${docId}_status`);
    if (!btn || !url) return;

    btn.href = url;
    btn.removeAttribute('data-disabled');

    if (status) {
      status.textContent = 'Ready to download';
      status.className   = 'db-doc-status db-doc--ready';
    }
  },

  /* ──────────────────────────────────────────────
     SECTION 4: PHOTOS HELPER
     Populate the photo grid.
     Usage:
       DWS.setPhotos([
         { src: 'https://…', caption: 'Day 1' },
         { src: 'https://…' }
       ]);
  ─────────────────────────────────────────────── */
  setPhotos(photos) {
    const grid  = document.getElementById('photos');
    const empty = document.getElementById('photos_empty');
    const count = document.getElementById('photo_count');

    if (!grid) return;

    // Remove empty state
    if (empty) empty.remove();

    // Update count badge
    if (count) count.textContent = `${photos.length} photo${photos.length !== 1 ? 's' : ''}`;

    // Clear existing thumbnails (if called again)
    grid.querySelectorAll('.db-photo-thumb').forEach(el => el.remove());

    photos.forEach((photo, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'db-photo-thumb';
      thumb.dataset.index = i;
      thumb.setAttribute('role', 'button');
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', photo.caption || `Site photo ${i + 1}`);

      thumb.innerHTML = `
        <img src="${photo.src}" 
     onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Available'" 
     alt="${photo.caption || 'Site photo'}" 
     loading="lazy">
        <div class="db-photo-overlay">
          <span>${photo.caption || ''}</span>
          <i class="fa-solid fa-expand"></i>
        </div>
      `;

      thumb.addEventListener('click', () => DWS._openLightbox(photos, i));
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') DWS._openLightbox(photos, i);
      });

      grid.appendChild(thumb);
    });

    // Store photos list for lightbox nav
    DWS._photos = photos;
  },

  /* ──────────────────────────────────────────────
     SECTION 5: POPULATE ALL TEXT FIELDS
     Convenience method to set multiple fields.
     Usage: DWS.populate({ client_name: 'NCERT', … });
  ─────────────────────────────────────────────── */
  populate(data) {
    const fieldMap = {
      client_name:    'client_name',
      project_id:     ['project_id', 'project_id_detail'],
      site_name:      'site_name',
      city:           'city',
      eta:            'eta',
      supervisor:     'supervisor',
      last_update:    'last_update',
      issues:         'issues',
    };

    Object.entries(fieldMap).forEach(([key, elId]) => {
      if (!(key in data)) return;
      const val = data[key] || '—';
      const ids = Array.isArray(elId) ? elId : [elId];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      });
    });

    // Status + progress as special cases
    if ('status'   in data) DWS.setStatus(data.status);
    if ('progress' in data) DWS.setProgress(data.progress);

    // Document links
    ['quotation', 'workorder', 'site_drawing'].forEach(docKey => {
      if (data[docKey]) DWS.setDoc(docKey, data[docKey]);
    });

    // Photos array
    if (Array.isArray(data.photos) && data.photos.length) {
      DWS.setPhotos(data.photos);
    }
  },

  /* ──────────────────────────────────────────────
     INTERNAL: Lightbox
  ─────────────────────────────────────────────── */
  _photos: [],
  _currentIndex: 0,

  _openLightbox(photos, index) {
    const lb      = document.getElementById('lightbox');
    const img     = document.getElementById('lightbox_img');
    const caption = document.getElementById('lightbox_caption');
    if (!lb || !img) return;

    DWS._photos       = photos;
    DWS._currentIndex = index;
    DWS._updateLightboxSlide();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  _closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  },

  _updateLightboxSlide() {
    const img     = document.getElementById('lightbox_img');
    const caption = document.getElementById('lightbox_caption');
    const photo   = DWS._photos[DWS._currentIndex];
    if (!photo) return;

    img.src = photo.src;
    img.alt = photo.caption || 'Site photo';
    if (caption) {
      caption.textContent = photo.caption
        ? `${photo.caption} — ${DWS._currentIndex + 1} / ${DWS._photos.length}`
        : `${DWS._currentIndex + 1} / ${DWS._photos.length}`;
    }
  },

  _prevSlide() {
    DWS._currentIndex = (DWS._currentIndex - 1 + DWS._photos.length) % DWS._photos.length;
    DWS._updateLightboxSlide();
  },

  _nextSlide() {
    DWS._currentIndex = (DWS._currentIndex + 1) % DWS._photos.length;
    DWS._updateLightboxSlide();
  }
};

/* ──────────────────────────────────────────────
   INIT: Wire up lightbox controls
─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  const lbClose = document.getElementById('lightbox_close');
  const lbPrev  = document.getElementById('lightbox_prev');
  const lbNext  = document.getElementById('lightbox_next');
  const lb      = document.getElementById('lightbox');

  if (lbClose) lbClose.addEventListener('click', DWS._closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click',  DWS._prevSlide);
  if (lbNext)  lbNext.addEventListener('click',  DWS._nextSlide);

  // Click backdrop to close
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) DWS._closeLightbox();
    });
  }

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape')      DWS._closeLightbox();
    if (e.key === 'ArrowLeft')   DWS._prevSlide();
    if (e.key === 'ArrowRight')  DWS._nextSlide();
  });

  /* ─────────────────────────────────────────
     PLACEHOLDER / DEMO:
     The block below shows how to call DWS.populate()
     once you have data. Replace this with your
     Google Sheets CSV fetch logic.

     Example:
       fetch(`/api/project?id=${projectId}`)
         .then(r => r.json())
         .then(data => DWS.populate(data));
  ───────────────────────────────────────── */

  // Remove the demo block below once your data fetch is live.
  /*
  DWS.populate({
    client_name: 'NCERT, New Delhi',
    project_id:  'DWS-2025-041',
    site_name:   'Sports Ground, Block C',
    city:        'New Delhi',
    status:      'In Progress',
    progress:    62,
    eta:         'June 15, 2025',
    supervisor:  'Rakesh Sharma',
    last_update: 'March 20, 2025',
    issues:      'Minor delay in valve delivery — resolved.',
    quotation:   'https://drive.google.com/…',
    workorder:   '',
    site_drawing:'https://drive.google.com/…',
    photos: [
      { src: 'https://picsum.photos/seed/a/600/400', caption: 'Day 1 — Site clearing' },
      { src: 'https://picsum.photos/seed/b/600/400', caption: 'Day 3 — Pipe laying' },
      { src: 'https://picsum.photos/seed/c/600/400', caption: 'Day 5 — Valve installation' },
    ]
  });
  */
});

/* Export DWS so your data-fetch script can call DWS.populate() */
window.DWS = DWS;

// ===============================
// GOOGLE SHEET CONNECTION
// ===============================

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKtVSKhHqMte1f9dzmqnfdwcIji7dc0AJ6nMke7Yz19Rn7kLPk2xsrNS04RSYb1b_9LCX-9w7L_J9Y/pub?gid=560158700&single=true&output=csv";

function renderPortalState(title, message) {
  document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:32px;background:linear-gradient(180deg,#f8fbff 0%,#eef5ff 100%);font-family:'DM Sans',sans-serif;">
      <section style="width:min(100%,560px);padding:36px 28px;border-radius:28px;background:#ffffff;box-shadow:0 22px 60px rgba(11,31,77,.12);border:1px solid rgba(17,71,132,.08);text-align:center;">
        <div style="width:72px;height:72px;margin:0 auto 20px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#113c75,#2f80ed);color:#ffffff;font-size:28px;">i</div>
        <h1 style="margin:0 0 12px;color:#0b1f4d;font-size:30px;line-height:1.15;">${title}</h1>
        <p style="margin:0 0 22px;color:#5f7398;font-size:16px;line-height:1.7;">${message}</p>
        <a href="/portal" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 24px;border-radius:999px;background:#2f80ed;color:#0b1f4d;font-weight:700;text-decoration:none;">Go to Client Portal</a>
      </section>
    </main>
  `;
}

function getProjectId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadClientData() {
  const projectId = getProjectId();

  if (!projectId) {
    renderPortalState(
      "Project ID Required",
      "Enter your project ID on the client portal access page to open your dashboard."
    );
    return;
  }

  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));

  // Remove header row
  const headers = rows[0];
  const dataRows = rows.slice(1);

  for (let row of dataRows) {
    if (row[0] === projectId) {

      const obj = {};
headers.forEach((h, i) => obj[h.trim()] = row[i]);

const data = {
  project_id: obj.project_id,
  client_name: obj.client_name,
  site_name: obj.site_name,
  city: obj.city,
  status: obj.status,
  eta: obj.eta,
  supervisor: obj.supervisor,
  last_update: obj.last_update,
  issues: obj.issues,
  quotation: obj.quotation,
  workorder: obj.workorder,
  site_drawing: obj.site_drawing,

  photos: obj.photos
  ? obj.photos.split(",").map(p => {
      const clean = p.trim();
      const finalUrl = convertDriveLink(clean);

      console.log("Original:", clean);
      console.log("Converted:", finalUrl);

      return {
        src: finalUrl
      };
    })
  : []
};

      // Call your UI system
      DWS.populate(data);

      return;
    }
  }

  renderPortalState(
    "Project Not Found",
    "We could not match that project ID. Please check the ID and try again, or contact our team for help."
  );
}

document.addEventListener("DOMContentLoaded", loadClientData);
