# nodejs-calendar
Requirements-
Nodejs
Mongodb

How To Start-
npm install to download all node modules.
npm start or node server.js to start the server.

index.html -> login and register page of the application
events.html -> the calendar page of the applicatin where you can view all events and also add new events.

Use cases->
  User login and registration.
  Add event->
    Basic details of event.
    Event type->
      busy - calendar blocked for the duration
      free - calendar left free for the duration
    Event Time Type->
      All Day - all day event
      time - events which have start and end time.
    *All Day event cannot be a busy type event.
    Repeat event->
      any event can be repeated for a max of 10 times for any day durations.
      These can be busy typed.
    Add Participants->
      add multiple participants to an event.
      This will block their calendars as well in case of busy events.
  View Event->
    view next 10 events in your calendar.
    search events based on title and note.Exact mactch only.
      
** Add Participants and Repeat Events are not included in the Ui but are part of the same api.

Api Structure->
*** All the api's except login and register require access tokes as a header or body parameter.
register (POST)->
    input- 
      name - String,
      email - String,
      password - String
    Output-
      {
        "message": "User created Successfully",
        "success": true
      }
login (POST)->
      input-
        email- String,
        password- String
      output- 
        {
            "success": true,
            "message": "Successfully login",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTQwMjZkNGYxMWJhZjM0Y2E5ODRkNmEiLCJlbWFpbCI6ImFiY0BnbWFpbC5jb20iLCJpYXQiOjE1MTQxNTgzMzMsImV4cCI6MTUxNDI0NDczM30.gdKI8iIkZEgLAWpUciuBzYo0L88x46ezY61oyaL2MH4",
            "userid": "5a4026d4f11baf34ca984d6a"
        }
      
createEvent (POST)->
      input-
        {
          "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTQwMjZkNGYxMWJhZjM0Y2E5ODRkNmEiLCJlbWFpbCI6ImFiY0BnbWFpbC5jb20iLCJpYXQiOjE1MTQxNTgzMzMsImV4cCI6MTUxNDI0NDczM30.gdKI8iIkZEgLAWpUciuBzYo0L88x46ezY61oyaL2MH4",
          "title":"Prashant",
          "color":"red",
          "note":"asdasdasdsad",
          "category":"abcd",
          "timeType": "time",
          "startTime":909,//Date in millis
          "endTime":910,//Date in millis
          "participants":[],//Array of Strings
          "date":"2017-12-28T00:00:00.000Z",//Date formated string or date object
          "type": "busy",
          "repeatTimes": 2,
          "repeatDuration": 1
          }
        output-
        {"message":"Event cannot be added!! participant abc@gmail.com is busy in the time slot","success":false}
        {"message":"Created successfully","success":true}

viewEvents (GET) ->
        input-
          no input params req
        output-
        {
              "message": "Data fetched",
              "data": [
                  {
                      "_id": "5a3f9ffdae13a30640167a2e",
                      "date": "1970-01-01T00:00:00.123Z",
                      "user": "prashant.gupta1194@gmail.com",
                      "endTime": 20,
                      "startTime": 10,
                      "category": "abcd",
                      "note": "asdasdasdsad",
                      "color": "red",
                      "title": "Prashant",
                      "timeType": "time",
                      "__v": 0
                  }
                   ],
              "success": true
          }

searchEvents (GET)->
      input-
        toMatch -> parameter String
      output-
        {
              "message": "Data fetched",
              "data": [
                  {
                      "_id": "5a3f9ffdae13a30640167a2e",
                      "date": "1970-01-01T00:00:00.123Z",
                      "user": "prashant.gupta1194@gmail.com",
                      "endTime": 20,
                      "startTime": 10,
                      "category": "abcd",
                      "note": "asdasdasdsad",
                      "color": "red",
                      "title": "Prashant",
                      "timeType": "time",
                      "__v": 0
                  }
                   ],
              "success": true
          }
  

