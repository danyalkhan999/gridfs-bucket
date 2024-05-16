const express = require('express');
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');
const fs = require('fs');

const app = express();

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Adjust 'uploads/' as needed

// Replace with your MongoDB connection URI
const uri = "mongodb://localhost/";
const dbName = "upload-test";
const collectionName = "fs"; // GridFS collection name

async function uploadToGridFS(file, metadata) {
  const client = await MongoClient.connect(uri);
  try {
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: collectionName });

    const uploadStream = bucket.openUploadStream(file.originalname, { metadata });
    const fileStream = fs.createReadStream(file.path); // Use file path for file system storage

    const uploadPromise = new Promise((resolve, reject) => {
      fileStream.pipe(uploadStream)
        .on('error', (err) => {
          reject(err);
          client.close();
        })
        .on('finish', () => {
          resolve(uploadStream.id);
          client.close();
        });
    });

    return uploadPromise;
  } catch (error) {
    client.close();
    throw error;
  }
}

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
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

app.listen(3000, () => console.log('Server listening on port 3000'));
