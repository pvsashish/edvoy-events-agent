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
  'Course Page': { bg: '#F5F3FF', fg: '#6D28D9', dot: '#7C3AED' }
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

function AttachmentThumb({ item, onRemove }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }} className="fade-in attachment-thumb-hover">
      {item.type === 'video' ? (
        <div style={{
          width: 88, height: 58, borderRadius: 8,
          border: `1px solid ${T.border}`,
          overflow: 'hidden', position: 'relative', background: '#0F172A',
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
          style={{ width: 88, height: 58, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}`, display: 'block' }}
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

function SkeletonRows() {
  const widths = [
    [80, 140, 190, 110, 100],
    [95, 120, 170, 130, 80],
    [70, 150, 210, 140, 120],
    [85, 110, 160, 120, 95],
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
   Main App
───────────────────────────────────────── */
function App() {
  // Navigation
  const [activeTab, setActiveTab]          = useState('generator'); // 'generator' | 'history' | 'guidelines'

  // Generator State
  const [platform, setPlatform]            = useState('ga4');
  const [featureContext, setFeatureContext] = useState('');
  const [attachments, setAttachments]      = useState([]);
  const [generatedAttachments, setGeneratedAttachments] = useState([]);
  const [events, setEvents]                = useState([]);
  const [loading, setLoading]              = useState(false);
  const [processing, setProcessing]        = useState(false);
  const [error, setError]                  = useState('');
  
  // Interactions
  const [copiedState, setCopiedState]      = useState(''); // '', 'tsv', 'csv', 'json'
  const [dragging, setDragging]            = useState(false);
  const [history, setHistory]              = useState([]);
  const [historyPage, setHistoryPage]      = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [validatorInput, setValidatorInput]       = useState('');
  
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

  const handlePlatformChange = (newPlatform) => {
    console.log('Switching platform to:', newPlatform);
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
      console.log('Auto-converted events:', converted);
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
        body: JSON.stringify({ images, platform, featureContext }),
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

      // Automatically append to history
      if (newEvents.length > 0) {
        const newRecord = {
          id: Math.random().toString(36).slice(2),
          name: featureContext ? (featureContext.slice(0, 30) + (featureContext.length > 30 ? '...' : '')) : `Custom Event Spec`,
          timestamp: new Date().toLocaleString(),
          platform,
          eventsCount: newEvents.length,
          events: newEvents,
          featureContext
        };
        saveHistory([newRecord, ...history], newRecord);
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
    setEvents(next);
  };

  const addRow = () => {
    setEvents([
      ...events,
      { _rowId: Math.random().toString(36).slice(2), category: platform === 'ga4' ? 'Search' : 'Onboarding Screen', old_event_name: '', suggested_event_name: '', parameter: '', sample_value: '' }
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
  const copyTsv = () => {
    if (hasValidationErrors()) {
      alert('Some tracking rows have naming convention errors. Please correct the highlighted errors before exporting.');
      return;
    }
    const cols = ['category', 'old_event_name', 'suggested_event_name', 'parameter', 'sample_value'];
    const header = cols.map(c => c.toUpperCase().replace(/_/g, ' ')).join('\t');
    const rows = events.map(e => cols.map(c => e[c] ?? '').join('\t'));
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    startCopyTimeout('tsv');
  };

  const downloadCsv = () => {
    if (hasValidationErrors()) {
      alert('Some tracking rows have naming convention errors. Please correct the highlighted errors before exporting.');
      return;
    }
    const cols = ['category', 'old_event_name', 'suggested_event_name', 'parameter', 'sample_value'];
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
    if (hasValidationErrors()) {
      alert('Some tracking rows have naming convention errors. Please correct the highlighted errors before exporting.');
      return;
    }
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
    setAttachments([]);
    setGeneratedAttachments([]);
    setActiveTab('generator');
    setError('');
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    const next = history.filter(h => h.id !== id);
    saveHistory(next);
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
            Naming Guidelines
          </button>
        </nav>

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
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.t900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
              {activeTab === 'guidelines' && 'Tracking Naming Guidelines'}
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
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.25s',
                        zIndex: 2,
                        position: 'relative',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <img 
                        src="https://www.google.com/s2/favicons?domain=analytics.google.com&sz=32" 
                        style={{ width: 13, height: 13, borderRadius: 2, filter: platform === 'ga4' ? 'none' : 'grayscale(100%) opacity(0.6)' }} 
                        alt=""
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
                        color: platform === 'amplitude' ? T.purple700 : T.t500,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.25s',
                        zIndex: 2,
                        position: 'relative',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <img 
                        src="https://www.google.com/s2/favicons?domain=amplitude.com&sz=32" 
                        style={{ width: 13, height: 13, borderRadius: 2, filter: platform === 'amplitude' ? 'none' : 'grayscale(100%) opacity(0.6)' }} 
                        alt=""
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
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.01em',
                          }}>
                            {events.length} rows
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <img 
                              src={platform === 'ga4' 
                                ? "https://www.google.com/s2/favicons?domain=analytics.google.com&sz=32" 
                                : "https://www.google.com/s2/favicons?domain=amplitude.com&sz=32"
                              } 
                              style={{ width: 13, height: 13, borderRadius: 2 }} 
                              alt=""
                            />
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

                    {/* Editable Grid Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={thStyle({ w: 140 })}>Category</th>
                            <th style={thStyle({ w: 160 })}>Old Event Name</th>
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

                                {/* Old Event Name */}
                                <td style={tdStyle}>
                                  <input
                                    type="text"
                                    value={e.old_event_name || ''}
                                    onChange={el => handleCellChange(i, 'old_event_name', el.target.value)}
                                    style={cellInputStyle(true)}
                                    placeholder="N/A"
                                  />
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
                            background: '#FFF', color: T.t700, fontSize: 12, fontWeight: 700,
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
                  Review and load specifications previously generated on this device.
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
                              <img 
                                src={item.platform === 'ga4' 
                                  ? "https://www.google.com/s2/favicons?domain=analytics.google.com&sz=32" 
                                  : "https://www.google.com/s2/favicons?domain=amplitude.com&sz=32"
                                } 
                                style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0 }} 
                                alt=""
                              />
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 750, color: T.t900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                              <span>Generated: {item.timestamp}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
                        
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.t700, fontFamily: 'var(--font-display)' }}>
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

              {/* ── Inline Naming Validator ── */}
              {(() => {
                const trimmed = validatorInput.trim();
                const validErr = trimmed ? getValidationError(trimmed, 'event', platform, null) : null;
                const snaked = trimmed ? toSnakeCase(trimmed) : '';
                const isValid = !!(trimmed && !validErr);
                const showSuggestion = !!(trimmed && snaked && snaked !== trimmed);
                return (
                  <div style={cardStyle}>
                    <div style={cardLabel}>Inline Naming Validator</div>
                    <p style={{ fontSize: 12.5, color: T.t500, marginBottom: 14, lineHeight: 1.5 }}>
                      Test any event or parameter name against Edvoy naming conventions in real-time.
                    </p>
                    <input
                      type="text"
                      value={validatorInput}
                      onChange={e => setValidatorInput(e.target.value)}
                      placeholder="Type an event name, e.g. counsellor_booking_clicked"
                      style={{
                        width: '100%',
                        border: `1px solid ${trimmed ? (isValid ? T.green200 : T.red200) : T.border}`,
                        borderRadius: 8, color: T.t900, padding: '10px 14px',
                        fontSize: 13, outline: 'none', transition: 'all 0.15s',
                        background: trimmed ? (isValid ? T.green50 : T.red50) : T.bg,
                        boxShadow: trimmed ? (isValid ? '0 0 0 3px rgba(16,185,129,0.1)' : '0 0 0 3px rgba(220,38,38,0.08)') : 'none',
                        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                        marginBottom: trimmed ? 10 : 0,
                      }}
                    />
                    {trimmed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {isValid ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: T.green700, fontWeight: 600 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Valid — ready to use
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: T.red700, fontWeight: 600 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {validErr}
                          </div>
                        )}
                        {showSuggestion && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.t500 }}>
                            <span>Suggested fix:</span>
                            <button
                              onClick={() => setValidatorInput(snaked)}
                              style={{
                                background: T.purple50, border: `1px solid ${T.purple200}`, borderRadius: 5,
                                padding: '3px 10px', fontSize: 12, fontWeight: 700, color: T.purple700,
                                cursor: 'pointer', fontFamily: "'SF Mono', 'Fira Code', monospace",
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={el => el.currentTarget.style.background = T.purple100}
                              onMouseLeave={el => el.currentTarget.style.background = T.purple50}
                            >
                              {snaked}
                            </button>
                            <span style={{ fontSize: 11, color: T.t400 }}>(click to apply)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Guidelines Grid ── */}
              <div className="guidelines-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              
              {/* GA4 Guidelines */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}`, paddingBottom: 12, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', fontSize: 15, fontWeight: 800, color: T.t900 }}>Google Analytics 4 Convention</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h4 style={subSectionTitle}>Naming Structure</h4>
                    <p style={guidelineText}>
                      Use <code style={codeTextStyle}>snake_case</code> (all lowercase with underscores) for all event names and parameter/property names. Max character length is <strong>100</strong>.
                    </p>
                  </div>

                  <div>
                    <h4 style={subSectionTitle}>Interaction Patterns</h4>
                    <ul style={guidelineList}>
                      <li><strong>Screen Views</strong>: Specific screen names in snake_case (e.g. <code style={codeTextStyle}>thank_you_screen_viewed</code>, <code style={codeTextStyle}>chatbot_preferences_viewed</code>). Do NOT use generic <code style={codeTextStyle}>page_view</code>.</li>
                      <li><strong>Button Clicks</strong>: Action events in snake_case (e.g. <code style={codeTextStyle}>article_entry_pop_up_submit_clicked</code>, <code style={codeTextStyle}>submit_button_clicked</code>, <code style={codeTextStyle}>resend_otp</code>).</li>
                      <li><strong>Item Selections</strong>: Selection events (e.g. <code style={codeTextStyle}>subject_selected</code>, <code style={codeTextStyle}>country_selected</code>).</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={subSectionTitle}>Required Global Parameters</h4>
                    <p style={guidelineText}>
                      Every single generated GA4 event must include:
                    </p>
                    <ul style={guidelineList}>
                      <li><code style={codeTextStyle}>user_type</code> ("student" or "counsellor")</li>
                      <li><code style={codeTextStyle}>platform</code> ("web", "ios", "android")</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Amplitude Guidelines */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}`, paddingBottom: 12, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.purple }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', fontSize: 15, fontWeight: 800, color: T.t900 }}>Amplitude Taxonomy</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h4 style={subSectionTitle}>Naming Structure</h4>
                    <p style={guidelineText}>
                      Use <code style={codeTextStyle}>snake_case</code> (all lowercase with underscores) for all event names and property/parameter names.
                    </p>
                  </div>

                  <div>
                    <h4 style={subSectionTitle}>Interaction Patterns</h4>
                    <ul style={guidelineList}>
                      <li><strong>Screen Views</strong>: Specific screen names in snake_case (e.g. <code style={codeTextStyle}>welcome_screen</code>, <code style={codeTextStyle}>onboarding_screen</code>, <code style={codeTextStyle}>profile_step_viewed</code>, <code style={codeTextStyle}>preferences_viewed</code>).</li>
                      <li><strong>Button Clicks</strong>: Action events in snake_case (e.g. <code style={codeTextStyle}>get_started_clicked</code>, <code style={codeTextStyle}>continue_with_email</code>, <code style={codeTextStyle}>continue_clicked</code>).</li>
                      <li><strong>State Changes</strong>: Lifecycle events (e.g. <code style={codeTextStyle}>account_created</code>, <code style={codeTextStyle}>preferences_saved</code>).</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={subSectionTitle}>Required Global Properties</h4>
                    <p style={guidelineText}>
                      Every single generated Amplitude event must include:
                    </p>
                    <ul style={guidelineList}>
                      <li><code style={codeTextStyle}>user_type</code> ("student" or "counsellor")</li>
                      <li><code style={codeTextStyle}>platform</code> ("web", "ios", "android")</li>
                    </ul>
                  </div>
                </div>
              </div>

              </div>
            </div>
          )}

        </div>
      </main>
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
  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
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
  fontSize: 12.5, fontWeight: 700, color: T.t900,
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
  fontWeight: 700,
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
  fontFamily: isMonospace ? "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" : 'inherit',
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
  fontWeight: 700,
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
