import type { NavItemConfig } from '@/types/nav';

export function isNavItemActive({
  disabled,
  external,
  href,
  matcher,
  pathname,
}: Pick<NavItemConfig, 'disabled' | 'external' | 'href' | 'matcher'> & { pathname: string }): boolean {
  if (disabled || !href || external) {
    return false;
  }

  const normalize = (url: string) => (url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url);

  const normalizedPathname = normalize(pathname);
  const normalizedHref = normalize(href);
  //console.log(matcher, normalizedPathname, normalizedHref, 'normalizedPathnamenormalizedPathname');
  if (matcher) {
    if (matcher.type === 'startsWith') {
      return normalizedPathname.startsWith(normalize(matcher.href));
    }

    if (matcher.type === 'equals') {
      return normalizedPathname === normalize(matcher.href);
    }

    return false;
  }

  // return normalizedPathname === normalizedHref;
  return normalizedPathname?.split('/dashboard')[1] === normalizedHref?.split('/dashboard')[1];
}
