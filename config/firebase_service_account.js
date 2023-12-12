var admin = require('firebase-admin');
var serviceAccount = require("../api/services/bestjobs-c03c7-firebase-adminsdk-ov5nw-bbf344705e.json");

admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bestjobs-c03c7-default-rtdb.firebaseio.com/"
  }
);
