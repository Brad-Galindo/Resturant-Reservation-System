const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");
const isPast = require("../../../front-end/src/utils/isPast");

// List reservations based on date or mobile number
async function list(req, res) {
  const { date, mobile_number } = req.query;

  try {
    let reservations;

    if (mobile_number) {
      reservations = await service.search(mobile_number);
    } else if (date) {
      reservations = await service.listByDate(date);
    } else {
      reservations = await service.list();
    }

    res.json({ data: reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Check if reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  try {
    const reservation = await service.read(reservation_id);
    if (reservation) {
      res.locals.reservation = reservation;
      return next();
    }
    next({
      status: 404,
      message: `Reservation id not found: ${reservation_id}`,
    });
  } catch (error) {
    next({ status: 500, message: error.message });
  }
}

// Read a specific reservation
async function read(req, res, next) {
  try {
    const { reservation_id } = req.params;
    const data = await service.read(reservation_id);
    res.json({ data });
  } catch (error) {
    next({ status: 500, message: error.message });
  }
}

// Create a new reservation
async function create(req, res, next) {
  try {
    const newReservation = await service.create(req.body.data);
    res.status(201).json({ data: newReservation });
  } catch (error) {
    next(error);
  }
}

// Validate required fields
function validateFields(req, res, next) {
  const { data = {} } = req.body;

  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      return next({ status: 400, message: `Field ${field} is required` });
    }
  }

  next();
}

// Validate 'people' field is a positive number
function peopleIsNumber(req, res, next) {
  const { people } = req.body.data;
  
  
  if (typeof people !== "number" || people <= 0) {
    return next({ status: 400, message: `people must be a positive number` }, console.log(typeof people, people, "HERE"));
  }
  next();
}

// Validate reservation date and time
function validateReservationDateTime(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;

  // Validate date and time format
  const reservationDate = new Date(reservation_date);
  const [hours, minutes] = reservation_time.split(':').map(Number);

  if (isNaN(reservationDate.getTime())) {
    return next({
      status: 400,
      message: "Invalid reservation_date. It must be a valid date.",
    });
  }

  if (isNaN(hours) || isNaN(minutes)) {
    return next({
      status: 400,
      message: "Invalid reservation_time. It must be a valid time.",
    });
  }

  const reservationDateTimeString = `${reservation_date}T${reservation_time}`;

  // Check if the reservation is in the past
  if (isPast(reservationDateTimeString)) {
    return next({
      status: 400,
      message: "Reservation must be in the future",
    });
  }

  // Check if the reservation is during business hours
  if (hours < 10 || (hours === 10 && minutes < 30) || hours > 21 || (hours === 21 && minutes > 30)) {
    return next({
      status: 400,
      message: "Reservation must be between 10:30 AM and 9:30 PM",
    });
  }

  // Check if the reservation is not on Tuesday
  const reservationDateTime = new Date(reservationDateTimeString);
  if (reservationDateTime.getDay() === 2) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    return next({
      status: 400,
      message: "Reservations cannot be made on Tuesdays as the restaurant is closed.",
    });
  }

  next();
}

module.exports = validateReservationDateTime;



// Validate reservation time
function validateTime(req, res, next) {
  const { reservation_time } = req.body.data;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(reservation_time)) {
    return next({ status: 400, message: "reservation_time must be valid time in HH:MM format" });
  }
  next();
}

// Update a reservation
async function update(req, res, next) {
  const { reservation_id } = req.params;
  const updatedReservation = {
    ...req.body.data,
    reservation_id: Number(reservation_id),
  };

  try {
    const data = await service.update(updatedReservation);
    if (!data) {
      return next({ status: 404, message: `Reservation ${reservation_id} not found.` });
    }
    res.json({ data });
  } catch (error) {
    console.error("Error in controller update function:", error);
    next(error);
  }
}

// Update reservation status
async function updateStatus(req, res, next) {
  try {
    const { reservation_id } = req.params;
    const { status } = req.body.data;
    const updatedReservation = await service.updateStatus(reservation_id, status);
    res.json({ data: updatedReservation });
  } catch (error) {
    next(error);
  }
}

// Validate status update
function validateStatus(req, res, next) {
  try {
    const { status } = req.body.data;
    const validStatuses = ["booked", "seated", "finished", "cancelled"];

    if (!validStatuses.includes(status)) {
      return next({
        status: 400,
        message: `Invalid status: ${status}. Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const currentStatus = res.locals.reservation.status;
    if (currentStatus === "finished") {
      return next({
        status: 400,
        message: "A finished reservation cannot be updated",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Load reservation data
async function loadReservation(req, res, next) {
  try {
    const { reservation_id } = req.params;
    const reservation = await service.read(reservation_id);
    if (!reservation) {
      return next({ status: 404, message: `Reservation ${reservation_id} not found.` });
    }
    res.locals.reservation = reservation;
    next();
  } catch (error) {
    next(error);
  }
}

// Finish action
async function finish(req, res, next) {
  try {
    const { reservation_id } = req.params;
    const updatedReservation = await service.updateStatus(reservation_id, "finished");
    res.json({ data: updatedReservation });
  } catch (error) {
    next(error);
  }
}

// Validate finish 
function validateFinish(req, res, next) {
  try {
    const { reservation } = res.locals;
    if (!reservation) {
      return next({ status: 404, message: "Reservation not found." });
    }
    if (reservation.status !== "seated") {
      return next({
        status: 400,
        message: "Only seated reservations can be finished",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

// Validate create status
function validateCreateStatus(req, res, next) {
  try {
    const { status } = req.body.data;
    if (status && status !== "booked") {
      return next({
        status: 400,
        message: `Invalid status: ${status}. Status must be 'booked' or not provided.`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

// Search reservations by mobile number
async function search(req, res, next) {
  try {
    const { mobile_number } = req.query;
    if (!mobile_number) {
      return res.status(400).json({ error: "mobile_number is required" });
    }
    const data = await service.search(mobile_number);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

// Cancel a reservation
async function cancel(req, res, next) {
  const { reservation_id } = req.params;
  try {
    const data = await service.update({
      reservation_id: Number(reservation_id),
      status: "cancelled",
    });
    
    if (!data) {
      return next({
        status: 404,
        message: `Reservation ${reservation_id} not found`,
      });
    }
    
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(validateFields),
    asyncErrorBoundary(peopleIsNumber),
    asyncErrorBoundary(validateTime),
    asyncErrorBoundary(validateReservationDateTime),
    asyncErrorBoundary(validateCreateStatus),

    asyncErrorBoundary(create),
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)
  ],
  finish: [
    asyncErrorBoundary(loadReservation),
    validateFinish,
    asyncErrorBoundary(finish)
  ],
  updateStatus: [
    asyncErrorBoundary(loadReservation),
    validateStatus,
    asyncErrorBoundary(updateStatus)
  ],
  search: asyncErrorBoundary(search),
  update: [
    asyncErrorBoundary(reservationExists),

    asyncErrorBoundary(validateFields),
    asyncErrorBoundary(peopleIsNumber),
    asyncErrorBoundary(validateTime),
    asyncErrorBoundary(validateReservationDateTime),
    asyncErrorBoundary(update)
  ],
  cancel: asyncErrorBoundary(cancel),
};
