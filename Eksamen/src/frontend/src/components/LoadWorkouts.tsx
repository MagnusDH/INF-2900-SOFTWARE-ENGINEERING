import {Link, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "react";
import "./LoadWorkouts.css"


function LoadWorkouts()
{
  //Get users logged-in state and username
  const userLogged = localStorage.getItem("userLogged")
  const userName = localStorage.getItem("userName")

  //list to hold workout names
  const [ListWorkouts, setListWorkouts] = useState([]);
  const [WorkoutID, setWorkoutID] = useState();
  const navigate = useNavigate();

  //Sends a GET request to "load_workouts" with a "username".
  //The response is a double list containing: [ [workoutName, workoutID], [... , ...] ] for the given username
  const fetch_workout_names = async () => 
  {
      try{
        const response = await axios.get("http://localhost:8000/skooba/load_workouts", {params: {"username": userName}})
        setListWorkouts(response.data)
        
        for(var i=0; i<response.data.length; i++){
          ListWorkouts.push(response.data[i])
        }
      }
      catch(error){
        alert("There was an error when loading workouts")
      }
  }

   //Uses given workout_ID to send a HTTP request which deletes the workout from database
   //Also deletes the given WorkoutID from the local list displayed in the browser
   const handleDeleteWorkout = async(workoutID) =>
   {
     try {
       const response = await axios.post("http://localhost:8000/skooba/load_workouts/delete", [workoutID])
       
       //Copy original list
       const updatedList = [...ListWorkouts];
       
       //Remove item(s) from list matching workoutName
       for(var i=0; i<updatedList.length; i++){
         if(updatedList[i][1] == workoutID){
           updatedList.splice(i, 1)
         }
       }
       
       //Update original list
       setListWorkouts(updatedList)
     }

    catch(error){
      console.log("Error when deleting workout with ID: ")
    }
  }


  //If user is logged in, fetch users->workouts
  if(userLogged == "true"){
    useEffect(() => {
      fetch_workout_names();      
    }, []);

    return(
      <div>
        <h1>Your workouts</h1>

        {/* Display each workout with a replay and delete button */}
        {ListWorkouts.map(workout =>
          <li className="LoadWorkoutList" key={workout}>
            {workout[0]}
            <button className="LoadWorkoutReplayButton" onClick={e => navigate(`/present_workout/`+workout[1])}>Replay</button>
            <button className="LoadWorkoutDeleteButton" onClick={e => handleDeleteWorkout(workout[1])}>Delete</button>
          </li>
        )}        

        <Link to="/Workout">
          <button>Previous page</button>
        </Link>
            
        <Link to="/">
          <button>Return to home page</button>
        </Link>
      </div>
    )
  }

  //If user is not logged in
  else{
    return(
      <div>
        <h2> You are not logged inn</h2> 
        <Link to="/Login">
          <button>Go to login</button>
        </Link>
      </div>
    )
  }
} 
    
export default LoadWorkouts;