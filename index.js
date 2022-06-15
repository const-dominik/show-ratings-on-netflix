// ==UserScript==
// @name         Ratings on Netflix
// @version      1.0
// @author       const_domino
// @match        https://www.netflix.com/browse*
// @grant        none
// ==/UserScript==

const APIKEY = "your_api_key";

const LANGUAGE = globalThis.netflix.reactContext.models.geo.data.preferredLocale.language;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getTitles = async (title) => {
    const encodedTitle = encodeURIComponent(title);
    const URL = `https://imdb-api.com/${LANGUAGE}/API/Search/${APIKEY}/${encodedTitle}`;
    try {
        const response = await globalThis.fetch(URL);
        const data = await response.json();
        return data.results;
    }
    catch (error) {
        return false;
    }
};
const getTitleRatings = async (title, year) => {
    const results = await getTitles(title);
    if (!results)
        return false;
    try {
        for (const { id, title } of results) {
            const URL = `https://imdb-api.com/${LANGUAGE}/API/Ratings/${APIKEY}/${id}`;
            const response = await globalThis.fetch(URL);
            const data = await response.json();
            if (parseInt(data.year) > year || data.title !== title)
                continue;
            const ratings = {
                imdb: parseFloat(data.imDb) || 0,
                metacritic: parseInt(data.metacritic) || 0,
                tmdb: parseFloat(data.theMovieDb) || 0,
                rottenTomatoes: parseInt(data.rottenTomatoes) || 0,
                filmAffinity: parseFloat(data.filmAffinity) || 0
            };
            return ratings;
        }
        ;
    }
    catch (error) {
        return false;
    }
    return false;
};
const getTitleOfOpenedShow = async (ms = 100) => {
    await sleep(ms);
    const modal = document.querySelector(".detail-modal");
    if (!modal)
        return getTitleOfOpenedShow();
    const titlePreview = modal.querySelector(".previewModal--player-titleTreatment-logo");
    const yearElement = modal.querySelector(".year");
    if (!titlePreview || !yearElement)
        return getTitleOfOpenedShow();
    const title = titlePreview.getAttribute("alt");
    const year = yearElement.textContent;
    if (!title || !year)
        return getTitleOfOpenedShow();
    return [title, parseInt(year)];
};
const createRatingsElement = (ratings) => {
    const container = document.createElement("div");
    container.setAttribute("class", "previewModal--tags");
    container.style.width = "100%";
    const label = document.createElement("span");
    label.setAttribute("class", "previewModal--tags-label");
    label.textContent = "Ratings:";
    label.style.display = "block";
    container.appendChild(label);
    const filteredRatings = Object.entries(ratings).filter(([, value]) => value !== 0);
    if (filteredRatings.length > 0) {
        const items = filteredRatings.map(([key, value]) => {
            const item = document.createElement("span");
            item.textContent = `${key}: ${value}`;
            item.style.display = "block";
            return item;
        });
        items.forEach(item => container.appendChild(item));
    }
    else {
        label.textContent = "No ratings available in API. :(";
    }
    return container;
};
const addRatings = async () => {
    const [title, year] = await getTitleOfOpenedShow(0);
    const ratings = await getTitleRatings(title, year);
    if (!ratings) {
        await sleep(100);
        return addRatings();
    }
    const ratingsElement = createRatingsElement(ratings);
    const metaData = document.querySelector(".previewModal--detailsMetadata-right");
    if (!metaData) {
        await sleep(100);
        return addRatings();
    }
    metaData.appendChild(ratingsElement);
};
//observer
const runObserver = async () => {
    const elementToObserve = document.querySelector(".lolomo.is-fullbleed");
    if (!elementToObserve) {
        await sleep(100);
        return runObserver();
    }
    const config = { attributes: true, attributeFilter: ["class"] };
    const observer = new MutationObserver(async (mutations) => {
        const target = mutations[0].target;
        if (target.classList.value.includes("has-open-jaw")) {
            addRatings();
        }
    });
    observer.observe(elementToObserve, config);
};
runObserver();
