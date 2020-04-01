import React from 'react';
import ReactDom from 'react-dom';
import 'bulma/css/bulma.css'
//import App from './components/App';
import App from './components/App';
import Navbar from './components/Navbar'

window.app = new App();

window.Navbar = new Navbar();

ReactDom.render(window.Navbar, document.getElementById("app"));


//ReactDom.render(<App />, document.getElementById("app"));