// In-page stand-in for the claude.ai runtime (db, user, downloads, sample),
// strict enough to catch bad paths, undefined values and write races.
(function () {
  const cfg = Object.assign({
    runtime: true, writable: true, cacheFirst: true, serverDelay: 40, firstDelay: 5, useDelay: 20,
    latency: 0, userOn: true, sampleOn: true, downloadsOn: true, meId: 'u_owner', seed: null, sampleFail: null,
  }, window.__MOCK_CFG || {});
  const M = window.__mock = { store: new Map(), subs: new Set(), calls: [], downloads: [], samples: [], failNext: null, inflight: new Map(), overlaps: [] };
  if (!cfg.runtime) return;

  const SEG = /^[A-Za-z0-9_\-.~:@+]+$/;
  const segs = (p, kind) => {
    if (typeof p !== 'string' || !p) throw new TypeError('bad path: ' + p);
    const a = p.split('/');
    a.forEach((x) => { if (!SEG.test(x) || x === '.' || x === '..') throw new TypeError('bad segment "' + x + '" in ' + p); });
    if (kind === 'doc' && a.length % 2) throw new TypeError('document path needs an even segment count: ' + p);
    if (kind === 'col' && !(a.length % 2)) throw new TypeError('collection path needs an odd segment count: ' + p);
    return a;
  };
  const err = (code, message) => ({ code, message: message || code });
  const deepFreeze = (o) => { if (o && typeof o === 'object') { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const checkBody = (b, path) => {
    if (!b || typeof b !== 'object' || Array.isArray(b)) throw err('invalid_argument', 'body must be an object at ' + path);
    const walk = (v, where) => {
      if (v === undefined) throw err('invalid_argument', 'undefined value at ' + where);
      if (typeof v === 'number' && !isFinite(v)) throw err('invalid_argument', 'non-finite number at ' + where);
      if (typeof v === 'function') throw err('invalid_argument', 'function at ' + where);
      if (v && typeof v === 'object') {
        if (Object.getPrototypeOf(v) !== Object.prototype && !Array.isArray(v)) throw err('invalid_argument', 'non-plain object at ' + where);
        Object.keys(v).forEach((k) => walk(v[k], where + '.' + k));
      }
    };
    walk(b, path);
    if (JSON.stringify(b).length > 262144) throw err('invalid_argument', 'document too large at ' + path);
  };
  const tick = () => new Promise((r) => setTimeout(r, cfg.latency || 0));
  const docSnap = (path, fromCache) => {
    const d = M.store.get(path);
    return Object.freeze({ id: path.split('/').pop(), exists: !!d, data: () => d, metadata: Object.freeze({ fromCache: !!fromCache, hasPendingWrites: false }) });
  };
  const runQuery = (q) => {
    const n = q.path.split('/').length;
    let rows = [];
    M.store.forEach((data, path) => { if (path.split('/').length === n + 1 && path.indexOf(q.path + '/') === 0) rows.push({ path, data }); });
    q.filters.forEach(([f, op, v]) => {
      rows = rows.filter((r) => {
        const x = r.data[f];
        switch (op) {
          case '==': return x === v;
          case '!=': return x !== v;
          case '<': return x !== undefined && x < v;
          case '<=': return x !== undefined && x <= v;
          case '>': return x !== undefined && x > v;
          case '>=': return x !== undefined && x >= v;
          case 'in': return v.indexOf(x) >= 0;
          case 'not-in': return v.indexOf(x) < 0;
          case 'array-contains': return Array.isArray(x) && x.indexOf(v) >= 0;
          default: throw err('invalid_argument', 'unknown operator ' + op);
        }
      });
    });
    if (q.order) {
      const [f, dir] = q.order;
      rows.sort((a, b) => {
        const A = a.data[f], B = b.data[f];
        if (A === undefined && B === undefined) return 0;
        if (A === undefined) return 1;
        if (B === undefined) return -1;
        return (A < B ? -1 : A > B ? 1 : 0) * (dir === 'desc' ? -1 : 1);
      });
    } else rows.sort((a, b) => (a.path < b.path ? -1 : 1));
    if (q.lim) rows = rows.slice(0, q.lim);
    return rows;
  };
  const qSnap = (q, fromCache) => {
    const docs = runQuery(q).map((r) => docSnap(r.path, fromCache));
    return Object.freeze({ docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: Object.freeze({ fromCache: !!fromCache, hasPendingWrites: false }) });
  };
  const notify = () => { M.subs.forEach((s) => { try { s.deliver(false); } catch (e) { console.error('[mock] listener threw', e); } }); };
  const gate = (op, path) => {
    M.calls.push([op, path]);
    if (M.failNext && (!M.failNext.op || M.failNext.op === op)) {
      const f = M.failNext;
      M.failNext = f.times > 1 ? Object.assign({}, f, { times: f.times - 1 }) : null;
      throw err(f.code, 'mock failure');
    }
    if (op !== 'get' && !cfg.writable) throw err('invalid_argument', 'below the minimum level');
  };
  // Records overlapping writes to one document (the contract says: one at a time).
  const track = async (path, fn) => {
    if (M.inflight.get(path)) M.overlaps.push(path);
    M.inflight.set(path, true);
    try { return await fn(); } finally { M.inflight.delete(path); }
  };
  const query = (path, filters, order, lim) => {
    const q = { path, filters, order, lim };
    return {
      where: (f, op, v) => query(path, filters.concat([[f, op, v]]), order, lim),
      orderBy: (f, dir) => { if (order) throw err('invalid_argument', 'only one orderBy'); return query(path, filters, [f, dir || 'asc'], lim); },
      limit: (n) => { if (!(n >= 1 && n <= 1000)) throw err('invalid_argument', 'limit out of range'); return query(path, filters, order, n); },
      get: async () => { await tick(); gate('get', path); return qSnap(q, false); },
      onSnapshot: (next, error) => {
        let alive = true;
        const sub = { deliver: (fromCache) => { if (alive) next(qSnap(q, fromCache)); } };
        M.subs.add(sub);
        if (M.subs.size > 64 && error) setTimeout(() => error(err('resource_exhausted')), 0);
        setTimeout(() => {
          if (cfg.cacheFirst) { sub.deliver(true); setTimeout(() => sub.deliver(false), cfg.serverDelay); } else sub.deliver(false);
        }, cfg.firstDelay);
        return () => { alive = false; M.subs.delete(sub); };
      },
    };
  };
  const docRef = (path) => {
    segs(path, 'doc');
    return {
      id: path.split('/').pop(),
      path,
      get: async () => { await tick(); gate('get', path); return docSnap(path, false); },
      set: (data) => track(path, async () => { checkBody(data, path); await tick(); gate('set', path); M.store.set(path, deepFreeze(clone(data))); notify(); }),
      update: (data) => track(path, async () => {
        checkBody(data, path); await tick(); gate('update', path);
        const cur = M.store.get(path);
        if (!cur) throw err('invalid_argument', 'update needs an existing document: ' + path);
        const merge = (a, b) => { const o = clone(a); Object.keys(b).forEach((k) => { const v = b[k]; o[k] = v && typeof v === 'object' && !Array.isArray(v) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? merge(o[k], v) : clone(v); }); return o; };
        M.store.set(path, deepFreeze(merge(cur, data))); notify();
      }),
      delete: () => track(path, async () => { await tick(); gate('delete', path); M.store.delete(path); notify(); }),
      onSnapshot: (next) => {
        let alive = true;
        const sub = { deliver: () => { if (alive) next(docSnap(path, false)); } };
        M.subs.add(sub);
        setTimeout(() => sub.deliver(), cfg.firstDelay);
        return () => { alive = false; M.subs.delete(sub); };
      },
      collection: (sub) => colRef(path + '/' + sub),
    };
  };
  const colRef = (path) => {
    segs(path, 'col');
    return Object.assign({}, query(path, [], null, null), {
      path,
      doc: (id) => docRef(path + '/' + (id == null ? 'auto' + Math.random().toString(36).slice(2, 10) : id)),
      add: async (data) => { const r = docRef(path + '/auto' + Math.random().toString(36).slice(2, 10)); await r.set(data); return r; },
    });
  };
  const db = Object.freeze({ doc: (p) => docRef(p), collection: (p) => colRef(p) });
  if (cfg.seed) Object.keys(cfg.seed).forEach((p) => M.store.set(p, deepFreeze(clone(cfg.seed[p]))));

  const TEAM = [{ id: 'u_owner', name: 'Youssef Cherif' }, { id: 'u_sara', name: 'Sara Haddad' }, { id: 'u_tom', name: 'Tom Leclerc' }];
  const prof = (id) => {
    const p = TEAM.find((t) => t.id === id);
    return { id, name: p ? p.name : '', avatarUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', color: '#777777', email: null, isMe: id === cfg.meId, guest: false };
  };
  const owner = cfg.meId === 'u_owner';
  const user = Object.freeze({
    isOwner: async () => owner,
    canEdit: async () => owner,
    can: async (n) => (cfg.canNull ? null : n === 'data.write' ? cfg.writable : false),
    me: async () => Object.assign(prof(cfg.meId), { isOwner: owner, canEdit: owner }),
    id: async () => cfg.meId,
    profiles: async (ids) => { const o = {}; (Array.isArray(ids) ? ids : [ids]).forEach((id) => { o[id] = prof(id); }); return o; },
    name: async () => prof(cfg.meId).name,
    search: async (q) => TEAM.filter((t) => !q || t.name.toLowerCase().indexOf(String(q).toLowerCase()) >= 0).map((t) => prof(t.id)),
  });
  const downloads = Object.freeze({
    save: async ({ filename, data }) => {
      if (!/\.(csv|json|html|txt|md|pdf|png|svg|zip|xlsx|docx)$/i.test(filename)) throw err('rejected_extension');
      M.downloads.push({ filename, text: typeof data === 'string' ? data : null });
      return { status: 'saved' };
    },
  });
  const SUMMARY = 'Highlights\n• Website visits rose to 1,620, the best month so far.\n• Instagram grew by 240 followers.\n• Ads brought 70 bookings on the same budget.\n\nNext month\n• Launch the winter menu campaign.\n• Test a weekday lunch offer in ads.';
  const REPLY = 'Subject: Your new website and Instagram\n\nHello Camille,\n\nThank you for writing to us about Le Jardin. A website that is ready before you reopen, and an Instagram that brings people through the door, is exactly the work we do.\n\nCould we talk for 20 minutes? I can do [day, time] or [day, time].\n\nYoussef\nNorth Frame';
  const sample = function (input, opts) {
    const o = opts || {};
    M.samples.push({ kind: 'text', input: String(input).slice(0, 4000), hasCacheKey: Object.prototype.hasOwnProperty.call(o, 'cache'), cache: o.cache });
    return new Promise((resolve, reject) => {
      if (cfg.sampleFail) { setTimeout(() => reject({ code: cfg.sampleFail, message: 'mock' }), 40); return; }
      const text = /results summary/.test(String(input)) ? SUMMARY : REPLY;
      const parts = text.match(/[\s\S]{1,28}/g);
      let i = 0;
      const step = () => {
        if (o.signal && o.signal.aborted) { reject({ code: 'cancelled', message: 'aborted', text: i ? parts.slice(0, i).join('') : undefined }); return; }
        if (i < parts.length) { i += 1; if (o.onText) o.onText({ text: parts.slice(0, i).join(''), delta: parts[i - 1] }); setTimeout(step, 12); } else resolve({ text, truncated: false, modelTierApplied: o.modelTier || 'default' });
      };
      setTimeout(step, 80);
    });
  };
  sample.json = async (input, opts) => {
    M.samples.push({ kind: 'json', input: String(input).slice(0, 4000), opts: Object.keys(opts || {}) });
    await new Promise((r) => setTimeout(r, 80));
    if (cfg.sampleFail) throw { code: cfg.sampleFail, message: 'mock' };
    return cfg.jsonReply || { business: 'Le Jardin', type: 'Restaurant', contact: 'Camille Roux', email: 'camille@lejardin.example', phone: '', instagram: '@lejardin', city: 'Lyon', services: ['websites', 'social', 'tiktok'], valueMonthly: null, valueOneOff: 3000, nextStep: 'Book a discovery call', notes: 'Wants a new website before reopening in spring, and help with Instagram.' };
  };
  sample.limits = async () => ({ maxPromptBytes: 262144 });

  const caps = { db, user: cfg.userOn ? user : null, downloads: cfg.downloadsOn ? downloads : null, sample: cfg.sampleOn ? sample : null };
  window.claude = Object.freeze({ use: (name) => new Promise((res) => setTimeout(() => res(caps[name] || null), cfg.useDelay)) });
})();
