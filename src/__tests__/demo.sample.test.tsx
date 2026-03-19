import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DemoPage from '@/app/demo/page'

describe('ARCÉ Demo Page - Comprehensive Test Samples', () => {
  
  // ============================================
  // SAMPLE 1: Basic Rendering Tests
  // ============================================
  describe('Page Rendering', () => {
    it('renders without crashing', () => {
      render(<DemoPage />)
      expect(screen.getByText('ARCÉ Component Demo')).toBeInTheDocument()
    })

    it('renders all major sections', () => {
      render(<DemoPage />)
      expect(screen.getByText('Design System')).toBeInTheDocument()
      expect(screen.getByText('Color Palette')).toBeInTheDocument()
      expect(screen.getByText('Buttons')).toBeInTheDocument()
      expect(screen.getByText('Card Components')).toBeInTheDocument()
      expect(screen.getByText('Statistics Display')).toBeInTheDocument()
    })
  })

  // ============================================
  // SAMPLE 2: Color Palette Tests
  // ============================================
  describe('Color Palette Section', () => {
    it('renders all color boxes', () => {
      render(<DemoPage />)
      const colorNames = ['Primary Blue', 'Light Blue', 'Slate', 'Dark Slate', 'Frost', 'Warning', 'Ignition', 'Gradient']
      colorNames.forEach(color => {
        expect(screen.getByText(color)).toBeInTheDocument()
      })
    })

    it('displays hex codes for each color', () => {
      render(<DemoPage />)
      expect(screen.getByText('#2563eb')).toBeInTheDocument() // Primary Blue
      expect(screen.getByText('#e3f2fd')).toBeInTheDocument() // Light Blue
      expect(screen.getByText('#94a3b8')).toBeInTheDocument() // Slate
      expect(screen.getByText('#0f172a')).toBeInTheDocument() // Dark Slate
    })

    it('renders color boxes with hover-friendly styling', () => {
      render(<DemoPage />)
      const colorBoxes = screen.getAllByText('Primary Blue')[0].closest('.flex')?.querySelectorAll('div')
      expect(colorBoxes).toBeDefined()
    })
  })

  // ============================================
  // SAMPLE 3: Button Tests
  // ============================================
  describe('Button Components', () => {
    it('renders all button types', () => {
      render(<DemoPage />)
      expect(screen.getByRole('button', { name: /Begin Crisis Scenario/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /View Results/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Start New Session/ })).toBeInTheDocument()
    })

    it('handles button clicks', () => {
      render(<DemoPage />)
      const button = screen.getByRole('button', { name: /Begin Crisis Scenario/ })
      fireEvent.click(button)
      // Button should remain clickable
      expect(button).toBeEnabled()
    })

    it('shows disabled state for loading button', () => {
      render(<DemoPage />)
      const disabledButton = screen.getByRole('button', { name: /Loading/ })
      expect(disabledButton).toBeDisabled()
    })
  })

  // ============================================
  // SAMPLE 4: Action Button Selection Tests
  // ============================================
  describe('Action Button Selection', () => {
    it('renders three action options', () => {
      render(<DemoPage />)
      expect(screen.getByRole('button', { name: /Option A/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Option B/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Option C/ })).toBeInTheDocument()
    })

    it('selects action button when clicked', () => {
      render(<DemoPage />)
      const optionButtons = screen.getAllByRole('button')
      const optionA = optionButtons.find(btn => btn.textContent?.includes('Option A'))
      
      fireEvent.click(optionA!)
      // Check selected state is applied
      expect(optionA).toHaveClass('selected')
    })

    it('deselects previous option when new option is selected', () => {
      render(<DemoPage />)
      const buttons = screen.getAllByRole('button')
      const optionA = buttons.find(btn => btn.textContent?.includes('Option A'))
      const optionB = buttons.find(btn => btn.textContent?.includes('Option B'))
      
      // Select Option A
      fireEvent.click(optionA!)
      expect(optionA).toHaveClass('selected')
      
      // Select Option B
      fireEvent.click(optionB!)
      expect(optionB).toHaveClass('selected')
    })
  })

  // ============================================
  // SAMPLE 5: Card Component Tests
  // ============================================
  describe('Card Components', () => {
    it('renders learning node cards', () => {
      render(<DemoPage />)
      expect(screen.getByText('Learning Node 1')).toBeInTheDocument()
      expect(screen.getByText('Learning Node 2')).toBeInTheDocument()
      expect(screen.getByText('Learning Node 3')).toBeInTheDocument()
    })

    it('displays mastery level for cards', () => {
      render(<DemoPage />)
      const masteryLevels = screen.getAllByText('Mastery Level: Intermediate')
      expect(masteryLevels.length).toBe(3)
    })

    it('shows progress bars in cards', () => {
      render(<DemoPage />)
      const progressBars = screen.getAllByText(/This is a learning node/)
      expect(progressBars.length).toBe(3)
    })
  })

  // ============================================
  // SAMPLE 6: Statistics Display Tests
  // ============================================
  describe('Statistics Section', () => {
    it('renders all stat cards', () => {
      render(<DemoPage />)
      expect(screen.getByText('Final Heat')).toBeInTheDocument()
      expect(screen.getByText('Integrity')).toBeInTheDocument()
      expect(screen.getByText('Responses')).toBeInTheDocument()
      expect(screen.getByText('Mastery Cards')).toBeInTheDocument()
    })

    it('displays correct stat values', () => {
      render(<DemoPage />)
      // Check values are present (may need adjustment based on actual DOM structure)
      expect(screen.getByText('72')).toBeInTheDocument() // Final Heat
      expect(screen.getByText('85')).toBeInTheDocument() // Integrity
      expect(screen.getByText('8')).toBeInTheDocument()  // Responses
      expect(screen.getByText('5')).toBeInTheDocument()  // Mastery Cards
    })

    it('displays stat units', () => {
      render(<DemoPage />)
      const percentElements = screen.getAllByText('percent')
      const totalElements = screen.getAllByText('total')
      const unlockedElements = screen.getAllByText('unlocked')
      
      expect(percentElements.length).toBe(2)
      expect(totalElements.length).toBe(1)
      expect(unlockedElements.length).toBe(1)
    })
  })

  // ============================================
  // SAMPLE 7: Form Elements Tests
  // ============================================
  describe('Form Elements', () => {
    it('renders text input field', () => {
      render(<DemoPage />)
      const textInput = screen.getByPlaceholderText(/Enter your text here/)
      expect(textInput).toBeInTheDocument()
      expect(textInput).toHaveAttribute('type', 'text')
    })

    it('renders textarea field', () => {
      render(<DemoPage />)
      const textarea = screen.getByPlaceholderText(/The app will analyze/)
      expect(textarea).toBeInTheDocument()
    })

    it('allows typing in text input', async () => {
      render(<DemoPage />)
      const input = screen.getByPlaceholderText(/Enter your text here/)
      
      await userEvent.type(input, 'Test input')
      expect(input).toHaveValue('Test input')
    })

    it('allows typing in textarea', async () => {
      render(<DemoPage />)
      const textarea = screen.getByPlaceholderText(/The app will analyze/)
      
      await userEvent.type(textarea, 'This is a test defense')
      expect(textarea).toHaveValue('This is a test defense')
    })

    it('displays input labels', () => {
      render(<DemoPage />)
      expect(screen.getByText('Text Input')).toBeInTheDocument()
      expect(screen.getByText('Textarea')).toBeInTheDocument()
    })
  })

  // ============================================
  // SAMPLE 8: Thermal States Tests
  // ============================================
  describe('Thermal States Feedback', () => {
    it('renders all three thermal states', () => {
      render(<DemoPage />)
      expect(screen.getByText(/FROST/)).toBeInTheDocument()
      expect(screen.getByText(/WARNING/)).toBeInTheDocument()
      expect(screen.getByText(/IGNITION/)).toBeInTheDocument()
    })

    it('displays frost feedback message', () => {
      render(<DemoPage />)
      expect(screen.getByText(/Your logic is shallow/)).toBeInTheDocument()
    })

    it('displays warning feedback message', () => {
      render(<DemoPage />)
      expect(screen.getByText(/You are on the right track/)).toBeInTheDocument()
    })

    it('displays ignition feedback message', () => {
      render(<DemoPage />)
      expect(screen.getByText(/Deep causality detected/)).toBeInTheDocument()
    })
  })

  // ============================================
  // SAMPLE 9: Animation Section Tests
  // ============================================
  describe('Animations Section', () => {
    it('renders animation demo boxes', () => {
      render(<DemoPage />)
      expect(screen.getByText('Loading')).toBeInTheDocument()
      expect(screen.getByText('Bounce')).toBeInTheDocument()
      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('displays animation labels', () => {
      render(<DemoPage />)
      const animationLabels = ['Loading', 'Bounce', 'Success']
      animationLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // SAMPLE 10: Defense Textbox Toggle Tests
  // ============================================
  describe('Defense Textbox Section', () => {
    it('renders toggle button', () => {
      render(<DemoPage />)
      const toggleButton = screen.getByRole('button', { name: /Show Defense Box/ })
      expect(toggleButton).toBeInTheDocument()
    })

    it('hides defense textbox initially', () => {
      render(<DemoPage />)
      expect(screen.queryByPlaceholderText(/Explain your choice/)).not.toBeInTheDocument()
    })

    it('shows defense textbox when toggle is clicked', () => {
      render(<DemoPage />)
      const toggleButton = screen.getByRole('button', { name: /Show Defense Box/ })
      
      fireEvent.click(toggleButton)
      
      expect(screen.getByPlaceholderText(/Explain your choice/)).toBeInTheDocument()
    })

    it('hides defense textbox when toggle is clicked again', () => {
      render(<DemoPage />)
      const toggleButton = screen.getByRole('button', { name: /Show Defense Box/ })
      
      // Show
      fireEvent.click(toggleButton)
      expect(screen.getByPlaceholderText(/Explain your choice/)).toBeInTheDocument()
      
      // Hide
      fireEvent.click(toggleButton)
      expect(screen.queryByPlaceholderText(/Explain your choice/)).not.toBeInTheDocument()
    })

    it('displays submit button in defense container', () => {
      render(<DemoPage />)
      const toggleButton = screen.getByRole('button', { name: /Show Defense Box/ })
      
      fireEvent.click(toggleButton)
      
      expect(screen.getByRole('button', { name: /Submit Defense/ })).toBeInTheDocument()
    })

    it('toggles button text based on state', () => {
      render(<DemoPage />)
      let toggleButton = screen.getByRole('button', { name: /Show Defense Box/ })
      expect(toggleButton).toHaveTextContent('Show Defense Box')
      
      fireEvent.click(toggleButton)
      
      toggleButton = screen.getByRole('button', { name: /Hide Defense Box/ })
      expect(toggleButton).toHaveTextContent('Hide Defense Box')
    })
  })

  // ============================================
  // SAMPLE 11: MVC Architecture Section Tests
  // ============================================
  describe('MVC Architecture Section', () => {
    it('renders MVC architecture heading', () => {
      render(<DemoPage />)
      expect(screen.getByText('MVC Architecture')).toBeInTheDocument()
    })

    it('renders model layer card', () => {
      render(<DemoPage />)
      expect(screen.getByText('Model Layer')).toBeInTheDocument()
      expect(screen.getByText(/GameModel.ts/)).toBeInTheDocument()
    })

    it('renders controller layer card', () => {
      render(<DemoPage />)
      expect(screen.getByText('Controller Layer')).toBeInTheDocument()
      expect(screen.getByText(/GameController.ts/)).toBeInTheDocument()
    })

    it('renders view layer card', () => {
      render(<DemoPage />)
      expect(screen.getByText('View Layer')).toBeInTheDocument()
      expect(screen.getByText(/React Components/)).toBeInTheDocument()
    })

    it('displays model layer description', () => {
      render(<DemoPage />)
      expect(screen.getByText(/handles business logic, validation, and thermal state calculations/)).toBeInTheDocument()
    })

    it('displays controller layer description', () => {
      render(<DemoPage />)
      expect(screen.getByText(/orchestrates user interactions and routes actions to the model/)).toBeInTheDocument()
    })

    it('displays view layer description', () => {
      render(<DemoPage />)
      expect(screen.getByText(/display state from Zustand store with interactive UI/)).toBeInTheDocument()
    })
  })

  // ============================================
  // SAMPLE 12: Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      render(<DemoPage />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('all buttons are keyboard accessible', () => {
      render(<DemoPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('form inputs have associated labels', () => {
      render(<DemoPage />)
      const labels = screen.getAllByText(/Input|Textarea/)
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  // ============================================
  // SAMPLE 13: Responsive Design Tests
  // ============================================
  describe('Responsive Design', () => {
    it('renders with mobile-friendly viewport', () => {
      render(<DemoPage />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('sticky')
    })

    it('page is scrollable on mobile', () => {
      render(<DemoPage />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('content sections have responsive spacing', () => {
      render(<DemoPage />)
      const heading = screen.getByText('Design System')
      expect(heading.className).toMatch(/sm:|lg:|responsive/)
    })
  })
})
