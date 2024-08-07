# Serializers are responsible for converting objects into data types understandable by javascript and front-end frameworks.
# Serializers provide deserialization(allowing parsed data to be converted back into complex types)
from django.contrib.auth.hashers import make_password
from rest_framework import serializers, status
from rest_framework.exceptions import ValidationError

from skooba.models import Exercise, People, Users, Workout, Info, WorkoutExercise


class PeopleSerializer(serializers.ModelSerializer):
    class Meta:
        model = People
        fields = '__all__'


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'

    def create(self, validated_data):
        """Replaces password with hashed password before creation"""
        validated_data['password'] = make_password(validated_data['password'])
        return super(UsersSerializer, self).create(validated_data)


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class WorkoutExerciseCreateSerializer(serializers.ModelSerializer):
    """Serializer used to POST WorkoutExercise object, accepts exercise as PK not object"""
    exercise = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all())

    class Meta:
        model = WorkoutExercise
        # Exclude workout as it is not defined at time of POST
        exclude = ('workout',)


class WorkoutExerciseGetSerializer(serializers.ModelSerializer):
    """Serializer used to GET WorkoutExercise object, returns all fields"""
    exercise = ExerciseSerializer()

    class Meta:
        model = WorkoutExercise
        fields = '__all__'


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseCreateSerializer(
        many=True, source='workoutexercise_set')  # Fetch exercises through WorkoutExerciseCreateSerializer

    class Meta:
        model = Workout
        fields = '__all__'

    def create(self, validated_data):
        """Override create function to save workout and exercises separately"""

        exercises = validated_data.pop('workoutexercise_set')

        # Destructures and saves workout
        workout = Workout.objects.create(**validated_data)

        for exercise in exercises:
            WorkoutExercise.objects.create(workout=workout, **exercise)

        return workout

    def to_representation(self, instance):
        """When calling GET using this serializer, fetch the 'exercises' field using WorkoutExerciseGetSerializer"""
        self.fields['exercises'] = WorkoutExerciseGetSerializer(
            many=True, source='workoutexercise_set')
        return super().to_representation(instance)

    def validate_exercises(self, value):
        """Validates that the exercises field(array) is not empty, returns 400 error if true"""
        if not value:
            raise ValidationError("Exercises must be selected")
        else:
            return value


class InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Info
        fields = '__all__'
