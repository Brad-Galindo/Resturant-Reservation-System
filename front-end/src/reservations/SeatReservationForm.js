import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { assignTable } from "../utils/api";

function SeatReservationForm({ tables }) {

  const history = useHistory();

  // Get reservation_id from URL param
  const { reservation_id } = useParams();

  // State for selected table ID and any error messages
  const [tableId, setTableId] = useState("");
  const [error, setError] = useState(null);

  // Effect to validate reservation_id on component mount
  useEffect(() => {
    if (!reservation_id || isNaN(Number(reservation_id))) {
      setError("Invalid reservation ID");
    }
  }, [reservation_id]);

  // Handler for table selection change
  const handleChange = (event) => {
    setTableId(event.target.value);
  };

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tableId) {
      setError("Please select a table");
      return;
    }

    try {
    // Convert reservation_id to a number
    const numericReservationId = Number(reservation_id);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(numericReservationId)) {
      throw new Error("Invalid reservation ID");
    }

      // Call API to assign table
      await assignTable(tableId, numericReservationId);
      history.push("/");
    } catch (err) {
      setError(err.message);
      console.error("Error details:", err);
    }
  };
  return (
    <div>
      <h2>Seat Reservation</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_id">Select Table:</label>
        <select 
          id="table_id"
          name="table_id" 
          onChange={handleChange}
          value={tableId}
          required
        >
          <option value="">Table Name - Capacity</option>
          {tables.map((table) => (
            <option
              key={table.table_id}
              value={table.table_id}
            >
              {table.table_name} - {table.capacity}
            </option>
          ))}
        </select>
        {error && <div className="alert alert-danger">{error}</div>}
        <div>
          <button className="btn btn-primary" type="submit">
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
