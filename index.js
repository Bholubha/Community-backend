const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());

// Define a route for the /v1/role endpoint
app.post('/v1/role', (req, res) => {
  // Retrieve role data from the request body
  const { name } = req.body.content.data;

  // Check if the name is provided
  if (!name) {
    console.log(name)
    return res.status(400).json({ error: 'Name is required for creating a role.' });
  }

  // Simulate creating a role (you would typically store it in a database)
  const createdRole = { id: 1, name };

  // Respond with the created role
  res.status(201).json(createdRole);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});