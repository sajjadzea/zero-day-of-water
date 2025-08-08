# Zero Day of Water — React Pro (Single-file GH Pages)

This is a React + Recharts dashboard that builds to a single self-contained `docs/index.html` (no CDNs required at runtime).  
On every push to `main`, GitHub Actions builds and commits the output into `/docs`.

## Run locally
```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
# output: docs/index.html (single file)
```

## Publish on GitHub Pages

1. Settings → Pages → **Deploy from a branch**
   Branch = `main`, Folder = `/docs`
2. Push to `main`. The Action will build and commit `/docs/index.html`.
3. Wait 1–2 minutes; your page will be live.

## Notes

* Zero-day definition is configurable: crossing-threshold vs end-of-day presentation.
* Event markers allow highlighting key dates (e.g., peak/holiday).
* You can toggle series, zoom the time range, export CSV & PNG, and share a URL that encodes the current state.

