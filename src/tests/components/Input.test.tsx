import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/shared/components/ui/input'

describe('Input Component', () => {
  it('renderel placeholder-rel', () => {
    render(<Input placeholder="Írj valamit" />)
    expect(screen.getByPlaceholderText('Írj valamit')).toBeInTheDocument()
  })

  it('onChange esemény működik', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'teszt' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('disabled állapot működik', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('value prop működik', () => {
    render(<Input value="kezdeti érték" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('kezdeti érték')
  })
})
