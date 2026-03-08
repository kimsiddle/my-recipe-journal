

## Plan: Add Google Sign-In

### What Changes

1. **Configure Social Auth** — Use the Configure Social Auth tool to generate the Lovable Cloud OAuth module (`src/integrations/lovable/`). This is managed automatically by Lovable Cloud, no API keys needed.

2. **Update AuthPage** — Replace the email/password form with a single "Sign in with Google" button that calls:
   ```typescript
   import { lovable } from "@/integrations/lovable/index";
   await lovable.auth.signInWithOAuth("google", {
     redirect_uri: window.location.origin,
   });
   ```

3. **Keep AuthContext as-is** — The existing `onAuthStateChange` listener already handles sessions from any auth method (email or OAuth). No changes needed there.

4. **Remove email/password form** — Since you only need Google login, the email/password fields, signup toggle, and `signUp`/`signIn` methods become unnecessary. The auth page becomes a simple branded page with one button.

### What Stays the Same
- `AuthGuard`, route protection, RLS policies, owner/guest logic — all unchanged
- The existing session management in `AuthContext` works with Google OAuth out of the box

