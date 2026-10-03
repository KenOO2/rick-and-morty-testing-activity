import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'
import { getCharacters } from '@/lib/api'
import { mockCharacter } from '@/test/fixtures'

vi.mock('@/lib/api', () => ({
  getCharacters: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const mockedGetCharacters = vi.mocked(getCharacters)

const secondCharacter = { ...mockCharacter, id: 2, name: 'Morty Smith' }

const renderHome = async (searchParams: { [key: string]: string | string[] | undefined } = {}) => {
  const ui = await Home({ searchParams: Promise.resolve(searchParams) })
  return render(ui)
}

describe('Home (página principal)', () => {
  beforeEach(() => {
    mockedGetCharacters.mockReset()
    mockedGetCharacters.mockResolvedValue({
      info: { count: 2, pages: 5, next: null, prev: null },
      results: [mockCharacter, secondCharacter],
    })
  })

  it('muestra el título de la página', async () => {
    await renderHome()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Rick and Morty Characters' })
    ).toBeInTheDocument()
  })

  it('pide la página 1 cuando no hay parámetro "page"', async () => {
    await renderHome()

    expect(mockedGetCharacters).toHaveBeenCalledWith(1)
  })

  it('pide la página indicada en el parámetro "page"', async () => {
    await renderHome({ page: '3' })

    expect(mockedGetCharacters).toHaveBeenCalledWith(3)
  })

  it('usa la página 1 si el parámetro "page" viene repetido (arreglo)', async () => {
    await renderHome({ page: ['2', '3'] })

    expect(mockedGetCharacters).toHaveBeenCalledWith(1)
  })

  it('muestra una tarjeta por cada personaje', async () => {
    await renderHome()

    expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Morty Smith' })).toBeInTheDocument()
  })

  it('muestra la paginación con la página actual y el total', async () => {
    await renderHome({ page: '2' })

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('no muestra tarjetas si la API devuelve una lista vacía', async () => {
    mockedGetCharacters.mockResolvedValue({
      info: { count: 0, pages: 1, next: null, prev: null },
      results: [],
    })

    await renderHome()

    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0)
  })

  it('propaga el error si la API falla', async () => {
    mockedGetCharacters.mockRejectedValue(new Error('Failed to fetch characters'))

    await expect(renderHome()).rejects.toThrow('Failed to fetch characters')
  })
})