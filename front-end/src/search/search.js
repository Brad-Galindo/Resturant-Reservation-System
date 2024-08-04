import React, { useState } from "react";
import { listReservations, cancelReservation } from "../utils/api";
import ReservationList from "../dashboard/reservationList";
import ErrorAlert from "../layout/ErrorAlert";

function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setError(null);

    try {
      const response = await listReservations(
        { mobile_number: mobileNumber },
        abortController.signal
      );
      setReservations(response);
    } catch (error) {
      setError(error);
    }

    return () => abortController.abort();
  };

  const cancelHandler = async (reservationId) => {
    if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
      try {
        await cancelReservation(reservationId);
        const updatedReservations = reservations.map(reservation => 
          reservation.reservation_id === reservationId 
            ? { ...reservation, status: "cancelled" } 
            : reservation
        );
        setReservations(updatedReservations);
      } catch (error) {
        setError(error);
      }
    }
  };

  return (
    <div className="search-reservations main-content">
      <h1>Search Reservations</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          name="mobile_number"
          type="text"
          className="form-control"
          placeholder="Enter phone number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">Find</button>
      </form>
      <ErrorAlert error={error} />
      {reservations.length ? (
        <ReservationList 
          reservations={reservations} 
          cancelHandler={cancelHandler}
        />
      ) : (
        <p>No reservations found</p>
      )}
    </div>
  );
}

export default Search;
