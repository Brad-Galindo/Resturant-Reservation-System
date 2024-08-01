const knex = require("../db/connection");

// Create a new table
async function create(table) {
  try {
    const createdRecord = await knex("tables")
      .insert(table)
      .returning("*");
    return createdRecord[0];
  } catch (error) {
    throw new Error(`Error creating table: ${error.message}`);
  }
}

// List all tables, ordered by name
async function list() {
    try {
      return await knex("tables").select("*").orderBy("table_name", "asc");
    } catch (error) {
      throw new Error(`Error listing tables: ${error.message}`);
    }
  }

  // Retrieve a specific table by ID
  async function read(table_id) {
    try {
      return await knex("tables")
        .select("*")
        .where({ table_id: table_id })
        .first();
    } catch (error) {
      throw new Error(`Error reading table: ${error.message}`);
    }
  }

  // Update a table's details
async function update(updatedTable) {
  try {
    const updatedRecord = await knex("tables")
      .where({ table_id: updatedTable.table_id })
      .update(updatedTable, "*");
    return updatedRecord[0];
  } catch (error) {
    throw new Error(`Error updating table: ${error.message}`);
  }
}


  // Retrieve a specific reservation by ID
async function readReservation(reservation_id) {
  try {
    return await knex("reservations")
      .select("*")
      .where({ reservation_id: reservation_id })
      .first();
  } catch (error) {
    throw new Error(`Error reading reservation: ${error.message}`);
  }
}

  // Delete a table by ID
async function deleteTable(tableId) {
    try {
      return await knex("tables").where({ table_id: tableId }).del();
    } catch (error) {
      throw new Error(`Error deleting table: ${error.message}`);
    }
  }


  // Update a table's reservation
  async function updateReservationStatus(reservationId, status) {
    try {
      const updated = await knex("reservations")
        .where({ reservation_id: reservationId })
        .update({ status }, "*");
      return updated[0];
    } catch (error) {
      throw new Error(`Error updating reservation status: ${error.message}`);
    }
  }

  // Clear a table's reservation assignment
  async function clearTableAssignment(tableId) {
    try {
      const updated = await knex("tables")
        .where({ table_id: tableId })
        .update({ reservation_id: null }, "*");
      return updated[0];
    } catch (error) {
      throw new Error(`Error clearing table assignment: ${error.message}`);
    }
  }

// Seat a reservation at a table
async function seat(table_id, reservation_id) {
  try {
    await knex.transaction(async (trx) => {
      // Check if the reservation is already seated
      const reservation = await trx("reservations")
        .where({ reservation_id: reservation_id })
        .first();

      if (reservation.status === "seated") {
        throw new Error("Reservation is already seated");
      }

      // Update the table with the reservation_id
      await trx("tables")
        .where({ table_id: table_id })
        .update({ reservation_id: reservation_id });

      // Update the reservation status to "seated"
      await trx("reservations")
        .where({ reservation_id: reservation_id })
        .update({ status: "seated" });
    });

    // Return the updated table
    return await knex("tables")
      .where({ table_id: table_id })
      .first();
  } catch (error) {
    throw new Error(`Error seating reservation: ${error.message}`);
  }
}


module.exports = {
  create,
  list,
  update,
  read,
  readReservation,
  deleteTable,
  updateReservationStatus,
  clearTableAssignment,
  seat,
};
