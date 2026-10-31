# North Frame HQ

The studio's internal dashboard: leads, clients through Discover, Frame, Build and Grow, tasks, invoices, monthly client results reports, and North Frame's own growth numbers.

- Live page: https://claude.ai/artifact/YVPPLoYfzwoFeXTBGCzDhT (private until you share it from its Share menu)
- Source: `index.html` in this folder, a single page with no build step

## How it works

- Records live in the page's shared database on claude.ai, not in this repository. Everyone with access sees changes live.
- Only people with edit access (Contributor or Editor) can read or change records. View-only visitors and public links see sample records instead.
- While the database is empty, the page shows sample records marked "Sample data". They are never saved, and "Start empty" hides them.
- Claude helps in three places: reading a pasted enquiry into a new lead, drafting a reply to a lead, and writing a client's monthly summary. Each runs on the viewer's own Claude account, only when they click.
- Exports: a CSV per record type, a full JSON backup, and a branded HTML results report for any client and month.

## Changing the page

Edit `index.html`, run the checks below, then republish the page to the same artifact link from a Claude session.

## Checks

`tests/` runs the page in Chromium against a stand-in for the claude.ai runtime (database, people, downloads and Claude replies):

```sh
cd dashboard/tests
npm install
npm test
```

Playwright with Chromium must be installed. The run covers every view and flow, view-only access, opening the page outside Claude, a declined Claude prompt, a slow database, light and dark themes at desktop, tablet and phone widths, sideways overflow, and a check that only the two brand colours are painted. Screenshots land in `tests/shots/`.

`.vercelignore` at the repository root keeps this folder out of the website's deployments.
