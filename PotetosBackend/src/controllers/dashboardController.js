const { Order, OrderItem, Dish, sequelize } = require("../models");
const { Op } = require("sequelize");

// Obtener estadísticas del dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = "week" } = req.query; // day, week, month, year

    // Calcular fechas según el período
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // 1. Balance de ventas
    const salesData = await Order.findAll({
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orders_count"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("created_at"))],
      order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    // 2. Platos más vendidos
    const topDishes = await OrderItem.findAll({
      include: [
        {
          model: Order,
          as: "order",
          where: {
            status: "paid",
            created_at: {
              [Op.gte]: startDate,
            },
          },
          attributes: [],
        },
        {
          model: Dish,
          as: "dish",
          attributes: ["id", "name", "price", "image_url"],
        },
      ],
      attributes: [
        "dish_id",
        "dish_name",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity"],
        [sequelize.fn("SUM", sequelize.col("subtotal")), "total_revenue"],
      ],
      group: [
        "dish_id",
        "dish_name",
        "dish.id",
        "dish.name",
        "dish.price",
        "dish.image_url",
      ],
      order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
      limit: 10,
      raw: false,
    });

    // 3. Horas más concurridas (órdenes por hora)
    const peakHours = await Order.findAll({
      where: {
        status: {
          [Op.in]: ["paid", "delivered"],
        },
        created_at: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        [
          sequelize.fn("EXTRACT", sequelize.literal("HOUR FROM created_at")),
          "hour",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "orders_count"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total_sales"],
      ],
      group: [
        sequelize.fn("EXTRACT", sequelize.literal("HOUR FROM created_at")),
      ],
      order: [
        [
          sequelize.fn("EXTRACT", sequelize.literal("HOUR FROM created_at")),
          "ASC",
        ],
      ],
      raw: true,
    });

    // 4. Resumen general
    const totalSales = await Order.sum("total_amount", {
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: startDate,
        },
      },
    });

    const totalOrders = await Order.count({
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: startDate,
        },
      },
    });

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calcular ventas del período anterior para comparación
    const previousStartDate = new Date(startDate);
    const periodDiff = now - startDate;
    previousStartDate.setTime(previousStartDate.getTime() - periodDiff);

    const previousSales = await Order.sum("total_amount", {
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: previousStartDate,
          [Op.lt]: startDate,
        },
      },
    });

    const salesGrowth =
      previousSales > 0
        ? ((totalSales - previousSales) / previousSales) * 100
        : 0;

    res.json({
      summary: {
        totalSales: parseFloat(totalSales || 0).toFixed(2),
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue).toFixed(2),
        salesGrowth: parseFloat(salesGrowth).toFixed(2),
      },
      salesData: salesData.map((item) => ({
        date: item.date,
        total: parseFloat(item.total || 0),
        orders: parseInt(item.orders_count || 0),
      })),
      topDishes: topDishes.map((item) => ({
        dishId: item.dish_id,
        dishName: item.dish_name,
        totalQuantity: parseInt(item.dataValues.total_quantity || 0),
        totalRevenue: parseFloat(item.dataValues.total_revenue || 0),
        dish: item.dish,
      })),
      peakHours: peakHours.map((item) => ({
        hour: parseInt(item.hour),
        ordersCount: parseInt(item.orders_count || 0),
        totalSales: parseFloat(item.total_sales || 0),
      })),
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Obtener estadísticas de rendimiento del día
exports.getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total de órdenes hoy
    const ordersCount = await Order.count({
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    // Total de ventas hoy
    const totalSales = await Order.sum("total_amount", {
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    // Órdenes activas (en proceso)
    const activeOrders = await Order.count({
      where: {
        status: {
          [Op.in]: ["pending", "preparing", "ready"],
        },
      },
    });

    // Total de platos servidos hoy
    const dishesServed = await OrderItem.sum("quantity", {
      include: [
        {
          model: Order,
          as: "order",
          where: {
            status: "paid",
            created_at: {
              [Op.gte]: today,
            },
          },
          attributes: [],
        },
      ],
    });

    // Ticket promedio
    const averageOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

    res.json({
      ordersCount,
      totalSales: parseFloat(totalSales || 0),
      activeOrders,
      dishesServed: parseInt(dishesServed || 0),
      averageOrderValue: parseFloat(averageOrderValue || 0),
    });
  } catch (error) {
    console.error("Get today stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
