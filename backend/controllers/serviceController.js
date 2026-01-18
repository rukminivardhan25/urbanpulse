const Service = require('../models/Service');
const dateService = require('../services/dateService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token and extract admin info
 */
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    req.adminCity = decoded.city;
    req.adminArea = decoded.area;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Create a new service
 * POST /services
 */
exports.createService = async (req, res) => {
  try {
    const {
      serviceType,
      serviceSubtype,
      startTime,
      endTime,
      scheduleType,
      customDate,
      notes,
    } = req.body;

    if (!serviceType || !scheduleType) {
      return res.status(400).json({
        success: false,
        message: 'Service type and schedule type are required',
      });
    }

    // Calculate service date based on schedule type
    let serviceDate;
    try {
      serviceDate = dateService.calculateServiceDate(
        scheduleType,
        customDate ? new Date(customDate) : null
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Validate time format (HH:MM)
    if (startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start time format. Use HH:MM format.',
      });
    }

    if (endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end time format. Use HH:MM format.',
      });
    }

    const service = new Service({
      adminId: req.adminId,
      adminCity: req.adminCity,
      adminArea: req.adminArea,
      serviceType,
      serviceSubtype: serviceSubtype || '',
      startTime: startTime || null,
      endTime: endTime || null,
      scheduleType,
      serviceDate,
      notes: notes || '',
      displayFormat: '12hr',
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        id: service._id,
        serviceType: service.serviceType,
        serviceSubtype: service.serviceSubtype,
        startTime: service.startTime,
        endTime: service.endTime,
        scheduleType: service.scheduleType,
        serviceDate: dateService.formatISTDate(service.serviceDate),
        notes: service.notes,
      },
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
    });
  }
};

/**
 * Get services for a specific city and area
 * GET /services?city=&area=
 * Public endpoint - no auth required
 */
exports.getServices = async (req, res) => {
  try {
    const { city, area } = req.query;

    if (!city || !area) {
      return res.status(400).json({
        success: false,
        message: 'City and area are required',
      });
    }

    // Fetch all services for the city and area
    let services = await Service.find({
      adminCity: city,
      adminArea: area,
      isActive: true,
    })
      .sort({ serviceDate: 1, startTime: 1 })
      .select('-__v');

    // Debug: Log ALL services by type BEFORE filtering
    const allServicesByType = {};
    services.forEach((s) => {
      allServicesByType[s.serviceType] = (allServicesByType[s.serviceType] || 0) + 1;
    });
    console.log(`📊 Total services found in DB: ${services.length} for city: ${city}, area: ${area}`);
    console.log(`📊 ALL services in DB by type (before filtering):`, allServicesByType);

    const today = dateService.getTodayIST();

    // Save services before filtering for debug logging
    const servicesBeforeFilter = [...services];

    // Filter services - show all services that are not in the past
    // Daily services are always visible, all other services are visible if serviceDate >= today
    const filteredServices = services.filter((service) => {
      const serviceDateIST = service.serviceDate;

      // Daily services - always visible (regardless of date)
      if (service.scheduleType === 'daily') {
        return true;
      }

      // For non-daily services, compare only date part (ignore time)
      const serviceDateOnly = new Date(serviceDateIST);
      serviceDateOnly.setUTCHours(0, 0, 0, 0);
      const todayOnly = new Date(today);
      todayOnly.setUTCHours(0, 0, 0, 0);

      // Show all services that are today or in the future
      // Only exclude past services (serviceDate < today in IST)
      const isPast = serviceDateOnly < todayOnly;
      
      if (isPast) {
        console.log(`⏭️  Skipping past service: ${service.serviceType}, date: ${dateService.formatISTDate(serviceDateIST)}, schedule: ${service.scheduleType}`);
        return false;
      }

      // All other services (today, tomorrow, weekend, custom) are visible if not past
      return true;
    });

    services = filteredServices;

    // Debug: Log filtered services by type AFTER filtering
    const servicesByType = {};
    services.forEach((s) => {
      servicesByType[s.serviceType] = (servicesByType[s.serviceType] || 0) + 1;
    });
    console.log(`📋 Found ${services.length} services AFTER filtering for city: ${city}, area: ${area}`);
    console.log(`📊 Services by type (after filtering):`, servicesByType);
    
    // Log health services specifically
    const healthServices = services.filter(s => s.serviceType === 'health');
    if (healthServices.length === 0) {
      const allHealthServicesInDB = servicesBeforeFilter.filter(s => s.serviceType === 'health');
      if (allHealthServicesInDB.length > 0) {
        console.log(`⚠️ No health services after filtering, but ${allHealthServicesInDB.length} health services exist in DB`);
        allHealthServicesInDB.forEach(hs => {
          console.log(`   Health service: schedule=${hs.scheduleType}, date=${dateService.formatISTDate(hs.serviceDate)}`);
        });
      }
    } else {
      console.log(`✅ Health services after filtering:`, healthServices.map(s => ({
        type: s.serviceType,
        subtype: s.serviceSubtype,
        schedule: s.scheduleType,
        date: dateService.formatISTDate(s.serviceDate)
      })));
    }

    res.json({
      success: true,
      services: services.map((service) => ({
        id: service._id,
        serviceType: service.serviceType,
        serviceSubtype: service.serviceSubtype || '',
        startTime: service.startTime,
        endTime: service.endTime,
        scheduleType: service.scheduleType,
        serviceDate: dateService.formatISTDate(service.serviceDate),
        notes: service.notes,
        createdAt: service.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
    });
  }
};

/**
 * Get all services for an admin (for admin dashboard)
 * GET /admin/services
 * Requires admin authentication
 */
exports.getAdminServices = async (req, res) => {
  try {
    const services = await Service.find({
      adminId: req.adminId,
      isActive: true,
    })
      .sort({ serviceDate: -1, createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      services: services.map((service) => ({
        id: service._id,
        serviceType: service.serviceType,
        serviceSubtype: service.serviceSubtype || '',
        startTime: service.startTime,
        endTime: service.endTime,
        scheduleType: service.scheduleType,
        serviceDate: dateService.formatISTDate(service.serviceDate),
        notes: service.notes,
        createdAt: service.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error getting admin services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
    });
  }
};

/**
 * Delete a service
 * DELETE /services/:id
 * Requires admin authentication
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      _id: id,
      adminId: req.adminId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Soft delete (set isActive to false) or hard delete
    // Using hard delete for immediate removal
    await Service.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
    });
  }
};

// Export middleware
exports.verifyAdminToken = verifyAdminToken;

