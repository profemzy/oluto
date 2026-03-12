/**
 * DataTable Component Tests
 * 
 * Tests for the DataTable component including:
 * - Sorting functionality
 * - Filtering functionality
 * - Pagination
 * - Row selection
 * - Keyboard navigation
 * - Accessibility features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataTable } from '@/app/components/ui/DataTable';

interface TestData {
  id: string;
  name: string;
  email: string;
  status: string;
  amount: string;
}

const testData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', amount: '100.00' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', amount: '200.00' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', amount: '150.00' },
];

const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (item: TestData) => item.name,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    render: (item: TestData) => item.email,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
    render: (item: TestData) => item.status,
  },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    render: (item: TestData) => `$${item.amount}`,
    align: 'right' as const,
  },
];

const actions = [
  {
    key: 'edit',
    icon: <span>✏️</span>,
    label: 'Edit',
    onClick: vi.fn(),
  },
  {
    key: 'delete',
    icon: <span>🗑️</span>,
    label: 'Delete',
    variant: 'danger' as const,
    onClick: vi.fn(),
  },
];

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders table with columns and data', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          keyExtractor={(item) => item.id}
          emptyState={{
            title: 'No data',
            description: 'There are no items to display',
          }}
        />
      );
      
      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('There are no items to display')).toBeInTheDocument();
    });

    it('renders no results state when filter returns no matches', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          searchFields={['name']}
          noResultsState={{
            title: 'No results',
            description: 'No items match your search',
          }}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
      
      expect(screen.getByText('No results')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by column when clicked', () => {
      const onSort = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onSort={onSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      
      expect(onSort).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
      });
    });

    it('toggles sort direction when clicking same column', () => {
      const onSort = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onSort={onSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      
      // First click - ascending
      fireEvent.click(nameHeader);
      expect(onSort).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
      });
      
      // Second click - descending
      fireEvent.click(nameHeader);
      expect(onSort).toHaveBeenCalledWith({
        field: 'name',
        direction: 'desc',
      });
    });

    it('has correct aria-sort attribute', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const nameHeader = screen.getByText('Name').closest('[role="columnheader"]');
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    });

    it('announces sort changes to screen readers', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      
      const announcement = screen.getByText('Name sorted ascending');
      expect(announcement).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters by status when selected', () => {
      const onFilter = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onFilter={onFilter}
        />
      );
      
      const statusFilter = screen.getByLabelText('Filter by Status');
      fireEvent.change(statusFilter, { target: { value: 'Active' } });
      
      expect(onFilter).toHaveBeenCalledWith({
        status: 'Active',
      });
    });

    it('clears filters when clear button clicked', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          filterable
        />
      );
      
      const statusFilter = screen.getByLabelText('Filter by Status');
      fireEvent.change(statusFilter, { target: { value: 'Active' } });
      
      const clearButton = screen.getByText('Clear 1 filter');
      fireEvent.click(clearButton);
      
      expect(statusFilter).toHaveValue('');
    });
  });

  describe('Search', () => {
    it('filters data when searching', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          searchFields={['name', 'email']}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('clears search when X button clicked', () => {
      const onSearch = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          searchFields={['name']}
          onSearch={onSearch}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(onSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Pagination', () => {
    it('paginates data when page size changed', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          pageSize={2}
          pageSizeOptions={[2, 5, 10]}
        />
      );
      
      const pageSizeSelect = screen.getByLabelText('Rows per page');
      expect(pageSizeSelect).toHaveValue('2');
    });

    it('shows correct page numbers', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        status: 'Active',
        amount: '100.00',
      }));
      
      render(
        <DataTable
          columns={columns}
          data={largeData}
          keyExtractor={(item) => item.id}
          pageSize={25}
        />
      );
      
      expect(screen.getByText('Showing 1 to 25 of 50 results')).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('selects row when checkbox clicked', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          enableRowSelection
        />
      );
      
      const checkbox = screen.getByRole('checkbox', { name: /Select John Doe/i });
      fireEvent.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it('selects all rows when header checkbox clicked', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          enableRowSelection
        />
      );
      
      const headerCheckbox = screen.getByRole('checkbox', { name: /Select all/i });
      fireEvent.click(headerCheckbox);
      
      const allCheckboxes = screen.getAllByRole('checkbox');
      allCheckboxes.forEach((cb) => {
        expect(cb).toBeChecked();
      });
    });

    it('shows bulk actions bar when rows selected', () => {
      const bulkActions = [
        {
          key: 'delete',
          label: 'Delete Selected',
          variant: 'danger' as const,
          onClick: vi.fn(),
        },
      ];
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          enableRowSelection
          bulkActions={bulkActions}
        />
      );
      
      const checkbox = screen.getByRole('checkbox', { name: /Select John Doe/i });
      fireEvent.click(checkbox);
      
      expect(screen.getByText('1 item selected')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders action buttons for each row', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          actions={actions}
        />
      );
      
      const editButtons = screen.getAllByLabelText('Edit');
      expect(editButtons).toHaveLength(3);
      
      const deleteButtons = screen.getAllByLabelText('Delete');
      expect(deleteButtons).toHaveLength(3);
    });

    it('calls action handler when clicked', () => {
      const onEdit = vi.fn();
      const editAction = [{ ...actions[0], onClick: onEdit }];
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          actions={editAction}
        />
      );
      
      const editButton = screen.getAllByLabelText('Edit')[0];
      fireEvent.click(editButton);
      
      expect(onEdit).toHaveBeenCalledWith(testData[0]);
    });
  });

  describe('Keyboard Navigation', () => {
    it('sorts column with Enter key', () => {
      const onSort = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onSort={onSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      nameHeader.focus();
      
      fireEvent.keyDown(nameHeader, { key: 'Enter' });
      
      expect(onSort).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
      });
    });

    it('sorts column with Space key', () => {
      const onSort = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onSort={onSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      nameHeader.focus();
      
      fireEvent.keyDown(nameHeader, { key: ' ' });
      
      expect(onSort).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
      });
    });

    it('navigates rows with arrow keys', () => {
      const onRowClick = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onRowClick={onRowClick}
        />
      );
      
      const firstRow = screen.getByText('John Doe').closest('[role="row"]');
      firstRow?.focus();
      
      fireEvent.keyDown(firstRow!, { key: 'ArrowDown' });
      
      // Focus should move to next row
      expect(document.activeElement).not.toBe(firstRow);
    });

    it('activates row with Enter key', () => {
      const onRowClick = vi.fn();
      
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          onRowClick={onRowClick}
        />
      );
      
      const firstRow = screen.getByText('John Doe').closest('[role="row"]');
      firstRow?.focus();
      
      fireEvent.keyDown(firstRow!, { key: 'Enter' });
      
      expect(onRowClick).toHaveBeenCalledWith(testData[0]);
    });
  });

  describe('Accessibility', () => {
    it('has correct grid role', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });

    it('has correct row roles', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('has correct columnheader roles', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
    });

    it('has correct gridcell roles', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const cells = screen.getAllByRole('gridcell');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('has aria-live region for announcements', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when loading', () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(item) => item.id}
          loading
        />
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
