const express = require('express');
const multer = require('multer');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');

const app = express();

// Configure Multer for storage and file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Adjust 'uploads/' as needed

// Replace with your MongoDB connection URI
const uri = "mongodb://localhost/";
const dbName = "upload-test";
const collectionName = "fs"; // GridFS collection name

async function connectToDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

async function closeDatabaseConnection(client) {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Failed to close MongoDB connection", error);
  }
}

async function uploadToGridFS(file, metadata) {
  const client = await connectToDatabase();
  try {
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    const uploadStream = bucket.openUploadStream(file.originalname, { metadata });
    const bufferStream = require('stream').Readable.from(file.buffer);

    const uploadPromise = new Promise((resolve, reject) => {
      bufferStream.pipe(uploadStream)
        .on('error', (err) => {
          reject(err);
          closeDatabaseConnection(client); // Close connection on error
        })
        .on('finish', () => {
          resolve(uploadStream.id);
          closeDatabaseConnection(client); // Close connection on finish
        });
    });

    return uploadPromise;
  } catch (error) {
    closeDatabaseConnection(client); // Ensure connection is closed on catch
    throw error;
  }
}

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log("file", req.file);

  console.log("body", req.body);
  try {
    if (!req.file) {
      throw new Error('No file uploaded'); // Handle missing file
    }
    const fileId = await uploadToGridFS(req.file, req.body); // Access additional data from req.body
    res.json({ message: 'File uploaded successfully!', fileId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// get all files
app.get('/files', async (req, res) => {
  const client = await connectToDatabase();
  try {
    const db = client.db(dbName);
    const filesCollection = db.collection(`${collectionName}.files`);
    const files = await filesCollection.find().toArray();
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching files' });
  } finally {
    client.close();
  }
});


// route to get files by id
app.get('/files/:id', async (req, res) => {
  const client = await connectToDatabase();
  try {
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: collectionName });
    const id = new ObjectId(req.params.id);

    const downloadStream = bucket.openDownloadStream(id);

    downloadStream.on('error', (err) => {
      console.error(err);
      res.status(404).json({ message: 'File not found' });
      client.close();
    });

    downloadStream.on('file', (file) => {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    });

    downloadStream.on('end', () => {
      client.close();
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching file' });
    client.close();
  }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
