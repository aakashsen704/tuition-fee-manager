# 📚 Tuition Fee Manager

A full-stack web application to help tuition teachers manage student records and fee payments efficiently.

## Features

### ✨ Dashboard
- Overview of total students (active/inactive)
- Total revenue tracking
- Current month collections
- Recent payment history
- Quick statistics

### 👨‍🎓 Student Management
- Add new students with details (name, parent name, phone, class, monthly fee)
- Edit existing student information
- Delete students
- View all students in a organized table
- Track active/inactive status

### 💰 Payment Management
- Record fee payments for single or multiple months
- Visual month selection (paid months shown in green)
- Support for advance payments (pay for future months)
- Payment history with complete details
- Track which months have been paid for each student
- Add remarks/notes to payments (payment method, etc.)
- Automatic calculation of total amount based on selected months

### 📊 Key Capabilities
- No internet required after setup (works offline)
- All data stored locally in JSON file
- Easy to backup (just copy data.json file)
- Clean and intuitive interface
- Mobile responsive design
- No database setup needed

## Technology Stack

**Frontend:**
- React 18
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

**Backend:**
- Node.js with Express
- File-based storage (JSON)
- RESTful API architecture

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies

1. **Install server dependencies:**
```bash
cd tuition-fee-manager
npm install
```

2. **Install client dependencies:**
```bash
cd client
npm install
cd ..
```

### Step 2: Run the Application

You have two options:

**Option A: Run both server and client separately (Recommended for development)**

1. **Start the backend server** (in one terminal):
```bash
npm start
```
The server will run on `http://localhost:5000`

2. **Start the React frontend** (in another terminal):
```bash
cd client
npm start
```
The application will open automatically at `http://localhost:3000`

**Option B: Build and run in production mode**

1. **Build the React app:**
```bash
cd client
npm run build
cd ..
```

2. **Serve the built app** (you'll need to add static file serving to server/index.js)

### Step 3: Access the Application

Open your browser and go to: `http://localhost:3000`

## Project Structure

```
tuition-fee-manager/
├── client/                  # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Students.js
│   │   │   └── Payments.js
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/
│   ├── index.js            # Express server
│   └── data.json           # Data storage (created automatically)
├── package.json
└── README.md
```

## Usage Guide

### Adding a Student

1. Go to "Students" page
2. Click "Add Student" button
3. Fill in the student details:
   - Student Name
   - Parent Name
   - Phone Number
   - Class/Grade
   - Monthly Fee
4. Click "Add Student"

### Recording a Payment

1. Go to "Payments" page
2. Select a student from the dropdown
3. Click on the months you want to pay for
   - Green months = Already paid
   - Blue months = Currently selected
4. The total amount is calculated automatically
5. Select payment date
6. Add remarks if needed (optional)
7. Click "Record Payment"

### Viewing Payment History

- All payments are visible in the "Payment History" section on the Payments page
- Shows student name, amount, months paid for, and payment date
- Recent payments also appear on the Dashboard

## Data Backup

Your data is stored in `server/data.json`. To backup:

1. Stop the server
2. Copy `server/data.json` to a safe location
3. To restore, simply replace the file

## Troubleshooting

### Port already in use
If port 5000 or 3000 is already in use:
- Change the PORT in `server/index.js`
- Or stop the application using that port

### Cannot connect to server
- Make sure the backend server is running on port 5000
- Check if there are any firewall issues

### Data not saving
- Ensure the server has write permissions in the `server/` directory
- Check server console for any error messages

## Future Enhancements (Optional)

- SMS/WhatsApp payment reminders
- PDF receipt generation
- Export data to Excel
- Attendance tracking
- Multiple teacher support
- Cloud backup integration

## Support

For issues or questions, please check the console logs:
- **Backend logs**: Terminal where you ran `npm start`
- **Frontend logs**: Browser Developer Tools Console (F12)

## License

This project is created for educational purposes and personal use.

---

**Note for Your Mom:**
- The Dashboard shows a quick overview of everything
- Use the Students page to add all her students first
- Then use the Payments page to record fees as they come in
- The system will remember which months have been paid for each student
- She can click on multiple months if parents pay for 2-3 months together
- All data is saved automatically and will be there even after closing the browser!
