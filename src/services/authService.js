import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export async function signInUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpUser(nickname, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    nickname,
    email,
    role: "user",
    createdAt: serverTimestamp(),
  });

  return cred;
}

export async function signOutUser() {
  return signOut(auth);
}
