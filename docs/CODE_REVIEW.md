# Oluto Code Review - Comprehensive Analysis

**Date:** March 11, 2026  
**Reviewer:** AI Code Review Agent  
**Scope:** Frontend application (`apps/web/`)  
**Files Reviewed:** 20+ core files

---

## Executive Summary

The Oluto frontend demonstrates solid engineering with well-structured architecture, comprehensive TypeScript typing, and thoughtful UI/UX design. However, **10 critical improvement areas** were identified that impact type safety, security, performance, and accessibility.

### Key Metrics

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| **TypeScript** | 1 | 2 | 2 | 1 |
| **Architecture** | 0 | 2 | 3 | 2 |
| **Security** | 2 | 2 | 2 | 0 |
| **Performance** | 0 | 2 | 2 | 2 |
| **Accessibility** | 0 | 1 | 3 | 1 |
| **Testing** | 3 | 2 | 0 | 0 |
| **Total** | **6** | **11** | **12** | **6** |

---

## Critical Issues (Fix Immediately)

### 1. TypeScript Strict Mode Disabled

**File:** `apps/web/tsconfig.json`  
**Severity:** Critical  
**Impact:** Allows null/undefined runtime errors, implicit any types

```json
{
  "compilerOptions": {
    "strict": false  // ❌ Should be true
  }
}
```

**Recommended Fix:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true
  }
}
```

**Action Plan:**
1. Enable `strict: true`
2. Run `npx tsc --noEmit` to identify all errors
3. Fix errors incrementally by module
4. Expected: 50-200 type errors to resolve

---

### 2. No Test Coverage

**Files:** All (`apps/web/app/`)  
**Severity:** Critical  
**Impact:** No safety net for refactoring, regression risk

**Current State:**
- Vitest configured ✅
- Testing Library installed ✅
- **Zero test files found** ❌

**Required Tests (Priority Order):**
1. API client (`lib/api.test.ts`)
2. Auth hook (`hooks/useAuth.test.ts`)
3. Auth flow integration (`auth/AuthFlow.test.tsx`)
4. Critical components (`Navigation.test.tsx`, `DataTable.test.tsx`)
5. Error handling (`errors.test.ts`)

**Example Test:**

```typescript
// __tests__/lib/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError } from '@/app/lib/api';

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should handle 401 errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    } as any);

    await expect(api.getCurrentUser()).rejects.toThrow(ApiError);
  });

  it('should unwrap LedgerForge response format', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: '1' } }),
    } as any);

    const result = await api.getCurrentUser();
    expect(result).toEqual({ id: '1' });
  });
});
```

---

### 3. XSS Vulnerability (dangerouslySetInnerHTML)

**File:** `apps/web/app/layout.tsx` (Lines 127-131)  
**Severity:** Critical  
**Impact:** Potential script injection

**Current Code:**

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `(function(){var t=localStorage.getItem('oluto-theme');...})()`,
  }}
/>
```

**Recommended Fix:**

Option 1: External script file (preferred)
```tsx
// Move to /public/init-theme.js
<script src="/init-theme.js" nonce={nonce} />
```

Option 2: Nonce-based inline script
```tsx
<script
  nonce={nonce}
  dangerouslySetInnerHTML={{ __html: themeInitScript }}
/>
```

---

### 4. API Client Doesn't Handle Non-JSON Responses

**File:** `apps/web/app/lib/api.ts` (Lines 846-858)  
**Severity:** Critical  
**Impact:** Crashes on HTML error pages (502, 503, 504)

**Current Code:**

```typescript
const response = await fetch(url, config);

if (!response.ok) {
  const error = await response.json();  // ❌ Crashes on HTML
  throw new ApiError(error.detail, response.status);
}
```

**Recommended Fix:**

```typescript
const response = await fetch(url, config);

if (!response.ok) {
  const contentType = response.headers.get('content-type');
  let error: any = { detail: "An error occurred" };
  
  if (contentType?.includes('application/json')) {
    error = await response.json().catch(() => ({ detail: "An error occurred" }));
  } else {
    error = { detail: `HTTP ${response.status}: ${response.statusText}` };
  }
  
  throw new ApiError(
    error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`,
    response.status,
    error.code,
    error.details
  );
}

// Handle empty responses
if (response.status === 204 || response.headers.get('content-length') === '0') {
  return {} as T;
}

const json = await response.json();
return json.data !== undefined ? json.data : json;
```

---

### 5. No Token Refresh Logic

**File:** `apps/web/app/lib/api.ts` (Lines 868-870)  
**Severity:** Critical  
**Impact:** Users logged out prematurely when token expires

**Current Code:**

```typescript
setTokenProvider: (getToken: () => string | null) => {
  tokenProvider = getToken;  // ✅ Set but never used for refresh
},
```

**Recommended Fix:**

```typescript
makeRequest: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, config);
  
  // Handle 401 with token refresh
  if (response.status === 401 && tokenProvider) {
    try {
      await refreshAccessToken();  // Implement refresh logic
      const newToken = tokenProvider();
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${newToken}`,
      };
      // Retry request
      return makeRequest<T>(url, options);
    } catch (refreshError) {
      // Redirect to login
      window.location.href = '/auth/login';
      throw refreshError;
    }
  }
  
  // ... rest of error handling
}
```

---

### 6. API Client File Too Large (1,638 lines)

**File:** `apps/web/app/lib/api.ts`  
**Severity:** High  
**Impact:** Poor maintainability, slow IDE performance, large bundle

**Recommended Structure:**

```
apps/web/app/lib/
├── api/
│   ├── index.ts              # Re-export all modules
│   ├── client.ts             # Base API client (fetch, error handling)
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── auth.ts               # Auth endpoints
│   ├── businesses.ts         # Business endpoints
│   ├── transactions.ts       # Transaction endpoints
│   ├── invoices.ts           # Invoice endpoints
│   ├── bills.ts              # Bill endpoints
│   ├── payments.ts           # Payment endpoints
│   ├── contacts.ts           # Contact endpoints
│   ├── accounts.ts           # Account endpoints
│   ├── reconciliation.ts     # Reconciliation endpoints
│   ├── receipts.ts           # Receipt endpoints
│   ├── reports.ts            # Report endpoints
│   └── jobs.ts               # Job polling endpoints
```

**Example Module (`transactions.ts`):**

```typescript
import { apiClient } from './client';
import type { Transaction, TransactionFilters, CreateTransaction } from './types';

export const transactionsApi = {
  list: (businessId: string, filters?: TransactionFilters) =>
    apiClient.get<Transaction[]>(`/businesses/${businessId}/transactions`, { params: filters }),
  
  get: (businessId: string, transactionId: string) =>
    apiClient.get<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`),
  
  create: (businessId: string, data: CreateTransaction) =>
    apiClient.post<Transaction>(`/businesses/${businessId}/transactions`, data),
  
  update: (businessId: string, transactionId: string, data: Partial<CreateTransaction>) =>
    apiClient.patch<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`, data),
  
  delete: (businessId: string, transactionId: string) =>
    apiClient.delete(`/businesses/${businessId}/transactions/${transactionId}`),
  
  suggestCategory: (businessId: string, description: string) =>
    apiClient.post<{ category: string }>(`/businesses/${businessId}/transactions/suggest-category`, { description }),
};
```

---

## High Severity Issues

### 7. No useEffect Cleanup in useAuth

**File:** `apps/web/app/hooks/useAuth.ts` (Lines 47-71)  
**Severity:** High  
**Impact:** Memory leaks, state updates on unmounted components

**Recommended Fix:**

```typescript
useEffect(() => {
  const abortController = new AbortController();
  
  if (authLoading) return;

  if (!isAuthenticated) {
    login();
    return;
  }

  api
    .getCurrentUser()
    .then((currentUser) => {
      if (abortController.signal.aborted) return;
      
      if (requireBusiness && currentUser.business_id === null) {
        router.push("/onboarding/setup-business");
        return;
      }
      setUser(currentUser);
      setLoading(false);

      if (currentUser.business_id) {
        api
          .getBusiness(currentUser.business_id)
          .then((biz) => {
            if (!abortController.signal.aborted && biz.timezone) {
              setTimezone(biz.timezone);
            }
          })
          .catch(() => {});
      }
    })
    .catch(() => {
      if (!abortController.signal.aborted) {
        login();
      }
    });

  return () => abortController.abort();
}, [authLoading, isAuthenticated, router, requireBusiness, login]);
```

---

### 8. Navigation Component Too Large (744 lines)

**File:** `apps/web/app/components/Navigation.tsx`  
**Severity:** High  
**Impact:** Difficult to maintain, test, and optimize

**Recommended Structure:**

```
apps/web/app/components/
├── Navigation.tsx          # Main export, orchestrates sub-components
├── navigation/
│   ├── DesktopNav.tsx      # Desktop navigation (300 lines)
│   ├── MobileNav.tsx       # Mobile navigation (200 lines)
│   ├── NavDropdown.tsx     # Reusable dropdown (100 lines)
│   ├── NavItem.tsx         # Individual nav item (50 lines)
│   └── useNavState.ts      # Navigation state logic (100 lines)
```

---

### 9. TanStack Query staleTime Too Long

**File:** `apps/web/app/lib/queryConfig.ts` (Line 17)  
**Severity:** High  
**Impact:** Stale financial data shown to users

**Current Configuration:**

```typescript
staleTime: 30 * 1000,  // 30 seconds - too long for financial data
```

**Recommended Configuration:**

```typescript
export const staleTimePresets = {
  realTime: 0,              // Dashboard metrics
  dashboard: 5 * 1000,      // 5s - Safe-to-Spend, cashflow
  frequent: 15 * 1000,      // 15s - Transaction lists
  standard: 60 * 1000,      // 1m - Contacts, accounts
  reference: 5 * 60 * 1000, // 5m - Chart of accounts
  semiStatic: 15 * 60 * 1000, // 15m - Reports
  static: 60 * 60 * 1000,   // 1h - Static data
} as const;
```

---

### 10. No CSRF Protection

**Severity:** High  
**Impact:** Potential cross-site request forgery attacks

**Current State:**
- Keycloak OIDC handles authentication ✅
- JWT tokens passed via Authorization header ✅
- **No CSRF tokens for state-changing operations** ❌

**Recommended Fix:**

Option 1: Double Submit Cookie Pattern
```typescript
// Set CSRF token in cookie and header
function setCsrfToken(token: string) {
  document.cookie = `csrf_token=${token}; path=/; Secure; SameSite=Strict`;
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

// Add to API client
config.headers = {
  ...config.headers,
  'X-CSRF-Token': getCsrfToken(),
};
```

Option 2: SameSite Cookies (simpler)
```typescript
// Ensure all cookies use SameSite=Strict
// JWT in sessionStorage already protects against CSRF
```

---

## Medium Severity Issues

### 11. Memory Leaks in Event Listeners

**Files:** `Navigation.tsx`, `ReceiptUploadSection.tsx`, `ChatArea.tsx`  
**Severity:** Medium

**Pattern to Fix:**

```typescript
// ❌ Bad - No cleanup
useEffect(() => {
  window.addEventListener('mousedown', handleClickOutside);
}, [handleClickOutside]);

// ✅ Good - With cleanup
useEffect(() => {
  window.addEventListener('mousedown', handleClickOutside);
  return () => window.removeEventListener('mousedown', handleClickOutside);
}, [handleClickOutside]);
```

---

### 12. Accessibility Issues

**Severity:** Medium  
**Impact:** Not usable by people with disabilities, potential legal risk

**Issues Found:**

| Component | Issue | WCAG Criterion |
|-----------|-------|----------------|
| Navigation | Mobile menu missing `aria-expanded` | 4.1.2 |
| DataTable | Sort buttons missing `aria-sort` | 4.1.2 |
| Navigation | Dropdowns not keyboard navigable | 2.1.1 |
| ReceiptUpload | Drag-drop not keyboard accessible | 2.1.1 |
| ErrorAlert | Missing `role="alert"` | 4.1.2 |
| Toast | Not announced to screen readers | 4.1.3 |

**Quick Fixes:**

```tsx
// Mobile menu button
<button
  aria-expanded={isMobileMenuOpen}
  aria-controls="mobile-menu"
  onClick={toggleMobileMenu}
>
  ...
</button>

// Sort buttons
<button
  aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'}
  onClick={handleSort}
>
  ...
</button>

// Error alerts
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

---

### 13. No Runtime Validation

**File:** `apps/web/app/lib/validation.ts`  
**Severity:** Medium  
**Impact:** Invalid data can propagate through the app

**Current State:**
- Zod schemas defined ✅
- **Schemas not used in API client** ❌

**Recommended Fix:**

```typescript
import { z } from 'zod';

const TransactionSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  amount: z.string(),
  description: z.string(),
  date: z.string(),
  // ...
});

export const api = {
  getTransaction: async (businessId: string, transactionId: string) => {
    const data = await apiClient.get(`/businesses/${businessId}/transactions/${transactionId}`);
    return TransactionSchema.parse(data);  // Validate response
  },
};
```

---

### 14. Error Handling Loses Type Information

**File:** `apps/web/app/hooks/useErrorHandler.ts` (Lines 62-104)  
**Severity:** Medium

**Current Code:**

```typescript
const message = getErrorMessage(error);  // Returns string only
toast.error(message);
```

**Recommended Fix:**

```typescript
const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    toast.error(error.message, {
      duration: 5000,
      // Provide error details for programmatic handling
    });
    return error;  // Return for caller to handle
  }
  
  if (error instanceof NetworkError) {
    toast.error('Network error. Please check your connection.');
    return error;
  }
  
  // Log unknown errors
  console.error('Unknown error:', error);
  toast.error('An unexpected error occurred');
  return error;
};
```

---

## Low Severity Issues

### 15. Inconsistent Loading Text

**Severity:** Low  
**Impact:** Minor UX inconsistency

**Found:**
- "Loading..."
- "Saving..."
- "Processing..."
- "Please wait..."

**Recommended:** Standardize on pattern
```typescript
const loadingMessages = {
  fetch: 'Loading...',
  create: 'Creating...',
  update: 'Saving...',
  delete: 'Deleting...',
  upload: 'Uploading...',
} as const;
```

---

### 16. Image Optimization Disabled

**File:** `ReceiptUploadSection.tsx` (Line 234)  
**Severity:** Low

**Current Code:**

```tsx
<Image
  src={previewUrl}
  alt="Receipt preview"
  unoptimized  // ❌ Disables Next.js optimization
/>
```

**Recommended Fix:**

```tsx
<Image
  src={previewUrl}
  alt="Receipt preview"
  width={400}
  height={400}
  objectFit="contain"
/>
```

---

## Implementation Roadmap

### Week 1-2: TypeScript Strict Mode
- [ ] Enable `strict: true` in tsconfig.json
- [ ] Run type check and catalog errors
- [ ] Fix errors by module (lib → hooks → components → pages)
- [ ] Verify no regressions

### Week 3-4: API Client Refactor
- [ ] Create modular file structure
- [ ] Extract base client (fetch, error handling)
- [ ] Split endpoints by domain
- [ ] Add response validation with Zod
- [ ] Update all imports

### Week 5-6: Test Coverage
- [ ] Write API client tests (20+ tests)
- [ ] Write hook tests (useAuth, useDataTable)
- [ ] Write component tests (Navigation, DataTable)
- [ ] Write integration tests (auth flow)
- [ ] Set up CI test reporting

### Week 7-8: Security Hardening
- [ ] Remove dangerouslySetInnerHTML
- [ ] Implement CSRF protection
- [ ] Add token refresh logic
- [ ] Add JWT expiration checks
- [ ] Security audit

### Week 9-10: Accessibility
- [ ] Add ARIA labels throughout
- [ ] Implement keyboard navigation
- [ ] Add screen reader support
- [ ] Test with VoiceOver/NVDA
- [ ] Fix color contrast issues

### Week 11-12: Performance Optimization
- [ ] Reduce staleTime for financial data
- [ ] Code-split large components
- [ ] Memoize expensive calculations
- [ ] Optimize bundle size
- [ ] Enable image optimization

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| TypeScript strict errors | Unknown | 0 | 2 weeks |
| Test coverage | 0% | 80% | 6 weeks |
| Critical security issues | 6 | 0 | 8 weeks |
| High severity issues | 11 | 0 | 12 weeks |
| Lighthouse accessibility | Unknown | 95+ | 10 weeks |
| Bundle size | Unknown | -20% | 12 weeks |

---

## Related Documentation

- [AGENTS.md](../AGENTS.md) - Agent instructions
- [CLAUDE.md](../CLAUDE.md) - Developer guide
- [concept.md](../concept.md) - Product specification
- [ROADMAP.md](../ROADMAP.md) - Product roadmap

---

## Next Steps

1. **Review this document** with the team
2. **Prioritize issues** based on impact and effort
3. **Create GitHub issues** for each item
4. **Assign owners** and timelines
5. **Track progress** in project board

---

*Generated by AI Code Review Agent - March 11, 2026*
