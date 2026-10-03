import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCharacters, getCharacter, getEpisodes } from './api'
import { mockCharacter, mockEpisode } from '@/test/fixtures'

const BASE_URL = 'https://rickandmortyapi.com/api'
const mockFetch = vi.fn()

const okResponse = (data: unknown) => ({ ok: true, json: async () => data })
const failedResponse = () => ({ ok: false, json: async () => ({}) })

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  mockFetch.mockReset()
  vi.unstubAllGlobals()
})

describe('getCharacters', () => {
  const apiData = {
    info: { count: 1, pages: 1, next: null, prev: null },
    results: [mockCharacter],
  }

  it('pide la página 1 por defecto', async () => {
    mockFetch.mockResolvedValue(okResponse(apiData))

    await getCharacters()

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/character?page=1`)
  })

  it('pide la página indicada', async () => {
    mockFetch.mockResolvedValue(okResponse(apiData))

    await getCharacters(3)

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/character?page=3`)
  })

  it('devuelve los datos de la API', async () => {
    mockFetch.mockResolvedValue(okResponse(apiData))

    const result = await getCharacters()

    expect(result).toEqual(apiData)
  })

  it('lanza un error si la respuesta no es ok', async () => {
    mockFetch.mockResolvedValue(failedResponse())

    await expect(getCharacters()).rejects.toThrow('Failed to fetch characters')
  })
})

describe('getCharacter', () => {
  it('pide el personaje por id y devuelve sus datos', async () => {
    mockFetch.mockResolvedValue(okResponse(mockCharacter))

    const result = await getCharacter('1')

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/character/1`)
    expect(result).toEqual(mockCharacter)
  })

  it('lanza un error si la respuesta no es ok', async () => {
    mockFetch.mockResolvedValue(failedResponse())

    await expect(getCharacter('999')).rejects.toThrow('Failed to fetch character details')
  })
})

describe('getEpisodes', () => {
  it('devuelve un arreglo vacío sin llamar a la API si no hay ids', async () => {
    const result = await getEpisodes([])

    expect(result).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('une los ids con comas en la URL', async () => {
    mockFetch.mockResolvedValue(okResponse([mockEpisode]))

    await getEpisodes(['1', '2', '3'])

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/episode/1,2,3`)
  })

  it('devuelve el arreglo tal cual cuando la API responde con varios episodios', async () => {
    const episodes = [mockEpisode, { ...mockEpisode, id: 2, name: 'Lawnmower Dog' }]
    mockFetch.mockResolvedValue(okResponse(episodes))

    const result = await getEpisodes(['1', '2'])

    expect(result).toEqual(episodes)
  })

  it('envuelve en un arreglo cuando la API responde con un solo objeto', async () => {
    mockFetch.mockResolvedValue(okResponse(mockEpisode))

    const result = await getEpisodes(['1'])

    expect(result).toEqual([mockEpisode])
  })

  it('lanza un error si la respuesta no es ok', async () => {
    mockFetch.mockResolvedValue(failedResponse())

    await expect(getEpisodes(['1'])).rejects.toThrow('Failed to fetch episodes')
  })
})