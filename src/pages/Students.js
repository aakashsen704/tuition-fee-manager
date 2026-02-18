import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent_name: '',
    phone: '',
    class: '',
    monthly_fee: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setStudents(data);
    else console.error(error);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingStudent) {
      await supabase
        .from('students')
        .update(formData)
        .eq('id', editingStudent.id);
    } else {
      await supabase
        .from('students')
        .insert([{ ...formData }]);
    }

    fetchStudents();
    resetForm();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      parent_name: student.parent_name,
      phone: student.phone,
      class: student.class,
      monthly_fee: student.monthly_fee
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await supabase.from('students').delete().eq('id', id);
      fetchStudents();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent_name: '',
      phone: '',
      class: '',
      monthly_fee: ''
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
                />
              </div>

              <div className="form-group">
                <label>Parent Name *</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Class *</label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Monthly Fee (₹) *</label>
              <input
                type="number"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleInputChange}
                required
              />
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
              <th>Name</th>
              <th>Parent</th>
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
                  No students added yet.
                </td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.parent_name}</td>
                  <td>{student.phone}</td>
                  <td>{student.class}</td>
                  <td className="amount">₹{student.monthly_fee}</td>
                  <td>
                    <span className={`status-badge ${student.active ? 'active' : 'inactive'}`}>
                      {student.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(student)}>✏️</button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(student.id)}>🗑️</button>
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
