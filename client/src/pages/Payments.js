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

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchPayments()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').eq('active', true);
    if (data) setStudents(data);
  };

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
    if (data) setPayments(data);
  };

  const viewAllPayments = () => {
    setViewMode('all');
    setSelectedStudent(null);
    setShowPaymentForm(false);
    setSelectedMonths([]);
  };

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
    return payments.filter(p => p.student_id === studentId).flatMap(p => p.months || []);
  };

  const toggleMonth = (monthKey) => {
    setSelectedMonths(prev =>
      prev.includes(monthKey) ? prev.filter(m => m !== monthKey) : [...prev, monthKey].sort()
    );
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (selectedMonths.length === 0) { alert('Please select at least one month'); return; }
    const amount = selectedStudent.monthly_fee * selectedMonths.length;
    const { error } = await supabase.from('payments').insert([{
      student_id: selectedStudent.id,
      amount,
      months: selectedMonths,
      payment_date: paymentDate,
      remarks: remarks || ''
    }]);
    if (error) { alert('Error recording payment'); console.error(error); return; }
    alert('Payment recorded successfully!');
    fetchPayments();
    fetchStudents();
    resetForm();
  };

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
    return payments.filter(p => p.student_id === studentId).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const getStudentPaidMonthsCount = (studentId) => getPaidMonths(studentId).length;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');

  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const monthOptions = generateMonthOptions();
  const paidMonths = selectedStudent ? getPaidMonths(selectedStudent.id) : [];

  return (
    <div className="payments-page">
      <style>{`
        /* ── Header ── */
        .pay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pay-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* ── Student Cards Grid ── */
        .student-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .student-ledger-card {
          background: white;
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.15s, box-shadow 0.15s;
          border: 2px solid transparent;
        }
        .student-ledger-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.15);
          border-color: #6366f1;
        }
        .student-ledger-card h4 {
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 10px 0;
        }
        .student-ledger-card p {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0;
        }
        .card-amount {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: #6366f1 !important;
          margin-top: 8px !important;
        }

        /* ── Month Grid ── */
        .months-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 16px 0;
        }
        .month-btn {
          padding: 10px 6px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          color: #374151;
          text-align: center;
        }
        .month-btn:hover:not(:disabled) {
          border-color: #6366f1;
          background: #eef2ff;
        }
        .month-btn.paid {
          background: #f0fdf4;
          border-color: #86efac;
          color: #16a34a;
          cursor: not-allowed;
        }
        .month-btn.selected {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }

        /* ── Payment Form ── */
        .payment-form-box {
          background: white;
          border-radius: 14px;
          padding: 20px;
          margin: 16px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .payment-form-box h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 14px 0;
        }
        .form-inputs-row {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .form-inputs-row input {
          flex: 1;
          min-width: 140px;
          padding: 10px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .form-inputs-row input:focus {
          border-color: #6366f1;
        }

        /* ── Payment History Cards (mobile) ── */
        .payment-history-cards {
          display: none;
        }
        .pay-history-card {
          background: white;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .pay-history-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .pay-history-date {
          font-size: 13px;
          color: #94a3b8;
        }
        .pay-history-amount {
          font-weight: 700;
          font-size: 16px;
          color: #6366f1;
        }
        .pay-history-months {
          font-size: 13px;
          color: #374151;
          margin-bottom: 4px;
          line-height: 1.5;
        }
        .pay-history-remarks {
          font-size: 12px;
          color: #94a3b8;
          font-style: italic;
        }
        .pay-history-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        /* ── Ledger Summary ── */
        .ledger-summary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 14px;
          padding: 18px 20px;
          color: white;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .ledger-summary h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .ledger-summary p {
          font-size: 13px;
          opacity: 0.8;
          margin: 0;
        }
        .ledger-total {
          font-size: 24px;
          font-weight: 800;
        }

        /* ── Refresh Button ── */
        .refresh-btn {
          padding: 10px 18px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
        .refresh-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .student-cards-grid {
            grid-template-columns: 1fr;
          }
          .months-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .payment-history-table { display: none; }
          .payment-history-cards { display: block; }
          .ledger-summary {
            flex-direction: column;
            align-items: flex-start;
          }
          .pay-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* Header */}
      <div className="pay-header">
        <div className="pay-header-left">
          <h2 className="page-title">Fee Payments</h2>
          {viewMode === 'student' && (
            <button className="btn btn-secondary" onClick={viewAllPayments}>← Back</button>
          )}
        </div>
        <button className="refresh-btn" onClick={fetchAllData} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
          <p>Loading payments...</p>
        </div>

      ) : viewMode === 'all' ? (
        <div className="student-cards-grid">
          {students.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No active students found</p>
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
                  onClick={() => { setSelectedStudent(student); setViewMode('student'); }}
                >
                  <h4>👤 {student.name}</h4>
                  <p>📚 Class: {student.class}</p>
                  <p>💳 Monthly Fee: ₹{student.monthly_fee}</p>
                  <p>📆 Months Paid: {monthsPaid}</p>
                  {lastPayment && <p>🕐 Last: {formatDate(lastPayment.payment_date)}</p>}
                  <p className="card-amount">₹{totalPaid.toFixed(2)} total</p>
                </div>
              );
            })
          )}
        </div>

      ) : (
        <div>
          {/* Ledger Summary Banner */}
          <div className="ledger-summary">
            <div>
              <h3>👤 {selectedStudent.name}</h3>
              <p>Class {selectedStudent.class} · ₹{selectedStudent.monthly_fee}/month</p>
            </div>
            <div className="ledger-total">
              ₹{getStudentTotalPaid(selectedStudent.id).toFixed(2)}
            </div>
          </div>

          {/* Add Payment Button */}
          <button
            className="btn btn-primary"
            style={{ marginBottom: '16px' }}
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            {showPaymentForm ? '✕ Cancel' : '+ Add Payment'}
          </button>

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="payment-form-box">
              <h4>Select Months to Pay</h4>
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
                        {isPaid ? '✓ ' : ''}{month.name}
                      </button>
                    );
                  })}
                </div>

                {selectedMonths.length > 0 && (
                  <div style={{
                    background: '#eef2ff',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '14px',
                    fontSize: '14px',
                    color: '#4338ca',
                    fontWeight: '600'
                  }}>
                    💰 Total: ₹{(selectedStudent.monthly_fee * selectedMonths.length).toFixed(2)}
                    &nbsp;({selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''})
                  </div>
                )}

                <div className="form-inputs-row">
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  💳 Record Payment
                </button>
              </form>
            </div>
          )}

          {/* Payment History */}
          <h3 style={{ margin: '20px 0 12px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
            📋 Payment History
          </h3>

          {/* Desktop Table */}
          <div className="table-container payment-history-table">
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
                {getStudentPayments(selectedStudent.id).length === 0 ? (
                  <tr><td colSpan="5" className="no-data">No payments yet</td></tr>
                ) : (
                  getStudentPayments(selectedStudent.id).map(payment => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.payment_date)}</td>
                      <td>{payment.months.map(m => formatMonthName(m)).join(', ')}</td>
                      <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                      <td>{payment.remarks || '—'}</td>
                      <td>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                        >🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="payment-history-cards">
            {getStudentPayments(selectedStudent.id).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No payments yet</p>
            ) : (
              getStudentPayments(selectedStudent.id).map(payment => (
                <div className="pay-history-card" key={payment.id}>
                  <div className="pay-history-card-top">
                    <span className="pay-history-date">📅 {formatDate(payment.payment_date)}</span>
                    <span className="pay-history-amount">₹{parseFloat(payment.amount).toFixed(2)}</span>
                  </div>
                  <div className="pay-history-months">
                    📆 {payment.months.map(m => formatMonthName(m)).join(', ')}
                  </div>
                  {payment.remarks && (
                    <div className="pay-history-remarks">💬 {payment.remarks}</div>
                  )}
                  <div className="pay-history-card-bottom">
                    <span></span>
                    <button
                      className="delete-btn"
                      style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px' }}
                      onClick={() => handleDeletePayment(payment.id)}
                    >🗑️ Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;