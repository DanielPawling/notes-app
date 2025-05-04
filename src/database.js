const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/notes-db-app')
    .then(() => console.log('DB is connected'))
    .catch(err => console.error(err));