import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Button } from './button'

describe('Button', () => {
	test('renders children', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined()
	})

	test('renders as a button element by default', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole('button').tagName).toBe('BUTTON')
	})

	test('renders as child element when asChild is true', () => {
		render(
			<Button asChild>
				<a href="/test">Link</a>
			</Button>,
		)
		expect(screen.getByRole('link', { name: 'Link' })).toBeDefined()
		expect(screen.queryByRole('button')).toBeNull()
	})

	test('is disabled when disabled prop is set', () => {
		render(<Button disabled>Click me</Button>)
		expect(screen.getByRole('button')).toHaveProperty('disabled', true)
	})

	test('forwards className', () => {
		render(<Button className="custom-class">Click me</Button>)
		expect(screen.getByRole('button').className).toContain('custom-class')
	})

	test.each([
		['default', 'bg-primary'],
		['outline', 'border-border'],
		['secondary', 'bg-secondary'],
		['ghost', 'hover:bg-muted'],
		['destructive', 'bg-destructive'],
		['link', 'underline-offset-4'],
	] as const)('applies variant "%s" classes', (variant, expectedClass) => {
		render(<Button variant={variant}>Click me</Button>)
		expect(screen.getByRole('button').className).toContain(expectedClass)
	})
})
