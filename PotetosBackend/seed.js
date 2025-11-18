require("dotenv").config();
const { sequelize, User, Category, Dish, Table } = require("./src/models");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Sincronizar base de datos
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced\n");

    // 1. Crear usuarios
    console.log("👥 Creating users...");
    const users = await User.bulkCreate(
      [
        {
          name: "Admin",
          email: "admin@potetos.com",
          password: "Admin123",
          role: "admin",
          phone: "123456789",
          is_active: true,
        },
        {
          name: "Juan Mesero",
          email: "mesero@potetos.com",
          password: "Mesero123",
          role: "mesero",
          phone: "987654321",
          is_active: true,
        },
        {
          name: "Carlos Chef",
          email: "chef@potetos.com",
          password: "Chef123",
          role: "chef",
          phone: "555123456",
          is_active: true,
        },
        {
          name: "María Cajera",
          email: "cajero@potetos.com",
          password: "Cajero123",
          role: "cajero",
          phone: "555987654",
          is_active: true,
        },
      ],
      { individualHooks: true }
    );
    console.log(`✅ Created ${users.length} users\n`);

    // 2. Crear categorías
    console.log("📂 Creating categories...");
    const categories = await Category.bulkCreate([
      {
        name: "Papitas",
        description: "Deliciosas papitas fritas en diferentes estilos",
        icon: "�",
        order_index: 1,
        is_active: true,
      },
      {
        name: "Salsas",
        description: "Variedad de salsas para acompañar",
        icon: "🥫",
        order_index: 2,
        is_active: true,
      },
      {
        name: "Bebidas",
        description: "Bebidas frías y calientes",
        icon: "🥤",
        order_index: 3,
        is_active: true,
      },
      {
        name: "Postres",
        description: "Dulces tentaciones",
        icon: "🍰",
        order_index: 4,
        is_active: true,
      },
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // 3. No crear platos inicialmente (se agregarán desde la app)
    console.log("ℹ️ Skipping dishes (will be added from the app)\n");

    // 4. Crear mesas
    console.log("🪑 Creating tables...");
    const tables = await Table.bulkCreate([
      {
        table_number: 1,
        capacity: 4,
        location: "Salón Principal",
        status: "available",
        is_active: true,
      },
      {
        table_number: 2,
        capacity: 4,
        location: "Salón Principal",
        status: "available",
        is_active: true,
      },
      {
        table_number: 3,
        capacity: 2,
        location: "Salón Principal",
        status: "available",
        is_active: true,
      },
      {
        table_number: 4,
        capacity: 2,
        location: "Terraza",
        status: "available",
        is_active: true,
      },
      {
        table_number: 5,
        capacity: 6,
        location: "Terraza",
        status: "available",
        is_active: true,
      },
    ]);
    console.log(`✅ Created ${tables.length} tables\n`);

    console.log("🎉 Database seeded successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Tables: ${tables.length}\n`);

    console.log("👤 User Credentials:");
    console.log("   Admin:");
    console.log("     Email:    admin@potetos.com");
    console.log("     Password: Admin123");
    console.log("   Mesero:");
    console.log("     Email:    mesero@potetos.com");
    console.log("     Password: Mesero123");
    console.log("   Chef:");
    console.log("     Email:    chef@potetos.com");
    console.log("     Password: Chef123");
    console.log("   Cajero:");
    console.log("     Email:    cajero@potetos.com");
    console.log("     Password: Cajero123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
