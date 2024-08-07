import {Link} from "react-router-dom";
 


function Workout(){
  return(
    <div>
      <h1>Workout</h1>

      {/*Return button*/}
      <Link to="/">
          <button>Return to homepage</button>
      </Link>

      {/*Random workout button*/}
      <Link to="/Random_Workout">
        <button>Generate random workout</button>    
      </Link>
        
      {/*Custom workout button*/}
      <Link to="CustomWorkout">
        <button>Generate Custom workout</button>
      </Link>
      {/*Load previous workouts*/}
       <Link to="/LoadWorkouts">
        <button>Saved workouts</button>
      </Link>
    
    </div>
  )
} 
  
  export default Workout