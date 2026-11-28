import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { registerCompany } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerCompany(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Register Company</h1>
        <p className="text-sm text-slate-500 mb-6">Create your WorkSphere SaaS workspace</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="companyName"
            required
            value={form.companyName}
            onChange={handleChange}
            placeholder="Company Name (e.g. TechNova Pvt Ltd)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            name="companyEmail"
            type="email"
            required
            value={form.companyEmail}
            onChange={handleChange}
            placeholder="Company Email (e.g. info@technova.in)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="Admin Full Name"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Admin Email"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            placeholder="Password (min 6 characters)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Creating workspace...' : 'Create Workspace'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}