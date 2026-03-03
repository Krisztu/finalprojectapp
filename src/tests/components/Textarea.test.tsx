import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from '@/shared/components/ui/textarea'

describe('Textarea Component', () => {
  it('renderel placeholder-rel', () => {
    render(<Textarea placeholder="Hosszabb szöveg" />)
    expect(screen.getByPlaceholderText('Hosszabb szöveg')).toBeInTheDocument()
  })

  it('onChange esemény működik', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'több soros\nszöveg' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('rows prop működik', () => {
    render(<Textarea rows={5} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5')
  })
})
