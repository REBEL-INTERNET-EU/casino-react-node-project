import React, {useState} from 'react'
import { translate } from '../../../translations/translate'
import { Form, Button, Col, Row } from 'react-bootstrap';
import { validateInput } from '../../../utils/validate';
import { postData } from '../../../utils/utils';

function ContactForm(props){
    const {lang} = props

    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const [errorEmail, setErrorEmail] = useState(false)
    const [errorSubject, setErrorSubject] = useState(false)
    const [errorMessage, setErrorMessage] = useState(false)

    const [sendResults, setSendResults] = useState(null)

    function handleChange(type, e){
        switch(type) {
            case "email":
                setEmail(e.target.value)
                break
            case "subject":
                setSubject(e.target.value)
                break
            case "message":
                setMessage(e.target.value)
                break
            default:              
        }
    }

    function handleSubmit(e){
        e.preventDefault()
        setErrorSubject(false)
        setErrorMessage(false)
        setErrorEmail(false)
        
        if(subject !== "" && message !== "" && validateInput('email', email)){
            postData("/api/contact", {subject, message, email}).then((data) => {
                if(data && data.send){
                    setSendResults(data.send)
                }
            });
        } else {
            if(subject === ""){
                setErrorSubject(true)
            }
            if(message === ""){
                setErrorMessage(true)
            }
            if(email === "" || !validateInput('email', email)){
                setErrorEmail(true)
            }
        }
    }

    return <div id="contact_form" className="contact_box shadow_convex">
        <Form className="contact_form">
            <Row>
                <Col sm={12} className="label_container">
                    <div className="label">{translate({lang: lang, info: "email"})}</div>
                </Col>
                <Col sm={12}>
                    <input className="input_light shadow_concav" type="text" value={email} onChange={(e)=>{handleChange('email', e)}}/>
                </Col>
            </Row>
            <Row>
                <Col sm={12} className="label_container">
                    <div className="label">{translate({lang: lang, info: "subject"})}</div>
                </Col>
                <Col sm={12}>
                    <input className="input_light shadow_concav" type="text" value={subject} onChange={(e)=>{handleChange('subject', e)}}/>
                </Col>
            </Row>
            <Row>
                <Col sm={12} className="label_container">
                    <div className="label">{translate({lang: lang, info: "message"})}</div>
                </Col>
                <Col sm={12}>
                    <textarea className="input_light shadow_concav" type="text" value={message} onChange={(e)=>{handleChange('message', e)}}/>
                </Col>
            </Row>
            {(() => {
                if(errorEmail || errorSubject || errorMessage){
                    return <div className="alert alert-danger">
                        {errorEmail ? <p className="text_red">{translate({lang: lang, info: "incorrect_email"})}</p> : null}
                        {errorSubject ? <p className="text_red">{translate({lang: lang, info: "empty_input_subject"})}</p> : null}
                        {errorMessage ? <p className="text_red">{translate({lang: lang, info: "empty_input_message"})}</p> : null}
                    </div>
                }
            })()} 
            {(() => {
                if(sendResults === "email_send"){
                    return <div className="alert alert-success">
                        <p className="text_green">{translate({lang: lang, info: sendResults})}</p>   
                    </div>
                } else if(sendResults === "email_no_send"){
                    return <div className="alert alert-danger">
                        <p className="text_red">{translate({lang: lang, info: sendResults})}</p>              
                    </div>
                }
            })()}   
            <Row>
                <Col>
                    <Button type="button" onClick={(e)=>handleSubmit(e)} className="mybutton button_fullcolor shadow_convex">
                        {translate({lang: lang, info: "send"})}
                    </Button>
                </Col>
            </Row>
        </Form>
    </div>
}
export default ContactForm