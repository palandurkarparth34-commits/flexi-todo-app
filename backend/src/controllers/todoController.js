import Todo from '../models/Todo.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get all todos for the logged-in user with filtering, pagination, and sorting
 * @route   GET /api/todos
 * @access  Private
 */
export const getTodos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      completed,
      priority,
      tag,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Base query: strictly scoped to current authenticated user
    const query = { user: req.user._id };

    // Filter by completed status
    if (completed !== undefined && completed !== '') {
      query.completed = completed === 'true';
    }

    // Filter by priority
    if (priority && ['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      query.priority = priority.toLowerCase();
    }

    // Filter by tag
    if (tag) {
      query.tags = tag.toLowerCase().trim();
    }

    // Search query on title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sort definition
    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSortFields = ['createdAt', 'dueDate', 'priority', 'title', 'completed'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort = { [sortField]: sortOrder };

    const [todos, total] = await Promise.all([
      Todo.find(query).sort(sort).skip(skip).limit(limitNum),
      Todo.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return successResponse(res, 200, 'Todos retrieved successfully', todos, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get summary statistics for dashboard
 * @route   GET /api/todos/stats
 * @access  Private
 */
export const getTodoStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [total, completed, pending, highPriority, overdue] = await Promise.all([
      Todo.countDocuments({ user: userId }),
      Todo.countDocuments({ user: userId, completed: true }),
      Todo.countDocuments({ user: userId, completed: false }),
      Todo.countDocuments({ user: userId, priority: 'high', completed: false }),
      Todo.countDocuments({
        user: userId,
        completed: false,
        dueDate: { $ne: null, $lt: now },
      }),
    ]);

    return successResponse(res, 200, 'Todo statistics fetched successfully', {
      total,
      completed,
      pending,
      highPriority,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single todo by ID
 * @route   GET /api/todos/:id
 * @access  Private
 */
export const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return errorResponse(res, 404, 'Todo not found');
    }

    // Authorization check: Verify user owns this todo
    if (todo.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You do not have permission to access this todo');
    }

    return successResponse(res, 200, 'Todo retrieved successfully', todo);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new todo
 * @route   POST /api/todos
 * @access  Private
 */
export const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    if (!title || title.trim() === '') {
      return errorResponse(res, 400, 'Title is required');
    }

    const todo = await Todo.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      user: req.user._id,
    });

    return successResponse(res, 201, 'Todo created successfully', todo);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a todo
 * @route   PUT /api/todos/:id
 * @access  Private
 */
export const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return errorResponse(res, 404, 'Todo not found');
    }

    // Authorization check: Verify user owns this todo
    if (todo.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You do not have permission to update this todo');
    }

    const { title, description, completed, priority, dueDate, tags } = req.body;

    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description.trim();
    if (completed !== undefined) todo.completed = Boolean(completed);
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) todo.tags = tags;

    const updatedTodo = await todo.save();

    return successResponse(res, 200, 'Todo updated successfully', updatedTodo);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle todo completion status
 * @route   PATCH /api/todos/:id/toggle
 * @access  Private
 */
export const toggleTodoStatus = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return errorResponse(res, 404, 'Todo not found');
    }

    // Authorization check
    if (todo.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You do not have permission to modify this todo');
    }

    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();

    return successResponse(
      res,
      200,
      `Todo marked as ${updatedTodo.completed ? 'completed' : 'pending'}`,
      updatedTodo
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a todo
 * @route   DELETE /api/todos/:id
 * @access  Private
 */
export const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return errorResponse(res, 404, 'Todo not found');
    }

    // Authorization check
    if (todo.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You do not have permission to delete this todo');
    }

    await todo.deleteOne();

    return successResponse(res, 200, 'Todo deleted successfully', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk delete completed todos
 * @route   DELETE /api/todos/bulk/completed
 * @access  Private
 */
export const clearCompletedTodos = async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({
      user: req.user._id,
      completed: true,
    });

    return successResponse(
      res,
      200,
      `Cleared ${result.deletedCount} completed todo(s)`,
      { deletedCount: result.deletedCount }
    );
  } catch (error) {
    next(error);
  }
};
