import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    currentMonthRevenue: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, paymentsRes, studentsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/payments'),
        axios.get('/api/students')
      ]);

      setStats(statsRes.data);
      setStudents(studentsRes.data);
      
      // Get 5 most recent payments
      const recent = paymentsRes.data
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5);
      setRecentPayments(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="dashboard">
      <h2 className="page-title">Dashboard</h2>
      
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
            <h3>Average Fee</h3>
            <p className="stat-value">
              {stats.activeStudents > 0 
                ? formatCurrency(stats.totalRevenue / stats.activeStudents) 
                : '₹0.00'}
            </p>
            <span className="stat-label">Per Student</span>
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
                <th>Months Paid</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No payments recorded yet</td>
                </tr>
              ) : (
                recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{getStudentName(payment.studentId)}</td>
                    <td className="amount">{formatCurrency(payment.amount)}</td>
                    <td>{payment.months.length} month(s)</td>
                    <td>{formatDate(payment.paymentDate)}</td>
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
