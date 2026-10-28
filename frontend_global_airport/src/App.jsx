import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import Index from "../index";
import UserManagement from './subsystems/userManagement';

function App(){
   return <UserManagement />;

}

export default App
