const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reservation = sequelize.define(
  "Reservation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reservation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reservation_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    number_of_people: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 20,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed", "no_show"),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "reservations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Método de instancia para actualizar estado
Reservation.prototype.updateStatus = async function (newStatus) {
  this.status = newStatus;
  return this.save();
};

// Método estático para obtener reservas del día
Reservation.getTodayReservations = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.findAll({
    where: {
      reservation_date: {
        [require("sequelize").Op.gte]: today,
        [require("sequelize").Op.lt]: tomorrow,
      },
    },
    order: [["reservation_time", "ASC"]],
  });
};

// Método estático para obtener próximas reservas
Reservation.getUpcomingReservations = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.findAll({
    where: {
      reservation_date: {
        [require("sequelize").Op.gte]: today,
      },
      status: ["pending", "confirmed"],
    },
    order: [
      ["reservation_date", "ASC"],
      ["reservation_time", "ASC"],
    ],
  });
};

module.exports = Reservation;
