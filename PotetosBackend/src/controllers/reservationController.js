const { Reservation } = require("../models");
const { Op } = require("sequelize");
const {
  sendReservationCreatedEmail,
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail,
} = require("../services/emailService");

/**
 * Crear una nueva reserva (público)
 */
exports.createReservation = async (req, res) => {
  try {
    const {
      reservation_date,
      reservation_time,
      number_of_people,
      phone,
      customer_name,
      email,
      notes,
    } = req.body;

    // Validar que la fecha no sea en el pasado
    const reservationDate = new Date(reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        message: "No se pueden crear reservas para fechas pasadas",
      });
    }

    // Crear la reserva
    const reservation = await Reservation.create({
      reservation_date,
      reservation_time,
      number_of_people,
      phone,
      customer_name,
      email,
      notes,
      status: "pending",
    });

    // Intentar enviar email de confirmación (no bloquear si falla)
    try {
      await sendReservationCreatedEmail({
        email: reservation.email,
        customer_name: reservation.customer_name,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        number_of_people: reservation.number_of_people,
        notes: reservation.notes,
      });
      console.log(`✅ Email de reserva enviado a ${reservation.email}`);
    } catch (emailError) {
      console.error("⚠️ Error al enviar email de reserva:", emailError.message);
      // No fallar la creación de la reserva si el email falla
    }

    res.status(201).json({
      success: true,
      message: "Reserva creada exitosamente",
      data: reservation,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la reserva",
      error: error.message,
    });
  }
};

// Obtener todas las reservas con filtros (autenticado)
exports.getAllReservations = async (req, res) => {
  try {
    const { status, date, search } = req.query;

    // Construir filtros
    const where = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      where.reservation_date = date;
    }

    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const reservations = await Reservation.findAll({
      where,
      order: [
        ["reservation_date", "DESC"],
        ["reservation_time", "DESC"],
      ],
    });

    res.json({
      success: true,
      data: reservations,
      count: reservations.length,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las reservas",
      error: error.message,
    });
  }
};

// Obtener reservas del día actual (autenticado)
exports.getTodayReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getTodayReservations();

    res.json({
      success: true,
      data: reservations,
      count: reservations.length,
    });
  } catch (error) {
    console.error("Error al obtener reservas del día:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las reservas del día",
      error: error.message,
    });
  }
};

// Obtener próximas reservas (autenticado)
exports.getUpcomingReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getUpcomingReservations();

    res.json({
      success: true,
      data: reservations,
      count: reservations.length,
    });
  } catch (error) {
    console.error("Error al obtener próximas reservas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las próximas reservas",
      error: error.message,
    });
  }
};

// Obtener reserva por ID (autenticado)
exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la reserva",
      error: error.message,
    });
  }
};

// Actualizar estado de reserva (autenticado)
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el estado sea válido
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "no_show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido",
      });
    }

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }

    const oldStatus = reservation.status;

    // Actualizar estado
    await reservation.updateStatus(status);

    // Enviar email según el cambio de estado (no bloquear si falla)
    try {
      const reservationData = {
        email: reservation.email,
        customer_name: reservation.customer_name,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        number_of_people: reservation.number_of_people,
        notes: reservation.notes,
      };

      // pending → confirmed: Email de confirmación
      if (oldStatus === "pending" && status === "confirmed") {
        await sendReservationConfirmedEmail(reservationData);
        console.log(`✅ Email de confirmación enviado a ${reservation.email}`);
      }
      
      // cualquier estado → cancelled: Email de cancelación
      if (status === "cancelled") {
        await sendReservationCancelledEmail(reservationData);
        console.log(`✅ Email de cancelación enviado a ${reservation.email}`);
      }
    } catch (emailError) {
      console.error("⚠️ Error al enviar email:", emailError.message);
      // No fallar la actualización si el email falla
    }

    res.json({
      success: true,
      message: "Estado de reserva actualizado",
      data: reservation,
    });
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el estado de la reserva",
      error: error.message,
    });
  }
};

// Eliminar reserva (admin)
exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }

    await reservation.destroy();

    res.json({
      success: true,
      message: "Reserva eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la reserva",
      error: error.message,
    });
  }
};

// Obtener estadísticas de reservas (autenticado)
exports.getReservationStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Contar reservas por estado
    const [pending, confirmed, todayCount, upcoming] = await Promise.all([
      Reservation.count({ where: { status: "pending" } }),
      Reservation.count({ where: { status: "confirmed" } }),
      Reservation.count({
        where: {
          reservation_date: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      }),
      Reservation.count({
        where: {
          reservation_date: {
            [Op.gte]: today,
          },
          status: ["pending", "confirmed"],
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        pending,
        confirmed,
        today: todayCount,
        upcoming,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};
