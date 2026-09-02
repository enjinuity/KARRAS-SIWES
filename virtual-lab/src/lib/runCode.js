const JS_WHITELIST_GLOBALS = new Set([
  'console', 'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number',
  'Boolean', 'RegExp', 'Error', 'TypeError', 'SyntaxError', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'Set', 'Map',
  'Promise', 'Symbol', 'NaN', 'Infinity', 'undefined', 'null', 'BigInt',
])

let pyodideLoaded = false
let pyodideLoadingPromise = null
const captureStdoutKey = 'py_stdout_capture'

const ensurePyodide = async () => {
  if (pyodideLoaded) return
  if (pyodideLoadingPromise) return pyodideLoadingPromise
  pyodideLoadingPromise = (async () => {
    const { loadPyodide } = await import('pyodide')
    const py = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
    })
    const capturePy = `
import sys
import io
_${captureStdoutKey}_stdout = io.StringIO()
_${captureStdoutKey}_stderr = io.StringIO()
sys.stdout = _${captureStdoutKey}_stdout
sys.stderr = _${captureStdoutKey}_stderr
`
    await py.runPythonAsync(capturePy)
    globalThis.__vl_pyodide = py
    pyodideLoaded = true
  })()
  return pyodideLoadingPromise
}

export const runCode = async ({ code, language = 'javascript', stdin = '', expectedOutput = null, timeoutMs = 15000 }) => {
  const t0 = Date.now()
  try {
    if (language === 'javascript' || language === 'js') {
      const out = await runJs(code, { stdin, timeoutMs })
      return { ...out, durationMs: Date.now() - t0, passed: diffExpected(out, expectedOutput) }
    }
    if (language === 'python' || language === 'py') {
      const out = await runPython(code, { stdin, timeoutMs })
      return { ...out, durationMs: Date.now() - t0, passed: diffExpected(out, expectedOutput) }
    }
    return { ok: false, output: `Unsupported language: ${language}`, durationMs: Date.now() - t0, passed: false }
  } catch (err) {
    return {
      ok: false,
      output: `[runtime error] ${err.message || String(err)}`,
      durationMs: Date.now() - t0,
      passed: false,
    }
  }
}

const diffExpected = (out, expectedOutput) => {
  if (!expectedOutput || expectedOutput.trim() === '') return null
  const a = (out?.output || '').trim().replace(/\r\n/g, '\n')
  const b = String(expectedOutput).trim().replace(/\r\n/g, '\n')
  return a === b
}

const runJs = (code, { stdin = '', timeoutMs = 10000 } = {}) => {
  return new Promise((resolve) => {
    let output = ''
    const timer = setTimeout(() => resolve({ ok: false, output: '[timeout] JavaScript execution exceeded ' + timeoutMs + 'ms' }), timeoutMs)
    try {
      const fakeConsole = {
        log: (...args) => { output += args.map(anyToString).join(' ') + '\n' },
        error: (...args) => { output += args.map(anyToString).join(' ') + '\n' },
        warn: (...args) => { output += args.map(anyToString).join(' ') + '\n' },
        info: (...args) => { output += args.map(anyToString).join(' ') + '\n' },
      }
      const globalProxy = new Proxy(globalThis, {
        get(target, prop) {
          if (prop === 'console') return fakeConsole
          if (prop === 'process') return { stdin: { read: () => stdin } }
          if (JS_WHITELIST_GLOBALS.has(String(prop))) return target[prop]
          if (String(prop) === Symbol.unscopables) return undefined
          return undefined
        },
        has() { return true },
      })
      const fn = new Function('globalThis', 'console', `
        with (globalThis) {
          ;(${wrapCode(code)}\n)();
        }
      `)
      const result = fn.call(undefined, globalProxy, fakeConsole)
      if (typeof result?.then === 'function') {
        result.then((rv) => {
          clearTimeout(timer)
          if (rv !== undefined) output += (output ? '\n' : '') + anyToString(rv)
          resolve({ ok: true, output })
        }).catch((err) => {
          clearTimeout(timer)
          resolve({ ok: false, output: `[exception] ${err.message || String(err)}` })
        })
      } else {
        clearTimeout(timer)
        if (result !== undefined) output += (output ? '\n' : '') + anyToString(result)
        resolve({ ok: true, output })
      }
    } catch (err) {
      clearTimeout(timer)
      resolve({ ok: false, output: `[syntax/error] ${err.message || String(err)}` })
    }
  })
}

const wrapCode = (code) => `function () {
"use strict";
${code}
}`

const anyToString = (v) => {
  try {
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean' || v == null) return String(v)
    if (typeof v === 'object') return JSON.stringify(v, null, 2)
    return String(v)
  } catch { return String(v) }
}

const runPython = async (code, { timeoutMs = 20000 } = {}) => {
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true }, timeoutMs)
  try {
    await ensurePyodide()
    const py = globalThis.__vl_pyodide
    if (!py) return { ok: false, output: '[init error] Python runtime failed to load' }
    // Clear buffers
    await py.runPythonAsync(`
sys.stdout.seek(0)
sys.stdout.truncate(0)
sys.stderr.seek(0)
sys.stderr.truncate(0)
`)
    let err = null
    try {
      await py.runPythonAsync(code)
    } catch (e) {
      err = e
    }
    await py.runPythonAsync(`
_out = sys.stdout.getvalue()
_err = sys.stderr.getvalue()
`)
    const out = (py.globals.get('_out') || '') + (py.globals.get('_err') ? '\n' + py.globals.get('_err') : '')
    clearTimeout(timer)
    if (timedOut) return { ok: false, output: '[timeout] Python execution exceeded ' + timeoutMs + 'ms' }
    return { ok: !err, output: (out || '') + (err ? `\n[exception] ${err.message || String(err)}` : '') }
  } catch (e) {
    clearTimeout(timer)
    return { ok: false, output: `[python error] ${e.message || String(e)}` }
  }
}
