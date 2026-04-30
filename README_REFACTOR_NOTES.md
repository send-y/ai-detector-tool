# Refactor Notes

## What changed

- `App.js` was reduced to the application shell and top-level state orchestration.
- Firebase initialization was moved to `src/config/firebase.js`.
- Cloudinary and API URLs were moved to `src/config/cloudinary.js` and `src/config/api.js`.
- Authentication logic was moved to `src/hooks/useAuth.js` and `src/services/authService.js`.
- User analysis history loading was moved to `src/hooks/useUserAnalyses.js` and `src/services/analysisService.js`.
- Drag-and-drop analysis logic was moved to `src/hooks/useImageAnalysis.js`.
- UI was split into smaller components: `Header`, `UserMenu`, `AuthModal`, `LoginForm`, `RegisterForm`, `HistoryModal`, `LockOverlay`, `UploadDropArea`, `AnalysisResult`, `FeedbackModal`.
- Visual styles were not redesigned. Existing `index.css` was preserved, and the previous inline styles from `DragDropZone.jsx` were moved unchanged into `DragDropZone.styles.js`.

## Files removed from the React app

- `public/scripts/firebase.js`
- `public/scripts/dragDrop.js`
- `out/ai_metrics.csv`
- `out/dataset_metrics.csv`
- `out/real_metrics.csv`

These were either duplicated logic, old non-bundled scripts, or empty/generated CSV files that should not live in the frontend repository.

## Required local setup

Create `.env.local` from `.env.example` and fill Firebase/Cloudinary values before running the app.

## Still recommended

- Add frontend/API tests.
- Add backend/ML tests for feature extraction and prediction.
- Add README metrics: Accuracy, Precision, Recall, F1, ROC-AUC.
- Justify the classification threshold with ROC/PR analysis instead of only using `0.5`.
