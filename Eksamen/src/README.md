# Skooba - Training application with selective and suggestive workouts.

## Local development

See the READMEs in respective folders, "backend" and "frontend", for instructions and dependencies to successfully run them. <br />
If both backend and frontend are running, they communicate without any further setup.

## Local development using Docker

### Dependencies:

1. Docker: https://docs.docker.com/engine/install/

### Run local development

`sudo docker compose up`

### Notes:

- Currently only for local development, not deployment
- Hot reload is supported for both backend and frontend
- Could break when installing new pnpm packages, solution below:
  1. "sudo docker compose down"
  2. "sudo docker compose up --build"
