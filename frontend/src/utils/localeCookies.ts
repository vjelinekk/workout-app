import { LOCALE_COOKIE_NAME } from "@/constants/locale";

export const readLocaleFromCookie = (): string | null => {
	if (typeof document === "undefined") return null;
	const m = document.cookie.match(new RegExp('(?:^|; )' + LOCALE_COOKIE_NAME + '=([^;]*)'));
	return m ? decodeURIComponent(m[1]) : null;
}

export const setLocaleCookie = (locale: string) => {
	if (typeof document === "undefined") return;
	const maxAge = 60 * 60 * 24 * 365; // 1 year
	document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${maxAge}`;
}