require("dotenv").config();
const { sequelize, User, Category, Dish, Table } = require("./src/models");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Sincronizar base de datos
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced\n");

    // 1. Crear usuario Admin
    console.log("👥 Creating admin user...");
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
      ],
      { individualHooks: true }
    );
    console.log(`✅ Created admin user\n`);

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

    console.log("👤 Admin Credentials:");
    console.log("   Email:    admin@potetos.com");
    console.log("   Password: Admin123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
