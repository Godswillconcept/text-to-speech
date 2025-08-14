const { Op } = require('sequelize');
const db = require('../models');

const Operation = db.Operation;

/**
 * @route   GET /api/analytics/usage
 * @desc    Get usage analytics for the authenticated user
 * @access  Private
 */
exports.getUsageAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    // Set up date range filter
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);
    
    // Get all operations for the user within date range
    const operations = await Operation.findAll({
      where: {
        userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      attributes: ['type', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    // Group operations by type and status
    const summary = operations.reduce((acc, op) => {
      if (!acc[op.type]) {
        acc[op.type] = { total: 0, completed: 0, failed: 0 };
      }
      acc[op.type].total++;
      if (op.status === 'completed') acc[op.type].completed++;
      if (op.status === 'failed') acc[op.type].failed++;
      return acc;
    }, {});

    // Time series data for charts (last 30 days by default)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyUsage = {};
    const typeTimeSeries = {};
    
    // Initialize time series data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyUsage[dateStr] = 0;
      
      // Initialize for each operation type
      Object.keys(summary).forEach(type => {
        if (!typeTimeSeries[type]) typeTimeSeries[type] = {};
        typeTimeSeries[type][dateStr] = 0;
      });
    }
    
    // Count operations per day and per type
    operations.forEach(op => {
      const opDate = op.createdAt.toISOString().split('T')[0];
      if (dailyUsage[opDate] !== undefined) {
        dailyUsage[opDate]++;
        if (typeTimeSeries[op.type] && typeTimeSeries[op.type][opDate] !== undefined) {
          typeTimeSeries[op.type][opDate]++;
        }
      }
    });

    // Format time series data for charts
    const formatTimeSeries = (data) => {
      return Object.entries(data).map(([date, count]) => ({
        date,
        count
      }));
    };

    res.json({
      success: true,
      data: {
        summary,
        dailyUsage: formatTimeSeries(dailyUsage),
        typeTimeSeries: Object.fromEntries(
          Object.entries(typeTimeSeries).map(([type, data]) => [
            type,
            formatTimeSeries(data)
          ])
        ),
        totalOperations: operations.length,
        startDate: startDate || thirtyDaysAgo.toISOString(),
        endDate: endDate || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    next(error);
  }
};

/**
 * @route   GET /api/analytics/operations
 * @desc    Get paginated operations for the data table
 * @access  Private
 */
exports.getOperations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Operation.findAndCountAll({
      where: { userId },
      attributes: ['id', 'type', 'status', 'createdAt', 'metadata'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      raw: true
    });
    
    // Format metadata for display
    const operations = rows.map(op => ({
      ...op,
      metadata: op.metadata ? JSON.stringify(op.metadata) : null
    }));
    
    res.json({
      success: true,
      data: operations,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching operations:', error);
    next(error);
  }
};
