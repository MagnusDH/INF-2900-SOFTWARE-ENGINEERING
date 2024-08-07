from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from rest_framework.exceptions import ValidationError


class People(models.Model):
    def __str__(self):
        return self.name

    name = models.CharField(max_length=50)
    age = models.IntegerField()
    created = models.DateField(auto_now_add=True)


class Users(models.Model):
    def __str__(self):
        return self.username

    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)


class Exercise(models.Model):
    def __str__(self):
        return self.name

    name = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    main_muscle = models.CharField(max_length=50)


class Workout(models.Model):
    def __str__(self):
        return self.name

    name = models.CharField(max_length=50)
    # One-to-many relationship with Users
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    # Many-to-many relationship with Exercise through join table model WorkoutExercise
    exercises = models.ManyToManyField(
        Exercise, through='WorkoutExercise', related_name='workouts')


class WorkoutExercise(models.Model):
    """Join table between workout and exercise"""
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    rest = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(600)])
    reps = models.CharField(max_length=50)
    sets = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])


class Info(models.Model):
    """Any information about an exercise to help the user complete it"""

    def __str__(self):
        return self.explanation

    explanation = models.CharField(max_length=250)  # To parse correctly please see ExerciseInfo.tsx
    machine = models.CharField(max_length=50)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
