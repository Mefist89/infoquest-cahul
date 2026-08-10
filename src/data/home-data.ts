import { CASE_SLIDES, MODULE_CATALOG, type ModuleDefinition, type ModuleLocale } from "@/data/module-catalog";

export type Lang = ModuleLocale;
export type Mission = ModuleDefinition;
export const missions = MODULE_CATALOG;
export const caseSlides = CASE_SLIDES;

export const strings = {
  ro: {
    tagline: "Scutul comunității digitale",
    motto: "Observă. Verifică. Protejează comunitatea.",
    startInvestigation: "Începe investigația",
    aiHelp: "Ajutor online AI",
    aiRoleRequired: "Pentru elevi și profesori",
    openMission: "Deschide",
    xp: "XP",
    playable: "Disponibil",
    soon: "În curând",
    shieldProgress: "Integritatea scutului orașului",
    storyTitle: "Dosarul: Umbra",
    story:
      "Orașul s-a conectat la Rețeaua Comunității. Dar în rețea a apărut un actor anonim — Umbra: sparge conturi, sună locuitorii în numele operatorilor, publică video falsificate și seamănă zvonuri între vorbitorii de română și de rusă.",
    story2:
      "Protocolul-străjer VIG (Vigilent) s-a trezit, dar nu poate lupta singur. Patrula InfoQuest te recrutează ca detectiv-stagiar. Închide cele 8 fisuri ale scutului și alungă Umbra din rețea.",
    badges: "Insigne",
    finalBadge: "Scutul complet",
    finalBadgeHint:
      "Finalizează cele 8 misiuni și colectează toate cele 8 insigne pentru a reface scutul orașului.",
    heroLead: "Un joc educațional bilingv pentru elevi, profesori, familii și întreaga comunitate.",
    heroSub: "Învață să recunoști fraudele, dezinformarea, deepfake-urile și pericolele digitale.",
    teamLogo: "Sigla echipei",
    qrCode: "Cod QR",
    projectTeam: "Membrii echipei",
    demo: "Demonstrația jocului",
    projectMaterials: "Materialele proiectului",
    projectMaterialsHint: "Resurse pentru prezentarea echipei și demonstrarea jocului.",
    close: "Închide",
    missionReady: "Scenariul de bază este disponibil. Parcursul complet al misiunii va fi conectat în etapa următoare.",
    missionSoon: "Misiunea se deschide în curând.",
    logoHint: "Alege o imagine pentru sigla echipei.",
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
    tagline: "Щит цифрового сообщества",
    motto: "Наблюдай. Проверяй. Защищай сообщество.",
    startInvestigation: "Начать расследование",
    aiHelp: "Онлайн-помощник AI",
    aiRoleRequired: "Для учеников и учителей",
    openMission: "Открыть",
    xp: "XP",
    playable: "Доступно",
    soon: "Скоро",
    shieldProgress: "Целостность щита города",
    storyTitle: "Дело: Тень",
    story:
      "Город подключился к Сети Сообщества. Но в сети завёлся анонимный актор — Тень: взламывает аккаунты, звонит жителям от имени операторов, публикует поддельные видео и сеет слухи между русско- и румыноязычными жителями.",
    story2:
      "Страж-протокол VIG («Бдительный») пробудился, но в одиночку не справится. Патруль InfoQuest набирает тебя детективом-стажёром. Закрой 8 трещин щита и вытесни Тень из сети.",
    badges: "Бейджи",
    finalBadge: "Полный щит",
    finalBadgeHint:
      "Пройди 8 миссий и собери все 8 бейджей, чтобы восстановить щит города.",
    heroLead: "Двуязычная образовательная игра для школьников, учителей, семей и всего сообщества.",
    heroSub: "Научись распознавать мошенничество, дезинформацию, дипфейки и цифровые угрозы.",
    teamLogo: "Логотип команды",
    qrCode: "QR-код",
    projectTeam: "Команда проекта",
    demo: "Демонстрация игры",
    projectMaterials: "Материалы проекта",
    projectMaterialsHint: "Ресурсы для презентации команды и демонстрации игры.",
    close: "Закрыть",
    missionReady: "Основной сценарий доступен. Полное прохождение миссии подключим на следующем этапе.",
    missionSoon: "Миссия откроется скоро.",
    logoHint: "Выбери изображение для логотипа команды.",
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
