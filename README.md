<h1>Group Chat Application</h1>
This project is a web-based messaging platform that allows users to communicate in real-time. It uses a three-tier architecture, consisting of the client, server, and database. The client-side is implemented using HTML, CSS, and JavaScript, while the server-side is built using Node.js, Express, Socket.io, and Sequelize as the ORM. The database is a MySQL database.

## Demo:
![ProjectDemo](https://drive.google.com/file/d/1F4J2TbbakKk7sqhiUQIV95hAEybNNtV4/view?usp=share_link)

## Installation

1.  Clone the repository
2.  Install the dependencies by running:
           npm install
3.  Create a .env file in the root directory and add the following variables:
            PORT=PORT
            DATABASE=database_name
            HOST=database_host
            USER=database_user
            PASSWORD=database_password
            JWT_SECRETKEY=Your_secret_key
4.  Run the app using:
            npm start or npm run dev.

## Usage

### User registration

1.  Navigate to the registration page.
2.  Enter your information in the form.
3.  Submit the form.
4.  The server will validate the user's information, create a new user in the database, and return a response to the client.

### User login

1.  Navigate to the login page.
2.  Enter your credentials in the form.
3.  Submit the form.
4.  The server will validate the user's credentials, create a JSON Web Token, and return a response to the client.

### Sending messages

1.  Select the group you want to chat in.
2.  Enter your message in the chat box.
3.  Submit the form.
4.  The server will validate the request, add the message to the database, and broadcast the message to all connected clients.

## Conclusion

This Group Chat Application is designed with scalability, security, and ease of maintenance in mind. Its architecture, consisting of a client, server, and database, ensures efficient communication between the client and the server. The use of Node.js, Sequelize, and WebSockets provide fast and efficient communication, while the use of MySQL and Sequelize ensure that the system is able to handle large amounts of data.
