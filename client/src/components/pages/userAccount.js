import React, {useEffect, useState } from 'react';
import market_img from '../img/icons/market_icon.png';
import inventory_img from '../img/icons/inventory_icon.png';
import AccountProfile from './account_profile';
import AccountMarket from './account_market';
import { game_page } from '../actions/actions';
import { useDispatch } from 'react-redux'

function UserAccount(props){
	let lang = props.lang;
	let socket = props.socket;
	let account_info = props.info;
	const [visible, setVisible] = useState(true);
	const [profiles, setProfiles] = useState([]);
	const [market, setMarket] = useState([]);
	const [profileActive, setProfileActive] = useState("active");
	const [marketActive, setMarketActive] = useState("");
	let dispatch = useDispatch();

	useEffect(() => {		
		dispatch(game_page('user_account'));	
		let payload = {
			id: account_info.user_id, 
			user: account_info.user, 
			type: account_info.type, 
			user_table: account_info.user_table
		}
		socket.emit('user_account_send', payload);
		socket.on('user_account_read', function(data){
			console.log('user_account', data)
			if(data){
				if(data.profiles){
					setProfiles(data.profiles);
				}
				if(data.market){
					setMarket(data.market);
				}
			}			
		});
	}, []); 

	function account_choose_tab(link){	
		if(link === "account_profile"){
			setVisible(true);
			setProfileActive("active");
			setMarketActive("");
		} else if(link === "account_market"){
			setVisible(false);
			setProfileActive("");
			setMarketActive("active");
		}
	}	
	return (
		<div className="color_yellow">	
			<div className="account_tabs_container">
				<div id="account_profile" className={"account_tabs "+profileActive} onClick={()=>account_choose_tab("account_profile")}><img alt="inventory_img" className="account_img" src={inventory_img} />
					{lang === "ro" ? <span>Profil</span> : <span>Profile</span>}
				</div>
				<div id="account_market" className={"account_tabs "+marketActive} onClick={()=>account_choose_tab("account_market")}><img alt="market_img" className="account_img" src={market_img} /> Market</div>
			</div>				
			{ 
				visible ? <AccountProfile info={account_info} lang={lang} profiles={profiles}></AccountProfile> : 
				<AccountMarket info={account_info} lang={lang} market={market}></AccountMarket>
			}
		</div>
	);
}

export default UserAccount;