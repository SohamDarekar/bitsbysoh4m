# bitsbysoh4m Blog

A personal blog site.

Link: https://bitsbysoh4m.netlify.app/

## Development

### Testing Newsletter Functionality

To test if newsletter subscriptions are working correctly with your MongoDB database:

1. First, create a `.env` file based on `.env.example` with your MongoDB credentials.

2. Start the API server:
   ```
   npm run api
   ```

3. Test the database connection:
   ```
   npm run test-db
   ```

4. Test a subscription with a sample email:
   ```
   npm run test-sub
   ```
   Or with a specific email:
   ```
   node src/api/test-db.js your-test-email@example.com
   ```

5. For local development, run both the API server and Astro:
   ```
   # Terminal 1
   npm run api
   
   # Terminal 2
   npm run dev
   ```

6. Submit the newsletter form in the browser - check console logs in both your browser and API terminal to track the process.

### API Endpoints

- `GET http://localhost:4000/api/health` - Check if API is running
- `GET http://localhost:4000/api/test-db` - Test database connection
- `POST http://localhost:4000/api/subscribe` - Subscribe an email




