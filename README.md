# AI Motion Studio — React + TypeScript foundation

## What is implemented
- Reference-inspired dark editing layout: left tools, center preview, right properties, bottom timeline.
- React + TypeScript + Vite app foundation.
- Remotion Player preview wired to a composition that renders editable text/caption elements.
- Project data model for scenes, tracks, and independently editable elements (video, image, text, audio, caption).
- Edit text, font size, color, animation, start frame and duration from the Properties panel.
- Add scenes and text elements.
- Auto-save project JSON in browser local storage.
- Open a saved project JSON and export the editable project JSON.

## Not implemented yet
- AI script/storyboard/video generation (AI button is a placeholder).
- Real video/image/audio file upload and decoding.
- Drag-and-drop timeline editing, waveform, transitions and B-roll playback.
- MP4 rendering/export. "Export project" exports editable JSON only.
- Cloud account, sync or database.

## Run locally
1. Install Node.js 20 or newer on a computer.
2. Unzip this folder.
3. In the project folder run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite.

For Android-only use, upload this ZIP to a GitHub repository and use a cloud development environment such as GitHub Codespaces if available on your account. A phone browser alone cannot run the Node build commands without a suitable cloud environment.

## Architecture
- `src/data/project.ts`: editable project schema and starter project.
- `src/theme.ts`: shared colors, fonts and motion defaults.
- `src/remotion/VideoComposition.tsx`: Remotion composition.
- `src/App.tsx`: editing UI, selection, properties, project persistence/import/export.
- `src/styles.css`: responsive UI styling.

## Next practical build step
Add media asset upload and a proper asset library, then implement timeline drag/resize and video/image/audio layers. After that, add a Remotion render service (server or supported cloud worker) for MP4 output.
