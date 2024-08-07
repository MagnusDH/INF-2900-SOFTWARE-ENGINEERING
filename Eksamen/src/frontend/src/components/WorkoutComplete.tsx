import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IWorkout } from "../types";


const workoutComplete = () => {
  const [workout, setWorkout] = useState<IWorkout>();
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchWorkout = async () => {
    const baseUrl = "http://localhost:8000/skooba/";
  
    try {
      const { data } = await axios.get<IWorkout>(`${baseUrl}workout/${id}`, {
        params: {
          username: localStorage.getItem("userName") ?? '',
        },
      });
      setWorkout(data);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        // Redirect to homepage if attempting to access another users error or a non-existing error
        if (error.request.status == 401 || error.request.status == 404) {
          return navigate("/");
        }
      }
      alert("unhandled error while fetching workout");
      return;
    }
  };
  
    /*Called when component is mounted*/
    useEffect(() => {
      const fetchdata = async () => {
        await fetchWorkout();
      };
      fetchdata();
    }, []);



  //////////////////////
  const [ConfirmSaveWorkout, setConfirmSaveWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");

  const handleRenameWorkout = async() =>
  {
    try {
      const response = await axios.put("http://localhost:8000/skooba/Simulation/", [id, newWorkoutName]);
      console.log("RESPONSE FROM RENAME: ", response.data);
    }
    catch(error) {
      console.log("Error when renaming workout with ID: ", id, "Error: ", error);
    }
  }

  const handleDeleteWorkout = async() =>
  {
    try {
      const response = await axios.post("http://localhost:8000/skooba/Simulation/delete", [id]);
      console.log("RESPONSE FROM DELETE: ", response);
    }
    catch(error) {
      console.log("Error when deleting workout with ID: ", id, "Error: ", error);
    }
  }
  
  //Component that renders that user has completed workout
  function Show_WorkoutCompleted()
  {
    return (
      <div>
        <h1>Gz you have completed workout with id = {id}</h1>
        <h2></h2>
        <h2>Do you want to save this workout?</h2>
        <button onClick={e => setConfirmSaveWorkout(true)}>YES</button>

        <Link to="/">
          <button onClick={() => handleDeleteWorkout()}>NO</button>
        </Link>
      </div>
    );
  }

  
  //Render different components based on what user wants 
  if(ConfirmSaveWorkout == false){
    return (
      <div>
        <Show_WorkoutCompleted/>
      </div>
    );
  }

  else if(ConfirmSaveWorkout == true){
    return(
      <div>
        <p>Please provide a name for the workout:</p>
        <input 
          type="text"
          placeholder="Type in name"
          value={newWorkoutName}
          onChange={(e) => setNewWorkoutName(e.target.value)}>
        </input>

        <Link to="/">
          <button onClick={() => handleRenameWorkout()}>Save Workout</button>
        </Link>
      </div>
    );
  }



};
//////////////////////

export default workoutComplete;
