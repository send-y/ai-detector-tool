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
    unsupportedFileType: isUk ? "Непідтримуваний формат зображення" : "Unsupported image format",
    fileTooLarge: (maxMb) =>
      isUk
        ? `Файл завеликий. Максимум ${maxMb}MB`
        : `File is too large. Maximum ${maxMb}MB`,
    feedbackSaveFailed: isUk ? "Не вдалося зберегти відповідь" : "Failed to save response",
    lastAnalysisNotFound: isUk ? "Не знайдено ID останнього аналізу" : "Latest analysis ID not found",
    dropText: isUk
      ? "Перетягни фото сюди або натисни для вибору"
      : "Drop a photo here or click to choose",
    fileTypes: isUk ? "JPG, PNG, WEBP — до 10MB" : "JPG, PNG, WEBP — up to 10MB",
    analyzing: isUk ? "Аналіз зображення..." : "Analyzing image...",
    aiProbability: isUk ? "Ймовірність ШІ" : "AI probability",
    real: isUk ? "Справжнє" : "Real",
    ai: isUk ? "ШІ" : "AI",
    analysisResultLabel: isUk ? "Результат аналізу" : "Analysis result",
    statusSuspicious: isUk ? "Підозріло" : "Suspicious",
    statusNeedsReview: isUk ? "Потрібна перевірка" : "Needs review",
    statusLikelyReal: isUk ? "Ймовірно справжнє" : "Likely real",
    aiSignalDetected: isUk
      ? "Виявлено ознаки генерації ШІ. Перегляньте найсильніші індикатори моделі нижче."
      : "AI-generation signal detected. Review the strongest model indicators below.",
    realSignalDetected: isUk
      ? "Виявлено ознаки природного фото. Перегляньте найсильніші індикатори моделі нижче."
      : "Natural image signal detected. Review the strongest model indicators below.",
    aiConfidence: isUk ? "Впевненість ШІ" : "AI confidence",
    realPhotoScore: isUk ? "Оцінка справжнього фото" : "Real-photo score",
    pushesAI: isUk ? "Схиляє до ШІ" : "Pushes AI",
    pushesReal: isUk ? "Схиляє до справжнього" : "Pushes Real",
    artifactSignal: isUk ? "Сигнал артефактів" : "Artifact signal",
    textureNoise: isUk ? "Текстурний шум" : "Texture noise",
    frequencyPattern: isUk ? "Частотний патерн" : "Frequency pattern",
    detailedAnalysis: isUk ? "Детальний аналіз" : "Detailed analysis",
    noRawMetrics: isUk
      ? "Модель не повернула сирі метрики."
      : "No raw metrics returned by the model.",
    downloadAnalysis: isUk ? "Завантажити PNG-звіт" : "Download PNG report",
    aiFingerprint: isUk ? "Відбиток ШІ" : "AI fingerprint",
    reportReady: isUk ? "Звіт готовий" : "Report ready",
    uploadedImage: isUk ? "Завантажене зображення" : "Uploaded image",
    probabilitySplit: isUk ? "Розподіл ймовірності" : "Probability split",
    strongestIndicators: isUk ? "Найсильніші індикатори" : "Strongest indicators",
    fingerprintSubAI: isUk
      ? "Модель показує, які сигнали найбільше схиляють результат до ШІ."
      : "The model shows which signals most strongly push the result toward AI.",
    fingerprintSubReal: isUk
      ? "Модель показує, які сигнали найбільше схиляють результат до справжнього фото."
      : "The model shows which signals most strongly push the result toward a real photo.",
    modelSignal: isUk ? "Сигнал моделі" : "Model signal",
    visualEvidence: isUk ? "Візуальна ознака" : "Visual evidence",
    rawMetric: isUk ? "Сира метрика" : "Raw metric",
    threshold: isUk ? "Поріг" : "Threshold",
    modelVersion: isUk ? "Версія моделі" : "Model version",
    metricsTitle: isUk ? "Детальні метрики" : "Detailed metrics",
    checkAnotherPhoto: isUk ? "Перевірити інше фото" : "Check another photo",
    close: isUk ? "Закрити" : "Close",
    feedbackTitle: isUk
      ? "Сайт показав правильний результат?"
      : "Did the site return the correct result?",
    feedbackText: isUk
      ? "Це допоможе покращити точність аналізів."
      : "This will help improve analysis accuracy.",
    feedbackSavedTitle: isUk ? "Дякуємо за відповідь" : "Thanks for the feedback",
    feedbackSavedText: isUk
      ? "Оцінку збережено. Вона допоможе точніше налаштовувати перевірку."
      : "Your response was saved and will help tune future checks.",
    savingFeedback: isUk ? "Збереження..." : "Saving...",
    yesCorrect: isUk ? "Так, правильно" : "Yes, correct",
    noMistake: isUk ? "Ні, помилка" : "No, mistake",
    aiGenerated: isUk ? "Згенеровано ШІ" : "AI-generated",
    realPhoto: isUk ? "Справжнє фото" : "Real photo",
    metricLabels: {
      entropy: isUk ? "Ентропія" : "Entropy",
      brightness_mean: isUk ? "Середня яскравість" : "Brightness mean",
      brightness_std: isUk ? "Розкид яскравості" : "Brightness spread",
      skewness_brightness: isUk ? "Асиметрія яскравості" : "Brightness skewness",
      kurtosis_brightness: isUk ? "Куртозис яскравості" : "Brightness kurtosis",
      laplacian_variance: isUk ? "Різкість контурів" : "Edge sharpness",
      gradient_mean: isUk ? "Середній градієнт" : "Gradient mean",
      gradient_variance: isUk ? "Варіація градієнта" : "Gradient variance",
      edge_density: isUk ? "Щільність контурів" : "Edge density",
      hf_energy_ratio: isUk ? "ВЧ енергія" : "HF energy ratio",
      spectral_slope: isUk ? "Спектральний нахил" : "Spectral slope",
      spectral_flatness: isUk ? "Спектральна рівність" : "Spectral flatness",
      fft_phase_entropy: isUk ? "Ентропія FFT-фази" : "FFT phase entropy",
      freq_lf: isUk ? "Низькі частоти" : "Low frequencies",
      freq_mf: isUk ? "Середні частоти" : "Mid frequencies",
      freq_hf: isUk ? "Високі частоти" : "High frequencies",
      dct_energy_ratio: isUk ? "DCT енергія" : "DCT energy ratio",
      jpeg_artifact_score: isUk ? "JPEG-артефакти" : "JPEG artifact score",
      stripe_score: isUk ? "Смуговий патерн" : "Stripe pattern",
      lbp_entropy: isUk ? "Ентропія текстури" : "Texture entropy",
      glcm_contrast: isUk ? "Контраст текстури" : "Texture contrast",
      glcm_homogeneity: isUk ? "Однорідність текстури" : "Texture homogeneity",
      glcm_energy: isUk ? "Енергія текстури" : "Texture energy",
      noise_entropy: isUk ? "Ентропія шуму" : "Noise entropy",
      residual_std: isUk ? "Залишковий шум" : "Residual noise",
      noise_variance_patch_std: isUk ? "Варіація шуму" : "Noise variance",
      saturation_mean: isUk ? "Середня насиченість" : "Saturation mean",
      hue_entropy: isUk ? "Ентропія відтінків" : "Hue entropy",
      rgb_channel_corr: isUk ? "Кореляція RGB" : "RGB channel correlation",
      colorfulness: isUk ? "Насиченість кольорів" : "Colorfulness",
      gray_world_error: isUk ? "Помилка балансу кольору" : "Color balance error",
      compression_ratio: isUk ? "Коефіцієнт стиснення" : "Compression ratio",
      grid_regularity: isUk ? "Регулярність сітки" : "Grid regularity",
      color_uniformity: isUk ? "Однорідність кольору" : "Color uniformity",
      symmetry_score: isUk ? "Оцінка симетрії" : "Symmetry score",
      fractal_dimension: isUk ? "Фрактальна розмірність" : "Fractal dimension",
      noise_naturalness: isUk ? "Природність шуму" : "Noise naturalness",
      metadata_flag: isUk ? "Прапорець метаданих" : "Metadata flag",
      exif_present: isUk ? "Наявність EXIF" : "EXIF present",
      orig_width: isUk ? "Початкова ширина" : "Original width",
      orig_height: isUk ? "Початкова висота" : "Original height",
      orig_aspect: isUk ? "Початкові пропорції" : "Original aspect",
      file_size_kb: isUk ? "Розмір файлу" : "File size",
      file_bpp: isUk ? "Бітів на піксель" : "Bits per pixel",
    },
  };
}
