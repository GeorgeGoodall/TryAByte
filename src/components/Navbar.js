import React, { Component } from 'react';
import Style from "../css/style.css";

class Navbar extends Component {

	state = {
		navBarItems: [
			{
				id: 1,
				text: "Become a partner",
				href: "/#becomeapartner"
			},
			{
				id: 2,
				text: "Help",
				href: ""
			}
		]
	}

	render(){
		return (
			<div className="block" id='pageBanner'>
				<div className="block" id="header">
					<nav className="navbar is-primary" >
						<div className="navbar-brand">
							<a href="#home" className="navbar-item">
								<h1 className="title">TryAByte</h1>
							</a>
						</div>
						<div className="nav-centre">
							<a href="" className="navbar-item">
								
							</a>
						</div>
						<div className="navbar-end navbar-menu" id="nav_links">
							{
								console.log(this.state);
								// this.state.navBarItems.map((key,i) => {
								// 	return (<a href={state.navBarItems[key].href} key={i} className="navbar-item">{state.navBarItems[key].text}</a>)
								// })
							}
						</div>
					</nav>
				</div>
			</div>
		);
	}

}

export default Navbar;