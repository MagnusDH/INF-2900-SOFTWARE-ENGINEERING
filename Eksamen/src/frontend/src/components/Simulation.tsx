import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IWorkout } from "../types";
import { useInterval } from "usehooks-ts";
import axios, { isAxiosError } from "axios";
import { useAuth } from "../util/auth";


const Simulation = () => {
  const [isPause, setIsPause] = useState(false);
  const [workout, setWorkout] = useState<IWorkout>();
  const [completedSets, setCompletedSets] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [pauseRemaining, setPauseRemaining] = useState(60);
  const { id: urlWorkoutId } = useParams();  
  const [ConfirmQuitWorkout, setConfirmQuitWorkout] = useState(false);
  const [ConfirmSaveWorkout, setConfirmSaveWorkout] = useState(false);
  const [ConfirmNameWorkout, setConfirmNameWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  
  const handleDeleteWorkout = async() =>
  {
    try {
      const response = await axios.post("http://localhost:8000/skooba/Simulation/delete", [urlWorkoutId]);
      console.log("RESPONSE FROM DELETE: ", response);
    }
    catch(error) {
      console.log("Error when deleting workout with ID: ", urlWorkoutId, "Error: ", error);
    }
  }

  const handleRenameWorkout = async() =>
  {
    if(isLoggedIn==true){

      if(newWorkoutName.length == 0){
        alert("ERROR: You need to provide a name")
      }
      else{
        try{
          const response = await axios.put("http://localhost:8000/skooba/Simulation/", [urlWorkoutId, newWorkoutName]);
          navigate("/");
        }
        catch(error: any){
          if(error.response.status == 500){
            alert("ERROR: The Workout ID does not exist")
          }
          else if(error.response.status == 409){
            alert("ERROR: Name already exists")
          }
          else{
            alert("ERROR: There was an unknown error")
          }
        }
      }
    }else{
      alert("need to be logged in")
    }
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  function handleBeforeUnload(event: any) 
  {
    event.preventDefault();
    handleDeleteWorkout();
  }

  const fetchWorkout = async () => {
    const baseUrl = "http://localhost:8000/skooba/";

    try {
      const { data } = await axios.get<IWorkout>(`${baseUrl}workout/${urlWorkoutId}`, {
        params: {
          username: localStorage.getItem("userName") ?? '',
        },
      });
      setWorkout(data);
      setPauseRemaining(data.exercises[0].rest);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        // Redirect to homepage if attempting to access another users error or a non-existing error
        if (error.request.status == 401 || error.request.status == 404) {
          return navigate("/");
        }
      }
      alert("unhandled error while fetching workout");
    }
  };

  /*Called when component is mounted*/
  useEffect(() => {
    const fetchdata = async () => {
      await fetchWorkout();
    };
    fetchdata();
  }, []);

  const currentExercise = workout?.exercises[currentExerciseIndex];

  const nextExercise = workout?.exercises[currentExerciseIndex + 1];

  const isLastSet = completedSets === currentExercise?.sets;

  const isLastExercise =
    currentExerciseIndex === workout?.exercises.length! - 1;

  const workoutComplete = isLastExercise && isLastSet;

  useEffect(() => {
    //Called everytime a set is completed, redirects to new page if workout is complete
    if (workoutComplete) {
      navigate(`complete`);
    }
  }, [completedSets]);

  const finishSet = () => {
    setCompletedSets((val) => (val += 1));
    setIsPause(true);
  };

  const finishPause = () => {
    setIsPause(false);
    setPauseRemaining(isLastSet ? nextExercise!.rest : currentExercise!.rest);

    //If completed last rep of exercise, display next exercise and reset completed reps
    if (isLastSet) {
      setCurrentExerciseIndex((idx) => idx + 1);
      setCompletedSets(0);
    }
  };

  useInterval(
    () => {
      if (pauseRemaining > 0) {
        setPauseRemaining((secs) => secs - 1);
      } else {
        finishPause();
      }
    },
    isPause ? 1000 : null //Called each second (1000) that isPause is true.
  );

  const minutesRemaining = Math.floor(pauseRemaining / 60);

  const secondsRemaining = pauseRemaining % 60;

  const addLeadingZero = (num: number) =>
    num < 10 ? `0${num}` : num.toString();

  const formattedTimer = `${addLeadingZero(minutesRemaining)}:${addLeadingZero(
    secondsRemaining
  )}`;

  //Opens page in new tab
  const infoButton = (
    <Link to={`/Exercises/${currentExercise?.exercise.id}/info`} target="_blank">
      Info
    </Link>
  );

  //Renders the simulation
  function Show_Simulation() 
  {
  return(
    <>
        <h1>Workout Name: {workout?.name}</h1>
        <h2>Current exercise: {currentExercise?.exercise.name}</h2>
        <h2>Reps: {currentExercise?.reps}</h2>
        {infoButton}
        <p>
          Completed {completedSets}/{currentExercise?.sets}
        </p>
        {isPause ? (
          <>
            <h2>Pause remaining: {formattedTimer}</h2>
            <button onClick={finishPause}>Finish pause early</button>
          </>
        ) : (
          <button onClick={finishSet}>Start pause</button>
          )}
        <h2>Next exercise: {nextExercise?.exercise.name ?? "Workout complete hehe"}</h2>

        <button onClick={e => setConfirmQuitWorkout(true)}>Quit Workout?</button>
      </>
  )
}

//Renders a yes or no button
function Show_YES_NO_button()
{
  
  return (
    <>
      <p>Are you sure you want to quit the workout?</p>
        <button onClick={e => setConfirmSaveWorkout(true)}>YES</button>

        <button onClick={e => setConfirmQuitWorkout(false)}>NO</button>
    </>
  );
}

//Ask the user if he wants to save the workout
function Show_SaveButton()
{
  return(
    <>
      <p>Do you want to save the workout?</p>
        <button onClick={e => setConfirmNameWorkout(true)}>YES</button>

      <Link to="/">
        <button onClick={() => handleDeleteWorkout()}>NO</button>
      </Link>
    </>
  );
}


  //Main render point, show different components based on what the user inputs
  if(ConfirmQuitWorkout == false && ConfirmSaveWorkout == false && ConfirmNameWorkout == false){
    return (  
        <Show_Simulation/>  
    );
  }
  else if(ConfirmQuitWorkout == true && ConfirmSaveWorkout == false && ConfirmNameWorkout == false){
    return(
      <Show_YES_NO_button/>
    );
  }
  else if(ConfirmQuitWorkout == true && ConfirmSaveWorkout == true && ConfirmNameWorkout == false){
    return(
      <Show_SaveButton/>
    );
  }
  else if(ConfirmQuitWorkout == true && ConfirmSaveWorkout == true && ConfirmNameWorkout == true){
    return(
      <>
      <p>Please provide a name for the workout:</p>
      <input 
        type="text"
        placeholder="Type in name"
        value={newWorkoutName}
        onChange={(e) => setNewWorkoutName(e.target.value)}>
      </input>

      <button onClick={() => handleRenameWorkout()}>Save Workout</button>
    </>
    );
  }

};

export default Simulation;