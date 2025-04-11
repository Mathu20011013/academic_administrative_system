import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCUv6Nni4tKMIvyHNvZHQwM2DiIaJ6mhYI",
    authDomain: "sdp-aas.firebaseapp.com",
    projectId: "sdp-aas",
    storageBucket: "sdp-aas.firebasestorage.app",
    messagingSenderId: "869539778247",
    appId: "1:869539778247:web:e5d6dd89049962bbc0b8e2",
    measurementId: "G-Y54Y74M6JH"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
