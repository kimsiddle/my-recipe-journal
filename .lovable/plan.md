

## Plan: Email Allowlist for Sign-In Restriction

Add a simple email allowlist that controls who can sign in. Anyone not on the list gets rejected with a friendly message.

### Approach

1. **Create a config file** (`src/config/allowedUsers.ts`) with an array of allowed email addresses. This is the single place to edit later.

2. **Update `AuthPage.tsx`** to check the signed-in user's email against the allowlist after Google OAuth completes. If not allowed, sign them out immediately and show an error toast.

3. **Update `AuthContext.tsx`** to also check on session restore (e.g. page refresh) — if a disallowed user somehow has a session, sign them out.

### Config file example

```typescript
// src/config/allowedUsers.ts
export const ALLOWED_EMAILS = [
  "your-email@gmail.com",
  // Add more emails here
];
```

### Flow
- User clicks "Sign in with Google" → OAuth completes → email checked against allowlist → if not allowed, auto sign-out + toast error "Access restricted"
- To allow a new user later: just add their email to the array

### Files changed
- **New**: `src/config/allowedUsers.ts`
- **Edit**: `src/context/AuthContext.tsx` — check allowlist on session change
- **Edit**: `src/pages/AuthPage.tsx` — post-login check + error message

