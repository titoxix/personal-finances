import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Home from './page'

test('renders heading and call to action button', () => {
	render(<Home />)

	expect(screen.getByRole('heading', { level: 1, name: 'Personal Finances' })).toBeDefined()
	expect(screen.getByRole('button', { name: 'Get Started' })).toBeDefined()
})
