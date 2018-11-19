# Instructions for running this server locally

1) Install [NodeJS](https://nodejs.org/)

2) Install AngularCLI

~~~bash
npm install @angular/cli@latest -g
~~~

3) Install nodemon

~~~bash
npm install -g nodemon
~~~

4) Download or clone this repository

5) Open the NodeJS Terminal. Run 

~~~bash
npm install
~~~

 to add the needed files into the node_modules folder

6) Start the MongoDB server

[Install MongoDB](https://www.mongodb.com/download-center?jmp=nav#community).
Create the folder structure

~~~bash
C:\data\db\
~~~

To start the MongDB server, open up a new terminal and run the following. The path will look something like this but may look different depending on version number and where you installed files (these commands are for windows powershell)

~~~bash
"C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe"
~~~

To connect to the MongoDB server, open up another terminal and run the following (these commands are for windows powershell)

~~~bash
"C:\Program Files\MongoDB\Server\3.4\bin\mongo.exe"
~~~

In the terminal where you have connected to the server, run

~~~bash
use lazywebapp
db.createUser ({user:'lazywebapp',pwd:'password', roles:[{role:'dbAdmin', db:'lazywebapp'}]})
~~~

7) In the project, create a new file called '.env' and copy the contents of the file '.env.example' which can be found in the lazy web app project.

8) Run the following command to have the Angular built and server restarted when code changes

~~~bash
npm run dev
~~~

9) Open [localhost:4200](http://localhost:4200/) or [localhost:3000](http://localhost:3000/) in your browser. You should see a basic Angular app displayed. You are now running a local server.

## Using step-by-step running

Alternatively, instead of using 'npm run dev' you can run your project this way

1) In your project (lazywebapp) terminal, run

~~~bash
ng build
~~~

to compile the Angular front-end components into the `dist` folder

8) Then run

~~~bash
node server.js
~~~

# Instructions for running this server on Google App Engine

After doing the above:

1) [Set up Google Cloud Platform](https://cloud.google.com/)

2) Create a new project

![Create a project](/readme/img/gcp12.png)

3) Name the project

![Name the project](/readme/img/gcp3.png)

4) Make sure the project is selected

![Select the project](/readme/img/gcp4.png)

5) Install the [Google Cloud SDK](https://cloud.google.com/sdk/)

6) Run the following command and create a new configuration. It can have any name.

~~~bash
gcloud init
~~~

7) Log in to your Google account

8) Select the project that you created above

9) Select the region

10) Choose a region that the server will be hosted in

~~~bash
gcloud config set compute/region us-central1
~~~

11) Run the following commands

~~~bash
ng build --prod
gcloud app deploy
~~~

12) Wait for the app to deploy.

13) Visit the address that is displayed when the deploy command finishes.

~~~bash
Deployed service [default] to [https://test-project-197703.appspot.com]
~~~

# Instructions for setting up SendGrid emails

1) Go to
  [this page](https://app.sendgrid.com/guide/integrate/langs/nodejs),
  do NOT follow the instructions.

2) Add the SendGrid API key to the .env file

3) Click "I've integrated the code above." and Click "Verifiy integration".

4) Comment out the `#SENDGRID_VERIFICATION` section of the at the top of the
  `email.service.js` file.

5) Start the server in development mode in order to send an email and verify 
  that the installation works.

6) COMMENT OUT THE `#SENDGRID_VERIFICATION` again!

# Disused notes about using ng-pwa-tools

// npm install --save ng-pwa-tools not actually used in this process
// Note: there are errors indicating missing peer dependencies. At this point, we are ignoring the errors.

### Add the tool to the npm scripts
Add the following to package.json in the `scripts` array.
~~~
// "ngu-sw-manifest": "node ./node_modules/ng-pwa-tools/bin/ngu-sw-manifest.js" 
~~~


npm run ngu-sw-manifest --module src/app/app.module.ts --out dist/ngsw-manifest.json

The `ngu-sw-manifest` command goes through the router in Angular, and copies all the routes, and uses it to generate a `ngsw-manifest.json` file.

# If you don't have Bash
NOTE: If the above doesn't work and you're on Windows, it is probably because you are not using bash. More recent versions of Windows contain bash, just press the Windows key, type `Windows Features`, then select `Windows Subsystem for Linux`. Restart, then install Ubuntu form the Microsoft Store. When Ubuntu is setup, run, from the command line 
~~~
bash
~~~ 

More information on how to do this [here](https://www.howtogeek.com/249966/how-to-install-and-use-the-linux-bash-shell-on-windows-10/).

ngu-app-shell --module src/app/app.module.ts --url /loading --insert-module src/app/loading/module.ts





# NOTE: the below information was created as part of the 'ng build' process 

# LazyWebApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
