import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CharacterCard from './CharacterCard'
import { mockCharacter } from '@/test/fixtures'
import type { Character } from '@/types/rickandmorty'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('CharacterCard', () => {
  it('muestra el nombre del personaje', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument()
  })

  it('muestra el estado y la especie', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByText('Alive - Human')).toBeInTheDocument()
  })

  it('muestra la última ubicación conocida', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByText('Last known location:')).toBeInTheDocument()
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument()
  })

  it('muestra la imagen con su texto alternativo', () => {
    render(<CharacterCard character={mockCharacter} />)

    const image = screen.getByAltText('Rick Sanchez')
    expect(image).toHaveAttribute('src', mockCharacter.image)
  })

  it('enlaza a la página de detalle del personaje', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/character/1')
  })

  it.each([
    ['Alive', 'bg-green-500'],
    ['Dead', 'bg-red-500'],
    ['unknown', 'bg-gray-500'],
  ] as const)('usa el color correcto para el estado %s', (status, colorClass) => {
    const character: Character = { ...mockCharacter, status }

    const { container } = render(<CharacterCard character={character} />)

    expect(container.querySelector('.rounded-full')).toHaveClass(colorClass)
  })

  it('usa el color gris si el estado no es reconocido', () => {
    const character = { ...mockCharacter, status: 'Otro' } as unknown as Character

    const { container } = render(<CharacterCard character={character} />)

    expect(container.querySelector('.rounded-full')).toHaveClass('bg-gray-500')
  })
})