import { Router } from 'express';
import { issueBook, returnBook, getTransactions, getDashboard } from '../controllers/transactionController.js';

const router = Router();
router.get('/', getTransactions);
router.post('/issue', issueBook);
router.put('/:id/return', returnBook);
router.get('/dashboard/stats', getDashboard);
export default router;