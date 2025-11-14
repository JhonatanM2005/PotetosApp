require("dotenv").config();
const { sequelize, User, Category, Dish, Order, OrderItem, Table } = require("./src/models");

const seedTestOrders = async () => {
  try {
    console.log("🌱 Generando órdenes de prueba para el dashboard...\n");

    // Obtener datos existentes
    const admin = await User.findOne({ where: { email: "admin@potetos.com" } });
    const tables = await Table.findAll();
    const categories = await Category.findAll();

    if (!admin) {
      console.log("❌ No se encontró el usuario admin. Ejecuta primero: npm run seed");
      process.exit(1);
    }

    // Crear platos de prueba si no existen
    console.log("🍽️ Creando platos de prueba...");
    const dishes = await Dish.bulkCreate([
      {
        name: "Papitas Francesas",
        description: "Clásicas papitas fritas",
        price: 8000,
        category_id: categories[0].id,
        preparation_time: 10,
        is_available: true,
        is_active: true,
      },
      {
        name: "Papitas con Queso",
        description: "Papitas con queso derretido",
        price: 12000,
        category_id: categories[0].id,
        preparation_time: 12,
        is_available: true,
        is_active: true,
      },
      {
        name: "Papitas BBQ",
        description: "Papitas con salsa BBQ",
        price: 10000,
        category_id: categories[0].id,
        preparation_time: 10,
        is_available: true,
        is_active: true,
      },
      {
        name: "Salsa de Ajo",
        description: "Deliciosa salsa de ajo",
        price: 2000,
        category_id: categories[1].id,
        preparation_time: 2,
        is_available: true,
        is_active: true,
      },
      {
        name: "Coca Cola",
        description: "Bebida refrescante 350ml",
        price: 3000,
        category_id: categories[2].id,
        preparation_time: 1,
        is_available: true,
        is_active: true,
      },
      {
        name: "Brownie",
        description: "Brownie de chocolate con helado",
        price: 9000,
        category_id: categories[3].id,
        preparation_time: 5,
        is_available: true,
        is_active: true,
      },
    ], { updateOnDuplicate: ["name", "price"] });
    console.log(`✅ Creados ${dishes.length} platos\n`);

    // Generar órdenes de los últimos 30 días
    console.log("📝 Generando órdenes...");
    const ordersCount = 50; // 50 órdenes de prueba
    let ordersCreated = 0;

    for (let i = 0; i < ordersCount; i++) {
      // Fecha aleatoria en los últimos 30 días
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursOffset = Math.floor(Math.random() * 12) + 10; // Entre 10am y 10pm
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(hoursOffset, Math.floor(Math.random() * 60), 0, 0);

      // Seleccionar mesa aleatoria
      const table = tables[Math.floor(Math.random() * tables.length)];

      // Crear orden
      const order = await Order.create({
        order_number: `ORD-${Date.now()}-${i}`,
        table_id: table.id,
        waiter_id: admin.id,
        customer_name: `Cliente ${i + 1}`,
        customer_count: Math.floor(Math.random() * 4) + 1,
        status: "paid", // Todas las órdenes están pagadas para el dashboard
        created_at: orderDate,
        updated_at: orderDate,
        completed_at: new Date(orderDate.getTime() + 30 * 60000), // 30 minutos después
      });

      // Agregar items (2-4 items por orden)
      const itemsCount = Math.floor(Math.random() * 3) + 2;
      let orderTotal = 0;

      for (let j = 0; j < itemsCount; j++) {
        const dish = dishes[Math.floor(Math.random() * dishes.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const subtotal = parseFloat(dish.price) * quantity;

        await OrderItem.create({
          order_id: order.id,
          dish_id: dish.id,
          dish_name: dish.name,
          quantity: quantity,
          unit_price: dish.price,
          subtotal: subtotal,
          status: "delivered",
          created_at: orderDate,
          updated_at: orderDate,
        });

        orderTotal += subtotal;
      }

      // Actualizar total de la orden
      await order.update({ total_amount: orderTotal });
      ordersCreated++;
    }

    console.log(`✅ Creadas ${ordersCreated} órdenes de prueba\n`);

    // Mostrar estadísticas
    const totalSales = await Order.sum("total_amount", { where: { status: "paid" } });
    const totalOrders = await Order.count({ where: { status: "paid" } });
    const avgTicket = totalSales / totalOrders;

    console.log("📊 Estadísticas generadas:");
    console.log(`   Total Ventas: $${totalSales.toFixed(2)}`);
    console.log(`   Total Órdenes: ${totalOrders}`);
    console.log(`   Ticket Promedio: $${avgTicket.toFixed(2)}\n`);

    console.log("🎉 ¡Datos de prueba generados exitosamente!");
    console.log("💡 Ahora puedes ver el dashboard con datos reales\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error generando datos de prueba:", error);
    process.exit(1);
  }
};

seedTestOrders();
