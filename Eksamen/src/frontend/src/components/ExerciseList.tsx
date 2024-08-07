import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IExercise } from "../types";

function ExerciseList() {
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [groupedExercises, setGroupedExercises] = useState<Record<string, IExercise[]>>({})
  const baseUrl = "http://localhost:8000/skooba/";
  const fetchExercises = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}exercises`);
      setExercises(data);
    } catch (error) {
      console.log("Submitting login failed", error);
    }
  };

  useEffect(() => {
    //Fetch all exercises from database on mount
    fetchExercises();
  }, []);

  useEffect(() => {    
    // When the exercise values are loaded, create a dictionary 
    // with key value of the categories and value a list of all corresponding exercises
    if (exercises.length == 0) return;

    const grouped = exercises.reduce<Record<string, IExercise[]>>((acc, exercise) => {
      acc[exercise.category] = acc[exercise.category] || [];
      acc[exercise.category].push(exercise);
      return acc;
    }, {});

    setGroupedExercises(grouped);
  },[exercises])

  return (
    <div style={{paddingTop: "50px"}}>
      <h1>All exercises </h1>
      <h2>Click exercise for further information</h2>
      {/* Display header for all categories in exercise database */}
      {Object.keys(groupedExercises).map((category) => (
      <div key={category}>
        <h2>{category}</h2>
        <hr></hr>
        <div className="exercise-list">
        {/* List all exercise names in category as links to info page */}
        {groupedExercises[category].map((exercise) => (
          <p key={exercise.id}>
            <Link to={`/exercises/${exercise.id}/info`}>{exercise.name}</Link>
          </p>
        ))}
        </div>
      </div>
    ))}
    </div>
  );
}

export default ExerciseList;
