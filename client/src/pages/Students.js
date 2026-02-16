import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    phone: '',
    class: '',
    monthlyFee: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent.id}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      
      fetchStudents();
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      parentName: student.parentName,
      phone: student.phone,
      class: student.class,
      monthlyFee: student.monthlyFee
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parentName: '',
      phone: '',
      class: '',
      monthlyFee: ''
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  return (
    <div className="students-page">
      <div className="page-header">
        <h2 className="page-title">Students Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-row">
              <div className="form-group">
                <label>Student Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter student name"
                />
              </div>

              <div className="form-group">
                <label>Parent Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter parent name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Class/Grade *</label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 10th, 12th Science"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monthly Fee (₹) *</label>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter monthly fee"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Parent Name</th>
              <th>Phone</th>
              <th>Class</th>
              <th>Monthly Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No students added yet. Click "Add Student" to get started.
                </td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.parentName}</td>
                  <td>{student.phone}</td>
                  <td>{student.class}</td>
                  <td className="amount">₹{parseFloat(student.monthlyFee).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${student.active ? 'active' : 'inactive'}`}>
                      {student.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(student)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(student.id)}
                      title="Delete"
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
  );
}

export default Students;
