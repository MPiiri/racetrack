# racetrack info-screens 2

## Overview

A real-time system to manage a local racetrack.

The system enables to control races and inform spectators so that everyone has the information they need, exactly when they need it.

All displays and interfaces react in real time to the inputs by various employees and expiring timers. For example, when the race mode is changed, the flag displays must change in real time. The displays and interfaces must not rely on polling. The interfaces can make API calls only to establish a real-time connection, but must send all data as real-time messages.
Your application is not required to persist any information. I.e. if the server restarts, all data is lost. This is an MVP.

System is developed using the following technologies:

- Node.JS v12.22.9
- express.js v4.21.2
- socket.io v4.8.1

// vue.js, mongoDB

## Setup and installation

Have Node installed https://nodejs.org/en/download.

Download repository

```shell
git clone https://gitea.kood.tech/matthiaspiiri/racetrack.git
```

Install dependencies

```shell
npm install
```

Run the app with

```shell
npm start
```

The app can be accessed at
http://localhost:3000/

When your server is run with npm run dev, the timer lasts for 1 minute instead of 10 minutes

Your application is not required to persist any information. I.e. if the server restarts, all data is lost. This is an MVP.

## User Guide

Here be user guide.
#   r a c e t r a c k  
 