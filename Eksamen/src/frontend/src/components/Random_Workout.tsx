import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { IExercise } from "../types";

//List of selectable workout types
const workout_types = [

    { label: "Random", value: "Random" },
    { label: "Volume", value: "Volume" },
    { label: "Strength", value: "Strength" },
];

const Random_Workout: React.FC = () => {
    // State variables
    const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string[]>([]);
    const [selectedWorkoutDuration, setWorkoutDuration] = useState<string>("");
    const [errorCode, setErrorCode] = useState<string>("");

    const [muscleGroups, setMuscleGroups] = useState<{ label: string; value: string }[]>([]);
    const baseURL = "http://localhost:8000/skooba/";
    const history = useNavigate();

    // Fetch muscle groups when the component mounts
    useEffect(() => {
        fetchMuscleGroups();
    }, []);

    // Create a random workout and navigate to its presentation page
    const handleClick = async () => {
        const duration = parseInt(selectedWorkoutDuration, 10);

        if (duration <= 15) {
            alert("Workout duration must be more than 15 minutes.");
            return;
        }

        if(selectedMuscleGroup.length === 0 || selectedWorkoutType === "") {
          alert('Invalid input, please select type and muscle groups')
          return
        }

        const workoutId = await createRandomWorkout();
        history(`/present_workout/${workoutId}`);
    };

    // Fetch muscle groups from the API and store them in the muscleGroups array
    const fetchMuscleGroups = async () => {
        try {

            const tmp_muscleGroups: { label: string; value: string }[] = [];
            tmp_muscleGroups.push({ label: "Random", value: "Random" })

            const response = await axios.get<IExercise[]>(`${baseURL}exercises`);
            response.data.forEach((exercise) => {
                //if the category does not exist push it in so it would render.
                if (!tmp_muscleGroups.some((group) => group.value === exercise.category)) {
                    tmp_muscleGroups.push({ label: exercise.category, value: exercise.category });
                }
            });
            setMuscleGroups(tmp_muscleGroups);

        } catch (error) {
            console.error(error);
            setErrorCode("Error fetching muscle groups");
        }
    };


    // Create a random workout by sending a request to the API with the selected options
    const createRandomWorkout = async () => {
        try {
            const response = await axios.post(`${baseURL}Random_Workout`, {
                muscle_groups: selectedMuscleGroup,
                workout_type: selectedWorkoutType,
                workout_duration: selectedWorkoutDuration,
                username: localStorage.getItem("userName"),
            });

            return response.data;
        } catch (error) {
            console.error(error);
            alert("Error creating random workout");
            throw new Error("Error creating random workout");
        }
    };

    // Custom styles for react-select
    const customStyles = {
        option: (provided: any) => ({
            ...provided,
            color: "black",
        }),
    };

    return (
        <>
            <h1>Generate random workout</h1>
            {errorCode && <p>Error code: {errorCode}</p>}

            <h2>Select workout type</h2>
            <Select
                placeholder="Select type"
                options={workout_types}
                onChange={(e) => setSelectedWorkoutType(e?.value ?? "")}
                styles={customStyles}
            />

            <h2>Select muscle group</h2>
            <Select
                isMulti
                placeholder="Select group"
                options={muscleGroups}
                onChange={(e) => setSelectedMuscleGroup(e.map((mg: any) => mg["value"]))}
                styles={customStyles}
            />

            <h2>Select duration (minutes)</h2>
            <input
                type="text"
                placeholder="Type in duration"
                value={selectedWorkoutDuration}
                name="Duration"
                onChange={(e) => setWorkoutDuration(e.target.value)}
            />

            <button onClick={handleClick}>Create workout</button>

            <Link to="/Workout">
                <button>Previous page</button>
            </Link>

            <Link to="/">
                <button>Return to homepage</button>
            </Link>
        </>
    )
}
export default Random_Workout;