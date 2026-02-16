import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payments() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'student'
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data.filter(s => s.active));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const viewAllPayments = () => {
    setViewMode('all');
    setSelectedStudent(null);
    setShowPaymentForm(false);
    setSelectedMonths([]);
  };

  const handleStudentSelect = (e) => {
    const student = students.find(s => s.id === e.target.value);
    setSelectedStudent(student);
    setShowPaymentForm(!!student);
    setSelectedMonths([]);
    if (student) {
      setViewMode('student');
    }
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 12 months and next 3 months
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
      .filter(p => p.studentId === studentId)
      .flatMap(p => p.months);
  };

  const toggleMonth = (monthKey) => {
    setSelectedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey].sort()
    );
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMonths.length === 0) {
      alert('Please select at least one month');
      return;
    }

    const amount = selectedStudent.monthlyFee * selectedMonths.length;

    try {
      await axios.post('/api/payments', {
        studentId: selectedStudent.id,
        amount,
        months: selectedMonths,
        paymentDate,
        remarks
      });

      alert('Payment recorded successfully!');
      fetchPayments();
      resetForm();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment. Please try again.');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await axios.delete(`/api/payments/${paymentId}`);
        fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
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

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  const getStudentPayments = (studentId) => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
  };

  const getStudentTotalPaid = (studentId) => {
    return payments
      .filter(p => p.studentId === studentId)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getStudentPaidMonthsCount = (studentId) => {
    const paidMonths = getPaidMonths(studentId);
    return paidMonths.length;
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
      <div className="page-header">
        <h2 className="page-title">Fee Payments</h2>
        {viewMode === 'student' && (
          <button className="btn btn-secondary" onClick={viewAllPayments}>
            ← Back to All Students
          </button>
        )}
      </div>

      {viewMode === 'all' ? (
        // ALL STUDENTS VIEW - Like diary index
        <div className="students-ledger-list">
          <h3>Select Student to View/Add Payments (Like Your Diary Pages)</h3>
          <p className="helper-text">Click on any student to see their complete payment record</p>
          
          <div className="student-cards-grid">
            {students.map(student => {
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
                  <div className="student-card-header">
                    <h4>{student.name}</h4>
                    <span className="student-class">{student.class}</span>
                  </div>
                  <div className="student-card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Monthly Fee:</span>
                      <span className="stat-value">₹{student.monthlyFee}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Paid:</span>
                      <span className="stat-value amount">₹{totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Months Paid:</span>
                      <span className="stat-value">{monthsPaid} months</span>
                    </div>
                    {lastPayment && (
                      <div className="stat-item">
                        <span className="stat-label">Last Payment:</span>
                        <span className="stat-value">{formatDate(lastPayment.paymentDate)}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <span className="view-link">Click to view ledger →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // SINGLE STUDENT VIEW - Like a diary page
        <div className="student-ledger-view">
          <div className="ledger-header">
            <div className="student-info-banner">
              <h3>📖 Payment Ledger: {selectedStudent.name}</h3>
              <div className="student-details">
                <span>Class: {selectedStudent.class}</span>
                <span>Monthly Fee: ₹{selectedStudent.monthlyFee}</span>
                <span>Phone: {selectedStudent.phone}</span>
                <span>Parent: {selectedStudent.parentName}</span>
              </div>
            </div>
            
            <div className="ledger-summary">
              <div className="summary-card">
                <span className="summary-label">Total Paid</span>
                <span className="summary-value">₹{getStudentTotalPaid(selectedStudent.id).toFixed(2)}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Months Paid</span>
                <span className="summary-value">{getStudentPaidMonthsCount(selectedStudent.id)} months</span>
              </div>
            </div>
          </div>

          <div className="add-payment-section">
            <button 
              className="btn btn-primary"
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              {showPaymentForm ? '✕ Cancel' : '+ Add New Payment'}
            </button>
          </div>

          {showPaymentForm && (
            <div className="payment-form-container">
              <h3>Add Payment for {selectedStudent.name}</h3>
              <form onSubmit={handlePaymentSubmit} className="payment-form">
            <div className="months-section">
              <label>Select Months to Pay For *</label>
              <p className="helper-text">
                Click on months to select/deselect. Green = Already paid, Blue = Selected
              </p>
              
              <div className="months-grid">
                {monthOptions.map(month => {
                  const isPaid = paidMonths.includes(month.key);
                  const isSelected = selectedMonths.includes(month.key);
                  
                  return (
                    <button
                      key={month.key}
                      type="button"
                      className={`month-btn ${isPaid ? 'paid' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isPaid && toggleMonth(month.key)}
                      disabled={isPaid}
                    >
                      {month.name}
                      {isPaid && ' ✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMonths.length > 0 && (
              <div className="payment-summary">
                <h4>Payment Summary</h4>
                <p>Months selected: {selectedMonths.length}</p>
                <p>Monthly fee: ₹{selectedStudent.monthlyFee}</p>
                <p className="total-amount">
                  <strong>Total Amount: ₹{(selectedStudent.monthlyFee * selectedMonths.length).toFixed(2)}</strong>
                </p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Remarks (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g., Paid by Paytm, Cash, etc."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Record Payment
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
            </div>
          )}

          {/* PAYMENT HISTORY FOR THIS STUDENT - Like diary page entries */}
          <div className="student-payment-history">
            <h3>Payment History</h3>
            <div className="table-container">
              <table className="data-table ledger-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Months Paid For</th>
                    <th>Amount</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getStudentPayments(selectedStudent.id).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No payments recorded yet for {selectedStudent.name}
                      </td>
                    </tr>
                  ) : (
                    getStudentPayments(selectedStudent.id).map(payment => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td className="months-list">
                          {payment.months.map(m => formatMonthName(m)).join(', ')}
                        </td>
                        <td className="amount">₹{parseFloat(payment.amount).toFixed(2)}</td>
                        <td>{payment.remarks || '-'}</td>
                        <td className="actions">
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => handleDeletePayment(payment.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {getStudentPayments(selectedStudent.id).length > 0 && (
                    <tr className="total-row">
                      <td colSpan="2"><strong>Total</strong></td>
                      <td className="amount"><strong>₹{getStudentTotalPaid(selectedStudent.id).toFixed(2)}</strong></td>
                      <td colSpan="2"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;