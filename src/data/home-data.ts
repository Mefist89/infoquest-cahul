import type { ModuleLocale } from "@/data/module-catalog";

export type Lang = ModuleLocale;

/**
 * Строки домашней страницы (двуязычные из-за клиентского переключателя языка).
 * Футерские поля живут в footer-data.ts, каталог модулей импортируется напрямую.
 */
export const strings = {
  ro: {
    tagline: "Scutul comunității digitale",
    motto: "Observă. Verifică. Protejează comunitatea.",
    startInvestigation: "Începe investigația",
    aiHelp: "Ajutor online AI",
    aiRoleRequired: "Pentru elevi și profesori",
    openMission: "Deschide",
    close: "Închide",
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
    missionReady: "Scenariul de bază este disponibil. Parcursul complet al misiunii va fi conectat în etapa următoare.",
    missionSoon: "Misiunea se deschide în curând.",
  },
  ru: {
    tagline: "Щит цифрового сообщества",
    motto: "Наблюдай. Проверяй. Защищай сообщество.",
    startInvestigation: "Начать расследование",
    aiHelp: "Онлайн-помощник AI",
    aiRoleRequired: "Для учеников и учителей",
    openMission: "Открыть",
    close: "Закрыть",
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
    missionReady: "Основной сценарий доступен. Полное прохождение миссии подключим на следующем этапе.",
    missionSoon: "Миссия откроется скоро.",
  },
} as const;
