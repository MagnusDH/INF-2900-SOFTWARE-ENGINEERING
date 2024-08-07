import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//importing the functions in order to connect them
import ExerciseList from "./components/ExerciseList";
import ExerciseInfo from "./components/ExerciseInfo";
import PresentWorkout from "./components/PresentWorkout";
import Random_Workout from "./components/Random_Workout";
import MyPage from "./components/MyPage";
import Progression from "./components/Progression";
import Login from "./components/Login";
import Workout from "./components/Workout";
import CustomWorkout from "./components/CustomWorkout";
import Register from "./components/Register";
import Settings from "./components/MyPageLinks/Settings";
import ChangePW from "./components/MyPageLinks/ChangePW";
import NavBar from "./components/NavBar";
import Simulation from "./components/Simulation";
import WorkoutComplete from "./components/WorkoutComplete";
import LoadWorkouts from "./components/LoadWorkouts";

//redirect routes
export const router = createBrowserRouter([
  {
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/MyPage",
        element: <MyPage />,
      },
      {
        path: "/Progression",
        element: <Progression />,
      },
      {
        path: "/Login",
        element: <Login />,
      },
      {
        path: "/Login/Register",
        element: <Register />,
      },
      {
        path: "/Settings",
        element: <Settings />,
      },
      {
        path: "/Workout",
        element: <Workout />,
      },
      {
        path: "/Random_Workout",
        element: <Random_Workout />,
      },
      {
        path: "/Workout/CustomWorkout",
        element: <CustomWorkout />,
      },
      {
        path: "/present_workout/:id",
        element: <PresentWorkout />,
      },
      {
        path: "/Exercises",
        element: <ExerciseList />,
      },
      {
        path: "/Exercises/:id/Info",
        element: <ExerciseInfo />,
      },
      {
        path: "/Simulation/:id",
        element: <Simulation />,
      },
      {
        path: "/Simulation/:id/Complete",
        element: <WorkoutComplete />,
      },
      {
        path: "/Workout/CustomWorkout",
        element: <CustomWorkout />,
      },
      {
        path: "/Workout/CustomWorkout/:id",
        element: <CustomWorkout/>,
      },
      {
        path: "/LoadWorkouts",
        element: <LoadWorkouts/>
      }
    ],
  }, 
  {
    path: "/ChangePW",
    element: <ChangePW />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);
