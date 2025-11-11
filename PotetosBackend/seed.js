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
          password: "admin123",
          role: "admin",
          phone: "123456789",
          is_active: true,
        },
        {
          name: "Juan Mesero",
          email: "mesero@potetos.com",
          password: "mesero123",
          role: "mesero",
          phone: "987654321",
          is_active: true,
        },
        {
          name: "Carlos Chef",
          email: "chef@potetos.com",
          password: "chef123",
          role: "chef",
          phone: "456789123",
          is_active: true,
        },
        {
          name: "Ana Cajera",
          email: "cajero@potetos.com",
          password: "cajero123",
          role: "cajero",
          phone: "789123456",
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
        name: "Entradas",
        description: "Deliciosas entradas para comenzar",
        icon: "🥗",
        order_index: 1,
        is_active: true,
      },
      {
        name: "Platos Principales",
        description: "Nuestros mejores platos principales",
        icon: "🍽️",
        order_index: 2,
        is_active: true,
      },
      {
        name: "Hamburguesas",
        description: "Hamburguesas artesanales",
        icon: "🍔",
        order_index: 3,
        is_active: true,
      },
      {
        name: "Pizzas",
        description: "Pizzas al horno de leña",
        icon: "🍕",
        order_index: 4,
        is_active: true,
      },
      {
        name: "Bebidas",
        description: "Bebidas frías y calientes",
        icon: "🥤",
        order_index: 5,
        is_active: true,
      },
      {
        name: "Postres",
        description: "Dulces tentaciones",
        icon: "🍰",
        order_index: 6,
        is_active: true,
      },
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // 3. Crear platos
    console.log("🍽️ Creating dishes...");
    const dishes = await Dish.bulkCreate([
      // Entradas
      {
        name: "Ensalada César",
        description: "Lechuga romana, crutones, parmesano y aderezo César",
        price: 8.99,
        category_id: categories[0].id,
        image_url: "/images/dishes/ensalada-cesar.jpg",
        preparation_time: 10,
        is_available: true,
        is_active: true,
      },
      {
        name: "Alitas Picantes",
        description: "10 alitas con salsa BBQ o Buffalo",
        price: 11.99,
        category_id: categories[0].id,
        image_url: "/images/dishes/alitas.jpg",
        preparation_time: 15,
        is_available: true,
        is_active: true,
      },
      // Platos Principales
      {
        name: "Lomo Saltado",
        description: "Lomo fino salteado con verduras y papas fritas",
        price: 18.99,
        category_id: categories[1].id,
        image_url: "/images/dishes/lomo-saltado.jpg",
        preparation_time: 25,
        is_available: true,
        is_active: true,
      },
      {
        name: "Arroz con Pollo",
        description: "Arroz con pollo y verduras, acompañado de ensalada",
        price: 14.99,
        category_id: categories[1].id,
        image_url: "/images/dishes/arroz-pollo.jpg",
        preparation_time: 20,
        is_available: true,
        is_active: true,
      },
      // Hamburguesas
      {
        name: "Hamburguesa Clásica",
        description: "Carne 180g, queso cheddar, lechuga, tomate, cebolla",
        price: 12.99,
        category_id: categories[2].id,
        image_url: "/images/dishes/burger-clasica.jpg",
        preparation_time: 20,
        is_available: true,
        is_active: true,
      },
      {
        name: "Hamburguesa BBQ",
        description: "Carne 200g, queso, tocino, cebolla crispy, salsa BBQ",
        price: 15.99,
        category_id: categories[2].id,
        image_url: "/images/dishes/burger-bbq.jpg",
        preparation_time: 20,
        is_available: true,
        is_active: true,
      },
      // Pizzas
      {
        name: "Pizza Margarita",
        description: "Tomate, mozzarella, albahaca fresca",
        price: 13.99,
        category_id: categories[3].id,
        image_url: "/images/dishes/pizza-margarita.jpg",
        preparation_time: 18,
        is_available: true,
        is_active: true,
      },
      {
        name: "Pizza Pepperoni",
        description: "Mozzarella, pepperoni, orégano",
        price: 16.99,
        category_id: categories[3].id,
        image_url: "/images/dishes/pizza-pepperoni.jpg",
        preparation_time: 18,
        is_available: true,
        is_active: true,
      },
      // Bebidas
      {
        name: "Coca Cola",
        description: "Coca Cola 500ml",
        price: 2.99,
        category_id: categories[4].id,
        image_url: "/images/dishes/cocacola.jpg",
        preparation_time: 2,
        is_available: true,
        is_active: true,
      },
      {
        name: "Limonada Natural",
        description: "Limonada fresca hecha al momento",
        price: 3.99,
        category_id: categories[4].id,
        image_url: "/images/dishes/limonada.jpg",
        preparation_time: 5,
        is_available: true,
        is_active: true,
      },
      // Postres
      {
        name: "Cheesecake",
        description: "Cheesecake de fresa con coulis de frutos rojos",
        price: 7.99,
        category_id: categories[5].id,
        image_url: "/images/dishes/cheesecake.jpg",
        preparation_time: 5,
        is_available: true,
        is_active: true,
      },
      {
        name: "Brownie con Helado",
        description: "Brownie tibio con helado de vainilla y chocolate",
        price: 6.99,
        category_id: categories[5].id,
        image_url: "/images/dishes/brownie.jpg",
        preparation_time: 8,
        is_available: true,
        is_active: true,
      },
    ]);
    console.log(`✅ Created ${dishes.length} dishes\n`);

    // 4. Crear mesas
    console.log("🪑 Creating tables...");
    const tables = await Table.bulkCreate([
      {
        table_number: 1,
        capacity: 2,
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
        capacity: 4,
        location: "Salón Principal",
        status: "available",
        is_active: true,
      },
      {
        table_number: 4,
        capacity: 6,
        location: "Salón Principal",
        status: "available",
        is_active: true,
      },
      {
        table_number: 5,
        capacity: 2,
        location: "Terraza",
        status: "available",
        is_active: true,
      },
      {
        table_number: 6,
        capacity: 4,
        location: "Terraza",
        status: "available",
        is_active: true,
      },
      {
        table_number: 7,
        capacity: 4,
        location: "Terraza",
        status: "available",
        is_active: true,
      },
      {
        table_number: 8,
        capacity: 8,
        location: "Salón VIP",
        status: "available",
        is_active: true,
      },
      {
        table_number: 9,
        capacity: 6,
        location: "Salón VIP",
        status: "available",
        is_active: true,
      },
      {
        table_number: 10,
        capacity: 4,
        location: "Bar",
        status: "available",
        is_active: true,
      },
    ]);
    console.log(`✅ Created ${tables.length} tables\n`);

    console.log("🎉 Database seeded successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Dishes: ${dishes.length}`);
    console.log(`   Tables: ${tables.length}\n`);

    console.log("👤 Test Credentials:");
    console.log("   Admin:  admin@potetos.com / admin123");
    console.log("   Mesero: mesero@potetos.com / mesero123");
    console.log("   Chef:   chef@potetos.com / chef123");
    console.log("   Cajero: cajero@potetos.com / cajero123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
