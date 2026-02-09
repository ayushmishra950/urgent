const Letter = require("../models/Letter");
 const {generateOfferLetter} = require("../utils/generateOfferLetter");
  const {getLettersByEmployee} = require("../utils/getLettersByEmployee");

const generateAndUploadLetter = async (req, res) => {
 try {
    const { employeeId, letterType } = req.body;

    const pdfData = await generateOfferLetter(employeeId, letterType);

    // Send PDF as response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${letterType}_${employeeId}.pdf`,
      'Content-Length': pdfData.length
    });
    res.send(pdfData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


 const GetAllLetter = async(req, res) => {
   try {
    const data = await getLettersByEmployee(req.params.employeeId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
 }
module.exports = { generateAndUploadLetter, GetAllLetter };
