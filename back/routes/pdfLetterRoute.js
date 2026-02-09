const express = require("express");
const router = express.Router();
const { generateAndUploadLetter, GetAllLetter } = require("../controllers/letterController");

/**
 * @swagger
 * tags:
 *   name: Letters
 *   description: Employee Letters / PDFs Management APIs
 */

/**
 * @swagger
 * /api/pdfGenerater/offer:
 *   post:
 *     summary: Generate and upload offer letter for employee
 *     tags: [Letters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - letterType
 *               - file
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Employee ID (ObjectId)
 *                 example: 63e123abc456def789
 *               letterType:
 *                 type: string
 *                 description: Type of letter (e.g., offer, relieving)
 *                 example: offer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Letter generated and uploaded successfully
 *       400:
 *         description: Bad request
 */
router.post("/offer", generateAndUploadLetter);

/**
 * @swagger
 * /api/pdfGenerater/allLetter/{employeeId}:
 *   get:
 *     summary: Get all letters for a specific employee
 *     tags: [Letters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: Employee ID (ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all letters for the employee
 *       404:
 *         description: No letters found for this employee
 */
router.get("/allLetter/:employeeId", GetAllLetter);

module.exports = router;
