const Alert = require('../models/Alert');

// Get alerts for users based on their city and area
exports.getAlerts = async (req, res) => {
  try {
    const { city, area } = req.query;

    if (!city || !area) {
      return res.status(400).json({
        success: false,
        message: 'Please provide city and area',
      });
    }

    // Get active alerts for the user's city and area
    // Also include alerts that haven't expired
    const now = new Date();
    const alerts = await Alert.find({
      adminCity: city,
      adminArea: area,
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    })
      .sort({ priority: -1, createdAt: -1 }) // Emergency first, then by date
      .select('-__v')
      .limit(100); // Limit to 100 most recent alerts

    res.json({
      success: true,
      alerts: alerts.map((alert) => ({
        id: alert._id,
        category: alert.category,
        alertType: alert.alertType,
        priority: alert.priority,
        title: alert.title,
        message: alert.message,
        createdAt: alert.createdAt,
        expiresAt: alert.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get alerts',
    });
  }
};


