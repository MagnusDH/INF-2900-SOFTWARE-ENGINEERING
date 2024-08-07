# Backend - Python and Django REST Framework

## Dependencies and installation

1. Python 3.9 or above https://www.python.org/downloads/
2. pipenv (python package): `python3 -m pip install pipenv`

## Install python package dependencies (virtual enviornment)

`pipenv install`

## Run localhost for development

`pipenv shell` to enter virtual enviornment
`python manage.py runserver` <br />
Now reachable at http://localhost:8000/

## Run tests

`python manage.py test`<br />
**Note**: must be in virtual enviornment

## Database

### Load database dummy data for development (fixtures)

Loads the data for a database model using a fixtures JSON file with a corresponding name located in the 'fixtures' folder. <br />
`python manage.py loaddata <model_name>`<br />
**Note**: must be in virtual enviornment <br />
**Note**: Dependent models must be loaded last, correct order of all models listed below

1. `python manage.py loaddata users`<br />
2. `python manage.py loaddata exercise`<br />
3. `python manage.py loaddata workout`<br />
4. `python manage.py loaddata workoutexercise`<br />
5. `python manage.py loaddata info`<br />
