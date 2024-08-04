import React, { useState } from "react";
import { createTable } from "../utils/api";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const history = useHistory();
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (tableName.length < 2) {
      setError(new Error("Table name must be at least 2 characters long."));
      return;
    }

    try {
      await createTable({ 
        table_name: tableName, 
        capacity: Number(capacity) 
      });
      history.push('/dashboard');
    } catch (apiError) {
      setError(apiError);
    }
  };

  const handleTableNameChange = (event) => {
    setTableName(event.target.value);
  };
  const handleCapacityChange = (event) => {
    setCapacity(event.target.value);
  };
  const handleCancel = () => {
    history.goBack();
  };

  return (
    <main className="new-table">
      <h1>New Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_name">Table Name:</label>
          <input
            id="table_name"
            name="table_name"
            type="text"
            className="form-control"
            minLength="2"
            required
            value={tableName}
            onChange={handleTableNameChange}
            aria-label="Table Name"
            data-table-name-id="table_name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="capacity">Capacity:</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            className="form-control"
            min="1"
            required
            value={capacity}
            onChange={handleCapacityChange}
            aria-label="Capacity"
            data-table-capacity-id="capacity"
          />
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary mr-2" data-table-submit-button>Submit</button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel} data-button>Cancel</button>
        </div>
      </form>
    </main>
  );
}

export default NewTable;
