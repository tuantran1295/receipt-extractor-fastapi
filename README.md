# Receipt Extractor - Full Stack Application

A full-stack application that automatically extracts information from receipt images using AI. The application consists of a NestJS backend that processes receipt images using OpenAI's GPT-4o vision model, and a React frontend that provides an intuitive interface for uploading receipts and viewing extracted details.

## Features

### Backend
- **Receipt Image Processing**: Accepts receipt images (JPG, JPEG, PNG) and extracts structured data
- **AI-Powered Extraction**: Uses OpenAI GPT-4o to extract receipt details (date, currency, vendor, items, tax, total)
- **Data Persistence**: Stores extracted receipt data in SQLite database
- **Image Storage**: Saves uploaded images to the `uploads/` directory
- **RESTful API**: Clean API endpoints for receipt extraction
- **Comprehensive Testing**: Unit tests covering all scenarios

### Frontend
- **File Upload**: Drag-and-drop or file picker interface
- **File Validation**: Validates file types and size (max 10MB)
- **File Preview**: Preview selected receipt image before submission
- **Loading States**: Animated loading spinner and progress bar
- **Error Handling**: User-friendly error messages with retry functionality
- **Results Display**: Beautiful layout showing extracted receipt details
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

- **Node.js v18+** and **npm v10+**
- **OpenAI API key** (get one from https://platform.openai.com/api-keys)
- Two terminal windows (one for backend, one for frontend)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fullstack-receipt-extractor-tuantran1295
```

### 2. Set Up the Backend

```bash
# Navigate to backend directory
cd engineer-assessment-backend/

# Set Node.js version (if using nvm)
nvm install && nvm use

# Install dependencies
npm install
```

#### Create .env File

You need to create a `.env` file in the `engineer-assessment-backend/` directory with your OpenAI API key.

**Option 1: Using command line (Linux/Mac)**
```bash
cd engineer-assessment-backend/
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
EOF
```

**Option 2: Using command line (Windows PowerShell)**
```powershell
cd engineer-assessment-backend/
@"
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8
```

**Option 3: Manual creation**
1. Navigate to the `engineer-assessment-backend/` directory
2. Create a new file named `.env` (make sure it starts with a dot)
3. Add the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```
4. Save the file

**Important**: 
- Replace `your_openai_api_key_here` with your actual OpenAI API key
- Get your API key from https://platform.openai.com/api-keys
- The `.env` file should be in the `engineer-assessment-backend/` directory (same level as `package.json`)

### 3. Set Up the Frontend

```bash
# Navigate to frontend directory (from project root)
cd engineer-assessment-frontend/

# Set Node.js version (if using nvm)
nvm install && nvm use

# Install dependencies
npm install
```

## Running the Application

### Start the Backend

In the first terminal window:

```bash
cd engineer-assessment-backend/
npm run start:dev
```

The backend server will start on `http://localhost:3000`. You should see:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [NestApplication] Nest application successfully started
```

### Start the Frontend

In the second terminal window:

```bash
cd engineer-assessment-frontend/
npm run dev
```

The frontend will start on a port (typically `http://localhost:5173/`). The terminal will display the exact URL.

### Access the Application

1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173/`)
2. You should see the Receipt Extractor landing page
3. Upload a receipt image (JPG, JPEG, or PNG) to extract details

## Usage

1. **Upload a Receipt**: Click "Select File" or drag and drop a receipt image
2. **Preview**: Review the selected file in the preview screen
3. **Extract**: Click "Extract Details" to process the receipt
4. **View Results**: See the extracted details including date, currency, vendor, items, tax, and total
5. **Extract Another**: Click "Extract Another Receipt" to start over

## API Endpoints

### Health Check
```bash
GET http://localhost:3000/
```

### Extract Receipt Details
```bash
POST http://localhost:3000/extract-receipt-details
Content-Type: multipart/form-data
Body: Form data with field name "image" containing the image file
```

**Response Example:**
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

## Testing

### Backend Tests

```bash
cd engineer-assessment-backend/
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
```

### Frontend Linting

```bash
cd engineer-assessment-frontend/
npm run lint
```

## Build for Production

### Backend

```bash
cd engineer-assessment-backend/
npm run build
npm run start:prod
```

### Frontend

```bash
cd engineer-assessment-frontend/
npm run build        # Creates optimized build in dist/
npm run preview      # Preview production build locally
```

## Project Structure

```
fullstack-receipt-extractor-tuantran1295/
├── engineer-assessment-backend/     # NestJS backend
│   ├── src/
│   │   ├── receipt.controller.ts   # Receipt extraction endpoint
│   │   ├── receipt.service.ts       # Business logic
│   │   └── receipt.entity.ts        # Database entity
│   ├── uploads/                     # Stored receipt images
│   └── receipts.db                  # SQLite database (auto-created)
│
├── engineer-assessment-frontend/    # React frontend
│   └── src/
│       ├── App.tsx                  # Main application component
│       ├── main.tsx                 # Entry point
│       └── index.css                # Styles
│
└── sample-receipts/                 # Sample receipt images for testing
```

## Technologies Used

### Backend
- **NestJS**: Framework for building efficient Node.js server-side applications
- **TypeORM**: ORM for database operations
- **SQLite**: Lightweight database for data persistence
- **OpenAI API**: GPT-4o vision model for receipt extraction
- **Multer**: File upload handling
- **Jest**: Testing framework

### Frontend
- **React 19**: UI library for building the interface
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with animations and gradients

## Troubleshooting

### Backend Issues

1. **"OPENAI_API_KEY is not defined"**
   - Ensure you have created a `.env` file in `engineer-assessment-backend/`
   - Check that the `.env` file contains your OpenAI API key

2. **"Cannot connect to database"**
   - The SQLite database is created automatically on first run
   - Ensure the application has write permissions in the project directory

3. **"File upload fails"**
   - Check file size (max 10MB)
   - Ensure file format is JPG, JPEG, or PNG
   - Verify the `uploads/` directory exists and is writable

4. **"AI extraction fails"**
   - Verify your OpenAI API key is valid
   - Check your OpenAI account has sufficient credits
   - Ensure the image is clear and readable

### Frontend Issues

1. **"Failed to fetch" or CORS errors**
   - Ensure the backend is running on `http://localhost:3000`
   - Verify CORS is enabled in the backend (should be enabled by default)
   - Check browser console for detailed error messages

2. **Image not displaying in results**
   - Verify the backend is serving static files from `/uploads/` directory
   - Check that the `image_url` in the response is correct
   - Ensure backend CORS allows image requests

3. **Port already in use**
   - Vite will automatically try the next available port
   - Check the terminal output for the actual port number

## Environment Variables

### Backend (.env file in `engineer-assessment-backend/`)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## Sample Receipts

The project includes a `sample-receipts/` directory containing various receipt images that you can use for testing during development.

## License

UNLICENSED
