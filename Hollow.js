// ==UserScript==
// @name         Hollow svg to image (multi-icon support)
// @namespace    https://github.com/Nublord33/-Hollow-Svg-to-favicon
// @version      0.4
// @description  Akane learned how to not forget stuff
// @author       Nublord33/skibidiskid
// @match        https://hollow.live/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    let iconEntries = GM_getValue('iconEntries', []); // array of { title, url }

    function replaceSpecificSpanText() {
        const container = document.querySelector('div.grid.grid-cols-5.gap-6.relative');
        if (!container || iconEntries.length === 0) return;

        const spans = container.querySelectorAll('span');

        iconEntries.forEach(entry => {
            spans.forEach(span => {
                if (span.textContent.trim().toLowerCase() === entry.title.trim().toLowerCase()) {
                    const divContainingSpan = span.closest('div');
                    if (divContainingSpan) {
                        const svg = divContainingSpan.querySelector('svg');
                        if (svg) {
                            const faviconUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(entry.url)}&size=32`;
                            const img = document.createElement('img');
                            img.src = faviconUrl;
                            img.alt = 'Favicon';
                            img.style.width = '32px';
                            img.style.height = '32px';
                            img.style.borderRadius = '4px';
                            img.style.objectFit = 'cover';
                            svg.replaceWith(img);
                            console.log(`[Userscript] Replaced SVG for: ${entry.title}`);
                        }
                    }
                }
            });
        });
    }

    function trackInputs() {
        const titleInput = document.querySelector('input#icon-title[placeholder="Icon title"]');
        const urlInput = document.querySelector('input#icon-url[placeholder="https://example.com"]');

        if (titleInput && urlInput) {
            const saveButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Save');
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    setTimeout(() => {
                        const title = titleInput.value.trim();
                        const url = urlInput.value.trim();
                        if (title && url) {
                            // Remove existing entry with same title (case-insensitive)
                            iconEntries = iconEntries.filter(entry => entry.title.toLowerCase() !== title.toLowerCase());

                            // Add new entry
                            iconEntries.push({ title, url });
                            GM_setValue('iconEntries', iconEntries);

                            console.log(`[Userscript] Saved icon: ${title} → ${url}`);
                            replaceSpecificSpanText();
                        }
                    }, 500); // small delay to wait for DOM update
                });
            }
        } else {
            setTimeout(trackInputs, 500);
        }
    }

    function waitForAddIconButton() {
        const addButton = document.querySelector('button[aria-label="Add new icon"]');
        if (addButton) {
            addButton.addEventListener('click', trackInputs);
        } else {
            setTimeout(waitForAddIconButton, 500);
        }
    }

    function tryReplaceOnLoad() {
        const checkInterval = setInterval(() => {
            const container = document.querySelector('div.grid.grid-cols-5.gap-6.relative');
            if (container) {
                clearInterval(checkInterval);
                replaceSpecificSpanText();
            }
        }, 500);
    }

    // boot it
    window.addEventListener('load', () => {
        waitForAddIconButton();
        tryReplaceOnLoad();
    });
})();
