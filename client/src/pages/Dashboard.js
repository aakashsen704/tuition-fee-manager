import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false); // NEW: Loading state

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchDashboardData();
}, []); 

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const { data: studentsData } = await supabase
        .from('students')
        .select('*');

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*');

      console.log('Students:', studentsData); // DEBUG
      console.log('Payments:', paymentsData); // DEBUG

      if (!studentsData || !paymentsData) return;

      setStudents(studentsData);

      const totalStudents = studentsData.length;
      const activeStudents = studentsData.filter(s => s.active).length;

      const totalRevenue = paymentsData.reduce(
        (sum, payment) => sum + parseFloat(payment.amount || 0),
        0
      );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const currentMonthRevenue = paymentsData
        .filter(payment => {
          const date = new Date(payment.payment_date);
          return (
            date.getMonth() === currentMonth &&
            date.getYear() === currentYear - 1900 // Fixed for Safari
          );
        })
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      setStats({
        totalStudents,
        activeStudents,
        totalRevenue,
        currentMonthRevenue
      });

      // Sort latest 5 payments
      const recent = paymentsData
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 5);

      setRecentPayments(recent);

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="dashboard">
      {/* NEW: Header with Refresh Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        <h2 className="page-title">Dashboard</h2>
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
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
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
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    {loading ? 'Loading payments...' : 'No payments recorded yet'}
                  </td>
                </tr>
              ) : (
                recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{getStudentName(payment.student_id)}</td>
                    <td className="amount">{formatCurrency(payment.amount)}</td>
                    <td>{formatDate(payment.payment_date)}</td>
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
