import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders with icon', () => {
    render(<Button icon={<span>Icon</span>}>With Icon</Button>)
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })
})