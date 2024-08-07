export interface IInfo {
  id: number;
  explanation: string;
  machine: string;
  exercise: string;
  arrayExplanation?: string[];
}

export interface User {
  username: string;
  password: string;
}

export interface IExercise {
  id: number;
  name: string;
  category: string;
  main_muscle: string;
}

export interface IWorkoutExercise {
  id: number;
  exercise: IExercise;
  rest: number;
  reps: string;
  sets: number;
}

export interface IWorkout {
  id: number;
  name: string;
  exercises: Array<IWorkoutExercise>;
  user: number;
}
