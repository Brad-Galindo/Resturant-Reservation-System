/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");






/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}


/**
 * Reads a single reservation by ID
 * @param {number} reservation_id - The ID of the reservation to read
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the reservation data
 */

export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  return await fetchJson(url, { headers, signal }, []);
}



/**
 * Updates a table with a reservation for seating
 * @param {number} table_id - The ID of the table to update
 * @param {number} reservation_id - The ID of the reservation to seat
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the updated table data
 */

export async function updateTableForSeating(table_id, reservation_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id } }),
    signal,
  };
  const data =  await fetchJson(url, options);
  return data;
}



/**
 * Creates a new reservation
 * @param reservation
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the newly created reservation.
 */

export async function createReservation(reservation) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
  };

  try {
    const response = await fetchJson(url, options);
    let formattedData = await formatReservationDate(response);
    formattedData = await formatReservationTime(formattedData);
    return formattedData;
  } catch (error) {
    console.error("Error in createReservation:", error);
    throw error;
  }
}





/**
 * Creates a new table
 * @param {Object} table - The table data to create
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the created table data
 */

export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  let data = await fetchJson(url, options);
  return data;
}



/**
 * Assigns a reservation to a table (seats a reservation)
 * @param {number} tableId - The ID of the table to seat the reservation at
 * @param {number} reservationId - The ID of the reservation to be seated
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the updated reservation data
 */
export async function seatReservation(tableId, reservationId, signal) {
  const url = `${API_BASE_URL}/tables/${tableId}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id: reservationId } }),
    signal,
  };
  return await fetchJson(url, options);
}




/**
* Changes the status of a reservation
* @param {numberd} - The ID of the reservation to update
* @param {string} status - The new status for the reservation
* @returns {Promise<Object>} - A promise that resolves to the updated reservation data
*/

export async function changeReservationStatus(reservation_id, status) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reservations/${reservation_id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { status } }),
      }
    );
    const jsonResponse = await response.json();
    return jsonResponse.data;
  } catch (error) {
    console.error("Error in changeReservationStatus:", error);
    throw error;
  }
}



/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );

  try {
    const data = await fetchJson(url, { headers, signal }, []);

    if (!Array.isArray(data)) {
      console.error("Expected an array of reservations, got:", data);
      return [];
    }

    // Client-side filtering for mobile number
    const filteredData = params.mobile_number
      ? data.filter(reservation => 
          reservation.mobile_number.includes(params.mobile_number)
        )
      : data;


    return filteredData
      .map(formatReservationDate)
      .map(formatReservationTime);
  } catch (error) {
    console.error("Error in listReservations:", error);
    throw error;
  }
}




/**
 * Lists all tables
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Array>} - A promise that resolves to an array of table data
 */

export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  return await fetchJson(url, { headers, signal }, []);
}




/**
 * Assigns a reservation to a table
 * @param {number} tableId - The ID of the table to assign
 * @param {number} reservationId - The ID of the reservation to assign
 * @returns {Promise<Object>} - A promise that resolves to the updated table data
 */

export async function assignTable(tableId, reservationId) {
  const url = `${API_BASE_URL}/tables/${tableId}/seat`;
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { reservation_id: reservationId } }),
  };
  
  const response = await fetch(url, options);
  
  if (response.status === 400) {
    const { error } = await response.json();
    throw new Error(error);
  }
  
  if (!response.ok) {
    throw new Error("An error occurred while setting table");
  }
  
  return await response.json();
}




/**
 * Marks a table as finished and removes the reservation
 * @param {number} tableId - The ID of the table to finish
 * @returns {Promise<Object>} - A promise that resolves to the updated table data
 */

export async function finishTable(tableId) {
  const url = `${API_BASE_URL}/tables/${tableId}/seat`;
  const options = {
    method: "DELETE",
  };
  return await fetchJson(url, options);
}


/**
 * Updates an existing reservation
 * @param {number} reservationId - The ID of the reservation to update
 * @param {Object} updatedReservation - The updated reservation data
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the updated reservation data
 */
export async function updateReservation(reservationId, updatedReservation) {
  const url = `${API_BASE_URL}/reservations/${reservationId}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedReservation }),
  };

  try {
    const response = await fetchJson(url, options);
    let formattedData = await formatReservationDate(response);
    formattedData = await formatReservationTime(formattedData);
    return formattedData;
  } catch (error) {
    console.error("Error in updateReservation:", error);
    throw error;
  }
}



/**
 * Cancels a reservation by changing its status to "cancelled"
 * @param {number} reservationId - The ID of the reservation to cancel
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the updated reservation data
 */

export async function cancelReservation(reservationId) {
  const url = `${API_BASE_URL}/reservations/${reservationId}/status`;
  
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { status: "cancelled" } }),
  };


  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error in cancelReservation:", error);
    throw error;
  }
}





