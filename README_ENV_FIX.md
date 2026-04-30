# Env setup

If the screen is black and the console shows `Firebase: Error (auth/invalid-api-key)`, React did not load Firebase values.

For local run this archive includes `.env.local` with the previous project values. If you create the project manually, put `.env.local` in the project root, next to `package.json`, and restart `npm start`.

Do not commit `.env.local` to GitHub. Use `.env.example` as the public template.
