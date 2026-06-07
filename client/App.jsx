import { useState, useCallback } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

const COLS = ['Category', 'Old Event Name', 'Suggested Event Name', 'Parameter', 'Sample Value'];

function toDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function copyTsv(events) {
  const header = COLS.map(c => c.toLowerCase().replace(/ /g, '_')).join('\t');
  const rows = events.map(e =>
    [e.category, e.old_event_name, e.suggested_event_name, e.parameter, e.sample_value].join('\t')
  );
  navigator.clipboard.writeText([header, ...rows].join('\n'));
}

function App() {
  const [platform, setPlatform] = useState('ga4');
  const [featureContext, setFeatureContext] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map(toDataUrl));
    setImages(prev => [...prev, ...dataUrls]);
    setPreviews(prev => [...prev, ...dataUrls]);
  }, []);

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const analyze = async () => {
    if (!images.length) { setError('Upload at least one screenshot.'); return; }
    setLoading(true);
    setError('');
    setEvents([]);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, platform, featureContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    copyTsv(events);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Edvoy Events Agent</h1>
        <p style={styles.sub}>Upload screenshots → get analytics events</p>
      </header>

      <main style={styles.main}>
        {/* Platform toggle */}
        <div style={styles.card}>
          <label style={styles.label}>Platform</label>
          <div style={styles.toggle}>
            {['ga4', 'amplitude'].map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                style={{ ...styles.toggleBtn, ...(platform === p ? styles.toggleActive : {}) }}
              >
                {p === 'ga4' ? 'Google Analytics 4' : 'Amplitude'}
              </button>
            ))}
          </div>
        </div>

        {/* Feature context */}
        <div style={styles.card}>
          <label style={styles.label}>Feature Context <span style={styles.optional}>(optional)</span></label>
          <textarea
            style={styles.textarea}
            placeholder="Describe what this screen does, e.g. 'University shortlist page — user can save/remove universities and compare them'"
            value={featureContext}
            onChange={e => setFeatureContext(e.target.value)}
            rows={3}
          />
        </div>

        {/* Upload */}
        <div style={styles.card}>
          <label style={styles.label}>Screenshots</label>
          <div
            style={styles.dropzone}
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input id="fileInput" type="file" accept="image/*" multiple hidden onChange={onDrop} />
            <span style={styles.dropText}>Drop screenshots here or click to browse</span>
          </div>
          {previews.length > 0 && (
            <div style={styles.previews}>
              {previews.map((src, i) => (
                <div key={i} style={styles.previewWrap}>
                  <img src={src} style={styles.previewImg} alt={`Screen ${i + 1}`} />
                  <button style={styles.removeBtn} onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analyze button */}
        <button style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} onClick={analyze} disabled={loading}>
          {loading ? 'Analyzing…' : 'Generate Events'}
        </button>

        {error && <div style={styles.error}>{error}</div>}

        {/* Results */}
        {events.length > 0 && (
          <div style={styles.card}>
            <div style={styles.resultsHeader}>
              <span style={styles.label}>{events.length} events generated</span>
              <button style={styles.copyBtn} onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy as TSV'}
              </button>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {COLS.map(c => <th key={c} style={styles.th}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {events.map((e, i) => (
                    <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}><span style={styles.badge}>{e.category}</span></td>
                      <td style={{ ...styles.td, ...styles.muted }}>{e.old_event_name || '—'}</td>
                      <td style={styles.td}><code style={styles.code}>{e.suggested_event_name}</code></td>
                      <td style={styles.td}><code style={styles.codeParam}>{e.parameter}</code></td>
                      <td style={{ ...styles.td, ...styles.muted }}>{e.sample_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  header: { textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 6 },
  sub: { color: '#94a3b8', fontSize: 15 },
  main: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#1e2130', borderRadius: 10, padding: 20, border: '1px solid #2d3148' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' },
  optional: { fontWeight: 400, textTransform: 'none', color: '#64748b' },
  toggle: { display: 'flex', gap: 8 },
  toggleBtn: { padding: '8px 20px', borderRadius: 6, border: '1px solid #2d3148', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s' },
  toggleActive: { background: '#6366f1', borderColor: '#6366f1', color: '#fff', fontWeight: 600 },
  textarea: { width: '100%', background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, color: '#e2e8f0', padding: '10px 12px', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' },
  dropzone: { border: '2px dashed #2d3148', borderRadius: 8, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' },
  dropText: { color: '#64748b', fontSize: 14 },
  previews: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  previewWrap: { position: 'relative' },
  previewImg: { width: 100, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid #2d3148' },
  removeBtn: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btn: { padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  error: { background: '#2d1b1b', border: '1px solid #7f1d1d', borderRadius: 8, padding: '12px 16px', color: '#fca5a5', fontSize: 14 },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  copyBtn: { padding: '6px 16px', background: '#22c55e', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', background: '#0f1117', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #2d3148' },
  td: { padding: '10px 12px', verticalAlign: 'top', borderBottom: '1px solid #1a1f35' },
  trEven: { background: 'transparent' },
  trOdd: { background: '#1a1f2e' },
  muted: { color: '#64748b' },
  badge: { background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  code: { background: '#0f2d1f', color: '#4ade80', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' },
  codeParam: { background: '#1f1a2e', color: '#c084fc', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' },
};

createRoot(document.getElementById('root')).render(<App />);
