from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from skooba.models import Info, Users
from skooba.serializers import InfoSerializer, UsersSerializer
from skooba.models import WorkoutExercise
import random
import math

from skooba.models import Exercise, Workout
from skooba.serializers import ExerciseSerializer, WorkoutSerializer
from django.contrib.auth.hashers import check_password

@api_view(['GET'])
def get_users(request):
    users = Users.objects.all()
    serializer = UsersSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def login_user(request):
    serializer = UsersSerializer(data=request.data)

    # Get the username
    try:
        user = Users.objects.get(username=request.data["username"])
    except Users.DoesNotExist:  # User does not exist
        return Response(data={'message': False}, status=404)
    else:  # User exists
        if check_password(request.data["password"], user.password):
            return Response(data={'message': True, 'user': request.data["username"]})
        else:
            # Password did not match
            return Response(data={'message': False}, status=401)


@api_view(['POST'])
def register_user(request):
    serializer = UsersSerializer(data=request.data)

    # Get the username
    try:
        user = Users.objects.get(username=request.data["username"])
    except Users.DoesNotExist:  # User does not exist
        print("User does not exist")
        if serializer.is_valid():
            serializer.save()
            return Response(data={'message': True})
        else:  # Invalid user input, ex: empty string
            return Response(data={'message': False}, status=400)
    else:
        print("user does exist")
        return Response(data={'message': False}, status=409)


@api_view(['GET'])
def get_exercises(request):
    exercises = Exercise.objects.all()
    serializer = ExerciseSerializer(exercises, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def get_exercise(request, ex_id: int):
    exercise = Exercise.objects.get(id=ex_id)
    serializer = ExerciseSerializer(exercise)
    return Response(serializer.data)


@api_view(['POST'])
def add_exercise(request):
    serializer = ExerciseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@api_view(['POST'])
def get_user_id(request):
    username = request.data

    try:
        # Get the user from the database according to the username from localstorage
        user = Users.objects.get(username=username["username"])
    except Users.DoesNotExist:  # User does not exist     
        # Return an error
        return Response(status=404)
    else:
        # Return post request with a user id
        return Response(data = user.id, status=200)



@api_view(['POST'])
def create_custom_workout(request):
    """
    Returns a new model/table with
    """
    exercise_name = request.data
    # An array that holds the exercises
    arr = []

    # loop through the selected exercises and add them from database
    for i in range(len(exercise_name["all_exercises"])):
        exercise = Exercise.objects.get(name=exercise_name["all_exercises"][i][0])
        arr.append(exercise)

    # Check if the user is logged in
    user = exercise_name["username"]

    #if not, return 404 error 
    if(user==" "):
        return Response("Need to be logged in",status=401)

    # Find the user and create a workout
    object=Users.objects.get(username=user)
 
    # Create the workout and add it to the database
    Work=Workout(name="Workout222", user=object)
    Work.save()
    Work.exercises.set(arr)

    return Response(status=201)


@api_view(['POST'])
def create_random_workout(request):
    """
    Returns a new model/table with random exercises along with number of reps for each exercise
    """
   
    # Retrieve the muscle groups and duration
    muscle_group = request.data["muscle_groups"]
    time = request.data["workout_duration"]
    if int(time) < 10:
        return Response(status=400)

    arr = []
    # if muscle group is random chose a random amount and type of muscle groups
    if (muscle_group[0] == "Random"):
        integer = random.randint(1, 3)
        # retrieve all exercises
        all_exercise = list(
            Exercise.objects.values_list('category').distinct())


        # choose random muscle groups
        lis = random.sample(all_exercise, k=integer)

        # find all exercices for the spesific muscle group
        for i in range(len(lis)):
            # Get requested exercises from "exercises table" and append them to an array
            exercise = Exercise.objects.filter(category=lis[i][0])
            arr.append(exercise)
    # Do the same if muscle group is not random
    else:
        for i in range(len(muscle_group)):
            # Get requested exercises from "exercises table" and append them to an array
            exercise = Exercise.objects.filter(category=muscle_group[i])
            arr.append(exercise)



    if(request.data["workout_type"]=="Random"):
        request.data["workout_type"]=random.choice(["Strength", "Volume"])


    #calculate number of exercises based on type of training
    if(request.data["workout_type"]=="Volume"):
        #time*60 in order to converte to seconds. 90(volume rest)+45(constant time per set)*4(Sets)
        num_exer=(int(time)*60)/((90+45) * 4)
        sets=4
        rest=90
        reps="8-12"

    if(request.data["workout_type"]=="Strength"):
        num_exer=(int(time)*60)/((180+45) * 3)
        sets=3
        rest=180
        reps="6-8"

    #calculate number of exercices per muscle group
    exer_per_part=int(num_exer)/len(arr)

    #array that holds all the exercices for the workout
    exercises=[]


    #loop through different muscle groups and pick exercices
    for i in range(0,len(arr)):

        if(exer_per_part>len(arr[i])):
            return Response("Not enough exercices in the database",status=404)
            
        #the first muscle group has one more exercice
        if(i==0):
            lis=random.sample(set(arr[i]), k=math.ceil(exer_per_part))
        else:
            lis = random.sample(set(arr[i]), k=int(exer_per_part))
        exercises += lis

    

    # check if the user is logged in
    username = request.data["username"]
    
   #if not, save the workout on admin user
    if(username==None):
       
        if(Users.objects.filter(username="Admin").exists()!=True):
            user=Users(username="Admin", password="123")
            user.save()
        else:
            user=Users.objects.get(username="Admin")
        #find the username and create a workout
        username=user.username

    Work=create_workout(exercises, rest, reps, sets, username)

    
    # return ok resporse code
    return Response(status=201, data=Work.pk)

#create a new instance of workout in the database
def create_workout(exercises, rest, reps, sets, username):
    # find the username and create a workout
    object = Users.objects.get(username=username)
  
    # create an workout and save in the database
    Work = Workout(name="Workout", user=object)
    Work.save()

   
    #loop through exercices and create join tables 
    for i in exercises:
        tmp=Exercise.objects.get(name=i)
        workout_exercise = WorkoutExercise.objects.create(
            workout=Work,
            exercise=tmp,
            rest=rest,
            reps=reps,
            sets=sets
        )
        workout_exercise.save()


    # populate the workout with the exercices
    Work.exercises.set(exercises)

    return Work

# This is exactly the same as the other present workout, but this adds the right parameter values for custom workout,
# And i didnt want to change for the others yet
@api_view(['GET'])
def present_workout_edit_workout(request):
    """
    -Uses ID from "request" to fetch a row in the workout table matching this ID
    -Uses the exercise ID's in this selected table to fetch name of exercises and the number of repetitions
    -Places the name of exercises and number of repetitions into a list
    -Returns the list as a HTTP-response
    """

    # Get specific ID row from workout table, 404 if workout does not exist
    workout_name = get_object_or_404(Workout, pk=request.query_params["id"])

    # Get username from request params, set to None if not logged in
    username = request.query_params["username"]

    # Check if user is authorized to fetch workout matching ID, return 401 if not
    user = None if not username else get_object_or_404(Users, username=username)
    is_authorized = workout_authorization(workout_name, user)
    if is_authorized != True:
        return is_authorized

    # Make row attributes available
    # serializer = WorkoutSerializer(workout_name)
    workoutTable_attributes = WorkoutSerializer(workout_name)

    # Create array of exercises->ID from this workout
    exerciseIDs = workoutTable_attributes.data["exercises"]
    workoutName = workoutTable_attributes.data["name"]
   
    # Create arrays that contains rest, reps and sets for an exercise in the same order as exerciseIDs
    restTime = []
    numReps = []
    numSets = []
    numNames = []
    numCategories = []
    numExerciseIDs = []

    # Loop through the number of exercises for the workout where i is the specific exercise
    for i in range(len(exerciseIDs)):
        numNames.append(exerciseIDs[i]["exercise"]["name"])
        numCategories.append(exerciseIDs[i]["exercise"]["category"])
        restTime.append(exerciseIDs[i]["rest"])
        numReps.append(exerciseIDs[i]["reps"])
        numSets.append(exerciseIDs[i]["sets"])
        numExerciseIDs.append(exerciseIDs[i]["exercise"]["id"])

    # Array containing arrays of: (name of exercise, number of reps and number of sets).
    list_exercises = []
    # Fetch names of exercises, number of repetitions and number of sets and append them to array
    for x in range(len(exerciseIDs)):
        exercise = Exercise.objects.get(id=x + 1)
        exercise_serializer = ExerciseSerializer(exercise)
        list_exercises.append(
            [numNames[x], numCategories[x], numReps[x], numSets[x], restTime[x], numExerciseIDs[x]])

    # Return HTTP-response with the list
    return Response([list_exercises, workoutName])
@api_view(['GET'])
def present_workout(request):
    """
    -Uses ID from "request" to fetch a row in the workout table matching this ID
    -Uses the exercise ID's in this selected table to fetch name of exercises and the number of repetitions
    -Places the name of exercises and number of repetitions into a list
    -Returns the list as a HTTP-response
    """

    # Get specific ID row from workout table, 404 if workout does not exist
    workout_name = get_object_or_404(Workout, pk=request.query_params["id"])

    # Get username from request params, set to None if not logged in
    username = request.query_params["username"]

    # Check if user is authorized to fetch workout matching ID, return 401 if not
    user = None if not username else get_object_or_404(Users, username=username)
    is_authorized = workout_authorization(workout_name, user)
    if is_authorized != True:
        return is_authorized

    # Make row attributes available
    # serializer = WorkoutSerializer(workout_name)
    workoutTable_attributes = WorkoutSerializer(workout_name)

    # Create array of exercises->ID from this workout
    exerciseIDs = workoutTable_attributes.data["exercises"]
   
    # Create arrays that contains rest, reps and sets for an exercise in the same order as exerciseIDs
    restTime = []
    numReps = []
    numSets = []
    numNames = []

    # Loop through the number of exercises for the workout where i is the specific exercise
    for i in range(len(exerciseIDs)):
        numNames.append(exerciseIDs[i]["exercise"]["name"])
        restTime.append(exerciseIDs[i]["rest"])
        numReps.append(exerciseIDs[i]["reps"])
        numSets.append(exerciseIDs[i]["sets"])


    # Array containing arrays of: (name of exercise, number of reps and number of sets).
    list_exercises = []

    # Fetch names of exercises, number of repetitions and number of sets and append them to array
    for x in range(len(exerciseIDs)):
        exercise = Exercise.objects.get(id=x + 1)
        exercise_serializer = ExerciseSerializer(exercise)
        list_exercises.append(
            [numNames[x], numReps[x], numSets[x], restTime[x], exerciseIDs[x]["exercise"]["id"]])

    # Return HTTP-response with the list
    return Response(list_exercises)


@api_view(['GET'])
def get_workout_with_exercises(request, id: int):
    """
    - Returns a workout with given ID
    - Contains information about all exercises, including join table information
    - Returns status code 404 for invalid workout ID or invalid username
    - Returns status code 401 for accessing another user's workout
    """
    username = request.query_params["username"]
    workout = get_object_or_404(Workout, pk=id)
    user = None if not username else get_object_or_404(
        Users, username=username)
    is_authorized = workout_authorization(workout, user)

    if is_authorized != True:
        return is_authorized

    # Includes information about all exercises
    serializer = WorkoutSerializer(workout)
    return Response(serializer.data)


def workout_authorization(workout, user):
    """
    - Returns True if a user has authorization to fetch workout 401 Error otherwise
    - If a user is logged in; check if workout belongs to user
    - If not logged in; check if workout is creatd by "Admin"
        - "Admin" = Default value for random workout when not logged in
    """
    if user and user.id != workout.user_id or\
            not user and workout.user.username != "Admin":
        return Response({"This workout belongs to another user!"},
                        status=status.HTTP_401_UNAUTHORIZED)

    return True


class WorkoutCreateView(generics.CreateAPIView):
    """
    - Generic POST method that saves a Workout object using the WorkoutSerializer
    """
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer

@api_view(['POST'])
def update_workout(request):

     # Check if given ID exists in database
    exists = Workout.objects.filter(id=request.data["workout_id"]).exists()
    
    #Delete workout if it exists
    if(exists == True):
        workout_name = Workout.objects.get(id=request.data["workout_id"])
        workout_name.delete()
        return Response(request.data["workout_id"])

@api_view(['GET'])
def get_information(request, ex_id: int):
    """
    - Returns Info object, status code 404 if exercise id is invalid
    - To parse explanation correctly please see ExerciseInfo.tsx
    """
    info = get_object_or_404(Info, exercise_id=ex_id)
    serializer = InfoSerializer(info)
    return Response(serializer.data)


@api_view(['PUT'])
def rename_workout(request):
    """
    Renames a workout based on given workout->ID
    """

    # Check if given ID exists in database
    exists = Workout.objects.filter(id=request.data[0]).exists()

    #Rename workout if it exists
    if(exists == True):
        #If name already exists, return bad response
        nameExists = Workout.objects.filter(name=request.data[1]).exists()
        if(nameExists == True):
            return Response("Workout name already exists", status=409)
        
        #If name is unique update name and return OK response
        else:
            Workout.objects.filter(id=request.data[0]).update(name=request.data[1])
            return Response("Renamed workout", status=200)
    
    #Return bad response if workout does not exist
    else:
        return Response("Cannot rename workout because it does not exist", status=500)


@api_view(['POST'])
def delete_workout(request):
    """
    -Deletes a workout with request->ID from the 'Workout' table\n
    -ID must be given as a single variable, such as: request.data[0] = ID to be deleted
    """

    # Check if given ID exists in database
    exists = Workout.objects.filter(id=request.data[0]).exists()
    
    #Delete workout if it exists
    if(exists == True):
        # workout_name = Workout.objects.get(id=request.data[0])
        queryset = Workout.objects.filter(id=request.data[0])

        queryset.delete()
        return Response("Deleted workout", status=200)

    #Return bad response because workout does not exist
    else:
        return Response("Workout ID does not exist in database", status=500)

@api_view(['GET'])
def load_workouts(request):
    """
    -Uses request->username to get the names and ID of all workouts for this user.\n
    -The workouts are returned as a list in a http-response: [[workoutName, workoutID]]\n
    -Returns a "404-not found" error if username does not exist"""
    
    #Get username from request
    userName = request.GET["username"]
    
    #Get userID from database
    users = Users.objects.filter(username=userName)

    #Check if username exists in database
    if(users.exists()):
        #Get userID from database
        userID = users.first().id 
        
        #Get workouts from database
        queryset = Workout.objects.filter(user_id=userID).values()

        #Create list of workout names
        workout_names = []
        
        for x in queryset:
            workout_names.append([x["name"], x["id"]])

        #Return list of workouts
        return Response(status=200, data=workout_names)

    #Username did not exist
    else:
        return Response("Given username does not exist in database...", status=404)