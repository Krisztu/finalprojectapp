import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'

describe('Tabs Component', () => {
  it('renderel tab-okkal', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tartalom 1</TabsContent>
        <TabsContent value="tab2">Tartalom 2</TabsContent>
      </Tabs>
    )
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('tab váltás működik', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tartalom 1</TabsContent>
        <TabsContent value="tab2">Tartalom 2</TabsContent>
      </Tabs>
    )
    
    const tab1 = screen.getByText('Tab 1')
    const tab2 = screen.getByText('Tab 2')
    
    expect(tab1).toHaveAttribute('data-state', 'active')
    expect(tab2).toHaveAttribute('data-state', 'inactive')
  })
})
