import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CharacterPage from './page'
import { getCharacter, getEpisodes } from '@/lib/api'
import { mockCharacter, mockEpisode } from '@/test/fixtures'
import type { Character } from '@/types/rickandmorty'

vi.mock('@/lib/api', () => ({
  getCharacter: vi.fn(),
  getEpisodes: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const mockedGetCharacter = vi.mocked(getCharacter)
const mockedGetEpisodes = vi.mocked(getEpisodes)

const secondEpisode = { ...mockEpisode, id: 2, name: 'Lawnmower Dog', episode: 'S01E02' }

const renderPage = async (id = '1') => {
  const ui = await CharacterPage({ params: Promise.resolve({ id }) })
  return render(ui)
}

describe('CharacterPage (detalle de personaje)', () => {
  beforeEach(() => {
    mockedGetCharacter.mockReset()
    mockedGetEpisodes.mockReset()
    mockedGetCharacter.mockResolvedValue(mockCharacter)
    mockedGetEpisodes.mockResolvedValue([mockEpisode, secondEpisode])
  })

  it('pide el personaje usando el id de la URL', async () => {
    await renderPage('7')

    expect(mockedGetCharacter).toHaveBeenCalledWith('7')
  })

  it('extrae los ids de los episodios desde sus URLs', async () => {
    await renderPage()

    expect(mockedGetEpisodes).toHaveBeenCalledWith(['1', '2'])
  })

  it('muestra el nombre, la imagen y el estado del personaje', async () => {
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Rick Sanchez' })).toBeInTheDocument()
    expect(screen.getByAltText('Rick Sanchez')).toHaveAttribute('src', mockCharacter.image)
    expect(screen.getByText('Alive - Human')).toBeInTheDocument()
  })

  it('muestra género, origen y ubicación', async () => {
    await renderPage()

    expect(screen.getByText('Male')).toBeInTheDocument()
    expect(screen.getByText('Earth (C-137)')).toBeInTheDocument()
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument()
  })

  it('formatea la fecha de creación en inglés', async () => {
    await renderPage()

    expect(screen.getByText('November 4, 2017')).toBeInTheDocument()
  })

  it('muestra "Unknown" cuando el personaje no tiene tipo', async () => {
    await renderPage()

    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('muestra el tipo cuando el personaje lo tiene', async () => {
    mockedGetCharacter.mockResolvedValue({ ...mockCharacter, type: 'Genetic experiment' })

    await renderPage()

    expect(screen.getByText('Genetic experiment')).toBeInTheDocument()
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })

  it('muestra el total y la lista de episodios con su título', async () => {
    await renderPage()

    expect(screen.getByRole('heading', { level: 3, name: 'Episodes (2)' })).toBeInTheDocument()
    expect(screen.getByText('S01E01')).toHaveAttribute('title', 'Pilot - December 2, 2013')
    expect(screen.getByText('S01E02')).toHaveAttribute('title', 'Lawnmower Dog - December 2, 2013')
  })

  it('muestra "Episodes (0)" si el personaje no tiene episodios', async () => {
    mockedGetCharacter.mockResolvedValue({ ...mockCharacter, episode: [] })
    mockedGetEpisodes.mockResolvedValue([])

    await renderPage()

    expect(mockedGetEpisodes).toHaveBeenCalledWith([])
    expect(screen.getByRole('heading', { level: 3, name: 'Episodes (0)' })).toBeInTheDocument()
  })

  it('incluye un enlace para volver a la lista', async () => {
    await renderPage()

    expect(screen.getByRole('link', { name: /back to characters/i })).toHaveAttribute('href', '/')
  })

  it.each([
    ['Alive', 'bg-green-500'],
    ['Dead', 'bg-red-500'],
    ['unknown', 'bg-gray-500'],
  ] as const)('usa el color correcto para el estado %s', async (status, colorClass) => {
    const character: Character = { ...mockCharacter, status }
    mockedGetCharacter.mockResolvedValue(character)

    const { container } = await renderPage()

    expect(container.querySelector('.rounded-full')).toHaveClass(colorClass)
  })

  it('propaga el error si no se encuentra el personaje', async () => {
    mockedGetCharacter.mockRejectedValue(new Error('Failed to fetch character details'))

    await expect(renderPage('999')).rejects.toThrow('Failed to fetch character details')
  })
})