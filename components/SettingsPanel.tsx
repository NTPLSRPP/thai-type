"use client";
import { useSettings } from "@/stores/settingsStore";
import { DEFAULT_SETTINGS } from "@/lib/storage/schema";
import type { Settings } from "@/lib/storage/schema";
import { layoutList } from "@/lib/layouts/registry";
import { FONT_OPTIONS } from "@/lib/theme/fonts";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { SettingRow } from "@/components/ui/SettingRow";
import { Segmented } from "@/components/ui/Segmented";
import { Toggle } from "@/components/ui/Toggle";
import { Slider } from "@/components/ui/Slider";
import { SelectControl } from "@/components/ui/SelectControl";

const LAYOUT_OPTIONS = layoutList().map((l) => ({ value: l.id, label: l.name }));
const FONT_SELECT_OPTIONS = FONT_OPTIONS.map((f) => ({ value: f.stack, label: f.label }));

type SettingsPanelProps = {
  mounted: boolean;
};

export function SettingsPanel({ mounted }: SettingsPanelProps) {
  const store = useSettings();
  const update = store.update;
  const reset = store.reset;

  // Before mount, read defaults so SSR and the first client render agree.
  const s: Settings = mounted ? store : DEFAULT_SETTINGS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <SettingsSection title="behavior & input">
        <SettingRow title="mode" description="time-based or fixed word count">
          <Segmented
            ariaLabel="test mode"
            value={s.mode}
            options={[
              { value: "time", label: "time" },
              { value: "words", label: "words" },
            ]}
            onChange={(v) => update({ mode: v })}
          />
        </SettingRow>
        <SettingRow title="duration" description="seconds per test (time mode)">
          <Segmented
            ariaLabel="duration"
            value={String(s.duration)}
            options={[
              { value: "15", label: "15" },
              { value: "30", label: "30" },
              { value: "60", label: "60" },
              { value: "120", label: "120" },
            ]}
            onChange={(v) => update({ duration: Number(v) })}
          />
        </SettingRow>
        <SettingRow title="word count" description="words per test (words mode)">
          <Segmented
            ariaLabel="word count"
            value={String(s.wordCount)}
            options={[
              { value: "10", label: "10" },
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
            ]}
            onChange={(v) => update({ wordCount: Number(v) })}
          />
        </SettingRow>
        <SettingRow title="input mode" description="remap keys in-app or use your OS Thai layout">
          <Segmented
            ariaLabel="input mode"
            value={s.inputMode}
            options={[
              { value: "app-remap", label: "app remap" },
              { value: "os-native", label: "os layout" },
            ]}
            onChange={(v) => update({ inputMode: v })}
          />
        </SettingRow>
        <SettingRow title="layout" description="Thai keyboard layout">
          <Segmented
            ariaLabel="layout"
            value={s.layoutId}
            options={LAYOUT_OPTIONS}
            onChange={(v) => update({ layoutId: v })}
          />
        </SettingRow>
        <SettingRow title="stop on error" description="block advancing until the wrong letter is fixed">
          <Segmented
            ariaLabel="stop on error"
            value={s.stopOnError}
            options={[
              { value: "off", label: "off" },
              { value: "letter", label: "letter" },
            ]}
            onChange={(v) => update({ stopOnError: v })}
          />
        </SettingRow>
        <SettingRow title="confidence mode" description="disable backspace — no fixing mistakes">
          <Toggle ariaLabel="confidence mode" checked={s.noBackspace} onChange={(v) => update({ noBackspace: v })} />
        </SettingRow>
        <SettingRow title="blind mode" description="hide per-character correctness while typing">
          <Toggle ariaLabel="blind mode" checked={s.blindMode} onChange={(v) => update({ blindMode: v })} />
        </SettingRow>
        <SettingRow title="quick restart" description="key that restarts the test">
          <Segmented
            ariaLabel="quick restart"
            value={s.quickRestart}
            options={[
              { value: "off", label: "off" },
              { value: "tab", label: "tab" },
              { value: "esc", label: "esc" },
            ]}
            onChange={(v) => update({ quickRestart: v })}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="appearance">
        <SettingRow title="caret style" description="shape of the typing cursor">
          <Segmented
            ariaLabel="caret style"
            value={s.caretStyle}
            options={[
              { value: "off", label: "off" },
              { value: "line", label: "line" },
              { value: "block", label: "block" },
              { value: "underline", label: "underline" },
            ]}
            onChange={(v) => update({ caretStyle: v })}
          />
        </SettingRow>
        <SettingRow title="smooth caret" description="animate the caret between characters">
          <Toggle ariaLabel="smooth caret" checked={s.smoothCaret} onChange={(v) => update({ smoothCaret: v })} />
        </SettingRow>
        <SettingRow title="live speed" description="show live wpm while typing">
          <Toggle ariaLabel="live speed" checked={s.liveSpeed} onChange={(v) => update({ liveSpeed: v })} />
        </SettingRow>
        <SettingRow title="live accuracy" description="show live accuracy while typing">
          <Toggle ariaLabel="live accuracy" checked={s.liveAccuracy} onChange={(v) => update({ liveAccuracy: v })} />
        </SettingRow>
        <SettingRow title="font size" description="typing text size in pixels">
          <Slider
            ariaLabel="font size"
            value={s.fontSize}
            min={16}
            max={56}
            step={2}
            onChange={(v) => update({ fontSize: v })}
          />
        </SettingRow>
        <SettingRow title="typing font" description="font family for the typing area">
          <SelectControl
            ariaLabel="typing font"
            value={s.typingFont}
            options={FONT_SELECT_OPTIONS}
            onChange={(v) => update({ typingFont: v })}
          />
        </SettingRow>
        <SettingRow title="page width" description="content width of the app">
          <Segmented
            ariaLabel="page width"
            value={s.pageWidth}
            options={[
              { value: "narrow", label: "narrow" },
              { value: "normal", label: "normal" },
              { value: "wide", label: "wide" },
            ]}
            onChange={(v) => update({ pageWidth: v })}
          />
        </SettingRow>
        <SettingRow title="timer style" description="how time-mode progress is shown">
          <Segmented
            ariaLabel="timer style"
            value={s.timerStyle}
            options={[
              { value: "text", label: "text" },
              { value: "bar", label: "bar" },
            ]}
            onChange={(v) => update({ timerStyle: v })}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="on-screen keyboard">
        <SettingRow title="show keyboard" description="display the on-screen keyboard">
          <Toggle ariaLabel="show keyboard" checked={s.showKeyboard} onChange={(v) => update({ showKeyboard: v })} />
        </SettingRow>
        <SettingRow title="keyboard size" description="size of the on-screen keys">
          <Segmented
            ariaLabel="keyboard size"
            value={s.keyboardSize}
            options={[
              { value: "small", label: "small" },
              { value: "medium", label: "medium" },
              { value: "large", label: "large" },
            ]}
            onChange={(v) => update({ keyboardSize: v })}
          />
        </SettingRow>
        <SettingRow title="shift legend" description="show shifted characters on each key">
          <Toggle ariaLabel="shift legend" checked={s.showShiftLegend} onChange={(v) => update({ showShiftLegend: v })} />
        </SettingRow>
        <SettingRow title="finger colors" description="color keys by finger zone">
          <Toggle ariaLabel="finger colors" checked={s.fingerColors} onChange={(v) => update({ fingerColors: v })} />
        </SettingRow>
        <SettingRow title="next key hint" description="highlight the next key to press">
          <Toggle ariaLabel="next key hint" checked={s.nextKeyHint} onChange={(v) => update({ nextKeyHint: v })} />
        </SettingRow>
        <SettingRow title="heatmap" description="shade keys by error frequency">
          <Toggle ariaLabel="heatmap" checked={s.heatmap} onChange={(v) => update({ heatmap: v })} />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="sound">
        <SettingRow title="click sound" description="play a sound on each keypress">
          <Toggle ariaLabel="click sound" checked={s.clickSound} onChange={(v) => update({ clickSound: v })} />
        </SettingRow>
        <SettingRow title="error sound" description="play a sound on each mistake">
          <Toggle ariaLabel="error sound" checked={s.errorSound} onChange={(v) => update({ errorSound: v })} />
        </SettingRow>
        <SettingRow title="volume" description="sound effect volume">
          <Slider
            ariaLabel="volume"
            value={s.soundVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => update({ soundVolume: v })}
          />
        </SettingRow>
      </SettingsSection>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="tt-btn"
          data-testid="reset-settings"
          onClick={() => reset()}
          style={{ color: "var(--error)", borderColor: "var(--error)" }}
        >
          reset to defaults
        </button>
      </div>
    </div>
  );
}
