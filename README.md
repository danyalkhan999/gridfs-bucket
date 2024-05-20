# Express-MongoDB-File-Upload

Express-MongoDB-File-Upload is a simple Node.js application for uploading files to MongoDB GridFS using Express and Multer middleware.

## Getting Started

To get started with this project, follow the instructions below.

### Prerequisites

Make sure you have the following installed on your system:

- Node.js
- MongoDB

### Installation

1. Clone the repository:

git clone 
https://github.com/danyalkhan999/gridfs-bucket

2. Navigate to the project directory:

cd express-mongodb-file-upload


4. Start the server:

npm start


By default, the server will start on port 3000. You can change the port in the `app.js` file if needed.

### Usage

1. Upload a file:

Send a POST request to `/upload` endpoint with a file attached as form data. Use the key `file` to upload the file.

2. Get all files:

Send a GET request to `/files` endpoint to retrieve metadata for all uploaded files.

3. Get a specific file:

Send a GET request to `/files/:id` endpoint, replacing `:id` with the file ID, to download a specific file.

## Built With

- Express - Web framework for Node.js
- Multer - Middleware for handling multipart/form-data
- MongoDB - NoSQL database
- GridFS - MongoDB specification for storing and retrieving large files
- Mongoose - MongoDB object modeling tool
- Node.js - JavaScript runtime environment

## Authors
[Danyal Khan](https://github.com/danyalkhan999)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
