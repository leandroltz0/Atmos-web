# DESIGN

## Overview
ATMOS is a dark-only weather product with an editorial headline voice, premium glass surfaces, and restrained electric-blue accents. The interface should feel like a calm night instrument panel: atmospheric, legible, and deliberate.

## Color System

### Core Tokens
- Background primary: `#0D1B2A`
- Surface deep: `#1B3A5C`
- Accent: `#3A86FF`
- Info: `#48CAE4`
- Sun: `#FFD166`
- Text primary: `#FFFFFF`
- Text secondary: `#8BAEC8`
- Danger: `#EF4444`
- Success: `#10B981`

### Usage
- Use restrained color strategy by default.
- Accent blue marks primary actions, focused states, active indicators, and selected controls.
- Aqua and sun tones support weather-specific metadata and status.
- Surfaces should rely on transparent dark layers, soft borders, and subtle inner highlights instead of heavy shadows.

## Typography
- Display: `DM Serif Display` for large hero headings and premium editorial moments.
- UI and body: `Plus Jakarta Sans` for labels, controls, and content.
- Mono/data: `JetBrains Mono` for technical values or compact metadata when needed.

## Layout
- Mobile-first, with one primary action per viewport section.
- On desktop, use asymmetric split layouts when a surface benefits from context plus task completion.
- Prefer framed panels over repeated nested cards.
- Use large breathing space around hero text, but keep form and data interfaces structurally familiar.

## Components
- Angular Material is the component foundation.
- Text fields should be outlined, dark, and softly glassed.
- Primary buttons are high-contrast and confident.
- Secondary actions are outlined or low-emphasis glass buttons.
- Segmented controls should read clearly in dark mode and maintain visible active state.

## Motion
- Use short reveal and state transitions, around 180ms to 320ms.
- Favor opacity and transform changes.
- Preserve continuity between entry content blocks and actionable controls.

## Responsive
- Phone: stacked layout with the form first.
- Tablet: preserve hierarchy while reducing panel width and side density.
- Desktop: split-stage composition with task panel and contextual showcase panel.
