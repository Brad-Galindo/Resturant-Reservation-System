import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ReservationForm from './reservationForm'
import { readReservation, updateReservation } from '../utils/api';
import ErrorAlert from '../layout/ErrorAlert';

function EditReservation() {

  // State for form data and error handling
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  // Get reservation_id from URL params and history object for navigation
  const { reservation_id } = useParams();
  const history = useHistory();


  // Effect hook to load reservation data when component mounts
  useEffect(() => {
    const loadReservation = async () => {
      try {
        const data = await readReservation(reservation_id);
        setFormData(data);
      } catch (error) {
        setError(error);
      }
    };
    loadReservation();
  }, [reservation_id]);


  // Handler for form input changes
  const changeHandler = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Handler for form submission
  const submitHandler = async (event) => {
  event.preventDefault();
  console.log("Submitting form data:", formData);
  try {
    await updateReservation(reservation_id, formData);
    console.log("Reservation updated successfully");
    history.goBack();
  } catch (error) {
    console.error("Error updating reservation:", error);
    setError(error);
  }
};


  if (error) return <ErrorAlert error={error} />;
  if (!formData) return <div>Loading...</div>;

  return (
    <ReservationForm
      formData={formData}
      changeHandler={changeHandler}
      submitHandler={submitHandler}
    />
  );
}

export default EditReservation;
