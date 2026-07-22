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
  'Referral',
  'Results',
  'Search',
  'Search Filter',
  'Subject Page',
  'Testimonials',
  'Universities'
];

const AMPLITUDE_CATEGORIES = [
  'App Update Screen',
  'Country Story',
  'Course Card',
  'Course Page',
  'Genie Banner',
  'Institution Card',
  'Login or Sign-up Flow',
  'Meet',
  'Onboarding Screen',
  'Profile',
  'Refer and Earn',
  'Settings',
  'Shortlist',
  'Stand-by Flow',
  'Trending Subjects'
];

// Which Edvoy space a tracking sheet / spec / history item belongs to.
// Scopes sheet config + specs history so Student and Connect data never mix.
const SPACES = [
  { key: 'edvoy-student', label: 'Edvoy Student' },
  { key: 'edvoy-connect', label: 'Edvoy Connect' },
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
  'App Update Screen': { bg: '#F0F9FF', fg: '#0369A1', dot: '#0EA5E9' },
  'Explore and Explore Page Banner': { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
  'Genie Banner': { bg: '#FAF5FF', fg: '#7E22CE', dot: '#A855F7' },
  'Genie Banner Logged Out': { bg: '#FAF5FF', fg: '#7E22CE', dot: '#A855F7' },
  'Stand-by Flow': { bg: '#ECFDF5', fg: '#065F46', dot: '#10B981' },
  'Terms of Service and  Privacy Policy': { bg: '#F8FAFC', fg: '#475569', dot: '#94A3B8' },
  'Country Story':      { bg: '#ECFEFF', fg: '#0E7490', dot: '#06B6D4' },
  'Course Card':        { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
  'Institution Card':   { bg: '#FFF1F2', fg: '#BE123C', dot: '#F43F5E' },
  'Trending Subjects':  { bg: '#F5F3FF', fg: '#6D28D9', dot: '#8B5CF6' },
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

function TrackingSheetCard({ label, logo, logoBg, connected, syncing, onEdit, onResync }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${hover ? T.purple200 : T.border}`,
        boxShadow: hover ? '0 4px 14px -6px rgba(124,58,237,.18)' : 'none',
        borderRadius: 10, padding: '8px 10px', background: T.surface,
        transition: 'border-color .15s, box-shadow .15s',
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <span style={{
        width: 26, height: 26, borderRadius: 7, background: logoBg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {logo}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: T.t700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: connected ? '#16A34A' : T.t400 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: T.t500 }}>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={onEdit} title="Edit" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', borderRadius: 6, padding: '5px', cursor: 'pointer',
          color: T.t500, background: T.bg, width: 26, height: 26,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" /><path d="M13 7 L17 11" />
          </svg>
        </button>
        <button onClick={onResync} disabled={syncing} title="Re-sync" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', borderRadius: 6, padding: '5px', cursor: syncing ? 'default' : 'pointer',
          color: T.purple700, background: T.purple50, opacity: syncing ? 0.6 : 1, width: 26, height: 26,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 8 A9 9 0 0 0 5 5 L3 7" /><path d="M3 3 V7 H7" />
            <path d="M3 16 A9 9 0 0 0 19 19 L21 17" /><path d="M21 21 V17 H17" />
          </svg>
        </button>
      </div>
    </div>
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

// Scene-change frame extraction. Instead of grabbing a fixed number of frames at
// arbitrary times, densely sample the video and keep a frame only when the screen
// meaningfully changes vs the last kept one — so we capture each distinct screen/state
// in the flow (and skip loading/scrolling/dead time), not N evenly-spaced stills.
// The count of frames is therefore driven by the video's content, with a safety cap
// so a chaotic recording can't explode AI cost.
function extractVideoFrames(file) {
  const MAX_SAMPLES = 60;    // how many probe points we seek to (bounds processing time)
  const MAX_KEEP    = 12;    // hard cap on frames sent to the AI (cost guard)
  const DIFF_THRESH = 0.075; // normalised 0..1 mean pixel change that counts as "new screen"
  const SW = 64, SH = 36;    // tiny canvas used only for the cheap difference check

  return new Promise(resolve => {
    const url   = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted   = true;
    video.src     = url;

    const smallCanvas = document.createElement('canvas'); smallCanvas.width = SW; smallCanvas.height = SH;
    const sctx = smallCanvas.getContext('2d', { willReadFrequently: true });
    const fullCanvas = document.createElement('canvas');
    const fctx = fullCanvas.getContext('2d');

    const finish = frames => { URL.revokeObjectURL(url); resolve(frames); };

    // Some containers (stream/MediaRecorder-recorded webm) report duration = Infinity until
    // you seek past the end. Force the browser to compute the real duration first, then sample.
    video.addEventListener('loadedmetadata', () => {
      if (isFinite(video.duration) && video.duration > 0) return startSampling(video.duration);
      const onProbe = () => {
        video.removeEventListener('seeked', onProbe);
        const d = (isFinite(video.duration) && video.duration > 0) ? video.duration : video.currentTime;
        const onBack = () => { video.removeEventListener('seeked', onBack); startSampling(d); };
        video.addEventListener('seeked', onBack);
        video.currentTime = 0;
      };
      video.addEventListener('seeked', onProbe);
      video.currentTime = 1e7; // clamps to the true end, resolving duration
    });

    function startSampling(d) {
      if (!(isFinite(d) && d > 0)) return finish([]); // unreadable; caller keeps videoUrl for playback

      const samples = Math.max(2, Math.min(MAX_SAMPLES, Math.round(d / 0.5)));
      const step    = d / samples;
      const times   = Array.from({ length: samples }, (_, i) => Math.min(d - 0.05, step * i + step / 2));

      const kept = [];   // dataUrls of frames we decided to keep
      let last = null;   // downscaled RGB pixels of the last KEPT frame
      let idx = 0;

      // Keep RGB (drop alpha) — a grayscale diff misses colour-only transitions
      // (e.g. green→blue screens have near-identical luminance).
      const sampleRGB = data => {
        const g = new Uint8ClampedArray(SW * SH * 3);
        for (let i = 0, p = 0; i < data.length; i += 4) { g[p++] = data[i]; g[p++] = data[i + 1]; g[p++] = data[i + 2]; }
        return g;
      };
      const diff = (a, b) => {
        let s = 0;
        for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
        return s / (a.length * 255); // 0..1 mean per-channel change
      };

      const next = () => {
        if (idx >= times.length) return done();
        video.currentTime = times[idx];
      };

      video.addEventListener('seeked', () => {
        sctx.drawImage(video, 0, 0, SW, SH);
        const cur = sampleRGB(sctx.getImageData(0, 0, SW, SH).data);
        // Keep the first frame always; after that, only when the screen changed enough.
        if (last === null || diff(cur, last) > DIFF_THRESH) {
          fullCanvas.width  = video.videoWidth  || SW;
          fullCanvas.height = video.videoHeight || SH;
          fctx.drawImage(video, 0, 0);
          kept.push(fullCanvas.toDataURL('image/jpeg', 0.85));
          last = cur;
        }
        idx++;
        next();
      });

      const done = () => {
        let frames = kept;
        // If the flow had more distinct screens than the cap, keep an even spread.
        if (frames.length > MAX_KEEP) {
          const stepK = (frames.length - 1) / (MAX_KEEP - 1);
          frames = Array.from({ length: MAX_KEEP }, (_, i) => kept[Math.round(i * stepK)]);
        }
        finish(frames);
      };

      next();
    }

    video.addEventListener('error', () => finish([]));
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
              {item.frameCount} frame{item.frameCount === 1 ? '' : 's'}
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

function AttachmentPreviewModal({ items, index, onIndexChange, onClose }) {
  const [frameIdx, setFrameIdx] = React.useState(0);
  const total   = items.length;
  const hasPrev = index > 0;
  const hasNext = index < total - 1;
  const goPrev  = React.useCallback(() => { if (index > 0) onIndexChange(index - 1); }, [index, onIndexChange]);
  const goNext  = React.useCallback(() => { if (index < total - 1) onIndexChange(index + 1); }, [index, total, onIndexChange]);

  // Reset video frame position whenever we move to a different attachment.
  React.useEffect(() => { setFrameIdx(0); }, [index]);

  React.useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  const item        = items[index] || {};
  const isVideo     = item.type === 'video';
  const frames      = isVideo ? (item.frames || []) : null;
  const canPlayVideo = isVideo && !!item.videoUrl; // original video kept (generator session only)
  const src         = isVideo ? frames[frameIdx] : item.dataUrl;

  const navBtnStyle = enabled => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
    width: 42, height: 42, borderRadius: '50%',
    background: 'rgba(255,255,255,0.14)', color: '#fff',
    border: '1.5px solid rgba(255,255,255,0.3)',
    fontSize: 20, lineHeight: 1, cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.25,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.15s, background 0.15s',
  });

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

        {total > 1 && (
          <button
            onClick={goPrev} disabled={!hasPrev} aria-label="Previous image"
            title="Previous (←)"
            style={{ ...navBtnStyle(hasPrev), left: -54 }}
          >‹</button>
        )}
        {total > 1 && (
          <button
            onClick={goNext} disabled={!hasNext} aria-label="Next image"
            title="Next (→)"
            style={{ ...navBtnStyle(hasNext), right: -54 }}
          >›</button>
        )}

        {canPlayVideo ? (
          <video
            key={item.videoUrl} src={item.videoUrl}
            controls autoPlay playsInline
            style={{ maxWidth: '82vw', maxHeight: '74vh', borderRadius: 10, display: 'block', background: '#000' }}
          />
        ) : (
          <img
            src={src} alt={item.name}
            style={{ maxWidth: '82vw', maxHeight: '74vh', borderRadius: 10, display: 'block', objectFit: 'contain' }}
          />
        )}

        {/* Frame strip is the still fallback (e.g. a saved-history video with no playable file) */}
        {isVideo && !canPlayVideo && frames.length > 1 && (
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
          {item.name}{isVideo ? (canPlayVideo ? ' · Video' : ` · Frame ${frameIdx + 1} of ${frames.length}`) : ''}
          {item.fromHistory ? ' · Saved attachment' : ''}
          {total > 1 ? ` · ${index + 1} of ${total}` : ''}
        </p>
      </div>
    </div>
  );
}

/* Scout self-serve upload — drag a folder, review the derived event names, commit.
   Each screenshot → one screen record; filename (minus extension) = event_name. */
function ScoutUploadModal({ space, spaceLabel, records, onClose, onUploaded }) {
  const [files, setFiles]       = React.useState([]);
  const [category, setCategory] = React.useState('');
  const [platform, setPlatform] = React.useState('amplitude');
  const [replace, setReplace]   = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [phase, setPhase]       = React.useState('pick');     // pick | uploading | done
  const [progress, setProgress] = React.useState({ done: 0, total: 0 });
  const [result, setResult]     = React.useState({ ok: 0, fail: [] });
  const [error, setError]       = React.useState('');

  const GA4Logo = () => (<svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><rect x="3.5" y="15" width="4" height="6" rx="1.6" fill="#F9AB00"/><rect x="10" y="10" width="4" height="11" rx="1.6" fill="#F9AB00"/><rect x="16.5" y="5" width="4" height="16" rx="1.6" fill="#F9AB00"/></svg>);
  const AMPLogo = () => (<svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="11" fill="#1F6CE2"/><path d="M6 16 C 8 16 8.5 8 10 8 C 11.5 8 12 16 14 16 C 16 16 16.5 11 18 11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>);

  const isImg = f => f.type.startsWith('image/') || ['png','jpg','jpeg','gif','webp','bmp'].includes(f.name.split('.').pop().toLowerCase());
  const deriveEvent = n => n.replace(/\.[^.]+$/, '');
  const busy = phase === 'uploading';

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [busy, onClose]);

  const addFiles = (list, folderName) => {
    const imgs = list.filter(isImg);
    if (!imgs.length) {
      if (list.length) setError('No image files in that selection (PNG, JPG, GIF, WebP, BMP).');
      return;
    }
    setError('');
    setFiles(prev => {
      const map = new Map(prev.map(f => [f.name, f]));
      imgs.forEach(f => map.set(f.name, f));
      return [...map.values()];
    });
    const folder = folderName || imgs[0].webkitRelativePath?.split('/')[0];
    setCategory(c => c.trim() || folder || '');
  };

  // Folder drag-drop: walk the dropped directory tree (webkitGetAsEntry).
  const fileFromEntry = en => new Promise(res => en.file(res));
  const readDir = (dir, out) => new Promise(resolve => {
    const reader = dir.createReader();
    const read = () => reader.readEntries(async ents => {
      if (!ents.length) return resolve();
      for (const en of ents) {
        if (en.isFile) out.push(await fileFromEntry(en));
        else if (en.isDirectory) await readDir(en, out);
      }
      read();  // readEntries returns in chunks — keep going until empty
    }, () => resolve());
    read();
  });
  const onDrop = async e => {
    e.preventDefault(); setDragging(false);
    const items = e.dataTransfer.items;
    const entries = items && items.length && items[0].webkitGetAsEntry
      ? [...items].map(i => i.webkitGetAsEntry()).filter(Boolean) : null;
    if (entries) {
      const out = []; let folderName = '';
      for (const en of entries) {
        if (en.isFile) out.push(await fileFromEntry(en));
        else if (en.isDirectory) { folderName = folderName || en.name; await readDir(en, out); }
      }
      addFiles(out, folderName);
    } else {
      addFiles([...e.dataTransfer.files]);
    }
  };

  const cat = category.trim();
  const existingCats = [...new Set(records.map(r => r.screenName))].sort();
  const catRecords = cat ? records.filter(r => r.screenName === cat && (r.space || 'edvoy-student') === space && r.platform === platform) : [];
  const dupCount = catRecords.length;
  // event names already saved for this category (to flag would-be duplicate records)
  const existingEvNames = new Set(catRecords.flatMap(r => (r.events || []).map(e => e.event_name)));
  const evNames = files.map(f => deriveEvent(f.name));
  const dupInBatch = new Set(evNames.filter((n, i) => evNames.indexOf(n) !== i));
  const uploadable = files.filter(f => deriveEvent(f.name));       // drop files that derive an empty name
  const badNameCount = files.length - uploadable.length;
  const collideCount = replace ? 0 : uploadable.filter(f => existingEvNames.has(deriveEvent(f.name))).length;
  const canUpload = !!cat && uploadable.length > 0 && !busy;

  const doUpload = async () => {
    if (!canUpload) return;
    setError('');
    setPhase('uploading'); setProgress({ done: 0, total: uploadable.length });
    // Replace first — if any delete fails, abort rather than silently create duplicates.
    if (replace) {
      const existing = records.filter(r => r.screenName === cat && (r.space || 'edvoy-student') === space && r.platform === platform);
      try {
        for (const r of existing) {
          const del = await fetch('/api/screens', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id }) });
          if (!del.ok) throw new Error();
        }
      } catch {
        setError(`Couldn't remove the existing ${cat} records — nothing was uploaded. Try again.`);
        setPhase('pick');
        return;
      }
    }
    let ok = 0; const fail = [];
    for (let i = 0; i < uploadable.length; i++) {
      const f = uploadable[i];
      try {
        const dataUrl = await toDataUrl(f);
        const ev = deriveEvent(f.name);
        const resp = await fetch('/api/screens', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenName: cat, platform, image: dataUrl, events: [{ bbox: [0, 0, 0, 0], label: ev, event_name: ev }], space }),
        });
        resp.ok ? ok++ : fail.push(f.name);
      } catch { fail.push(f.name); }
      setProgress({ done: i + 1, total: uploadable.length });
    }
    setResult({ ok, fail });
    setPhase('done');
  };

  const seg = on => ({
    flex: 1, padding: '9px 0', borderRadius: 8, cursor: busy ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    border: on ? '1.5px solid #7C3AED' : `1.5px solid ${T.border}`,
    background: on ? '#F5F0FF' : '#fff', color: on ? '#7C3AED' : T.t700,
    fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', transition: 'all .12s',
  });

  return (
    <div onClick={() => !busy && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(20,14,40,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{ width: 'min(580px, 96vw)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, boxShadow: '0 40px 80px -20px rgba(30,15,60,.45)', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '20px 22px 16px', borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-.02em', color: '#0F0F14' }}>Upload to Scout</div>
            <div style={{ fontSize: 12.5, color: T.t500, marginTop: 3 }}>
              Screenshots → events in <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F5F0FF', color: '#7C3AED', fontWeight: 700, padding: '1px 8px', borderRadius: 99, fontSize: 11.5 }}>{spaceLabel}</span>
            </div>
          </div>
          {!busy && (
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.t500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflowY: 'auto', fontFamily: 'var(--font-body)' }}>

          {error && phase === 'pick' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
              <span style={{ fontSize: 12.5, color: '#B91C1C', lineHeight: 1.45 }}>{error}</span>
            </div>
          )}

          {phase === 'done' ? (() => {
            const allFailed = result.ok === 0 && result.fail.length > 0;
            const iconBg = allFailed ? '#FEE2E2' : result.fail.length ? '#FEF3C7' : '#DCFCE7';
            const iconFg = allFailed ? '#DC2626' : result.fail.length ? '#B45309' : '#15803D';
            return (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg }}>
                {allFailed
                  ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconFg} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
                  : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={iconFg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 L9 17 L4 12"/></svg>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#0F0F14' }}>
                {allFailed ? 'Upload failed — nothing added' : `Added ${result.ok} screen${result.ok === 1 ? '' : 's'} to ${cat}`}
              </div>
              {result.fail.length > 0 && (
                <div style={{ marginTop: 12, textAlign: 'left', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#B45309', marginBottom: 6 }}>{result.fail.length} failed</div>
                  {result.fail.slice(0, 6).map(n => <div key={n} style={{ fontSize: 11.5, color: '#92400E', fontFamily: 'var(--font-mono)' }}>{n}</div>)}
                  {result.fail.length > 6 && <div style={{ fontSize: 11.5, color: '#92400E' }}>+{result.fail.length - 6} more</div>}
                </div>
              )}
            </div>
            );
          })() : files.length === 0 ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 24px', borderRadius: 14, textAlign: 'center', border: `2px dashed ${dragging ? '#7C3AED' : T.border}`, background: dragging ? '#F5F0FF' : '#FAFAFC', transition: 'all .15s' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#F1EBFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0F14' }}>Drop screenshots or a folder here</div>
              <div style={{ fontSize: 12.5, color: T.t500, marginBottom: 4 }}>Each file name becomes the event name</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', border: 'none', background: T.grad || '#7C3AED', color: '#fff', fontSize: 12.5, fontWeight: 700 }}>
                  Choose files
                  <input type="file" accept="image/*" multiple hidden onChange={e => addFiles([...e.target.files])} />
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${T.border}`, background: '#fff', color: T.t700, fontSize: 12.5, fontWeight: 700 }}>
                  Choose folder
                  <input type="file" webkitdirectory="" directory="" multiple hidden onChange={e => addFiles([...e.target.files])} />
                </label>
              </div>
            </div>
          ) : (
            <>
              {/* Category + platform */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: T.t700, marginBottom: 6 }}>Category</div>
                  <input type="text" list="scout-cat-list" value={category} disabled={busy}
                    onChange={e => setCategory(e.target.value)} placeholder="e.g. Profile"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
                  <datalist id="scout-cat-list">{existingCats.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: T.t700, marginBottom: 6 }}>Platform</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => !busy && setPlatform('ga4')} style={seg(platform === 'ga4')}><GA4Logo />GA4</button>
                    <button onClick={() => !busy && setPlatform('amplitude')} style={seg(platform === 'amplitude')}><AMPLogo />Amplitude</button>
                  </div>
                </div>
              </div>

              {/* Review list */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: T.t700 }}>{files.length} event{files.length === 1 ? '' : 's'} to add</div>
                {!busy && (
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#7C3AED', cursor: 'pointer' }}>
                    + Add files
                    <input type="file" accept="image/*" multiple hidden onChange={e => addFiles([...e.target.files])} />
                  </label>
                )}
              </div>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, maxHeight: 220, overflowY: 'auto' }}>
                {files.map((f, i) => {
                  const ev = deriveEvent(f.name);
                  const dup = ev && dupInBatch.has(ev);
                  const exists = ev && !replace && existingEvNames.has(ev);
                  const badName = !ev;
                  const badge = (txt, title, fg, bg) => <span title={title} style={{ fontSize: 10.5, fontWeight: 700, color: fg, background: bg, padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>{txt}</span>;
                  return (
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: i ? `1px solid ${T.border}` : 'none', opacity: badName ? 0.6 : 1 }}>
                      <span style={{ fontSize: 11, color: T.t500, fontFamily: 'var(--font-mono)', width: 22, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: badName ? T.t500 : '#0F0F14', fontStyle: badName ? 'italic' : 'normal', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev || f.name}</span>
                      {badName && badge('no name', 'Filename has no usable event name — will be skipped', '#B91C1C', '#FEE2E2')}
                      {exists && badge('exists', `Already in ${cat} — uploading adds a duplicate unless you replace`, '#B45309', '#FEF3C7')}
                      {dup && badge('dup', 'Duplicate name within this batch', '#B45309', '#FEF3C7')}
                      {!busy && (
                        <button onClick={() => setFiles(prev => prev.filter(x => x.name !== f.name))} title="Remove"
                          style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'transparent', color: T.t500, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {dupInBatch.size > 0 && (
                <div style={{ fontSize: 11.5, color: '#B45309', marginTop: 8 }}>⚠ {dupInBatch.size} duplicate event name{dupInBatch.size === 1 ? '' : 's'} in this batch — each still uploads as its own screen.</div>
              )}
              {collideCount > 0 && (
                <div style={{ fontSize: 11.5, color: '#B45309', marginTop: 8 }}>⚠ {collideCount} event{collideCount === 1 ? '' : 's'} already {collideCount === 1 ? 'exists' : 'exist'} in <strong>{cat}</strong> — uploading adds duplicates. Tick “Replace” to overwrite instead.</div>
              )}
              {badNameCount > 0 && (
                <div style={{ fontSize: 11.5, color: '#B91C1C', marginTop: 8 }}>⚠ {badNameCount} file{badNameCount === 1 ? ' has' : 's have'} no usable event name — {badNameCount === 1 ? "it'll" : "they'll"} be skipped.</div>
              )}

              {dupCount > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: T.t700, marginTop: 14, cursor: busy ? 'default' : 'pointer' }}>
                  <input type="checkbox" checked={replace} disabled={busy} onChange={e => setReplace(e.target.checked)} />
                  Replace the {dupCount} existing <strong>&nbsp;{cat}&nbsp;</strong> record{dupCount === 1 ? '' : 's'} first
                </label>
              )}

              {busy && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 6, borderRadius: 99, background: '#EDE7F7', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, background: T.grad || '#7C3AED', transition: 'width .2s' }} />
                  </div>
                  <div style={{ fontSize: 12, color: T.t500, marginTop: 7, textAlign: 'center' }}>Uploading {progress.done} / {progress.total}…</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: `1px solid ${T.border}`, background: '#FCFBFE' }}>
          {phase === 'done' ? (
            <>
              <button onClick={() => { setFiles([]); setReplace(false); setPhase('pick'); }}
                style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.t700, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upload more</button>
              <button onClick={() => { onUploaded(result.ok, result.fail.length); onClose(); }}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: T.grad || '#7C3AED', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Done</button>
            </>
          ) : (
            <>
              {!busy && <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.t500, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>}
              <button onClick={doUpload} disabled={!canUpload}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: canUpload ? (T.grad || '#7C3AED') : '#E5E7EB', color: canUpload ? '#fff' : T.t500, fontSize: 13, fontWeight: 700, cursor: canUpload ? 'pointer' : 'not-allowed' }}>
                {busy ? 'Uploading…' : `Upload ${uploadable.length || ''}`.trim()}
              </button>
            </>
          )}
        </div>
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
  // Sign out: clear the session cookie, then bounce to /login.
  const handleLogout = () => {
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
      .then(() => { window.location.href = '/login'; })
      .catch(() => { window.location.href = '/login'; });
  };

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
  const [scoutCanvasLoading, setScoutCanvasLoading] = useState(false); // spinner while the canvas screenshot loads
  const scoutPrefetchedRef = useRef(new Set());                        // R2 urls already warmed (hover prefetch)
  const [scoutLastSearchQuery, setScoutLastSearchQuery] = useState('');
  const [scoutDisplayedImage, setScoutDisplayedImage] = useState(null);
  const [scoutPlatformFilter, setScoutPlatformFilter] = useState('all');
  const [scoutAllResults, setScoutAllResults]         = useState([]);
  const [scoutPage, setScoutPage]                     = useState(1);
  const [scoutToast, setScoutToast]                   = useState(null);
  const [scoutHoveredId, setScoutHoveredId]           = useState(null);
  // Scout self-serve upload (folder of PNGs → screens, filename = event_name) — modal
  const [scoutUploadOpen, setScoutUploadOpen]         = useState(false);

  const runScoutSearch = (q) => {
    const raw = q.trim();
    setScoutLastSearchQuery(raw);
    setScoutSearched(true);

    // Normalized, word-order-independent matching. Lowercase both sides and strip all
    // spaces/hyphens/underscores, then require EVERY query word to appear (as a substring)
    // in the screen name OR in a single event name. So "get started", "get_started" and
    // "started get" all match get_started_clicked, and "sign up" matches
    // genie_sign_up_and_chat — regardless of separators or word order.
    const words = raw.toLowerCase().split(/[\s\-_]+/).filter(Boolean);
    const norm  = s => (s || '').toLowerCase().replace(/[\s\-_]+/g, '');
    const matches = r => {
      if (!words.length) return true;
      if (words.every(w => norm(r.screenName).includes(w))) return true;
      return (r.events || []).some(ev => {
        const t = norm(ev.event_name);
        return words.every(w => t.includes(w));
      });
    };

    // Fallback: fetch the full list if the mount preload hasn't landed yet, then filter
    // client-side (same normalized matching as the in-memory path — no server-side ILIKE,
    // which couldn't do separator/word-order normalization anyway).
    if (!scoutAllResults.length) {
      setScoutLoading(true);
      fetch(`/api/screens`)
        .then(r => r.json())
        .then(data => {
          const all = (data.screens || []).map(s => ({ ...s, image: s.imageUrl || s.image || null }));
          setScoutAllResults(all);
          const filtered = words.length ? all.filter(matches) : all;
          setScoutResults(filtered);
          setScoutSelected(filtered[0] || null);
          setScoutActiveEvent(filtered[0]?.events?.[0] || null);
        })
        .catch(err => { console.error('Scout search failed:', err); setScoutResults([]); })
        .finally(() => setScoutLoading(false));
      return;
    }

    // In-memory filter — instant, no network
    const filtered = words.length ? scoutAllResults.filter(matches) : scoutAllResults;
    setScoutResults(filtered);
    setScoutSelected(filtered[0] || null);
    setScoutActiveEvent(filtered[0]?.events?.[0] || null);
  };

  // Deselect the current event/screen — used by clicking an already-selected row (toggle
  // off) and by the explicit "clear selection" (X) button. Clears the canvas too.
  const reloadScoutList = async () => {
    const data = await fetch('/api/screens').then(r => r.json());
    const results = data.screens || [];
    setScoutAllResults(results);
    setScoutResults(results);
  };

  const clearScoutSelection = () => {
    setScoutSelected(null);
    setScoutActiveEvent(null);
    setScoutDisplayedImage('');
  };

  // Mount: load full list into scoutAllResults, then preload all images in background
  useEffect(() => {
    const preload = async () => {
      try {
        const data = await fetch('/api/screens').then(r => r.json());
        // image_url is a CDN link included in the list — use it directly as the image
        // source. The browser loads each screenshot straight from R2 (no per-image API
        // call, no base64 through Neon). `image` holds a URL now instead of a data URL.
        const results = (data.screens || []).map(s => ({ ...s, image: s.imageUrl || s.image || null }));
        setScoutAllResults(results);
        setScoutResults(results);
        setScoutSelected(results[0] || null);
        setScoutActiveEvent(results[0]?.events?.[0] || null);
        setScoutSearched(true);
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

  // Reset to page 1 when filter or search results change
  useEffect(() => { setScoutPage(1); }, [scoutPlatformFilter]);
  useEffect(() => { setScoutPage(1); }, [scoutResults]);

  const scoutImgRef = useRef(null);

  // Lazy-load image on click only if not already preloaded
  useEffect(() => {
    if (!scoutSelected?.id) return;
    if (scoutSelected.image) return;
    setScoutImgLoading(true);
    fetch(`/api/screens?id=${encodeURIComponent(scoutSelected.id)}`)
      .then(r => r.json())
      .then(data => {
        const img = data.screen?.imageUrl || data.screen?.image;
        if (img) {
          setScoutResults(prev => prev.map(s => s.id === data.screen.id ? { ...s, image: img } : s));
          setScoutSelected(prev => prev?.id === data.screen.id ? { ...prev, image: img } : prev);
        }
      })
      .catch(console.error)
      .finally(() => setScoutImgLoading(false));
  }, [scoutSelected?.id]);

  // Keep displayed image stable — shows previous image while new one loads (no flash)
  useEffect(() => {
    if (scoutSelected?.image) setScoutDisplayedImage(scoutSelected.image);
  }, [scoutSelected?.image]);

  // Show the canvas loading spinner while a newly-selected screenshot downloads. If the
  // image is already in the browser cache (e.g. hover-prefetched or previously viewed),
  // the <img> is `complete` immediately, so skip the spinner to avoid a needless flash.
  useEffect(() => {
    if (!scoutSelected?.image) { setScoutCanvasLoading(false); return; }
    const img = scoutImgRef.current;
    const cached = img && img.src === scoutSelected.image && img.complete && img.naturalWidth > 0;
    setScoutCanvasLoading(!cached);
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
  const [analyzeStep, setAnalyzeStep]      = useState(null); // null | 'identifying' | 'matching' | 'generating'
  const [processing, setProcessing]        = useState(false);
  const [error, setError]                  = useState('');
  const [eventsPlatform, setEventsPlatform] = useState(null); // which platform the current events table came from
  const [lastUsage, setLastUsage]          = useState(null); // token usage + cost ($) of the last generate
  const [totalUsage, setTotalUsage]        = useState(() => { // cumulative usage across all generates (persisted)
    try { return JSON.parse(localStorage.getItem('edvoy_total_usage')) || { input_tokens: 0, output_tokens: 0, cost_usd: 0, generations: 0 }; }
    catch { return { input_tokens: 0, output_tokens: 0, cost_usd: 0, generations: 0 }; }
  });

  // Load the cumulative usage from the DB (server-side source of truth, survives a cache
  // clear / works across devices). localStorage is now just an offline cache/fallback.
  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => {
        if (d?.usage) {
          setTotalUsage(d.usage);
          try { localStorage.setItem('edvoy_total_usage', JSON.stringify(d.usage)); } catch {}
        }
      })
      .catch(() => {}); // offline / no DB → keep the localStorage value
  }, []);

  // Interactions
  const [copiedState, setCopiedState]      = useState(''); // '', 'tsv', 'csv', 'json'
  const [exportError, setExportError]      = useState('');
  const [dragging, setDragging]            = useState(false);
  const [history, setHistory]              = useState([]);
  const [historyPage, setHistoryPage]      = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [converterInput, setConverterInput]       = useState('');
  const [converterCopied, setConverterCopied]     = useState(false);

  // Which Edvoy space is active — scopes sheet config + history below
  const [space, setSpace] = useState(() => {
    try { return localStorage.getItem('edvoy_space') || 'edvoy-student'; }
    catch { return 'edvoy-student'; }
  });

  // Google Sheets sync — per space, per platform: { [space]: { ga4: {url,data}, amplitude: {url,data} } }
  const [sheetConfig, setSheetConfig]         = useState(() => {
    try {
      let cfg = JSON.parse(localStorage.getItem('edvoy_sheet_config') || '{}');
      // migrate old single-sheet format
      const oldData = JSON.parse(localStorage.getItem('edvoy_sheet_data') || 'null');
      const oldUrl  = localStorage.getItem('edvoy_sheet_url') || '';
      if (oldUrl && oldData && !cfg.ga4) cfg.ga4 = { url: oldUrl, data: oldData };
      // migrate pre-multi-space flat shape ({ga4,amplitude}) into the Student bucket
      if (cfg.ga4 || cfg.amplitude) cfg = { 'edvoy-student': cfg };
      return cfg;
    } catch { return {}; }
  });
  const [sheetSyncingFor, setSheetSyncingFor] = useState(null); // null | 'ga4' | 'amplitude'
  const [sheetInputFor, setSheetInputFor]     = useState(null); // null | 'ga4' | 'amplitude'
  const [sheetUrlDrafts, setSheetUrlDrafts]   = useState({ ga4: '', amplitude: '' });
  const [sheetSyncError, setSheetSyncError]   = useState(null); // { key, message } | null

  // History thumbnails stored in localStorage only (not in DB)
  const [historyThumbs, setHistoryThumbs]     = useState(() => { try { return JSON.parse(localStorage.getItem('edvoy_history_thumbs') || '{}'); } catch { return {}; } });

  // Attachment preview lightbox — holds { items: [...], index } (null = closed)
  const [preview, setPreview] = useState(null);

  const fileRef                            = useRef();
  const resultsRef                         = useRef();
  const copiedTimeoutRef                   = useRef(null);
  const analyzeAbortRef                    = useRef(null);
  const dropZoneRef                        = useRef(null);

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
          let cfg = data.settings?.sheet_config;
          if (cfg) {
            // migrate pre-multi-space flat shape ({ga4,amplitude}) into the Student bucket
            if (cfg.ga4 || cfg.amplitude) cfg = { 'edvoy-student': cfg };
            setSheetConfig(cfg);
            try { localStorage.setItem('edvoy_sheet_config', JSON.stringify(cfg)); } catch {}
          }
        }
      } catch (e) {
        console.warn('Could not load sheet config from DB:', e);
      }
    };
    loadInit();
  }, []);

  // One-time self-healing migration: history items created before R2-backed
  // thumbnails existed only have their preview cached in this browser's
  // localStorage. If we find one, back it up to R2 so it survives across
  // devices too. Skips anything that already has a DB thumbnail.
  const thumbMigrationRanRef = useRef(false);
  useEffect(() => {
    if (thumbMigrationRanRef.current) return;
    if (!history.length) return;
    const candidates = history.filter(h => !h.thumbnailUrl && historyThumbs[h.id]);
    if (!candidates.length) return;
    thumbMigrationRanRef.current = true;
    (async () => {
      for (const item of candidates) {
        try {
          const res = await fetch('/api/history', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, thumbnail: historyThumbs[item.id] }),
          });
          const data = await res.json();
          if (data.thumbnailUrl) {
            setHistory(prev => prev.map(h => h.id === item.id ? { ...h, thumbnailUrl: data.thumbnailUrl } : h));
          }
        } catch (e) {
          console.warn('Thumbnail migration failed for', item.id, e);
        }
      }
    })();
  }, [history, historyThumbs]);

  const setActiveSpace = (next) => {
    setSpace(next);
    try { localStorage.setItem('edvoy_space', next); } catch {}
    // Close any open sheet-edit box — otherwise a draft URL typed for the old
    // space stays visible and could get synced into the new space by mistake.
    setSheetInputFor(null);
    setSheetUrlDrafts({ ga4: '', amplitude: '' });
    setSheetSyncError(null);
  };

  // Keep history page in bounds when items are deleted
  useEffect(() => {
    const count = history.filter(h => (h.space || 'edvoy-student') === space).length;
    const totalPages = Math.ceil(count / 5);
    if (historyPage > 1 && historyPage > totalPages) {
      setHistoryPage(totalPages || 1);
    }
  }, [history, space, historyPage]);

  // Sync History to localStorage + DB
  const saveHistory = async (updated, newItem = null, thumbnail = null) => {
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
          body: JSON.stringify({ item: newItem, thumbnail }),
        });
      } catch (e) {
        console.error('Failed to save history item to DB', e);
      }
    }
  };

  const syncSheet = async (p, url) => {
    const cleanUrl = (url || sheetConfig[space]?.[p]?.url || '').trim();
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
        const next = { ...prev, [space]: { ...(prev[space] || {}), [p]: { url: cleanUrl, data } } };
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
        const frames = await extractVideoFrames(file);
        // Keep the original video (cheap in-memory blob URL, session-only) so the preview
        // lightbox can actually play it. Frames are still extracted for the AI pipeline.
        const videoUrl = URL.createObjectURL(file);
        return { id, type: 'video', name: file.name, frames, thumb: frames[0] || null, frameCount: frames.length, videoUrl };
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

  // Paste-to-upload: Cmd/Ctrl+V an image straight from the clipboard (e.g. an iPhone
  // screenshot copied onto the Mac) without having to save the file first. Only acts on
  // the generator tab and ignores non-image pastes, so text paste (e.g. into the feature
  // context box) is untouched.
  useEffect(() => {
    const onPaste = e => {
      if (activeTab !== 'generator' || loading || processing) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = [];
      for (const it of items) {
        if (it.kind === 'file' && it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        addFiles(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles, activeTab, loading, processing]);

  // Keep a focused paste target ready on the generator tab so ⌘V works the moment you
  // switch to the page — without first clicking empty space to give the document focus.
  useEffect(() => {
    if (activeTab === 'generator') {
      dropZoneRef.current?.focus({ preventScroll: true });
    }
  }, [activeTab]);

  // Platform toggle follows the connected sheets for the active Space. If exactly one
  // platform has a synced sheet and the *other* one is currently selected, switch to the
  // connected one. Both-connected or none-connected leaves the selection untouched.
  // Depends only on [space, sheetConfig] on purpose — it must fire on space-switch /
  // connect / disconnect, but NOT on a history restore (which sets `platform` directly),
  // so restoring a spec for an unconnected platform isn't clobbered.
  useEffect(() => {
    if (loading || processing) return; // respect the mid-generate lock
    const g = !!sheetConfig[space]?.ga4?.data;
    const a = !!sheetConfig[space]?.amplitude?.data;
    if (g && !a && platform !== 'ga4') setPlatform('ga4');
    else if (a && !g && platform !== 'amplitude') setPlatform('amplitude');
  }, [space, sheetConfig]);

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

    setLoading(true); setAnalyzeStep('identifying'); setError(''); setEvents([]);

    const images = attachments.flatMap(a =>
      a.type === 'image' ? [a.dataUrl] : (a.frames || [])
    );

    // If the user already generated events for the OTHER platform this session,
    // pass those as sessionEvents so the matcher can reuse their names.
    const otherPlatform = platform === 'ga4' ? 'amplitude' : 'ga4';
    const sessionEvents = (eventsPlatform === otherPlatform && events.length > 0)
      ? {
          eventNames: [...new Set(events.map(e => e.suggested_event_name).filter(Boolean))],
          parameters: [...new Set(events.map(e => e.parameter).filter(Boolean))],
        }
      : null;

    const stepT1 = setTimeout(() => setAnalyzeStep('matching'), 5000);
    const stepT2 = setTimeout(() => setAnalyzeStep('generating'), 10000);

    try {
      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images, platform, featureContext,
          sheetData: sheetConfig[space]?.[platform]?.data || null,
          crossData: platform === 'amplitude' ? (sheetConfig[space]?.ga4?.data || null) : (sheetConfig[space]?.amplitude?.data || null),
          sessionEvents,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      
      clearTimeout(stepT1); clearTimeout(stepT2);
      const newEvents = (data.events || []).map(ev => ({
        ...ev,
        _rowId: Math.random().toString(36).slice(2)
      }));
      setEvents(newEvents);
      setEventsPlatform(platform);
      setLastUsage(data.usage || null);
      if (data.usage) {
        setTotalUsage(prev => {
          const next = {
            input_tokens:  prev.input_tokens  + (data.usage.input_tokens  || 0),
            output_tokens: prev.output_tokens + (data.usage.output_tokens || 0),
            cost_usd: Math.round((prev.cost_usd + (data.usage.cost_usd || 0)) * 10000) / 10000,
            generations:   prev.generations + 1,
          };
          try { localStorage.setItem('edvoy_total_usage', JSON.stringify(next)); } catch {}
          return next;
        });
        // Persist this generate's delta to the DB (atomic increment, server source of truth).
        fetch('/api/usage', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta: {
            input_tokens: data.usage.input_tokens || 0,
            output_tokens: data.usage.output_tokens || 0,
            cost_usd: data.usage.cost_usd || 0,
            generations: 1,
          } }),
        }).catch(() => {});
      }
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
          featureContext,
          space,
        };
        // Compressed thumbnail goes to R2 (via the history POST below) so it's shared
        // across devices; also cached locally for instant render before the next reload.
        const thumb = images[0] ? await generateThumbnail(images[0]) : null;
        saveHistory([newRecord, ...history], newRecord, thumb);
        if (thumb) {
          setHistoryThumbs(prev => {
            const next = { ...prev, [newRecord.id]: thumb };
            try { localStorage.setItem('edvoy_history_thumbs', JSON.stringify(next)); } catch {}
            return next;
          });
        }
      }

      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      clearTimeout(stepT1); clearTimeout(stepT2);
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      if (analyzeAbortRef.current === controller) {
        setLoading(false);
        setAnalyzeStep(null);
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

  // The Category / Event Name cells are visually merged across all parameter rows of one
  // event. Editing a merged cell must update every row in that group so they stay merged.
  const handleGroupFieldChange = (groupIndices, key, value) => {
    const next = [...events];
    groupIndices.forEach(i => { next[i] = { ...next[i], [key]: value }; });
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

  // For spreadsheet exports: blank the Category + Event Name on continuation rows of the
  // same event group so a paste into the tracking sheet matches the merged on-screen layout
  // (value on the first row of the group, empty beneath — like merged cells).
  const mergedExportRows = () => {
    let prevKey = null;
    return events.map(e => {
      const key = `${(e.category || '').trim()}|${(e.suggested_event_name || '').trim()}`;
      const firstOfGroup = key !== prevKey;
      prevKey = key;
      return {
        category: firstOfGroup ? (e.category ?? '') : '',
        suggested_event_name: firstOfGroup ? (e.suggested_event_name ?? '') : '',
        parameter: e.parameter ?? '',
        sample_value: e.sample_value ?? '',
      };
    });
  };

  const copyTsv = () => {
    if (hasValidationErrors()) { blockExportWithError(); return; }
    const cols = ['category', 'suggested_event_name', 'parameter', 'sample_value'];
    const header = cols.map(c => c.toUpperCase().replace(/_/g, ' ')).join('\t');
    const rows = mergedExportRows().map(e => cols.map(c => e[c] ?? '').join('\t'));
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    startCopyTimeout('tsv');
  };

  const downloadCsv = () => {
    if (hasValidationErrors()) { blockExportWithError(); return; }
    const cols = ['category', 'suggested_event_name', 'parameter', 'sample_value'];
    const header = cols.map(c => `"${c.toUpperCase().replace(/_/g, ' ')}"`).join(',');
    const rows = mergedExportRows().map(e => cols.map(c => `"${(e[c] ?? '').replace(/"/g, '""')}"`).join(','));
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
    const clean = events.map(({ _rowId, ...rest }) => rest);
    navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
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

    // Restore saved thumbnail if available (R2 URL preferred, legacy local cache as fallback)
    attachments.forEach(a => a.videoUrl && URL.revokeObjectURL(a.videoUrl)); // free any live video blobs first
    const thumb = item.thumbnailUrl || historyThumbs[item.id];
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
    const spaceLabel = SPACES.find(s => s.key === space)?.label || space;
    if (confirm(`Are you sure you want to clear ${spaceLabel}'s local and cloud specs history?`)) {
      saveHistory(history.filter(h => (h.space || 'edvoy-student') !== space));
      setHistoryPage(1);
      setHistoryThumbs({});
      try { localStorage.removeItem('edvoy_history_thumbs'); } catch {}
      try {
        await fetch('/api/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearAll: true, space }),
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
      attachments.forEach(a => a.videoUrl && URL.revokeObjectURL(a.videoUrl));
      setAttachments([]);
      setGeneratedAttachments([]);
      setFeatureContext('');
      setError('');
      setLoading(false);
    }
  };

  const visibleHistory = history.filter(h => (h.space || 'edvoy-student') === space);

  const isSameAttachments = events.length > 0 &&
    attachments.length > 0 &&
    platform === eventsPlatform &&
    featureContext === generatedContext &&
    attachments.length === generatedAttachments.length &&
    attachments.every((a, idx) => a.id === generatedAttachments[idx]?.id);

  // A platform is usable only when its tracking sheet is connected for the active Space.
  const ga4Connected = !!sheetConfig[space]?.ga4?.data;
  const ampConnected = !!sheetConfig[space]?.amplitude?.data;
  const platformConnected = platform === 'ga4' ? ga4Connected : ampConnected;
  // Generate is blocked (in addition to the existing checks) when the selected platform
  // has no connected sheet — otherwise disabling the toggle would be purely cosmetic.
  const genDisabled = loading || processing || isSameAttachments || attachments.length === 0 || !platformConnected;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      
      {/* Mobile Sidebar Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${mobileSidebarOpen ? 'active' : ''}`} 
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* ── Sidebar Navigation ── */}
      <aside
        className={`app-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}
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
            <span style={{ fontSize: 10, fontWeight: 600, color: T.t500, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Tracking Governance
            </span>
          </div>
        </div>

        {/* Space Switcher — scopes tracking sheets + specs history below */}
        <div style={{ padding: '14px 20px 0' }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: T.t400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            Space
          </label>
          <select
            value={space}
            onChange={e => setActiveSpace(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px',
              border: `1px solid ${T.border}`, borderRadius: 8,
              background: T.surface, color: T.t900,
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body, inherit)',
            }}
          >
            {SPACES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
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
            }}
          >
            <IconLayers color={activeTab === 'history' ? T.purple700 : T.t500} />
            Specs History ({visibleHistory.length})
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
            }}
          >
            <IconScout color={activeTab === 'scout' ? T.purple700 : T.t500} />
            Scout
          </button>
        </nav>

        {/* Cumulative API usage / cost card (Anthropic Sonnet 4.6, persisted across sessions) */}
        {(() => {
          const totalTok = totalUsage.input_tokens + totalUsage.output_tokens;
          const inPct = totalTok > 0 ? (totalUsage.input_tokens / totalTok) * 100 : 0;
          const costStr = totalUsage.cost_usd < 0.0001 && totalUsage.cost_usd > 0
            ? '<0.0001' : totalUsage.cost_usd.toFixed(4);
          return (
            <div style={{ padding: '0 12px 14px' }}>
              <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: 11, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', fontFamily: 'var(--font-display)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ padding: 5, background: T.purple50, color: T.purple700, borderRadius: 7, display: 'flex' }}>
                      {/* lucide "activity" */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: T.t700 }}>API Usage</h3>
                      <p style={{ margin: 0, fontSize: 9.5, color: T.t400 }}>Cumulative · Sonnet 4.6</p>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', background: T.surfaceAlt || '#F1F3F5', color: T.t600, fontSize: 9.5, fontWeight: 600, borderRadius: 6, whiteSpace: 'nowrap' }}>
                    {totalUsage.generations} {totalUsage.generations === 1 ? 'generate' : 'generates'}
                  </span>
                </div>
                {/* Cost */}
                <div style={{ marginBottom: 7 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, color: T.t900 || T.t700, letterSpacing: '-0.01em' }}>${costStr}</span>
                </div>
                {/* Token-split bar (purple = input share of total tokens) */}
                <div
                  title={`${totalTok.toLocaleString()} tokens · ${totalUsage.input_tokens.toLocaleString()} in / ${totalUsage.output_tokens.toLocaleString()} out`}
                  style={{ width: '100%', background: T.surfaceAlt || '#F1F3F5', height: 6, borderRadius: 99, overflow: 'hidden', cursor: 'help' }}>
                  <div style={{ background: T.purple, height: '100%', borderRadius: 99, width: `${inPct}%`, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                  <span style={{ fontSize: 9, color: T.t400, fontWeight: 500 }}>{totalTok.toLocaleString()} tokens</span>
                  {totalUsage.generations > 0 && (
                    <button
                      onClick={() => {
                        const fresh = { input_tokens: 0, output_tokens: 0, cost_usd: 0, generations: 0 };
                        setTotalUsage(fresh);
                        try { localStorage.setItem('edvoy_total_usage', JSON.stringify(fresh)); } catch {}
                        fetch('/api/usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reset: true }) }).catch(() => {});
                      }}
                      title="Reset cumulative usage counter"
                      style={{ background: 'none', border: 'none', color: T.t400, fontSize: 9, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = T.purple700; }}
                      onMouseLeave={e => { e.currentTarget.style.color = T.t400; }}
                    >Reset</button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tracking Sheet Sync — per platform */}
        <div style={{ padding: '0 12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.t400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2, fontFamily: 'var(--font-display)' }}>
            Tracking Sheets
          </div>
          {[
            {
              key: 'ga4', label: 'Google Analytics 4',
              logoBg: '#FFF4E0',
              logo: <IconGA4 size={16} />,
            },
            {
              key: 'amplitude', label: 'Amplitude',
              logoBg: '#E7F0FE',
              logo: <IconAmplitude size={16} />,
            },
          ].map(({ key, label, logo, logoBg }) => {
            const cfg     = sheetConfig[space]?.[key];
            const syncing = sheetSyncingFor === key;
            const open    = sheetInputFor === key;
            const draft   = sheetUrlDrafts[key] || '';
            return (
              <div key={key} style={{ marginBottom: 10 }}>
                {cfg?.data ? (
                  <TrackingSheetCard
                    label={label} logo={logo} logoBg={logoBg}
                    connected={true} syncing={syncing}
                    onEdit={() => { setSheetInputFor(open ? null : key); setSheetUrlDrafts(p => ({ ...p, [key]: cfg.url || '' })); }}
                    onResync={() => syncSheet(key)}
                  />
                ) : !open ? (
                  <button
                    onClick={() => setSheetInputFor(key)}
                    style={{
                      width: '100%', padding: '7px 10px',
                      border: `1px dashed ${T.border}`, borderRadius: 8,
                      background: 'none', color: T.t500,
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.purple200; e.currentTarget.style.color = T.purple700; }}
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
                        fontSize: 11,
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
                        }}
                      >{syncing ? 'Connecting…' : 'Connect & Sync'}</button>
                      <button
                        onClick={() => { setSheetInputFor(null); setSheetUrlDrafts(p => ({ ...p, [key]: '' })); }}
                        style={{ padding: '6px 10px', background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, color: T.t500, cursor: 'pointer' }}
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
                title="AI Agent Active: Connected to Anthropic Claude Sonnet 4.6"
              />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: T.t500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Product Workspace
            </span>
          </div>

          <button onClick={handleLogout} title="Sign out" aria-label="Sign out" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            border: '1px solid #E4E4EA', background: '#fff', color: '#6B7280',
            cursor: 'pointer', transition: 'color .12s, border-color .12s, background .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E11D48'; e.currentTarget.style.borderColor = '#FECDD3'; e.currentTarget.style.background = '#FFF1F2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E4E4EA'; e.currentTarget.style.background = '#fff'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      {/* ── Main Panel Container ── */}
      <main style={{ marginLeft: 260, flex: 1, minWidth: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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

          {activeTab === 'scout' ? (
            <button
              onClick={() => setScoutUploadOpen(true)}
              aria-label="Upload screens"
              title="Upload screens"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: T.grad || T.purple, color: '#fff', cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          ) : (
            <div style={{ width: 22 }} />
          )}
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
            {activeTab === 'scout' && (
              <button
                onClick={() => setScoutUploadOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: T.grad || T.purple, color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124,58,237,.24)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Upload screens
              </button>
            )}
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
                      onClick={() => { if (!loading && !processing && ga4Connected) handlePlatformChange('ga4'); }}
                      disabled={loading || processing || !ga4Connected}
                      title={(loading || processing) ? 'Locked while events are generating' : (!ga4Connected ? 'Connect a GA4 sheet to enable' : '')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: 'none', borderRadius: 6,
                        background: 'transparent',
                        color: platform === 'ga4' ? T.purple700 : T.t500,
                        fontSize: 12, fontWeight: 600,
                        cursor: (loading || processing || !ga4Connected) ? 'not-allowed' : 'pointer',
                        opacity: (!ga4Connected || ((loading || processing) && platform !== 'ga4')) ? 0.4 : 1,
                        transition: 'all 0.25s',
                        zIndex: 2,
                        position: 'relative',
                      }}
                    >
                      <IconGA4
                        size={13}
                        style={{ borderRadius: 2, filter: (platform === 'ga4' && ga4Connected) ? 'none' : 'grayscale(100%) opacity(0.6)' }}
                      />
                      <span className="desktop-only">Google Analytics 4</span>
                      <span className="mobile-only">GA4</span>
                    </button>
                    <button
                      onClick={() => { if (!loading && !processing && ampConnected) handlePlatformChange('amplitude'); }}
                      disabled={loading || processing || !ampConnected}
                      title={(loading || processing) ? 'Locked while events are generating' : (!ampConnected ? 'Connect an Amplitude sheet to enable' : '')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: 'none', borderRadius: 6,
                        background: 'transparent',
                        color: platform === 'amplitude' ? '#1E61F0' : T.t500,
                        fontSize: 12, fontWeight: 600,
                        cursor: (loading || processing || !ampConnected) ? 'not-allowed' : 'pointer',
                        opacity: (!ampConnected || ((loading || processing) && platform !== 'amplitude')) ? 0.4 : 1,
                        transition: 'all 0.25s',
                        zIndex: 2,
                        position: 'relative',
                      }}
                    >
                      <IconAmplitude
                        size={13}
                        style={{ borderRadius: 2, filter: (platform === 'amplitude' && ampConnected) ? 'none' : 'grayscale(100%) opacity(0.6)' }}
                      />
                      Amplitude
                    </button>
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
                    ref={dropZoneRef}
                    tabIndex={-1}
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
                      outline: 'none',
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
                            Drag &amp; drop, <span style={{ color: T.purple, textDecoration: 'underline' }}>browse files</span>, or paste <kbd style={{ fontFamily: T.fontMono || 'monospace', fontSize: 10, background: T.surfaceAlt || '#F1F3F5', border: `1px solid ${T.border}`, borderRadius: 4, padding: '1px 5px', color: T.t600 }}>⌘V</kbd>
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
                      {attachments.map((a, idx) => (
                        <AttachmentThumb
                          key={a.id} item={a}
                          onRemove={() => { if (a.videoUrl) URL.revokeObjectURL(a.videoUrl); setAttachments(p => p.filter(x => x.id !== a.id)); }}
                          onPreview={() => setPreview({ items: attachments, index: idx })}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate Spec Action */}
                <button
                  onClick={analyze}
                  disabled={genDisabled}
                  className="btn-active-shrink gradient-shine-btn"
                  style={{
                    padding: '12px 24px',
                    background: genDisabled ? T.border : T.grad,
                    color: genDisabled ? T.t400 : '#fff',
                    border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700,
                    cursor: genDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: genDisabled ? 'none' : '0 4px 14px rgba(156, 32, 215, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (!genDisabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { if (!genDisabled) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <div style={spinStyle}>
                      <IconSparkles size={16} color={T.t400} />
                    </div>
                  ) : (
                    <IconSparkles size={16} />
                  )}
                  {loading
                    ? (analyzeStep === 'identifying' ? 'Identifying interactions…'
                      : analyzeStep === 'matching'   ? 'Matching with sheets…'
                      : analyzeStep === 'generating' ? 'Generating spec…'
                      : 'Analyzing…')
                    : (isSameAttachments ? 'Spec Already Generated' : 'Generate Event Spec')}
                </button>

                {!platformConnected && !loading && !processing && (
                  <p style={{ fontSize: 11.5, color: T.t400, textAlign: 'center', marginTop: -4, lineHeight: 1.5 }}>
                    {ga4Connected || ampConnected
                      ? `Connect a ${platform === 'ga4' ? 'GA4' : 'Amplitude'} tracking sheet to generate for this platform.`
                      : 'Connect a tracking sheet (GA4 or Amplitude) to start generating.'}
                  </p>
                )}

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
                          {!loading && (
                            <span style={{
                              background: T.purple, color: '#fff',
                              padding: '2px 10px', borderRadius: 99,
                              fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
                            }}>
                              {events.length} rows
                            </span>
                          )}
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
                          {!loading && lastUsage && (
                            <span
                              title={`${lastUsage.input_tokens.toLocaleString()} input + ${lastUsage.output_tokens.toLocaleString()} output tokens across ${lastUsage.calls} API calls (Claude Sonnet 4.6)`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: T.surfaceAlt || '#F1F3F5',
                                border: `1px solid ${T.border}`,
                                padding: '2px 9px', borderRadius: 99,
                                fontSize: 11, fontWeight: 600, color: T.t600,
                                fontFamily: T.fontMono || 'monospace', cursor: 'help',
                              }}>
                              ${lastUsage.cost_usd < 0.0001 ? '<0.0001' : lastUsage.cost_usd.toFixed(4)}
                            </span>
                          )}
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
                            {(() => {
                              // Vertically merge Category + Event Name across consecutive
                              // rows of the same event so the table reads like the tracking
                              // spreadsheet (one event, its parameters stacked beneath it).
                              const meta = [];
                              let gi = 0;
                              while (gi < events.length) {
                                const gName = events[gi].suggested_event_name || '';
                                const gCat  = events[gi].category || '';
                                let gj = gi + 1;
                                while (gj < events.length
                                  && (events[gj].suggested_event_name || '') === gName
                                  && (events[gj].category || '') === gCat) gj++;
                                const indices = [];
                                for (let k = gi; k < gj; k++) indices.push(k);
                                for (let k = gi; k < gj; k++) meta[k] = { isFirst: k === gi, span: gj - gi, indices };
                                gi = gj;
                              }
                              return events.map((e, i) => {
                                const grp = meta[i];
                                return (
                              <tr
                                key={e._rowId || i}
                                className="row-enter-animated"
                                style={{
                                  background: T.surface,
                                  borderBottom: `1px solid ${T.borderSoft}`,
                                  transition: 'background 0.12s',
                                }}
                              >
                                {/* Category Dropdown — merged across the event's rows */}
                                {grp.isFirst && (
                                <td style={{ ...tdStyle, verticalAlign: 'middle', borderRight: `1px solid ${T.borderSoft}` }} rowSpan={grp.span}>
                                  <select
                                    value={e.category || ''}
                                    onChange={el => handleGroupFieldChange(grp.indices, 'category', el.target.value)}
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
                                )}

                                {/* Suggested Event Name — merged across the event's rows */}
                                {grp.isFirst && (
                                <td style={{ ...tdStyle, position: 'relative', verticalAlign: 'middle', borderRight: `1px solid ${T.borderSoft}` }} rowSpan={grp.span}>
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
                                          onChange={el => handleGroupFieldChange(grp.indices, 'suggested_event_name', el.target.value)}
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
                                )}

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
                                );
                              });
                            })()}
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
                {visibleHistory.length > 0 && (
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

              {visibleHistory.length === 0 ? (
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
                      const totalPages = Math.ceil(visibleHistory.length / itemsPerPage);
                      const currentPage = Math.min(historyPage, totalPages || 1);
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginatedHistory = visibleHistory.slice(startIndex, startIndex + itemsPerPage);
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
                            
                            <div style={{ fontSize: 11, color: T.t400, marginTop: 6, display: 'flex', flexWrap: 'wrap', rowGap: 2, gap: 12 }}>
                              <span style={{ whiteSpace: 'nowrap' }}>Rows: {item.eventsCount}</span>
                              <span style={{ whiteSpace: 'nowrap' }}>•</span>
                              <span style={{ whiteSpace: 'nowrap' }}>Generated: {formatTimestamp(item.timestamp)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {(item.thumbnailUrl || historyThumbs[item.id]) && (
                              <img
                                src={item.thumbnailUrl || historyThumbs[item.id]}
                                alt=""
                                title="Click to preview"
                                onClick={(e) => {
                                  e.stopPropagation(); // don't also load the spec into the generator
                                  const withImg = visibleHistory.filter(h => h.thumbnailUrl || historyThumbs[h.id]);
                                  const idx = withImg.findIndex(h => h.id === item.id);
                                  const imgList = withImg.map(h => ({ name: h.name, dataUrl: h.thumbnailUrl || historyThumbs[h.id], type: 'image', fromHistory: true }));
                                  setPreview({ items: imgList, index: Math.max(0, idx) });
                                }}
                                style={{ width: 60, height: 38, objectFit: 'cover', borderRadius: 6, border: `1px solid ${T.border}`, flexShrink: 0, display: 'block', cursor: 'zoom-in' }}
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
                    const totalPages = Math.ceil(visibleHistory.length / itemsPerPage);
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
                          }}
                          onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.borderColor = T.borderHover; }}
                          onMouseLeave={e => { if (currentPage !== 1) e.currentTarget.style.borderColor = T.border; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                          Previous
                        </button>
                        
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: T.t500 }}>
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
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.t500, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>Raw Inputs</span>
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
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.t500, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>snake_case outputs</span>
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
          {activeTab === 'scout' && (() => {

            // Scout is scoped to the active Space, same as sheet config + history
            const scoutSpaceResults = scoutResults.filter(r => (r.space || 'edvoy-student') === space);
            const ga4Count = scoutSpaceResults.filter(r => r.platform === 'ga4').length;
            const ampCount = scoutSpaceResults.filter(r => r.platform === 'amplitude').length;
            const filteredResults = scoutPlatformFilter === 'all'
              ? scoutSpaceResults
              : scoutSpaceResults.filter(r => r.platform === scoutPlatformFilter);

            // Group by screenName preserving search-relevance order
            const groups = [];
            const seenScreens = new Map();
            for (const r of filteredResults) {
              if (!seenScreens.has(r.screenName)) {
                const recs = [];
                seenScreens.set(r.screenName, recs);
                groups.push({ screenName: r.screenName, records: recs });
              }
              seenScreens.get(r.screenName).push(r);
            }

            const platTabs = [
              { val: 'all', label: 'All', count: ga4Count + ampCount },
              { val: 'ga4', label: 'GA4', count: ga4Count },
              { val: 'amplitude', label: 'AMP', count: ampCount },
            ];

            return (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={cardStyle}>
                <div style={cardLabel}>Search</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={scoutQuery}
                    onChange={(e) => { setScoutQuery(e.target.value); setScoutLastSearchQuery(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') runScoutSearch(scoutQuery); }}
                    placeholder="Search by event name (click_view_application) or screen name (Course Details)…"
                    style={{
                      flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 8,
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
                    }}
                  >
                    Search
                  </button>
                  {scoutQuery.trim() && (
                    <button
                      onClick={() => { setScoutQuery(''); runScoutSearch(''); clearScoutSelection(); }}
                      title="Clear search"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 8,
                        border: `1px solid ${T.border}`, background: '#fff',
                        color: T.t500, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        flexShrink: 0, transition: 'background .12s, color .12s, border-color .12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F0FF'; e.currentTarget.style.color = '#7C3AED'; e.currentTarget.style.borderColor = '#DDD3F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = T.t500; e.currentTarget.style.borderColor = T.border; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {scoutLoading && (
                <div style={{ ...cardStyle, textAlign: 'center', color: T.t500, fontSize: 13 }}>
                  Searching…
                </div>
              )}

              {!scoutLoading && scoutSearched && scoutSpaceResults.length === 0 && scoutLastSearchQuery !== null && (
                <div style={{ ...cardStyle, textAlign: 'center', color: T.t500, fontSize: 13 }}>
                  {scoutLastSearchQuery
                    ? <>
                        No matches for <strong>"{scoutLastSearchQuery}"</strong>.{' '}
                        <button
                          onClick={() => { setScoutQuery(''); runScoutSearch(''); }}
                          style={{ background: 'none', border: 'none', color: T.purple700, fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}
                        >Show all events</button>
                      </>
                    : 'Repository is empty. It builds up as screens are crawled and saved.'}
                </div>
              )}

              {!scoutLoading && scoutSpaceResults.length > 0 && (() => {
                // ── Inline SVG atoms ──────────────────────────────────
                const GA4Logo = ({ size = 13 }) => (
                  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <rect x="3.5" y="15" width="4" height="6" rx="1.6" fill="#F9AB00"/>
                    <rect x="10" y="10" width="4" height="11" rx="1.6" fill="#F9AB00"/>
                    <rect x="16.5" y="5" width="4" height="16" rx="1.6" fill="#F9AB00"/>
                  </svg>
                );
                const AMPLogo = ({ size = 13, opacity = 1 }) => (
                  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, opacity }}>
                    <circle cx="12" cy="12" r="11" fill="#1F6CE2"/>
                    <path d="M6 16 C 8 16 8.5 8 10 8 C 11.5 8 12 16 14 16 C 16 16 16.5 11 18 11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                );
                const CopyIcon = ({ size = 13 }) => (
                  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="8" y="8" width="12" height="13" rx="2.5"/>
                    <path d="M16 8 V5.5 A1.5 1.5 0 0 0 14.5 4 H5.5 A1.5 1.5 0 0 0 4 5.5 V14.5 A1.5 1.5 0 0 0 5.5 16 H8" strokeLinecap="round"/>
                  </svg>
                );
                const PhoneIcon = () => (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 19 H13"/>
                  </svg>
                );
                const MonitorIcon = () => (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21 H16"/><path d="M12 17 V21"/>
                  </svg>
                );

                // ── Pagination (dense pack, orphan-safe) ──────────────
                // Greedily fill each page up to PER_PAGE events, packing multiple categories per
                // page and letting a large category backfill leftover space (so pages don't sit
                // half-empty). A category may span pages, but the split is guarded so neither
                // side is left with fewer than MIN_CHUNK events — no single event ever gets
                // stranded away from its group (the original complaint).
                const PER_PAGE = 10;
                const MIN_CHUNK = 3;
                const pages = [];
                let curPage = [];
                let curCount = 0;
                const flushPage = () => { if (curPage.length) { pages.push(curPage); curPage = []; curCount = 0; } };
                for (const g of groups) {
                  let recs = g.records;
                  while (recs.length) {
                    let space = PER_PAGE - curCount;
                    if (space <= 0) { flushPage(); continue; }
                    if (recs.length <= space) {
                      // whole (remaining) group fits on this page
                      curPage.push({ screenName: g.screenName, records: recs });
                      curCount += recs.length;
                      recs = [];
                      if (curCount >= PER_PAGE) flushPage();
                    } else {
                      // must split across the page boundary — keep both sides ≥ MIN_CHUNK
                      let take = space;
                      if (recs.length - take < MIN_CHUNK) take = recs.length - MIN_CHUNK;
                      if (take < MIN_CHUNK) {
                        if (curCount > 0) { flushPage(); continue; } // start the group on a fresh page
                        take = Math.min(space, recs.length);         // fresh page, unavoidable
                      }
                      curPage.push({ screenName: g.screenName, records: recs.slice(0, take) });
                      curCount += take;
                      recs = recs.slice(take);
                      flushPage();
                    }
                  }
                }
                flushPage();

                const totalPages = Math.max(1, pages.length);
                const safePage = Math.min(scoutPage, totalPages);
                const pageGroups = pages[safePage - 1] || [];
                const pageEventCount = pageGroups.reduce((n, g) => n + g.records.length, 0);

                // Form factor from image dims
                const formFactor = scoutImgDims.h > 0 && scoutImgDims.w > 0 && scoutImgDims.h > scoutImgDims.w ? 'mobile' : 'desktop';

                // Copy to clipboard
                const copyEvent = (evName) => {
                  navigator.clipboard.writeText(evName).catch(() => {});
                  setScoutToast(evName);
                  setTimeout(() => setScoutToast(null), 2000);
                };

                // Pagination button pages to show: always first 3, ellipsis, last if >4 pages
                const pageButtons = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pageButtons.push(i);
                } else {
                  pageButtons.push(1, 2, 3, '…', totalPages);
                }

                // Group color for rail section headers (maps screenName → fg color)
                const GROUP_FG = {
                  'Header Menu': '#5B21B6', 'FAQs': '#9A3412', 'IELTS Page': '#1E40AF',
                };

                return (
                <section style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, boxShadow: '0 1px 0 rgba(15,15,20,.02), 0 16px 48px -24px rgba(15,15,20,.10)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                  {/* ── Workspace header ─────────────────────────────── */}
                  <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '14px 20px', background: 'linear-gradient(180deg,#FBFAFE 0%,#fff 100%)', borderBottom: '1px solid #ECECF0', flexWrap: 'wrap' }}>
                    {/* Left: screen identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9CA3AF' }}>Screen</span>
                      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.015em', color: '#0F0F14', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{scoutSelected?.screenName || '—'}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#0F0F14', padding: '3px 8px', border: '1px solid #ECECF0', background: '#fff', borderRadius: 6, whiteSpace: 'nowrap' }}>
                        {scoutSelected?.platform === 'amplitude' ? <><AMPLogo size={11} />Amplitude</> : <><GA4Logo size={11} />GA4</>}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#6B7280', padding: '3px 8px', border: '1px solid #ECECF0', background: '#fff', borderRadius: 6, whiteSpace: 'nowrap' }}>
                        {formFactor === 'mobile' ? <PhoneIcon /> : <MonitorIcon />}
                        {formFactor === 'mobile' ? 'Mobile' : 'Desktop'}
                      </span>
                    </div>
                    {/* Right: segmented source filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: 3, background: '#F6F5F9', borderRadius: 10, flexShrink: 0 }}>
                      {platTabs.map(({ val, label, count }) => {
                        const isActive = scoutPlatformFilter === val;
                        const isDisabled = count === 0 && val !== 'all';
                        return (
                          <button key={val}
                            onClick={() => !isDisabled && setScoutPlatformFilter(val)}
                            title={isDisabled ? 'No events yet' : undefined}
                            style={{
                              background: isActive ? '#7C3AED' : 'transparent',
                              color: isActive ? '#fff' : isDisabled ? '#9CA3AF' : '#22232A',
                              fontSize: 12, fontWeight: isActive ? 700 : 600,
                              padding: '6px 12px', borderRadius: 7, border: 'none',
                              cursor: isDisabled ? 'default' : 'pointer',
                              opacity: isDisabled ? 0.55 : 1,
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            {val === 'ga4' && <GA4Logo size={13} />}
                            {val === 'amplitude' && <AMPLogo size={13} opacity={isDisabled ? 0.55 : 1} />}
                            {label}
                            <span style={{ background: isActive ? 'rgba(255,255,255,.22)' : 'transparent', color: isActive ? '#fff' : '#6B7280', padding: '1px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </header>

                  {/* ── Workspace body ───────────────────────────────── */}
                  <div className="scout-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', alignItems: 'stretch' }}>

                    {/* LEFT: screen canvas */}
                    <div className="scout-canvas" style={{ background: 'radial-gradient(circle at 50% 0%, #F4EFFD 0%, #E9E2F5 100%)', padding: '32px 28px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid #ECECF0', position: 'relative', height: 720, maxHeight: 720, overflow: 'hidden' }}>
                      {/* Crosshair corners */}
                      {[['top:14px','left:14px','M3 8 V3 H8'],['top:14px','right:14px','M21 8 V3 H16'],['bottom:14px','left:14px','M3 16 V21 H8'],['bottom:14px','right:14px','M21 16 V21 H16']].map(([v,h,d],i) => (
                        <svg key={i} style={{ position:'absolute', ...Object.fromEntries([v,h].map(s => s.split(':'))), color:'#7C3AED', opacity:.25 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                          <path d={d}/>
                        </svg>
                      ))}
                      {/* Screenshot — auto-fit */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', height: '100%', maxHeight: '100%' }}>
                        {!scoutDisplayedImage && scoutImgLoading && (
                          <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: 13 }}>Loading screenshot…</div>
                        )}
                        {!scoutDisplayedImage && !scoutImgLoading && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#9488B5', fontSize: 13, textAlign: 'center', padding: 40 }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9 H21"/></svg>
                            No event selected — pick one from the list
                          </div>
                        )}
                        {scoutDisplayedImage && (
                          <img
                            src={scoutDisplayedImage}
                            alt={scoutSelected?.screenName}
                            ref={scoutImgRef}
                            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', borderRadius: 24, boxShadow: '0 28px 60px -10px rgba(50,30,90,.22), 0 2px 6px rgba(15,15,20,.06)', opacity: scoutCanvasLoading ? 0.35 : 1, filter: scoutCanvasLoading ? 'blur(1.5px)' : 'none', transition: 'opacity 0.25s, filter 0.25s' }}
                            onLoad={(e) => { setScoutImgDims({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 }); setScoutCanvasLoading(false); }}
                            onError={() => setScoutCanvasLoading(false)}
                          />
                        )}
                        {/* Loading state while the selected screenshot downloads. Dims the
                            lingering previous image, sweeps a shimmer across it, and shows a
                            branded gradient ring — on-brand with the Scout canvas. */}
                        {scoutDisplayedImage && scoutCanvasLoading && (
                          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            {/* shimmer sweep */}
                            <div style={{
                              position: 'absolute', top: 0, bottom: 0, width: '55%',
                              background: 'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                              animation: 'scoutShimmer 1.35s cubic-bezier(0.4,0,0.2,1) infinite',
                            }} />
                            {/* branded loader pill */}
                            <div style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                              padding: '18px 22px', borderRadius: 18,
                              background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                              boxShadow: '0 8px 30px -8px rgba(80,40,140,0.28), 0 0 0 1px rgba(124,58,237,0.08)',
                            }}>
                              {/* gradient conic ring */}
                              <div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, rgba(124,58,237,0) 0deg, #A855F7 140deg, #7C3AED 320deg)',
                                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                                animation: 'spin 0.85s cubic-bezier(0.5,0.1,0.5,0.9) infinite',
                              }} />
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.01em', color: '#6D28D9', animation: 'scoutPulse 1.4s ease-in-out infinite' }}>Loading Screenshot</span>
                            </div>
                          </div>
                        )}
                        {/* Red highlight box */}
                        {scoutSelected?.image && scoutActiveEvent?.bbox && scoutActiveEvent.bbox[2] > 0 && scoutImgDims.w > 0 && (
                          <div style={{
                            position: 'absolute',
                            left: `${(scoutActiveEvent.bbox[0] / scoutImgDims.w) * 100}%`,
                            top: `${(scoutActiveEvent.bbox[1] / scoutImgDims.h) * 100}%`,
                            width: `${(scoutActiveEvent.bbox[2] / scoutImgDims.w) * 100}%`,
                            height: `${(scoutActiveEvent.bbox[3] / scoutImgDims.h) * 100}%`,
                            border: '2px solid #E53935', borderRadius: 14,
                            pointerEvents: 'none', transition: 'all 0.2s ease',
                          }}/>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: event rail */}
                    <aside style={{ display: 'flex', flexDirection: 'column', background: '#fff', minHeight: 0, overflow: 'hidden' }}>
                      {/* Rail subheader */}
                      <div style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderBottom: '1px solid #E4E4EA', flexShrink: 0 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6B7280' }}>Events on screen</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#6B7280', background: '#F6F5F9', padding: '2px 8px', borderRadius: 5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{pageEventCount} of {filteredResults.length}</span>
                      </div>
                      {/* Scrollable grouped list */}
                      <div className="scout-rail-list" style={{ flex: 1, minHeight: 0, overflowY: 'auto', height: 668 }}>
                        {pageGroups.map(({ screenName, records }) => {
                          const fgColor = GROUP_FG[screenName] || CAT_COLOR[screenName]?.fg || '#374151';
                          return (
                            <div key={screenName}>
                              {/* Group header */}
                              <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: fgColor, whiteSpace: 'nowrap' }}>{screenName}</span>
                                <span style={{ flex: 1, height: 1, background: '#ECECF0' }}/>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{records.length}</span>
                              </div>
                              {/* Event rows */}
                              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 6 }}>
                                {records.map((s) => {
                                  const evName = s.events?.[0]?.event_name || s.screenName;
                                  const isActive = s.id === scoutSelected?.id;
                                  const isHovered = s.id === scoutHoveredId;
                                  const isGA4 = s.platform === 'ga4';
                                  return (
                                    <div key={s.id}
                                      onClick={() => {
                                        if (s.id === scoutSelected?.id) { clearScoutSelection(); }
                                        else { setScoutSelected(s); setScoutActiveEvent(s.events?.[0] || null); }
                                      }}
                                      onMouseEnter={() => {
                                        setScoutHoveredId(s.id);
                                        // Warm the screenshot in the browser cache before the click,
                                        // so selecting it feels instant. Deduped so we fetch once.
                                        if (s.image && !scoutPrefetchedRef.current.has(s.image)) {
                                          scoutPrefetchedRef.current.add(s.image);
                                          const im = new Image();
                                          im.src = s.image;
                                        }
                                      }}
                                      onMouseLeave={() => setScoutHoveredId(null)}
                                      onTouchStart={() => {}}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '9px 18px 9px 15px', cursor: 'pointer',
                                        borderLeft: `3px solid ${isActive ? '#7C3AED' : 'transparent'}`,
                                        background: isActive ? '#F5F0FF' : isHovered ? '#FAFAFC' : 'transparent',
                                        transition: 'background .15s, border-color .15s',
                                      }}
                                    >
                                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: isActive ? '#6D28D9' : '#22232A', fontWeight: isActive ? 700 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }} title={evName}>{evName}</span>
                                      {isGA4 ? <GA4Logo size={14} /> : <AMPLogo size={14} />}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); copyEvent(evName); }}
                                        title="Copy event name"
                                        style={{ opacity: isActive || isHovered ? 1 : 0, transition: 'opacity .15s, background .12s, color .12s', width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer', flexShrink: 0 }}
                                        onMouseEnter={e => { e.currentTarget.style.background='#F5F0FF'; e.currentTarget.style.color='#7C3AED'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6B7280'; }}
                                      ><CopyIcon size={13} /></button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </aside>
                  </div>

                  {/* ── Workspace footer ─────────────────────────────── */}
                  <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 20px', borderTop: '1px solid #ECECF0', background: 'linear-gradient(0deg,#FBFAFE 0%,#fff 100%)', flexWrap: 'wrap' }}>
                    {/* Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#6B7280' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
                        {scoutPlatformFilter !== 'amplitude' && <GA4Logo size={14} />}
                        {scoutPlatformFilter !== 'ga4' && <AMPLogo size={14} />}
                        <span style={{ color: '#0F0F14', fontWeight: 700 }}>{filteredResults.length}</span> events
                      </span>
                      <span style={{ width: 1, height: 14, background: '#ECECF0' }}/>
                      <span style={{ fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21 H16"/><path d="M12 18 V21"/></svg>
                        <span style={{ color: '#0F0F14', fontWeight: 700 }}>{groups.length}</span> screens
                      </span>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => setScoutPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: safePage === 1 ? '#9CA3AF' : '#6B7280', background: 'transparent', border: 'none', cursor: safePage === 1 ? 'default' : 'pointer', padding: '6px 10px', borderRadius: 7 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6 L9 12 L15 18"/></svg>Prev
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0 6px' }}>
                          {pageButtons.map((p, i) => p === '…'
                            ? <span key={i} style={{ color: '#9CA3AF', fontSize: 12, padding: '0 2px' }}>…</span>
                            : <button key={p} onClick={() => setScoutPage(p)}
                                style={{ width: 28, height: 28, borderRadius: 7, border: p === safePage ? 'none' : '1px solid #ECECF0', background: p === safePage ? '#7C3AED' : '#fff', color: p === safePage ? '#fff' : '#22232A', fontSize: 12, fontWeight: p === safePage ? 700 : 600, cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{p}</button>
                          )}
                        </div>
                        <button onClick={() => setScoutPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: safePage === totalPages ? '#9CA3AF' : '#6D28D9', background: 'transparent', border: 'none', cursor: safePage === totalPages ? 'default' : 'pointer', padding: '6px 10px', borderRadius: 7 }}>
                          Next<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 L15 12 L9 18"/></svg>
                        </button>
                      </div>
                    )}
                  </footer>

                  {/* ── Copy toast ───────────────────────────────────── */}
                  {scoutToast && (
                    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#0F0F14', color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '10px 18px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.18)', zIndex: 9999, pointerEvents: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>
                      Copied "{scoutToast}"
                    </div>
                  )}
                </section>
                );
              })()}

              {!scoutSearched && !scoutLoading && (
                <div style={{ ...cardStyle, textAlign: 'center', color: T.t500, fontSize: 13, padding: '40px 20px' }}>
                  Loading repository…
                </div>
              )}
            </div>
            );
          })()}

        </div>
      </main>

      {preview && preview.items[preview.index] && (
        <AttachmentPreviewModal
          items={preview.items}
          index={preview.index}
          onIndexChange={(i) => setPreview(p => ({ ...p, index: i }))}
          onClose={() => setPreview(null)}
        />
      )}

      {scoutUploadOpen && (
        <ScoutUploadModal
          space={space}
          spaceLabel={SPACES.find(s => s.key === space)?.label || space}
          records={scoutAllResults}
          onClose={() => setScoutUploadOpen(false)}
          onUploaded={async (ok, fail) => {
            await reloadScoutList();
            setScoutToast(`Added ${ok} screen${ok === 1 ? '' : 's'}${fail ? ` · ${fail} failed` : ''}`);
            setTimeout(() => setScoutToast(null), 3000);
          }}
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
