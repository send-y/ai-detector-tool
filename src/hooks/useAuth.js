import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { signInUser, signOutUser, signUpUser } from "../services/authService";
import {
  clearUserSession,
  getUserProfile,
  persistUserSession,
} from "../services/userService";

const emptyProfile = {
  nickname: "User",
  role: "user",
  email: "",
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setProfile(emptyProfile);
        clearUserSession();
        setTimeout(() => setLoading(false), 1200);
        return;
      }

      try {
        const nextProfile = await getUserProfile(user);
        setCurrentUser(user);
        setProfile(nextProfile);
        persistUserSession(nextProfile);
      } catch (err) {
        console.error("Ошибка чтения профиля:", err);
        const fallbackProfile = {
          nickname: user.email?.split("@")[0] || "User",
          email: user.email || "",
          role: "user",
        };
        setCurrentUser(user);
        setProfile(fallbackProfile);
        persistUserSession(fallbackProfile);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return {
    currentUser,
    loading,
    isLoggedIn: Boolean(currentUser),
    userName: profile.nickname,
    userRole: profile.role,
    signIn: signInUser,
    signUp: signUpUser,
    logout: signOutUser,
  };
}
