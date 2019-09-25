const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    event: {
      type: mongoose.Types.ObjectId,
      ref: "Event"
    },
    canceled: {
      type: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
