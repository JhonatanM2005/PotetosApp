const {
  Order,
  OrderItem,
  Dish,
  sequelize,
  User,
  Table,
  Category,
} = require("../models");
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

// Exportar datos detallados para Excel
exports.getExportData = async (req, res) => {
  try {
    const { startDate, endDate, reportType = "all" } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const data = {};

    // 1. Reporte de Ventas Detallado
    if (reportType === "all" || reportType === "sales") {
      const salesData = await Order.findAll({
        where: {
          status: "paid",
          ...dateFilter,
        },
        include: [
          {
            model: User,
            as: "waiter",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "cashier",
            attributes: ["id", "name", "email"],
          },
          {
            model: Table,
            as: "table",
            attributes: ["id", "table_number", "capacity"],
          },
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Dish,
                as: "dish",
                attributes: ["id", "name", "category_id"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      data.sales = salesData.map((order) => ({
        orderNumber: order.order_number,
        fecha: order.created_at,
        mesa: order.table?.table_number || "N/A",
        mesero: order.waiter?.name || "N/A",
        cajero: order.cashier?.name || "N/A",
        totalItems: order.items?.length || 0,
        subtotal: parseFloat(order.total_amount),
        propina: parseFloat(order.tip_amount || 0),
        total:
          parseFloat(order.total_amount) + parseFloat(order.tip_amount || 0),
        metodoPago: order.payment_method,
        items:
          order.items?.map((item) => ({
            plato: item.dish_name,
            cantidad: item.quantity,
            precioUnitario: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal),
          })) || [],
      }));
    }

    // 2. Reporte de Productos - Simplificado
    if (reportType === "all" || reportType === "products") {
      try {
        // Obtener datos agregados sin incluir relaciones en el GROUP BY
        const productsRaw = await sequelize.query(
          `
          SELECT 
            oi.dish_id,
            oi.dish_name,
            SUM(oi.quantity) as "totalVendido",
            SUM(oi.subtotal) as "ingresoTotal",
            AVG(oi.unit_price) as "precioPromedio"
          FROM order_items oi
          INNER JOIN orders o ON oi.order_id = o.id
          WHERE o.status = 'paid'
          ${
            startDate && endDate
              ? `AND o.created_at BETWEEN '${new Date(
                  startDate
                ).toISOString()}' AND '${new Date(endDate).toISOString()}'`
              : ""
          }
          GROUP BY oi.dish_id, oi.dish_name
          ORDER BY SUM(oi.quantity) DESC
        `,
          { type: sequelize.QueryTypes.SELECT }
        );

        // Obtener las categorías por separado
        const dishCategories = await Dish.findAll({
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["name"],
            },
          ],
          attributes: ["id", "category_id"],
        });

        const categoryMap = {};
        dishCategories.forEach((dish) => {
          categoryMap[dish.id] = dish.category?.name || "Sin categoría";
        });

        data.products = productsRaw.map((item) => ({
          plato: item.dish_name,
          categoria: categoryMap[item.dish_id] || "Sin categoría",
          totalVendido: parseInt(item.totalVendido || 0),
          ingresoTotal: parseFloat(item.ingresoTotal || 0),
          precioPromedio: parseFloat(item.precioPromedio || 0),
        }));
      } catch (error) {
        console.error("Error in products report:", error);
        data.products = [];
      }
    }

    // 3. Reporte de Meseros
    if (reportType === "all" || reportType === "waiters") {
      const waitersData = await Order.findAll({
        where: {
          status: "paid",
          ...dateFilter,
        },
        include: [
          {
            model: User,
            as: "waiter",
            attributes: ["id", "name", "email"],
          },
        ],
        attributes: [
          "waiter_id",
          [sequelize.fn("COUNT", sequelize.col("Order.id")), "totalOrdenes"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "totalVentas"],
          [sequelize.fn("SUM", sequelize.col("tip_amount")), "totalPropinas"],
          [
            sequelize.fn("AVG", sequelize.col("total_amount")),
            "ticketPromedio",
          ],
        ],
        group: ["waiter_id", "waiter.id", "waiter.name", "waiter.email"],
        raw: false,
      });

      data.waiters = waitersData.map((item) => ({
        mesero: item.waiter?.name || "Sin asignar",
        email: item.waiter?.email || "N/A",
        totalOrdenes: parseInt(item.dataValues.totalOrdenes || 0),
        totalVentas: parseFloat(item.dataValues.totalVentas || 0),
        totalPropinas: parseFloat(item.dataValues.totalPropinas || 0),
        ticketPromedio: parseFloat(item.dataValues.ticketPromedio || 0),
      }));
    }

    // 4. Reporte de Mesas
    if (reportType === "all" || reportType === "tables") {
      const tablesData = await Order.findAll({
        where: {
          status: "paid",
          ...dateFilter,
        },
        include: [
          {
            model: Table,
            as: "table",
            attributes: ["id", "table_number", "capacity"],
          },
        ],
        attributes: [
          "table_id",
          [sequelize.fn("COUNT", sequelize.col("Order.id")), "totalOrdenes"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "totalVentas"],
          [
            sequelize.fn("AVG", sequelize.col("total_amount")),
            "ticketPromedio",
          ],
        ],
        group: ["table_id", "table.id", "table.table_number", "table.capacity"],
        order: [[sequelize.fn("COUNT", sequelize.col("Order.id")), "DESC"]],
        raw: false,
      });

      data.tables = tablesData.map((item) => ({
        numeroMesa: item.table?.table_number || "N/A",
        capacidad: item.table?.capacity || 0,
        totalOrdenes: parseInt(item.dataValues.totalOrdenes || 0),
        totalVentas: parseFloat(item.dataValues.totalVentas || 0),
        ticketPromedio: parseFloat(item.dataValues.ticketPromedio || 0),
      }));
    }

    // 5. Reporte Financiero
    if (reportType === "all" || reportType === "financial") {
      const financialData = await Order.findAll({
        where: {
          status: "paid",
          ...dateFilter,
        },
        attributes: [
          "payment_method",
          [sequelize.fn("COUNT", sequelize.col("id")), "totalTransacciones"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "totalVentas"],
          [sequelize.fn("SUM", sequelize.col("tip_amount")), "totalPropinas"],
        ],
        group: ["payment_method"],
        raw: true,
      });

      data.financial = financialData.map((item) => ({
        metodoPago: item.payment_method || "N/A",
        totalTransacciones: parseInt(item.totalTransacciones || 0),
        totalVentas: parseFloat(item.totalVentas || 0),
        totalPropinas: parseFloat(item.totalPropinas || 0),
        total:
          parseFloat(item.totalVentas || 0) +
          parseFloat(item.totalPropinas || 0),
      }));
    }

    res.json({
      success: true,
      data,
      period: {
        startDate: startDate || "Inicio",
        endDate: endDate || "Hoy",
      },
    });
  } catch (error) {
    console.error("Get export data error:", error);
    res.status(500).json({
      message: "Error al obtener datos de exportación",
      error: error.message,
    });
  }
};

// Obtener estadísticas para resumen admin en Settings
exports.getAdminStats = async (req, res) => {
  try {
    // Total de usuarios registrados
    const totalUsers = await User.count();

    // Total de órdenes pagadas
    const totalOrders = await Order.count({
      where: {
        status: "paid",
      },
    });

    // Ingresos totales
    const totalRevenue = await Order.sum("total_amount", {
      where: {
        status: "paid",
      },
    });

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue || 0),
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas del sistema",
      error: error.message,
    });
  }
};

