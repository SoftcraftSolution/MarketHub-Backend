const CircularNews = require('../model/circularnews.model');

const multer = require('multer');
const Admin = require('../model/user.model'); 
const { cloudinary } = require('../middleware/imageupload');
const selfnews=require('../model/selfnews.model')





exports.CircularNews = async (req, res) => {
    try {
        // Extract data from the request body
        const { addTitle, addContent, addLink, email, shareNews } = req.query;

        // Parse shareNews if it's coming as a JSON string
        const shareNewsArray = Array.isArray(shareNews) ? shareNews : JSON.parse(shareNews || "[]");

        // Log the req.files object to see the uploaded files
        console.log('Uploaded files:', req.files);

        // Prepare to store URLs
        let imageUrl = null;
        let pdfUrl = null;

        // Check if image file is present and upload to Cloudinary using buffer
        if (req.files['image'] && req.files['image'][0]) {
            // Upload image buffer to Cloudinary
            const imageUploadResponse = await cloudinary.uploader.upload(`data:${req.files['image'][0].mimetype};base64,${req.files['image'][0].buffer.toString('base64')}`, {
                folder: 'images',
                resource_type: 'image'
            });
            imageUrl = imageUploadResponse.secure_url; // Get the image URL from the result
            console.log('Uploaded image URL:', imageUrl);
        } else {
            console.log('No image file uploaded.');
        }

        // Check if PDF file is present and upload to Cloudinary using buffer
        if (req.files['pdf'] && req.files['pdf'][0]) {
            const pdfBuffer = req.files['pdf'][0].buffer;

            // Upload PDF to Cloudinary as raw file
            const pdfUploadResponse = await cloudinary.uploader.upload(`data:${req.files['pdf'][0].mimetype};base64,${pdfBuffer.toString('base64')}`, {
                folder: 'pdfs',
                resource_type: 'raw', // Correct resource type for PDFs and non-image files
                format: 'pdf' // Ensure it gets stored as a PDF
            });

            pdfUrl = pdfUploadResponse.secure_url; // Get the URL to access the PDF
            console.log('Uploaded PDF URL:', pdfUrl);
        } else {
            console.log('No PDF file uploaded.');
        }

        // Create a new CircularNews document
        const newCircularNews = new CircularNews({
            addTitle,
            addContent,
            addLink,
            email,
            shareNews: shareNewsArray,
            image: imageUrl, // Will be null if no image was uploaded
            pdf: pdfUrl, // Will be null if no PDF was uploaded
        });

        // Save the new document to the database
        await newCircularNews.save();

        // Send a success response with the uploaded data
        res.status(201).json({
            message: 'News uploaded successfully',
            circularNews: {
                addTitle: newCircularNews.addTitle,
                createdAt: newCircularNews.createdAt,
                addContent: newCircularNews.addContent,
                addLink: newCircularNews.addLink,
                email: newCircularNews.email,
                shareNews: newCircularNews.shareNews,
                image: newCircularNews.image, // Will be null if no image was uploaded
                pdf: newCircularNews.pdf, // Will be null if no PDF was uploaded
            }
        });
    } catch (error) {
        console.error('Error while adding circular news:', error);
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};
exports.getNewsList = async (req, res) => {
    try {
        // Fetch CircularNews and SelfNews from the database
        const circularNewsList = await CircularNews.find();
        const selfNewsList = await selfnews.find();

        // Return a combined response
        res.status(200).json({
            message: 'News listing retrieved successfully',
            circularNews: circularNewsList,
            selfNews: selfNewsList
        });
    } catch (error) {
        console.error('Error while fetching news listings:', error);
        res.status(500).json({ message: 'An error occurred while fetching news listings.' });
    }
};
exports.getInsightNews = async (req, res) => {
    try {
        // Fetch all CircularNews and SelfNews from the database
        const circularNewsList = await CircularNews.find();
        const selfNewsList = await selfnews.find();

        // Count total CircularNews and SelfNews documents
        const totalCircularNews = circularNewsList.length;
        const totalSelfNews = selfNewsList.length;
        const totalNewsCount = totalCircularNews + totalSelfNews;

        // Return the combined response with counts
        res.status(200).json({
            message: 'News listing retrieved successfully',
            counts: {
                totalCircularNews,
                totalSelfNews,
                totalNewsCount // Combined total of both CircularNews and SelfNews
            }
        });
    } catch (error) {
        console.error('Error while fetching news listings:', error);
        res.status(500).json({ message: 'An error occurred while fetching news listings.' });
    }
};



  