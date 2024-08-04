import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ReservationForm from './reservationForm';
import { readReservation, updateReservation } from '../utils/api';
import { formatAsDate } from "../utils/date-time";
import ErrorAlert from '../layout/ErrorAlert';

function EditReservation() {
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  const { reservation_id } = useParams();
  const history = useHistory();

  useEffect(() => {
    const loadReservation = async () => {
      try {
        console.log(`Fetching reservation with ID: ${reservation_id}`);
        const data = await readReservation(reservation_id);
        console.log(data.reservation_date);
        console.log("Fetched reservation data:", data);

        const formattedDate = formatAsDate(data.reservation_date);
        console.log("Formatted date:", formattedDate);

        const [hours, minutes] = data.reservation_time.split(':');
        data.reservation_time = `${hours}:${minutes}`;

        setFormData({
          ...data,
          reservation_date: formattedDate,
        });
      } catch (error) {
        console.error("Error fetching reservation:", error);
        setError(error);
      }
    };
    loadReservation();
  }, [reservation_id]);

const changeHandler = (event) => {
  const { name, value } = event.target;
  setFormData({
    ...formData,
    [name]: name === "people" ? parseInt(value, 10) || "" : value,
  });
};


  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      await updateReservation(reservation_id, formData);

      // Redirecting to dashboard after update
      history.push(`/dashboard?date=${formData.reservation_date.slice(0, 10)}`); 
    } catch (error) {
      console.error("Error updating reservation:", error);
      setError(error);
    }
  };

  if (error) return <ErrorAlert error={error} />;
  if (!formData) return <div>Loading...</div>;

  return (
    <div>
      <div className="new-reservation main-content">
        <div>
          <h1>Edit Reservation</h1>
        </div>
        <div>
          <ReservationForm
            formData={formData}
            changeHandler={changeHandler}
            submitHandler={submitHandler}
          />
        </div>
      </div>
    </div>
  );
}

export default EditReservation;
