const HindiNews = require('../model/hindinews.model');




const { cloudinary } = require('../middleware/imageupload');

// Configure Cloudinary with environment variables

exports.addHindiNews = async (req, res) => {
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

        // Log the URLs obtained
        console.log('Uploaded image URL:', imageUrl);

        // Create a new HindiNews document
        const hindiNews = new HindiNews({
            addTitle,
            addContent,
            addLink,
            email,
            shareNews: shareNewsArray,
            image: imageUrl,
        });

        // Save the new document to the database
        await hindiNews.save();

        // Send a success response with the uploaded data
        res.status(201).json({
            message: 'HindiNews uploaded successfully',
            hindiNews: {
                addTitle: hindiNews.addTitle,
                createdAt: hindiNews.createdAt,
                addContent: hindiNews.addContent,
                addLink: hindiNews.addLink,
                email: hindiNews.email,
                shareNews: hindiNews.shareNews,
                image: hindiNews.image,
            }
        });
    } catch (error) {
        console.error('Error while adding Hindi news:', error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};
exports.getHindiNews = async (req, res) => {
    try {
        // Fetch all Hindi news entries (no pagination)
        const allNews = await HindiNews.find().select('addTitle addContent addLink image createdAt'); // Select the fields to display

        // Check if there are no news articles
        if (allNews.length === 0) {
            return res.status(404).json({ message: 'No Hindi news available' });
        }

        // Send the list of news articles
        res.status(200).json({
            message: 'Hindi news listing fetched successfully',
            news: allNews
        });
    } catch (error) {
        console.error('Error while fetching Hindi news:', error);
        res.status(500).json({ message: 'An error occurred while fetching news.' });
    }
};
exports.deleteHindiNews = async (req, res) => {
    try {
        // Retrieve the ID from the query parameters
        const { id } = req.query;

        // Ensure the ID is provided
        if (!id) {
            return res.status(400).json({ message: 'News ID is required in query parameters' });
        }

        // Find and delete the news article by ID
        const news = await HindiNews.findByIdAndDelete(id);
        
        // Check if the news article was not found
        if (!news) {
            return res.status(404).json({ message: 'Hindi news not found' });
        }
        
        // Send success response
        res.status(200).json({ message: 'Hindi news deleted successfully' });
    } catch (error) {
        console.error('Error while deleting Hindi news:', error);
        res.status(500).json({ message: 'An error occurred while deleting news.' });
    }
};
exports.updateHindiNews = async (req, res) => {
    try {
        // Retrieve the ID from the query parameters
        const { id } = req.query;

        // Ensure the ID is provided
        if (!id) {
            return res.status(400).json({ message: 'News ID is required in query parameters' });
        }

        // Extract data from the request body
        const { addTitle, addContent, addLink, email, shareNews } = req.body;

        // Parse shareNews if it's coming as a JSON string
        const shareNewsArray = Array.isArray(shareNews) ? shareNews : JSON.parse(shareNews || "[]");

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

        // Find the news article by ID and update it
        const updatedNews = await HindiNews.findByIdAndUpdate(id, {
            addTitle,
            addContent,
            addLink,
            email,
            shareNews: shareNewsArray,
            image: imageUrl || undefined, // If no image, don't update the image field
        }, { new: true }); // Return the updated document

        // Check if the news article was not found
        if (!updatedNews) {
            return res.status(404).json({ message: 'Hindi news not found' });
        }

        // Send success response with the updated data
        res.status(200).json({
            message: 'Hindi news updated successfully',
            hindiNews: updatedNews
        });
    } catch (error) {
        console.error('Error while updating Hindi news:', error);
        res.status(500).json({ message: 'An error occurred while updating news.' });
    }
};