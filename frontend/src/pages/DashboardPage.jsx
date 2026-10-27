import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import TodoStats from '../components/todo/TodoStats.jsx';
import TodoFilters from '../components/todo/TodoFilters.jsx';
import TodoItem from '../components/todo/TodoItem.jsx';
import TodoFormModal from '../components/todo/TodoFormModal.jsx';
import EmptyState from '../components/todo/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { todoApi } from '../api/todoApi.js';
import { Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState({
    search: '',
    completed: '',
    priority: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await todoApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Todos with current filters
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 10,
        sortBy: filters.sortBy,
        order: filters.order,
      };

      if (filters.completed !== '') params.completed = filters.completed;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await todoApi.getTodos(params);
      if (res.success) {
        setTodos(res.data || []);
        if (res.meta) {
          setPagination(res.meta);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // Load data on mount or when filters change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle filter adjustments
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page whenever filter changes
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      completed: '',
      priority: '',
      sortBy: 'createdAt',
      order: 'desc',
      page: 1,
    });
  };

  // Toggle todo completion
  const handleToggle = async (id) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const res = await todoApi.toggleTodo(id);
      if (res.success) {
        fetchStats();
      }
    } catch (err) {
      // Revert if error
      fetchTodos();
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  };

  // Submit modal form (both create and update)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTodo) {
        // Update existing todo
        const res = await todoApi.updateTodo(editingTodo._id, formData);
        if (res.success) {
          showToast('Task updated successfully', 'success');
          setModalOpen(false);
          fetchTodos();
          fetchStats();
        }
      } else {
        // Create new todo
        const res = await todoApi.createTodo(formData);
        if (res.success) {
          showToast('New task added successfully', 'success');
          setModalOpen(false);
          fetchTodos();
          fetchStats();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a todo
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setDeletingId(id);
    try {
      const res = await todoApi.deleteTodo(id);
      if (res.success) {
        showToast('Task deleted successfully', 'success');
        setTodos((prev) => prev.filter((t) => t._id !== id));
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all completed todos
  const handleClearCompleted = async () => {
    if (!window.confirm('Are you sure you want to remove all completed tasks?')) return;

    try {
      const res = await todoApi.clearCompleted();
      if (res.success) {
        showToast(res.message || 'Completed tasks cleared', 'success');
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear completed tasks', 'error');
    }
  };

  const isFiltered = Boolean(
    filters.search || filters.completed !== '' || filters.priority !== ''
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here is your productivity overview for today.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreateModal}
            className="shadow-md shadow-indigo-500/20"
          >
            Create New Task
          </Button>
        </div>

        {/* Dashboard Statistics */}
        <TodoStats stats={stats} loading={statsLoading} />

        {/* Filter & Search Bar */}
        <TodoFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onClearCompleted={handleClearCompleted}
          completedCount={stats?.completed || 0}
        />

        {/* Task List Section */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse p-4"
              />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <EmptyState
            isFiltered={isFiltered}
            onResetFilters={handleClearFilters}
            onAddNew={handleOpenCreateModal}
          />
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
                isDeleting={deletingId === todo._id}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-600">
            <p>
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{pagination.total}</span> tasks
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={!pagination.hasPrevPage}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>

              <span className="px-2 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TodoFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTodo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardPage;
