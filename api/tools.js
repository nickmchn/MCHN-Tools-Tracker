const GH_REPO = 'nickmchn/MCHN-Tools-Tracker';
const GH_FILE = 'tools.json';
const GH_API  = `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`;

function ghHeaders() {
  return {
    'Authorization': `token ${process.env.GH_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const r = await fetch(GH_API, { headers: ghHeaders() });
      if (!r.ok) throw new Error('GET ' + r.status);
      const json = await r.json();
      const content = JSON.parse(Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf8'));
      return res.status(200).json({ sha: json.sha, tools: content.tools || [] });
    }

    if (req.method === 'PUT') {
      const { tools, sha } = req.body;
      const content = Buffer.from(JSON.stringify({ tools }, null, 2)).toString('base64');
      const body = { message: 'Tracker update', content, sha };
      const r = await fetch(GH_API, { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) });
      if (!r.ok) throw new Error('PUT ' + r.status);
      const json = await r.json();
      return res.status(200).json({ sha: json.content.sha });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
