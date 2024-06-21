import React from 'react'
import { Col, Row } from 'react-bootstrap'

function SlotsRu(){
    return <Row>
        <Col lg={2} />
        <Col lg={8}>
            <Row>
                <Col sm={12}><h3>Введение</h3></Col>
                <Col sm={12}>
                    <p>Слоты, также известные как игровые автоматы или фруктовые машины, являются популярными казино играми.</p>
                    <p>Цель - вращать барабаны и совпадать символы для выигрыша призов.</p>
                </Col>
                <Col sm={12}><h3>Типы игровых автоматов</h3></Col>
                <Col sm={12}>
                    <p>Существует различные типы игровых автоматов, включая традиционные трехбарабанные слоты, видео-слоты и прогрессивные джекпот-автоматы.</p>
                    <p>Традиционные слоты имеют три барабана и более простой дизайн, в то время как видео-слоты имеют несколько барабанов, линии выплат и часто включают бонусные раунды и особенности.</p>
                    <p>Прогрессивные джекпот-автоматы предлагают джекпот, который увеличивается каждый раз при игре, пока кто-то не выиграет джекпот.</p>
                </Col>
                <Col sm={12}><h3>Использование слотов</h3></Col>
                <Col sm={12}>
                    <p>Перед игрой определите сумму денег, которую хотите поставить на один спин.</p>
                    <p>После размещения ставки нажмите кнопку "Spin".</p>
                    <p>Когда барабаны останавливаются, символы на линиях выплат оцениваются.</p>
                    <p>Если символы формируют выигрышную комбинацию в соответствии с таблицей выплат игры, вы выигрываете приз.</p>
                    <p>Таблица выплат отображает комбинации символов и их соответствующие выплаты.</p>
                </Col>
                <Col sm={12}><h3>Дикие и скаттер символы</h3></Col>
                <Col sm={12}>
                    <p>Многие игровые автоматы включают специальные символы, такие как дикие символы.</p>
                    <p>Дикие символы могут заменять другие символы для создания выигрышных комбинаций, увеличивая ваши шансы на победу.</p>
                    <p>Скаттер символы часто запускают бонусные раунды, бесплатные спины или дополнительные призы, когда на барабанах появляется определенное количество таких символов.</p>
                </Col>
            </Row>
        </Col>
        <Col lg={2} />
    </Row>
}

export default SlotsRu