Run & Verify (quick)

To start the app with a cleared cache and verify the new tabs layout:

```bash
npx expo start -c
```

Open the app in Expo Go or a simulator and the app will redirect to the Teams tab. Use the Sign Up / Sign In flow to reach the setup screens and complete the profile: the final action will navigate into the tabs layout.

If you see a blank screen after navigation, restart the Metro bundler with `npx expo start -c` and check the debugger console for errors.
