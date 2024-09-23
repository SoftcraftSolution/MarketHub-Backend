const Admin = require('../model/admin.model');
const User=require('../model/user.model')
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const responseStructure = require('../middleware/response');
const mongoose = require('mongoose');

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

// Create a new registration
exports.sendOTPToAdmin = async (req, res) => {
    try {
        // Extract phoneNumber from request body
        const { phoneNumber } = req.body;

        // Generate OTP
        const otp = generateOTP();

        // Create a new Admin document
        const admin = new Admin({
            ...req.body,
            otp: otp // Store the OTP in the admin document
        });

        // Save the admin document
        await admin.save();

        // Send OTP to the provided phone number
        await sendOTP(phoneNumber, otp); // Use phoneNumber from request body
        console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

        // Respond with a success message
        res.status(201).json({
            message: 'Admin created successfully. OTP sent.',
            otp: otp // Optionally include the OTP in the response (for testing purposes)
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ message: error.message });
    }
};
exports.verifyOTPAdmin = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        console.log(`Received OTP verification request for phoneNumber: ${phoneNumber} with OTP: ${otp}`);

        // Find the registration by phone number
        const registration = await Admin.findOne({ phoneNumber });

        if (!registration) {
            console.error(`Registration not found for phoneNumber: ${phoneNumber}`);
            return response.error(res, 'Registration not found', 404);
        }

        // Log the stored OTP for comparison (be cautious with logging sensitive data)
        console.log(`Stored OTP for phoneNumber ${phoneNumber}: ${registration.otp}`);

        // Check if the OTP matches
        if (registration.otp !== otp) {
            console.warn(`Invalid OTP provided for phoneNumber: ${phoneNumber}`);
            return response.error(res, 'Invalid OTP', 400);
        }

        // If OTP is correct, clear the OTP and save the registration


        console.log(`OTP verified successfully for phoneNumber: ${phoneNumber}`);

        res.status(200).json({
            message: 'otp verifed sucessfully',

            // Optionally include the OTP in the response
        });
    } catch (error) {
        console.error("Error during OTP verification:", error); // Log the error for debugging
        return response.error(res, error.message);
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




