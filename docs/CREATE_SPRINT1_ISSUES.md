# 🚀 Quick Start: Create Sprint 1 Issues

## Option 1: Manual Copy (Recommended for 13 issues)

### Step 1: Open GitHub Issues
```
https://github.com/profemzy/oluto/issues/new
```

### Step 2: Create Each Issue

For each issue in `docs/SPRINT1_ISSUES.md`:

1. **Copy** the issue title (e.g., "Add aria-sort to sortable column headers")
2. **Paste** as issue title
3. **Copy** the description (everything under "Description:")
4. **Paste** as issue body
5. **Add labels:** `accessibility`, `enhancement`, `sprint-1`, `testing`, etc.
6. **Add to milestone:** "Sprint 1 - Accessibility & Testing"
7. **Click "Submit new issue"**

### Step 3: Repeat for All 13 Issues

**Week 1 Issues (1-6):**
- #1: Add aria-sort to sortable column headers
- #2: Add ARIA grid roles to DataTable
- #3: Implement keyboard navigation for DataTable
- #4: Add aria-labels to action buttons
- #5: Add aria-live regions for dynamic content
- #6: Test with VoiceOver and NVDA

**Week 2 Issues (7-13):**
- #7: Write Navigation component tests
- #8: Write DataTable component tests
- #9: Write ErrorAlert component tests
- #10: Write Toast component tests
- #11: Write ReceiptUploadSection tests
- #12: Setup test coverage reporting
- #13: Add tests to CI pipeline

---

## Option 2: Use GitHub CLI (Faster)

### Prerequisites
```bash
# Install GitHub CLI
brew install gh  # macOS
# or
scoop install gh  # Windows
```

### Create Issues Script

Create a file `create-sprint1-issues.sh`:

```bash
#!/bin/bash

# Issue 1
gh issue create \
  --title "Add aria-sort to sortable column headers" \
  --body "Add \`aria-sort\` attribute to all sortable column headers in DataTable component to improve screen reader support.

**Acceptance Criteria:**
- [ ] All sortable columns have \`aria-sort\` attribute
- [ ] Values: 'ascending', 'descending', or 'none'
- [ ] Updates dynamically when sort changes
- [ ] Tested with screen reader

**Files:**
- \`apps/web/app/components/ui/DataTable.tsx\`

**Estimate:** 2h" \
  --label "accessibility,enhancement,sprint-1" \
  --milestone "Sprint 1"

# Repeat for all 13 issues...
```

### Run Script
```bash
chmod +x create-sprint1-issues.sh
./create-sprint1-issues.sh
```

---

## Option 3: Bulk Import (Fastest)

### Use GitHub Issue Templates

1. **Create** `.github/ISSUE_TEMPLATE/sprint1-task.md`
2. **Add** template frontmatter
3. **Use** template to create issues quickly

---

## After Creating Issues

### 1. Create Sprint 1 Milestone

```
https://github.com/profemzy/oluto/milestones/new

Title: Sprint 1 - Accessibility & Testing
Description: Improve accessibility score to 95%+ and test coverage to 40%
Due date: 2 weeks from start
```

### 2. Add All Issues to Milestone

- Go to each issue
- Click "Milestone"
- Select "Sprint 1 - Accessibility & Testing"

### 3. Create GitHub Project Board

```
https://github.com/profemzy/oluto/projects/new

Name: Sprint 1 Board
Template: Kanban
```

**Columns:**
- Backlog
- To Do
- In Progress
- Review
- Done

### 4. Add Issues to Project Board

- Add all 13 Sprint 1 issues to the board
- Start in "Backlog" column
- Move to "To Do" when ready to start

---

## Assign Developers

### Recommended Assignments

**Week 1 (Accessibility):**
- Issues #1-3: Developer A (DataTable expert)
- Issues #4-6: Developer B (Accessibility specialist)

**Week 2 (Testing):**
- Issues #7-8: Developer A (complex components)
- Issues #9-11: Developer B (simpler components)
- Issues #12-13: DevOps engineer

---

## Sprint 1 Timeline

```
Week 1:
Mon-Tue: Issues #1, #2 (ARIA attributes)
Wed-Thu: Issue #3 (Keyboard navigation)
Fri: Issues #4, #5 (Labels & live regions)

Week 2:
Mon-Tue: Issues #7, #8 (Navigation & DataTable tests)
Wed: Issues #9, #10 (ErrorAlert & Toast tests)
Thu: Issue #11 (ReceiptUploadSection tests)
Fri: Issues #12, #13 (Coverage & CI setup)
```

---

## Sprint 1 Kickoff Meeting Agenda

**Duration:** 30 minutes

1. **Review sprint goal** (5 min)
   - Accessibility score: 60% → 95%+
   - Test coverage: 20% → 40%

2. **Review issues** (10 min)
   - Walk through all 13 issues
   - Answer questions
   - Clarify acceptance criteria

3. **Assign issues** (5 min)
   - Assign developers to issues
   - Confirm availability

4. **Setup** (5 min)
   - Ensure everyone has access
   - Verify development environment
   - Test screen readers (VoiceOver/NVDA)

5. **Q&A** (5 min)

---

## 📞 Support

- **Sprint Plan:** `docs/SPRINT_PLAN.md`
- **Issue Templates:** `docs/SPRINT1_ISSUES.md`
- **Accessibility Guide:** https://www.w3.org/WAI/ARIA/apg/
- **Testing Guide:** https://testing-library.com/docs/react-testing-library/intro/

---

**Ready to Start?** 

1. ✅ Create all 13 issues
2. ✅ Add to Sprint 1 milestone
3. ✅ Setup project board
4. ✅ Schedule kickoff meeting
5. 🚀 Start Sprint 1!
