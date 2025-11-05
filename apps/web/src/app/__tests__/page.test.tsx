import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', {
      name: /健康營養追蹤系統/i,
    })
    
    expect(heading).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<Home />)
    
    expect(screen.getByText(/拍照辨識餐點營養/i)).toBeInTheDocument()
    expect(screen.getByText(/AI 聊天健康顧問/i)).toBeInTheDocument()
    expect(screen.getByText(/第三方平台整合/i)).toBeInTheDocument()
    expect(screen.getByText(/週度健康報告/i)).toBeInTheDocument()
    expect(screen.getByText(/遊戲化任務系統/i)).toBeInTheDocument()
  })
})