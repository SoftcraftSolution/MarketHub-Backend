const technicalNews = require('../model/technicalnews.model');

const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const response = require('../middleware/response')
const Admin = require('../model/user.model'); 
const { cloudinary } = require('../middleware/imageupload');

// Configure Cloudinary with environment variables

exports.technicalNews = async (req, res) => {
    try {
        // Extract data from the request body
        const { addTitle, addContent, addLink,email,  shareNews } = req.body;

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
        const newtechnicalNews = new technicalNews({
            addTitle,
            addContent,
            addLink,
       email,
            shareNews: shareNewsArray,
            image: imageUrl,
     
        });

        // Save the new document to the database
        await newtechnicalNews.save();

        // Send a success response with the uploaded data
        res.status(201).json({
            message: 'Technical news uploaded successfully',
            selfNews: {
                addTitle: newtechnicalNews.addTitle,
                createdAt: newtechnicalNews.createdAt,
                addContent: newtechnicalNews.addContent,
                addLink: newtechnicalNews.addLink,
                email:newtechnicalNews.email,
                shareNews: newtechnicalNews.shareNews,
                image: newtechnicalNews.image,
             
            }
        });
    } catch (error) {
        console.error('Error while adding technical news:', error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};
exports.technicalNewsList = async (req, res) => {
    try {
        // Assuming SelfNews is your Mongoose model
        const technicalnews = await technicalNews.find() // Sort by latest published news

        // Return the list of news articles
        res.status(200).json({
            status: 'success',
            data: technicalnews, // Return the fetched news data
        });

    } catch (error) {
        console.error('Error fetching news from database:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching news.',
        });
    }
};