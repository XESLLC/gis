### Gridics Engineering Exercises
---
#### General
#### Code Writing Exercise
#### Component Design Exercise
#### Database Modeling & SQL Exercise
---

#### General
The three exercises above, 'Code Writing', 'Component Design' and 'Database Modeling & SQL Exercise' are completed in this node app.

To run the solutions, copy this app to a directory of your choosing.


#### Code Writing Exercise
In your terminal, navigate to the root directory and enter the following on the command line:

node index

This will run the entire javascript file 'index.js'.
It will log results to your console, including:
'Number of Parcels:  1000'
'Average Parcel Size:  8802.0090703125'


#### Component Design Exercise
In your terminal, navigate to the root directory and run the following on the command line:

node spreadsheet

This will run the entire javascript file 'spreadsheet.js'.
It will log results to your console which includes:

a1 7
a2 3
a3 5
a4 15
changed a1 5
changed a4 13
x2 changed a1 3
x2 changed a4 8

Please note, the last two output lines were not requested in the exercise, but are used to confirm functionality


#### Database Modeling & SQL Exercise

The solution to this exercise uses node and express run a local server on port 4000 which makes queries to a postgres database. Please load the following node packages to run this exercise:

"cors": "^2.8.5",
"express": "^4.17.1",
"pg": "^8.5.1",
"sequelize": "^6.4.0"

Typing 'npm install' from the command line of this apps root directory should load these packages.

This exercise uses two API's.

The first API populates the example Gridics Engineering record (https://docs.google.com/spreadsheets/d/1uGUfjQr2lDzd8gzriEoibCdLDIrMbwCnp3fEkfa7Gs0/edit#gid=1491966258) into tables. The second API computes the reference implementation calculations.

To help you can import this linked postman collection (https://www.getpostman.com/collections/a897e64a7ea26d274f06).

Using postgres documents, and start a postgres V11 database on your local computer with the following settings:
name: gisDb
port: 5432
owner: postgres

In your terminal, navigate to the root directory and run the following on the command line:

node databaseModeling

This will spin up a local server on port 4000 and initialize your database - setup tables.

Using a tool to send REST http requests, e.g, POSTMAN (https://www.postman.com/) send a post request to the following address:

localhost:4000/createLandParcelZoneAndZoneRule

Include 'key value' Parcel and Zonning Rules data in the headers. See example data here:

area: 5000
width: 50
length: 100
max_num_of_levels: 2
max_lot_coverage: 60
front_set_back: 10
side_set_back: 5
rear_set_back: 8
far: 0.75
density: 48
min_unit_size: 1200
min_res_parking: 1.5

The return value of this post will be the ID of the parcel instance saved in the postgres database.

Using the ID returned above, make get request to the following address.

localhost:4000/CalcMaxDevCapAllowed

Include 'key value' Parcel and Calculation data in the headers. See example data here:

id: 4d8b5f28-fc36-48e2-b206-f7539ddfb38d
residential_density: do_not_round
lodging_density: do_not_round

Values for keys 'residential_density' and 'lodging_density' can be the following:

'round_up'
'round_down'
'round'
'do_not_round'

The API will log and return calculation results and related descriptions to your console.
