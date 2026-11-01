import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ru', 'ro'],
  defaultLocale: 'ro',
  localeCookie: {maxAge: 60 * 60 * 24 * 365},
  alternateLinks: false
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
