import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCguj1eDGdctoWCoJl8cJStrAs4UVfmQYw',
  authDomain: 'codevault-dc8ac.firebaseapp.com',
  projectId: 'codevault-dc8ac',
  storageBucket: 'codevault-dc8ac.firebasestorage.app',
  messagingSenderId: '692689628979',
  appId: '1:692689628979:web:968d3c5c10ae401a86d846',
  measurementId: 'G-DMJ474ZC07',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
