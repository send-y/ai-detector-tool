# LANDER AI Detector Tool

React frontend for uploading images, sending them to the LANDER backend, and
storing user analysis history in Firebase/Cloudinary.

## Local Setup

```powershell
npm install
Copy-Item .env.example .env
npm start
```

By default the app expects the backend at:

```text
http://localhost:5000/api/analyze
```

## Environment

Copy `.env.example` to `.env` and set:

- `REACT_APP_API_URL`: backend `/api/analyze` endpoint.
- `REACT_APP_MAX_UPLOAD_MB`: frontend upload limit, should match backend `MAX_UPLOAD_MB`.
- `REACT_APP_FIREBASE_*`: Firebase web app config.
- `REACT_APP_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`: unsigned upload preset.

## Backend Auth

When the backend uses `REQUIRE_FIREBASE_AUTH=1`, this frontend sends the current
Firebase ID token in:

```http
Authorization: Bearer <firebase-id-token>
```

## Production Notes

- Restrict Cloudinary unsigned upload presets by file type, max file size, and
  upload folder.
- Add Firestore security rules for `users/{uid}/analyses` and
  `analysis_results`.
- Keep ML artifacts out of the frontend repository.
- Keep frontend and backend upload limits in sync.
