/**
 * Данные футера — отдельный файл, чтобы клиентский SiteFooter не тащил
 * за собой ни двуязычные строки главной страницы, ни каталог модулей
 * (футер рендерится и на локаль-фиксированных маршрутах модулей).
 */
export type FooterLocale = "ro" | "ru";

export const footerStrings = {
  ro: {
    teamLogo: "Sigla echipei",
    qrCode: "Cod QR",
    projectTeam: "Membrii echipei",
    demo: "Demonstrația jocului",
    projectMaterials: "Materialele proiectului",
    projectMaterialsHint: "Resurse pentru prezentarea echipei și demonstrarea jocului.",
    close: "Închide",
    qrHint: "Scanează pentru a deschide jocul.",
    teamHint: "Membrii echipei InfoQuest.",
    demoHint: "Videoclip demonstrativ în limba română.",
    footerCopyright: "© 2026 InfoQuest. Toate drepturile rezervate.",
    footerHackathon: "Hackathonul Regional pentru coeziune socială și reziliență informațională",
    footerAi: "AI fără granițe",
    footerPrivacy: "Politica de confidențialitate",
    footerTerms: "Termeni și condiții",
  },
  ru: {
    teamLogo: "Логотип команды",
    qrCode: "QR-код",
    projectTeam: "Команда проекта",
    demo: "Демонстрация игры",
    projectMaterials: "Материалы проекта",
    projectMaterialsHint: "Ресурсы для презентации команды и демонстрации игры.",
    close: "Закрыть",
    qrHint: "Отсканируй, чтобы открыть игру.",
    teamHint: "Участники команды InfoQuest.",
    demoHint: "Демонстрационное видео на русском языке.",
    footerCopyright: "© 2026 InfoQuest. Все права защищены.",
    footerHackathon: "Региональный хакатон по социальной сплоченности и информационной устойчивости",
    footerAi: "ИИ без границ",
    footerPrivacy: "Политика конфиденциальности",
    footerTerms: "Условия использования",
  },
} as const;

export const teamMembers = {
  ru: ["Икизли Михаил", "Пукал Мария", "Хицюк Елена", "Чебанова Анна", "Бортник Евгений"],
  ro: ["Ichizli Mihail", "Pucal Maria", "Hițiuc Elena", "Cebanova Ana", "Bortnic Eugeniu"],
} as const;
