const db = require('../db'); // Ensure you have your database connection
const axios = require('axios');

const primaryApiUrl = 'https://shauvik889-backend.hf.space/generate-response/';
const fallbackApiUrl = 'https://shauvik889-chatbotapi.hf.space/generate-response/'; // Replace with your fallback API

// Controller to hit the primary API and fallback if necessary
const generateResponse = async (req, res) => {
    const userId = req.user.id; // Assuming you're using middleware to set req.user
    const payload = {
        "message": req.body.message || "Test message", // Use the request body message or default one
        "history": req.body.history || [],
        "max_tokens": req.body.max_tokens || 500,
        "temperature": req.body.temperature || 0.5,
        "top_p": req.body.top_p || 0.95
    };

    try {
        // Try hitting the primary API
        const primaryResponse = await axios.post(primaryApiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // If the response is successful, update the user's request count
        await updateUserRequestCount(userId);

        // Return response from primary API if successful
        return res.status(200).json(primaryResponse.data);

    } catch (primaryError) {
        console.error('Primary API failed:', primaryError.message);

        // If primary API fails, try hitting the fallback API
        try {
            const fallbackResponse = await axios.post(fallbackApiUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // If the response is successful, update the user's request count
            await updateUserRequestCount(userId);

            // Return response from fallback API if successful
            return res.status(200).json(fallbackResponse.data);

        } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError.message);

            // If both APIs fail, return an error response
            return res.status(500).json({
                message: 'Both APIs failed',
                primaryError: primaryError.message,
                fallbackError: fallbackError.message
            });
        }
    }
};

// Function to update the user's daily request count
const updateUserRequestCount = async (userId) => {
    try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // First, check if the user already has a record for today
        const userRecord = await db.query(
            `SELECT daily_request_count, total_request_count, updated_at FROM users WHERE id = $1`, 
            [userId]
        );

        if (userRecord.rows.length > 0) {
            const user = userRecord.rows[0];

            // Check if the last updated_at date is today
            const lastUpdatedAt = user.updated_at.toISOString().split('T')[0];
            if (lastUpdatedAt === today) {
                // Increment the daily request count
                await db.query(
                    `UPDATE users 
                     SET daily_request_count = daily_request_count + 1, 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $1`, 
                    [userId]
                );
            } else {
                // If it's a new day, reset daily count and increment total count
                await db.query(
                    `UPDATE users 
                     SET daily_request_count = 1, 
                         total_request_count = total_request_count + 1, 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $1`, 
                    [userId]
                );
            }
        } else {
            console.error('User not found:', userId);
        }
    } catch (error) {
        console.error('Error updating user request count:', error.message);
    }
};

module.exports = {
    generateResponse
};
