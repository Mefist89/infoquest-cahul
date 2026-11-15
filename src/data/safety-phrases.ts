/** Approved RU/RO wording. Reuse verbatim when teaching these two rules. */
export const SAFETY_PHRASES = {
  ru: {
    bankCall: "Положи трубку и сам позвони в банк по номеру на обороте карты или с официального сайта.",
    smsCode: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник.",
  },
  ro: {
    bankCall: "Închide și sună tu la bancă, la numărul de pe spatele cardului sau de pe site-ul oficial.",
    smsCode: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc.",
  },
} as const;

export const PATROL_SAFETY_RULES: Record<
  "ru" | "ro",
  Record<"post-maria" | "bank-operator" | "school-friend" | "shop-seller", string>
> = {
  ru: {
    "post-maria":
      "Не переходи и не плати по ссылкам из SMS — проверяй посылку сам на официальном сайте posta.md или в отделении почты.",
    "bank-operator": SAFETY_PHRASES.ru.bankCall,
    "school-friend":
      "При срочной просьбе о деньгах положи трубку и сам перезвони другу по старому сохранённому номеру.",
    "shop-seller": SAFETY_PHRASES.ru.smsCode,
  },
  ro: {
    "post-maria":
      "Nu accesa și nu plăti prin linkuri din SMS — verifică singur coletul pe site-ul oficial posta.md sau la oficiul poștal.",
    "bank-operator": SAFETY_PHRASES.ro.bankCall,
    "school-friend":
      "La o cerere urgentă de bani, închide și sună-ți tu prietenul la numărul vechi salvat în agendă.",
    "shop-seller": SAFETY_PHRASES.ro.smsCode,
  },
};

