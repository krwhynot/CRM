import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type Column } from '@/components/ui/DataTable'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Test data interface
interface TestUser {
  id: string
  name: string
  email: string
  age: number
  role?: string
}

// Sample test data
const mockUsers: TestUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
]

// Sample columns definition
const mockColumns: Column<TestUser>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (row) => <span className="font-medium">{row.name}</span>
  },
  {
    key: 'email',
    header: 'Email Address',
    className: 'min-w-[200px]'
  },
  {
    key: 'age',
    header: 'Age',
    cell: (row) => `${row.age} years old`
  },
  {
    key: 'role',
    header: 'Role',
    cell: (row) => row.role || 'No role assigned',
    hidden: { sm: true } // Hidden on small screens
  }
]

describe('DataTable', () => {
  describe('Basic Rendering', () => {
    it('renders table with data correctly', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      // Check table structure
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Data table')

      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Age')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()

      // Check data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('35 years old')).toBeInTheDocument()
      expect(screen.getByText('No role assigned')).toBeInTheDocument()
    })

    it('applies column classes correctly', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      // Check that email column has custom className
      const emailHeader = screen.getByText('Email Address').closest('th')
      expect(emailHeader).toHaveClass('min-w-[200px]')
    })

    it('handles missing optional data gracefully', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      // Bob Johnson doesn't have a role, should show fallback
      expect(screen.getByText('No role assigned')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when loading=true', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          rowKey={(row) => row.id}
          loading={true}
        />
      )

      // Check loading state
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading table data')).toBeInTheDocument()
      expect(screen.getByText('Loading table data...')).toBeInTheDocument()

      // Should have skeleton rows
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('has proper accessibility attributes in loading state', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          rowKey={(row) => row.id}
          loading={true}
        />
      )

      const loadingContainer = screen.getByRole('status')
      expect(loadingContainer).toHaveAttribute('aria-live', 'polite')
      expect(loadingContainer).toHaveAttribute('aria-label', 'Loading table data')
    })
  })

  describe('Empty State', () => {
    it('shows default empty state when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('shows custom empty state message', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          rowKey={(row) => row.id}
          empty={{
            title: 'No users found',
            description: 'Get started by adding your first user'
          }}
        />
      )

      expect(screen.getByText('No users found')).toBeInTheDocument()
      expect(screen.getByText('Get started by adding your first user')).toBeInTheDocument()
    })

    it('shows empty state without description', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          rowKey={(row) => row.id}
          empty={{ title: 'Nothing here' }}
        />
      )

      expect(screen.getByText('Nothing here')).toBeInTheDocument()
      // Should not have description paragraph
      expect(screen.queryByText('Get started')).not.toBeInTheDocument()
    })
  })

  describe('Row Click Handling', () => {
    it('calls onRowClick when row is clicked', () => {
      const handleRowClick = vi.fn()
      
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
          onRowClick={handleRowClick}
        />
      )

      // Click on first row
      const firstRow = screen.getByText('John Doe').closest('tr')
      fireEvent.click(firstRow!)

      expect(handleRowClick).toHaveBeenCalledWith(mockUsers[0])
      expect(handleRowClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard navigation for row selection', () => {
      const handleRowClick = vi.fn()
      
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
          onRowClick={handleRowClick}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      
      // Test Enter key
      fireEvent.keyDown(firstRow!, { key: 'Enter' })
      expect(handleRowClick).toHaveBeenCalledWith(mockUsers[0])

      // Test Space key  
      fireEvent.keyDown(firstRow!, { key: ' ' })
      expect(handleRowClick).toHaveBeenCalledWith(mockUsers[0])

      // Other keys should not trigger
      fireEvent.keyDown(firstRow!, { key: 'Escape' })
      expect(handleRowClick).toHaveBeenCalledTimes(2) // Only Enter and Space
    })

    it('adds proper accessibility attributes when clickable', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
          onRowClick={() => {}}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).toHaveClass('cursor-pointer')
      expect(firstRow).toHaveAttribute('tabIndex', '0')
      expect(firstRow).toHaveAttribute('role', 'button')
      expect(firstRow).toHaveAttribute('aria-label', 'Click to select row')
    })

    it('does not add click attributes when onRowClick not provided', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).not.toHaveClass('cursor-pointer')
      expect(firstRow).not.toHaveAttribute('tabIndex')
      expect(firstRow).not.toHaveAttribute('role', 'button')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive hiding classes correctly', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      // Role column should be hidden on small screens
      const roleHeader = screen.getByText('Role').closest('th')
      expect(roleHeader).toHaveClass('hidden', 'sm:table-cell')

      // Check data cells also have responsive classes
      const roleCells = document.querySelectorAll('td')
      const roleCell = Array.from(roleCells).find(cell => 
        cell.textContent === 'Admin' || cell.textContent === 'No role assigned'
      )
      expect(roleCell).toHaveClass('hidden', 'sm:table-cell')
    })

    it('supports multiple responsive breakpoints', () => {
      const responsiveColumns: Column<TestUser>[] = [
        {
          key: 'name',
          header: 'Name'
        },
        {
          key: 'email', 
          header: 'Email',
          hidden: { md: true } // Hidden on medium screens
        },
        {
          key: 'age',
          header: 'Age', 
          hidden: { lg: true } // Hidden on large screens
        }
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={responsiveColumns}
          rowKey={(row) => row.id}
        />
      )

      const emailHeader = screen.getByText('Email').closest('th')
      expect(emailHeader).toHaveClass('hidden', 'md:table-cell')

      const ageHeader = screen.getByText('Age').closest('th')
      expect(ageHeader).toHaveClass('hidden', 'lg:table-cell')
    })
  })

  describe('Accessibility', () => {
    it('has proper table semantics', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Check header cells have scope="col"
      const headers = screen.getAllByRole('columnheader')
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col')
      })
    })

    it('provides meaningful table labels', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={mockColumns}
          rowKey={(row) => row.id}
        />
      )

      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Data table')
    })
  })

  describe('TypeScript Generics', () => {
    it('handles different data types correctly', () => {
      interface Product {
        id: number
        name: string
        price: number
        inStock: boolean
      }

      const products: Product[] = [
        { id: 1, name: 'Laptop', price: 999.99, inStock: true },
        { id: 2, name: 'Mouse', price: 29.99, inStock: false }
      ]

      const productColumns: Column<Product>[] = [
        {
          key: 'name',
          header: 'Product Name'
        },
        {
          key: 'price',
          header: 'Price',
          cell: (row) => `$${row.price.toFixed(2)}`
        },
        {
          key: 'inStock',
          header: 'Available',
          cell: (row) => row.inStock ? '✅' : '❌'
        }
      ]

      render(
        <DataTable
          data={products}
          columns={productColumns}
          rowKey={(row) => row.id.toString()}
        />
      )

      expect(screen.getByText('Laptop')).toBeInTheDocument()
      expect(screen.getByText('$999.99')).toBeInTheDocument()
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('❌')).toBeInTheDocument()
    })
  })
})