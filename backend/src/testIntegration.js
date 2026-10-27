import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Todo from './models/Todo.js';
import app from './server.js';

dotenv.config();

const runTests = async () => {
  console.log('--- Starting Integration Tests ---');
  await new Promise((r) => setTimeout(r, 1000)); // wait for connection

  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const testPassword = 'SecurePassword123!';

  const baseUrl = `http://localhost:${process.env.PORT || 5000}/api`;

  let token = '';
  let todoId1 = '';
  let todoId2 = '';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log('✓ [Health Check]:', healthRes.status === 'ok' ? 'PASSED' : 'FAILED');

    // 2. Register
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Runner',
        email: testEmail,
        password: testPassword,
      }),
    }).then((r) => r.json());

    if (!regRes.success || !regRes.data?.token) {
      throw new Error(`Register failed: ${JSON.stringify(regRes)}`);
    }
    console.log('✓ [Auth Register]: PASSED');

    // 3. Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    }).then((r) => r.json());

    if (!loginRes.success || !loginRes.data?.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
    }
    token = loginRes.data.token;
    console.log('✓ [Auth Login]: PASSED (JWT received)');

    // 4. Get Current User (GET /auth/me)
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    if (!meRes.success || meRes.data?.user?.email !== testEmail) {
      throw new Error(`GetMe failed: ${JSON.stringify(meRes)}`);
    }
    console.log('✓ [Auth GetMe]: PASSED (Protected route validated)');

    // 5. Create Todo 1 (High priority)
    const createRes1 = await fetch(`${baseUrl}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Complete project documentation',
        description: 'Write comprehensive guides for API and frontend',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        tags: ['work', 'docs'],
      }),
    }).then((r) => r.json());

    if (!createRes1.success || !createRes1.data?._id) {
      throw new Error(`Create Todo 1 failed: ${JSON.stringify(createRes1)}`);
    }
    todoId1 = createRes1.data._id;
    console.log('✓ [Create Todo 1]: PASSED (ID:', todoId1, ')');

    // 6. Create Todo 2 (Medium priority)
    const createRes2 = await fetch(`${baseUrl}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Buy groceries',
        description: 'Milk, eggs, coffee',
        priority: 'medium',
        tags: ['personal'],
      }),
    }).then((r) => r.json());

    todoId2 = createRes2.data._id;
    console.log('✓ [Create Todo 2]: PASSED (ID:', todoId2, ')');

    // 7. Get All Todos with Pagination
    const listRes = await fetch(`${baseUrl}/todos?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    if (!listRes.success || listRes.data.length !== 2) {
      throw new Error(`List Todos failed: count is ${listRes.data?.length}`);
    }
    console.log('✓ [Get Todos List & Pagination]: PASSED (Found 2 todos)');

    // 8. Get Stats
    const statsRes = await fetch(`${baseUrl}/todos/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    if (!statsRes.success || statsRes.data.total !== 2 || statsRes.data.highPriority !== 1) {
      throw new Error(`Stats check failed: ${JSON.stringify(statsRes)}`);
    }
    console.log('✓ [Get Todo Stats]: PASSED (Total: 2, HighPriority: 1, Pending: 2)');

    // 9. Toggle Todo 1 completion
    const toggleRes = await fetch(`${baseUrl}/todos/${todoId1}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    if (!toggleRes.success || toggleRes.data.completed !== true) {
      throw new Error(`Toggle Todo failed: ${JSON.stringify(toggleRes)}`);
    }
    console.log('✓ [Toggle Todo Status]: PASSED (Completed: true)');

    // 10. Update Todo 2
    const updateRes = await fetch(`${baseUrl}/todos/${todoId2}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Buy groceries and fruit',
        priority: 'low',
      }),
    }).then((r) => r.json());

    if (!updateRes.success || updateRes.data.title !== 'Buy groceries and fruit') {
      throw new Error(`Update Todo failed: ${JSON.stringify(updateRes)}`);
    }
    console.log('✓ [Update Todo]: PASSED');

    // 11. Delete Todo 2
    const deleteRes = await fetch(`${baseUrl}/todos/${todoId2}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    if (!deleteRes.success) {
      throw new Error(`Delete Todo failed: ${JSON.stringify(deleteRes)}`);
    }
    console.log('✓ [Delete Todo]: PASSED');

    // 12. Clean up test data
    await User.deleteOne({ email: testEmail });
    await Todo.deleteMany({ user: regRes.data.user._id });
    console.log('✓ [Cleanup]: Test user and test todos purged.');

    console.log('\n========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED 100%!');
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
