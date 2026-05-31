import type { Layout } from "./types";

// Manoonchai (มนูญชัย) layout — modern, data-driven Thai layout.
// Source: official kiimo repo input/Manoonchai.json (Manoonchai/kiimo), v1.0 keymap.
// Each key's [Base, Shift] become normal/shift. Number row is Arabic digits by design
// (no Thai letters on the number row). Finger/row assignments are positional, matching
// kedmanee.ts per physical code.
export const manoonchai: Layout = {
  id: "manoonchai",
  name: "Manoonchai",
  keys: {
    Backquote: { normal: "`", shift: "~", finger: "left-pinky", row: "number" },
    Digit1: { normal: "1", shift: "!", finger: "left-pinky", row: "number" },
    Digit2: { normal: "2", shift: "@", finger: "left-ring", row: "number" },
    Digit3: { normal: "3", shift: "#", finger: "left-middle", row: "number" },
    Digit4: { normal: "4", shift: "$", finger: "left-index", row: "number" },
    Digit5: { normal: "5", shift: "%", finger: "left-index", row: "number" },
    Digit6: { normal: "6", shift: "^", finger: "right-index", row: "number" },
    Digit7: { normal: "7", shift: "&", finger: "right-index", row: "number" },
    Digit8: { normal: "8", shift: "*", finger: "right-middle", row: "number" },
    Digit9: { normal: "9", shift: "(", finger: "right-ring", row: "number" },
    Digit0: { normal: "0", shift: ")", finger: "right-pinky", row: "number" },
    Minus: { normal: "-", shift: "_", finger: "right-pinky", row: "number" },
    Equal: { normal: "=", shift: "+", finger: "right-pinky", row: "number" },

    KeyQ: { normal: "ใ", shift: "ฒ", finger: "left-pinky", row: "top" },
    KeyW: { normal: "ต", shift: "ฏ", finger: "left-ring", row: "top" },
    KeyE: { normal: "ห", shift: "ซ", finger: "left-middle", row: "top" },
    KeyR: { normal: "ล", shift: "ญ", finger: "left-index", row: "top" },
    KeyT: { normal: "ส", shift: "ฟ", finger: "left-index", row: "top" },
    KeyY: { normal: "ป", shift: "ฉ", finger: "right-index", row: "top" },
    KeyU: { normal: "ั", shift: "ึ", finger: "right-index", row: "top" },
    KeyI: { normal: "ก", shift: "ธ", finger: "right-middle", row: "top" },
    KeyO: { normal: "ิ", shift: "ฐ", finger: "right-ring", row: "top" },
    KeyP: { normal: "บ", shift: "ฎ", finger: "right-pinky", row: "top" },
    BracketLeft: { normal: "็", shift: "ฆ", finger: "right-pinky", row: "top" },
    BracketRight: { normal: "ฬ", shift: "ฑ", finger: "right-pinky", row: "top" },
    Backslash: { normal: "ฯ", shift: "ฌ", finger: "right-pinky", row: "top" },

    KeyA: { normal: "ง", shift: "ษ", finger: "left-pinky", row: "home" },
    KeyS: { normal: "เ", shift: "ถ", finger: "left-ring", row: "home" },
    KeyD: { normal: "ร", shift: "แ", finger: "left-middle", row: "home" },
    KeyF: { normal: "น", shift: "ช", finger: "left-index", row: "home" },
    KeyG: { normal: "ม", shift: "พ", finger: "left-index", row: "home" },
    KeyH: { normal: "อ", shift: "ผ", finger: "right-index", row: "home" },
    KeyJ: { normal: "า", shift: "ำ", finger: "right-index", row: "home" },
    KeyK: { normal: "่", shift: "ข", finger: "right-middle", row: "home" },
    KeyL: { normal: "้", shift: "โ", finger: "right-ring", row: "home" },
    Semicolon: { normal: "ว", shift: "ภ", finger: "right-ring", row: "home" },
    Quote: { normal: "ื", shift: "\"", finger: "right-pinky", row: "home" },

    KeyZ: { normal: "ุ", shift: "ฤ", finger: "left-pinky", row: "bottom" },
    KeyX: { normal: "ไ", shift: "ฝ", finger: "left-ring", row: "bottom" },
    KeyC: { normal: "ท", shift: "ๆ", finger: "left-middle", row: "bottom" },
    KeyV: { normal: "ย", shift: "ณ", finger: "left-index", row: "bottom" },
    KeyB: { normal: "จ", shift: "๊", finger: "left-index", row: "bottom" },
    KeyN: { normal: "ค", shift: "๋", finger: "right-index", row: "bottom" },
    KeyM: { normal: "ี", shift: "์", finger: "right-index", row: "bottom" },
    Comma: { normal: "ด", shift: "ศ", finger: "right-middle", row: "bottom" },
    Period: { normal: "ะ", shift: "ฮ", finger: "right-ring", row: "bottom" },
    Slash: { normal: "ู", shift: "?", finger: "right-pinky", row: "bottom" },

    Space: { normal: " ", shift: " ", finger: "right-index", row: "bottom" },
  },
};
