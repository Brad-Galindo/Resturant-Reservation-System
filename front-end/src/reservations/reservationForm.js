import React from "react";
import { useHistory } from "react-router-dom";

function ReservationForm({ formData, changeHandler, submitHandler }) {
  const history = useHistory();

  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <label htmlFor="first_name">
          First Name:
          <input
            className="form-control"
            type="text"
            name="first_name"
            id="first_name"
            value={formData.first_name}
            onChange={changeHandler}
            required
          />
        </label>
        <br />
        <label htmlFor="last_name">
          Last Name:
          <input
            className="form-control"
            type="text"
            name="last_name"
            id="last_name"
            value={formData.last_name}
            onChange={changeHandler}
            required
          />
        </label>
        <br />
        <label htmlFor="mobile_number">
          Mobile Number:
          <input
            className="form-control"
            type="tel"
            name="mobile_number"
            id="mobile_number"
            value={formData.mobile_number}
            onChange={changeHandler}
            required
          />
        </label>
        <br />
        <label htmlFor="reservation_date">
          Reservation Date:
          <input
            className="form-control"
            type="date"
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            name="reservation_date"
            id="reservation_date"
            value={formData.reservation_date}
            onChange={changeHandler}
            required
          />
        </label>
        <br />
        <label htmlFor="reservation_time">
          Reservation Time:
          <input
            className="form-control"
            type="time"
            placeholder=""
            pattern="[0-9]{2}:[0-9]{2}"
            name="reservation_time"
            id="reservation_time"
            value={formData.reservation_time}
            onChange={changeHandler}
            required
          />
        </label>
        <br />
        <label htmlFor="people">
          Party Size:
          <input
            className="form-control"
            type="number"
            name="people"
            id="people"
            value={formData.people}
            onChange={changeHandler}
            required
            min="1"
          />
        </label>
        <br />
        <button
          type="button"
          className="btn btn-outline-danger btn-sm mr-1"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-outline-primary btn-sm"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ReservationForm;
