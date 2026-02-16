# 🚀 Quick Start Guide

## For First Time Setup

### 1. Install Node.js
If you don't have Node.js installed:
- Go to https://nodejs.org/
- Download and install the LTS version
- Verify installation by opening terminal/command prompt and typing:
  ```
  node --version
  npm --version
  ```

### 2. Install Project Dependencies

Open terminal/command prompt in the project folder and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Start the Application

**Terminal 1 - Start Backend Server:**
```bash
npm start
```
Keep this terminal open. You should see: "Server running on port 5000"

**Terminal 2 - Start Frontend:**
```bash
cd client
npm start
```
This will automatically open http://localhost:3000 in your browser

### 4. Start Using

1. **Add Students First:**
   - Click "Students" in the navigation
   - Click "Add Student"
   - Fill in all details and save
   - Repeat for all 25 students

2. **Record Payments:**
   - Click "Payments" in the navigation
   - Select a student from dropdown
   - Click on the months to mark as paid
   - Enter payment date
   - Click "Record Payment"

3. **View Dashboard:**
   - Click "Dashboard" to see overview
   - Check total collections, active students, etc.

## Daily Use

Just run these two commands in two separate terminals:

```bash
# Terminal 1
npm start

# Terminal 2
cd client
npm start
```

Then open http://localhost:3000 in your browser!

## Tips for Your Mom

- ✅ Already paid months show in GREEN - she can't select them again
- 🔵 When she clicks a month, it turns BLUE (selected)
- 💰 Total amount calculates automatically
- 📅 She can select multiple months if parent pays advance
- 💾 Everything saves automatically
- 🔄 Data persists - it won't be lost when closing browser

## Backup Your Data

The file `server/data.json` contains all students and payment records.

**To Backup:**
1. Stop both servers (Ctrl+C in terminals)
2. Copy `server/data.json` to a safe location (USB drive, Google Drive, etc.)

**To Restore:**
1. Replace `server/data.json` with your backup file
2. Start the servers again

## Common Issues

**"Port 3000 is already in use"**
- Another app is using port 3000
- Close other applications or restart your computer

**"Cannot find module"**
- Run `npm install` in the main folder
- Run `npm install` in the client folder

**Changes not showing**
- Refresh the browser (Ctrl+R or Cmd+R)
- Clear browser cache (Ctrl+Shift+Delete)

**Data disappeared**
- Check if `server/data.json` exists
- Restore from backup if available

## Need Help?

Check the browser console:
- Press F12 in browser
- Go to "Console" tab
- Look for red error messages

Check the server terminal:
- Look for error messages in the terminal where you ran `npm start`
