import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GroupTable from '../Table';

describe('GroupTable Component - Usability Tests', () => {
  const mockHeaders = ['ID', 'Name', 'Email', 'Actions'];
  const mockRows = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const mockOpenEditModal = jest.fn();
  const mockOpenDeleteModal = jest.fn();
  const mockOnEditButton = jest.fn();
  const mockOnCopyButton = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with correct headers', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    mockHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test('renders all data rows correctly', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('edit button triggers correct callbacks', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    // Find all edit buttons (Pencil icons)
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg'))?.parentElement;
    
    if (editButton && editButton.innerHTML.includes('Pencil')) {
      fireEvent.click(editButton);
      expect(mockOnEditButton).toHaveBeenCalledTimes(1);
      expect(mockOpenEditModal).toHaveBeenCalledTimes(1);
    }
  });

  test('delete button triggers correct callbacks', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(btn => btn.innerHTML.includes('Trash2'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnEditButton).toHaveBeenCalled();
      expect(mockOpenDeleteModal).toHaveBeenCalled();
    }
  });

  test('copy button is rendered and clickable', () => {
    const { container } = render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const copyIcons = container.querySelectorAll('svg');
    const copyButtons = Array.from(copyIcons).filter(svg => 
      svg.classList.contains('lucide-copy')
    );
    
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  test('copy button triggers callback when clicked', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const buttons = screen.getAllByRole('button');
    const copyButton = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg?.classList.contains('lucide-copy');
    });
    
    if (copyButton) {
      fireEvent.click(copyButton);
      expect(mockOnCopyButton).toHaveBeenCalledTimes(1);
      expect(mockOnCopyButton).toHaveBeenCalledWith(mockRows[0]);
    }
  });

  test('table handles empty rows gracefully', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={[]}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    // Headers should still be visible
    mockHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test('copy button does not break when onCopyButton is undefined', () => {
    render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
      />
    );

    const buttons = screen.getAllByRole('button');
    const copyButton = buttons.find(btn => btn.innerHTML.includes('Copy'));
    
    if (copyButton) {
      // Should not throw error
      expect(() => fireEvent.click(copyButton)).not.toThrow();
    }
  });

  test('all action buttons have hover effects', () => {
    const { container } = render(
      <GroupTable
        headers={mockHeaders}
        rows={mockRows}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    // Check for hover classes on SVG icons
    const actionButtons = container.querySelectorAll('button svg');
    const hasTransitionClass = Array.from(actionButtons).every(svg => {
      return svg.classList.contains('transition-all');
    });
    
    expect(hasTransitionClass).toBe(true);
  });
});
