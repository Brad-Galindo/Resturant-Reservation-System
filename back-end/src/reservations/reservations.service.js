const knex = require("../db/connection");

// Retrieve all reservations, ordered by date
function list() {
  return knex("reservations")
    .select("*")
    .orderBy("reservation_date");
}

// Fetch reservations for a specific date, excluding finished ones
function listByDate(date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
    .whereNot({ status: "finished" })
    .orderBy("reservation_time");
}

// Search reservations by mobile number, ignoring formatting
function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

// Create a new reservation
function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// Retrieve a specific reservation by ID
function read(reservation_id) {
  return knex("reservations").where({ reservation_id: reservation_id }).first();
}

// Update the status of a reservation
async function updateStatus(reservation_id, status) {
  const updatedReservation = await knex("reservations")
    .where({ reservation_id })
    .update({ status })
    .returning("*")
    .then((rows) => rows[0]);

  if (!updatedReservation) {
    throw new Error(`Reservation with id ${reservation_id} not found`);
  }

  return updatedReservation;
}

// Update a reservation's details
async function update(updatedReservation) {
  const { reservation_id } = updatedReservation;
  const result = await knex("reservations")
    .where({ reservation_id })
    .update(updatedReservation)
    .returning("*");

  return result[0];
}

module.exports = {
  list,
  listByDate,
  search,
  create,
  read,
  updateStatus,
  search,
  update,
};
