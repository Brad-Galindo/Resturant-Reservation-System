import React, { useEffect, useState, useCallback } from "react";
import { listReservations, listTables, finishTable, changeReservationStatus, cancelReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../dashboard/reservationList";
import { useHistory, useLocation } from "react-router-dom";
import { previous, next, today } from "../utils/date-time";

function Dashboard() {
  const [reservations,setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();
  const { search } = useLocation();
  const date = new URLSearchParams(search).get("date") || today();

  const loadDashboard = useCallback(() => {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables(abortController.signal)
      .then(setTables)
      .catch(setTablesError);

    return () => abortController.abort();
  }, [date]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleDateChange(newDate) {
    history.push(`/dashboard?date=${newDate}`);
  }

  const handleFinish = async (tableId) => {
    if (window.confirm("Is this table ready to seat new guests? This cannot be undone.")) {
      setIsLoading(true);
      try {
        const finishedTable = await finishTable(tableId);
        const finishedReservation = reservations.find(r => r.reservation_id === finishedTable.reservation_id);

        if (finishedReservation) {
          await changeReservationStatus(finishedReservation.reservation_id, "finished");
          setReservations(prevReservations =>
            prevReservations.map(reservation =>
              reservation.reservation_id === finishedReservation.reservation_id
                ? { ...reservation, status: "finished" }
                : reservation
            )
          );
        }
        loadDashboard();
      } catch (error) {
        setTablesError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSeat = async (reservationId) => {
    try {
      await changeReservationStatus(reservationId, "seated");
      setReservations((prevReservations) =>
        prevReservations((reservation) =>
          reservation.reservation_id === reservationId
            ? { ...reservation, status: "seated" }
            : reservation
        )
      );
      history.push(`/reservations/${reservationId}/seat`);
    } catch (error) {
      setReservationsError(error);
    }
  };

  const handleCancel = async (reservationId) => {
    if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
      try {
        await cancelReservation(reservationId);
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.reservation_id === reservationId
              ? { ...reservation, status: "cancelled" }
 : reservation
          )
        );
        loadDashboard();
      } catch (error) {
        setReservationsError(error);
      }
    }
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <button onClick={() => handleDateChange(previous(date))}>Previous</button>
      <button onClick={() => handleDateChange(today())}>Today</button>
      <button onClick={() => handleDateChange(next(date))}>Next</button>

      <h2>Reservations</h2>
      <ReservationList
        reservations={reservations}
        onSeat={handleSeat}
        cancelHandler={handleCancel}
      />

      <h2>Tables</h2>
      <ul>
        {tables.sort((a, b) => a.table_name.localeCompare(b.table_name)).map((table) => (
          <li key={table.table_id}>
            {table.table_name} - Capacity: {table.capacity}
            <span data-table-id-status={table.table_id}>
              {table.reservation_id ? ' Occupied' : ' Free'}
            </span>
            {table.reservation_id && (
 <button
                data-table-id-finish={table.table_id}
                onClick={() => handleFinish(table.table_id)}
                disabled={isLoading}
                aria-label={`Finish table ${table.table_name}`}
              >
                {isLoading ? 'Finishing...' : 'Finish'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Dashboard;
