import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import axios from "axios";

function Saved_Workout() {

    const [workouts, setWorkouts] = useState<string[]>([]);
    const baseUrl = "http://localhost:8000/skooba/";

    // Gather all of the users data
    useEffect(() => {
        try {

            axios.get(`${baseUrl}get_user_workouts`, {params: {id: 4}})
            .then((res) => {
                const response = res.data

                let arr = []
                for(let i = 0; i < response.length; i++){
                    arr.push(response[i])
                }
                setWorkouts(arr)
            });
        }
        catch (error){
            console.log("error")
        }
    }, []);
    return (
        <div>
            <h1>
                Workouts for user:
            </h1>


            {(() => {
                let workout = [];
                for (let i = 0; i < workouts.length; i++){
                    workout.push(<Button> 
                        {workouts[i]["name"]}
                    </Button>)
                }
                return workout;
            })()}
        </div>
    );
}

export default Saved_Workout