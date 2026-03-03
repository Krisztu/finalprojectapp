import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'

describe('Card Component', () => {
  it('renderel tartalommal', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Teszt Cím</CardTitle>
        </CardHeader>
        <CardContent>Teszt tartalom</CardContent>
      </Card>
    )
    expect(screen.getByText('Teszt Cím')).toBeInTheDocument()
    expect(screen.getByText('Teszt tartalom')).toBeInTheDocument()
  })
})
