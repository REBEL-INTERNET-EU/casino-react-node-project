import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import $ from 'jquery'; 
import {game_visible} from '../actions/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faComments, faHome, faCog, faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { setCookie } from '../utils';
import Modal from 'react-bootstrap/Modal'
import Settings from './control_settings'
import ChatForm from './chatForm'
import carrot_img from '../img/icons/carrot_icon.png';

function Panel(props){
    let lang = props.lang;
    let socket = props.socket;
    let user = props.info.user;
    let type = props.info.type;
    let user_table = props.info.user_table;
    let money = props.info.money;
    let dispatch = useDispatch();    

    const [show, setShow] = useState(false);
    const [open, setOpen] = useState("");
    const [userGame, setUserGame] = useState("active");
    const [userAccount, setUserAccount] = useState("");

	function handleClose(){ setShow(false) };
    function handleShow(){ setShow(true) };

    setTimeout(function(){ 	
        let prev_click = "";

        $('body').off('click').on('click', function(event) {
            if($(event.target).closest(".panel_container").length === 0){
                setOpen("");
            }
        });

		function open_panel(){
			if(open === "open"){
                setOpen("");
            } else {
                setOpen("open");
            }
		}

        $('.button_container').off('click').on('click', function(event) {
			let next_click = $(this).attr('panel');     

            if(prev_click === next_click || prev_click === ""){        
                open_panel();
            } else if(open !== "open"){
                setOpen("open");
            }            
            
            $('.panel_box').hide();
            $('#'+next_click).show();
            prev_click = next_click;
		});
	}, 0);

    function handleClick(link) {
        let url_back01 = window.location.href.split('/table/');
		switch (link) {
			case "account":
                setUserGame("active");
                setUserAccount("");
                dispatch(game_visible('account'))
			  	break;
			case "casino":
                setUserGame("");
                setUserAccount("active");
				dispatch(game_visible('game'))
				break;
            case "salon":					
				window.location.href = url_back01[0]+"/salon";
			 	break;
            case "settings":	
                handleShow();
                break;
			case "logout":				
				setCookie("casino_user", '', 1);
				setCookie("casino_email", '', 1);
				window.location.href = url_back01[0];
			 	break;
            case "support":
                dispatch(game_visible('support'))
                break;
			default:
				let url_back02 = window.location.href.split('/table/');
				window.location.href = url_back02[0];
		  }
	}
    
	return (
        <>
            <div className={"panel_container "+open}>
                <div id="user_button" panel="user_panel_box" className="button_container">            
                    <div>
                        <FontAwesomeIcon icon={faUserCircle} />
                        <h4>User</h4>
                    </div>
                </div>
                <div id="chat_button" panel="chat_panel_box" className="button_container">
                    <div>
                        <FontAwesomeIcon icon={faComments} />
                        <h4>Chat</h4>
                    </div>
                </div>
                <div id="user_panel_box" className="panel_box">
                    <h4 id="user_title">{user_table}</h4>
                    <p id="user_subtitle">
                        <span id="user_name">{user}</span>
                        <span id="user_money"><span>{money}</span><img alt="carrot_img" className="currency_img" src={carrot_img} /></span>
                    </p>
                    <p id="user_list_user">
                        <span id="user_list_user_game" className={"user_list_button "+userGame} onClick={() => handleClick('casino')}>{lang === "ro" ? <span>Joc</span> : <span>Game</span>}</span>
                        <span id="user_list_user_account" className={"user_list_button "+userAccount} onClick={() => handleClick('account')}>{lang === "ro" ? <span>Contul meu</span> : <span>My account</span>}</span>
                    </p>
                    <ul className="user_list">
                        <li id="user_list_salon" className="user_list_item" onClick={() => handleClick('salon')}>{lang === "ro" ? <span><FontAwesomeIcon icon={faHome} /> Salon</span> : <span><FontAwesomeIcon icon={faHome} /> Salon</span>}</li>
                        <li id="user_list_settings" className="user_list_item" onClick={() => handleClick('settings')}>{lang === "ro" ? <span><FontAwesomeIcon icon={faCog} /> Setari</span> : <span><FontAwesomeIcon icon={faCog} /> Settings</span>}</li>
                        <li id="user_list_logout" className="user_list_item" onClick={() => handleClick('logout')}>{lang === "ro" ? <span><FontAwesomeIcon icon={faPowerOff} /> Delogare</span> : <span><FontAwesomeIcon icon={faPowerOff} /> Logout</span>}</li>
                    </ul>
                    <div id="support_button" onClick={() => handleClick('support')}>{lang === "ro" ? <span>Suport</span> : <span>Support</span>}</div>
                </div>
                <div id="chat_panel_box" className="panel_box">
                    <ChatForm user={user} type={type} user_table={user_table} socket={socket}></ChatForm>
                </div>
            </div>

            <Modal className="casino_modal" id="settings_modal" show={show} onHide={handleClose} size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>{lang === "ro" ? <span>Setari</span> : <span>Settings</span>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Settings></Settings>
                </Modal.Body>				
            </Modal>
        </>	
	);
}

export default Panel;