import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

function Payments() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Wrap fetchAllData with useCallback to avoid ESLint warning
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchPayments()]);
    setLoading(false);
  }, []);

  // ✅ Correct useEffect
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ✅ Fetch active students
  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('active', true);

    if (data) {
      setStudents(data);
    }
  };

  // ✅ Fetch all payments
  const fetchPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (data) {
      setPayments(data);
    }
  };

  const viewAllPayments = () => {
    setViewMode('all');
    setSelectedStudent(null);
    setShowPaymentForm(false);
    setSelectedMonths([]);
  };

  // Generate month options
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 12; i >= -3; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      months.push({ key: monthKey, name: monthName });
    }

    return months;
  };

  const getPaidMonths = (studentId) => {
    return payments
      .filter(p => p.student_id === studentId)
      .flatMap(p => p.months || []);
  };

  const toggleMonth = (monthKey) => {
    setSelectedMonths(prev =>
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey].sort()
    );
  };

  // ✅ Record payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (selectedMonths.length === 0) {
      alert('Please select at least one month');
      return;
    }

    const amount = selectedStudent.monthly_fee * selectedMonths.length;

    const { error } = await supabase.from('payments').insert([
      {
        student_id: selectedStudent.id,
        amount,
        months: selectedMonths,
        payment_date: paymentDate,
        remarks: remarks || ''
      }
    ]);

    if (error) {
      alert('Error recording payment');
      console.error(error);
      return;
    }

    alert('Payment recorded successfully!');
    fetchPayments();
    fetchStudents();
    resetForm();
  };

  // ✅ Delete payment
  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Delete this payment?')) {
      await supabase.from('payments').delete().eq('id', paymentId);
      fetchPayments();
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setShowPaymentForm(false);
    setSelectedMonths([]);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setViewMode('all');
  };

  const getStudentPayments = (studentId) => {
    return payments
      .filter(p => p.student_id === studentId)
      .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));
  };

  const getStudentTotalPaid = (studentId) => {
    return payments
      .filter(p => p.student_id === studentId)
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const getStudentPaidMonthsCount = (studentId) => {
    return getPaidMonths(studentId).length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const monthOptions = generateMonthOptions();
  const paidMonths = selectedStudent ? getPaidMonths(selectedStudent.id) : [];

  return (
    <div className="payments-page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        <div className="page-header">
          <h2 className="page-title">Fee Payments</h2>
          {viewMode === 'student' && (
            <button className="btn btn-secondary" onClick={viewAllPayments}>
              ← Back
            </button>
          )}
        </div>
        
        <button 
          onClick={fetchAllData} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#94a3b8' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading payments...</p>
        </div>
      ) : viewMode === 'all' ? (
        <div className="student-cards-grid">
          {students.length === 0 ? (
            <p>No active students found</p>
          ) : (
            students.map(student => {
              const totalPaid = getStudentTotalPaid(student.id);
              const monthsPaid = getStudentPaidMonthsCount(student.id);
              const studentPayments = getStudentPayments(student.id);
              const lastPayment = studentPayments[studentPayments.length - 1];

              return (
                <div
                  key={student.id}
                  className="student-ledger-card"
                  onClick={() => {
                    setSelectedStudent(student);
                    setViewMode('student');
                  }}
                >
                  <h4>{student.name}</h4>
                  <p>Class: {student.class}</p>
                  <p>Monthly Fee: ₹{student.monthly_fee}</p>
                  <p>Total Paid: ₹{totalPaid.toFixed(2)}</p>
                  <p>Months Paid: {monthsPaid}</p>
                  {lastPayment && (
                    <p>Last Payment: {formatDate(lastPayment.payment_date)}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div>
          <h3>Ledger: {selectedStudent.name}</h3>

          <button
            className="btn btn-primary"
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            {showPaymentForm ? 'Cancel' : '+ Add Payment'}
          </button>

          {showPaymentForm && (
            <form onSubmit={handlePaymentSubmit}>
              <div className="months-grid">
                {monthOptions.map(month => {
                  const isPaid = paidMonths.includes(month.key);
                  const isSelected = selectedMonths.includes(month.key);

                  return (
                    <button
                      key={month.key}
                      type="button"
                      disabled={isPaid}
                      onClick={() => toggleMonth(month.key)}
                      className={`month-btn ${isPaid ? 'paid' : ''} ${isSelected ? 'selected' : ''}`}
                    >
                      {month.name}
                    </button>
                  );
                })}
              </div>

              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <button type="submit" className="btn btn-primary">
                Record Payment
              </button>
            </form>
          )}

          <h3>Payment History</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Months</th>
                <th>Amount</th>
                <th>Remarks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {getStudentPayments(selectedStudent.id).map(payment => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td>
                    {payment.months.map(m => formatMonthName(m)).join(', ')}
                  </td>
                  <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                  <td>{payment.remarks}</td>
                  <td>
                    <button onClick={() => handleDeletePayment(payment.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Payments;
