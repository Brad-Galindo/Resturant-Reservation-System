const tableService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation middleware
const VALID_TABLE_PROPERTIES = ["table_id", "table_name", "capacity", "reservation_id"];

// Validation table properties
function validateTableProperties(req, res, next) {
  try{
  const { data = {} } = req.body;
  if (Object.keys(data).every(field => VALID_TABLE_PROPERTIES.includes(field))) {
    return next();
  }
  next({
    status: 400,
    message: `Invalid field(s): ${Object.keys(data).filter(field => !VALID_TABLE_PROPERTIES.includes(field)).join(", ")}`,
  });
}
catch (error) {
  next(error);
}
}

// Validation required properties
function validateRequiredProperties(...properties) {
  try{
  return function (req, res, next) {
    const { data = {} } = req.body;
    for (const property of properties) {
      if (!data[property]) {
        return next({
          status: 400,
          message: `A '${property}' property is required.`,
        });
      }
    }
    next();
  };
}
catch (error) {
  next(error);
}
}


const validateTableData = validateRequiredProperties("table_name", "capacity");

// Validation capacity
function validateCapacity(req, res, next) {
  try{
  const { capacity } = req.body.data;
  if (typeof capacity !== "number" || capacity <= 0) {
    return next({
      status: 400,
      message: "capacity must be a number greater than 0.",
    });
  }
  next();
}
catch (error) {
  next(error);
}
}

// Validation table name
function validateTableName(req, res, next) {
  try{
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    return next({
      status: 400,
      message: "table_name must be at least 2 characters long.",
    });
  }
  next();
}
catch (error) {
  next(error);
}
}

// Validation reservation id
function validateReservationId(req, res, next) {
  try{
  const { reservation_id } = req.body.data;
  if (!reservation_id || typeof reservation_id !== 'number') {
    return next({
      status: 400,
      message: "A valid reservation_id is required.",
    });
  }
  next();
}
catch (error) {
  next(error);
}
}


// Validation that table exists in the DB
async function tableExists(req, res, next) {
  try{
  const { table_id } = req.params;
  const table = await tableService.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table with id ${table_id} cannot be found.`,
  });
}
catch (error) {
  next(error);
}
}

// Validation reservations exists in DB
async function reservationExists(req, res, next) {
  try{
  const { reservation_id } = req.body.data;
  const reservation = await tableService.readReservation(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} does not exist.`,
  });
}
catch (error) {
  next(error);
}
}

// Validation table capacity
async function validateTableCapacity(req, res, next) {
  try{
  const { capacity } = res.locals.table;
  const { people: partySize } = res.locals.reservation;
  if (capacity < partySize) {
    return next({
      status: 400,
      message: `Table does not have sufficient capacity for ${partySize} people.`,
    });
  }
  next();
}
catch (error) {
  next(error);
}
}

// Validation table occupancy
function validateTableOccupancy(shouldBeOccupied) {
  try{
  return function (req, res, next) {
    const { reservation_id } = res.locals.table;
    if (shouldBeOccupied ? !reservation_id : reservation_id) {
      return next({
        status: 400,
        message: shouldBeOccupied ? `Table is not occupied` : `Table is occupied`,
      });
    }
    next();
  };
}
catch (error) {
  next(error);
}
}

// Validation for creating a table
async function createTable(req, res) {
  try{
  const newTable = await tableService.create(req.body.data);
  res.status(201).json({ data: newTable });
  }
  catch (error) {
    next(error);
  }
}

// Validation for clearing a table when finished
async function clearTable(req, res, next) {
  try {
    const { table_id, reservation_id } = res.locals.table;
    await tableService.updateReservationStatus(reservation_id, "finished");
    const clearedTable = await tableService.clearTableAssignment(table_id);
    res.json({ data: clearedTable });
  } catch (error) {
    next(error);
  }
}

// Validation of listing all tables
async function listTables(req, res) {
  try{
  const tables = await tableService.list();
  res.json({ data: tables });
  }
  catch (error) {
    next(error);
  }
}

// Validation for updating a table
async function updateTable(req, res) {
  try{
  const updatedTable = {
    ...req.body.data,
    table_id: res.locals.table.table_id,
  };
  const table = await tableService.update(updatedTable);
  res.json({ data: table });
}
catch (error) {
  next(error);
}
}

// Validation for destroying a table from DB
async function destroyTable(req, res) {
  try{
  const table_id = res.locals.table.table_id;
  const data = await service.destroy(table_id);
  res.sendStatus(204);
  }
  catch (error) {
    next(error);
  }
}

// Validation of status for reservation when seated
async function updateReservationStatusToSeated(req, res, next) {
  try{
  const { reservation_id } = res.locals.reservation;
  await tableService.updateReservationStatus(reservation_id, "seated");
  next();
  }
  catch (error) {
    next(error);
  }
}

// Validation of status for reservation not seated already
async function validateReservationNotSeated(req, res, next) {
  try{
  const { reservation_id } = req.body.data;
  const reservation = await tableService.readReservation(reservation_id);
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: "Reservation is already seated",
    });
  }
  next();
}
catch (error) {
  next(error);
}
}


module.exports = {
  create: [
    validateTableProperties,
    validateTableData,
    validateCapacity,
    validateTableName,
    asyncErrorBoundary(createTable),
  ],
  list: asyncErrorBoundary(listTables),
  update: [
    validateTableProperties,
    tableExists,
    validateRequiredProperties("reservation_id"),
    validateReservationId,
    reservationExists,
    validateReservationNotSeated,
    validateTableCapacity,
    validateTableOccupancy(false),
    updateReservationStatusToSeated,
    asyncErrorBoundary(updateTable),
  ],
  clearTable: [
    tableExists,
    validateTableOccupancy(true),
    asyncErrorBoundary(clearTable),
  ],
  deleteTable: [
    tableExists,
     asyncErrorBoundary(destroyTable)
  ],
};
