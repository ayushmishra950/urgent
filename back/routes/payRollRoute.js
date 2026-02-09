const epxress = require("express"); 
const router = epxress.Router();
const payRollController = require("../controllers/payRollController");

router.post("/add", payRollController.createSalary); // Admin: Create a new salary record
router.get("/get", payRollController.getAllSalaries); // Admin: Get all salary records
router.get("/getbyid/:employeeId", payRollController.getSalaryByEmployee); // Employee & Admin: Get salary by employeeId

module.exports = router;