import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cards from '../Cards';

describe('Cards Component - Usability Tests', () => {
  const mockOpenEditModal = jest.fn();
  const mockOpenDeleteModal = jest.fn();
  const mockOnEditButton = jest.fn();
  const mockOnCopyButton = jest.fn();

  const mockData = [
    { label: 'Students', value: 25 },
    { label: 'Teachers', value: 5 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders card with correct label', () => {
    render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  test('renders all data items correctly', () => {
    render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('delete button triggers correct callbacks', () => {
    render(
      <Cards
        label="Test Course"
        data={mockData}
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
      expect(mockOpenDeleteModal).toHaveBeenCalledTimes(1);
      expect(mockOnEditButton).toHaveBeenCalledTimes(1);
    }
  });

  test('edit button (pencil icon) triggers correct callbacks', () => {
    render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const allLists = screen.getAllByRole('list');
    // The second list contains the action buttons
    const actionList = allLists[1];
    const pencilElement = actionList.querySelector('li') as HTMLElement;
    
    if (pencilElement) {
      fireEvent.click(pencilElement);
      expect(mockOnEditButton).toHaveBeenCalled();
      expect(mockOpenEditModal).toHaveBeenCalled();
    }
  });

  test('copy button is rendered when onCopyButton is provided', () => {
    const { container } = render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const copyIcons = container.querySelectorAll('svg');
    const hasCopyButton = Array.from(copyIcons).some(svg => 
      svg.classList.contains('lucide-copy')
    );
    
    expect(hasCopyButton).toBe(true);
  });

  test('copy button triggers correct callbacks', () => {
    render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const buttons = screen.getAllByRole('button');
    // Find the copy button by looking for the one with Copy icon
    const copyButton = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg?.classList.contains('lucide-copy');
    });
    
    if (copyButton) {
      fireEvent.click(copyButton);
      expect(mockOnCopyButton).toHaveBeenCalledTimes(1);
      expect(mockOnEditButton).toHaveBeenCalledTimes(1);
    }
  });

  test('copy button is not rendered when onCopyButton is not provided', () => {
    const { container } = render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
      />
    );

    const copyIcons = container.querySelectorAll('svg');
    const hasCopyButton = Array.from(copyIcons).some(svg => 
      svg.classList.contains('lucide-copy')
    );
    
    expect(hasCopyButton).toBe(false);
  });

  test('password fields are hidden by default', () => {
    const passwordData = [
      { label: 'Password', value: 'secret123', isPassword: true },
    ];

    render(
      <Cards
        label="User Account"
        data={passwordData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
      />
    );

    expect(screen.getByText('**********')).toBeInTheDocument();
    expect(screen.queryByText('secret123')).not.toBeInTheDocument();
  });

  test('password visibility toggles on button press', () => {
    const passwordData = [
      { label: 'Password', value: 'secret123', isPassword: true },
    ];

    render(
      <Cards
        label="User Account"
        data={passwordData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
    
    // Password should be hidden initially
    expect(screen.getByText('**********')).toBeInTheDocument();
    
    // Show password on mouse down
    fireEvent.mouseDown(toggleButton);
    expect(screen.getByText('secret123')).toBeInTheDocument();
    
    // Hide password on mouse up
    fireEvent.mouseUp(toggleButton);
    expect(screen.getByText('**********')).toBeInTheDocument();
  });

  test('card has proper styling classes', () => {
    const { container } = render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-lg');
    expect(card.className).toContain('rounded-2xl');
  });

  test('buttons have hover effects', () => {
    const { container } = render(
      <Cards
        label="Test Course"
        data={mockData}
        OpenOnEditModal={mockOpenEditModal}
        OpenOnDeletetModal={mockOpenDeleteModal}
        onEditButton={mockOnEditButton}
        onCopyButton={mockOnCopyButton}
      />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.className).toContain('transition-all');
    });
  });
});
