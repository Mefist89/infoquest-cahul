import { describe, expect, it } from "vitest";

import { getOtpErrorMessage } from "@/components/auth/otp-errors";

describe("сопоставление кодов ошибок входа по email-коду (OTP)", () => {
  it.each(["otp_expired", "invalid_otp", "invalid_credentials", "token_expired", "otp_disabled"])(
    "возвращает сообщение о неверном или устаревшем коде для %s",
    (code) => {
      expect(getOtpErrorMessage("ru", code)).toBe("Код неверный или устарел. Запросите новый.");
      expect(getOtpErrorMessage("ro", code)).toBe("Codul este greșit sau a expirat. Cere un cod nou.");
    },
  );

  it.each(["over_email_send_rate_limit", "over_request_rate_limit"])(
    "возвращает сообщение о превышении частоты запросов для %s",
    (code) => {
      expect(getOtpErrorMessage("ru", code)).toBe("Слишком часто. Подождите минуту.");
      expect(getOtpErrorMessage("ro", code)).toBe("Prea des. Așteaptă un minut.");
    },
  );

  it.each(["email_address_invalid", "validation_failed"])(
    "возвращает сообщение о некорректном адресе email для %s",
    (code) => {
      expect(getOtpErrorMessage("ru", code)).toBe("Проверьте адрес email.");
      expect(getOtpErrorMessage("ro", code)).toBe("Verifică adresa de e-mail.");
    },
  );

  it("возвращает сообщение проверки антибот-защиты для captcha_failed", () => {
    expect(getOtpErrorMessage("ru", "captcha_failed")).toBe(
      "Подтвердите, что вы не робот, и попробуйте снова.",
    );
    expect(getOtpErrorMessage("ro", "captcha_failed")).toBe(
      "Confirmă că nu ești robot și încearcă din nou.",
    );
  });

  it.each([undefined, null, "", "unexpected_failure", "unknown_error"])(
    "возвращает общее сообщение об ошибке входа для %s",
    (code) => {
      expect(getOtpErrorMessage("ru", code)).toBe("Не удалось войти. Попробуйте ещё раз.");
      expect(getOtpErrorMessage("ro", code)).toBe("Autentificarea nu a reușit. Încearcă din nou.");
    },
  );
});
