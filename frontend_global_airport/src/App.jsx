import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import Index from "../index";
import UserManagement from './subsystems/userManagement';
import AirportManagement from './subsystems/airportManagement';
import AirportAdministrators from './subsystems/airportAdministrators';

export default function App() {
  const path = window.location.pathname;

  if (path === "/asignacion-administradores") {
    return <AirportAdministrators />;
  }

  return <AirportManagement />;
}
