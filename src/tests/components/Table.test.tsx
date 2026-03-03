import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

describe('Table Component', () => {
  it('renderel fejléccel és tartalommal', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Név</TableHead>
            <TableHead>Jegy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Teszt Diák</TableCell>
            <TableCell>5</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('Név')).toBeInTheDocument()
    expect(screen.getByText('Jegy')).toBeInTheDocument()
    expect(screen.getByText('Teszt Diák')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('több sor renderelése', () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableCell>Sor 1</TableCell></TableRow>
          <TableRow><TableCell>Sor 2</TableCell></TableRow>
          <TableRow><TableCell>Sor 3</TableCell></TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('Sor 1')).toBeInTheDocument()
    expect(screen.getByText('Sor 2')).toBeInTheDocument()
    expect(screen.getByText('Sor 3')).toBeInTheDocument()
  })
})
