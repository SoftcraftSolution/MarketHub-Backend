const SelfNews = require('../model/selfnews.model');

const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const response = require('../middleware/response')
const Admin = require('../model/user.model');
const { cloudinary } = require('../middleware/imageupload');

// Configure Cloudinary with environment variables

exports.addSelfNews = async (req, res) => {
    try {
        // Extract data from the request body
        const { addTitle, addContent, addLink, email, shareNews } = req.body;

        // Parse shareNews if it's coming as a JSON string
        const shareNewsArray = Array.isArray(shareNews) ? shareNews : JSON.parse(shareNews || "[]");

        // Log the req.files object to see the uploaded files
        console.log('Uploaded files:', req.files);

        // Prepare to store URLs
        let imageUrl = null;


        // Check if image file is present and upload to Cloudinary using buffer
        if (req.files['image'] && req.files['image'][0]) {
            // Upload image buffer to Cloudinary
            const imageUploadResponse = await cloudinary.uploader.upload(`data:${req.files['image'][0].mimetype};base64,${req.files['image'][0].buffer.toString('base64')}`, {
                folder: 'images',
                resource_type: 'image'
            });
            imageUrl = imageUploadResponse.secure_url; // Get the image URL from the result
        }

        // Check if PDF file is present and upload to Cloudinary using buffer



        // Log the URLs obtained
        console.log('Uploaded image URL:', imageUrl);


        // Create a new CircularNews document
        const newSelfNews = new SelfNews({
            addTitle,
            addContent,
            addLink,
            email,
            shareNews: shareNewsArray,
            image: imageUrl,

        });

        // Save the new document to the database
        await newSelfNews.save();

        // Send a success response with the uploaded data
        res.status(201).json({
            message: 'SelfNews uploaded successfully',
            selfNews: {
                addTitle: newSelfNews.addTitle,
                createdAt: newSelfNews.createdAt,
                addContent: newSelfNews.addContent,
                addLink: newSelfNews.addLink,
                email: newSelfNews.email,
                shareNews: newSelfNews.shareNews,
                image: newSelfNews.image,

            }
        });
    } catch (error) {
        console.error('Error while adding self news:', error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};
exports.deleteSelfNews = async (req, res) => {
    try {
        // Retrieve the ID from the query parameters
        const { id } = req.query;

        // Ensure the ID is provided
        if (!id) {
            return res.status(400).json({ message: 'News ID is required in query parameters' });
        }

        // Find and delete the news article by ID
        const news = await SelfNews.findByIdAndDelete(id);
        
        // Check if the news article was not found
        if (!news) {
            return res.status(404).json({ message: 'Self news not found' });
        }
        
        // Send success response
        res.status(200).json({ message: 'Self news deleted successfully' });
    } catch (error) {
        console.error('Error while deleting Self news:', error);
        res.status(500).json({ message: 'An error occurred while deleting news.' });
    }
};