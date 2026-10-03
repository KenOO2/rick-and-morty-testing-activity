import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('muestra la página actual y el total', () => {
    render(<Pagination currentPage={3} totalPages={10} />)

    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument()
  })

  it('en la primera página desactiva "Previous" y activa "Next"', () => {
    render(<Pagination currentPage={1} totalPages={5} />)

    expect(screen.queryByRole('link', { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.getByText(/previous/i)).toHaveClass('cursor-not-allowed')
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/?page=2')
  })

  it('en una página intermedia activa ambos enlaces', () => {
    render(<Pagination currentPage={3} totalPages={5} />)

    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/?page=2')
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/?page=4')
  })

  it('en la última página activa "Previous" y desactiva "Next"', () => {
    render(<Pagination currentPage={5} totalPages={5} />)

    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/?page=4')
    expect(screen.queryByRole('link', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.getByText(/next/i)).toHaveClass('cursor-not-allowed')
  })

  it('con una sola página desactiva ambos botones', () => {
    render(<Pagination currentPage={1} totalPages={1} />)

    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
}) 