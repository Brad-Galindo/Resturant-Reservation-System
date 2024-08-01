import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../reservations/newReservation";
import NewTable from "../tables/newTable";
import SeatReservation from "../reservations/seatReservation";
import Search from "../search/search";
import EditReservation from "../reservations/editreservation";

function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/reservations/new">
        <NewReservation />
      </Route>

      <Route exact={true} path="/reservations/:reservation_id/edit">
        <EditReservation />
      </Route>

      <Route exact={true} path="/reservations/:reservation_id/seat">
        <SeatReservation />
      </Route>
      
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      
      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>
      
      <Route exact={true} path="/tables/new">
        <NewTable />
      </Route>
      
      <Route path="/search">
        <Search />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;