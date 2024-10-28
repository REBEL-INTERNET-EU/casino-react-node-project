import React from 'react'
import { translate } from '../../../translations/translate'
import { Row, Col, Button } from 'react-bootstrap'
import Stripe from './type/stripe'
import Paypal from './type/paypal'
import Crypto from './type/crypto'
import Google from './type/google'
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faStore, faUser, faCartShopping} from '@fortawesome/free-solid-svg-icons'
import { faStripe, faGooglePay } from '@fortawesome/free-brands-svg-icons'

function PaymentForm(props){
    const {
        template, paymentDetails, settings, handleChangeCheck,
        handleContinue, handleBack
    } = props
    const { lang } = settings

    return <>
        <Row>
            <Col sm={12}>
                <div className="checkbox_radio_container payment_details_title">
                    <label>
                        <input 
                            type="radio" 
                            name="paymentChoice" 
                            checked={paymentDetails.option === "card"} 
                            onChange={() => handleChangeCheck("card")}
                        />                        
                        <FontAwesomeIcon icon={faStripe} />
                    </label>
                    {/* <label>
                        <input 
                            type="radio" 
                            name="paymentChoice" 
                            checked={paymentDetails.option === "paypal"} 
                            onChange={() => handleChangeCheck("paypal")}
                        />
                        {translate({ lang: lang, info: "pay_paypal" })}
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="paymentChoice" 
                            checked={paymentDetails.option === "crypto"} 
                            onChange={() => handleChangeCheck("crypto")}
                        />
                        {translate({ lang: lang, info: "pay_crypto" })}
                    </label> */}
                    <label>
                        <input 
                            type="radio" 
                            name="paymentChoice" 
                            checked={paymentDetails.option === "google"} 
                            onChange={() => handleChangeCheck("google")}
                        />
                        <FontAwesomeIcon icon={faGooglePay} />                        
                    </label>
                </div>
            </Col>
        </Row>        
        {(() => {
            switch(paymentDetails.option){
                case "card":
                    return <Stripe {...props} />
                case "paypal":
                    return <Paypal {...props} />
                case "crypto":
                    return <Crypto {...props} />
                case "google":
                    return <Google {...props} />
                default:
                    <p>{translate({lang: lang, info: "error"})}</p>
            }
        })()}
        <Row>
            <Col sm={12} className="button_action_group button_action_group_checkout">
                {paymentDetails.option !== "google" ? <Button 
                    type="button"  
                    className="mybutton button_fullcolor shadow_convex"
                    onClick={()=>handleContinue()}
                ><FontAwesomeIcon icon={faCartShopping} /> {translate({lang: lang, info: "continue"})}</Button> : null}                
                {(() => {
                    let choice = null
                    let icon = null
                    switch(template) {
                        case "buy_carrots":
                            choice = "dashboard"
                            icon = faUser
                            break
                        case "checkout":
                            choice = "market"
                            icon = faStore
                            break
                        default:
                    }
                    return <>{choice && icon ? <Button 
                        type="button"  
                        className="mybutton button_fullcolor shadow_convex"
                        onClick={()=>handleBack(choice)}
                    ><FontAwesomeIcon icon={icon} /> {translate({lang: lang, info: choice})}</Button> : null}</>
                })()}
            </Col>
        </Row>
    </>
}
export default PaymentForm