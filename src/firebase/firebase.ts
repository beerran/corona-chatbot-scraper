import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

let db = admin.firestore();

export module FirebaseApp {
    export const database = db;
}