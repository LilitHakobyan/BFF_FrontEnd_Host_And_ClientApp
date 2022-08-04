import React, { Component, useState } from 'react';
import axios from 'axios';

// function Bff() {
//   const [forecasts, setForecasts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(false);


//   const loadData = async () => {
//     setLoading(true);

//     setLoading(false);
//   }

//   return (
//     <div>
//       <h1 id="tabelLabel" >Credentials</h1>
//       <p>This component demonstrates fetching data from the server.</p>
//       <button onClick={this.login}>
//         Login first
//       </button>
//       <button onClick={this.fetchUserSessionInfo}>
//         load user
//       </button>
//       {logoutContent}
//       <br />
//       <br />
//       {contents}
//       <br />
//     </div>
//   );
// }

// export default Bff;

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { forecasts: [], loading: true, user: [], logoutUrl: "/bff/logout", loggedIn: false };
    this.baseState = this.state
    this.fetchIsUserLoggedIn = this.fetchIsUserLoggedIn.bind(this);
  }

  // componentDidMount() {
  //   (async () => this.fetchIsUserLoggedIn())();
  //   this.populateWeatherData();
  // }

  componentDidMount() {
    this.populateWeatherData();
  }


  static renderForecastsTable(forecasts) {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Username</th>
            <th>last Change</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
            <tr key={forecast.credentialId}>
              <td>{forecast.credentialId}</td>
              <td>{forecast.credentialName}</td>
              <td>{forecast.logonUsername}</td>
              <td>{forecast.lastChange}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  login = async () => {
    window.location = "https://localhost:7211/bff/login?returnUrl=/";
  }

  async fetchIsUserLoggedIn() {
    try {
      const response = await fetch("/bff/user?returnUrl=/", {
        headers: {
          "X-CSRF": 1,
        },
      });

      if (response.ok && response.status === 200) {
        const data = await response.json();
        const logoutUrl =
          data.find((claim) => claim.type === "bff:logout_url")?.value ??
          this.state.logoutUrl;
        this.setState({ loggedIn: true, logoutUrl });
      }
    } catch (e) {
      console.error(e);
      this.setState({ loggedIn: false });
    }
  }

  render() {
    let contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchData.renderForecastsTable(this.state.forecasts);

    let logoutContent = this.state.user.length > 0
      ? <button onClick={this.logout}>
        logout
      </button>
      : <p>load user data to be able to logout</p>
    return (
      <div>
        <h1 id="tabelLabel" >Credentials</h1>
        <p>This component demonstrates fetching data from the server.</p>
        <button onClick={this.login}>
          Login first
        </button>
        <button onClick={this.fetchUserSessionInfo}>
          load user
        </button>
        {logoutContent}
        <br />
        <br />
        {contents}
        <br />
      </div>
    );
  }

  async populateWeatherData() {
    var req = new Request('/credentials', {
      headers: new Headers({
        'X-CSRF': '1'
      })
    })
    const response = await fetch(req);
    if (response.ok) {
      const data = await response.json();
      this.setState({ forecasts: data, loading: false });
      return;
    }
    console.log(response);
    this.setState({ forecasts: [], loading: false });
  }

  fetchUserSessionInfo = async () => {
    this.setState({ loading: true });
    const response = await fetch("bff/user", {
      headers: {
        "X-CSRF": 1,
      },
    });
    console.log(response)
    if (response.status !== 200) {
      return;
    }

    const data = await response.json();
    console.log(data)
    const logoutUrl =
           data.find((claim) => claim.type === "bff:logout_url")?.value ??
           this.state.logoutUrl;
    this.setState({ logoutUrl });
    this.setState({ loading: false, user: data });
  }

  logout = async () => {
    const response = await fetch(this.state.logoutUrl);
    console.log(response)
    if (response.status !== 200) {
      return;
    }

    console.log(response)
    this.setState({ loading: false, user: {} });
  }

}
