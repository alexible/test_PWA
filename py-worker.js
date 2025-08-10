// Runs Pyodide in a Web Worker
let pyodide = null;

function post(type, data) {
  self.postMessage({ type, data });
}

async function load() {
  post("status", "Loading Pyodide…");
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");
  pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/" });
  post("ready", { version: pyodide.runPython("import sys; sys.version") });
}

async function run(code) {
  if (!pyodide) await load();
  // Redirect stdout/stderr
  pyodide.setStdout({ batched: (s) => post("stdout", s) });
  pyodide.setStderr({ batched: (s) => post("stderr", s) });
  try {
    await pyodide.runPythonAsync(code);
    post("done", null);
  } catch (e) {
    post("stderr", e.toString());
    post("done", null);
  }
}

self.onmessage = async (ev) => {
  const { type, code } = ev.data || {};
  if (type === "run") {
    await run(code);
  }
};

load();
