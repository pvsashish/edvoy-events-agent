const { useState, useCallback, useRef, useEffect } = React;

/* ─────────────────────────────────────────
   Design tokens & Constants
───────────────────────────────────────── */
const T = {
  purple:      '#7C3AED',
  purple50:    '#F5EBFE',
  purple100:   '#EDE9FE',
  purple200:   '#DDC2F7',
  purple600:   '#7C3AED',
  purple700:   '#7C3AED',
  grad:        'linear-gradient(45deg, #321386 0%, #9C20D7 100%)',
  gradSubtle:  'linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, rgba(156, 32, 215, 0.01) 100%)',
  bg:          '#F8FAFC',
  surface:     '#FFFFFF',
  border:      '#EAECF0',
  borderHover: '#D0D5DD',
  borderSoft:  '#F2F4F7',
  t900:        '#0F172A',
  t700:        '#344054',
  t500:        '#64748B',
  t400:        '#94A3B8',
  green50:     '#ECFDF5',
  green200:    '#A7F3D0',
  green700:    '#047857',
  red50:       '#FEF2F2',
  red200:      '#FECACA',
  red700:      '#B91C1C',
};

const GA4_CATEGORIES = [
  'App',
  'Applications',
  'Articles',
  'Career',
  'City Page',
  'Compare',
  'Contact',
  'Country Page',
  'Course Page',
  'Course Shortlist',
  'Courses',
  'Documents',
  'Events',
  'Exams',
  'FAQs',
  'Footer Menu',
  'Genie Chatbot',
  'Genie or Check-Eligibility',
  'Get Started',
  'Header Menu',
  'Home',
  'Homepage',
  'IELTS Page',
  'Institution Page',
  'Login',
  'Login or Sign-up Flow',
  'Logout',
  'Meet',
  'Office Location Pages',
  'One Tap Signup',
  'Profile',
  'Refer and Earn',
  'Referral',
  'Results',
  'Search',
  'Search Filter',
  'Shortlist',
  'Subject Page',
  'Testimonials',
  'Universities'
];

const AMPLITUDE_CATEGORIES = [
  'App Update Screen',
  'Course Page',
  'Genie Banner',
  'Login or Sign-up Flow',
  'Meet',
  'Onboarding Screen',
  'Settings',
  'Stand-by Flow'
];

const CAT_COLOR = {
  'Onboarding': { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#3B82F6' },
  'Onboarding Screen': { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#3B82F6' },
  'Search':     { bg: '#F0FDF4', fg: '#15803D', dot: '#22C55E' },
  'Search Filter': { bg: '#F0FDF4', fg: '#15803D', dot: '#22C55E' },
  'Application':{ bg: '#F5F3FF', fg: '#6D28D9', dot: '#7C3AED' },
  'Applications':{ bg: '#F5F3FF', fg: '#6D28D9', dot: '#7C3AED' },
  'Profile':    { bg: '#EEF2FF', fg: '#4338CA', dot: '#6366F1' },
  'Shortlist':  { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
  'Course Shortlist': { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
  'Dashboard':  { bg: '#F0F9FF', fg: '#0369A1', dot: '#0EA5E9' },
  'Messaging':  { bg: '#FFF1F2', fg: '#BE123C', dot: '#F43F5E' },
  'Documents':  { bg: '#F9FAFB', fg: '#374151', dot: '#9CA3AF' },
  'Settings':   { bg: '#FAF5FF', fg: '#6D28D9', dot: '#A855F7' },
  'Login or Sign-up Flow': { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#3B82F6' },
  'Genie Chatbot': { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
  'Meet': { bg: '#F0F9FF', fg: '#0369A1', dot: '#0EA5E9' },
  'Course Page': { bg: '#F5F3FF', fg: '#6D28D9', dot: '#7C3AED' },
  'Articles':   { bg: '#FFFBEB', fg: '#B45309', dot: '#F59E0B' },
  'Compare':    { bg: '#F0FDFA', fg: '#0F766E', dot: '#14B8A6' },
  'Compare page': { bg: '#F0FDFA', fg: '#0F766E', dot: '#14B8A6' },
  'LP3 and LP4': { bg: '#FFF1F2', fg: '#BE123C', dot: '#F43F5E' },
  'IELTS Page': { bg: '#FAF5FF', fg: '#7E22CE', dot: '#A855F7' },
  'Referral':   { bg: '#FFF7ED', fg: '#B45309', dot: '#F97316' },
  'Refer and Earn': { bg: '#FFF7ED', fg: '#B45309', dot: '#F97316' },
  'Header Menu': { bg: '#F8FAFC', fg: '#475569', dot: '#94A3B8' },
  'Footer Menu': { bg: '#F8FAFC', fg: '#475569', dot: '#94A3B8' },
  'FAQs':       { bg: '#F0F9FF', fg: '#0369A1', dot: '#38BDF8' },
  'App':        { bg: '#EEF2FF', fg: '#4338CA', dot: '#818CF8' },
  'Career':     { bg: '#ECFDF5', fg: '#065F46', dot: '#10B981' },
  'Courses':    { bg: '#F5F3FF', fg: '#6D28D9', dot: '#7C3AED' },
  'Universities': { bg: '#EFF6FF', fg: '#1E40AF', dot: '#60A5FA' },
  'Results':    { bg: '#F0FDF4', fg: '#166534', dot: '#4ADE80' },
  'Testimonials': { bg: '#FDF2F8', fg: '#9D174D', dot: '#EC4899' },
  'Login':      { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#3B82F6' },
  'Logout':     { bg: '#F8FAFC', fg: '#475569', dot: '#94A3B8' },
  'Home':       { bg: '#FFFBEB', fg: '#92400E', dot: '#F59E0B' },
  'Homepage':   { bg: '#FFFBEB', fg: '#92400E', dot: '#F59E0B' },
  'Office Location Pages': { bg: '#F0FDFA', fg: '#0F766E', dot: '#14B8A6' },
  'Events':     { bg: '#FAF5FF', fg: '#7E22CE', dot: '#A855F7' },
  'Contact':    { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#60A5FA' },
  'Get Started': { bg: '#F0FDF4', fg: '#15803D', dot: '#22C55E' },
  'Institution Page': { bg: '#EFF6FF', fg: '#1E40AF', dot: '#60A5FA' },
  'Subject Page': { bg: '#EEF2FF', fg: '#4338CA', dot: '#6366F1' },
  'Country Page': { bg: '#FFF1F2', fg: '#BE123C', dot: '#F43F5E' },
  'City Page':  { bg: '#F0F9FF', fg: '#0369A1', dot: '#0EA5E9' },
  'Genie page': { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
  'Genie or Check-Eligibility': { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
  'Exams':      { bg: '#FFFBEB', fg: '#B45309', dot: '#F59E0B' },
  'For back':   { bg: '#F8FAFC', fg: '#475569', dot: '#94A3B8' },
  'Form Filled': { bg: '#ECFDF5', fg: '#065F46', dot: '#10B981' },
  'One Tap Signup': { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#3B82F6' },
};

/* ─────────────────────────────────────────
   SVG Icons (SaaS style)
───────────────────────────────────────── */
function IconSparkles({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
    </svg>
  );
}

function IconHistory({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}

function IconGuidelines({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
      <path d="M6 6h10"/>
      <path d="M6 10h10"/>
      <path d="M6 14h10"/>
    </svg>
  );
}

function IconZap({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function IconLayers({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-10 5 10 5 10-5-10-5Z"/>
      <path d="m2 17 10 5 10-5"/>
      <path d="m2 12 10 5 10-5"/>
    </svg>
  );
}

function IconListChecks({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 17 2 2 4-4"/>
      <path d="m3 7 2 2 4-4"/>
      <path d="M13 6h8"/>
      <path d="M13 12h8"/>
      <path d="M13 18h8"/>
      <path d="m3 12 2 2 4-4"/>
    </svg>
  );
}

function IconScout({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 3v3"/>
      <path d="M12 18v3"/>
      <path d="M3 12h3"/>
      <path d="M18 12h3"/>
    </svg>
  );
}

function IconUpload({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function IconPlus({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function IconTrash({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );
}

function IconCopy({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function IconDownload({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function IconCheck({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconCode({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

function IconLayout({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  );
}

function IconReset({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
      <polyline points="21 3 21 8 16 8"/>
    </svg>
  );
}

function IconGA4({ size = 16, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#F9AB00" d="M130,29v132c0,14.77,10.19,23,21,23c10,0,21-7,21-23V30c0-13.54-10-22-21-22S130,17.33,130,29z"/>
      <path fill="#E37400" d="M75,96v65c0,14.77,10.19,23,21,23c10,0,21-7,21-23V97c0-13.54-10-22-21-22S75,84.33,75,96z"/>
      <circle fill="#E37400" cx="41" cy="163" r="21"/>
    </svg>
  );
}

function IconAmplitude({ size = 16, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M128,0 C198.682731,0 256,57.3172691 256,128 C256,198.682731 198.682731,256 128,256 C57.3172691,256 0,198.734137 0,128 C0,57.2658635 57.3172691,0 128,0 Z M111.08755,39.1196787 C95.3060241,39.1710843 81.015261,64.5654618 68.7293173,114.531727 C60.0417671,114.428916 52.0738956,114.274699 44.6200803,114.171888 L44.6200803,114.171888 L43.4891566,114.171888 C42.5638554,114.120482 41.6385542,114.171888 40.713253,114.274699 C36.497992,115.045783 33.4650602,118.746988 33.4650602,123.013655 C33.4650602,127.383133 36.7036145,131.135743 41.0216867,131.804016 L41.0216867,131.804016 L41.124498,131.906827 L64.7196787,131.906827 C62.5092369,141.879518 60.6072289,151.800803 59.0136546,161.310843 L59.0136546,161.310843 L58.2939759,165.474699 L58.2939759,165.680321 C58.2939759,167.685141 59.3220884,169.535743 61.0184739,170.615261 C63.7429719,172.363052 67.3927711,171.540562 69.1405622,168.816064 L69.1405622,168.816064 L69.2947791,168.970281 L80.8610442,131.906827 L136.584739,131.906827 C140.851406,148.048193 145.272289,164.652209 151.13253,180.279518 C154.268273,188.658635 161.567871,208.192771 173.80241,208.295582 L173.80241,208.295582 L173.956627,208.295582 C192.873896,208.295582 200.276305,177.709237 205.159839,157.455422 C206.239357,153.085944 207.113253,149.333333 207.987149,146.55743 L207.987149,146.55743 L208.346988,145.426506 L208.398639,145.260296 C208.799202,143.815444 207.983341,142.271724 206.547791,141.776707 C205.057028,141.262651 203.360643,142.033735 202.846586,143.575904 L202.846586,143.575904 L202.435341,144.706827 C200.841767,149.179116 199.351004,153.342972 198.014458,157.095582 L198.014458,157.095582 L197.911647,157.404016 C189.686747,180.587952 185.985542,191.17751 178.634538,191.17751 L178.634538,191.17751 L178.171888,191.17751 C168.764659,191.17751 159.974297,153.034538 156.632932,138.692369 C156.06747,136.2249 155.553414,133.911647 155.039357,131.906827 L155.039357,131.906827 L215.697992,131.906827 C216.77751,131.906827 217.857028,131.649799 218.833735,131.135743 L218.833735,131.135743 L219.399197,130.775904 L219.553414,130.673092 C219.861847,130.570281 220.016064,130.313253 220.016064,130.313253 L220.243135,130.124799 C221.357028,129.156426 222.146185,127.804016 222.483534,126.406426 C223.254618,122.756627 220.838554,119.158233 217.188755,118.438554 L217.188755,118.438554 L216.880321,118.438554 C216.520482,118.387149 216.212048,118.335743 215.852209,118.335743 L215.852209,118.335743 L214.926908,118.232932 C193.490763,116.690763 171.437751,116.073896 150.721285,115.662651 L150.721285,115.662651 L150.66988,115.508434 C140.645783,77.7253012 128.051406,39.1196787 111.08755,39.1196787 Z M110.419277,56.1349398 C111.293173,56.1349398 112.115663,56.648996 112.835341,57.5742972 C114.583133,60.3502008 117.66747,66.5702811 122.24257,80.346988 C125.378313,89.8056225 128.771084,101.57751 132.369478,115.251406 C118.695582,115.045783 104.918876,114.891566 91.5534137,114.737349 L91.5534137,114.737349 L84.7678715,114.685944 C92.4273092,84.7678715 101.731727,62.097992 108.568675,56.7518072 C109.134137,56.3919679 109.751004,56.1349398 110.419277,56.1349398 Z"
        fill="#1E61F0"
      />
    </svg>
  );
}

function formatTimestamp(ts) {
  if (!ts) return '';
  // ISO string → consistent display format
  if (/^\d{4}-\d{2}-\d{2}T/.test(ts)) {
    const d = new Date(ts);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return ts; // legacy locale string stored before fix
}

function toSnakeCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase to snake_case
    .replace(/[\s-]+/g, '_')                // spaces/dashes to underscores
    .replace(/[^a-zA-Z0-9_]/g, '')          // strip special characters (punctuation, brackets)
    .toLowerCase()
    .replace(/_+/g, '_');                   // remove double underscores
}

function getValidationError(value, type, platform, row) {
  if (platform === 'ga4') {
    if (type === 'parameter') {
      if (!value || !value.trim()) {
        if (row && row.suggested_event_name && row.suggested_event_name.trim()) {
          return "GA4 events must have at least one parameter (default to 'from')";
        }
      }
    }
    if (type === 'event') {
      if (!value || !value.trim()) {
        if (row && row.parameter && row.parameter.trim()) {
          return "Event name cannot be empty when a parameter is specified";
        }
      }
    }
  }
  if (!value) return null;
  if (value.length > 100) return 'Max 100 characters exceeded';
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Must be lowercase alphanumeric with underscores only (snake_case)';
  }
  return null;
}


/* ─────────────────────────────────────────
   File Helpers
───────────────────────────────────────── */
function toDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function extractVideoFrames(file, count = 3) {
  return new Promise(resolve => {
    const url   = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted   = true;
    video.src     = url;

    video.addEventListener('loadedmetadata', () => {
      const d = video.duration;
      const times = Array.from({ length: count }, (_, i) =>
        Math.min(d - 0.1, (d / (count + 1)) * (i + 1))
      );
      const frames = [];
      let idx = 0;

      const next = () => {
        if (idx >= times.length) { URL.revokeObjectURL(url); resolve(frames); return; }
        video.currentTime = times[idx];
      };

      video.addEventListener('seeked', () => {
        const c = document.createElement('canvas');
        c.width  = video.videoWidth;
        c.height = video.videoHeight;
        c.getContext('2d').drawImage(video, 0, 0);
        frames.push(c.toDataURL('image/jpeg', 0.85));
        idx++;
        next();
      });

      next();
    });

    video.addEventListener('error', () => { URL.revokeObjectURL(url); resolve([]); });
  });
}

/* ─────────────────────────────────────────
   Components
───────────────────────────────────────── */
function CategoryBadge({ value }) {
  if (!value) return null;
  const c = CAT_COLOR[value] || { bg: '#F1F5F9', fg: '#475569', dot: '#64748B' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.fg,
      padding: '3px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {value}
    </span>
  );
}

function AttachmentThumb({ item, onRemove, onPreview }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }} className="fade-in attachment-thumb-hover">
      {item.type === 'video' ? (
        <div
          onClick={() => onPreview && onPreview(item)}
          style={{
            width: 88, height: 58, borderRadius: 8,
            border: `1px solid ${T.border}`,
            overflow: 'hidden', position: 'relative', background: '#0F172A',
            cursor: onPreview ? 'zoom-in' : 'default',
          }}>
          {item.thumb && (
            <img src={item.thumb} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} alt="" />
          )}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: 700 }}>
              {item.frameCount} frames
            </span>
          </div>
        </div>
      ) : (
        <img
          src={item.dataUrl} alt="screen"
          onClick={() => onPreview && onPreview(item)}
          style={{ width: 88, height: 58, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}`, display: 'block', cursor: onPreview ? 'zoom-in' : 'default' }}
        />
      )}
      <button
        onClick={onRemove}
        aria-label="Remove"
        style={{
          position: 'absolute', top: -5, right: -5,
          width: 16, height: 16, borderRadius: '50%',
          background: T.t700, border: `1.5px solid ${T.surface}`,
          color: '#fff', fontSize: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = T.red700}
        onMouseLeave={e => e.currentTarget.style.background = T.t700}
      >✕</button>
    </div>
  );
}

function AttachmentPreviewModal({ item, onClose }) {
  const [frameIdx, setFrameIdx] = React.useState(0);
  React.useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isVideo = item.type === 'video';
  const frames  = isVideo ? (item.frames || []) : null;
  const src     = isVideo ? frames[frameIdx] : item.dataUrl;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -14, right: -14, zIndex: 10,
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.3)',
            fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <img
          src={src} alt={item.name}
          style={{ maxWidth: '82vw', maxHeight: '74vh', borderRadius: 10, display: 'block', objectFit: 'contain' }}
        />

        {isVideo && frames.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center' }}>
            {frames.map((f, i) => (
              <img
                key={i} src={f} alt={`Frame ${i+1}`}
                onClick={() => setFrameIdx(i)}
                style={{
                  width: 64, height: 42, objectFit: 'cover', borderRadius: 5,
                  cursor: 'pointer',
                  opacity: i === frameIdx ? 1 : 0.45,
                  border: i === frameIdx ? '2px solid #fff' : '2px solid transparent',
                  transition: 'opacity 0.15s',
                }}
              />
            ))}
          </div>
        )}

        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          {item.name}{isVideo ? ` · Frame ${frameIdx + 1} of ${frames.length}` : ''}
          {item.fromHistory ? ' · Saved attachment' : ''}
        </p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  const widths = [
    [80, 190, 110, 100],
    [95, 170, 130, 80],
    [70, 210, 140, 120],
    [85, 160, 120, 95],
  ];
  return (
    <tbody>
      {widths.map((row, i) => (
        <tr key={i}>
          {row.map((w, j) => (
            <td key={j} style={{ padding: '12px 16px', borderBottom: `1px solid ${T.borderSoft}` }}>
              <div className="shimmer" style={{ height: 14, width: w, borderRadius: 4 }} />
            </td>
          ))}
          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${T.borderSoft}` }} />
        </tr>
      ))}
    </tbody>
  );
}

/* ─────────────────────────────────────────
   Thumbnail utility
───────────────────────────────────────── */
function generateThumbnail(dataUrl, maxWidth = 640) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ─────────────────────────────────────────
   Main App
───────────────────────────────────────── */
function App() {
  // Navigation
  const [activeTab, setActiveTab]          = useState('generator'); // 'generator' | 'history' | 'guidelines' | 'scout'

  // Scout State (Event Map — isolated, own state, no shared logic with other tabs)
  const [scoutQuery, setScoutQuery]        = useState('');
  const [scoutResults, setScoutResults]    = useState([]);
  const [scoutLoading, setScoutLoading]    = useState(false);
  const [scoutSelected, setScoutSelected]  = useState(null);
  const [scoutActiveEvent, setScoutActiveEvent] = useState(null);
  const [scoutSearched, setScoutSearched]  = useState(false);
  const [scoutImgDims, setScoutImgDims]    = useState({ w: 1, h: 1 });
  const [scoutImgLoading, setScoutImgLoading] = useState(false);

  const runScoutSearch = async (q) => {
    setScoutLoading(true);
    setScoutSearched(true);
    try {
      const res = await fetch(`/api/screens${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      const data = await res.json();
      const results = data.screens || [];
      setScoutResults(results);
      setScoutSelected(results[0] || null);
      setScoutActiveEvent(results[0]?.events?.[0] || null);
    } catch (err) {
      console.error('Scout search failed:', err);
      setScoutResults([]);
    } finally {
      setScoutLoading(false);
    }
  };

  // Preload Scout list + all images in background on app mount
  useEffect(() => {
    const preload = async () => {
      try {
        const data = await fetch('/api/screens').then(r => r.json());
        const results = data.screens || [];
        setScoutResults(results);
        setScoutSelected(results[0] || null);
        setScoutActiveEvent(results[0]?.events?.[0] || null);
        setScoutSearched(true);

        // Preload all images in background, 4 at a time
        const BATCH = 4;
        for (let i = 0; i < results.length; i += BATCH) {
          await Promise.all(results.slice(i, i + BATCH).map(async (screen) => {
            try {
              const d = await fetch(`/api/screens?id=${encodeURIComponent(screen.id)}`).then(r => r.json());
              if (d.screen?.image) {
                setScoutResults(prev => prev.map(s => s.id === screen.id ? { ...s, image: d.screen.image } : s));
                setScoutSelected(prev => prev?.id === screen.id ? { ...prev, image: d.screen.image } : prev);
              }
            } catch(e) {}
          }));
        }
      } catch(e) {}
    };
    preload();
  }, []);

  // Auto-browse all screens the first time Scout tab is opened — no need to type anything
  useEffect(() => {
    if (activeTab === 'scout' && !scoutSearched) {
      runScoutSearch('');
    }
  }, [activeTab]);

  const scoutImgRef = useRef(null);

  // Lazy-load image on click only if not already preloaded
  useEffect(() => {
    if (!scoutSelected?.id) return;
    if (scoutSelected.image) return;
    setScoutImgLoading(true);
    fetch(`/api/screens?id=${encodeURIComponent(scoutSelected.id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.screen?.image) {
          setScoutResults(prev => prev.map(s => s.id === data.screen.id ? { ...s, image: data.screen.image } : s));
          setScoutSelected(prev => prev?.id === data.screen.id ? { ...prev, image: data.screen.image } : prev);
        }
      })
      .catch(console.error)
      .finally(() => setScoutImgLoading(false));
  }, [scoutSelected?.id]);

  // Reset dims on screen change, then check if cached image already loaded
  useEffect(() => {
    setScoutImgDims({ w: 0, h: 0 });
    const img = scoutImgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setScoutImgDims({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [scoutSelected?.id]);

  // Generator State
  const [platform, setPlatform]            = useState('ga4');
  const [featureContext, setFeatureContext] = useState('');
  const [attachments, setAttachments]      = useState([]);
  const [generatedAttachments, setGeneratedAttachments] = useState([]);
  const [generatedContext, setGeneratedContext]         = useState('');
  const [events, setEvents]                = useState([]);
  const [loading, setLoading]              = useState(false);
  const [processing, setProcessing]        = useState(false);
  const [error, setError]                  = useState('');
  
  // Interactions
  const [copiedState, setCopiedState]      = useState(''); // '', 'tsv', 'csv', 'json'
  const [exportError, setExportError]      = useState('');
  const [dragging, setDragging]            = useState(false);
  const [history, setHistory]              = useState([]);
  const [historyPage, setHistoryPage]      = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [converterInput, setConverterInput]       = useState('');
  const [converterCopied, setConverterCopied]     = useState(false);

  // Google Sheets sync — per platform { ga4: {url,data}, amplitude: {url,data} }
  const [sheetConfig, setSheetConfig]         = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('edvoy_sheet_config') || '{}');
      // migrate old single-sheet format
      const oldData = JSON.parse(localStorage.getItem('edvoy_sheet_data') || 'null');
      const oldUrl  = localStorage.getItem('edvoy_sheet_url') || '';
      if (oldUrl && oldData && !cfg.ga4) cfg.ga4 = { url: oldUrl, data: oldData };
      return cfg;
    } catch { return {}; }
  });
  const [sheetSyncingFor, setSheetSyncingFor] = useState(null); // null | 'ga4' | 'amplitude'
  const [sheetInputFor, setSheetInputFor]     = useState(null); // null | 'ga4' | 'amplitude'
  const [sheetUrlDrafts, setSheetUrlDrafts]   = useState({ ga4: '', amplitude: '' });
  const [sheetSyncError, setSheetSyncError]   = useState(null); // { key, message } | null

  // History thumbnails stored in localStorage only (not in DB)
  const [historyThumbs, setHistoryThumbs]     = useState(() => { try { return JSON.parse(localStorage.getItem('edvoy_history_thumbs') || '{}'); } catch { return {}; } });

  // Attachment preview lightbox
  const [previewAttachment, setPreviewAttachment] = useState(null);

  const fileRef                            = useRef();
  const resultsRef                         = useRef();
  const copiedTimeoutRef                   = useRef(null);
  const analyzeAbortRef                    = useRef(null);

  // Load Saved Specs on Init (DB with Local Storage fallback)
  useEffect(() => {
    const loadInit = async () => {
      try {
        const res = await fetch('/api/history');
        if (!res.ok) throw new Error('DB fetch failed');
        const data = await res.json();
        if (data.warning) {
          console.warn(data.warning);
          const stored = localStorage.getItem('edvoy_specs_history');
          if (stored) setHistory(JSON.parse(stored));
        } else {
          setHistory(data.history || []);
        }
      } catch (e) {
        console.error('Failed to load history from DB, falling back to localStorage:', e);
        const stored = localStorage.getItem('edvoy_specs_history');
        if (stored) setHistory(JSON.parse(stored));
      }

      // Load sheet config from DB (shared across all users/browsers)
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.sheet_config) {
            setSheetConfig(data.settings.sheet_config);
            try { localStorage.setItem('edvoy_sheet_config', JSON.stringify(data.settings.sheet_config)); } catch {}
          }
        }
      } catch (e) {
        console.warn('Could not load sheet config from DB:', e);
      }
    };
    loadInit();
  }, []);

  // Keep history page in bounds when items are deleted
  useEffect(() => {
    const totalPages = Math.ceil(history.length / 5);
    if (historyPage > 1 && historyPage > totalPages) {
      setHistoryPage(totalPages || 1);
    }
  }, [history.length, historyPage]);

  // Sync History to localStorage + DB
  const saveHistory = async (updated, newItem = null) => {
    setHistory(updated);
    try {
      localStorage.setItem('edvoy_specs_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
    if (newItem) {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: newItem }),
        });
      } catch (e) {
        console.error('Failed to save history item to DB', e);
      }
    }
  };

  const syncSheet = async (p, url) => {
    const cleanUrl = (url || sheetConfig[p]?.url || '').trim();
    if (!cleanUrl) {
      // URL missing — prompt user to re-enter it
      setSheetInputFor(p);
      setSheetUrlDrafts(prev => ({ ...prev, [p]: '' }));
      return;
    }
    setSheetSyncingFor(p);
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: cleanUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSheetConfig(prev => {
        const next = { ...prev, [p]: { url: cleanUrl, data } };
        try { localStorage.setItem('edvoy_sheet_config', JSON.stringify(next)); } catch {}
        // Save to DB so all users/browsers share the same sheet config
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'sheet_config', value: next }),
        }).catch(err => console.warn('Could not save sheet config to DB:', err));
        return next;
      });
      setSheetInputFor(null);
      setSheetUrlDrafts(prev => ({ ...prev, [p]: '' }));
      setSheetSyncError(null);
    } catch (err) {
      setSheetSyncError({ key: p, message: err.message });
      setTimeout(() => setSheetSyncError(prev => (prev?.key === p ? null : prev)), 6000);
    } finally {
      setSheetSyncingFor(null);
    }
  };

  const handlePlatformChange = (newPlatform) => {
    if (newPlatform === platform) return;
    setPlatform(newPlatform);
    if (events.length > 0) {
      const converted = events.map(e => {
        let newParam = toSnakeCase(e.parameter);
        let newSample = e.sample_value;
        if (newPlatform === 'ga4' && !newParam) {
          newParam = 'from';
          newSample = newSample || 'dynamic value';
        }
        return {
          ...e,
          suggested_event_name: toSnakeCase(e.suggested_event_name),
          parameter: newParam,
          sample_value: newSample,
        };
      });
      setEvents(converted);
    }
  };

  const addFiles = useCallback(async files => {
    const all = Array.from(files);
    const list = all.filter(f => {
      // Primary check: MIME type
      if (f.type.startsWith('image/') || f.type.startsWith('video/')) return true;
      // Fallback: file extension (handles cases where browser reports wrong MIME type)
      const ext = f.name.split('.').pop().toLowerCase();
      return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
    });
    if (!list.length) {
      if (all.length > 0) setError('Unsupported file type. Please upload PNG, JPG, GIF, WebP, MP4, or MOV files.');
      return;
    }
    setProcessing(true);
    setError('');

    const items = await Promise.all(list.map(async file => {
      const id = Math.random().toString(36).slice(2);
      if (file.type.startsWith('video/')) {
        const frames = await extractVideoFrames(file, 3);
        return { id, type: 'video', name: file.name, frames, thumb: frames[0] || null, frameCount: frames.length };
      }
      const dataUrl = await toDataUrl(file);
      return { id, type: 'image', name: file.name, dataUrl };
    }));

    setAttachments(p => [...p, ...items]);
    setProcessing(false);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const analyze = async () => {
    if (!attachments.length) { setError('Add at least one screenshot or video.'); return; }
    
    // Check for failed video frame extraction
    const failedVideos = attachments.filter(a => a.type === 'video' && (!a.frames || a.frames.length === 0));
    if (failedVideos.length > 0) {
      setError(`Failed to extract frames from: ${failedVideos.map(v => v.name).join(', ')}. Please try a different video or screenshot.`);
      return;
    }

    if (analyzeAbortRef.current) {
      analyzeAbortRef.current.abort();
    }
    const controller = new AbortController();
    analyzeAbortRef.current = controller;

    setLoading(true); setError(''); setEvents([]);

    const images = attachments.flatMap(a =>
      a.type === 'image' ? [a.dataUrl] : (a.frames || [])
    );

    try {
      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images, platform, featureContext,
          sheetData: sheetConfig[platform]?.data || null,
          // Cross-reference the other product's tracking sheet so Portal (GA4) and
          // App (Amplitude) stay consistent — mirror naming when an equivalent flow exists.
          crossData: platform === 'amplitude' ? (sheetConfig.ga4?.data || null) : (sheetConfig.amplitude?.data || null),
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      
      const newEvents = (data.events || []).map(ev => ({
        ...ev,
        _rowId: Math.random().toString(36).slice(2)
      }));
      setEvents(newEvents);
      setGeneratedAttachments([...attachments]);
      setGeneratedContext(featureContext);

      // Automatically append to history
      if (newEvents.length > 0) {
        const newRecord = {
          id: Math.random().toString(36).slice(2),
          name: featureContext ? (featureContext.slice(0, 30) + (featureContext.length > 30 ? '...' : '')) : `Custom Event Spec`,
          timestamp: new Date().toISOString(),
          platform,
          eventsCount: newEvents.length,
          events: newEvents,
          featureContext
        };
        saveHistory([newRecord, ...history], newRecord);

        // Generate and save a compressed thumbnail to localStorage for this record
        if (images[0]) {
          generateThumbnail(images[0]).then(thumb => {
            if (!thumb) return;
            setHistoryThumbs(prev => {
              const next = { ...prev, [newRecord.id]: thumb };
              try { localStorage.setItem('edvoy_history_thumbs', JSON.stringify(next)); } catch {}
              return next;
            });
          });
        }
      }

      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      if (analyzeAbortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  // Inline table edits
  const handleCellChange = (index, key, value) => {
    const next = [...events];
    next[index][key] = value;
    
    // Auto-formatting logic for parameters and sample values
    const param = (next[index].parameter || '').trim().toLowerCase();
    const val = (next[index].sample_value || '').trim();
    
    if (key === 'parameter') {
      if (param === 'is_clicked') {
        if (val.toLowerCase() !== 'true' && val.toLowerCase() !== 'false') {
          next[index].sample_value = 'true';
        } else {
          next[index].sample_value = val.toLowerCase();
        }
      } else if (param.endsWith('_id')) {
        next[index].sample_value = 'dynamic value';
      }
    } else if (key === 'sample_value') {
      if (param === 'is_clicked') {
        if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
          next[index].sample_value = 'true';
        } else {
          next[index].sample_value = value.toLowerCase();
        }
      } else if (param.endsWith('_id')) {
        next[index].sample_value = 'dynamic value';
      }
    }
    
    setEvents(next);
  };

  const addRow = () => {
    setEvents([
      ...events,
      { _rowId: Math.random().toString(36).slice(2), category: platform === 'ga4' ? 'Search' : 'Onboarding Screen', suggested_event_name: '', parameter: '', sample_value: '' }
    ]);
  };

  const deleteRow = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const hasValidationErrors = () => {
    return events.some(e => {
      const eventErr = getValidationError(e.suggested_event_name, 'event', platform, e);
      const paramErr = getValidationError(e.parameter, 'parameter', platform, e);
      return !!(eventErr || paramErr);
    });
  };

  const startCopyTimeout = (state) => {
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    setCopiedState(state);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedState('');
      copiedTimeoutRef.current = null;
    }, 2000);
  };

  // Copy/Export helpers
  const blockExportWithError = () => {
    setExportError('Some tracking rows have naming convention errors. Please correct the highlighted errors before exporting.');
    setTimeout(() => setExportError(''), 4000);
  };

  const copyTsv = () => {
    if (hasValidationErrors()) { blockExportWithError(); return; }
    const cols = ['category', 'suggested_event_name', 'parameter', 'sample_value'];
    const header = cols.map(c => c.toUpperCase().replace(/_/g, ' ')).join('\t');
    const rows = events.map(e => cols.map(c => e[c] ?? '').join('\t'));
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    startCopyTimeout('tsv');
  };

  const downloadCsv = () => {
    if (hasValidationErrors()) { blockExportWithError(); return; }
    const cols = ['category', 'suggested_event_name', 'parameter', 'sample_value'];
    const header = cols.map(c => `"${c.toUpperCase().replace(/_/g, ' ')}"`).join(',');
    const rows = events.map(e => cols.map(c => `"${(e[c] ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edvoy_${platform}_event_spec.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    startCopyTimeout('csv');
  };

  const copyJson = () => {
    if (hasValidationErrors()) { blockExportWithError(); return; }
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    startCopyTimeout('json');
  };

  const loadFromHistory = (item) => {
    setPlatform(item.platform);
    setFeatureContext(item.featureContext || '');
    const mapped = (item.events || []).map(ev => ({
      ...ev,
      _rowId: ev._rowId || Math.random().toString(36).slice(2)
    }));
    setEvents(mapped);

    // Restore saved thumbnail if available
    const thumb = historyThumbs[item.id];
    if (thumb) {
      const thumbAtt = [{ id: item.id + '_hist', type: 'image', name: 'Attachment (history)', dataUrl: thumb, fromHistory: true }];
      setAttachments(thumbAtt);
      setGeneratedAttachments(thumbAtt);
    } else {
      setAttachments([]);
      setGeneratedAttachments([]);
    }

    setActiveTab('generator');
    setError('');
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    const next = history.filter(h => h.id !== id);
    saveHistory(next);
    // Clean up thumbnail
    setHistoryThumbs(prev => {
      const updated = { ...prev };
      delete updated[id];
      try { localStorage.setItem('edvoy_history_thumbs', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to delete history item from DB', err);
    }
  };

  const clearAllHistory = async () => {
    if (confirm('Are you sure you want to clear your local and cloud specs history?')) {
      saveHistory([]);
      setHistoryPage(1);
      setHistoryThumbs({});
      try { localStorage.removeItem('edvoy_history_thumbs'); } catch {}
      try {
        await fetch('/api/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearAll: true }),
        });
      } catch (err) {
        console.error('Failed to clear history from DB', err);
      }
    }
  };

  const resetWorkspace = () => {
    if (confirm('Are you sure you want to clear your current workspace? This will clear all uploaded files, context, and generated events.')) {
      if (analyzeAbortRef.current) {
        analyzeAbortRef.current.abort();
        analyzeAbortRef.current = null;
      }
      setEvents([]);
      setAttachments([]);
      setGeneratedAttachments([]);
      setFeatureContext('');
      setError('');
      setLoading(false);
    }
  };

  const isSameAttachments = events.length > 0 &&
    attachments.length > 0 &&
    featureContext === generatedContext &&
    attachments.length === generatedAttachments.length &&
    attachments.every((a, idx) => a.id === generatedAttachments[idx]?.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      
      {/* Mobile Sidebar Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${mobileSidebarOpen ? 'active' : ''}`} 
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* ── Sidebar Navigation ── */}
      <aside 
        className={`${mobileSidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 260,
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${T.borderSoft}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img
              src="/logo.png"
              alt="Edvoy Logo"
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: T.t900, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Edvoy Events
            </h1>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.t500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Tracking Governance
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => { setActiveTab('generator'); setMobileSidebarOpen(false); }}
            className={`sidebar-nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', border: 'none', borderRadius: 8,
              background: activeTab === 'generator' ? T.purple50 : 'transparent',
              color: activeTab === 'generator' ? T.purple700 : T.t700,
              fontSize: 13, fontWeight: activeTab === 'generator' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-display)',
            }}
          >
            <IconZap color={activeTab === 'generator' ? T.purple700 : T.t500} />
            Event Generator
          </button>
          <button
            onClick={() => { setActiveTab('history'); setMobileSidebarOpen(false); }}
            className={`sidebar-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', border: 'none', borderRadius: 8,
              background: activeTab === 'history' ? T.purple50 : 'transparent',
              color: activeTab === 'history' ? T.purple700 : T.t700,
              fontSize: 13, fontWeight: activeTab === 'history' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-display)',
            }}
          >
            <IconLayers color={activeTab === 'history' ? T.purple700 : T.t500} />
            Specs History ({history.length})
          </button>
          <button
            onClick={() => { setActiveTab('guidelines'); setMobileSidebarOpen(false); }}
            className={`sidebar-nav-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', border: 'none', borderRadius: 8,
              background: activeTab === 'guidelines' ? T.purple50 : 'transparent',
              color: activeTab === 'guidelines' ? T.purple700 : T.t700,
              fontSize: 13, fontWeight: activeTab === 'guidelines' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-display)',
            }}
          >
            <IconListChecks color={activeTab === 'guidelines' ? T.purple700 : T.t500} />
            Naming Converter
          </button>
          <button
            onClick={() => { setActiveTab('scout'); setMobileSidebarOpen(false); }}
            className={`sidebar-nav-btn ${activeTab === 'scout' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', border: 'none', borderRadius: 8,
              background: activeTab === 'scout' ? T.purple50 : 'transparent',
              color: activeTab === 'scout' ? T.purple700 : T.t700,
              fontSize: 13, fontWeight: activeTab === 'scout' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-display)',
            }}
          >
            <IconScout color={activeTab === 'scout' ? T.purple700 : T.t500} />
            Scout
          </button>
        </nav>

        {/* Tracking Sheet Sync — per platform */}
        <div style={{ padding: '0 12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.t400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
            Tracking Sheets
          </div>
          {[{ key: 'ga4', label: 'GA4' }, { key: 'amplitude', label: 'Amplitude' }].map(({ key, label }) => {
            const cfg     = sheetConfig[key];
            const syncing = sheetSyncingFor === key;
            const open    = sheetInputFor === key;
            const draft   = sheetUrlDrafts[key] || '';
            return (
              <div key={key} style={{ marginBottom: 8 }}>
                {cfg?.data ? (
                  <div style={{ background: T.purple50, borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.purple700 }}>✓ {label}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setSheetInputFor(open ? null : key); setSheetUrlDrafts(p => ({ ...p, [key]: cfg.url || '' })); }}
                          style={{ fontSize: 10, color: open ? T.purple700 : T.t500, fontWeight: open ? 600 : 400, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          {open ? 'Done' : 'Edit'}</button>
                        <button onClick={() => syncSheet(key)} disabled={syncing}
                          style={{ fontSize: 10, fontWeight: 600, color: T.purple700, background: 'none', border: 'none', cursor: syncing ? 'default' : 'pointer', padding: 0 }}>
                          {syncing ? 'Syncing…' : 'Re-sync'}</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: T.t500, marginTop: 2 }}>
                      {cfg.data.rowCount} rows · {cfg.data.parameters?.length} params
                      {cfg.data.gid && cfg.data.gid !== '0' && <span style={{ color: T.purple600 }}> · tab #{cfg.data.gid}</span>}
                    </div>
                  </div>
                ) : !open ? (
                  <button
                    onClick={() => setSheetInputFor(key)}
                    style={{
                      width: '100%', padding: '7px 10px',
                      border: `1px dashed ${T.border}`, borderRadius: 8,
                      background: 'none', color: T.t500,
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--font-display)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.purple300; e.currentTarget.style.color = T.purple700; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.t500; }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Connect {label} sheet
                  </button>
                ) : null}

                {open && (
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder={`Paste ${label} tab URL…`}
                      value={draft}
                      onChange={e => setSheetUrlDrafts(p => ({ ...p, [key]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) syncSheet(key, draft.trim()); }}
                      style={{
                        width: '100%', padding: '7px 10px',
                        border: `1px solid ${T.border}`, borderRadius: 6,
                        fontSize: 11, fontFamily: 'var(--font-display)',
                        color: T.t700, background: T.surface,
                        boxSizing: 'border-box', outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                      <button
                        onClick={() => { if (draft.trim()) syncSheet(key, draft.trim()); }}
                        disabled={syncing || !draft.trim()}
                        style={{
                          flex: 1, padding: '6px 0',
                          background: (!draft.trim() || syncing) ? T.border : T.grad,
                          color: (!draft.trim() || syncing) ? T.t400 : '#fff',
                          border: 'none', borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          cursor: (!draft.trim() || syncing) ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-display)',
                        }}
                      >{syncing ? 'Connecting…' : 'Connect & Sync'}</button>
                      <button
                        onClick={() => { setSheetInputFor(null); setSheetUrlDrafts(p => ({ ...p, [key]: '' })); }}
                        style={{ padding: '6px 10px', background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, color: T.t500, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
                      >Cancel</button>
                    </div>
                    <p style={{ fontSize: 10, color: T.t400, marginTop: 5, lineHeight: 1.5 }}>
                      Open the exact tab → copy URL → paste. Share as "Anyone with the link can view".
                    </p>
                  </div>
                )}
                {sheetSyncError?.key === key && (
                  <p style={{ fontSize: 10.5, color: T.red700, marginTop: 5, lineHeight: 1.5, background: T.red50, border: `1px solid ${T.red200}`, borderRadius: 6, padding: '5px 8px' }}>
                    {sheetSyncError.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Workspace Profile Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${T.borderSoft}`,
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'linear-gradient(to top, #FAF9FD, #FFFFFF)',
        }}>
          {/* Avatar with gradient background */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: T.grad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 12.5,
            boxShadow: '0 2px 8px rgba(156, 32, 215, 0.2)',
            flexShrink: 0,
          }}>
            AP
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: T.t900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Ashish P.
              </span>
              <span 
                className="pulse-green-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                }}
                title="AI Agent Active: Connected to Groq Llama-4"
              />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: T.t500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Product Workspace
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Panel Container ── */}
      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Mobile Header Bar */}
        <div className="mobile-header-bar">
          <button
            onClick={() => setMobileSidebarOpen(p => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, display: 'flex', alignItems: 'center', color: T.t700
            }}
            aria-label="Toggle Navigation Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: 22, height: 22, objectFit: 'contain' }}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: T.t900 }}>
              Edvoy Events
            </span>
          </div>
          
          <div style={{ width: 22 }} />
        </div>

        {/* Header Bar */}
        <header className="desktop-header-bar" style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', fontSize: 18, fontWeight: 800, color: T.t900 }}>
              {activeTab === 'generator' && 'Event Tracking Generator'}
              {activeTab === 'history' && 'Event Specification History'}
              {activeTab === 'guidelines' && 'Batch Naming Converter'}
              {activeTab === 'scout' && 'Scout — Event Map'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {activeTab === 'generator' && (events.length > 0 || attachments.length > 0 || featureContext) && (
              <button
                onClick={resetWorkspace}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', border: `1px solid ${T.red200}`, borderRadius: 6,
                  background: T.surface, color: T.red700, fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.red50}
                onMouseLeave={e => e.currentTarget.style.background = T.surface}
              >
                <IconReset size={13} color={T.red700} />
                Reset Workspace
              </button>
            )}
          </div>
        </header>

        {/* Tab View Container */}
        <div className="tab-content-wrapper" style={{ flex: 1, padding: 32, maxWidth: 1280, width: '100%', margin: '0 auto' }}>

          {/* ─────────────────────────────────────────
             TAB 1: Generator Workspace
          ───────────────────────────────────────── */}
          {activeTab === 'generator' && (
            <div className="fade-in generator-workspace-layout">
              
              {/* Configuration panel (Left Column) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Platform select */}
                <div className="card-premium-hover" style={cardStyle}>
                  <div style={cardLabel}>Platform Taxonomy</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    background: T.bg,
                    padding: 4,
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    marginBottom: 10,
                    position: 'relative',
                  }}>
                    {/* Sliding Highlight Backdrop */}
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      bottom: 4,
                      left: platform === 'ga4' ? 4 : 'calc(50% + 2px)',
                      width: 'calc(50% - 6px)',
                      background: T.surface,
                      borderRadius: 6,
                      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 1,
                    }} />

                    <button
                      onClick={() => handlePlatformChange('ga4')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: 'none', borderRadius: 6,
                        background: 'transparent',
                        color: platform === 'ga4' ? T.purple700 : T.t500,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.25s',
                        zIndex: 2,
                        position: 'relative',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <IconGA4
                        size={13} 
                        style={{ borderRadius: 2, filter: platform === 'ga4' ? 'none' : 'grayscale(100%) opacity(0.6)' }} 
                      />
                      <span className="desktop-only">Google Analytics 4</span>
                      <span className="mobile-only">GA4</span>
                    </button>
                    <button
                      onClick={() => handlePlatformChange('amplitude')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: 'none', borderRadius: 6,
                        background: 'transparent',
                        color: platform === 'amplitude' ? '#1E61F0' : T.t500,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.25s',
                        zIndex: 2,
                        position: 'relative',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <IconAmplitude 
                        size={13} 
                        style={{ borderRadius: 2, filter: platform === 'amplitude' ? 'none' : 'grayscale(100%) opacity(0.6)' }} 
                      />
                      Amplitude
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: T.t500, lineHeight: 1.4 }}>
                    {platform === 'ga4' ? (
                      <div>
                        Generates clean <code style={codeTextStyle}>snake_case</code> schemas. Every event requires at least one parameter (defaults to <code style={codeTextStyle}>from</code>).
                      </div>
                    ) : (
                      <div>
                        Generates clean <code style={codeTextStyle}>snake_case</code> schemas conforming to Amplitude's taxonomy. Parameters are optional and can be left blank.
                      </div>
                    )}
                  </div>
                </div>

                {/* Feature context input */}
                <div className="card-premium-hover" style={cardStyle}>
                  <div style={cardLabel}>Feature Context (Optional)</div>
                  <textarea
                    value={featureContext}
                    onChange={e => setFeatureContext(e.target.value)}
                    placeholder="Specify user flow context (e.g., 'Counsellor booking flow') to guide parameter extraction."
                    rows={4}
                    style={{
                      width: '100%', border: `1px solid ${T.border}`,
                      borderRadius: 8, color: T.t900, padding: '10px 12px',
                      fontSize: 12.5, fontWeight: 400, resize: 'vertical',
                      outline: 'none', lineHeight: 1.5, transition: 'all 0.15s',
                      background: T.bg,
                    }}
                    onFocus={e => { e.target.style.borderColor = T.purple; e.target.style.boxShadow = `0 0 0 3px ${T.purple100}`; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.bg; }}
                  />
                </div>

                {/* Upload Zone */}
                <div className="card-premium-hover" style={cardStyle}>
                  <div style={cardLabel}>Screenshots / Video Flow</div>
                  <div
                    onDrop={e => {
                      if (processing || loading) { e.preventDefault(); return; }
                      onDrop(e);
                    }}
                    onDragOver={e => {
                      e.preventDefault();
                      if (!processing && !loading) setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => { if (!processing && !loading) fileRef.current.click(); }}
                    className={`dropzone-premium ${dragging ? "dropzone-dragging" : ""}`}
                    style={{
                      borderRadius: 10,
                      cursor: (processing || loading) ? 'not-allowed' : 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '24px 16px', gap: 8,
                      marginBottom: attachments.length ? 12 : 0,
                    }}
                  >
                    <input
                      ref={fileRef} type="file" accept="image/*,video/*"
                      multiple hidden onChange={e => addFiles(e.target.files)}
                    />
                    {processing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={spinAnimation}>
                          <IconSparkles size={22} color={T.purple} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: T.purple700 }}>Extracting video frames…</span>
                      </div>
                    ) : (
                      <>
                        <IconUpload size={22} color={dragging ? T.purple : T.t400} />
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.t700 }}>
                            Drag &amp; drop flow assets or <span style={{ color: T.purple, textDecoration: 'underline' }}>browse files</span>
                          </span>
                          <p style={{ fontSize: 10.5, color: T.t400, marginTop: 4 }}>
                            PNG, JPG, MP4, or MOV formats supported
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      {attachments.map(a => (
                        <AttachmentThumb
                          key={a.id} item={a}
                          onRemove={() => setAttachments(p => p.filter(x => x.id !== a.id))}
                          onPreview={setPreviewAttachment}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate Spec Action */}
                <button
                  onClick={analyze}
                  disabled={loading || processing || isSameAttachments || attachments.length === 0}
                  className="btn-active-shrink gradient-shine-btn"
                  style={{
                    padding: '12px 24px',
                    background: (loading || processing || isSameAttachments || attachments.length === 0) ? T.border : T.grad,
                    color: (loading || processing || isSameAttachments || attachments.length === 0) ? T.t400 : '#fff',
                    border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700,
                    cursor: (loading || processing || isSameAttachments || attachments.length === 0) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: (loading || processing || isSameAttachments || attachments.length === 0) ? 'none' : '0 4px 14px rgba(156, 32, 215, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (!loading && !processing && !isSameAttachments && attachments.length > 0) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { if (!loading && !processing && !isSameAttachments && attachments.length > 0) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <div style={spinStyle}>
                      <IconSparkles size={16} color={T.t400} />
                    </div>
                  ) : (
                    <IconSparkles size={16} />
                  )}
                  {loading ? 'Analyzing Screenshots…' : (isSameAttachments ? 'Spec Already Generated' : 'Generate Event Spec')}
                </button>

                {isSameAttachments && !loading && (
                  <p style={{ fontSize: 11.5, color: T.t400, textAlign: 'center', marginTop: -4, lineHeight: 1.5 }}>
                    Attachments unchanged — modify files or context to regenerate.
                  </p>
                )}

                {error && (
                  <div style={{
                    background: T.red50, border: `1px solid ${T.red200}`,
                    borderRadius: 8, padding: '10px 12px', fontSize: 12,
                    color: T.red700, fontWeight: 500, lineHeight: 1.4
                  }}>
                    {error}
                  </div>
                )}

              </div>

              {/* Specification Work Board (Right Column) */}
              <div style={{ minWidth: 0 }}>
                

                {events.length === 0 && !loading ? (
                  /* Workspace Empty State */
                  <div style={{
                    background: T.surface, border: `1px dashed ${T.border}`,
                    borderRadius: 16, padding: '80px 48px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: T.purple50, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', marginBottom: 20,
                    }}>
                      <IconLayout size={24} color={T.purple} />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', fontSize: 16, fontWeight: 800, color: T.t900, marginBottom: 8 }}>
                      Interactive Tracking Workspace
                    </h3>
                    <p style={{ fontSize: 12.5, color: T.t500, maxWidth: 440, lineHeight: 1.6, marginBottom: 24 }}>
                      Generate, review, and govern event tracking plans. Upload assets on the left to extract custom schemas, then review or edit results inline.
                    </p>
                    
                    <div className="steps-grid">
                      <div style={stepsCardStyle}>
                        <div style={stepsNumStyle}>1</div>
                        <div style={stepsTitleStyle}>Upload Assets</div>
                        <div style={stepsDescStyle}>Provide mockups, screenshots, or flow recordings.</div>
                      </div>
                      <div style={stepsCardStyle}>
                        <div style={stepsNumStyle}>2</div>
                        <div style={stepsTitleStyle}>Define Context</div>
                        <div style={stepsDescStyle}>Describe user actions and flow details.</div>
                      </div>
                      <div style={stepsCardStyle}>
                        <div style={stepsNumStyle}>3</div>
                        <div style={stepsTitleStyle}>Audit &amp; Export</div>
                        <div style={stepsDescStyle}>Refine parameter schemas and export to spreadsheet.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Interactive Table */
                  <div ref={resultsRef} className="slide-up" style={{
                    background: T.surface, borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                  }}>
                    {/* Console Header / Action Bar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 24px',
                      borderBottom: `1px solid ${T.borderSoft}`,
                      background: T.bg,
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            background: T.purple, color: '#fff',
                            padding: '2px 10px', borderRadius: 99,
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
                          }}>
                            {events.length} rows
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {platform === 'ga4' ? (
                              <IconGA4 size={13} style={{ borderRadius: 2 }} />
                            ) : (
                              <IconAmplitude size={13} style={{ borderRadius: 2 }} />
                            )}
                            <span style={{ fontSize: 12.5, color: T.t500, fontWeight: 600 }}>
                              {platform === 'ga4' ? 'GA4 event structure' : 'Amplitude event structure'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!loading && events.length > 0 && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={copyTsv}
                            style={actionButtonStyle(copiedState === 'tsv')}
                          >
                            {copiedState === 'tsv' ? <IconCheck size={13} /> : <IconCopy size={13} />}
                            {copiedState === 'tsv' ? 'Copied TSV' : 'Copy as TSV'}
                          </button>
                          
                          <button
                            onClick={downloadCsv}
                            style={actionButtonStyle(copiedState === 'csv')}
                          >
                            {copiedState === 'csv' ? <IconCheck size={13} /> : <IconDownload size={13} />}
                            {copiedState === 'csv' ? 'Downloaded' : 'Export CSV'}
                          </button>

                          <button
                            onClick={copyJson}
                            style={actionButtonStyle(copiedState === 'json')}
                          >
                            {copiedState === 'json' ? <IconCheck size={13} /> : <IconCode size={13} />}
                            {copiedState === 'json' ? 'Copied JSON' : 'Copy JSON'}
                          </button>
                        </div>
                      )}
                    </div>

                    {exportError && (
                      <div style={{
                        background: T.red50, border: `1px solid ${T.red200}`,
                        borderBottom: 'none', padding: '10px 24px', fontSize: 12,
                        color: T.red700, fontWeight: 500, lineHeight: 1.4,
                      }}>
                        {exportError}
                      </div>
                    )}

                    {/* Editable Grid Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={thStyle({ w: 140 })}>Category</th>
                            <th style={thStyle({ w: 220 })}>Suggested Event Name</th>
                            <th style={thStyle({ w: 180 })}>Parameter / Property</th>
                            <th style={thStyle({ w: 160 })}>Sample Value</th>
                            <th style={thStyle({ w: 60, textRight: true })}></th>
                          </tr>
                        </thead>

                        {loading ? <SkeletonRows /> : (
                          <tbody>
                            {events.map((e, i) => (
                              <tr
                                key={e._rowId || i}
                                className="row-enter-animated"
                                style={{
                                  background: T.surface,
                                  borderBottom: `1px solid ${T.borderSoft}`,
                                  transition: 'background 0.12s',
                                }}
                              >
                                {/* Category Dropdown */}
                                <td style={tdStyle}>
                                  <select
                                    value={e.category || ''}
                                    onChange={el => handleCellChange(i, 'category', el.target.value)}
                                    style={selectStyle(e.category)}
                                  >
                                    <option value="">Select Category</option>
                                    {(() => {
                                      const currentCategories = platform === 'ga4' ? GA4_CATEGORIES : AMPLITUDE_CATEGORIES;
                                      const dropdownOptions = [...currentCategories];
                                      if (e.category && !dropdownOptions.includes(e.category)) {
                                        dropdownOptions.push(e.category);
                                      }
                                      return dropdownOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ));
                                    })()}
                                  </select>
                                </td>


                                {/* Suggested Event Name */}
                                <td style={{ ...tdStyle, position: 'relative' }}>
                                  {(() => {
                                    const eventErr = getValidationError(e.suggested_event_name, 'event', platform, e);
                                    const eventInputStyle = {
                                      ...cellInputStyle(false, T.green700, T.green50),
                                      border: eventErr ? `1.5px solid ${T.red200}` : '1px solid transparent',
                                      background: eventErr ? T.red50 : T.green50,
                                      paddingRight: eventErr ? '28px' : '8px',
                                    };
                                    return (
                                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        <input
                                          type="text"
                                          value={e.suggested_event_name || ''}
                                          onChange={el => handleCellChange(i, 'suggested_event_name', el.target.value)}
                                          className={eventErr ? "error-shake-field" : ""}
                                          style={eventInputStyle}
                                          placeholder="event_name"
                                          title={eventErr || ''}
                                        />
                                        {eventErr && (
                                          <div 
                                            title={eventErr} 
                                            style={{
                                              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                              color: T.red700, display: 'flex', alignItems: 'center', cursor: 'help'
                                            }}
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                              <circle cx="12" cy="12" r="10"/>
                                              <line x1="12" y1="8" x2="12" y2="12"/>
                                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>

                                {/* Parameter / Property */}
                                <td style={{ ...tdStyle, position: 'relative' }}>
                                  {(() => {
                                    const paramErr = getValidationError(e.parameter, 'parameter', platform, e);
                                    const paramInputStyle = {
                                      ...cellInputStyle(false, T.purple700, T.purple50),
                                      border: paramErr ? `1.5px solid ${T.red200}` : '1px solid transparent',
                                      background: paramErr ? T.red50 : T.purple50,
                                      paddingRight: paramErr ? '28px' : '8px',
                                    };
                                    return (
                                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        <input
                                          type="text"
                                          value={e.parameter || ''}
                                          onChange={el => handleCellChange(i, 'parameter', el.target.value)}
                                          className={paramErr ? "error-shake-field" : ""}
                                          style={paramInputStyle}
                                          placeholder="parameter_name"
                                          title={paramErr || ''}
                                        />
                                        {paramErr && (
                                          <div 
                                            title={paramErr} 
                                            style={{
                                              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                              color: T.red700, display: 'flex', alignItems: 'center', cursor: 'help'
                                            }}
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                              <circle cx="12" cy="12" r="10"/>
                                              <line x1="12" y1="8" x2="12" y2="12"/>
                                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>

                                {/* Sample Value */}
                                <td style={tdStyle}>
                                  <input
                                    type="text"
                                    value={e.sample_value || ''}
                                    onChange={el => handleCellChange(i, 'sample_value', el.target.value)}
                                    style={cellInputStyle(false, T.t700, 'transparent')}
                                    placeholder="value"
                                  />
                                </td>

                                {/* Actions */}
                                <td style={{ ...tdStyle, textAlign: 'right', paddingRight: 16 }}>
                                  <button
                                    onClick={() => deleteRow(i)}
                                    style={{
                                      background: 'none', border: 'none', color: T.t400,
                                      cursor: 'pointer', padding: 6, borderRadius: 6,
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={el => { el.currentTarget.style.color = T.red700; el.currentTarget.style.background = T.red50; }}
                                    onMouseLeave={el => { el.currentTarget.style.color = T.t400; el.currentTarget.style.background = 'none'; }}
                                    title="Delete tracking row"
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>

                    {/* Table Footer Actions */}
                    {!loading && (
                      <div style={{
                        padding: '14px 24px',
                        background: '#FFF',
                        borderTop: `1px solid ${T.borderSoft}`,
                        display: 'flex',
                        justifyContent: 'flex-start',
                      }}>
                        <button
                          onClick={addRow}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: 6,
                            background: '#FFF', color: T.t700, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseEnter={el => { el.currentTarget.style.borderColor = T.borderHover; el.currentTarget.style.color = T.purple; }}
                          onMouseLeave={el => { el.currentTarget.style.borderColor = T.border; el.currentTarget.style.color = T.t700; }}
                        >
                          <IconPlus size={12} />
                          Add tracking row
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────
             TAB 2: History Log
          ───────────────────────────────────────── */}
          {activeTab === 'history' && (
            <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: T.t500 }}>
                  Review and load specifications previously generated by your team.
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    style={{
                      background: 'none', border: `1px solid ${T.red200}`, color: T.red700,
                      borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.red50; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div style={{
                  background: T.surface, border: `1px dashed ${T.border}`,
                  borderRadius: 16, padding: '64px 24px', textAlign: 'center',
                }}>
                  <IconHistory size={32} color={T.t400} />
                  <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', fontSize: 15, fontWeight: 800, color: T.t900, marginTop: 16 }}>
                    No spec history
                  </h3>
                  <p style={{ fontSize: 12, color: T.t500, marginTop: 4 }}>
                    Specs you generate in the Event Generator will save locally automatically.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(() => {
                      const itemsPerPage = 5;
                      const totalPages = Math.ceil(history.length / itemsPerPage);
                      const currentPage = Math.min(historyPage, totalPages || 1);
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);
                      return paginatedHistory.map(item => (
                        <div
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          style={{
                            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer', transition: 'all 0.15s', gap: 16,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = T.purple200; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              {item.platform === 'ga4' ? (
                                <IconGA4 size={16} style={{ borderRadius: 3, flexShrink: 0 }} />
                              ) : (
                                <IconAmplitude size={16} style={{ borderRadius: 3, flexShrink: 0 }} />
                              )}
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 700, color: T.t900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name.replace(/^(GA4|AMPLITUDE|Amplitude)\s+/i, '')}
                              </span>
                            </div>
                            
                            {item.featureContext && (
                              <p style={{ fontSize: 12, color: T.t500, marginTop: 6, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                "{item.featureContext}"
                              </p>
                            )}
                            
                            <div style={{ fontSize: 11, color: T.t400, marginTop: 6, display: 'flex', gap: 12 }}>
                              <span>Rows: {item.eventsCount}</span>
                              <span>•</span>
                              <span>Generated: {formatTimestamp(item.timestamp)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {historyThumbs[item.id] && (
                              <img
                                src={historyThumbs[item.id]}
                                alt=""
                                style={{ width: 60, height: 38, objectFit: 'cover', borderRadius: 6, border: `1px solid ${T.border}`, flexShrink: 0, display: 'block' }}
                              />
                            )}
                            <button
                              onClick={(e) => deleteHistoryItem(item.id, e)}
                              style={{
                                background: 'none', border: 'none', color: T.t400,
                                padding: 8, borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = T.red700; e.currentTarget.style.background = T.red50; }}
                              onMouseLeave={e => { e.currentTarget.style.color = T.t400; e.currentTarget.style.background = 'none'; }}
                            >
                              <IconTrash size={14} />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {(() => {
                    const itemsPerPage = 5;
                    const totalPages = Math.ceil(history.length / itemsPerPage);
                    const currentPage = Math.min(historyPage, totalPages || 1);
                    if (totalPages <= 1) return null;
                    return (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: 20, padding: '12px 16px', background: T.surface,
                        border: `1px solid ${T.border}`, borderRadius: 12,
                        boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                      }}>
                        <button
                          onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: 6,
                            background: T.surface, color: currentPage === 1 ? T.t400 : T.t700,
                            fontSize: 12, fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: 'var(--font-display)',
                          }}
                          onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.borderColor = T.borderHover; }}
                          onMouseLeave={e => { if (currentPage !== 1) e.currentTarget.style.borderColor = T.border; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                          Previous
                        </button>
                        
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: T.t500, fontFamily: 'var(--font-display)' }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: 6,
                            background: T.surface, color: currentPage === totalPages ? T.t400 : T.t700,
                            fontSize: 12, fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: 'var(--font-display)',
                          }}
                          onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = T.borderHover; }}
                          onMouseLeave={e => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = T.border; }}
                        >
                          Next
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────
             TAB 3: Naming Guidelines
          ───────────────────────────────────────── */}
          {activeTab === 'guidelines' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* ── Batch Naming Converter ── */}
              {(() => {
                const lines = converterInput.split('\n');
                const convertedLines = lines.map(line => line.trim() ? toSnakeCase(line) : '');
                const convertedText = convertedLines.join('\n');
                return (
                  <div className="card-premium-hover" style={cardStyle}>
                    <div style={cardLabel}>Batch Naming Converter</div>
                    <p style={{ fontSize: 12.5, color: T.t500, marginBottom: 14, lineHeight: 1.5 }}>
                      Paste raw event or parameter names (e.g. <code>Continue with email</code>). They are converted to clean <code>snake_case</code> formats in real-time. Supports single or multiple names (one per line).
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {/* Raw Inputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.t500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Raw Inputs</span>
                        <textarea
                          value={converterInput}
                          onChange={e => { setConverterInput(e.target.value); setConverterCopied(false); }}
                          placeholder="Continue with email"
                          rows={3}
                          style={{
                            width: '100%',
                            border: `1px solid ${T.border}`,
                            borderRadius: 8, color: T.t900, padding: '10px 12px',
                            fontSize: 12.5, outline: 'none', resize: 'vertical',
                            background: T.bg,
                            fontFamily: "var(--font-mono)",
                            lineHeight: 1.5,
                            transition: 'all 0.15s',
                          }}
                          onFocus={e => { e.target.style.borderColor = T.purple; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${T.purple100}`; }}
                          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                      
                      {/* Converted Outputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.t500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>snake_case outputs</span>
                          {convertedText && (
                            <button
                              onClick={() => {
                                  navigator.clipboard.writeText(convertedText);
                                  setConverterCopied(true);
                                  setTimeout(() => setConverterCopied(false), 2000);
                              }}
                              style={{
                                background: converterCopied ? T.green50 : T.purple50,
                                border: `1px solid ${converterCopied ? T.green200 : T.purple200}`,
                                borderRadius: 5,
                                padding: '2px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: converterCopied ? T.green700 : T.purple700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                transition: 'all 0.15s',
                              }}
                            >
                              {converterCopied ? <IconCheck size={11} /> : <IconCopy size={11} />}
                              {converterCopied ? 'Copied!' : 'Copy List'}
                            </button>
                          )}
                        </div>
                        <textarea
                          readOnly
                          value={convertedText}
                          placeholder="continue_with_email"
                          rows={3}
                          style={{
                            width: '100%',
                            border: `1px solid ${T.border}`,
                            borderRadius: 8, color: T.purple700, padding: '10px 12px',
                            fontSize: 12.5, outline: 'none', resize: 'vertical',
                            background: T.purple50,
                            fontFamily: "var(--font-mono)",
                            lineHeight: 1.5,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* ─────────────────────────────────────────
              Scout — Event Map (isolated, own state)
          ───────────────────────────────────────── */}
          {activeTab === 'scout' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={cardStyle}>
                <div style={cardLabel}>Search</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={scoutQuery}
                    onChange={(e) => setScoutQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') runScoutSearch(scoutQuery); }}
                    placeholder="Search by event name (click_view_application) or screen name (Course Details)…"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: `1px solid ${T.border}`, fontSize: 13.5,
                      outline: 'none', fontFamily: 'var(--font-body)',
                    }}
                  />
                  <button
                    onClick={() => runScoutSearch(scoutQuery)}
                    style={{
                      padding: '10px 20px', borderRadius: 8, border: 'none',
                      background: T.grad || T.purple, color: '#fff',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>

              {scoutLoading && (
                <div style={{ ...cardStyle, textAlign: 'center', color: T.t500, fontSize: 13 }}>
                  Searching…
                </div>
              )}

              {!scoutLoading && scoutSearched && scoutResults.length === 0 && (
                <div style={{ ...cardStyle, textAlign: 'center', color: T.t500, fontSize: 13 }}>
                  {scoutQuery
                    ? `No matches for "${scoutQuery}".`
                    : 'Repository is empty. It builds up as screens are crawled and saved.'}
                </div>
              )}

              {!scoutLoading && scoutResults.length > 0 && (
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  {/* Screen image with highlight overlay */}
                  <div style={{ ...cardStyle, flex: 1, padding: 16 }}>
                    {scoutSelected && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.t900 }}>
                            {scoutSelected.screenName}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.t500, textTransform: 'uppercase' }}>
                            {scoutSelected.platform}
                          </span>
                        </div>
                        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                          {scoutImgLoading && !scoutSelected.image && (
                            <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.t500, fontSize: 13 }}>
                              Loading screenshot…
                            </div>
                          )}
                          {scoutSelected.image && <img
                            src={scoutSelected.image}
                            alt={scoutSelected.screenName}
                            style={{ maxWidth: '100%', borderRadius: 8, border: `1px solid ${T.border}`, display: 'block' }}
                            ref={scoutImgRef}
                            onLoad={(e) => {
                              setScoutImgDims({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 });
                            }}
                          />}
                          {scoutSelected.image && scoutActiveEvent && scoutActiveEvent.bbox && scoutActiveEvent.bbox[2] > 0 && scoutImgDims.w > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                left: `${(scoutActiveEvent.bbox[0] / scoutImgDims.w) * 100}%`,
                                top: `${(scoutActiveEvent.bbox[1] / scoutImgDims.h) * 100}%`,
                                width: `${(scoutActiveEvent.bbox[2] / scoutImgDims.w) * 100}%`,
                                height: `${(scoutActiveEvent.bbox[3] / scoutImgDims.h) * 100}%`,
                                border: '3px solid #FF3D00',
                                borderRadius: 6,
                                boxShadow: '0 0 0 2px #ffffff, 0 0 0 5px #FF3D00, 0 0 20px 4px rgba(255,61,0,0.65)',
                                pointerEvents: 'none',
                                transition: 'all 0.2s ease',
                              }}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Results list + events for selected screen */}
                  <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={cardStyle}>
                      <div style={cardLabel}>Events ({scoutResults.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {scoutResults.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { setScoutSelected(s); setScoutActiveEvent(s.events?.[0] || null); }}
                            style={{
                              textAlign: 'left', padding: '8px 10px', borderRadius: 6,
                              border: `1px solid ${s.id === scoutSelected?.id ? T.purple700 : T.border}`,
                              background: s.id === scoutSelected?.id ? T.purple50 : T.surface,
                              cursor: 'pointer',
                              fontFamily: 'var(--font-display)',
                            }}
                          >
                            <div style={{ fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--font-mono)', color: s.id === scoutSelected?.id ? T.purple700 : T.t700 }}>
                              {s.events?.[0]?.event_name || s.screenName}
                            </div>
                            <div style={{ fontSize: 11, color: s.id === scoutSelected?.id ? T.purple500 : T.t400, marginTop: 2 }}>
                              {s.screenName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {scoutSelected && (
                      <div style={cardStyle}>
                        <div style={cardLabel}>Events on this screen</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(scoutSelected.events || []).map((ev, i) => (
                            <button
                              key={i}
                              onClick={() => setScoutActiveEvent(ev)}
                              style={{
                                textAlign: 'left', padding: '8px 10px', borderRadius: 6,
                                border: `1px solid ${ev === scoutActiveEvent ? T.purple700 : T.border}`,
                                background: ev === scoutActiveEvent ? T.purple50 : T.surface,
                                cursor: 'pointer', fontFamily: "var(--font-mono)",
                                fontSize: 11.5, color: ev === scoutActiveEvent ? T.purple700 : T.t700,
                              }}
                            >
                              {ev.event_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!scoutSearched && !scoutLoading && (
                <div style={{ ...cardStyle, textAlign: 'center', color: T.t500, fontSize: 13, padding: '40px 20px' }}>
                  Loading repository…
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {previewAttachment && (
        <AttachmentPreviewModal
          item={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Inline / Styled Styles Objects
───────────────────────────────────────── */
const cardStyle = {
  background: T.surface,
  borderRadius: 16,
  padding: '20px',
  border: `1px solid ${T.border}`,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
};

const cardLabel = {
  fontFamily: 'var(--font-display)',
  fontSize: 10.5,
  fontWeight: 800,
  color: T.t500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 12,
};

const codeTextStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  background: T.bg,
  padding: '2px 5px',
  borderRadius: 4,
  border: `1px solid ${T.border}`,
};

const stepsCardStyle = {
  padding: 16,
  borderRadius: 12,
  background: T.bg,
  border: `1px solid ${T.borderSoft}`,
};

const stepsNumStyle = {
  width: 22, height: 22, borderRadius: '50%',
  background: T.purple, color: '#fff',
  fontSize: 11, fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: 10,
  fontFamily: 'var(--font-display)',
};

const stepsTitleStyle = {
  fontSize: 12.5, fontWeight: 600, color: T.t900,
  marginBottom: 4,
  fontFamily: 'var(--font-display)',
};

const stepsDescStyle = {
  fontSize: 11.5, color: T.t500, lineHeight: 1.4,
};

const thStyle = ({ w, textRight = false }) => ({
  textAlign: textRight ? 'right' : 'left',
  padding: '12px 16px',
  fontSize: 10.5,
  fontWeight: 600,
  color: T.t500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  background: T.bg,
  borderBottom: `1px solid ${T.border}`,
  whiteSpace: 'nowrap',
  minWidth: w,
  fontFamily: 'var(--font-display)',
});

const tdStyle = {
  padding: '10px 16px',
  verticalAlign: 'middle',
};

const selectStyle = (val) => {
  const customColors = CAT_COLOR[val] || { bg: '#FFF', fg: T.t700 };
  const chevronColor = encodeURIComponent(customColors.fg || T.t700);
  return {
    background: customColors.bg,
    color: customColors.fg,
    border: `1px solid ${T.border}`,
    padding: '4px 24px 4px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.15s',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='${chevronColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 4.5 6 7.5 9 4.5'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
  };
};

const cellInputStyle = (isMonospace = false, customColor = T.t900, customBg = 'transparent') => ({
  width: '100%',
  background: customBg,
  color: customColor,
  border: '1px solid transparent',
  padding: '4px 8px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: isMonospace ? "var(--font-mono)" : 'inherit',
  fontWeight: isMonospace ? 400 : 500,
  outline: 'none',
  transition: 'all 0.15s',
  textOverflow: 'ellipsis',
  '::placeholder': { color: T.t400 }
});

// Custom hover styles now defined in index.html stylesheet.

const actionButtonStyle = (active) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 8,
  background: active ? T.green50 : T.surface,
  border: `1px solid ${active ? T.green200 : T.border}`,
  color: active ? T.green700 : T.t700,
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
  transition: 'all 0.15s',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
});

const subSectionTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: T.t700,
  marginBottom: 8,
  fontFamily: 'var(--font-display)',
};

const guidelineText = {
  fontSize: 12.5,
  color: T.t500,
  lineHeight: 1.5,
};

const guidelineList = {
  fontSize: 12.5,
  color: T.t500,
  lineHeight: 1.6,
  paddingLeft: 20,
  marginTop: 6,
};

const spinStyle = {
  animation: 'spin 1s linear infinite',
  display: 'inline-flex',
};

const spinAnimation = {
  animation: 'spin 1.5s linear infinite',
  display: 'inline-flex',
};

// Standard spin animation keyframe now defined in index.html stylesheet.

/* ─────────────────────────────────────────
   Mount
───────────────────────────────────────── */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
