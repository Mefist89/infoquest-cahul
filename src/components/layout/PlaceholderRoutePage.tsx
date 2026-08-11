import type { Metadata } from "next";

import { RouteStatePage } from "@/components/layout/RouteStatePage";
import { requireRouteLocale, routeStateMetadata } from "@/lib/route-state";

const placeholders = {
  intro: {
    title: { ru: "Введение перенесено в первый модуль", ro: "Introducerea este în primul modul" },
    description: {
      ru: "Знакомство с наставником и правилами расследования теперь открывается в начале миссии «Фальшивый звонок оператора».",
      ro: "Întâlnirea cu mentorul și regulile investigației se deschid acum la începutul misiunii „Apelul fals de la operator”.",
    },
    primaryLabel: { ru: "Открыть первый модуль", ro: "Deschide primul modul" },
    primaryPath: "/modules/operator-call",
  },
  map: {
    title: { ru: "Карта расследований готовится", ro: "Harta investigațiilor este în pregătire" },
    description: {
      ru: "Все восемь миссий уже показаны на главной странице. Отдельная интерактивная карта появится в следующей версии.",
      ro: "Toate cele opt misiuni sunt deja afișate pe pagina principală. Harta interactivă separată va apărea într-o versiune viitoare.",
    },
  },
  results: {
    title: { ru: "Результаты находятся в профиле", ro: "Rezultatele sunt disponibile în profil" },
    description: {
      ru: "Очки XP, награды и прохождение этапов сохраняются и отображаются на странице вашего профиля.",
      ro: "Punctele XP, insignele și etapele finalizate sunt salvate și afișate în pagina profilului tău.",
    },
    primaryLabel: { ru: "Открыть профиль", ro: "Deschide profilul" },
    primaryPath: "/profile",
  },
  "fake-link": {
    title: { ru: "Ловушка фальшивой ссылки", ro: "Capcana linkului fals" },
    description: {
      ru: "Миссия №2 находится в разработке. Пока доступен первый модуль о фальшивом звонке оператора.",
      ro: "Misiunea nr. 2 este în dezvoltare. Deocamdată este disponibil primul modul despre apelul fals de la operator.",
    },
  },
  "hacked-account": {
    title: { ru: "Взломанный аккаунт", ro: "Contul compromis" },
    description: {
      ru: "Миссия №3 находится в разработке. Мы сообщим о её открытии на главной странице.",
      ro: "Misiunea nr. 3 este în dezvoltare. Deschiderea ei va fi anunțată pe pagina principală.",
    },
  },
  "scam-or-real": {
    title: { ru: "Скам или реальное предложение?", ro: "Scam sau ofertă reală?" },
    description: {
      ru: "Миссия №4 находится в разработке. Сейчас пройти можно только первый модуль.",
      ro: "Misiunea nr. 4 este în dezvoltare. În prezent poate fi parcurs doar primul modul.",
    },
  },
  "deepfake-detective": {
    title: { ru: "Детектив дипфейков", ro: "Detectivul deepfake" },
    description: {
      ru: "Миссия №5 находится в разработке. Материалы о проверке видео появятся позже.",
      ro: "Misiunea nr. 5 este în dezvoltare. Materialele despre verificarea videoclipurilor vor apărea mai târziu.",
    },
  },
} as const;

export type PlaceholderRoute = keyof typeof placeholders;

export function placeholderMetadata(route: PlaceholderRoute, locale: string): Metadata {
  const content = placeholders[route];
  return routeStateMetadata(locale, content.title, content.description);
}

export function PlaceholderRoutePage({ route, locale }: { route: PlaceholderRoute; locale: string }) {
  const lang = requireRouteLocale(locale);
  const content = placeholders[route];
  const primaryPath = "primaryPath" in content ? content.primaryPath : undefined;
  const primaryLabel = "primaryLabel" in content ? content.primaryLabel[lang] : undefined;

  return (
    <RouteStatePage
      locale={lang}
      title={content.title[lang]}
      description={content.description[lang]}
      primaryHref={primaryPath ? `/${lang}${primaryPath}` : undefined}
      primaryLabel={primaryLabel}
    />
  );
}
