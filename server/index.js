const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ students: [], payments: [] }, null, 2));
}

// Helper functions to read/write data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { students: [], payments: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ============ STUDENTS ROUTES ============

// Get all students
app.get('/api/students', (req, res) => {
  const data = readData();
  res.json(data.students);
});

// Add new student
app.post('/api/students', (req, res) => {
  const data = readData();
  const newStudent = {
    id: Date.now().toString(),
    name: req.body.name,
    parentName: req.body.parentName,
    phone: req.body.phone,
    class: req.body.class,
    monthlyFee: req.body.monthlyFee,
    joinedDate: req.body.joinedDate || new Date().toISOString(),
    active: true
  };
  
  data.students.push(newStudent);
  writeData(data);
  res.status(201).json(newStudent);
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const data = readData();
  const index = data.students.findIndex(s => s.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  data.students[index] = { ...data.students[index], ...req.body };
  writeData(data);
  res.json(data.students[index]);
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const data = readData();
  data.students = data.students.filter(s => s.id !== req.params.id);
  writeData(data);
  res.json({ message: 'Student deleted' });
});

// ============ PAYMENTS ROUTES ============

// Get all payments
app.get('/api/payments', (req, res) => {
  const data = readData();
  res.json(data.payments);
});

// Get payments for a specific student
app.get('/api/payments/student/:studentId', (req, res) => {
  const data = readData();
  const payments = data.payments.filter(p => p.studentId === req.params.studentId);
  res.json(payments);
});

// Add new payment
app.post('/api/payments', (req, res) => {
  const data = readData();
  const newPayment = {
    id: Date.now().toString(),
    studentId: req.body.studentId,
    amount: req.body.amount,
    months: req.body.months, // Array of month strings like ["2024-01", "2024-02"]
    paymentDate: req.body.paymentDate || new Date().toISOString(),
    remarks: req.body.remarks || ''
  };
  
  data.payments.push(newPayment);
  writeData(data);
  res.status(201).json(newPayment);
});

// Delete payment
app.delete('/api/payments/:id', (req, res) => {
  const data = readData();
  data.payments = data.payments.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ message: 'Payment deleted' });
});

// ============ DASHBOARD/STATS ROUTES ============

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  const data = readData();
  const activeStudents = data.students.filter(s => s.active).length;
  const totalRevenue = data.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  // Current month collections
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPayments = data.payments.filter(p => 
    p.paymentDate.startsWith(currentMonth)
  );
  const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  res.json({
    totalStudents: data.students.length,
    activeStudents,
    totalRevenue,
    currentMonthRevenue
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
