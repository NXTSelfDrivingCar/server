# Server - Basic configuration

## Structure:

Each point of the server should be named a **node**. Space for each node should be reserved as a Docker container.

- [Receiver](#receiver) - Controls intake of information
- [Router](#router) - Routes information to required nodes
- [Database](#database---dbmd) - Stores user and NXT information
- [NXT_App](#nxt_app) - Artificial inteligence
- [REST API](#rest-api) - Web site

## Receiver:

- Receiver maintains intakes of unstructured data
- Responsible for taking and structuring data for a router
- Data taken can be:
  - **Intake stream**
  - **HTTP Request**
- Receiver should _not_ work between **NXT App** and **Router** (for speed benefits)
- _If neccessary_, receiver can be placed even between NXT App and the Router
- Receiver should have an object for each type of data that is to be received
  - CoordStream
  - VideoStream
  - HTTPRequest (Use Python flask?) ...
- Receiver could have a python flask app for _receiving_ requests

## Router:

- Router should provide a filter for objects based on category and call a required node
- Also responsible for the **communication between NXT App and NXT Robot** (If prooven better)
- Router could have a python flask app for _sending_ requests
- Responsible for puling docker containers

## Database - _db.md_:

## NXT_App:

## Rest API:

- Used for user interaction with the NXT
- Requests API data (Stream information) from the server
