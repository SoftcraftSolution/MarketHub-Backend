const Admin = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Ensure you have node-fetch installed
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const ResetCode = require('../model/resetcode.models'); 
const token=require('../middleware/token')

// Generate a random OTP (between 1000 and 9999)
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generate a random number between 1000 and 9999
};

// Function to send OTP via SMS using FAST2SMS
const sendOTP = async (phoneNumber, otp) => {
    try {
        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&sender_id=FSTSMS&message=Your OTP is ${otp}&language=english&route=p&numbers=${phoneNumber}`, {
            method: 'GET', // Adjust if necessary
        });

        const data = await response.json();

        // Log the response from Fast2SMS
        console.log("Response from Fast2SMS:", data);

        if (data.return === true) {
            console.log(`OTP sent successfully to ${phoneNumber}`);
        } else {
            console.error(`Failed to send OTP to ${phoneNumber}: ${data.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error('Failed to send OTP');
    }
};




const generateRandomPassword = () => {
    return crypto.randomBytes(4).toString('hex'); // Generates an 8-character password
  };
  
  // Configure nodemailer for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email account
      pass: process.env.EMAIL_PASSWORD, // Your email account's password
    },
  });
  
  exports.register = async (req, res) => {
    try {
      const { email, phoneNumber, access, role } = req.body;
  
      // Check if the email is already registered
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Generate a strong random password
      const randomPassword = generateRandomPassword();
  
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
      // Create a new admin
      const newAdmin = new Admin({
        email,
        phoneNumber,
        access,
        role, // e.g., 'admin' or 'superadmin'
        password: hashedPassword, // Save the hashed password
      });
  
      // Save the admin to the database
      await newAdmin.save();
  
      // Send email to the user with the login credentials
      const mailOptions = {
        from: process.env.EMAIL_USERNAME, // Your email
        to: email, // The user's email
        subject: 'Your Admin Account Credentials',
        text: `Hello, \n\nYour account has been created successfully. Here are your login credentials:\n\nUsername: ${email}\nPassword: ${randomPassword}\n\nPlease log in and change your password as soon as possible.`,
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
  
      return res.status(201).json({
        message: 'Registration successful. Password has been sent to the registered email.',
        admin: { email, role },
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ message: 'Server error, please try again later' });
    }
  };


// Ensure default admin exists on server start


// Login
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the admin exists
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Generate a JWT token with the admin's email and role
      const token = jwt.sign(
        { email: admin.email }, // You can also add other fields like role if necessary
        process.env.JWT_SECRET, // Ensure JWT_SECRET is stored in your .env file
        { expiresIn: '1h' } // Token expiration time
      );
  
      // Send the token back to the client
      return res.status(200).json({
        message: 'Login successful',
        token,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error, please try again later' });
    }
  };

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetCode = crypto.randomInt(1000, 9999).toString(); // 4-digit code

    await ResetCode.findOneAndUpdate(
      { userId: admin._id }, 
      { userId: admin._id, code: resetCode },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: admin.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `An email has been sent to ${admin.email} with the reset code.`,resetCode });
    
  } catch (err) {
    console.error('Error sending password reset email:', err);
    res.status(500).json({ error: 'Error sending password reset email' });
  }
};

// Verify Code
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetCode = await ResetCode.findOne({ userId: admin._id, code });
    if (!resetCode) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.status(200).json({ message: 'Reset code verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error verifying reset code' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      admin.password = newPassword;
      await admin.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Error resetting password' });
    }
  };

exports.approveAdmin = async (req, res) => {
    const { id } = req.query; // Get the admin ID from the query
    const { isApproved } = req.body; // Get the approval status from the body

    try {
        // Log the admin ID
        console.log("Admin ID:", id);

        // Validate ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid Admin ID' });
        }

        // Check if admin exists
        const userExists = await User.findById(id);
        console.log("User found:", userExists); // Log the found user

        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user document
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isApproved }, // Update isApproved status
            { new: true, runValidators: true } // Return the updated document
        );

        // Log the updated user
        console.log("Updated User:", updatedUser);

        // Respond with success message and updated user
        res.status(200).json({
            message: 'User approval status updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(400).send({ message: error.message });
    }
};

exports.getUserList = async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find();

        // Respond with the list of users
        res.status(200).json({
            message: 'User list retrieved successfully',
            users: users
        });
    } catch (error) {
        console.error("Error fetching user list:", error);
        res.status(500).json({ message: 'Error fetching user list' });
    }
};




