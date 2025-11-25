# Admin Dashboard Setup Guide

This guide will help you set up and use the admin dashboard for managing ESSEC Solar Engineering projects.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **npm** or **yarn**

## Backend Setup

1. Navigate to the backend directory:
```bash
cd ESSECBACKEND
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://atlas-sql-6905f1ddf2f3995cea16fdc9-bugh7j.a.query.mongodb.net/ESSEC?ssl=true&authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

   **Note:** 
   - If your MongoDB Atlas cluster requires authentication, add your username and password:
     ```
     MONGODB_URI=mongodb://username:password@atlas-sql-6905f1ddf2f3995cea16fdc9-bugh7j.a.query.mongodb.net/ESSEC?ssl=true&authSource=admin
     ```
   - **IMPORTANT:** Change `JWT_SECRET` to a strong, random string in production!

4. Start MongoDB (if using local installation):
   - **Windows:** MongoDB should start automatically as a service
   - **Mac/Linux:** `sudo systemctl start mongod` or `brew services start mongodb-community`

5. **Create your first admin account:**
```bash
node scripts/createAdmin.js admin@example.com yourpassword "Admin Name"
```
   Replace `admin@example.com`, `yourpassword`, and `"Admin Name"` with your desired credentials.

6. Start the backend server:
```bash
npm run dev
```

The backend API will be running at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ESSEC
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create a `.env.local` file (optional, defaults to localhost:5000):
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:3001`

## Accessing the Admin Dashboard

1. Open your browser and navigate to:
```
http://localhost:3001/admin/login
```

2. **Login with your admin credentials:**
   - Enter the email and password you used when creating the admin account
   - Click "Sign in"
   - You'll be redirected to the admin dashboard

3. The admin dashboard includes:
   - A table listing all projects
   - Options to add, edit, view, or delete projects
   - Logout button in the top right

## Using the Admin Dashboard

### Adding a New Project

1. Click the **"Add New Project"** button
2. Fill in the required fields:
   - Name
   - Location
   - Year
   - Duration
   - Image URL
   - Description
3. Optionally add:
   - Video URL
   - Challenges (click "Add" after typing each one)
   - Execution Methods
   - Results
   - Technical Notes
   - Gallery Images
4. Click **"Create Project"**

### Editing a Project

1. Click the **Edit** icon (pencil) next to the project you want to edit
2. Modify the fields as needed
3. Click **"Update Project"**

### Viewing Project Details

1. Click the **View** icon (eye) next to any project
2. A modal will show all project details
3. Click the X button to close

### Deleting a Project

1. Click the **Delete** icon (trash) next to the project you want to delete
2. Confirm the deletion in the popup

## API Endpoints

The backend provides the following REST API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new admin (requires: email, password, name)
- `POST /api/auth/login` - Login admin (requires: email, password)
- `GET /api/auth/me` - Get current admin info (requires: Bearer token)

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get a single project (public)
- `POST /api/projects` - Create a new project (requires: Bearer token)
- `PUT /api/projects/:id` - Update a project (requires: Bearer token)
- `DELETE /api/projects/:id` - Delete a project (requires: Bearer token)

**Note:** Create, update, and delete operations require authentication. You must include the JWT token in the Authorization header: `Bearer <token>`

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify the MONGODB_URI in `.env` is correct
- Check if port 5000 is already in use

### Frontend can't connect to backend
- Ensure the backend is running on port 5000
- Check the `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in the backend (it should be by default)

### Projects not showing
- Check browser console for errors
- Verify MongoDB connection
- Ensure the backend API is accessible

## Security Notes

✅ **Authentication is now implemented!** The admin dashboard requires login.

**For production use, you should also:**

1. ✅ Authentication (JWT tokens) - **DONE**
2. ✅ Protected admin routes - **DONE**
3. Change `JWT_SECRET` in `.env` to a strong, random string
4. Add role-based access control (if you need multiple admin levels)
5. Implement rate limiting
6. Add input validation and sanitization (basic validation included)
7. Use HTTPS in production
8. Consider adding 2FA (two-factor authentication) for extra security

## Next Steps

- Add authentication to the admin dashboard
- Implement image upload functionality
- Add project search and filtering
- Export projects to CSV/PDF
- Add project status tracking (draft, published, etc.)

