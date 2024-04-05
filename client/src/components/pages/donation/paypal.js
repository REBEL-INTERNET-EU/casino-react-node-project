import React from 'react'
import { translate } from '../../../translations/translate'
function PaypalDonation(props){    
    const {lang, list} = props
    const paypalDonation = list.filter(x => x.type === "paypal")
    return <>
        {paypalDonation && paypalDonation.length > 0 ? <>
            <h2>{translate({lang: lang, info: "bank_donation_title"})}</h2>
            <p>{translate({lang: lang, info: "bank_donation_text"})}</p>
            <ul>
                {paypalDonation.map(function(item, i){
                    if(item.link===""){
                        return
                    }
                    return <li key={i} className="donation_link donation_link_paypal">
                        <a className="mybutton button_transparent shadow_convex" rel="noopener noreferrer" target="_blank" href={item.link}>{item.title}</a>
                    </li>
                })}
            </ul>         
        </> : null}        
    </>
}
export default PaypalDonation