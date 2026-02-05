// Translations
const translations = {
    es: {
        "nav.map": "Mapa",
        "nav.recordings": "Grabaciones",
        "nav.soundscapes": "Paisajes Sonoros",
        "nav.people": "Personas",
        "nav.publications": "Publicaciones",
        "nav.news": "Noticias",
        "footer.rights": "Todos los derechos reservados",
        "map.title": "Mapa de Grabaciones",
        "map.showRecordings": "Mostrar Grabaciones Focales",
        "map.showSoundscapes": "Mostrar Paisajes Sonoros",
        "recordings.title": "Grabaciones Focales",
        "soundscapes.title": "Paisajes Sonoros",
        "people.title": "Nuestro Equipo",
        "publications.title": "Publicaciones",
        "news.title": "Noticias"
    },
    pt: {
        "nav.map": "Mapa",
        "nav.recordings": "Gravações",
        "nav.soundscapes": "Paisagens Sonoras",
        "nav.people": "Pessoas",
        "nav.publications": "Publicações",
        "nav.news": "Notícias",
        "footer.rights": "Todos os direitos reservados",
        "map.title": "Mapa de Gravações",
        "map.showRecordings": "Mostrar Gravações Focais",
        "map.showSoundscapes": "Mostrar Paisagens Sonoras",
        "recordings.title": "Gravações Focais",
        "soundscapes.title": "Paisagens Sonoras",
        "people.title": "Nossa Equipe",
        "publications.title": "Publicações",
        "news.title": "Notícias"
    },
    en: {
        "nav.map": "Map",
        "nav.recordings": "Recordings",
        "nav.soundscapes": "Soundscapes",
        "nav.people": "People",
        "nav.publications": "Publications",
        "nav.news": "News",
        "footer.rights": "All rights reserved",
        "map.title": "Recording Map",
        "map.showRecordings": "Show Focal Recordings",
        "map.showSoundscapes": "Show Soundscapes",
        "recordings.title": "Focal Recordings",
        "soundscapes.title": "Soundscapes",
        "people.title": "Our Team",
        "publications.title": "Publications",
        "news.title": "News"
    },
    fr: {
        "nav.map": "Carte",
        "nav.recordings": "Enregistrements",
        "nav.soundscapes": "Paysages Sonores",
        "nav.people": "Personnes",
        "nav.publications": "Publications",
        "nav.news": "Actualités",
        "footer.rights": "Tous droits réservés",
        "map.title": "Carte des Enregistrements",
        "map.showRecordings": "Afficher les Enregistrements Focaux",
        "map.showSoundscapes": "Afficher les Paysages Sonores",
        "recordings.title": "Enregistrements Focaux",
        "soundscapes.title": "Paysages Sonores",
        "people.title": "Notre Équipe",
        "publications.title": "Publications",
        "news.title": "Actualités"
    },
    de: {
        "nav.map": "Karte",
        "nav.recordings": "Aufnahmen",
        "nav.soundscapes": "Klanglandschaften",
        "nav.people": "Menschen",
        "nav.publications": "Veröffentlichungen",
        "nav.news": "Nachrichten",
        "footer.rights": "Alle Rechte vorbehalten",
        "map.title": "Aufnahmenkarte",
        "map.showRecordings": "Fokusaufnahmen anzeigen",
        "map.showSoundscapes": "Klanglandschaften anzeigen",
        "recordings.title": "Fokusaufnahmen",
        "soundscapes.title": "Klanglandschaften",
        "people.title": "Unser Team",
        "publications.title": "Veröffentlichungen",
        "news.title": "Nachrichten"
    },
    zh: {
        "nav.map": "地图",
        "nav.recordings": "录音",
        "nav.soundscapes": "声景",
        "nav.people": "人员",
        "nav.publications": "出版物",
        "nav.news": "新闻",
        "footer.rights": "版权所有",
        "map.title": "录音地图",
        "map.showRecordings": "显示焦点录音",
        "map.showSoundscapes": "显示声景",
        "recordings.title": "焦点录音",
        "soundscapes.title": "声景",
        "people.title": "我们的团队",
        "publications.title": "出版物",
        "news.title": "新闻"
    },
    ja: {
        "nav.map": "地図",
        "nav.recordings": "録音",
        "nav.soundscapes": "サウンドスケープ",
        "nav.people": "人々",
        "nav.publications": "出版物",
        "nav.news": "ニュース",
        "footer.rights": "全著作権所有",
        "map.title": "録音地図",
        "map.showRecordings": "焦点録音を表示",
        "map.showSoundscapes": "サウンドスケープを表示",
        "recordings.title": "焦点録音",
        "soundscapes.title": "サウンドスケープ",
        "people.title": "私たちのチーム",
        "publications.title": "出版物",
        "news.title": "ニュース"
    }
};

// Get current language from localStorage or default
let currentLang = localStorage.getItem('language') || 'es';

// Apply translations
function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.documentElement.lang = lang;
}

// Change language
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    applyTranslations(lang);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
    }
    applyTranslations(currentLang);
});
