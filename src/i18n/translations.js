export function getAppTranslations(language = "en") {
  const isEn = language === "en";

  return {
    signIn: isEn ? "Sign In" : "Увійти",
    signUp: isEn ? "Sign Up" : "Реєстрація",
    welcomeTitle: isEn ? "Welcome to LANDER" : "Ласкаво просимо до LANDER",
    welcomeSub: isEn
      ? "Sign in to save your uploads and access them from anywhere"
      : "Увійдіть, щоб зберігати завантаження та мати доступ до них звідусіль",
    authMode: isEn ? "Auth mode" : "Режим авторизації",
    nickname: isEn ? "Nickname" : "Нікнейм",
    email: isEn ? "Email" : "Електронна пошта",
    password: isEn ? "Password" : "Пароль",
    enterEmail: isEn ? "Enter your email" : "Введіть вашу пошту",
    enterPassword: isEn ? "Enter your password" : "Введіть ваш пароль",
    createPassword: isEn ? "Create a password" : "Створіть пароль",
    enterNickname: isEn ? "Enter your nickname" : "Введіть ваш нікнейм",
    historyTitle: isEn ? "Analysis History" : "Історія аналізів",
    historyEmpty: isEn ? "No analyses yet" : "Поки немає аналізів",
    lastAnalysis: isEn ? "Latest analysis" : "Останній аналіз",
    itemsCount: (count) => (isEn ? `${count} items` : `${count} шт.`),
    adminPanel: isEn ? "Admin Panel(test)" : "Адмін-панель(test)",
    logout: isEn ? "Log Out" : "Вийти",
    historyModalTitle: isEn ? "Analysis History" : "Історія аналізів",
    historyModalSub: isEn
      ? "Your recent image verification results"
      : "Ваші останні результати перевірки зображень",
    photosCount: (count) => (isEn ? `${count} photos` : `${count} фото`),
    loginRequired: isEn ? "Sign in required" : "Потрібен вхід",
    loginRequiredSub: isEn
      ? "Sign in to your account to start image analysis"
      : "Увійдіть в акаунт, щоб почати аналіз зображень",
    loginAction: isEn ? "Sign In" : "Увійти",
    loading: isEn ? "Loading..." : "Завантаження...",
    close: isEn ? "Close" : "Закрити",
    result: isEn ? "Result" : "Результат",
    probability: isEn ? "Probability" : "Ймовірність",
    ai: isEn ? "AI" : "ШІ",
    real: isEn ? "Real" : "Справжнє",
    aiGeneratedImage: isEn ? "AI-generated image" : "Зображення, згенероване ШІ",
    realPhoto: isEn ? "Real photo" : "Справжнє фото",
    administrator: "Administrator",
    member: "Member",
    administratorAccess: "Administrator access",
    yourProfile: "Your LANDER profile",
    fillAllFields: isEn ? "Please fill in all fields" : "Будь ласка, заповніть усі поля",
    enterEmailAndPassword: isEn
      ? "Please enter email and password"
      : "Будь ласка, введіть email і пароль",
  };
}

export function getDragDropTranslations(language = "en") {
  const isUk = language === "uk";

  return {
    unauthorized: isUk ? "Користувач не авторизований" : "User is not authorized",
    analysisServerError: isUk ? "Помилка сервера аналізу" : "Analysis server error",
    analyzeFailed: isUk ? "Не вдалося виконати аналіз" : "Failed to analyze image",
    feedbackSaveFailed: isUk ? "Не вдалося зберегти відповідь" : "Failed to save response",
    lastAnalysisNotFound: isUk ? "Не знайдено ID останнього аналізу" : "Latest analysis ID not found",
    dropText: isUk
      ? "Перетягни фото сюди або натисни для вибору"
      : "Drop a photo here or click to choose",
    fileTypes: isUk ? "JPG, PNG, WEBP — до 10MB" : "JPG, PNG, WEBP — up to 10MB",
    analyzing: isUk ? "Analyzing image..." : "Analyzing image...",
    aiProbability: isUk ? "Ймовірність ШІ" : "AI probability",
    real: "Real",
    ai: "AI",
    metricsTitle: isUk ? "Детальні метрики" : "Detailed metrics",
    checkAnotherPhoto: isUk ? "Перевірити інше фото" : "Check another photo",
    close: isUk ? "Закрити" : "Close",
    feedbackTitle: isUk
      ? "Сайт показав правильний результат?"
      : "Did the site return the correct result?",
    feedbackText: isUk
      ? "Це допоможе покращити точність аналізів."
      : "This will help improve analysis accuracy.",
    yesCorrect: isUk ? "Так, правильно" : "Yes, correct",
    noMistake: isUk ? "Ні, помилка" : "No, mistake",
    aiGenerated: isUk ? "Згенеровано ШІ" : "AI-generated",
    realPhoto: isUk ? "Справжнє фото" : "Real photo",
  };
}
