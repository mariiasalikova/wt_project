const dbSetupService = require('../services/dbSetup.service');

const setupDB = async (req, res, next) => {
  try {
    // Optional: Add authentication/authorization here to protect this endpoint
    // For example, only allow admin users or run only in development
    if (process.env.NODE_ENV !== 'development' && req.query.secret !== process.env.SETUP_SECRET) {
        return res.status(403).json({ message: 'Forbidden: This endpoint is restricted.' });
    }

    const result = await dbSetupService.setupDatabase();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in setupDB controller:", error);
    res.status(500).json({ message: 'Failed to setup database', error: error.message });
  }
};

module.exports = {
  setupDB,
};