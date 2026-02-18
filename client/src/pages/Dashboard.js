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
      const totalRevenue = paymentsData.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const currentMonthRevenue = paymentsData
        .filter(p => {
          const d = new Date(p.payment_date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({ totalStudents, activeStudents, totalRevenue, currentMonthRevenue });

      const recent = [...paymentsData]
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

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Delete this payment?')) {
      await supabase.from('payments').delete().eq('id', paymentId);
      fetchDashboardData();
    }
  };

  const handleResetMonthRevenue = async () => {
    if (!window.confirm('This will delete ALL payments for this month. Are you sure?')) return;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const { data: paymentsData } = await supabase.from('payments').select('*');
    const ids = paymentsData
      .filter(p => {
        const d = new Date(p.payment_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .map(p => p.id);
    if (ids.length === 0) { alert('No payments this month.'); return; }
    await supabase.from('payments').delete().in('id', ids);
    alert('This month payments reset!');
    fetchDashboardData();
  };

  const handleResetAllRevenue = async () => {
    if (!window.confirm('This will delete ALL payments forever. Are you sure?')) return;
    await supabase.from('payments').delete().neq('id', 0);
    alert('All payments deleted!');
    fetchDashboardData();
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '⚠️ Deleted';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');
  const formatCurrency = (a) => `₹${parseFloat(a || 0).toFixed(2)}`;

  return (
    <div className="dashboard">
      <style>{`
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .dash-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dash-btn {
          padding: 8px 14px;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }
        .btn-yellow { background: #f59e0b; }
        .btn-red { background: #ef4444; }
        .btn-indigo { background: #6366f1; }
        .btn-indigo:disabled { background: #94a3b8; cursor: not-allowed; }

        /* Mobile Recent Payments as Cards */
        .payment-cards {
          display: none;
        }
        .payment-card {
          background: white;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .payment-card-info { flex: 1; }
        .payment-card-name {
          font-weight: 600;
          font-size: 15px;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .payment-card-date {
          font-size: 12px;
          color: #94a3b8;
        }
        .payment-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .payment-card-amount {
          font-weight: 700;
          font-size: 16px;
          color: #6366f1;
        }
        .delete-btn {
          background: #fee2e2;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .dash-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .dash-actions {
            width: 100%;
          }
          .dash-btn {
            flex: 1;
            text-align: center;
            padding: 10px 8px;
            font-size: 12px;
          }
          .payment-table-wrap { display: none; }
          .payment-cards { display: block; }
          .page-title { font-size: 20px !important; }
        }
      `}</style>

      <div className="dash-header">
        <h2 className="page-title">Dashboard</h2>
        <div className="dash-actions">
          <button className="dash-btn btn-yellow" onClick={handleResetMonthRevenue}>
            🔄 Reset Month
          </button>
          <button className="dash-btn btn-red" onClick={handleResetAllRevenue}>
            🗑️ Reset All
          </button>
          <button className="dash-btn btn-indigo" onClick={fetchDashboardData} disabled={loading}>
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
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

        {/* Desktop Table */}
        <div className="table-container payment-table-wrap">
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
                    {loading ? 'Loading...' : 'No payments recorded yet'}
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
        <div className="payment-cards">
          {recentPayments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
              {loading ? 'Loading...' : 'No payments recorded yet'}
            </p>
          ) : (
            recentPayments.map(payment => (
              <div className="payment-card" key={payment.id}>
                <div className="payment-card-info">
                  <div className="payment-card-name">{getStudentName(payment.student_id)}</div>
                  <div className="payment-card-date">{formatDate(payment.payment_date)}</div>
                </div>
                <div className="payment-card-right">
                  <span className="payment-card-amount">{formatCurrency(payment.amount)}</span>
                  <button className="delete-btn" onClick={() => handleDeletePayment(payment.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;