const { google } = require('googleapis');
const keyFile = './config/googleAuth.json';

const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
    version: 'v3',
    auth,
});

module.exports={drive};