import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import Index from "../index";
import UserManagement from './subsystems/userManagement';
import AirportManagement from './subsystems/airportManagement';
import AirportAdministrators from './subsystems/airportAdministrators';
import PassengerManagement from './subsystems/passegerManagement';

export default function App() {
  const path = window.location.pathname;

  
  return <PassengerManagement />;
}
