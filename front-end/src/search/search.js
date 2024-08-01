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
      console.log("Searching for:", { mobile_number: mobileNumber });
      const response = await listReservations(
        { mobile_number: mobileNumber },
        abortController.signal
      );
      console.log("API response:", response);
      setReservations(response);
    } catch (error) {
      setError(error);
      console.error("Search error:", error);
    }

    return () => abortController.abort();
  };

const cancelHandler = async (reservationId) => {
  console.log("Reservation ID to cancel:", reservationId);
  if (
    window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    )
  ) {
    try {
      await cancelReservation(reservationId);
      // Refresh the reservations list after cancellation
      const updatedReservations = reservations.map(reservation => 
        reservation.reservation_id === reservationId 
          ? { ...reservation, status: "cancelled" } 
          : reservation
      );
      setReservations(updatedReservations);
    } catch (error) {
      setError(error);
      console.error("Error cancelling reservation:", error);
    }
  }
};

  return (
    <div>
      <h1>Search Reservations</h1>
      <form onSubmit={handleSearch}>
        <input
          name="mobile_number"
          type="text"
          placeholder="Enter phone number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />
        <button type="submit">Find</button>
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
