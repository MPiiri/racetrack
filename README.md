# racetrack info-screens

## Overview

A real-time system to manage a local racetrack.

The system enables to control races and inform spectators so that everyone has the information they need, exactly when they need it.

All displays and interfaces react in real time to the inputs by various employees and expiring timers. For example, when the race mode is changed, the flag displays must change in real time. The displays and interfaces must not rely on polling. The interfaces can make API calls only to establish a real-time connection, but must send all data as real-time messages.
Your application is not required to persist any information. I.e. if the server restarts, all data is lost. This is an MVP.

System is developed using the following technologies:

- Node.JS v12.22.9
- express.js v4.21.2
- socket.io v4.8.1
- mongoDB

## Setup and installation

Have Node installed [https://nodejs.org/en/download](https://nodejs.org/en/download).

Download repository

```shell
git clone https://gitea.kood.tech/matthiaspiiri/racetrack.git
```

Install dependencies

```shell
npm install
```

Set up `.env`

Set the passwords for users

Set the mongo db uri-s.

To create a mongo db [https://www.mongodb.com/](https://www.mongodb.com/)

```RECEPTIONIST_PASSWORD=rec123
RECEPTIONIST_PASSWORD=rec123
LAP_LINE_OBSERVER_PASSWORD=lap123
SAFETY_OFFICIAL_PASSWORD=safe123
MONGO_URI=
DEV_MONGO_URI=
```

Run the app with

```shell
npm start
```

The app can be accessed at
[http://localhost:3000/](http://localhost:3000/)

When your server is run with npm run dev, the timer lasts for 1 minute instead of 10 minutes


## Beachside Racetrack App - User Guide

### Introduction

The Beachside Racetrack App is designed to help racetrack staff manage race sessions, drivers, and lap times in real time. This guide provides step-by-step instructions on how to use the app efficiently.

### User Roles

* **Receptionist**: Manages upcoming races, registers drivers, and assigns cars.
* **Race Control**: Oversees active race sessions, starts/stops races, and monitors race progress.
* **Lap-line Observer**: Records lap times and ensures accuracy.
* **Spectators**: View race information on info screens.
  * Leaderboard: displays the current race leaderboard
  * Next Race: displays the next race and automatically calls the next race drivers to cars
  * Race Flag: displays the race flag (safe, hazard, danger, finish)

### Getting Started

1. **Open the App**: Launch the Beachside Racetrack web application in a supported browser at [http://localhost:3000/](http://localhost:3000/).
2. **Navigate the Dashboard**: Select your role to access relevant features.
3. **Log In (if required)**: Enter your credentials to access the system.

### Receptionist Features

#### Managing Race Sessions

* **View Race Sessions**: The main screen displays created races.
* **Create a New Session**:
  1. Click "Create New Race Session."
  2. Enter session details (status, drivers, cars).
  3. Click "Save."
* **Edit/Delete Sessions**:
  * Click on a session action button and update details or delete it.

#### Registering Drivers

1. Navigate to the "Add Drivers" section.
2. Add a new driver by entering name and selecting a car.
3. Assign the driver to a session.

### Race Control Features

#### Managing Active Races

* **Start a Race**:
  1. Ensure a session is set as "current."
  2. Click "Start Race." The timer begins.
* **Change Race Mode**:
  * Modes: "Safe," "Danger," "Finish."
  * Click mode buttons and select the desired mode.
  * The system updates Race Flag view automatically based on modes.
* **Finish a Race**:
  * Click "Finish Race" to end timing and finalize results.
  * 
* **End a Session**:
  * Click "End Session" to reset and prepare for the next race.

### Lap-line Observer Features

#### Recording Lap Times

* **Manually Add Lap Time**:
  * Click on a car's number to register lap-line crossing.
* **Automatic Updates**:
  * The system updates fastest laps and rankings automatically in the Leaderboard view.

#### Troubleshooting

* **Missing Lap Times**:
  * Ensure drivers are assigned correctly.
  * Refresh the session data.
* **Session Not Updating**:
  * Check internet connection.
  * Restart the app and reload data.

## Support

For further assistance, contact the racetrack IT team.
