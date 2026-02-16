# 📁 Project File Structure

This document explains what each file does in the project.

```
tuition-fee-manager/
│
├── 📄 README.md                    # Main documentation
├── 📄 QUICK_START.md              # Quick setup guide
├── 📄 USER_GUIDE.md               # Guide for your mom
├── 📄 package.json                # Backend dependencies list
├── 📄 .gitignore                  # Git ignore file
├── 📄 setup.bat                   # Windows setup script
├── 📄 setup.sh                    # Mac/Linux setup script
│
├── 📂 server/                     # Backend (Node.js + Express)
│   ├── 📄 index.js               # Main server file
│   ├── 📄 data.json              # Your actual data (auto-created)
│   └── 📄 data.sample.json       # Sample data for reference
│
└── 📂 client/                     # Frontend (React)
    ├── 📄 package.json           # Frontend dependencies list
    │
    ├── 📂 public/
    │   └── 📄 index.html         # Main HTML file
    │
    └── 📂 src/
        ├── 📄 index.js           # React entry point
        ├── 📄 App.js             # Main app component with routing
        │
        ├── 📂 pages/
        │   ├── 📄 Dashboard.js   # Dashboard page component
        │   ├── 📄 Students.js    # Students management page
        │   └── 📄 Payments.js    # Payments management page
        │
        └── 📂 styles/
            └── 📄 App.css        # All styling
```

---

## 📝 Important Files Explained

### Backend Files

**server/index.js**
- The main server file
- Handles all API requests
- Manages data reading/writing
- Provides endpoints for students and payments

**server/data.json**
- Stores all your actual data
- Created automatically when you first run the app
- Contains students and payments
- **IMPORTANT:** Backup this file regularly!

### Frontend Files

**client/src/App.js**
- Main application component
- Sets up navigation between pages
- Creates the top navigation bar

**client/src/pages/Dashboard.js**
- Shows overview statistics
- Displays recent payments
- Shows total students, revenue, etc.

**client/src/pages/Students.js**
- Add, edit, delete students
- View all students in a table
- Manage student information

**client/src/pages/Payments.js**
- Record fee payments
- Select months to pay for
- View payment history
- Visual month selection

**client/src/styles/App.css**
- All styling and colors
- Makes the app look good
- Handles responsive design

---

## 🔧 Configuration Files

**package.json (root)**
- Lists backend dependencies
- Defines server start commands

**client/package.json**
- Lists frontend dependencies
- Defines React scripts

**.gitignore**
- Tells git which files to ignore
- Keeps node_modules out of version control

---

## 💾 Data Storage

All data is stored in: **server/data.json**

**Structure:**
```json
{
  "students": [
    {
      "id": "unique_id",
      "name": "Student Name",
      "parentName": "Parent Name",
      "phone": "Phone Number",
      "class": "Class/Grade",
      "monthlyFee": "Fee Amount",
      "joinedDate": "Date",
      "active": true/false
    }
  ],
  "payments": [
    {
      "id": "unique_id",
      "studentId": "student's_id",
      "amount": "Total Amount",
      "months": ["2024-01", "2024-02"],
      "paymentDate": "Date",
      "remarks": "Payment notes"
    }
  ]
}
```

---

## 🚀 How It All Works Together

1. **Backend (server/index.js)**
   - Runs on port 5000
   - Provides API endpoints
   - Reads/writes data.json

2. **Frontend (React app)**
   - Runs on port 3000
   - Shows beautiful UI
   - Calls backend API
   - Displays data to user

3. **Data Flow:**
   ```
   User interacts with UI (Frontend)
   ↓
   Frontend calls API (Backend)
   ↓
   Backend reads/writes data.json
   ↓
   Response sent back to Frontend
   ↓
   UI updates to show new data
   ```

---

## 🛠️ Customization

If you want to customize:

**Colors/Styling:**
- Edit `client/src/styles/App.css`

**Add Features:**
- Backend: Edit `server/index.js`
- Frontend: Edit respective page in `client/src/pages/`

**Change Port:**
- Backend: Change `PORT` in `server/index.js`
- Frontend: Will auto-adjust via proxy

---

## 📦 Dependencies Used

**Backend:**
- express: Web server framework
- cors: Handle cross-origin requests
- body-parser: Parse JSON requests

**Frontend:**
- react: UI library
- react-router-dom: Navigation
- axios: HTTP requests

All these are installed automatically when you run `npm install`

---

## 🔐 Security Note

This is a local application meant for single-user use. It:
- Stores data locally (not in cloud)
- Runs on your computer only
- Not accessible from internet
- Suitable for personal/home use

For multi-user or internet access, additional security measures would be needed.

---

## 🎯 Next Steps

1. Run setup script (`setup.bat` or `setup.sh`)
2. Start both servers (backend and frontend)
3. Open browser to http://localhost:3000
4. Start adding students and recording payments!

---

**Questions?** Refer to README.md or QUICK_START.md for detailed instructions.
