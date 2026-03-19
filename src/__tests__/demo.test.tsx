import { render, screen, fireEvent } from '@testing-library/react'
import DemoPage from '@/app/demo/page'

describe('Demo Page', () => {
  it('renders the demo page with navigation', () => {
    render(<DemoPage />)
    const heading = screen.getByText('ARCÉ Component Demo')
    expect(heading).toBeInTheDocument()
  })

  it('displays the design system heading', () => {
    render(<DemoPage />)
    const designHeading = screen.getByText('Design System')
    expect(designHeading).toBeInTheDocument()
  })

  it('renders color palette section', () => {
    render(<DemoPage />)
    const colorHeading = screen.getByText('Color Palette')
    expect(colorHeading).toBeInTheDocument()
  })

  it('renders button examples', () => {
    render(<DemoPage />)
    const buttonLabels = screen.getAllByText(/Button/)
    expect(buttonLabels.length).toBeGreaterThan(0)
  })

  it('toggles defense box visibility', () => {
    render(<DemoPage />)
    const toggleButton = screen.getByRole('button', { name: /Show Defense Box/ })
    
    // Initially not visible
    expect(screen.queryByPlaceholderText(/Explain your choice/)).not.toBeInTheDocument()
    
    // Click to show
    fireEvent.click(toggleButton)
    expect(screen.getByPlaceholderText(/Explain your choice/)).toBeInTheDocument()
    
    // Click to hide
    fireEvent.click(toggleButton)
    expect(screen.queryByPlaceholderText(/Explain your choice/)).not.toBeInTheDocument()
  })

  it('selects action buttons on click', () => {
    render(<DemoPage />)
    const actionButtons = screen.getAllByRole('button', { name: /Option/ })
    
    fireEvent.click(actionButtons[0])
    // Button should maintain selected state (visual feedback)
    expect(actionButtons[0]).toHaveClass('selected')
  })

  it('renders thermal states feedback', () => {
    render(<DemoPage />)
    expect(screen.getByText(/FROST/)).toBeInTheDocument()
    expect(screen.getByText(/WARNING/)).toBeInTheDocument()
    expect(screen.getByText(/IGNITION/)).toBeInTheDocument()
  })

  it('renders MVC architecture section', () => {
    render(<DemoPage />)
    expect(screen.getByText('MVC Architecture')).toBeInTheDocument()
    expect(screen.getByText('Model Layer')).toBeInTheDocument()
    expect(screen.getByText('Controller Layer')).toBeInTheDocument()
    expect(screen.getByText('View Layer')).toBeInTheDocument()
  })

  it('renders form elements with labels', () => {
    render(<DemoPage />)
    const textInputLabel = screen.getByText('Text Input')
    const textareaLabel = screen.getByText('Textarea')
    
    expect(textInputLabel).toBeInTheDocument()
    expect(textareaLabel).toBeInTheDocument()
  })

  it('renders statistics cards', () => {
    render(<DemoPage />)
    expect(screen.getByText('Final Heat')).toBeInTheDocument()
    expect(screen.getByText('Integrity')).toBeInTheDocument()
    expect(screen.getByText('Responses')).toBeInTheDocument()
    expect(screen.getByText('Mastery Cards')).toBeInTheDocument()
  })
})
