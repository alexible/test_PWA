// PWA + Pyodide runner
let pyodide = null;
let pyWorker = null;
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const editorEl = document.getElementById("editor");
const pyverEl = document.getElementById("pyver");

function log(msg) {
  outputEl.textContent += msg + "\n";
  outputEl.scrollTop = outputEl.scrollHeight;
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

async function initPyodide() {
  setStatus("Loading Pyodide…");
  // Use a web worker so long-running scripts don't freeze the UI
  pyWorker = new Worker("py-worker.js");
  pyWorker.onmessage = (ev) => {
    const { type, data } = ev.data;
    if (type === "status") setStatus(data);
    if (type === "stdout") log(data);
    if (type === "stderr") log(data);
    if (type === "ready") {
      setStatus("Ready");
      pyverEl.textContent = data.version;
    }
    if (type === "done") {
      setStatus("Ready");
    }
  };
  pyWorker.onerror = (e) => {
    log("Worker error: " + e.message);
  };
}

function saveToDevice(filename, text) {
  const blob = new Blob([text], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "script.py";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  editorEl.value = await file.text();
});

document.getElementById("newBtn").addEventListener("click", () => {
  editorEl.value = "# New file\nprint('Hello, world!')\n";
});

document.getElementById("saveBtn").addEventListener("click", () => {
  saveToDevice("script.py", editorEl.value);
});

document.getElementById("exampleBtn").addEventListener("click", () => {
  editorEl.value = `# Example: simple calculator
def add(a, b): 
    return a + b

def fib(n):
    a, b = 0, 1
    out = []
    for _ in range(n):
        out.append(a)
        a, b = b, a + b
    return out

print('2 + 5 =', add(2, 5))
print('Fibonacci(10):', fib(10))
`;
});

document.getElementById("runBtn").addEventListener("click", () => {
  setStatus("Running…");
  pyWorker.postMessage({ type: "run", code: editorEl.value });
});

document.getElementById("stopBtn").addEventListener("click", () => {
  if (pyWorker) {
    pyWorker.terminate();
    log("[stopped]");
    initPyodide(); // restart worker
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  outputEl.textContent = "";
});

// PWA install status
window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
  initPyodide();
});
