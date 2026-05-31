import type { Layout } from "./types";

// Thai Pattachote (ปัตตโชติ) layout.
// Source: kbdlayout.info KBDTH1 (official Windows "Thai Pattachote" driver) shift-states dump.
// Finger/row assignments are positional, matching kedmanee.ts per physical code.
export const pattachote: Layout = {
  id: "pattachote",
  name: "Pattachote",
  keys: {
    Backquote: { normal: "_", shift: "฿", finger: "left-pinky", row: "number" },
    Digit1: { normal: "=", shift: "+", finger: "left-pinky", row: "number" },
    Digit2: { normal: "๒", shift: "\"", finger: "left-ring", row: "number" },
    Digit3: { normal: "๓", shift: "/", finger: "left-middle", row: "number" },
    Digit4: { normal: "๔", shift: ",", finger: "left-index", row: "number" },
    Digit5: { normal: "๕", shift: "?", finger: "left-index", row: "number" },
    Digit6: { normal: "ู", shift: "ุ", finger: "right-index", row: "number" },
    Digit7: { normal: "๗", shift: "_", finger: "right-index", row: "number" },
    Digit8: { normal: "๘", shift: ".", finger: "right-middle", row: "number" },
    Digit9: { normal: "๙", shift: "(", finger: "right-ring", row: "number" },
    Digit0: { normal: "๐", shift: ")", finger: "right-pinky", row: "number" },
    Minus: { normal: "๑", shift: "-", finger: "right-pinky", row: "number" },
    Equal: { normal: "๖", shift: "%", finger: "right-pinky", row: "number" },

    KeyQ: { normal: "็", shift: "๊", finger: "left-pinky", row: "top" },
    KeyW: { normal: "ต", shift: "ฤ", finger: "left-ring", row: "top" },
    KeyE: { normal: "ย", shift: "ๆ", finger: "left-middle", row: "top" },
    KeyR: { normal: "อ", shift: "ญ", finger: "left-index", row: "top" },
    KeyT: { normal: "ร", shift: "ษ", finger: "left-index", row: "top" },
    KeyY: { normal: "่", shift: "ึ", finger: "right-index", row: "top" },
    KeyU: { normal: "ด", shift: "ฝ", finger: "right-index", row: "top" },
    KeyI: { normal: "ม", shift: "ซ", finger: "right-middle", row: "top" },
    KeyO: { normal: "ว", shift: "ถ", finger: "right-ring", row: "top" },
    KeyP: { normal: "แ", shift: "ฒ", finger: "right-pinky", row: "top" },
    BracketLeft: { normal: "ใ", shift: "ฯ", finger: "right-pinky", row: "top" },
    BracketRight: { normal: "ฌ", shift: "ฦ", finger: "right-pinky", row: "top" },
    Backslash: { normal: "ฺ", shift: "ู", finger: "right-pinky", row: "top" },

    KeyA: { normal: "้", shift: "๋", finger: "left-pinky", row: "home" },
    KeyS: { normal: "ท", shift: "ธ", finger: "left-ring", row: "home" },
    KeyD: { normal: "ง", shift: "ำ", finger: "left-middle", row: "home" },
    KeyF: { normal: "ก", shift: "ณ", finger: "left-index", row: "home" },
    KeyG: { normal: "ั", shift: "์", finger: "left-index", row: "home" },
    KeyH: { normal: "ี", shift: "ื", finger: "right-index", row: "home" },
    KeyJ: { normal: "า", shift: "ผ", finger: "right-index", row: "home" },
    KeyK: { normal: "น", shift: "ช", finger: "right-middle", row: "home" },
    KeyL: { normal: "เ", shift: "โ", finger: "right-ring", row: "home" },
    Semicolon: { normal: "ไ", shift: "ฆ", finger: "right-ring", row: "home" },
    Quote: { normal: "ข", shift: "ฑ", finger: "right-pinky", row: "home" },

    KeyZ: { normal: "บ", shift: "ฎ", finger: "left-pinky", row: "bottom" },
    KeyX: { normal: "ป", shift: "ฏ", finger: "left-ring", row: "bottom" },
    KeyC: { normal: "ล", shift: "ฐ", finger: "left-middle", row: "bottom" },
    KeyV: { normal: "ห", shift: "ภ", finger: "left-index", row: "bottom" },
    KeyB: { normal: "ิ", shift: "ั", finger: "left-index", row: "bottom" },
    KeyN: { normal: "ค", shift: "ศ", finger: "right-index", row: "bottom" },
    KeyM: { normal: "ส", shift: "ฮ", finger: "right-index", row: "bottom" },
    Comma: { normal: "ะ", shift: "ฟ", finger: "right-middle", row: "bottom" },
    Period: { normal: "จ", shift: "ฉ", finger: "right-ring", row: "bottom" },
    Slash: { normal: "พ", shift: "ฬ", finger: "right-pinky", row: "bottom" },

    Space: { normal: " ", shift: " ", finger: "right-index", row: "bottom" },
  },
};
