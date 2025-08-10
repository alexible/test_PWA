# Python Runner PWA (Pyodide)
Installable PWA that runs Python in your browser (offline after first load) using Pyodide.

## Quick start
1. Host these files (e.g., GitHub Pages, Netlify, Cloudflare Pages).
2. Open the site in Chrome on Android.
3. Menu → **Install app** (Add to Home Screen).
4. Open the app and run Python locally (no server after first load).

## Notes
- First load requires internet to fetch Pyodide (~10–20MB). After that, it works offline.
- Use **Open .py** to pick a Python file from your device.
- **Save** downloads the current editor contents as a `.py` file.
- Long-running scripts can be stopped with **Stop** (restarts the worker).
