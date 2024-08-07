import axios, { isAxiosError } from "axios";
import "react";
import { useEffect, useState } from "react";
import {Link, useNavigate, useParams} from "react-router-dom";


/*Sends a HTTP GET-request to localhost
Fetches a workout based on an ID
Loops through all exercises in this workout and displays them*/
function PresentWorkout()
{
  const [listExercises, setListExercises] = useState([]);
  const baseUrl = "http://localhost:8000/skooba/";
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();

    
    //Call "fetch_workout" function when web-page is rendered
    useEffect(() => {
        fetch_workout(exerciseId);
    }, []);

    /*
    -Fetches workout table from backend based on an ID
    -Returns an array with exercise name and repetitions*/
    const fetch_workout = async (workout_id: any) =>
    {
        try{
            const response = await axios.get("http://localhost:8000/skooba/present_workout", {params: {id: workout_id, username: localStorage.getItem("userName") ?? ''} })        
            setListExercises(response.data)
        }
        catch (error: unknown) {
            if (isAxiosError(error)) {
              // Redirect to homepage if attempting to access another users error or a non-existing error
              if (error.request.status == 401 || error.request.status == 404) {
                return navigate("/");
              }
            }
      
            alert("unhandled error while fetching workout");
            return;
          }
    }
    //Opens page in new tab
    const infoButton = (
        <Link to={`/Exercises/1/info`} target="_blank">
        Info
        </Link>
    );

    //Render web-page
    return(
        <div className="MainDiv" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>

            {/* Display header */}
            <h1>Your workout:</h1>
            
            {/* <link rel="stylesheet" href="PresentWorkout.css" /> */}

            {/* Display exercises */}
            <table style={{width: 600}}>
                <thead>
                    <tr>
                        {/* Table attribute names */}
                        <th></th>
                        <th>Exercise</th>
                        <th>Repetitions</th>
                        <th>Number of sets</th>
                        <th>Rest</th>
                    </tr>
                </thead>
                
                <tbody>
                    {listExercises.map(exercise =>
                        <tr key={exercise}>
                            <td>
                                <Link to={`/Exercises/${exercise[4]}/info`} target="_blank">
                                    Info
                                </Link>
                            </td>
                            <td>{exercise[0]}</td>
                            <td>{exercise[1]}</td>
                            <td>{exercise[2]}</td>
                            <td>{exercise[3]}seconds</td>
                            
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/*Empty header*/}
            <h3></h3>

    <Link to={"/Workout/CustomWorkout/"+exerciseId}>
        <button>
          Edit Workout
        </button>
    </Link>

      {/* Link user to workout simulation page */}
      {/* <Link to={"/Simulation/"+workoutId}> */}
      <Link to={"/Simulation/"+exerciseId}>
        <button
          style={{
            width: "300px",
            height: "50px",
            backgroundColor: "red",
          }}
        >
          START WORKING OUT!
        </button>
      </Link>

            
            {/* Link user back to homepage */}
            <Link to="/">
                <button>Return to homepage</button>
            </Link>
        </div>
    )
} 
  
export default PresentWorkout