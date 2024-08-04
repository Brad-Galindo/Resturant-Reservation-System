import React, { useEffect, useState, useCallback } from "react";
import { listReservations, listTables, finishTable, changeReservationStatus, cancelReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../dashboard/reservationList";
import { useHistory, useLocation } from "react-router-dom";
import { previous, next, today } from "../utils/date-time";
import Footer from "../styles/Footer";

function Dashboard() {
  const [reservations,setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();
  const { search } = useLocation();

  const date = new URLSearchParams(search).get("date") || today();


  // Function to load reservations and tables data
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


  // Load dashboard data when the component mounts or date changes
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  // Handle date change and update the URL
  function handleDateChange(newDate) {
    history.push(`/dashboard?date=${newDate}`);
  }


  // Handle finishing a table
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
  // Handle seating a reservation
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
  // Handle cancelling a reservation
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
      <div>
        <main className="container">
          <h1>Dashboard</h1>
          <div className="d-md-flex mb-3">
            <h4 className="mb-0">Reservations for {date}</h4>
          </div>
          <ErrorAlert error={reservationsError} />
          <ErrorAlert error={tablesError} />
          <div className="btn-group mb-3" role="group" aria-label="Date navigation">
            <button className="btn btn-secondary" onClick={() => handleDateChange(previous(date))}>Previous</button>
            <button className="btn btn-secondary" onClick={() => handleDateChange(today())}>Today</button>
            <button className="btn btn-secondary" onClick={() => handleDateChange(next(date))}>Next</button>
          </div>
          <h2>Reservations</h2>
          <ReservationList
            reservations={reservations}
            onSeat={handleSeat}
            cancelHandler={handleCancel}
          />
          <h2>Tables</h2>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th>Table Name</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tables
                  .sort((a, b) => a.table_name.localeCompare(b.table_name))
                  .map((table) => (
                    <tr key={table.table_id}>
                      <td>{table.table_name}</td>
                      <td>{table.capacity}</td>
                      <td data-table-id-status={table.table_id}>
                        {table.reservation_id ? 'Occupied' : 'Free'}
                      </td>
                      <td>
                        {table.reservation_id && (
                          <button
                            className="btn btn-sm btn-primary"
                            data-table-id-finish={table.table_id}
                            onClick={() => handleFinish(table.table_id)}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Finishing...' : 'Finish'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

export default Dashboard;
