# Sprint 2: Stricter TypeScript

**Duration:** 1-2 weeks  
**Priority:** Medium  
**Goal:** Enable full TypeScript strict mode for better type safety

---

## 📋 Issues

### Week 1: TypeScript Configuration & Fixes

#### Issue #14: Enable `noImplicitAny: true`
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Enable `noImplicitAny` in tsconfig.json to catch implicit `any` types at compile time.

**Acceptance Criteria:**
- [ ] `noImplicitAny: true` in tsconfig.json
- [ ] All implicit `any` errors fixed
- [ ] Build passes with zero errors
- [ ] No runtime regressions

**Files:**
- `apps/web/tsconfig.json`
- All files with implicit `any` types

**Implementation:**
```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

---

#### Issue #15: Fix all implicit `any` errors
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 8h

**Description:**
Add explicit type annotations to all variables, parameters, and return types that currently have implicit `any`.

**Common Patterns to Fix:**
- Function parameters without types
- Callback parameters
- Object destructuring
- Array methods (map, filter, reduce)
- Event handlers

**Files:** TBD (run `npx tsc --noImplicitAny` to find all)

**Acceptance Criteria:**
- [ ] Zero implicit `any` errors
- [ ] All types properly annotated
- [ ] Code review approved

---

#### Issue #16: Enable `strictNullChecks: true`
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Enable `strictNullChecks` to catch null/undefined errors at compile time.

**Acceptance Criteria:**
- [ ] `strictNullChecks: true` in tsconfig.json
- [ ] All null/undefined errors fixed
- [ ] Proper optional chaining used where appropriate
- [ ] Build passes with zero errors

**Files:**
- `apps/web/tsconfig.json`
- All files with null/undefined issues

**Implementation:**
```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

---

#### Issue #17: Fix all null/undefined errors
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 12h

**Description:**
Add proper null checks, optional chaining, and non-null assertions where appropriate.

**Common Patterns to Fix:**
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Type guards
- Non-null assertions (`!`) - use sparingly
- Default values

**Files:** TBD (run `npx tsc --strictNullChecks` to find all)

**Acceptance Criteria:**
- [ ] Zero null/undefined errors
- [ ] Proper null handling throughout codebase
- [ ] No unnecessary non-null assertions
- [ ] Code review approved

---

#### Issue #18: Enable `strictFunctionTypes: true`
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Enable `strictFunctionTypes` for stricter function type checking.

**Acceptance Criteria:**
- [ ] `strictFunctionTypes: true` in tsconfig.json
- [ ] All function type errors fixed
- [ ] Build passes with zero errors

**Files:**
- `apps/web/tsconfig.json`
- Callback and function type definitions

---

#### Issue #19: Fix function type errors
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Fix function parameter and return type mismatches.

**Acceptance Criteria:**
- [ ] All function types match their implementations
- [ ] Callback signatures are correct
- [ ] Zero function type errors

---

#### Issue #20: Enable `strictPropertyInitialization: true`
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Enable `strictPropertyInitialization` to ensure class properties are initialized.

**Acceptance Criteria:**
- [ ] `strictPropertyInitialization: true` in tsconfig.json
- [ ] All class properties initialized
- [ ] Build passes with zero errors

---

#### Issue #21: Fix class property initialization
**Labels:** `typescript`, `enhancement`, `sprint-2`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Initialize all class properties or mark them as optional/definitely assigned.

**Acceptance Criteria:**
- [ ] All class properties properly initialized
- [ ] Use `!` assertion only when definitely assigned
- [ ] Zero property initialization errors

---

### Week 2: Advanced Type Safety (Optional)

#### Issue #22: Add Zod runtime validation schemas
**Labels:** `typescript`, `validation`, `sprint-2`, `optional`  
**Assignee:** TBD  
**Estimate:** 8h

**Description:**
Add Zod schemas for runtime validation of API responses.

**Acceptance Criteria:**
- [ ] Zod schemas for all API response types
- [ ] Validation on API client
- [ ] Better error messages for malformed data

---

#### Issue #23: Add custom type guards
**Labels:** `typescript`, `enhancement`, `sprint-2`, `optional`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Create reusable type guards for complex type checks.

**Acceptance Criteria:**
- [ ] Type guards for common patterns
- [ ] Exported from `lib/types.ts`
- [ ] Used throughout codebase

---

#### Issue #24: Document type patterns
**Labels:** `documentation`, `typescript`, `sprint-2`, `optional`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Create documentation for TypeScript patterns and best practices.

**Acceptance Criteria:**
- [ ] Type patterns documented
- [ ] Examples provided
- [ ] Best practices guide

---

## 📊 Sprint 2 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **TypeScript Strict** | Partial | Full | ⏳ |
| **noImplicitAny** | false | true | ⏳ |
| **strictNullChecks** | false | true | ⏳ |
| **strictFunctionTypes** | false | true | ⏳ |
| **Implicit Any Errors** | TBD | 0 | ⏳ |
| **Null/Undefined Errors** | TBD | 0 | ⏳ |

---

## 🚀 Getting Started

1. **Copy issues** to GitHub
2. **Add labels:** `typescript`, `enhancement`, `sprint-2`
3. **Add to milestone:** "Sprint 2 - Stricter TypeScript"
4. **Start with Issue #14** (enable noImplicitAny)

---

**Created:** March 12, 2026  
**Sprint Duration:** 1-2 weeks  
**Total Issues:** 11 (8 required + 3 optional)  
**Total Effort:** ~50 hours
