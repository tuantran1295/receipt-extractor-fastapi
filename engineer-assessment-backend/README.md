# Receipt Extractor Backend (NestJS)

A NestJS backend application that automatically extracts information from receipt images using AI. The application processes uploaded receipt images, extracts key details using OpenAI's GPT-4o vision model, and stores the extracted data in a SQLite database.

## Features

- **Receipt Image Processing**: Accepts receipt images (JPG, JPEG, PNG) and extracts structured data
- **AI-Powered Extraction**: Uses OpenAI GPT-4o to extract receipt details including:
  - Date
  - Currency (3-character code)
  - Vendor name
  - Receipt items (name and cost)
  - Tax/GST amount
  - Total amount
- **Data Persistence**: Stores extracted receipt data in SQLite database
- **Image Storage**: Saves uploaded images to the `uploads/` directory
- **RESTful API**: Clean API endpoints for receipt extraction
- **Comprehensive Testing**: Unit tests covering all scenarios

## Project Structure

```
src/
├── app.controller.ts       # Root endpoint controller
├── app.module.ts           # Main application module
├── app.service.ts          # Application service
├── main.ts                 # Application entry point
├── receipt.controller.ts   # Receipt extraction endpoint
├── receipt.service.ts      # Receipt extraction business logic
├── receipt.entity.ts       # Receipt database entity
└── receipt.service.spec.ts # Unit tests
```

## Prerequisites

- Node.js v18+ and npm v10+
- OpenAI API key (get one from https://platform.openai.com/api-keys)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd engineer-assessment-backend/
   ```

2. **Set your Node.js environment:**
   - Run `nvm install && nvm use`, or
   - Manually set your node to v18+ and npm to v10+

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Build Instructions

### Development Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Production Build

```bash
npm run build
npm run start:prod
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

### Debug Mode

```bash
npm run start:debug
```

### Production Mode

```bash
npm run start:prod
```

The server will start on `http://localhost:3000` (or the port specified in `process.env.PORT`).

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:cov
```

## API Endpoints

### 1. Health Check

**GET** `/`

Check if the server is running.

**Response:**
```
Hello World!
```

**CURL Example:**
```bash
curl http://localhost:3000/
```

### 2. Extract Receipt Details

**POST** `/extract-receipt-details`

Extract receipt information from an uploaded image file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with field name `image` containing the image file
- Supported formats: `.jpg`, `.jpeg`, `.png`
- Max file size: 10MB

**Response:**
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
    },
    {
      "item_name": "Item 2",
      "item_cost": 5.25
    }
  ],
  "tax": 1.50,
  "total": 17.25,
  "image_url": "/uploads/uuid-filename.jpg"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3000/extract-receipt-details \
  -F "image=@/path/to/your/receipt.jpg"
```

**CURL Example with response formatting:**
```bash
curl -X POST http://localhost:3000/extract-receipt-details \
  -F "image=@/path/to/your/receipt.jpg" \
  | jq
```

**Error Responses:**

- **400 Bad Request** - Invalid file type:
  ```json
  {
    "statusCode": 400,
    "message": "Invalid file type. Only .jpg, .jpeg, and .png files are allowed."
  }
  ```

- **400 Bad Request** - No file provided:
  ```json
  {
    "statusCode": 400,
    "message": "No image file provided"
  }
  ```

- **400 Bad Request** - Invalid AI response:
  ```json
  {
    "statusCode": 400,
    "message": "Invalid response from AI model: [error details]"
  }
  ```

- **500 Internal Server Error** - AI service error:
  ```json
  {
    "statusCode": 500,
    "message": "AI model returned a 500 error"
  }
  ```

## Database

The application uses SQLite for data persistence. The database file `receipts.db` is created automatically in the project root directory.

**Database Schema:**
- Table: `receipts`
- Fields:
  - `id` (UUID, Primary Key)
  - `date` (Date)
  - `currency` (VARCHAR(3))
  - `vendor_name` (VARCHAR)
  - `receipt_items` (JSON)
  - `tax` (DECIMAL)
  - `total` (DECIMAL)
  - `image_url` (VARCHAR)

## File Storage

Uploaded images are stored in the `uploads/` directory in the project root. Images are accessible via the URL path returned in the `image_url` field of the response.

**Example:**
If `image_url` is `/uploads/abc123.jpg`, the image can be accessed at:
```
http://localhost:3000/uploads/abc123.jpg
```

## Implementation Details

### What Was Implemented

1. **Receipt Service (`extractReceiptDetails` function)**:
   - Validates file types (JPG, JPEG, PNG only)
   - Sends image to OpenAI GPT-4o vision model for extraction
   - Validates and parses AI response
   - Saves image file to `uploads/` directory
   - Persists extracted data to SQLite database
   - Returns structured receipt data

2. **API Endpoint (`POST /extract-receipt-details`)**:
   - Accepts multipart/form-data with image file
   - Validates file presence
   - Calls receipt service
   - Returns extracted receipt details

3. **Unit Tests**:
   - Successful extraction from valid image
   - Incorrect file type handling
   - Empty AI response handling
   - Invalid JSON response handling
   - Poorly-formed AI response handling
   - 500 error from AI service handling
   - Additional validation tests

### Technologies Used

- **NestJS**: Framework for building efficient Node.js server-side applications
- **TypeORM**: ORM for database operations
- **SQLite**: Lightweight database for data persistence
- **OpenAI API**: GPT-4o vision model for receipt extraction
- **Multer**: File upload handling
- **Jest**: Testing framework

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY is not defined"**
   - Ensure you have created a `.env` file with your OpenAI API key
   - Check that the `.env` file is in the project root directory

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

## License

UNLICENSED

<!-- dummy commit to allow PR -->
