import { useState, useRef } from 'react'

type ReceiptItem = {
  item_name: string
  item_cost: number
}

type ReceiptData = {
  id: string
  date: string
  currency: string
  vendor_name: string
  receipt_items: ReceiptItem[]
  tax: number
  total: number
  image_url: string
}

type AppState = 'landing' | 'preview' | 'loading' | 'error' | 'results'

function App() {
  const [state, setState] = useState<AppState>('landing')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_BASE_URL = 'http://localhost:3000'
  const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
  const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png']

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isValidFileType = (file: File): boolean => {
    // Check MIME type
    if (ACCEPTED_FILE_TYPES.includes(file.type)) {
      return true
    }
    // Fallback: check file extension
    const fileName = file.name.toLowerCase()
    return ACCEPTED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!isValidFileType(file)) {
      setErrorMessage('Invalid file type. Only .jpg, .jpeg, and .png files are allowed.')
      setState('error')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.')
      setState('error')
      return
    }

    setSelectedFile(file)
    setState('preview')
    setErrorMessage('')
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setState('landing')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    setState('loading')
    setErrorMessage('')

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await fetch(`${API_BASE_URL}/extract-receipt-details`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

      const data: ReceiptData = await response.json()
      setReceiptData(data)
      setState('results')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to extract receipt details')
      setState('error')
    }
  }

  const handleStartNew = () => {
    setSelectedFile(null)
    setReceiptData(null)
    setErrorMessage('')
    setState('landing')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    if (!isValidFileType(file)) {
      setErrorMessage('Invalid file type. Only .jpg, .jpeg, and .png files are allowed.')
      setState('error')
      return
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.')
      setState('error')
      return
    }

    setSelectedFile(file)
    setState('preview')
    setErrorMessage('')
  }

  // Landing Page
  if (state === 'landing') {
    return (
      <div className="app-container">
        <div className="landing-page">
          <h1>Receipt Extractor</h1>
          <p className="subtitle">Upload a receipt image to extract key details automatically</p>
          
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📄</div>
            <p className="upload-text">Drag and drop your receipt image here</p>
            <p className="upload-or">or</p>
            <label htmlFor="file-input" className="upload-button">
              Select File
            </label>
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <p className="upload-hint">Accepted formats: JPG, JPEG, PNG (Max 10MB)</p>
          </div>
        </div>
      </div>
    )
  }

  // Selected File Preview
  if (state === 'preview' && selectedFile) {
    return (
      <div className="app-container">
        <div className="preview-page">
          <h1>Selected File</h1>
          
          <div className="file-preview-card">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <h3>{selectedFile.name}</h3>
              <p className="file-details">
                <span>Type: {selectedFile.type}</span>
                <span>Size: {formatFileSize(selectedFile.size)}</span>
              </p>
            </div>
            <div className="file-preview-image">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Receipt preview"
              />
            </div>
          </div>

          <div className="action-buttons">
            <button className="button button-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="button button-primary" onClick={handleSubmit}>
              Extract Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading State
  if (state === 'loading') {
    return (
      <div className="app-container">
        <div className="loading-page">
          <h1>Extracting Receipt Details</h1>
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Processing your receipt image...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (state === 'error') {
    return (
      <div className="app-container">
        <div className="error-page">
          <div className="error-icon">⚠️</div>
          <h1>Error</h1>
          <p className="error-message">{errorMessage || 'An error occurred while processing your receipt'}</p>
          <button className="button button-primary" onClick={handleStartNew}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Results State
  if (state === 'results' && receiptData) {
    return (
      <div className="app-container">
        <div className="results-page">
          <h1>Extraction Results</h1>
          
          <div className="results-content">
            <div className="receipt-image-section">
              <h2>Receipt Image</h2>
              <img
                src={`${API_BASE_URL}${receiptData.image_url}`}
                alt="Receipt"
                className="receipt-image"
              />
            </div>

            <div className="receipt-details-section">
              <h2>Extracted Details</h2>
              <div className="details-container">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{receiptData.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Currency:</span>
                  <span className="detail-value">{receiptData.currency}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vendor:</span>
                  <span className="detail-value">{receiptData.vendor_name}</span>
                </div>

                <div className="items-section">
                  <h3>Items</h3>
                  <div className="items-list">
                    {receiptData.receipt_items.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-name">{item.item_name}</span>
                        <span className="item-cost">
                          {receiptData.currency} {item.item_cost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="totals-section">
                  <div className="total-row">
                    <span className="total-label">Tax/GST:</span>
                    <span className="total-value">
                      {receiptData.currency} {receiptData.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="total-row total-row-final">
                    <span className="total-label">Total:</span>
                    <span className="total-value">
                      {receiptData.currency} {receiptData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="button button-primary" onClick={handleStartNew}>
            Extract Another Receipt
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default App
