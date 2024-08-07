import json

from django.contrib.auth.hashers import make_password
from skooba.models import Exercise, Workout, Users, WorkoutExercise, Info
from rest_framework.test import APITestCase
baseURL = "http://localhost:8000/skooba/"

class GetWorkoutApiTest(APITestCase):
    def setUp(self):
        create_workout_data()

    def test_get_workout_correctly(self):
        workout_id = 1
        response = self.client.get(f"{baseURL}workout/{workout_id}",
                                   {"username": "user1"})
        self.assertEqual(response.data["id"], workout_id)
        self.assertEqual(response.data["exercises"]
                         [0]["exercise"]["name"], "Bicepscurl")
        self.assertEqual(response.status_code, 200)

    def test_get_workout_created_by_another_user(self):
        workout_id = 1
        response = self.client.get(f"{baseURL}workout/{workout_id}",
                                   {"username": "user2"})
        assert response.status_code == 401

    def test_get_non_existing_workout(self):
        workout_id = 55
        response = self.client.get(f"{baseURL}workout/{workout_id}",
                                   {"username": "user2"})
        assert response.status_code == 404

    def test_get_random_workout_not_logged_in(self):
        workout_id = 4
        response = self.client.get(f"{baseURL}workout/{workout_id}",
                                   {"username": ""})

        self.assertEqual(response.data["id"], workout_id)
        self.assertEqual(response.data["exercises"]
                         [0]["exercise"]["name"], "Bicepscurl")
        self.assertEqual(response.status_code, 200)

    def test_get_unauthorized_not_logged_in(self):
        workout_id = 2
        response = self.client.get(f"{baseURL}workout/{workout_id}",
                                   {"username": ""})
        self.assertEqual(response.status_code, 401)


class LoginApiTest(APITestCase):
    def setUp(self) -> None:
        Users.objects.create(username="user1", password=make_password("test"))

    def login_request(self, username: str, password: str):
        return self.client.post(f"{baseURL}login", {"username": username, "password": password})

    def test_successful_login(self):
        response = self.login_request("user1", "test")
        self.assertEqual(response.status_code, 200)

    def test_login_invalid_username(self):
        response = self.login_request("nonexistent", "test")
        self.assertEqual(response.status_code, 404)

    def test_login_wrong_password(self):
        response = self.login_request("user1", "wrongPassword")
        self.assertEqual(response.status_code, 401)


class RegisterApiTest(APITestCase):
    def setUp(self) -> None:
        Users.objects.create(username="user1", password="test")

    def register_request(self, username: str, password: str):
        return self.client.post(f"{baseURL}register", {"username": username, "password": password})

    def test_register_success(self):
        response = self.register_request("user4", "password")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Users.objects.filter(username="user4").exists())
        user = Users.objects.get(username="user4")
        self.assertNotEqual("password", user.password)

    def test_register_existing_username(self):
        response = self.register_request("user1", "password")
        self.assertEqual(response.status_code, 409)

    def test_register_invalid_input(self):
        response = self.register_request('', '')
        self.assertFalse(Users.objects.filter(username="").exists())
        self.assertEqual(response.status_code, 400)


class SaveWorkoutApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()

    def save_workout_request(self, request_data):
        return self.client.post(f"{baseURL}save_workout", json.dumps(request_data), content_type="application/json")

    def test_save_workout_multiple_exercises_success(self):
        success_data = {
            "name": "My custom workout",
            "user": 2,
            "exercises": [
                {
                    "exercise": 1,
                    "rest": 90,
                    "sets": 3,
                    "reps": "8-12"

                },
                {
                    "exercise": 1,
                    "rest": 90,
                    "sets": 3,
                    "reps": "8-12"

                }
            ]
        }
        response = self.save_workout_request(success_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "My custom workout")
        self.assertEqual(response.data["exercises"]
                         [0]["exercise"]["name"], "Bicepscurl")

    def test_save_workout_no_exercises(self):
        data = {
            "name": "My custom workout",
            "user": 2,
            "exercises": []
        }
        response = self.save_workout_request(data)
        self.assertEqual(response.status_code, 400)

    def test_save_workout_invalid_values(self):
        data = {
            "name": "My custom workout",
            "user": 2,
            "exercises": [
                {
                    "exercise": 1,
                    "rest": -90,
                    "sets": -3,
                    "reps": "8-12"

                },
            ]
        }
        response = self.save_workout_request(data)
        self.assertEqual(response.status_code, 400)


class RenameWorkoutApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()

    def rename_workout_request(self, workout_id, name):  # TODO: change API url
        return self.client.put(f"{baseURL}Simulation/",  json.dumps([workout_id, name]), content_type="application/json")

    def test_successful_rename(self):
        name = "new name"
        self.assertFalse(Workout.objects.filter(name=name).exists())
        response = self.rename_workout_request(1, name)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Workout.objects.filter(name=name).exists())

    def test_rename_to_existing(self):
        new_name = "workout 1"  # Already exists, see create_workout_data()
        workout_id = 2
        response = self.rename_workout_request(2, new_name)
        workout = Workout.objects.get(pk=workout_id)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(workout.name, "workout 11")


class DeleteWorkoutApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()

    def delete_request(self, workout_id):
        return self.client.post(f"{baseURL}Simulation/delete",  json.dumps([workout_id]), content_type="application/json")

    def test_successful_delete(self):
        workout_id = 1
        self.assertTrue(Workout.objects.filter(pk=workout_id).exists())
        response = self.delete_request(workout_id)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Workout.objects.filter(pk=workout_id).exists())


class PresentWorkoutApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()

    def present_request(self, workout_id, username):
        return self.client.get(f"{baseURL}present_workout",
                               {"id": workout_id, "username": username})

    def test_present_workout_correctly(self):
        workout_id = 1
        response = self.present_request(workout_id, "user1")
        self.assertEqual(response.data[0]
                         [0], "Bicepscurl")
        self.assertEqual(response.status_code, 200)

    def test_present_workout_created_by_another_user(self):
        workout_id = 1
        response = self.present_request(workout_id, "user2")
        assert response.status_code == 401

    def test_present_non_existing_workout(self):
        workout_id = 55
        response = self.present_request(workout_id, "user2")
        assert response.status_code == 404

    def test_present_random_workout_not_logged_in(self):
        workout_id = 4
        response = self.present_request(workout_id, "")
        self.assertEqual(response.data[0]
                         [0], "Bicepscurl")
        self.assertEqual(response.status_code, 200)

    def test_present_unauthorized_not_logged_in(self):
        workout_id = 2
        response = self.present_request(workout_id, "")
        self.assertEqual(response.status_code, 401)


class RandomWorkoutApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()

    def random_request(self, muscle_groups, workout_duration: int, workout_type: str, username: str):
        return self.client.post(f'{baseURL}Random_Workout', json.dumps({"muscle_groups": muscle_groups,
                                                                        "workout_duration": workout_duration,
                                                                        "workout_type": workout_type,
                                                                        "username": username}), content_type="application/json")

    def test_successful_random_workout_one_group_volume(self):
        muscle_groups = ["Arms"]
        workout_type = "Volume"

        # Validate OK response from API, and that workout was created
        response = self.random_request(
            muscle_groups, 30, workout_type, "user1")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Workout.objects.filter(pk=response.data).exists())

        # Fetch workout using ID, and assert all values as expected
        workout_response = self.client.get(f"{baseURL}workout/{response.data}",
                                           {"username": "user1"})
        exercises = workout_response.data["exercises"]
        self.assertEqual(len(exercises), 3)  # Number of exercises
        for exercise in exercises:
            self.assertTrue(exercise["exercise"]["category"] in muscle_groups)
            self.assertEqual(exercise["rest"], 90)
            self.assertEqual(exercise["sets"], 4)
            self.assertEqual(exercise["reps"], "8-12")

    def test_successful_random_workout_multiple_group_strength(self):

        muscle_groups = ["Arms", "Legs"]
        workout_type = "Strength"

        # Validate OK response from API, and that workout was created
        response = self.random_request(
            muscle_groups, 30, workout_type, "user1")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Workout.objects.filter(pk=response.data).exists())

        # Fetch workout using ID, and assert all values as expected
        workout_response = self.client.get(f"{baseURL}workout/{response.data}",
                                           {"username": "user1"})
        exercises = workout_response.data["exercises"]
        self.assertEqual(len(exercises), 2)  # Expected number of exercises
        for idx, exercise in enumerate(exercises):
            if idx == 1:  # Should get one exercise for each category
                self.assertEqual(exercise["exercise"]["category"], 'Legs')
            else:
                self.assertEqual(exercise["exercise"]["category"], 'Arms')
            self.assertEqual(exercise["rest"], 180)
            self.assertEqual(exercise["sets"], 3)
            self.assertEqual(exercise["reps"], "6-8")

    def test_successful_random_workout_not_logged_in(self):
        muscle_groups = ["Arms", "Legs"]
        workout_type = "Strength"

        # Validate OK response from API, and that workout was created
        response = self.random_request(muscle_groups, 30, workout_type, None)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Workout.objects.filter(pk=response.data).exists())

        # Assert that workout is saved as expected when not logged in
        workout = Workout.objects.get(pk=response.data)
        self.assertEqual(workout.name, "Workout")
        self.assertEqual(workout.user.username, "Admin")

    def test_random_workout_invalid_time(self):
        muscle_groups = ["Arms", "Legs"]
        workout_type = "Strength"

        # Validate OK response from API, and that workout was created
        response = self.random_request(
            muscle_groups, -5, workout_type, "user1")
        self.assertEqual(response.status_code, 400)


class LoadWorkoutsApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()

    def load_workouts_request(self, username):
        return self.client.get(f"{baseURL}load_workouts",
                               {"username": username})

    def test_successful_load_workouts(self):
        username = "user1"
        response = self.load_workouts_request(username)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [['workout 1', 1], ['workout 11', 2]])

    def test_load_workouts_not_exist(self):
        Users.objects.create(username="new_account", password="test")
        response = self.load_workouts_request(username="new_account")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class GetExerciseInfoApiTest(APITestCase):
    def setUp(self) -> None:
        create_workout_data()
        Info.objects.create(explanation="Press bar into air", machine="Barbell",
                            exercise=Exercise.objects.get(pk=5))

    def request(self, exercise_id):
        return self.client.get(f"{baseURL}exercises/{exercise_id}/info")

    def test_successful_get_info(self):
        response = self.request(5)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["machine"], "Barbell")


def create_workout_data():
    create_exercise_data()
    create_user_data()
    workout1 = Workout.objects.create(
        name="workout 1",
        user=Users.objects.get(username="user1"),
    )

    workout11 = Workout.objects.create(
        name="workout 11",
        user=Users.objects.get(username="user1"),
    )

    workout2 = Workout.objects.create(
        name="workout 2",
        user=Users.objects.get(username="user2"),
    )

    random_not_loggedin = Workout.objects.create(
        name="Workout",
        user=Users.objects.get(username="Admin"),
    )

    WorkoutExercise.objects.create(
        workout=workout1,
        exercise=Exercise.objects.get(id=1),
        rest=45,
        reps="8-12",
        sets=3
    )

    WorkoutExercise.objects.create(
        workout=workout11,
        exercise=Exercise.objects.get(id=2),
        rest=45,
        reps="8-12",
        sets=3
    )

    WorkoutExercise.objects.create(
        workout=workout2,
        exercise=Exercise.objects.get(id=2),
        rest=30,
        reps="12-14",
        sets=3
    )

    WorkoutExercise.objects.create(
        workout=random_not_loggedin,
        exercise=Exercise.objects.get(id=1),
        rest=90,
        reps="8",
        sets=5
    )


def create_exercise_data():
    Exercise.objects.create(
        name="Bicepscurl", category="Arms", main_muscle="Biceps"
    )
    Exercise.objects.create(
        name="Squats", category="Legs", main_muscle="Thigh"
    )
    Exercise.objects.create(
        name="Tri extension", category="Arms", main_muscle="Triceps"
    )
    Exercise.objects.create(
        name="Hammer curl", category="Arms", main_muscle="Biceps")

    Exercise.objects.create(
        name="Close-grip bench press", category="Arms", main_muscle="Triceps"
    )


def create_user_data():
    Users.objects.create(username="user1", password=make_password("test"))
    Users.objects.create(username="user2", password="test")
    Users.objects.create(username="Admin", password="test")
