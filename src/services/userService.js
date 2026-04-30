import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const profile = snap.exists() ? snap.data() : null;

  return {
    nickname: profile?.nickname || user.email?.split("@")[0] || "User",
    email: user.email || "",
    role: String(profile?.role || "user").trim().toLowerCase(),
  };
}

export function persistUserSession(profile) {
  localStorage.setItem("lander_auth", "1");
  localStorage.setItem("lander_nickname", profile.nickname);
  localStorage.setItem(
    "lander_user",
    JSON.stringify({
      nickname: profile.nickname,
      email: profile.email || "",
      role: profile.role || "user",
    })
  );
}

export function clearUserSession() {
  localStorage.removeItem("lander_user");
  localStorage.removeItem("lander_nickname");
  localStorage.setItem("lander_auth", "0");
}
