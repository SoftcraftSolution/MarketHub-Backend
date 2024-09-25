const CircularNews= require('../model/circularnews.model');
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

const response = require('../middleware/response')
const Admin = require('../model/admin.model'); 

exports.CircularNews = async (req, res) => {
    try {
        // Extract data from request body
        const { addTitle, addContent, addLink, adminPhoneNumber, shareNews } = req.body;

        // Validate input fields
        if (!addTitle || !addContent || !adminPhoneNumber) {
            return res.status(400).json({ message: 'Title, content, and phone number are required.' });
        }

        // Optional: Check if the admin exists
        const admin = await Admin.findOne({ phoneNumber: adminPhoneNumber });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Ensure shareNews is an array
        const shareNewsArray = Array.isArray(shareNews) ? shareNews : JSON.parse(shareNews);

        // Create a new CircularNews document
        const newCircularNews = new CircularNews({
            addTitle,
            addContent,
            addLink,
            image: req.file && req.file.fieldname === 'image' ? req.file.path : null, // Handle image if uploaded
            pdf: req.files && req.files.fieldname === 'pdf' ? req.files.path : null, // Handle PDF if uploaded
            adminPhoneNumber,
            shareNews: shareNewsArray, // Save the shareNews array
        });

        // Save the new document to the database
        await newCircularNews.save();

        // Send a success response
        res.status(201).json({
            message: 'News uploaded successfully',
            circularNews: newCircularNews,
        });
    } catch (error) {
        console.error('Error while adding circular news:', error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while uploading circular news.' });
    }
};

