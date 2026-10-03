import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Loading from './loading'

describe('Loading', () => {
  it('muestra 8 tarjetas de carga más el título de carga', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.h-96')).toHaveLength(8)
    expect(container.querySelector('.w-64')).toBeInTheDocument()
  })

  it('usa la animación de pulso en los marcadores de posición', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})