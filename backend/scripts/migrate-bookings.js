require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Migration script
const migrateBookings = async () => {
  try {
    await connectDB();

    // Get the Booking collection directly (bypassing model to check raw data)
    const db = mongoose.connection.db;
    const bookingsCollection = db.collection("bookings");

    // Find all bookings
    const allBookings = await bookingsCollection.find({}).toArray();
    console.log(`\n📊 Found ${allBookings.length} total booking(s)`);

    if (allBookings.length === 0) {
      console.log("✅ No bookings to migrate. Database is clean!");
      await mongoose.connection.close();
      return;
    }

    let migrated = 0;
    let deleted = 0;
    const errors = [];

    for (const booking of allBookings) {
      const hasOldSchema = booking.userId || booking.eventId;
      const hasNewSchema = booking.user && booking.event;

      // Skip if already using new schema
      if (hasNewSchema && !hasOldSchema) {
        console.log(`⏭️  Skipping booking ${booking._id} - already migrated`);
        continue;
      }

      // If has both old and new, prefer new (but log warning)
      if (hasNewSchema && hasOldSchema) {
        console.log(`⚠️  Booking ${booking._id} has both old and new schema. Keeping new schema.`);
        // Clean up old fields
        await bookingsCollection.updateOne(
          { _id: booking._id },
          { $unset: { userId: "", eventId: "" } }
        );
        continue;
      }

      // Try to migrate old schema to new schema
      if (hasOldSchema && !hasNewSchema) {
        const userId = booking.userId;
        const eventId = booking.eventId;

        // Check if userId and eventId are valid ObjectIds
        const isValidUserId = mongoose.Types.ObjectId.isValid(userId);
        const isValidEventId = mongoose.Types.ObjectId.isValid(eventId);

        if (isValidUserId && isValidEventId) {
          // Migrate: convert userId/eventId strings to user/event ObjectIds
          try {
            await bookingsCollection.updateOne(
              { _id: booking._id },
              {
                $set: {
                  user: new mongoose.Types.ObjectId(userId),
                  event: new mongoose.Types.ObjectId(eventId),
                  status: booking.status || "confirmed",
                  seats: booking.seats || 1,
                },
                $unset: { userId: "", eventId: "" },
              }
            );
            migrated++;
            console.log(`✅ Migrated booking ${booking._id}`);
          } catch (err) {
            errors.push({ bookingId: booking._id, error: err.message });
            console.log(`❌ Failed to migrate booking ${booking._id}: ${err.message}`);
          }
        } else {
          // Invalid ObjectIds - delete the booking
          try {
            await bookingsCollection.deleteOne({ _id: booking._id });
            deleted++;
            console.log(`🗑️  Deleted booking ${booking._id} (invalid userId/eventId format)`);
          } catch (err) {
            errors.push({ bookingId: booking._id, error: err.message });
            console.log(`❌ Failed to delete booking ${booking._id}: ${err.message}`);
          }
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📋 Migration Summary:");
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   🗑️  Deleted: ${deleted}`);
    console.log(`   ⏭️  Skipped: ${allBookings.length - migrated - deleted - errors.length}`);
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`);
      errors.forEach((e) => console.log(`      - Booking ${e.bookingId}: ${e.error}`));
    }
    console.log("=".repeat(50));

    // Verify final state
    const finalCount = await bookingsCollection.countDocuments({});
    console.log(`\n📊 Final booking count: ${finalCount}`);

    await mongoose.connection.close();
    console.log("\n✅ Migration completed!");
  } catch (error) {
    console.error("\n❌ Migration error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run migration
migrateBookings();
