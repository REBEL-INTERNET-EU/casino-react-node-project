var money_obj = {}
var history_obj = {}
var mystate = [money_obj, history_obj]

const raceReducer = (state = -1, action) => {
	switch(action.type){
		case "race_calculate_money":	
			money_obj = action
			mystate[0] = money_obj			
			state = mystate	
			return state
		case "race_get_history":	
			history_obj = action	
			mystate[1] = history_obj			
			state = mystate			
			return state				
		default: 
			return state
	}
}

export default raceReducer