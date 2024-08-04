import React from "react";
import { useHistory } from "react-router-dom";

function TableForm({ formData, changeHandlerName, changeHandlerCapacity, submitHandler }) {
  const history = useHistory();

  return (
    <div className="table-form">
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="table_name">Table Name:</label>
          <input
            className="form-control"
            type="text"
            name="table_name"
            id="table_name"
            value={formData.table_name}
            onChange={changeHandlerName}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="capacity">Capacity Size:</label>
          <input
            className="form-control"
            type="number"
            name="capacity"
            id="capacity"
            min="1"
            value={formData.capacity}
            onChange={changeHandlerCapacity}
            required
          />
        </div>
        <div className="form-group">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm mr-2"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-outline-primary btn-sm">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default TableForm;
