import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/shared/components/ui/button'

describe('Button Component', () => {
  it('renderel szöveggel', () => {
    render(<Button>Kattints ide</Button>)
    expect(screen.getByText('Kattints ide')).toBeInTheDocument()
  })

  it('onClick esemény működik', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Kattints</Button>)
    fireEvent.click(screen.getByText('Kattints'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled állapotban nem kattintható', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Letiltva</Button>)
    fireEvent.click(screen.getByText('Letiltva'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
