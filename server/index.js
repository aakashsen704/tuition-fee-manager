const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const transformed = (data || []).map(s => ({
      id: s.id, name: s.name, parentName: s.parent_name, phone: s.phone,
      class: s.class, monthlyFee: parseFloat(s.monthly_fee), joinedDate: s.joined_date, active: s.active
    }));
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add student
app.post('/api/students', async (req, res) => {
  try {
    const { data, error } = await supabase.from('students').insert([{
      name: req.body.name, parent_name: req.body.parentName, phone: req.body.phone,
      class: req.body.class, monthly_fee: req.body.monthlyFee, active: true
    }]).select().single();
    if (error) throw error;
    const transformed = {
      id: data.id, name: data.name, parentName: data.parent_name, phone: data.phone,
      class: data.class, monthlyFee: parseFloat(data.monthly_fee), joinedDate: data.joined_date, active: data.active
    };
    res.status(201).json(transformed);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('students').update({
      name: req.body.name, parent_name: req.body.parentName, phone: req.body.phone,
      class: req.body.class, monthly_fee: req.body.monthlyFee, active: req.body.active
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    const transformed = {
      id: data.id, name: data.name, parentName: data.parent_name, phone: data.phone,
      class: data.class, monthlyFee: parseFloat(data.monthly_fee), joinedDate: data.joined_date, active: data.active
    };
    res.json(transformed);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('students').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Student deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
    if (error) throw error;
    const transformed = (data || []).map(p => ({
      id: p.id, studentId: p.student_id, amount: parseFloat(p.amount),
      months: p.months, paymentDate: p.payment_date, remarks: p.remarks
    }));
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add payment
app.post('/api/payments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payments').insert([{
      student_id: req.body.studentId, amount: req.body.amount, months: req.body.months,
      payment_date: req.body.paymentDate || new Date().toISOString(), remarks: req.body.remarks || ''
    }]).select().single();
    if (error) throw error;
    const transformed = {
      id: data.id, studentId: data.student_id, amount: parseFloat(data.amount),
      months: data.months, paymentDate: data.payment_date, remarks: data.remarks
    };
    res.status(201).json(transformed);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete payment
app.delete('/api/payments/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('payments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { data: students } = await supabase.from('students').select('*');
    const { data: payments } = await supabase.from('payments').select('*');
    const activeStudents = (students || []).filter(s => s.active).length;
    const totalRevenue = (payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthPayments = (payments || []).filter(p => p.payment_date && p.payment_date.startsWith(currentMonth));
    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    res.json({ totalStudents: (students || []).length, activeStudents, totalRevenue, currentMonthRevenue });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'Supabase', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;
