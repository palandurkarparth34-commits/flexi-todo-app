import express from 'express';
import {
  getTodos,
  getTodoStats,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodoStatus,
  deleteTodo,
  clearCompletedTodos,
} from '../controllers/todoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All todo routes require authentication
router.use(protect);

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.get('/stats', getTodoStats);
router.delete('/bulk/completed', clearCompletedTodos);

router.route('/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

router.patch('/:id/toggle', toggleTodoStatus);

export default router;
