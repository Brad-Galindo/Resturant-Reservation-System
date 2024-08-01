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

export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  return await fetchJson(url, { headers, signal }, []);
}


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
export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options, {})
    .then(formatReservationDate)
    .then(formatReservationTime);
}


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

export async function changeReservationStatus(reservation_id, status) {
  console.log(`Changing status for reservation ${reservation_id} to ${status}`);
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
    console.log("Response status:", response.status);
    const jsonResponse = await response.json();
    console.log("Response body:", jsonResponse);
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
  console.log("Fetching from URL:", url.toString());

  try {
    const data = await fetchJson(url, { headers, signal }, []);
    console.log("Raw API response:", data);

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

    console.log("Filtered data:", filteredData);

    return filteredData
      .map(formatReservationDate)
      .map(formatReservationTime);
  } catch (error) {
    console.error("Error in listReservations:", error);
    throw error;
  }
}




export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  return await fetchJson(url, { headers, signal }, []);
}


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
export async function updateReservation(reservationId, updatedReservation, signal) {
  const url = `${API_BASE_URL}/reservations/${reservationId}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedReservation }), // Wrap updatedReservation in a data object
    signal,
  };
  return await fetchJson(url, options)
    .then(formatReservationDate)
    .then(formatReservationTime);
}



// ... (keep all your existing imports and functions)

/**
 * Cancels a reservation by changing its status to "cancelled"
 * @param {number} reservationId - The ID of the reservation to cancel
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} - A promise that resolves to the updated reservation data
 */
export async function cancelReservation(reservationId) {
  console.log(`Cancelling reservation ${reservationId}`);
  const url = `${API_BASE_URL}/reservations/${reservationId}/status`;
  console.log('API URL:', url);
  
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { status: "cancelled" } }),
  };
  console.log('API request options:', options);

  try {
    const response = await fetch(url, options);
    console.log('API response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response body:', result);
    return result.data;
  } catch (error) {
    console.error("Error in cancelReservation:", error);
    throw error;
  }
}





