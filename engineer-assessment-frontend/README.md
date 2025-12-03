# Receipt Extractor Frontend (React)

A React frontend application that allows users to upload receipt images and extract key details using AI. The application communicates with a NestJS backend API to process receipt images and display extracted information.

## Features

- **File Upload**: Drag-and-drop or file picker interface for uploading receipt images
- **File Validation**: Validates file types (JPG, JPEG, PNG only) and file size (max 10MB)
- **File Preview**: Preview selected receipt image before submission
- **Loading States**: Animated loading spinner and progress bar during extraction
- **Error Handling**: User-friendly error messages with retry functionality
- **Results Display**: Beautiful layout showing extracted receipt details including:
  - Date
  - Currency (3-character code)
  - Vendor name
  - Receipt items (name and cost)
  - Tax/GST amount
  - Total amount
  - Receipt image
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Gradient backgrounds, smooth animations, and intuitive user experience

## Project Structure

```
src/
├── App.tsx          # Main application component with all states
├── main.tsx         # Application entry point
└── index.css        # Global styles and component styling
```

## Prerequisites

- Node.js v18+ and npm v10+
- Backend API running on `http://localhost:3000` (see [backend README](../engineer-assessment-backend/README.md))

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd engineer-assessment-frontend/
   ```

2. **Set your Node.js environment:**
   - Run `nvm install && nvm use`, or
   - Alternatively manually set your node to v18+ and npm to v10+

3. **Install dependencies:**
   ```bash
   npm install
   ```
   Note: Ensure you have properly set your node version before this step

## Running the Application

### Development Mode

```bash
npm run dev
```

The terminal will display the port to view the frontend application in your browser (e.g. `http://localhost:5173/`).

The application will automatically reload when you make changes to the source code.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Usage

1. **Start the Backend API:**
   ```bash
   cd ../engineer-assessment-backend
   npm run start:dev
   ```
   The backend should be running on `http://localhost:3000`

2. **Start the Frontend:**
   ```bash
   cd engineer-assessment-frontend
   npm run dev
   ```

3. **Open the Application:**
   - Navigate to the URL shown in the terminal (typically `http://localhost:5173/`)
   - You should see the Receipt Extractor landing page

4. **Extract Receipt Details:**
   - Click "Select File" or drag and drop a receipt image (JPG, JPEG, or PNG)
   - Review the selected file in the preview screen
   - Click "Extract Details" to process the receipt
   - Wait for the extraction to complete
   - View the extracted details and receipt image
   - Click "Extract Another Receipt" to start over

## Application States

The application manages the following states:

1. **Landing Page**: Initial state with file upload interface
2. **File Preview**: Shows selected file details and preview
3. **Loading**: Displays progress during receipt extraction
4. **Error**: Shows error messages with retry option
5. **Results**: Displays extracted receipt details and image

## API Integration

The frontend communicates with the backend API endpoint:

- **Endpoint**: `POST http://localhost:3000/extract-receipt-details`
- **Request**: Multipart form data with field name `image`
- **Response**: JSON object containing extracted receipt details

### Response Format

```json
{
  "id": "uuid-string",
  "date": "2024-01-15",
  "currency": "USD",
  "vendor_name": "Store Name",
  "receipt_items": [
    {
      "item_name": "Item 1",
      "item_cost": 10.50
    }
  ],
  "tax": 1.50,
  "total": 17.25,
  "image_url": "/uploads/uuid-filename.jpg"
}
```

## Implementation Details

### What Was Implemented

1. **Complete UI Flow**:
   - Landing page with drag-and-drop file upload
   - File preview with validation
   - Loading state with animations
   - Error handling with user-friendly messages
   - Results display with scrollable content

2. **File Validation**:
   - MIME type checking (`image/jpeg`, `image/png`)
   - File extension validation (`.jpg`, `.jpeg`, `.png`)
   - File size validation (max 10MB)

3. **State Management**:
   - React hooks (`useState`, `useRef`) for state management
   - Proper state transitions between application states
   - Error state handling

4. **Styling**:
   - Modern gradient design
   - Responsive layout for mobile and desktop
   - Smooth animations and transitions
   - Custom scrollbar styling
   - Card-based UI components

5. **User Experience Enhancements**:
   - Drag-and-drop file upload
   - File size formatting (Bytes, KB, MB)
   - Image preview before submission
   - Loading animations
   - Clear error messages
   - Easy navigation between states

### Technologies Used

- **React 19**: UI library for building the interface
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with animations and gradients

## Troubleshooting

### Common Issues

1. **"Failed to fetch" or CORS errors**
   - Ensure the backend is running on `http://localhost:3000`
   - Verify CORS is enabled in the backend (should be enabled by default)
   - Check browser console for detailed error messages

2. **File upload fails**
   - Verify file type is JPG, JPEG, or PNG
   - Check file size is under 10MB
   - Ensure backend API is running and accessible

3. **Image not displaying in results**
   - Verify the backend is serving static files from `/uploads/` directory
   - Check that the `image_url` in the response is correct
   - Ensure backend CORS allows image requests

4. **Port already in use**
   - Vite will automatically try the next available port
   - Check the terminal output for the actual port number
   - Or specify a different port in `vite.config.ts`

## Development

### Linting

```bash
npm run lint
```

### Project Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Sample Receipts

The root project includes a `sample-receipts/` directory containing various receipt images that you can use for testing during development.

## License

UNLICENSED
