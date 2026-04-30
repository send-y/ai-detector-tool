export function prettyAuthError(err, language = "en") {
  const code = err?.code || "";
  const isEn = language === "en";

  if (code === "auth/user-not-found") {
    return isEn ? "User not found" : "Користувача не знайдено";
  }

  if (code === "auth/wrong-password") {
    return isEn ? "Incorrect password" : "Неправильно вказаний пароль";
  }

  if (code === "auth/invalid-credential") {
    return isEn
      ? "Incorrect email or password"
      : "Неправильно вказано email або пароль";
  }

  if (code === "auth/invalid-email") {
    return isEn ? "Invalid email format" : "Неправильний формат email";
  }

  if (code === "auth/email-already-in-use") {
    return isEn ? "This email is already in use" : "Цей email вже використовується";
  }

  if (code === "auth/weak-password") {
    return isEn
      ? "Password must be at least 6 characters"
      : "Пароль має містити щонайменше 6 символів";
  }

  if (code === "auth/too-many-requests") {
    return isEn
      ? "Too many attempts. Try again later"
      : "Занадто багато спроб. Спробуйте пізніше";
  }

  if (code === "auth/operation-not-allowed") {
    return isEn
      ? "Email/Password sign-in is not enabled in Firebase"
      : "У Firebase не увімкнено вхід через Email/Password";
  }

  return isEn ? "Authorization error" : "Помилка авторизації";
}
