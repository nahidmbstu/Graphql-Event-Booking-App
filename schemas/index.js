const { buildSchema } = require("graphql");

let eventSchema = buildSchema(`

    type Booking {
      _id: ID!,
      event: Event!,
      user: User!,
      canceled: Boolean
      createdAt: String!,
      updatedAt: String!
    }

    type Event {
      _id: ID,
      title: String!,
      description: String!,
      price: Float!,
      date: String!,
      creator: User!
    }

    type User {
      _id: ID,
      email: String!,
      password: String,
      createdEvents:[Event!]
    }

    type Canceled {
      status: String!,
    }

    type rootQuery {
        events: [Event!]!,
        bookings(user_id: String!): [Booking!]
    }

    input EventInput {
      title: String!,
      description: String!,
      price: Float!,
      date: String!,
      user_id: ID,
    }

    input UserInput {
      email: String!,
      password: String!
    }

    input BookingInput {
      event_id: String!,
      user_id: String!
    }

 

    type rootMutation {
        createEvents(eventInput : EventInput): Event,
        createUser(userInput: UserInput): User,
        bookEvent(bookEventInput: BookingInput): Booking
        userLogin(email: String!, password: String!): User
        cancelBooking(booking_id: String!): Canceled
    }
    
    schema {
        query : rootQuery
        mutation:  rootMutation
    } 
`);

module.exports = eventSchema;
