import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RootLayout, { metadata } from './layout'

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'font-geist-sans' }),
  Geist_Mono: () => ({ variable: 'font-geist-mono' }),
}))

vi.mock('./globals.css', () => ({}))

const renderLayout = () =>
  renderToStaticMarkup(
    <RootLayout>
      <p>Contenido de prueba</p>
    </RootLayout>
  )

describe('RootLayout', () => {
  it('define el título y la descripción del sitio', () => {
    expect(metadata.title).toBe('Rick and Morty Explorer')
    expect(metadata.description).toBe('Explore the Rick and Morty universe')
  })

  it('renderiza el contenido hijo dentro del layout', () => {
    expect(renderLayout()).toContain('Contenido de prueba')
  })

  it('declara el idioma inglés en la etiqueta html', () => {
    expect(renderLayout()).toContain('<html lang="en">')
  })

  it('incluye el encabezado con la navegación', () => {
    const html = renderLayout()

    expect(html).toContain('Rick &amp; Morty App')
    expect(html).toContain('Characters')
    expect(html).toContain('href="https://rickandmortyapi.com/documentation"')
  })

  it('incluye el pie de página con el crédito a la API', () => {
    const html = renderLayout()

    expect(html).toContain('Data provided by')
    expect(html).toContain('href="https://rickandmortyapi.com"')
  })

  it('aplica las variables de fuente al body', () => {
    const html = renderLayout()

    expect(html).toContain('font-geist-sans')
    expect(html).toContain('font-geist-mono')
  })
})