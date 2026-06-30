export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sheetUrl } = req.body || {};
  if (!sheetUrl || typeof sheetUrl !== 'string') {
    return res.status(400).json({ error: 'sheetUrl is required' });
  }

  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid Google Sheets URL. Paste the full URL from your browser.' });
  }
  const sheetId = match[1];

  const gidMatch = sheetUrl.match(/[?&#]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const response = await fetch(csvUrl, {
      headers: { 'User-Agent': 'Edvoy-Events-Agent/1.0' },
    });
    if (response.status === 403 || response.status === 401) {
      return res.status(403).json({
        error: 'Access denied. Share the sheet as "Anyone with the link can view" and try again.',
      });
    }
    if (!response.ok) {
      return res.status(502).json({
        error: `Google Sheets returned HTTP ${response.status}. Check the URL and sharing settings.`,
      });
    }

    const csv = await response.text();
    const rows = parseCSV(csv);

    if (rows.length < 2) {
      return res.status(200).json({ categories: [], eventNames: [], parameters: [], rowCount: 0 });
    }

    // Some sheets have a merged "section label" row above the real column headers
    // (e.g. "Events,,,,,Properties,,,"). Scan the first few rows and pick whichever
    // one actually matches our target columns, instead of always trusting row 0.
    const detectHeaders = (row) => {
      const headers = row.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const catIdx  = headers.findIndex(h => h.includes('categor'));
      // "Suggested event name" is the canonical/current name — always prefer it over
      // a decoy like "Old Event name", which also matches the generic event+name pattern.
      let nameIdx = headers.findIndex(h => h.includes('suggestedevent'));
      if (nameIdx < 0) {
        nameIdx = headers.findIndex(h => h.includes('eventname') || (h.includes('event') && h.includes('name')));
      }
      // Prefer a "...name" column (e.g. "Property Name") over a same-prefix decoy
      // column like "Property Type" — both contain "propert" but only one holds names.
      let paramIdx = headers.findIndex(h => (h.includes('param') || h.includes('propert') || h.includes('attribut')) && h.includes('name'));
      if (paramIdx < 0) {
        paramIdx = headers.findIndex(h => h.includes('param') || h.includes('propert') || h.includes('attribut'));
      }
      const score = (catIdx >= 0 ? 1 : 0) + (nameIdx >= 0 ? 1 : 0) + (paramIdx >= 0 ? 1 : 0);
      return { catIdx, nameIdx, paramIdx, score };
    };

    let headerRow = 0, best = detectHeaders(rows[0]);
    for (let i = 1; i < Math.min(5, rows.length); i++) {
      const candidate = detectHeaders(rows[i]);
      if (candidate.score > best.score) { best = candidate; headerRow = i; }
    }
    const { catIdx, nameIdx, paramIdx } = best;

    const categories = new Set();
    const eventNames = new Set();
    const parameters = new Set();
    // event_name → Set(parameter) so the generator can reuse an event's EXACT params
    // (e.g. jump_to_clicked → options_name) instead of guessing a synonym.
    const eventParamSets = {};
    let lastName = '';

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      const cat   = catIdx   >= 0 ? (row[catIdx]   || '').trim() : '';
      const name  = nameIdx  >= 0 ? (row[nameIdx]  || '').trim() : '';
      const param = paramIdx >= 0 ? (row[paramIdx] || '').trim() : '';
      if (cat)   categories.add(cat);
      if (name)  eventNames.add(name);
      if (param) parameters.add(param);

      // Spreadsheets leave the event-name cell blank on a param's continuation rows, so
      // carry the last seen name forward to attach trailing params to the right event.
      if (name) lastName = name;
      if (lastName && param) {
        (eventParamSets[lastName] ||= new Set()).add(param);
      }
    }

    const eventParams = Object.fromEntries(
      Object.entries(eventParamSets).map(([k, v]) => [k, [...v]])
    );

    return res.status(200).json({
      categories: [...categories],
      eventNames: [...eventNames],
      parameters: [...parameters],
      eventParams,
      rowCount: rows.length - headerRow - 1,
      gid,
    });
  } catch (err) {
    console.error('Sheets sync error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch sheet data' });
  }
}

function parseCSV(text) {
  // Quoted cells can contain embedded newlines (common in Sheets exports),
  // so we must scan the whole text char-by-char rather than split on '\n' first —
  // otherwise a multi-line cell gets sliced into bogus extra rows/columns.
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let cells = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '"') {
      if (inQuote && normalized[i + 1] === '"') { current += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      cells.push(current);
      current = '';
    } else if (ch === '\n' && !inQuote) {
      cells.push(current);
      current = '';
      if (cells.some(c => c.trim())) rows.push(cells);
      cells = [];
    } else {
      current += ch;
    }
  }
  cells.push(current);
  if (cells.some(c => c.trim())) rows.push(cells);

  return rows;
}
