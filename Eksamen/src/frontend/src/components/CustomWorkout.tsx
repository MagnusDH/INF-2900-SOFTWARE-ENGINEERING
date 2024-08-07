import { useEffect, useState } from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import { Button, Collapse } from "reactstrap";
import "./CustomWorkout.css";


interface Exercises {
    category: string;
    name: string;
    selected: boolean;
    id: number;
}

function CustomWorkout(){

    const [items, setItems] = useState<string[]>([]); // The exercises chosen
    const [allExercises, setAllExercises] = useState<string[]>([]); // An array that contains all exercise data
    const [legs, setLegs] = useState<Exercises[]>([]);  // An array that contains all legs exercises
    const [chest, setChest] = useState<Exercises[]>([]); // An array that contains all chest exercises
    const [arms, setArms] = useState<Exercises[]>([]); // An array that contains all arms exercises
    const [back, setBack] = useState<Exercises[]>([]); // An array that contains all back exercises
    const [shoulders, setShoulders] = useState<Exercises[]>([]); // An array that contains all shoulder exercises
    const [workoutName, setWorkoutName] = useState(""); // A variable that contains the workout name that the user typed in
    const [isEditingWorkout, setIsEditingWorkout] = useState(false)
    
    const baseUrl = "http://localhost:8000/skooba/";
    const history = useNavigate();

    const workoutId = useParams();

 
    //Call "fetch_workout" function when web-page is rendered
    useEffect(() => {
        fetch_workout(workoutId["id"]);
    },[]);
    
  
     /*
    -Fetches workout table from backend based on an ID
    -Returns an array with exercise name and repetitions*/
    const fetch_workout = async (workout_id) =>
    {
        try {
            // If workoutId exists get it with items
            if(workout_id){
                const response = await axios.get("http://localhost:8000/skooba/present_workout_edit_workout", {params: {id: workout_id, username: localStorage.getItem("userName") ?? ''} })   
                setItems(response.data[0])
                setWorkoutName(response.data[1])
                setIsEditingWorkout(true)
            }
        }
        catch (error) {
            console.log("error");
        }
    };

    // A list we will use to get all the exercises within each group
    const groupedMuscleGroups = [
        {
            category: "Chest",
            options: chest  // Contains the exercises for chest
        },
        {
            category: "Arms",
            options: arms   // Contains the exercises for arms
        },
        {
            category: "Back",
            options: back   // Contains the exercises for back
        },
        {
            category: "Legs",
            options: legs   // Contains the exercises for legs
        },
        {
            category: "Shoulders",
            options: shoulders   // Contains the exercises for shoulders
        },

    ]

    // Get all exercise data from the backend database so we can use it
    useEffect(() => {

        try {
            // Get the data from the backend URL
            axios.get(`${baseUrl}exercises`).then(res => {
                const response = res.data;
                setAllExercises(response);
                           
                // We do not want to push the exercises multiple times if useEffect were to be called
                if ((legs.length + arms.length + chest.length + back.length + shoulders.length) == response.length){
                    
                }
                // If the length of all category exercises are not the same as the database length, push the database
                else{
                    // Loop through the response message containing each database record
                    for (let i = 0; i <= response.length - 1; i++){
                        const all_exercises: Exercises = {"category": response[i].category, "name": response[i].name, "selected": false, "id": response[i].id};
                        // If the exercise is a legs exercise
                        if(response[i].category == "Legs"){   
                            legs.push(all_exercises);
                        }
                        // If the exercise is a chest exercise
                        else if(response[i].category == "Chest"){
                            chest.push(all_exercises);
                        }
                        // If the exercise is a arms exercise
                        else if(response[i].category == "Arms"){
                            arms.push(all_exercises);  
                        }
                        // If the exercise is a back exercise
                        else if(response[i].category == "Back"){
                            back.push(all_exercises);
                        }
                        // If the exercise is a shoulder exercise
                        else if(response[i].category == "Shoulders"){
                            shoulders.push(all_exercises);
                        }
                    }
                }
            })
            
        }
        catch (error) {
            console.log("error");
        }
        
    }, []);
    
    // Update the selected values of each individual exercises when it is clicked.
    const updateArray = (item, selected_item, value) => {
        // If value is 1, it means that the user has clicked the delete button from the chosen exercise table
        if(value == 1){
            // Loop through the length of the groupedMuscleGroups
            for(let i = 0; i < item.length; i++){
                // If the category of the specific muscle group is equal to the category of the selected item
                if(item[i]["category"] === selected_item[1]){
                    // Loop through the number of exercises from the specific muscle group
                    for(let j = 0; j < item[i].options.length; j++){
                        // If the exercise name from groupedMuscleGroup is equal to the name of the selected item
                        if(item[i].options[j]["name"] === selected_item[0]){
                            item[i].options[j]["selected"] = !item[i].options[j]["selected"]    // Change the selected value of groupedMuscleGroup exercise
                        }
                    }
                }
            }
        }
        // If value is not 1, it means the user has clicked on a exercise from the selection of muscle groups
        else{
            item["selected"] = !item["selected"]    // Change the selected value of the groupedMuscleGroup exercise
        }
    }

    // Handles the values that the user inputs inside the table containing reps, sets and rest values
    const handleItemEdits = (item_index, item, name) => {
        try{
            //ONLY USED IF WE WANT ONLY INTEGER NUMBERS WRITTEN INTO INPUT BOX
            // if(!isNaN(item)){
                const copy_array = [...items]
                
                // Changes the reps value for the specific exercise in the items array
                if(name == "reps"){
                    copy_array[item_index][2] = item;
                    setItems(copy_array);
                }
                // Changes the sets value for the specific exercise in the items array
                else if(name == "sets"){
                    copy_array[item_index][3] = item;
                    setItems(copy_array);
                }
                // Changes the rest value for the specific exercise in the items array
                else if(name == "rest"){
                    copy_array[item_index][4] = item;
                    setItems(copy_array);
                }
                return;
        }
        catch(error){
            console.log("error")
        }
    }

    // Handles the POST of a workout that we want to submit
    const handleWorkoutPost = async () => {
        if(items.length == 0){
            alert("You need to select an exercise");
        }
        // If the workout name is empty, alert the user to first give the workout a name
        else if(workoutName == ""){
            
            alert("You need to give the workout a name");
        }
        else{

            try{
                const exercises = [];
                
                // Loop through the length of the selected items
                for(let i = 0; i<items.length; i++){
                    // Match exercise from the database to the selected items in order to obtain exercise id
                    const exercise_id = allExercises.find((element) => {
                        return element["name"] === items[i][0]
                    })
                   
                    // Push the specific exercise with its id, rest, sets and reps
                    exercises.push({exercise: exercise_id["id"], rest: items[i][4], sets: items[i][3], reps: items[i][2]})
                }
                
                // Username
                const username = localStorage.getItem("userName");
                
                // Get the user id
                const user_id = axios.post(baseUrl+'get_user_id', {username});
                
                // Create an array that can be sent as a post
                const array = {name: workoutName, user: (await user_id).data, exercises: exercises}
                
                if(isEditingWorkout === true){
                    axios.post(baseUrl+"update_workout", {workout: array, workout_id: workoutId["id"]});
                    const tmp = axios.post(baseUrl+"save_workout", array);

                    history(`/present_workout/`+(await tmp).data["id"]);
                }
                else{
                    const tmp = axios.post(baseUrl+"save_workout", array);
                    history(`/present_workout/`+(await tmp).data["id"]);
                }

                // Post the workout to the database
                
                // Redirect the workout to the present workout page

            } catch (error) {
                // The most likely error to occur will be that the user is not found (not logged in)
                alert("Are you logged in?")
            }
        }
    }
        
        // Handles the chosen exercises, adding/removing them to/from a list
        const handleChosenExercises = (item_name: string, item_category: string) => {
        try{
            // The default values 
            const reps = "8";
            const sets = 4;
            const rest = 90;

            // If the item exists in the items array, and the user clicked on it, remove it
            if(items.find((item) => {
                return item[0] === item_name;
            })){
                setItems(items.filter((item) => {
                    return item[0] !== item_name
                }));
            }
            // If the item does not exist in the items array, push it to the array
            else{
                // Find the id of the exercise
                const exercise = allExercises.find((element) => {
                    return element["name"] === item_name
                })
                items.push([item_name, item_category, reps, sets, rest, exercise["id"]]);
                console.log(items)
            }            
        }
        catch(error)
        {
            console.log("error")
        }
    }

    // A variable that holds the collapsible muscle groups box
    const [showHideGroups, setShowHideGroups] = useState({
        hide_select_exercises_box: true,    // If the value of the select exercise box is true, it is hidden.
        muscle_group: "",      // A string that holds the value of the selected muscle group
        selected: false
    });


    const { muscle_group, hide_select_exercises_box } = showHideGroups;
    
    // Handles the show/hide effect of the muscle groups to be displayed
    const showHideSelectGroup = () => {
        setShowHideGroups((prevState) => ({
            hide_select_exercises_box: !prevState.hide_select_exercises_box,
            muscle_group: "",
            selected: !prevState.selected,
        }));
    };
    
    // Handles the content display of the selected muscle group
    const handleMuscleGroup = (muscle_group: string) => {
        setShowHideGroups((prevState) => ({
            ...prevState,
            muscle_group,
            selected: !prevState.selected
        }));
    };

    // Handles the deletion of an exercise inside the selected exercise table
    const handleDeleteExercise = (exercise_name: string) => {
        // If the item exists in the items array, and the user clicked on it, remove it
        if(items.find((item) => {
            return item[0] === exercise_name;
        })){
            setItems(items.filter((item) => {
                return item[0] !== exercise_name
            }));
        }
    };

    const downButton = (items_tmp, item_id) => {
        const data = [...items_tmp];
        
        let tmp = data.splice(item_id, 1)[0];
        
        data.splice(item_id+1, 0, tmp);
        
        setItems(data);
    };
    const upButton = (items_tmp, item_id) => {
        const data = [...items_tmp];
        
        let tmp = data.splice(item_id, 1)[0];
        
        data.splice(item_id-1, 0, tmp);
        
        setItems(data);
    };
    return(
        <div className="main-content">
            <h1>{isEditingWorkout ? "Edit Workout": "Generate Custom Workout"}</h1>
            <h2>Workout Name</h2>
            <input type="text" placeholder="Type in workout name" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)}>
            </input>

            <div className="buttons">
                {/* A input for creating a workout name */}
                {/* Display the select exercises button, that shows/hides groups of exercises upon click  */}
                <Button className="select-muscle-button" onClick={showHideSelectGroup} style={{ marginBottom: '1rem' }}>
                    {hide_select_exercises_box ? "Show Exercises" : "Hide Exercises"}
                </Button>

                {/* The collapsible content that displays the muscle groups */}
                <Collapse hidden={hide_select_exercises_box} className="collapse-box">
                    <div className="muscle-groups">
                        {(() => {
                            let muscleGroup = [];
                            // Loop through the number of muscle groups
                            for (let i = 0; i <= groupedMuscleGroups.length - 1; i++) {
                                // Create a button for each muscle group
                                muscleGroup.push(<Button className={muscle_group !== groupedMuscleGroups[i].category ? "muscle_type": "muscle_type_selected"} onClick={() => handleMuscleGroup(groupedMuscleGroups[i].category)}>                              
                                        {groupedMuscleGroups[i].category}
                                 
                                        {/* The collapsible content that displays the exercises within the specific muscle group */}
                                        <Collapse hidden= {muscle_group !== groupedMuscleGroups[i].category} className="selected_muscle_group">
                                            <div className="selected_muscle_group_contents">

                                                {(() => {
                                                    let muscle_workouts = [];
                                                    // Loop through the number of exercises for the specific muscle group
                                                    for (let j = 0; j <= groupedMuscleGroups[i].options.length - 1; j++)
                                                    {
                                                        // Create a button for each exercise
                                                        muscle_workouts.push(
                                                            <Button 
                                                            // A classname we can use to identify if the exercise is chosen or not
                                                                className={groupedMuscleGroups[i].options[j].selected ? `exercise_selected` : ''}
                                                                onClick={() => {
                                                                    handleChosenExercises(groupedMuscleGroups[i].options[j].name, groupedMuscleGroups[i].options[j].category), 
                                                                    updateArray(groupedMuscleGroups[i].options[j],groupedMuscleGroups[i].options[j], 0)
                                                                }}>

                                                                {groupedMuscleGroups[i].options[j].name}
                                                            </Button>
                                                        )
                                                    }
                                                    return muscle_workouts;
                                                    
                                                })()}
                                            </div>
                                        </Collapse>
                                    </Button>);
                                
                            }
                            return muscleGroup;
                        })()}
                    </div>
                </Collapse>
                <div className="selected-exercises-content">
                        {/* Shows the number of exercises selected in a table */}
                        <div className="show-selected">
                            <table style={{width: 1100}}>
                        
                            {items.length > 0 &&
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
                            }
                            {items.length == 0 && 
                                <h3>
                                    No exercises selected!
                                </h3>
                            }

                        
                        {(() => {
                            let selected_exercises = [];
                            // Loop through the number of selected exercises and display them inside the table
                            for (let i = 0; i <= items.length - 1; i++)
                            {
                                if(i == 0){

                                    selected_exercises.push(
                                    // This contains the first row of the table, because it cant use the "upButton" for ordering of exercises
                                    <tbody className="table_body">

                                        <td>
                                            <Link to={`/Exercises/${items[i][5]}/info`} target="_blank">
                                            Info
                                            </Link>
                                        </td>
                                        <td className="exercise_name">{items[i][0]}</td>      {/*Exercise name*/}
                                        <td>
                                            {/*Number of repetitions*/}
                                            <input className="RepetitionInput" value={items[i][2]} onChange={(e) => {handleItemEdits(i, e.target.value, "reps")}}></input>
                                        </td> 
                                        <td>
                                            {/*Number of sets*/}
                                            <input className="SetsInput" value={items[i][3]} onChange={(e) => {handleItemEdits(i, e.target.value, "sets")}}></input>
                                        </td>     
                                        <td>
                                            {/*Number of seconds to rest*/}
                                            <input className="RestInput" value={items[i][4]} onChange={(e) => {handleItemEdits(i, e.target.value, "rest")}}></input>
                                        </td>
                                        <td>
                                            {/*Delete button*/}
                                            <Button className="delete_button" onClick={() => {handleDeleteExercise(items[i][0]), updateArray(groupedMuscleGroups, items[i], 1)}}>Delete</Button>
                                        </td>
                                        <td>

                                        </td>
                                        <td>
                                            {/*Delete button*/}
                                            <Button className="delete_button" onClick={() => {downButton(items, i)}}>Down</Button>
                                        </td>
                                    </tbody>
                                    )
                                }
                                else if(i != items.length - 1){
                                    selected_exercises.push(
                                        
                                        <tbody className="table_body">
    
                                            <td>
                                                <Link to={`/Exercises/${items[i][5]}/info`} target="_blank">
                                                Info
                                                </Link>
                                            </td>
                                            <td className="exercise_name">{items[i][0]}</td>      {/*Exercise name*/}
                                            <td>
                                                {/*Number of repetitions*/}
                                                <input className="RepetitionInput" value={items[i][2]} onChange={(e) => {handleItemEdits(i, e.target.value, "reps")}}></input>
                                            </td> 
                                            <td>
                                                {/*Number of sets*/}
                                                <input className="SetsInput" value={items[i][3]} onChange={(e) => {handleItemEdits(i, e.target.value, "sets")}}></input>
                                            </td>     
                                            <td>
                                                {/*Number of seconds to rest*/}
                                                <input className="RestInput" value={items[i][4]} onChange={(e) => {handleItemEdits(i, e.target.value, "rest")}}></input>
                                            </td>
                                            <td>
                                                {/*Delete button*/}
                                                <Button className="delete_button" onClick={() => {handleDeleteExercise(items[i][0]), updateArray(groupedMuscleGroups, items[i], 1)}}>Delete</Button>
                                            </td>
                                            <td>
                                                {/*Delete button*/}
                                                <Button className="delete_button" onClick={() => {upButton(items, i)}}>Up</Button>
                                            </td>
                                            <td>
                                                {/*Delete button*/}
                                                <Button className="delete_button" onClick={() => {downButton(items, i)}}>Down</Button>
                                            </td>
                                        </tbody>
                                        )
                                }
                                else{
                                    selected_exercises.push(

                                        // This contains the last row of the table, because it cant use the "downButton" for ordering of exercises
                                        <tbody className="table_body">
    
                                            <td>
                                                <Link to={`/Exercises/${items[i][5]}/info`} target="_blank">
                                                Info
                                                </Link>
                                            </td>
                                            <td className="exercise_name">{items[i][0]}</td>      {/*Exercise name*/}
                                            <td>
                                                {/*Number of repetitions*/}
                                                <input className="RepetitionInput" value={items[i][2]} onChange={(e) => {handleItemEdits(i, e.target.value, "reps")}}></input>
                                            </td> 
                                            <td>
                                                {/*Number of sets*/}
                                                <input className="SetsInput" value={items[i][3]} onChange={(e) => {handleItemEdits(i, e.target.value, "sets")}}></input>
                                            </td>     
                                            <td>
                                                {/*Number of seconds to rest*/}
                                                <input className="RestInput" value={items[i][4]} onChange={(e) => {handleItemEdits(i, e.target.value, "rest")}}></input>
                                            </td>
                                            <td>
                                                {/*Delete button*/}
                                                <Button className="delete_button" onClick={() => {handleDeleteExercise(items[i][0]), updateArray(groupedMuscleGroups, items[i], 1)}}>Delete</Button>
                                            </td>
                                            <td>
                                                {/*Delete button*/}
                                                <Button className="delete_button" onClick={() => {upButton(items, i)}}>Up</Button>
                                            </td>
                                         
                                        </tbody>
                                        )
                                }
                                
                        }
                        return selected_exercises;
                            
                        })()}
                        </table>
                        </div>
                    {/* </Collapse> */}
                </div>
                <div className="create_workout_button">

                    <button onClick={(e) => handleWorkoutPost()}> {isEditingWorkout ? "Confirm Edit": "Create Workout"} </button>
                </div>
                
            </div>
            <div className="page_buttons">

                {/* Previous page button */}
                <Link to="/Workout">
                    <button>Previous page</button>
                </Link>
                    
                {/* Return to homepage button */}
                <Link to="/">
                    <button>Return to homepage</button>
                </Link>
            </div>
             
      </div>
    )
  } 
  
  export default CustomWorkout

  // * Custom Workout Design
  // * A button that can be clicked to display the groups of exercises
  // * If a muscle group is clicked, it displays the exercises within that group (gotten from the database)

  // * A button that can be clicked to display the selected exercises
  // * If the selected exercise is clicked, it deletes the exercise

  // * A button for submitting the exercises chosen 

  // * A button for returning to the previous page