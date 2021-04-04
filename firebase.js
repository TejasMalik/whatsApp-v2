import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyCpqY01rNDxb0qZLLXoQa9p1BG4s4vqQM0",
    authDomain: "whatsapp-v2-1afee.firebaseapp.com",
    projectId: "whatsapp-v2-1afee",
    storageBucket: "whatsapp-v2-1afee.appspot.com",
    messagingSenderId: "494793998015",
    appId: "1:494793998015:web:8d110f18e7fa7d9bc3900a"
};

const app = !firebase.apps.length
    ? firebase.initializeApp(firebaseConfig)
    : firebase.app()

const db = app.firestore()
const auth = app.auth()

const provider = new firebase.auth.GoogleAuthProvider()

export { db, auth, provider }