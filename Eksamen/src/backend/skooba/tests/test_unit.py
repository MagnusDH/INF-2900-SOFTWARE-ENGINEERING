from django.test import TestCase
from skooba.models import Users, Workout, WorkoutExercise, Exercise
from skooba.serializers import UsersSerializer, WorkoutSerializer
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import ValidationError
from skooba.tests import create_user_data, create_exercise_data

class ExerciseTest(TestCase):
    """Unit tests for the Exercise model"""
    def setUp(self):
        create_exercise_data()

    def test_exercise_fields(self):
        Bicepscurl = Exercise.objects.get(name="Bicepscurl")

        self.assertEqual(Bicepscurl.name, "Bicepscurl")
        self.assertEqual(Bicepscurl.category, "Arms")
        self.assertEqual(Bicepscurl.main_muscle, "Biceps")

    def test_number_of_exercises(self):
        Count = Exercise.objects.count()
        self.assertEqual(Count, 5)

    def test_exercise_saved_in_database(self):
        Bicepscurl = Exercise.objects.get(name="Bicepscurl")
        Squats = Exercise.objects.get(name="Squats")

        self.assertIsInstance(Bicepscurl, Exercise)
        self.assertIsInstance(Squats, Exercise)

class UsersSerializerTestCase(TestCase):
    def test_create_method(self):
        """Test functionality of custom create function, which hashes pw"""
        data = {
            'username': 'admin',
            'password': 'root'
        }
        serializer = UsersSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        # Save the user in the database
        user = serializer.save()

        # Validate that the password is hashed
        self.assertNotEqual(user.password, 'root')

        # Validate properly hashed
        self.assertTrue(check_password('root', user.password))

        # Validate that the user is stored in the database
        self.assertEqual(Users.objects.count(), 1)


class WorkoutSerializerTestCase(TestCase):
    def setUp(self) -> None:
        """Setup database needed for tests to run"""
        create_user_data()
        create_exercise_data()

    def test_create_method(self):
        """Custom create method which saves workout and workoutexercise object"""
        data = {
            "name": "Test workout",
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
        serializer = WorkoutSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        # Save workout using serializer
        workout = serializer.save()

        # Assert that workout is saved
        self.assertEqual(Workout.objects.count(), 1)

        # Assert that exercises (m2m) is saved on the workout
        self.assertEqual(workout.exercises.count(), 2)

        # Assert that workoutexercise objects are saved in the database
        self.assertEqual(WorkoutExercise.objects.count(), 2)

    def test_no_exercises_invalid_data(self):
        """Serializer should be invalid if no exercises(m2m) are selected"""
        data = {
            "name": "Test workout",
            "user": 2,
            "exercises": []
        }

        serializer = WorkoutSerializer(data=data)
        # Assert that serializer is not valid
        self.assertFalse(serializer.is_valid())

        # Assert that serializer raises error
        self.assertRaises(ValidationError, serializer.is_valid, raise_exception=True)

