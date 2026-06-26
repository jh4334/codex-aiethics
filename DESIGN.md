# AI Ethics Adventure Design System

## 1. Atmosphere & Identity

AI Ethics Adventure feels like a classroom-safe retro RPG: dark stage framing, bright pixel characters, clear white text, and gentle status colors. The signature is "console clarity": every screen should feel like a readable game screen first, with teacher tools kept plain and dependable.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | --surface-primary | #000000 | #000000 | Game background and full-screen panels |
| Surface/panel | --surface-panel | #000000 | #000000 | Dialog, menu, dashboard, report panels |
| Surface/touch | --surface-touch | rgba(28,30,46,.55) | rgba(28,30,46,.55) | Mobile controls |
| Text/primary | --text-primary | #FFFFFF | #FFFFFF | Main UI text |
| Text/secondary | --text-secondary | #888888 | #888888 | Hints and secondary copy |
| Text/muted | --text-muted | #555555 | #555555 | Empty states and disabled details |
| Border/default | --border-default | #FFFFFF | #FFFFFF | Retro panel outlines |
| Accent/primary | --accent-primary | #E0453A | #E0453A | Cursor heart, danger, key highlights |
| Accent/warning | --accent-warning | #FFD644 | #FFD644 | Guidance and teacher export feedback |
| Status/success | --status-success | #55AA88 | #55AA88 | Completed or healthy learning state |
| Status/error | --status-error | #E0453A | #E0453A | Storage failure and destructive actions |

### Rules

- Use black surfaces with white outlines for core game panels.
- Use accent colors only to guide attention or state, not as decoration.
- Keep teacher/export states readable without relying on color alone.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Title | 40px | 700 | 1.15 | 0 | Title screen game name |
| Screen heading | 22px | 700 | 1.3 | 0 | Dashboard and report titles |
| Panel title | 17px | 700 | 1.35 | 0 | Menu and dialog headings |
| Body | 15px | 400 | 1.5 | 0 | Main canvas text |
| Body/sm | 13px | 400 | 1.45 | 0 | Slot and report detail |
| Caption | 12px | 400 | 1.4 | 0 | Key hints and secondary labels |

### Font Stack

- Primary: Malgun Gothic, Apple SD Gothic Neo, system sans-serif
- Mono: monospace, used intentionally for the retro game surface

### Rules

- Do not add text below 12px on canvas.
- If a line becomes dense enough to require 12px, prefer fewer words over smaller text.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a base of 4px.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Pixel nudges |
| --space-2 | 8px | Compact inner gaps |
| --space-3 | 12px | Hint spacing |
| --space-4 | 16px | Standard panel inset |
| --space-6 | 24px | Large panel inset |
| --space-8 | 32px | Screen section spacing |

### Grid

- Logical canvas: 720x528.
- Core gameplay viewport: 15x11 tiles at 48px per tile.
- Mobile controls live outside the logical canvas as fixed DOM controls.

### Rules

- Keep fixed-format canvas elements stable; changing text must not move gameplay controls.
- For mobile, leave safe-area margins around all fixed touch controls.

## 5. Components

### Retro Panel

- **Structure**: black fill, white border, slight corner radius.
- **Spacing**: 16px to 24px inner padding.
- **States**: selected rows use the red cursor heart or bright text.
- **Accessibility**: important canvas panels need DOM summary text in the accessibility status region.

### Touch Control

- **Structure**: fixed DOM button or stick, translucent dark fill, white border.
- **States**: active press scales slightly and increases contrast.
- **Accessibility**: each control has an ARIA label. Controls must remain large enough for tablets.

### Accessibility Status Region

- **Structure**: visually hidden DOM region with live status text.
- **Usage**: mirrors current mode, location, selected slot, and teacher/report surfaces.
- **Accessibility**: `aria-live="polite"` and concise text; avoid announcing every animation frame.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 40-100ms | ease | Touch press and quick UI feedback |
| Standard | 200-300ms | ease-in-out | Dialog/page-like transitions |
| Ambient | frame-based | linear | Star twinkle and sprite bob |

### Rules

- Respect the in-game reduce-effects setting.
- DOM motion must stay on transform and opacity.

## 7. Depth & Surface

### Strategy

Mixed, intentionally retro:

- Canvas panels use borders-only.
- Touch controls use translucent fill plus mild shadow for finger targeting.
- Avoid decorative gradients and unrelated background effects.
