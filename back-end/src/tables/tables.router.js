const router = require("express").Router();
const controller = require("../tables/tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// Base table route
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

// Table seating management
router
  .route("/:table_id/seat")
  .put(controller.update)
  .delete(controller.clearTable)
  .all(methodNotAllowed);

module.exports = router;
