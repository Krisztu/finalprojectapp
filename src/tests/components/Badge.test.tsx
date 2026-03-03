import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/shared/components/ui/badge'

describe('Badge Component', () => {
  it('renderel szöveggel', () => {
    render(<Badge>Új</Badge>)
    expect(screen.getByText('Új')).toBeInTheDocument()
  })

  it('különböző variant-ok működnek', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()
    
    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toBeInTheDocument()
  })
})
