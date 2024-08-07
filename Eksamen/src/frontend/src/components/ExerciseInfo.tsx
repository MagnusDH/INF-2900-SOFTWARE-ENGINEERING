import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IInfo } from "../types";

function ExerciseInfo() {
  const { id: exerciseId } = useParams();
  const [info, setInfo] = useState<IInfo>();
  const [exerciseName, setExerciseName] = useState("");
  const baseUrl = "http://localhost:8000/skooba/";

  const fetchInfo = async () => {
    try {
      const { data } = await axios.get<IInfo>(
        `${baseUrl}exercises/${exerciseId}/info`
      );
      data.arrayExplanation = explanationMapper(data.explanation);
      setInfo(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchExerciseName = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}exercises/${exerciseId}`);
      setExerciseName(data.name);
    } catch (error) {
      console.log("fetching exercise name failed");
    }
  };

  /**
   * Parses format received from database, to expected format to display in HTML
   * Example input: "1. Open file\n2. Write code\n3. Save code"
   * Example result: ["Open file", "Write code", "Save code"]
   */
  const explanationMapper = (explanation: string) => {
    const regex = /^\d+\.\s+(.*)$/gm; // matches lines starting with a number followed by a dot and whitespace
    const matches = explanation.matchAll(regex); // matchAll returns an iterator over all matches
    const arrayExplanation = Array.from(matches, (match) => match[1]);
    return arrayExplanation;
  };

  const exerciseSteps = info?.arrayExplanation?.map((e: string, index) => (
    <li key={index}>{e}</li>
  ));

  useEffect(() => {
    fetchInfo();
    fetchExerciseName();
  }, []);

  return (
    <div>
      <h1>{exerciseName}</h1>
      <h2>Instructions:</h2>
      <ol>{exerciseSteps}</ol>
      <h2>Machine/equipment needed:</h2>
      <p>{info?.machine}</p>
    </div>
  );
}

export default ExerciseInfo;
