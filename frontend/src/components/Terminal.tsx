import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { V86 } from "v86";
import wasmUrl from "v86/build/v86.wasm?url";

const PROMPT = "~% ";

/** A Linux VM running in the browser, shown as a full-size terminal. */
export default function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: "Consolas, 'Cascadia Mono', Menlo, monospace",
      fontSize: 15,
      theme: { background: "#0d1117" },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
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

    // The guest talks to us over its first serial port. Linux cannot see the
    // size of a serial terminal, so we tell it with `stty` when the size changes.
    const syncSize = () => send(`stty rows ${term.rows} cols ${term.cols}\n`);

    let disposed = false;
    let booted = false;
    let tail = "";

    emulator.add_listener("serial0-output-byte", (byte: number) => {
      if (disposed) return;
      term.write(Uint8Array.of(byte));

      if (booted) return;
      tail = (tail + String.fromCharCode(byte)).slice(-PROMPT.length);
      if (tail === PROMPT) {
        booted = true;
        syncSize();
        send("clear\n");
      }
    });

    const input = term.onData((data) => {
      if (booted) send(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      const { rows, cols } = term;
      fit.fit();
      if (booted && (term.rows !== rows || term.cols !== cols)) syncSize();
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      input.dispose();
      void emulator.destroy();
      term.dispose();
    };
  }, []);

  return <div ref={containerRef} className="h-full p-2" />;
}
