import React from 'react'
import roulette_icon from '../../../img/icons_other/icons/yellow/roulette.png'
import blackjack_icon from '../../../img/icons_other/icons/yellow/blackjack.png'
import slots_icon from '../../../img/icons_other/icons/yellow/slots.png'
import craps_icon from '../../../img/icons_other/icons/yellow/craps.png'
import race_icon from '../../../img/icons_other/icons/yellow/race.png'
import keno_icon from '../../../img/icons_other/icons/yellow/keno.png'
import poker_icon from '../../../img/icons_other/icons/yellow/carribean.png'

function HowToPlayTitles(props){
    let list_games = ["roulette", "blackjack", "slots", "craps", "race", "keno", "poker"]

    function handleChoice(x){
        if(typeof props.handleChoice === "function"){
            props.handleChoice(x)
        }
    }

    return <div className="how_to_play_titles">
        {list_games.map(function(t, i){
            return <div class="cell_howToPlay_container" onClick={()=>handleChoice(t)}>
                <div class="cell_howToPlay shadow_concav">
                    <div class="cell_info">
                        {(() => {
                            switch (t) {
                                case "roulette":
                                    return <img src={roulette_icon} alt="game_icon" />
                                case "blackjack":
                                    return  <img src={blackjack_icon} alt="game_icon" />
                                case "slots":
                                    return <img src={slots_icon} alt="game_icon" />
                                case "craps":
                                    return  <img src={craps_icon} alt="game_icon" />
                                case "race":
                                    return <img src={race_icon} alt="game_icon" />
                                case "keno":
                                    return  <img src={keno_icon} alt="game_icon" />
                                case "poker":
                                    return  <img src={poker_icon} alt="game_icon" />
                                default:
                                    return null
                            }  
                        })()}
                        <p>{t}</p>
                    </div>
                </div>
            </div>
        })}
    </div>
}
export default HowToPlayTitles