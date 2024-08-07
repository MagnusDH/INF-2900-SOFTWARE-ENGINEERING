from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login_user),
    path('get_user_id', views.get_user_id),
    path('register', views.register_user),
    path('exercises', views.get_exercises),
    path('exercises/add', views.add_exercise),
    path('Custom_Workout', views.create_custom_workout),
    path('Random_Workout', views.create_random_workout),
    path('present_workout', views.present_workout),
    path('exercises/<int:ex_id>/info', views.get_information),
    path('exercises/<int:ex_id>', views.get_exercise),
    path('workout/<int:id>', views.get_workout_with_exercises),
    path('present_workout_edit_workout', views.present_workout_edit_workout),
    # What should the two following links be linked to? Definetly not "/Simulation/5"
    path('Simulation/5', views.rename_workout),
    path('Simulation/5/delete', views.delete_workout),
    # path('save_workout', views.save_workout),
    path('save_workout', views.WorkoutCreateView.as_view(), name='workout-create'),
    path('update_workout', views.update_workout),

    path('Simulation/', views.rename_workout),
    path('Simulation/delete', views.delete_workout),
    path('save_workout', views.WorkoutCreateView.as_view(), name='workout-create'),
    path('load_workouts', views.load_workouts),
    path('load_workouts/delete', views.delete_workout),
]