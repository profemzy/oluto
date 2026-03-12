# Sprint 1: Accessibility & Testing Foundation

**Duration:** 2 weeks  
**Priority:** High  
**Goal:** Improve accessibility score to 95%+ and establish test coverage baseline (40%)

---

## 📋 Issues

### Week 1: DataTable Accessibility

#### Issue #1: Add aria-sort to sortable column headers
**Labels:** `accessibility`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Add `aria-sort` attribute to all sortable column headers in DataTable component to improve screen reader support.

**Acceptance Criteria:**
- [ ] All sortable columns have `aria-sort` attribute
- [ ] Values: "ascending", "descending", or "none"
- [ ] Updates dynamically when sort changes
- [ ] Tested with screen reader

**Files:**
- `apps/web/app/components/ui/DataTable.tsx`

**Implementation:**
```tsx
<th>
  <button
    onClick={handleSort}
    aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'}
  >
    {column.header}
  </button>
</th>
```

---

#### Issue #2: Add ARIA grid roles to DataTable
**Labels:** `accessibility`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Add proper ARIA roles (`role="grid"`, `role="row"`, `role="gridcell"`) to DataTable for screen reader support.

**Acceptance Criteria:**
- [ ] Table has `role="grid"`
- [ ] Rows have `role="row"`
- [ ] Cells have `role="gridcell"`
- [ ] Header cells have `role="columnheader"`
- [ ] No accessibility errors in axe DevTools

**Files:**
- `apps/web/app/components/ui/DataTable.tsx`

---

#### Issue #3: Implement keyboard navigation for DataTable
**Labels:** `accessibility`, `enhancement`, `sprint-1`, `keyboard`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Implement full keyboard navigation for DataTable including arrow keys, Enter, Space, and Escape.

**Acceptance Criteria:**
- [ ] Arrow keys navigate between cells/rows
- [ ] Enter/Space activates sortable columns
- [ ] Escape closes any open dropdowns
- [ ] Tab moves focus in/out of table
- [ ] Focus is visible at all times
- [ ] Tested with keyboard only

**Files:**
- `apps/web/app/components/ui/DataTable.tsx`

**Implementation:**
```tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusRow(index + 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusRow(index - 1);
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleSort();
      break;
    case 'Escape':
      closeDropdown();
      break;
  }
};
```

---

#### Issue #4: Add aria-labels to action buttons
**Labels:** `accessibility`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Add descriptive `aria-label` attributes to all action buttons (edit, delete, etc.) for screen reader users.

**Acceptance Criteria:**
- [ ] All icon-only buttons have `aria-label`
- [ ] Labels are descriptive (e.g., "Edit transaction" not just "Edit")
- [ ] Includes context where needed (e.g., "Delete transaction #12345")

**Files:**
- `apps/web/app/components/ui/DataTable.tsx`
- `apps/web/app/transactions/page.tsx`
- All pages with action buttons

---

#### Issue #5: Add aria-live regions for dynamic content
**Labels:** `accessibility`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Add `aria-live` regions to announce dynamic content changes (sorting, filtering, pagination) to screen reader users.

**Acceptance Criteria:**
- [ ] Sort changes announced
- [ ] Filter changes announced
- [ ] Pagination changes announced
- [ ] Loading states announced
- [ ] Uses `aria-live="polite"` for non-urgent updates
- [ ] Uses `aria-live="assertive"` for errors

**Files:**
- `apps/web/app/components/ui/DataTable.tsx`
- `apps/web/app/components/Announcer.tsx` (create if needed)

---

#### Issue #6: Test with VoiceOver and NVDA
**Labels:** `accessibility`, `testing`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Test all accessibility improvements with VoiceOver (macOS) and NVDA (Windows) screen readers.

**Acceptance Criteria:**
- [ ] Tested with VoiceOver on macOS
- [ ] Tested with NVDA on Windows
- [ ] All interactive elements accessible
- [ ] All content announced correctly
- [ ] No accessibility blockers found
- [ ] Document any issues found

**Deliverables:**
- Accessibility test report
- List of any remaining issues
- Recommendations for improvements

---

### Week 2: Component Tests

#### Issue #7: Write Navigation component tests
**Labels:** `testing`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 6h

**Description:**
Write comprehensive tests for Navigation component including dropdowns, mobile menu, and auth states.

**Acceptance Criteria:**
- [ ] Desktop dropdowns open/close
- [ ] Mobile menu toggle works
- [ ] Active states render correctly
- [ ] Auth states (logged in/out) render correctly
- [ ] Keyboard navigation works
- [ ] Coverage ≥ 80% for Navigation.tsx

**Files:**
- `apps/web/test/components/Navigation.test.tsx` (create)
- `apps/web/app/components/Navigation.tsx`

**Test Cases:**
```typescript
describe('Navigation', () => {
  it('opens dropdown on click', () => {});
  it('closes dropdown on outside click', () => {});
  it('toggles mobile menu', () => {});
  it('shows login button when logged out', () => {});
  it('shows user menu when logged in', () => {});
  it('navigates with keyboard', () => {});
});
```

---

#### Issue #8: Write DataTable component tests
**Labels:** `testing`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 6h

**Description:**
Write comprehensive tests for DataTable component including sorting, filtering, pagination, and row selection.

**Acceptance Criteria:**
- [ ] Sorting works correctly
- [ ] Filtering works correctly
- [ ] Pagination works correctly
- [ ] Row selection works
- [ ] Keyboard navigation works
- [ ] Coverage ≥ 80% for DataTable.tsx

**Files:**
- `apps/web/test/components/DataTable.test.tsx` (create)
- `apps/web/app/components/ui/DataTable.tsx`

**Test Cases:**
```typescript
describe('DataTable', () => {
  it('sorts by column when clicked', () => {});
  it('filters rows based on search', () => {});
  it('paginates correctly', () => {});
  it('selects rows on click', () => {});
  it('navigates with arrow keys', () => {});
  it('announces sort changes to screen readers', () => {});
});
```

---

#### Issue #9: Write ErrorAlert component tests
**Labels:** `testing`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 3h

**Description:**
Write tests for ErrorAlert component including error display, dismissal, and accessibility.

**Acceptance Criteria:**
- [ ] Error message displays correctly
- [ ] Dismiss button works
- [ ] Has `role="alert"`
- [ ] Has `aria-live="assertive"`
- [ ] Coverage ≥ 90% for ErrorAlert.tsx

**Files:**
- `apps/web/test/components/ErrorAlert.test.tsx` (create)
- `apps/web/app/components/ui/ErrorAlert.tsx`

---

#### Issue #10: Write Toast component tests
**Labels:** `testing`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 3h

**Description:**
Write tests for Toast notification component including success, error, and info toasts.

**Acceptance Criteria:**
- [ ] Success toast displays
- [ ] Error toast displays
- [ ] Info toast displays
- [ ] Auto-dismiss works
- [ ] Manual dismiss works
- [ ] Coverage ≥ 90% for Toast.tsx

**Files:**
- `apps/web/test/components/Toast.test.tsx` (create)
- `apps/web/app/components/ui/Toast.tsx`

---

#### Issue #11: Write ReceiptUploadSection tests
**Labels:** `testing`, `enhancement`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 4h

**Description:**
Write tests for ReceiptUploadSection component including file upload, drag-drop, and OCR extraction.

**Acceptance Criteria:**
- [ ] File selection works
- [ ] Drag-drop works
- [ ] File validation works
- [ ] Preview displays
- [ ] OCR extraction trigger works
- [ ] Coverage ≥ 70% for ReceiptUploadSection.tsx

**Files:**
- `apps/web/test/components/ReceiptUploadSection.test.tsx` (create)
- `apps/web/app/components/ui/ReceiptUploadSection.tsx`

---

#### Issue #12: Setup test coverage reporting
**Labels:** `testing`, `infrastructure`, `sprint-1`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Setup test coverage reporting in CI pipeline and generate HTML coverage reports.

**Acceptance Criteria:**
- [ ] Coverage report generated on test run
- [ ] HTML report available
- [ ] Coverage threshold set (40%)
- [ ] Coverage badge in README
- [ ] Coverage report in CI artifacts

**Files:**
- `apps/web/vitest.config.ts`
- `apps/web/package.json`
- `azure-pipelines/ci-frontend.yml`

**Implementation:**
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=results.xml"
  }
}
```

---

#### Issue #13: Add tests to CI pipeline
**Labels:** `testing`, `infrastructure`, `sprint-1`, `ci/cd`  
**Assignee:** TBD  
**Estimate:** 2h

**Description:**
Integrate test execution into Azure DevOps CI pipeline with coverage reporting.

**Acceptance Criteria:**
- [ ] Tests run on every PR
- [ ] Tests run on every push to master
- [ ] Coverage report published
- [ ] JUnit XML report published
- [ ] Pipeline fails if coverage < 40%
- [ ] Test results visible in Azure DevOps

**Files:**
- `azure-pipelines/ci-frontend.yml`

**Implementation:**
```yaml
- script: npm run test:ci -w apps/web
  displayName: 'Run Tests'
  
- task: PublishTestResults@2
  inputs:
    testResultsFiles: '**/results.xml'
    
- task: PublishCodeCoverageResults@2
  inputs:
    codeCoverageTool: Cobertura
    summaryFileLocation: '**/coverage.xml'
```

---

## 📊 Sprint 1 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Lighthouse Accessibility** | ~60% | 95%+ | ⏳ |
| **Test Coverage** | ~20% | 40% | ⏳ |
| **Component Tests** | 3 files | 8 files | ⏳ |
| **Keyboard Navigation** | Partial | Full | ⏳ |
| **Screen Reader Support** | Limited | Full | ⏳ |

---

## 🚀 Getting Started

1. **Copy these issues** to GitHub Issues
2. **Add labels** to each issue
3. **Assign developers** to issues
4. **Add to Sprint 1 milestone**
5. **Start with Issue #1** (aria-sort)

---

**Created:** March 12, 2026  
**Sprint Duration:** 2 weeks  
**Total Issues:** 13  
**Total Effort:** ~80 hours
