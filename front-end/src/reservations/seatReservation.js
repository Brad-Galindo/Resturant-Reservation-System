import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  listTables,
  readReservation,
  updateTableForSeating,
  changeReservationStatus,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import SeatReservationForm from "./SeatReservationForm.js";

function SeatReservation() {

  // Extract reservation_id from URL parameters
  const { reservation_id } = useParams();
  const history = useHistory();

  // State variables
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [formData, setFormData] = useState({});
  const [reservation, setReservation] = useState({});
  const [reservationError, setReservationError] = useState(null);

  // Handler for form input changes
  const changeHandler = ({ target }) => {
    setFormData({ ...formData, [target.name]: target.value });
  };

  // Handler for form submission
  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      await updateTableForSeating(
        formData.table_id,
        reservation_id
      );
      await changeReservationStatus(reservation_id, "seated");
      history.push("/dashboard");
    } catch (error) {
      console.error("Error in submit handler:", error);
      setTablesError(error);
    }
  };

  // Effect hook to load tables
  useEffect(() => {
    const loadTables = async () => {
      const abortController = new AbortController();
      setTablesError(null);
      try {
        console.log("Starting to load tables...");
        const data = await listTables(abortController.signal);
        console.log("Raw table data:", JSON.stringify(data));
        setTables(data);
      } catch (error) {
        setTablesError(() => {
          console.error("Error loading tables:", error);
          return error;
        });
      }
      return () => abortController.abort();
    };
    loadTables();
  }, []);

  // Effect hook to load reservation details
  useEffect(() => {
    const loadReservation = async () => {
      const abortController = new AbortController();
      setReservationError(null);
      try {
        const data = await readReservation(reservation_id, abortController.signal);
        setReservation(data);
      } catch (error) {
        setReservationError(error);
      }
      return () => abortController.abort();
    };
    loadReservation();
  }, [reservation_id]);

  // Render logic
  const renderContent = () => {
    if (reservationError) {
      return <ErrorAlert error={reservationError} />;
    }

    if (tables.length === 0) {
      return <div>Loading tables...</div>;
    }

    if (!reservation.reservation_id) {
      return <div>Loading reservation...</div>;
    }

    return (
      <main>
        <div>
          <ErrorAlert error={tablesError} />
          <SeatReservationForm
            tables={tables}
            submitHandler={submitHandler}
            changeHandler={changeHandler}
          />
        </div>
      </main>
    );
  };


  // Try-catch block for rendering to handle any unexpected errors
  try {
    return renderContent();
  } catch (error) {
    console.error("Render error:", error);
    return <div>An error occurred while rendering. Please check the console.</div>;
  }
}

export default SeatReservation;
