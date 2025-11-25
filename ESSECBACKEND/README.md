# ESSEC Backend API

Backend API for managing ESSEC Solar Engineering projects using Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://atlas-sql-6905f1ddf2f3995cea16fdc9-bugh7j.a.query.mongodb.net/ESSEC?ssl=true&authSource=admin
NODE_ENV=development
```

**Note:** If your MongoDB Atlas cluster requires authentication, you'll need to add your username and password to the connection string in the format:
```
MONGODB_URI=mongodb://username:password@atlas-sql-6905f1ddf2f3995cea16fdc9-bugh7j.a.query.mongodb.net/ESSEC?ssl=true&authSource=admin
```

Replace `username` and `password` with your MongoDB Atlas credentials.

4. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a single project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Health Check

- `GET /api/health` - Check API status

## Project Schema

```javascript
{
  name: String (required),
  location: String (required),
  year: Number (required, 2000-2100),
  duration: String (required),
  image: String (required),
  video: String (optional),
  description: String (required),
  challenges: [String],
  executionMethods: [String],
  results: [String],
  technicalNotes: String,
  gallery: [String]
}
```

## Example Project Object

```json
{
  "name": "Commercial Solar Farm",
  "location": "Industrial Zone, City Center",
  "year": 2023,
  "duration": "18 months",
  "image": "/projects/commercial-1.jpg",
  "video": "/projects/commercial-video.mp4",
  "description": "A large-scale 5MW commercial solar farm...",
  "challenges": [
    "Large area coverage requiring extensive planning",
    "Integration with existing electrical infrastructure"
  ],
  "executionMethods": [
    "Comprehensive site survey and shadow analysis",
    "Custom mounting system design"
  ],
  "results": [
    "5MW installed capacity generating 7,500 MWh annually",
    "80% reduction in electricity costs"
  ],
  "technicalNotes": "System includes 12,500 monocrystalline panels...",
  "gallery": [
    "/projects/commercial-1.jpg",
    "/projects/commercial-2.jpg"
  ]
}
```
