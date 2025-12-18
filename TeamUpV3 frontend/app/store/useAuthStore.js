// This file previously contained a zustand store which caused bundler issues when
// Expo treated it as a route. The canonical store implementation now lives at
// `../..\store\useAuthStore.js`. Keep a harmless default export here so the
// router doesn't attempt to import runtime modules from this path.

export default null;
