import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    currentMonthRevenue: 0
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase.from('students').select('*');
      const { data: paymentsData } = await supabase.from('payments').select('*');

      if (!studentsData || !paymentsData) return;

      setStudents(studentsData);

      const totalStudents = studentsData.length;
      const activeStudents = studentsData.filter(s => s.active).length;

      const totalRevenue = paymentsData.reduce(
        (sum, payment) => sum + parseFloat(payment.amount || 0), 0
      );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const currentMonthRevenue = paymentsData
        .filter(payment => {
          const date = new Date(payment.payment_date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      setStats({ totalStudents, activeStudents, totalRevenue, currentMonthRevenue });

      const recent = paymentsData
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 5);

      setRecentPayments(recent);

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ✅ Delete a single payment
  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Delete this payment?')) {
      await supabase.from('payments').delete().eq('id', paymentId);
      fetchDashboardData();
    }
  };

  // ✅ Reset this month's payments
  const handleResetMonthRevenue = async () => {
    if (!window.confirm('This will delete ALL payments for this month. Are you sure?')) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const { data: paymentsData } = await supabase.from('payments').select('*');

    const monthPaymentIds = paymentsData
      .filter(payment => {
        const date = new Date(payment.payment_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .map(p => p.id);

    if (monthPaymentIds.length === 0) {
      alert('No payments found for this month.');
      return;
    }

    await supabase.from('payments').delete().in('id', monthPaymentIds);
    alert('This month payments reset successfully!');
    fetchDashboardData();
  };

  // ✅ Reset ALL revenue
  const handleResetAllRevenue = async () => {
    if (!window.confirm('This will delete ALL payments forever. Are you sure?')) return;
    await supabase.from('payments').delete().neq('id', 0);
    alert('All payments deleted!');
    fetchDashboardData();
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '⚠️ Deleted Student';
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');
  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  return (
    <div className="dashboard">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        <h2 className="page-title">Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleResetMonthRevenue}
            style={{
              padding: '10px 20px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Reset This Month
          </button>
          <button
            onClick={handleResetAllRevenue}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Reset All Revenue
          </button>
          <button
            onClick={fetchDashboardData}
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
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
            <span className="stat-label">{stats.activeStudents} Active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
            <span className="stat-label">All Time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>This Month</h3>
            <p className="stat-value">{formatCurrency(stats.currentMonthRevenue)}</p>
            <span className="stat-label">Current Month Collection</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Average Revenue</h3>
            <p className="stat-value">
              {stats.activeStudents > 0
                ? formatCurrency(stats.totalRevenue / stats.activeStudents)
                : '₹0.00'}
            </p>
            <span className="stat-label">Per Active Student</span>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Payments</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    {loading ? 'Loading payments...' : 'No payments recorded yet'}
                  </td>
                </tr>
              ) : (
                recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{getStudentName(payment.student_id)}</td>
                    <td className="amount">{formatCurrency(payment.amount)}</td>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;