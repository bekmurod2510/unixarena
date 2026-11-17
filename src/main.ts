import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./style.css";
import { V86 } from "v86";
import wasmUrl from "v86/build/v86.wasm?url";

const PROMPT = "~% ";

const term = new Terminal({
  cursorBlink: true,
  fontFamily: "Consolas, 'Cascadia Mono', Menlo, monospace",
  fontSize: 15,
  theme: { background: "#0d1117" },
});
const fit = new FitAddon();
term.loadAddon(fit);
term.open(document.getElementById("terminal")!);
fit.fit();
term.focus();
term.write("Booting Linux ...\r\n");

const emulator = new V86({
  wasm_path: wasmUrl,
  bios: { url: "/v86/seabios.bin" },
  vga_bios: { url: "/v86/vgabios.bin" },
  bzimage: { url: "/v86/linux.bin" },
  cmdline: "tsc=reliable mitigations=off random.trust_cpu=on",
  memory_size: 128 * 1024 * 1024,
  filesystem: {},
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
});

const encoder = new TextEncoder();
const send = (text: string) => emulator.serial_send_bytes(0, encoder.encode(text));

// The guest talks to us over its first serial port. Linux cannot see the size
// of a serial terminal, so we tell it with `stty` whenever the size changes.
const syncSize = () => send(`stty rows ${term.rows} cols ${term.cols}\n`);

let booted = false;
let tail = "";

emulator.add_listener("serial0-output-byte", (byte: number) => {
  term.write(Uint8Array.of(byte));

  if (booted) return;
  tail = (tail + String.fromCharCode(byte)).slice(-PROMPT.length);
  if (tail === PROMPT) {
    booted = true;
    syncSize();
    send("clear\n");
  }
});

term.onData((data) => {
  if (booted) send(data);
});

window.addEventListener("resize", () => {
  fit.fit();
  if (booted) syncSize();
});
