import React from "react";
import { Link } from "react-router-dom";

function ListReservations({ reservations, cancelHandler }) {
  // Map through reservations to create table rows
  const display = reservations.map((reservation) => {
    // Only display reservations that are not finished or cancelled
    if (reservation.status !== "finished" && reservation.status !== "cancelled") {
      return (
        <tr key={reservation.reservation_id} className="res-text table-row">
          <td>{reservation.reservation_id}</td>
          <td>{reservation.first_name}</td>
          <td>{reservation.last_name}</td>          
          <td>{reservation.mobile_number}</td>
          <td>{reservation.reservation_date}</td>
          <td>{reservation.reservation_time}</td>
          <td>{reservation.people}</td>
          <td>
            <p data-reservation-id-status={reservation.reservation_id}>
              {reservation.status}
            </p>
          </td>
          <td>
            {reservation.status === "booked" && (
              <>
                <Link
                  to={`/reservations/${reservation.reservation_id}/seat`}
                  className="btn btn-outline-primary mx-1"
                >
                  Seat
                </Link>
                <Link
                  to={`/reservations/${reservation.reservation_id}/edit`}
                  className="btn btn-outline-primary mx-1"
                >
                  Edit
                </Link>
                <button
                  data-reservation-id-cancel={reservation.reservation_id}
                  className="btn btn-danger mx-1"
                  type="button"
                  onClick={() => cancelHandler(reservation.reservation_id)}
                >
                  Cancel
                </button>
              </>
            )}
            {reservation.status === "seated" && (
              <>
                <Link
                  to={`/reservations/${reservation.reservation_id}/edit`}
                  className="btn btn-outline-primary mx-1"
                >
                  Edit
                </Link>
                <button
                  data-reservation-id-cancel={reservation.reservation_id}
                  className="btn btn-danger mx-1"
                  type="button"
                  onClick={() => cancelHandler(reservation.reservation_id)}
                >
                  Cancel
                </button>
              </>
            )}
          </td>
        </tr>
      );
    }
    return null;
  });

  // Render the table with reservation data
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Reservation ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Mobile Number</th>
            <th>Reservation Date</th>
            <th>Reservation Time</th>
            <th>People</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{display}</tbody>
      </table>
    </div>
  );
}

export default ListReservations;
