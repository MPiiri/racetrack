function validatePassword(req, res) {
    const { job, password } = req.body;
  
    const validPasswords = {
      "Receptionist": process.env.RECEPTIONIST_PASSWORD,
      "Flag Bearer": process.env.FLAG_BEARER_PASSWORD,
      "Lap-line Observer": process.env.LAP_LINE_OBSERVER_PASSWORD,
      "Safety Official": process.env.SAFETY_OFFICIAL_PASSWORD,
    };
  
    if (validPasswords[job] && validPasswords[job] === password) {
      return res.json({ success: true, message: `Welcome, ${job}!` });
    } else {
      return res.json({ success: false, message: 'Invalid password.' });
    }
  }
  
  module.exports = { validatePassword };
  