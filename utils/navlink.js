export function NavLink() {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    let currentHash = window.location.hash || "#/";

    function normalizeHash(hash) {
        if (hash.length > 1 && hash.endsWith("/")) {
            return hash.slice(0, -1);
        }
        return hash;
    }

    function isMatch(href, current) {
        href = normalizeHash(href);
        current = normalizeHash(current);
        return current === href || current.startsWith(href + "/");
    }

    const normalizedCurrent = normalizeHash(currentHash);

    let maxLength = -1;
    let activeHref = null;

    links.forEach(link => {
        const href = normalizeHash(link.getAttribute("href"));
        if (isMatch(href, normalizedCurrent) && href.length > maxLength) {
            maxLength = href.length;
            activeHref = href;
        }
    });

    links.forEach(link => {
        const href = normalizeHash(link.getAttribute("href"));
        if (href === activeHref) {
            link.classList.add("text-sky-500", "dark:text-sky-400", "font-semibold");
        } else {
            link.classList.remove("text-sky-500", "dark:text-sky-400", "font-semibold");
        }
    });
}

window.addEventListener("hashchange", NavLink);
window.addEventListener("DOMContentLoaded", NavLink);
