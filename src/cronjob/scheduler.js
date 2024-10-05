const db = require('../db')
const cron = require('node-cron');



async function resetDailyRequestCounts() {
    try {
        const query = `
            UPDATE users
            SET daily_request_count = 0,
                updated_at = CURRENT_DATE
            WHERE updated_at < CURRENT_DATE;
        `;
  
        const res = await db.query(query);
        console.log(`Daily request counts reset: ${res.rowCount} users updated.`);
    } catch (error) {
        console.error('Error resetting daily request counts:', error);
    }
  }
  
  // Schedule the job to run every day at midnight
  cron.schedule('0 0 * * *', resetDailyRequestCounts);
  

  module.exports = resetDailyRequestCounts;
