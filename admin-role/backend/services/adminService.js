const Admin = require('../models/Admin');

/**
 * Check if admin exists by phone number
 */
exports.checkAdminExists = async (phone) => {
  try {
    const admin = await Admin.findOne({ phone });
    return !!admin;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    throw error;
  }
};

/**
 * Get admin by phone number
 */
exports.getAdminByPhone = async (phone) => {
  try {
    const admin = await Admin.findOne({ phone });
    return admin;
  } catch (error) {
    console.error('Error getting admin by phone:', error);
    throw error;
  }
};

/**
 * Create new admin
 */
exports.createAdmin = async (adminData) => {
  try {
    const admin = new Admin(adminData);
    await admin.save();
    return admin;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

/**
 * Update admin location
 */
exports.updateAdminLocation = async (adminId, locationData) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Add current location to history
    if (admin.city && admin.area) {
      admin.locationHistory.push({
        city: admin.city,
        area: admin.area,
        mandal: admin.mandal || '',
        district: admin.district || '',
        state: admin.state,
        pincode: admin.pincode,
        updatedAt: new Date(),
      });
    }

    // Update current location
    admin.city = locationData.city;
    admin.area = locationData.area;
    admin.mandal = locationData.mandal || admin.mandal || '';
    admin.district = locationData.district || admin.district || '';
    admin.state = locationData.state || admin.state;
    admin.pincode = locationData.pincode || admin.pincode;

    await admin.save();
    return admin;
  } catch (error) {
    console.error('Error updating admin location:', error);
    throw error;
  }
};

/**
 * Update last login
 */
exports.updateLastLogin = async (adminId) => {
  try {
    await Admin.findByIdAndUpdate(adminId, {
      lastLogin: new Date(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw - this is not critical
  }
};

