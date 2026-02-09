const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require("../controllers/expenseController.js");

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense Management APIs
 */

/**
 * @swagger
 * /api/expenses/add:
 *   post:
 *     summary: Add new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - amount
 *               - category
 *               - paidBy
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-12
 *               amount:
 *                 type: number
 *                 example: 1500
 *               category:
 *                 type: string
 *                 example: Travel
 *               paidBy:
 *                 type: string
 *                 example: John Doe
 *               notes:
 *                 type: string
 *                 example: Bought pens and notebooks
 *     responses:
 *       201:
 *         description: Expense added successfully
 *       400:
 *         description: Bad request
 */
router.post("/add", addExpense);

/**
 * @swagger
 * /api/expenses/get:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get("/get/:companyId", getExpenses);

/**
 * @swagger
 * /api/expenses/getbyid/{id}:
 *   get:
 *     summary: Get single expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 */
router.get("/getbyid/:id", getExpenseById);

/**
 * @swagger
 * /api/expenses/updateExpense/{id}:
 *   put:
 *     summary: Update expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-12
 *               amount:
 *                 type: number
 *                 example: 2000
 *               category:
 *                 type: string
 *                 example: Travel Updated
 *               paidBy:
 *                 type: string
 *                 example: Jane Doe
 *               notes:
 *                 type: string
 *                 example: Bought extra notebooks
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Expense not found
 */
router.put("/updateExpense/:id", updateExpense);

/**
 * @swagger
 * /api/expenses/deleteExpense/{id}:
 *   delete:
 *     summary: Delete expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete("/deleteExpense/:id", deleteExpense);

module.exports = router;
