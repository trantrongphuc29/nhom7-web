import React, { useState, useEffect } from 'react';
import { mockData } from '../mocks/mockData';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setUsers(Array.isArray(mockData.users) ? [...mockData.users] : []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setUsers((prev) => [...prev, { id: Date.now(), name }]);
      setName('');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Không thể tạo user. Vui lòng thử lại.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUsers((prev) => prev.map((u) => (u.id === editId ? { ...u, name } : u)));
      setName('');
      setEditId(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Không thể cập nhật user. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    
    try {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Không thể xóa user. Vui lòng thử lại.');
    }
  };

  const startEdit = (user) => {
    setEditId(user.id);
    setName(user.name);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>
      
      <form onSubmit={editId ? handleUpdate : handleCreate} className="mb-8 bg-white p-6 rounded-xl shadow">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            {editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setName(''); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm">{user.id}</td>
                <td className="px-6 py-4 text-sm">{user.name}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-800 mr-4">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
