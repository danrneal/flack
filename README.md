# Project 2

Web Programming with Python and JavaScript

## Description

This flask-based chat app uses socketIO to allow messages to be shown in real time without a page refresh.

## What is in each file

* application.py
    * Contains all the server-side Flask logic that the web application needs.
    * Handles each route and redirects users to the appropriate page or renders the appropriate template.
    * Handles checking if a channel name already exists for form validation
    * Handles making updates when socketIO receives an event and then sending out another event when the update is complete.
* .gitignore
    * Tells git which files to ignore when submitting.
    * Useful for setting up a virtual environment.
    * Also useful for ignoring a .env file holding environmental variables.
* requirements.txt
    * Holds the app's dependencies.
    * Added python-dotenv (to handle using a .env file) and requests (to handle the api calls)
* templates/index.html
    * Contains all the html for this single-page app.
    * Displays an non-dismissable modal for users to choose a display name.
    * Displays a modal for users to specify a channel name when creating a channel.
    * Displays a channel list which is contained in a sidebar; the sidebar is collapsible on mobile.
    * Displays a list of previously sent messages in an infinite scroll.
    * Allows users to send new messages.
    * Allows users to dismiss and delete their own messages.
* static/css/styles.css
    * Contains all the styling for the page.
    * Set up the animation for when messages get dismissed or deleted.
    * On small (mobile) screen, the sidebar becomes collapsible.
    * On small (mobile) screen, the button to delete your message is always visible instead of just on hover.
* static/js/index.js
    * Contains all the client-side logic for the web application.
    * Handles form validation with bootstrap validation.
    * Handles all bootstrap styling changes from clicks or other actions.
    * Handles sending and receiving events from socketIO to update the page in real time without refresh.
    * Uses handlebars to create new messages.
    * Handles the logic for the infinite scrolling of messages.
    * Handles setting the url and letting the back button work.
    * Sets the display name and caches the channel name and stores them in localStorage.
