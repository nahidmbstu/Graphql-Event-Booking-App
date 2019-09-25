const Bcrypt = require("bcrypt");
const Event = require("../models/event");
const User = require("../models/user");
const Booking = require("../models/booking");
const DataLoader = require("dataloader");

/// helping pure function //////////////////////////////

let events = eventId => {
  return Event.find({ _id: { $in: eventId } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          creator: user.bind(this, event._doc.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

let user = id => {
  return User.findById(id)
    .then(user => {
      return {
        ...user._doc,
        password: null,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

const eventLoader = new DataLoader(eventIds => {
  return events(eventIds);
});

const singleEvent = async eventId => {
  try {
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (err) {
    throw err;
  }
};

/////////////////  resolvers /////////////////////////////////////////////////

const resolvers = {
  ///////////////////  query  ////////////////////////////

  events: () => {
    return Event.find({})
      .then(res => {
        let result = res.map(ev => {
          return {
            ...ev._doc,
            creator: user.bind(this, ev._doc.creator)
          };
        });
        return result;
      })
      .catch(err => {
        throw err;
      });
  },

  ////////////////////// mutations ////////////////

  createEvents: async arg => {
    let { eventInput } = arg;

    try {
      let user = await User.findById(eventInput.user_id);
      if (!user) {
        throw new Error("No User Found");
      }

      let event = new Event({
        title: eventInput.title,
        description: eventInput.description,
        price: eventInput.price,
        date: new Date(eventInput.date),
        creator: eventInput.user_id
      });

      let createdEvent = await event.save();

      if (!createdEvent) {
        throw new Error("Event Not Saved");
      }

      user.createdEvents.push(event);
      let newUser = await user.save();
      console.log(newUser);

      return createdEvent; // Event type
    } catch (err) {
      throw err;
    }

    // check  the return type
  },

  createUser: arg => {
    return User.findOne({ email: arg.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User Already Registered");
        }

        return Bcrypt.hash(arg.userInput.password, 12);
      })
      .then(hashPass => {
        let user = new User({
          email: arg.userInput.email,
          password: hashPass
        });
        return user.save();
      })
      .then(user => {
        console.log(user);
        user.password = null;
        return user;
      })
      .catch(err => {
        throw err;
      });
  },

  /////////////////// get bookings /////////////////

  bookings: arg => {
    let { user_id } = arg;

    return Booking.find({ user: user_id })
      .then(data => {
        return data.map(ev => {
          return {
            ...ev._doc,
            event: singleEvent.bind(this, ev._doc.event),
            user: user.bind(this, ev._doc.user)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },

  /// book an event ///////////

  bookEvent: async arg => {
    let { bookEventInput } = arg;
    return Event.findOne({ _id: bookEventInput.event_id })
      .then(async event => {
        if (!event) {
          throw new Error("No Event Found");
        }

        let { user_id } = bookEventInput;

        let booked = await Booking.findOne({ event: bookEventInput.event_id });
        if (booked) {
          throw new Error("Already Booked This Event");
        }

        let user = await User.findOne({ _id: user_id });
        if (!user) {
          throw new Error("No User ID Found");
        }

        let booking = new Booking({
          user: bookEventInput.user_id,
          event: bookEventInput.event_id,
          canceled: false
        });

        let savedBooking = await booking.save();
        return savedBooking;
      })
      .catch(err => {
        throw err;
      });
  },

  /////////////   cancel event /////////////
  cancelBooking: async arg => {
    let { booking_id } = arg;

    return Booking.findByIdAndRemove({ _id: booking_id })
      .then(data => {
        console.log(data);
        return {
          status: "Booking Canceled"
        };
      })
      .catch(err => {
        throw err;
      });
  },

  //////////////////  user login ///////////

  userLogin: async arg => {
    let { email, password } = arg;

    return User.findOne({ email: email })
      .then(async user => {
        if (user) {
          const match = await Bcrypt.compare(password, user.password);
          if (match) {
            let all_event = await Event.find({ creator: user._id });

            return {
              ...user._doc,
              createdEvents: all_event
            };
          }
        }

        throw new Error("No User Found");
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = resolvers;
