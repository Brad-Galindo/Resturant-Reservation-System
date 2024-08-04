import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { assignTable } from "../utils/api";

function SeatReservationForm({ tables }) {
  const history = useHistory();
  const { reservation_id } = useParams();
  const [tableId, setTableId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reservation_id || isNaN(Number(reservation_id))) {
      setError("Invalid reservation ID");
    }
  }, [reservation_id]);

  const handleChange = (event) => {
    setTableId(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tableId) {
      setError("Please select a table");
      return;
    }

    try {
      const numericReservationId = Number(reservation_id);
      if (isNaN(numericReservationId)) {
        throw new Error("Invalid reservation ID");
      }

      await assignTable(tableId, numericReservationId);
      history.push("/");
    } catch (err) {
      setError(err.message);
      console.error("Error details:", err);
    }
  };

  return (
    <div className="seat-reservation-form">
      <h2>Seat Reservation</h2>
      <h3>
          Reservation ID: {reservation_id}
        </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_id">Select Table:</label>
          <select
            id="table_id"
            name="table_id"
            className="form-control"
            onChange={handleChange}
            value={tableId}
            required
          >
            <option value="">Table Name - Capacity</option>
            {tables.map((table) => (
              <option key={table.table_id} value={table.table_id}>
                {table.table_name} - {table.capacity}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="form-group">
          <button className="btn btn-primary mr-2" type="submit">
            Submit
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SeatReservationForm;
