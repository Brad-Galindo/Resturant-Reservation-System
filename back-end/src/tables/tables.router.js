const router = require("express").Router();
const controller = require("../tables/tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route("/:table_id/seat")
  .put(controller.update)
  .delete(controller.clearTable)
  .all(methodNotAllowed);

module.exports = router;
