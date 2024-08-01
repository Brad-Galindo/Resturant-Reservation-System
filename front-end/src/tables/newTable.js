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
  
      // Validate table name length
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
    <main>
      <h1>New Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="table_name">Table Name:</label>
          <input
            id="table_name"
            name="table_name"
            type="text"
            minLength="2"
            required
            value={tableName}
            onChange={handleTableNameChange}
            aria-label="Table Name"
            data-table-name-id="table_name"
          />
        </div>
        <div>
          <label htmlFor="capacity">Capacity:</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            required
            value={capacity}
            onChange={handleCapacityChange}
            aria-label="Capacity"
            data-table-capacity-id="capacity"
          />
        </div>
        <button type="submit" data-table-submit-button>Submit</button>
        <button type="button" onClick={handleCancel} data-button>Cancel</button>
      </form>
    </main>
  );
}

export default NewTable;
