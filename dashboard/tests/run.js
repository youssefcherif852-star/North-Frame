// Scripted run over every view and flow. Prints PASS/FAIL lines and a summary.
const { chromium } = require('playwright');
const B = require('./bench');

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok: !!ok });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (!ok && detail !== undefined ? '  ::  ' + JSON.stringify(detail).slice(0, 700) : ''));
};
const step = async (name, fn) => {
  try { await fn(); } catch (e) { check(name + ' (threw)', false, String((e && e.message) || e).split('\n').slice(0, 6).join(' | ')); }
};
const only = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !only.length || only.indexOf(k) >= 0;
const logs = [];
const keepLog = (label, log) => logs.push([label, log]);

const dates = (page) => page.evaluate(() => {
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const t = new Date(); const tm = new Date(t); tm.setDate(t.getDate() + 1);
  const lmD = new Date(t.getFullYear(), t.getMonth() - 1, 1), m2D = new Date(t.getFullYear(), t.getMonth() - 2, 1);
  const mk = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1);
  const name = (d) => new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(d);
  return { today: ymd(t), tomorrow: ymd(tm), lm: mk(lmD), m2: mk(m2D), year: String(t.getFullYear()), lmName: name(lmD), m2Name: name(m2D), thisMk: mk(t) };
});
const go = async (page, hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await B.ready(page); };
const text = (page, sel) => page.locator(sel).first().innerText();
const toastHas = (page, re) => page.waitForFunction((src) => Array.from(document.querySelectorAll('.toast span')).some((s) => new RegExp(src).test(s.textContent)), re.source, { timeout: 4000 }).then(() => true, () => false);
const storeWait = (page, fn, arg, ms) => page.waitForFunction(fn, arg, { timeout: ms || 5000 }).then(() => true, () => false);
const kpi = (page, label) => page.evaluate((l) => { const k = Array.from(document.querySelectorAll('.kpi')).find((x) => x.querySelector('.lab') && x.querySelector('.lab').textContent.trim().toLowerCase() === l.toLowerCase()); return k ? k.querySelector('.kpi-v').textContent.trim() : null; }, label);

(async () => {
  const browser = await chromium.launch();

  /* ---------------- S1: sample data tour ---------------- */
  if (want('tour')) await step('tour', async () => {
    const { page, log } = await B.open(browser, {});
    keepLog('tour', log);
    check('tour: sample banner shows on an empty store', await page.isVisible('.banner:has-text("Sample data")'));
    check('tour: logo is drawn inside the sidebar tile', await page.evaluate(() => {
      const t = document.querySelector('.side .tile').getBoundingClientRect(), u = document.querySelector('.side .tile use').getBoundingClientRect();
      return u.width > 18 && u.left >= t.left - 0.5 && u.right <= t.right + 0.5 && u.top >= t.top - 0.5 && u.bottom <= t.bottom + 0.5;
    }));
    check('tour: paid this month shows the sample payment', (await kpi(page, 'Paid this month')) === '€650', await kpi(page, 'Paid this month'));
    check('tour: six KPI tiles', (await page.locator('.kpis .kpi').count()) === 6);
    await B.shot(page, '01-overview');
    await go(page, 'leads'); await B.shot(page, '02-leads-board');
    check('tour: board has six stage columns', (await page.locator('.board .col').count()) === 6);
    await page.click('.seg button:has-text("List")'); await B.shot(page, '03-leads-list');
    check('tour: list view shows open leads', (await page.locator('.tbl tbody tr').count()) === 5, await page.locator('.tbl tbody tr').count());
    await page.click('.seg button:has-text("All")');
    check('tour: list "All" shows every sample lead', (await page.locator('.tbl tbody tr').count()) === 12);
    await page.click('.tbl th button:has-text("Monthly")');
    const firstMonthly = await text(page, '.tbl tbody tr td:nth-child(5)');
    check('tour: sorting by monthly value puts the largest first', /1,200/.test(firstMonthly), firstMonthly);
    await page.click('.seg button:has-text("Board")');
    await go(page, 'clients'); await B.shot(page, '04-clients');
    check('tour: three active sample clients', (await page.locator('.ccard').count()) === 3);
    await page.click('.ccard:has-text("Café Moka")');
    await page.waitForFunction(() => location.hash === '#client-dc2');
    await B.ready(page); await B.shot(page, '05-client-plan');
    await page.click('.tabs button:has-text("Results")'); await page.waitForSelector('.rep-grid');
    await page.waitForTimeout(200); await B.shot(page, '06-client-results');
    check('tour: results show a summary for the latest month', /Highlights/.test(await text(page, '.ai-out, textarea')));
    check('tour: cost per ad result tile', await page.isVisible('.kpi.inv:has-text("Cost per ad result")'));
    await page.click('.tabs button:has-text("Invoices")'); await B.shot(page, '07-client-invoices', false);
    await page.click('.tabs button:has-text("About")');
    await go(page, 'tasks'); await B.shot(page, '08-tasks');
    await go(page, 'money'); await B.shot(page, '09-money');
    check('tour: overdue invoice KPI flags chase', await page.isVisible('.kpi:has-text("Overdue") .chip:has-text("Chase")'));
    await go(page, 'growth'); await B.shot(page, '10-growth');
    await go(page, 'setup'); await B.shot(page, '11-setup');
    await go(page, 'leads');
    await page.click('.lcard:has-text("Brasserie Margaux")');
    await page.waitForSelector('[role="dialog"]');
    check('tour: sample lead opens read-only', /sample record/i.test(await text(page, '[role="dialog"]')));
    check('tour: sample lead inputs are disabled', await page.isDisabled('#ld-business'));
    await B.shot(page, '12-lead-sample-drawer', false);
    await page.keyboard.press('Escape');
    check('tour: Esc closes the drawer', await page.locator('[role="dialog"]').count() === 0);
    await page.keyboard.press('Control+k');
    await page.waitForSelector('#pal-q');
    await page.fill('#pal-q', 'moka');
    await B.shot(page, '13-palette', false);
    await page.keyboard.press('Enter');
    check('tour: palette jumps to the client', await storeWait(page, () => location.hash === '#client-dc2'));
    await page.keyboard.press('/');
    check('tour: "/" opens search', await page.isVisible('#pal-q'));
    await page.keyboard.press('Escape');
    check('tour: no page errors', log.errors.length === 0, log.errors);
    await page.context().close();
  });

  /* ---------------- S2: real records, end to end ---------------- */
  if (want('flow')) await step('flow', async () => {
    const { page, log } = await B.open(browser, { cfg: { latency: 40 } });
    keepLog('flow', log);
    const D = await dates(page);
    const dlg = page.locator('[role="dialog"]');

    // A lead typed in by hand
    await go(page, 'leads');
    await page.getByRole('button', { name: 'New lead', exact: true }).click();
    await dlg.waitFor();
    await page.fill('#ld-business', 'Café Lumière');
    await page.selectOption('#ld-type', 'Café');
    await page.fill('#ld-city', 'Paris');
    await page.fill('#ld-contact', 'Nora Belkacem');
    await page.fill('#ld-email', 'nora@cafelumiere.example');
    await page.click('[role="dialog"] .seg[aria-label="Interested in"] button:has-text("Social strategy")');
    await page.fill('#ld-vm', '1,200');
    await page.fill('#ld-next', 'Send the proposal');
    await page.fill('#ld-nextdate', D.tomorrow);
    await page.getByRole('button', { name: 'Add lead', exact: true }).click();
    await dlg.waitFor({ state: 'detached' });
    let leads = await B.docs(page, 'leads');
    check('flow: lead saved with parsed value', leads.length === 1 && leads[0].business === 'Café Lumière' && leads[0].valueMonthly === 1200 && leads[0].stage === 'new' && leads[0].createdBy === 'u_owner' && leads[0].services.join() === 'social' && leads[0].nextDate === D.tomorrow, leads);
    check('flow: sample data hidden after the first record', !(await page.isVisible('.banner:has-text("Sample data")')));
    check('flow: activity logged with author id', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('activity/') === 0 && /added lead Café Lumière/.test(d.text) && d.by === 'u_owner')));

    // A lead read from a pasted enquiry
    await page.getByRole('button', { name: 'Paste an enquiry' }).click();
    await page.fill('#paste-text', 'Bonjour, we run Le Jardin, a restaurant in Lyon. We reopen in spring and need a new website and help with Instagram. Budget around 3000 for the site. Camille Roux, camille@lejardin.example');
    await page.getByRole('button', { name: 'Read with Claude' }).click();
    check('flow: pasted enquiry fills a new lead form', await storeWait(page, () => { const i = document.querySelector('#ld-business'); return i && i.value === 'Le Jardin'; }));
    check('flow: instagram handle cleaned', (await page.inputValue('#ld-ig')) === 'lejardin');
    check('flow: unknown services dropped', await page.evaluate(() => Array.from(document.querySelectorAll('.seg[aria-label="Interested in"] button[aria-pressed="true"]')).map((b) => b.textContent.trim()).join('|')) === 'Websites|Social strategy');
    check('flow: one-off budget kept', (await page.inputValue('#ld-vo')) === '3000');
    const js = await page.evaluate(() => window.__mock.samples.filter((s) => s.kind === 'json'));
    check('flow: enquiry read with the quick tier', js.length === 1 && js[0].opts.indexOf('modelTier') >= 0, js);
    await B.shot(page, '14-lead-from-enquiry', false);
    await page.getByRole('button', { name: 'Add lead', exact: true }).click();
    await dlg.waitFor({ state: 'detached' });
    check('flow: two leads stored', (await B.docs(page, 'leads')).length === 2);

    // Drag across the board, then undo
    await page.dragAndDrop('.lcard:has-text("Café Lumière")', '.col[aria-label^="Contacted"]');
    check('flow: drag moves the lead to Contacted', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('leads/') === 0 && d.business === 'Café Lumière' && d.stage === 'contacted')));
    check('flow: move toast offers undo', await toastHas(page, /Moved to Contacted/));
    await page.click('.toast button:has-text("Undo")');
    check('flow: undo puts it back', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('leads/') === 0 && d.business === 'Café Lumière' && d.stage === 'new')));

    // Win Le Jardin with an unsaved note, then make it a client
    await page.click('.lcard:has-text("Le Jardin")');
    await dlg.waitFor();
    await page.click('[role="dialog"] .seg[aria-label="Stage"] button:has-text("Won")');
    await page.fill('#ld-notes', 'Reopening in March. Wants bookings from the website.');
    await page.getByRole('button', { name: 'Make client' }).click();
    check('flow: make client opens the client page', await storeWait(page, () => /^#client-/.test(location.hash)));
    await B.ready(page);
    const clients = await B.docs(page, 'clients');
    const cid = clients[0] && clients[0]._id;
    check('flow: client created with a plan for its services', clients.length === 1 && clients[0].name === 'Le Jardin' && clients[0].steps.length >= 10 && !clients[0].steps.some((s) => /Ad strategy|Ads live|pixel/i.test(s.text)) && clients[0].phase === 'discover', clients);
    leads = await B.docs(page, 'leads');
    const lj = leads.find((l) => l.business === 'Le Jardin');
    check('flow: lead won, linked, and the unsaved note kept', lj && lj.stage === 'won' && lj.clientId === cid && !!lj.wonAt && /Reopening in March/.test(lj.notes), lj);

    // Plan: quick toggles must all land (writes queue per document)
    const boxes = page.locator('.step .check');
    await boxes.nth(0).click(); await boxes.nth(1).click(); await boxes.nth(2).click();
    check('flow: three quick step toggles all saved', await storeWait(page, (id) => { const c = window.__mock.store.get('clients/' + id); return c && c.steps.filter((s) => s.done).length === 3; }, cid));
    check('flow: no overlapping writes to one document', (await page.evaluate(() => window.__mock.overlaps)).length === 0, await page.evaluate(() => window.__mock.overlaps));
    await page.fill('#step-discover', 'Visit the restaurant');
    await page.press('#step-discover', 'Enter');
    check('flow: step added', await storeWait(page, (id) => window.__mock.store.get('clients/' + id).steps.some((s) => s.text === 'Visit the restaurant' && s.phase === 'discover'), cid));
    check('flow: step remove button stays hidden until hover', !(await page.isVisible('button[aria-label="Remove step: Visit the restaurant"]')));
    await page.hover('.step:has-text("Visit the restaurant")');
    await page.click('button[aria-label="Remove step: Visit the restaurant"]');
    check('flow: step removed', await storeWait(page, (id) => !window.__mock.store.get('clients/' + id).steps.some((s) => s.text === 'Visit the restaurant'), cid));
    await page.click('.phases .ph:has-text("Frame")');
    check('flow: phase set to Frame', await storeWait(page, (id) => window.__mock.store.get('clients/' + id).phase === 'frame', cid));
    await page.click('.toast button:has-text("Undo")');
    check('flow: phase undo', await storeWait(page, (id) => window.__mock.store.get('clients/' + id).phase === 'discover', cid));
    await B.shot(page, '15-real-client-plan');

    // Client details
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await dlg.waitFor();
    await page.fill('#cl-ret', '1 200');
    await page.click('[role="dialog"] .seg[aria-label="Services"] button:has-text("Paid growth")');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await dlg.waitFor({ state: 'detached' });
    const c1 = (await B.docs(page, 'clients'))[0];
    check('flow: retainer "1 200" saved as 1200', c1.retainer === 1200, c1.retainer);
    check('flow: adding a service adds its plan steps', c1.services.indexOf('paid') >= 0 && c1.steps.some((s) => /Ad strategy/.test(s.text)) && c1.steps.filter((s) => s.done).length === 3, c1.steps.map((s) => s.text));

    // Results: two months, a Claude summary, a report file
    await page.click('.tabs button:has-text("Results")');
    await page.getByRole('button', { name: 'Add the first month' }).click();
    await dlg.waitFor();
    await page.selectOption('#rs-month', D.m2);
    await page.fill('#rs-webVisits', '1 210'); await page.fill('#rs-webActions', '64'); await page.fill('#rs-igFollowers', '2,070'); await page.fill('#rs-igReach', '8400'); await page.fill('#rs-igPosts', '12');
    await page.getByRole('button', { name: 'Save ' + D.m2Name }).click();
    await dlg.waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Add month', exact: true }).click();
    await dlg.waitFor();
    check('flow: new results default to last month', (await page.inputValue('#rs-month')) === D.lm);
    await page.fill('#rs-webVisits', '1450'); await page.fill('#rs-webActions', '88'); await page.fill('#rs-igFollowers', '2310'); await page.fill('#rs-igReach', '9,800'); await page.fill('#rs-igPosts', '14'); await page.fill('#rs-adSpend', '350,50'); await page.fill('#rs-adResults', '41');
    await page.getByRole('button', { name: 'Save ' + D.lmName }).click();
    await dlg.waitFor({ state: 'detached' });
    const rs = await B.docs(page, 'results');
    const rl = rs.find((r) => r._id === cid + '--' + D.lm), r2 = rs.find((r) => r._id === cid + '--' + D.m2);
    check('flow: results stored per client and month', rs.length === 2 && rl && r2 && rl.webVisits === 1450 && rl.igReach === 9800 && rl.adSpend === 350.5 && r2.igFollowers === 2070 && r2.adSpend === null, rs);
    check('flow: results show a month-on-month change', await page.isVisible('.rep-grid .delta'));
    await page.getByRole('button', { name: 'Write with Claude' }).click();
    check('flow: Claude summary streams into the box', await storeWait(page, (id) => { const t = document.querySelector('#sum-' + id); return t && /Next month/.test(t.value) && !t.disabled; }, cid, 8000));
    let sm = await page.evaluate(() => window.__mock.samples.filter((s) => s.kind === 'text'));
    check('flow: summary prompt carries the numbers and asks for no invented ones', sm.length === 1 && /Website visits: 1,450 \(previous month 1,210\)/.test(sm[0].input) && /never invent/.test(sm[0].input) && !sm[0].hasCacheKey, sm[0] && sm[0].input.slice(0, 600));
    await page.getByRole('button', { name: 'Save summary' }).click();
    check('flow: summary saved', await storeWait(page, (k) => { const r = window.__mock.store.get('results/' + k); return r && /Highlights/.test(r.summary || ''); }, cid + '--' + D.lm));
    await page.getByRole('button', { name: 'Write it again' }).click();
    await storeWait(page, (id) => { const t = document.querySelector('#sum-' + id); return t && !t.disabled && /Next month/.test(t.value); }, cid, 8000);
    sm = await page.evaluate(() => window.__mock.samples.filter((s) => s.kind === 'text'));
    check('flow: "Write it again" skips the cache', sm.length === 2 && sm[1].hasCacheKey && sm[1].cache === false, sm.map((s) => [s.hasCacheKey, s.cache]));
    await B.shot(page, '16-real-client-results');
    await page.getByRole('button', { name: 'Download report' }).click();
    const dl = await page.evaluate(() => window.__mock.downloads.slice(-1)[0]);
    check('flow: report file is branded HTML with the real logo', dl && dl.filename === 'le-jardin-results-' + D.lm + '.html' && /Le Jardin/.test(dl.text) && /Monthly results/.test(dl.text) && /M136\.36 175\.92/.test(dl.text) && /1,450/.test(dl.text), dl && [dl.filename, dl.text.length]);
    if (dl) require('fs').writeFileSync(require('path').join(B.SHOTS, 'report.html'), dl.text);

    // Tasks on the client page
    await page.click('.tabs button:has-text("Tasks")');
    await page.fill('#qt-title' + cid, 'Send the sitemap');
    await page.fill('#qt-due' + cid, D.tomorrow);
    await page.press('#qt-title' + cid, 'Enter');
    check('flow: quick task saved for the client and me', await storeWait(page, (id) => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('tasks/') === 0 && d.title === 'Send the sitemap' && d.clientId === id && d.assignee === 'u_owner'), cid));

    // An invoice from the client page
    await page.click('.tabs button:has-text("Invoices")');
    await page.getByRole('button', { name: 'Create an invoice' }).click();
    await dlg.waitFor();
    check('flow: invoice prefilled from the retainer', (await page.inputValue('#iv-amount')) === '1200' && (await page.inputValue('#iv-number')) === 'NF-' + D.year + '-001', [await page.inputValue('#iv-amount'), await page.inputValue('#iv-number')]);
    await page.getByRole('button', { name: 'Create invoice' }).click();
    await dlg.waitFor({ state: 'detached' });
    let invs = await B.docs(page, 'invoices');
    check('flow: invoice stored as a draft retainer for this month', invs.length === 1 && invs[0].kind === 'retainer' && invs[0].period === D.thisMk && invs[0].status === 'draft' && invs[0].amount === 1200 && invs[0].clientName === 'Le Jardin', invs);

    await go(page, 'money');
    await page.click('.tbl tbody tr:has-text("NF-") button:has-text("Mark sent")');
    check('flow: invoice marked sent', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('invoices/') === 0 && d.status === 'sent')));
    await page.click('.tbl tbody tr:has-text("NF-") button:has-text("Mark paid")');
    check('flow: invoice marked paid today', await storeWait(page, (t) => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('invoices/') === 0 && d.status === 'paid' && d.paidOn === t), D.today));
    check('flow: paid this month updates', (await kpi(page, 'Paid this month')) === '€1,200', await kpi(page, 'Paid this month'));
    await page.click('.toast button:has-text("Undo")');
    check('flow: undo paid', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('invoices/') === 0 && d.status === 'sent' && d.paidOn === null)));

    // A second client with a retainer, then one-click retainer drafts
    await page.getByRole('button', { name: 'New invoice' }).waitFor();
    await go(page, 'clients');
    await page.getByRole('button', { name: 'New client', exact: true }).click();
    await dlg.waitFor();
    await page.fill('#cl-name', 'Bar Nord');
    await page.click('[role="dialog"] .seg[aria-label="Services"] button:has-text("Paid growth")');
    await page.fill('#cl-ret', '€500');
    await page.getByRole('button', { name: 'Add client', exact: true }).click();
    check('flow: new client opens its page', await storeWait(page, () => /^#client-/.test(location.hash) && document.querySelector('.vh-h') && /Bar Nord/i.test(document.querySelector('.vh-h').textContent)));
    const bn = (await B.docs(page, 'clients')).find((c) => c.name === 'Bar Nord');
    check('flow: "€500" saved as 500, plan matches services', bn && bn.retainer === 500 && bn.steps.every((s) => !/Website|Photo|content calendar|Social direction/i.test(s.text)), bn);
    await go(page, 'money');
    await page.getByRole('button', { name: 'Create 1 draft invoice' }).click();
    check('flow: retainer draft numbered after the last invoice', await storeWait(page, (y) => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('invoices/') === 0 && d.clientName === 'Bar Nord' && d.number === 'NF-' + y + '-002' && d.status === 'draft' && d.amount === 500), D.year));
    await B.shot(page, '17-real-money');

    // Growth numbers
    await go(page, 'growth');
    await page.locator('header.vh').getByRole('button', { name: 'Add ' + D.lmName }).click();
    await dlg.waitFor();
    await page.fill('#gr-siteVisits', '1,240'); await page.fill('#gr-ctaClicks', '43'); await page.fill('#gr-igFollowers', '612'); await page.fill('#gr-igPosts', '15');
    await page.getByRole('button', { name: 'Save ' + D.lmName }).click();
    await dlg.waitFor({ state: 'detached' });
    const g = await B.docs(page, 'growth');
    check('flow: growth month stored under its month id', g.length === 1 && g[0]._id === D.lm && g[0].siteVisits === 1240 && g[0].ctaClicks === 43, g);
    check('flow: click rate shown', /3\.5% of visits clicked/.test(await text(page, '.kpis')));
    await B.shot(page, '18-real-growth');

    // Tasks view: quick add, tick off, assign a teammate
    await go(page, 'tasks');
    await page.fill('#qt-title', 'Plan the Instagram grid');
    await page.press('#qt-title', 'Enter');
    check('flow: task added from the Tasks view', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('tasks/') === 0 && d.title === 'Plan the Instagram grid' && d.clientId === null)));
    await page.click('.trow:has-text("Plan the Instagram grid") .check');
    check('flow: task ticked off', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('tasks/') === 0 && d.title === 'Plan the Instagram grid' && d.status === 'done' && d.doneAt)));
    await page.click('.trow-t:has-text("Send the sitemap")');
    await dlg.waitFor();
    await page.click('[role="dialog"] button:has-text("Change")');
    await page.focus('#tk-who');
    await page.waitForSelector('[role="listbox"] [role="option"]');
    check('flow: teammate search lists the team', (await page.locator('[role="listbox"] [role="option"]').count()) === 3);
    await page.click('[role="option"]:has-text("Sara Haddad")');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await dlg.waitFor({ state: 'detached' });
    check('flow: task assigned by id', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('tasks/') === 0 && d.title === 'Send the sitemap' && d.assignee === 'u_sara')));
    check('flow: assignee initials shown', /SH/.test(await text(page, '.trow:has-text("Send the sitemap")')));
    await B.shot(page, '19-real-tasks');

    // Overview with real records
    await go(page, 'overview');
    check('flow: overview counts real open leads', (await kpi(page, 'Open leads')) === '1', await kpi(page, 'Open leads'));
    check('flow: overview retainers total', (await kpi(page, 'Monthly retainers')) === '€1,700', await kpi(page, 'Monthly retainers'));
    check('flow: activity names the person', /Youssef Cherif/.test(await text(page, '#h-act')) || /Youssef Cherif/.test(await page.locator('section[aria-labelledby="h-act"]').innerText()));
    await B.shot(page, '20-real-overview');

    // Settings and exports
    await go(page, 'setup');
    await page.selectOption('#set-cur', 'GBP');
    check('flow: currency saved', await storeWait(page, () => { const s = window.__mock.store.get('settings/main'); return s && s.currency === 'GBP'; }));
    await go(page, 'money');
    check('flow: amounts switch to pounds', /£1,200/.test(await page.locator('main').innerText()));
    await go(page, 'setup');
    await page.click('section[aria-labelledby="s-exp"] button:has-text("Leads")');
    let last = await page.evaluate(() => window.__mock.downloads.slice(-1)[0]);
    check('flow: leads CSV export', last && last.filename === 'north-frame-leads-' + D.today + '.csv' && last.text.charCodeAt(0) === 0xfeff && /^﻿Business,Stage/.test(last.text) && /Café Lumière/.test(last.text), last && last.text.slice(0, 120));
    await page.click('section[aria-labelledby="s-exp"] button:has-text("Full backup")');
    last = await page.evaluate(() => window.__mock.downloads.slice(-1)[0]);
    let backup = null; try { backup = JSON.parse(last.text); } catch (e) { /* checked below */ }
    check('flow: full backup is valid JSON with every collection', backup && backup.leads.length === 2 && backup.clients.length === 2 && backup.currency === 'GBP' && Array.isArray(backup.growth), last && last.filename);

    // Delete a lead and undo
    await go(page, 'leads');
    await page.click('.lcard:has-text("Café Lumière")');
    await dlg.waitFor();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('button', { name: 'Delete lead' }).click();
    await dlg.waitFor({ state: 'detached' });
    check('flow: lead deleted', (await B.docs(page, 'leads')).every((l) => l.business !== 'Café Lumière'));
    await page.click('.toast button:has-text("Undo")');
    check('flow: lead restored by undo', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('leads/') === 0 && d.business === 'Café Lumière')));

    // Someone else deletes a lead while it is open here
    await page.click('.lcard:has-text("Café Lumière")');
    await dlg.waitFor();
    await page.evaluate(() => { for (const [p, d] of window.__mock.store) if (p.indexOf('leads/') === 0 && d.business === 'Café Lumière') window.__mock.store.delete(p); });
    await page.fill('#ld-notes', 'Changed after it was deleted elsewhere');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    check('flow: saving a record deleted elsewhere says so', await toastHas(page, /Someone else deleted this record/));
    check('flow: and does not lock the dashboard', !(await page.isVisible('.banner:has-text("View only")')));
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Discard' }).click();
    await dlg.waitFor({ state: 'detached' });

    // Transient failure retries once; a full store says so
    await page.evaluate(() => { window.__mock.failNext = { code: 'unavailable', times: 1 }; });
    await page.click('.lcard:has-text("Le Jardin")');
    await dlg.waitFor();
    await page.fill('#ld-city', 'Lyon 2e');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    check('flow: a transient failure is retried', await storeWait(page, () => Array.from(window.__mock.store.entries()).some(([p, d]) => p.indexOf('leads/') === 0 && d.city === 'Lyon 2e')));
    await page.evaluate(() => { window.__mock.failNext = { code: 'quota_exceeded', op: 'set' }; });
    await go(page, 'tasks');
    await page.fill('#qt-title', 'This one will not fit');
    await page.press('#qt-title', 'Enter');
    check('flow: a full store is explained', await toastHas(page, /dashboard is full/));
    check('flow: the typed task is kept after a failed save', (await page.inputValue('#qt-title')) === 'This one will not fit');

    // Search shortcuts never replace an open form
    await page.getByRole('button', { name: 'New task', exact: true }).click();
    await dlg.waitFor();
    await page.keyboard.press('Control+k');
    check('flow: Ctrl+K ignored while a form is open', (await page.locator('#pal-q').count()) === 0);
    await page.keyboard.press('Escape');
    await dlg.waitFor({ state: 'detached' });

    // Delete a client with its tasks and results; invoices stay
    await go(page, 'client-' + cid);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await dlg.waitFor();
    check('flow: delete offers to remove related records', /Also delete 1 task and 2 months of results/.test(await text(page, '[role="dialog"]')));
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('button', { name: 'Delete client' }).click();
    check('flow: client delete returns to Clients', await storeWait(page, () => location.hash === '#clients'));
    await page.waitForTimeout(400);
    const after = await page.evaluate((id) => { const a = Array.from(window.__mock.store.entries()); return { client: !!window.__mock.store.get('clients/' + id), tasks: a.filter(([p, d]) => p.indexOf('tasks/') === 0 && d.clientId === id).length, results: a.filter(([p, d]) => p.indexOf('results/') === 0 && d.clientId === id).length, invoices: a.filter(([p, d]) => p.indexOf('invoices/') === 0 && d.clientId === id).length }; }, cid);
    check('flow: related tasks and results removed, invoices kept', !after.client && after.tasks === 0 && after.results === 0 && after.invoices === 1, after);
    check('flow: no overlapping writes overall', (await page.evaluate(() => window.__mock.overlaps)).length === 0, await page.evaluate(() => window.__mock.overlaps));
    check('flow: no page errors', log.errors.length === 0, log.errors);
    await page.context().close();
  });

  /* ---------------- S2b: starting empty ---------------- */
  if (want('empty')) await step('empty', async () => {
    const { page, log } = await B.open(browser, {});
    keepLog('empty', log);
    await page.getByRole('button', { name: 'Start empty' }).click();
    check('empty: sample data hidden on request', !(await page.isVisible('.banner:has-text("Sample data")')));
    await B.shot(page, 'e-overview');
    for (const v of ['leads', 'clients', 'tasks', 'money', 'growth', 'setup']) {
      await go(page, v);
      check('empty: ' + v + ' shows an empty state or empty layout', (await page.locator('.empty').count()) > 0 || v === 'setup' || v === 'money');
      await B.shot(page, 'e-' + v, false);
    }
    await go(page, 'setup');
    await page.click('.seg button:has-text("Show while empty")');
    check('empty: sample data can come back', await page.isVisible('.banner:has-text("Sample data")'));
    check('empty: no page errors', log.errors.length === 0, log.errors);
    await page.context().close();
  });

  /* ---------------- S3: view-only teammate ---------------- */
  if (want('readonly')) await step('readonly', async () => {
    const seed = {
      'leads/l1': { business: 'Maison Rose', stage: 'new', type: 'Bakery', createdAt: new Date().toISOString(), services: ['social'] },
      'clients/c1': { name: 'Hôtel Azur', status: 'active', phase: 'build', services: ['websites'], retainer: 800, steps: [{ id: 's1', phase: 'build', text: 'Website built and launched', done: false }] },
      'tasks/t1': { title: 'Shoot the rooms', clientId: 'c1', status: 'todo', due: null },
    };
    const { page, log } = await B.open(browser, { cfg: { writable: false, meId: 'u_tom', seed } });
    keepLog('readonly', log);
    check('readonly: view-only banner', await page.isVisible('.banner:has-text("View only")'));
    check('readonly: no New menu', (await page.getByRole('button', { name: 'New', exact: true }).count()) === 0);
    check('readonly: no sample data while records exist', !(await page.isVisible('.banner:has-text("Sample data")')));
    await go(page, 'client-c1');
    check('readonly: plan checkboxes disabled', await page.isDisabled('.step .check'));
    await page.getByRole('button', { name: 'Details' }).click();
    check('readonly: client opens read-only', /can view this record but not change it/.test(await text(page, '[role="dialog"]')));
    await page.keyboard.press('Escape');
    await go(page, 'setup');
    check('readonly: setup says view-only', /can view this dashboard but not change it/.test(await page.locator('main').innerText()));
    check('readonly: no page errors', log.errors.length === 0, log.errors);
    await page.context().close();

    // Platform says nothing (can() null), then refuses the first write
    const r2 = await B.open(browser, { cfg: { writable: false, canNull: true, seed } });
    keepLog('readonly-null', r2.log);
    await go(r2.page, 'tasks');
    await r2.page.fill('#qt-title', 'Try to add this');
    await r2.page.press('#qt-title', 'Enter');
    check('readonly: refused write turns the page view-only', await r2.page.waitForSelector('.banner:has-text("View only")', { timeout: 4000 }).then(() => true, () => false));
    check('readonly: quick add hidden after refusal', (await r2.page.locator('#qt-title').count()) === 0);
    await r2.page.context().close();
  });

  /* ---------------- S3b: view-only person when reads need edit access ---------------- */
  if (want('readonly')) await step('readonly-empty', async () => {
    const { page, log } = await B.open(browser, { cfg: { writable: false, meId: 'u_tom' } });
    keepLog('readonly-empty', log);
    check('readonly-empty: banner explains view-only access', /view-only access, so you see sample records/.test(await text(page, '.banner')));
    check('readonly-empty: no Start empty button', (await page.getByRole('button', { name: 'Start empty' }).count()) === 0);
    check('readonly-empty: no New menu', (await page.getByRole('button', { name: 'New', exact: true }).count()) === 0);
    await page.context().close();
  });

  /* ---------------- S4: opened outside Claude ---------------- */
  if (want('noruntime')) await step('noruntime', async () => {
    const { page, log } = await B.open(browser, { cfg: { runtime: false } });
    keepLog('noruntime', log);
    check('noruntime: preview banner', /Open the dashboard in Claude/.test(await text(page, '.banner')));
    await go(page, 'leads');
    await page.getByRole('button', { name: 'New lead', exact: true }).click();
    await page.fill('#ld-business', 'Test');
    await page.getByRole('button', { name: 'Add lead', exact: true }).click();
    check('noruntime: saving explains where it works', await toastHas(page, /Open this dashboard in Claude to save records/));
    check('noruntime: no page errors', log.errors.length === 0, log.errors);
    await page.context().close();
  });

  /* ---------------- S5: Claude unavailable ---------------- */
  if (want('ai')) await step('ai', async () => {
    const a = await B.open(browser, { cfg: { sampleOn: false } });
    keepLog('ai-off', a.log);
    check('ai: no paste button without Claude', (await a.page.getByRole('button', { name: 'Paste an enquiry' }).count()) === 0);
    await a.page.context().close();
    const b = await B.open(browser, { cfg: { sampleFail: 'not_granted' } });
    keepLog('ai-declined', b.log);
    await b.page.getByRole('button', { name: 'Paste an enquiry' }).click();
    await b.page.fill('#paste-text', 'Hello from a café');
    await b.page.getByRole('button', { name: 'Read with Claude' }).click();
    check('ai: declined consent is explained', await b.page.waitForSelector('[role="dialog"] .err:has-text("isn’t available")', { timeout: 4000 }).then(() => true, () => false));
    await b.page.getByRole('button', { name: 'Cancel' }).click().catch(() => {});
    await b.page.keyboard.press('Escape');
    const discard = b.page.getByRole('button', { name: 'Discard' });
    if (await discard.count()) await discard.click();
    check('ai: Claude buttons hidden after a decline', (await b.page.getByRole('button', { name: 'Paste an enquiry' }).count()) === 0);
    await b.page.context().close();
  });

  /* ---------------- S6: slow store ---------------- */
  if (want('slow')) await step('slow', async () => {
    const { page, log } = await B.open(browser, { cfg: { firstDelay: 12000 }, wait: false });
    keepLog('slow', log);
    await page.waitForTimeout(1500);
    check('slow: loading state while the store is quiet', await page.isVisible('[aria-busy="true"]'));
    await B.ready(page, 14000);
    check('slow: page stops waiting after the timeout', !(await page.isVisible('[aria-busy="true"]')));
    await page.context().close();
  });

  /* ---------------- S7: themes, phone, colours, overflow ---------------- */
  if (want('visual')) await step('visual', async () => {
    const views = ['overview', 'leads', 'clients', 'client-dc2', 'tasks', 'money', 'growth', 'setup'];
    for (const [label, opts] of [['light', {}], ['dark', { scheme: 'dark' }], ['phone', { width: 390, height: 844, mobile: true, touch: true, dpr: 2 }], ['phone-dark', { width: 390, height: 844, scheme: 'dark', mobile: true, touch: true, dpr: 2 }], ['tablet', { width: 820, height: 1180 }]]) {
      const { page, log } = await B.open(browser, opts);
      keepLog('visual-' + label, log);
      for (const v of views) {
        await go(page, v);
        if (v === 'client-dc2') { await page.click('.tabs button:has-text("Results")'); await page.waitForSelector('.rep-grid'); await page.waitForTimeout(150); }
        const o = await B.overflow(page);
        check('visual ' + label + ' ' + v + ': no sideways scroll', o.scrollWidth <= o.clientWidth && !o.wide.length, o);
        const bad = await B.colours(page);
        check('visual ' + label + ' ' + v + ': only ink and ivory', !bad.length, bad.slice(0, 6));
        if (label !== 'tablet' || v === 'overview' || v === 'leads') await B.shot(page, 'v-' + label + '-' + v, label.indexOf('phone') === 0 ? true : v !== 'leads');
      }
      await go(page, 'leads');
      if (label.indexOf('phone') === 0) {
        await page.click('.lcard:has-text("Hôtel Soleil")');
        await page.waitForSelector('[role="dialog"]');
        await B.shot(page, 'v-' + label + '-drawer', false);
        const bad = await B.colours(page);
        check('visual ' + label + ' drawer: only ink and ivory', !bad.length, bad.slice(0, 6));
      }
      check('visual ' + label + ': no page errors', log.errors.length === 0, log.errors);
      await page.context().close();
    }
  });

  /* ---------------- S8: production React build ---------------- */
  if (want('prod')) await step('prod', async () => {
    const { page, log } = await B.open(browser, { dev: false });
    keepLog('prod', log);
    for (const v of ['leads', 'clients', 'client-dc2', 'tasks', 'money', 'growth', 'setup', 'overview']) await go(page, v);
    check('prod: production build runs every view cleanly', log.errors.length === 0 && !log.console.some((c) => /^error/.test(c)), log);
    await page.context().close();
  });

  await browser.close();
  console.log('\n==== console output by scenario ====');
  logs.forEach(([label, log]) => {
    const uniq = Array.from(new Set(log.console));
    if (uniq.length || log.errors.length || log.blocked.length) console.log('[' + label + ']', JSON.stringify({ console: uniq.slice(0, 12), errors: log.errors.slice(0, 5), blocked: log.blocked.slice(0, 5) }, null, 1));
  });
  const failed = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - failed.length) + ' passed, ' + failed.length + ' failed');
  failed.forEach((f) => console.log('  FAIL ' + f.name));
})().catch((e) => { console.error('RUNNER CRASHED', e); process.exit(1); });
