import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorPage from './error'

describe('Error', () => {
  const error = new Error('Falla de prueba')
  const consoleError = vi.spyOn(console, 'error')

  beforeEach(() => {
    consoleError.mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockClear()
  })

  it('muestra el mensaje de error', () => {
    render(<ErrorPage error={error} reset={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Something went wrong!' })).toBeInTheDocument()
    expect(screen.getByText(/couldn't load the characters/i)).toBeInTheDocument()
  })

  it('registra el error en la consola', () => {
    render(<ErrorPage error={error} reset={vi.fn()} />)

    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('llama a reset al hacer clic en "Try again"', async () => {
    const reset = vi.fn()
    render(<ErrorPage error={error} reset={reset} />)

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(reset).toHaveBeenCalledTimes(1)
  })
})