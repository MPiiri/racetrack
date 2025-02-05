const mongoose = require('mongoose');

// Define the structure for the User data
const userSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: true, 
      unique: true, 
    },
    role: { 
      type: String,
      required: true,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
