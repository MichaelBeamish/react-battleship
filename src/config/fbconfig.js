import firebase from "firebase/app"; //Importing just the base features from firebase.
import "firebase/firestore"; //Importing the database from firebase.
import "firebase/auth"; //Importing auth abilities from firebase.

// Initialize Firebase
//npm i firebase
var config = {
  apiKey: "AIzaSyD7qFSAbO3KTA6wEjwBHXYUGdaFcJACYps",
  authDomain: "battleship-57b30.firebaseapp.com",
  databaseURL: "https://battleship-57b30.firebaseio.com",
  projectId: "battleship-57b30",
  storageBucket: "battleship-57b30.appspot.com",
  messagingSenderId: "858555747586"
};
firebase.initializeApp(config);
firebase.firestore().settings({ timestampsInSnapshots: true }); //Update to handle timestamps.

export default firebase; //Make it available elsewhere in the app.
