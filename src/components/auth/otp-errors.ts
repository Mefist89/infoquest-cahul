export type AuthLocale = "ru" | "ro";

const OTP_ERROR_MESSAGES = {
  ru: {
    invalidOrExpired: "Код неверный или устарел. Запросите новый.",
    rateLimit: "Слишком часто. Подождите минуту.",
    invalidEmail: "Проверьте адрес email.",
    captcha: "Подтвердите, что вы не робот, и попробуйте снова.",
    fallback: "Не удалось войти. Попробуйте ещё раз.",
  },
  ro: {
    invalidOrExpired: "Codul este greșit sau a expirat. Cere un cod nou.",
    rateLimit: "Prea des. Așteaptă un minut.",
    invalidEmail: "Verifică adresa de e-mail.",
    captcha: "Confirmă că nu ești robot și încearcă din nou.",
    fallback: "Autentificarea nu a reușit. Încearcă din nou.",
  },
} as const satisfies Record<AuthLocale, Record<string, string>>;

export function getOtpErrorMessage(locale: AuthLocale, code?: string | null): string {
  const t = OTP_ERROR_MESSAGES[locale];

  switch (code) {
    case "otp_expired":
    case "invalid_otp":
    case "invalid_credentials":
    case "token_expired":
    case "otp_disabled":
      return t.invalidOrExpired;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return t.rateLimit;
    case "email_address_invalid":
    case "validation_failed":
      return t.invalidEmail;
    case "captcha_failed":
      return t.captcha;
    default:
      return t.fallback;
  }
}
