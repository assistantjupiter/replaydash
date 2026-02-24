# Basic HTML Example

Simple HTML page demonstrating ReplayDash integration.

## Features Demonstrated

- ✅ SDK initialization
- ✅ Session ID display
- ✅ User interaction tracking (clicks, form inputs)
- ✅ Console log capture
- ✅ Error capture
- ✅ User identification

## Setup

1. **Build the SDK:**
   ```bash
   cd ../../packages/sdk
   npm install
   npm run build
   ```

2. **Start the API server:**
   ```bash
   cd ../../packages/api
   npm install
   cp .env.example .env
   # Edit .env with your database config
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

3. **Open the example:**
   ```bash
   open index.html
   # or just drag it into your browser
   ```

4. **Interact with the page:**
   - Click the counter button
   - Fill out the form
   - Click "Submit Form"
   - Click "Trigger Error" to test error capture

5. **View the session:**
   ```bash
   cd ../../packages/dashboard
   npm install
   cp .env.example .env.local
   # Edit .env.local with API URL and key
   npm run dev
   ```

   Open http://localhost:3000/sessions and find your session!

## Notes

- Session data is sent to the API every 10 seconds or when 100+ events accumulate
- For production use, change `maskAllInputs` to `true` to protect user privacy
- Replace `dev-secret-key-change-in-production` with a real API key
