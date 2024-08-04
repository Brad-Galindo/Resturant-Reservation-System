import React, { useState } from "react";
import ReservationForm from "./reservationForm"
import { createReservation } from "../utils/api";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { isTuesday, isPast, formatAsDate } from "../utils/date-time";

function NewReservation() {
  const history = useHistory();

  // Initial state for the reservation form
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
    status: "booked",
  };

  // State for form data and error handling
  const [formData, setFormData] = useState({ ...initialFormState });
  const [errorAlert, setErrorAlert] = useState(null);


  // Handler for form input changes
  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: name === "people" ? parseInt(value, 10) || "" : value,
    });
  };


  // Handler for form submission
  const submitHandler = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setErrorAlert(null);
  
    const formattedDate = formatAsDate(formData.reservation_date);
    const formattedDateTime = `${formattedDate}T${formData.reservation_time}`;
  
    console.log('Formatted date:', formattedDate);
    console.log('Is Tuesday:', isTuesday(formattedDate));
    console.log('Is Past:', isPast(formattedDateTime));
  
    // Check for Tuesday reservations
    if (isTuesday(formattedDate)) {
      setErrorAlert({ message: "Reservations cannot be made on Tuesdays as the restaurant is closed." });
      return;
    }
  
    // Check for past date reservations
    if (isPast(formattedDateTime)) {
      setErrorAlert({ message: "Reservations cannot be made for past dates and times. Only future reservations are allowed." });
      return;
    }
    
    try {
      const response = await createReservation(
        formData,
        abortController.signal
      );
      history.push(`/dashboard?date=${response.reservation_date.slice(0, 10)}`);
    } catch (error) {
      setErrorAlert(error);
    }
  }

  return (
    <div>
      <div className="new-reservation main-content">
      <div>
        <h1>New Reservation</h1>
      </div>
      <div>
        <ErrorAlert error={errorAlert} />
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

export default NewReservation;
