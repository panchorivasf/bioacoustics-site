// Internationalization support

const translations = {
    es: {
        "nav.home": "Inicio",
        "nav.map": "Mapa",
        "nav.recordings": "Grabaciones",
        "nav.people": "Personas",
        "nav.admin": "Admin",
        "footer.rights": "Todos los derechos reservados",
        "map.title": "Mapa de Grabaciones",
        "recordings.title": "Grabaciones"
    },
    pt: {
        "nav.home": "Início",
        "nav.map": "Mapa",
        "nav.recordings": "Gravações",
        "nav.people": "Pessoas",
        "nav.admin": "Admin",
        "footer.rights": "Todos os direitos reservados",
        "map.title": "Mapa de Gravações",
        "recordings.title": "Gravações"
    },
    en: {
        "nav.home": "Home",
        "nav.map": "Map",
        "nav.recordings": "Recordings",
        "nav.people": "People",
        "nav.admin": "Admin",
        "footer.rights": "All rights reserved",
        "map.title": "Recording Map",
        "recordings.title": "Recordings"
    },
    fr: {
        "nav.home": "Accueil",
        "nav.map": "Carte",
        "nav.recordings": "Enregistrements",
        "nav.people": "Personnes",
        "nav.admin": "Admin",
        "footer.rights": "Tous droits réservés",
        "map.title": "Carte des Enregistrements",
        "recordings.title": "Enregistrements"
    },
    de: {
        "nav.home": "Startseite",
        "nav.map": "Karte",
        "nav.recordings": "Aufnahmen",
        "nav.people": "Menschen",
        "nav.admin": "Admin",
        "footer.rights": "Alle Rechte vorbehalten",
        "map.title": "Aufnahmenkarte",
        "recordings.title": "Aufnahmen"
    },
    zh: {
        "nav.home": "主页",
        "nav.map": "地图",
        "nav.recordings": "录音",
        "nav.people": "人员",
        "nav.admin": "管理",
        "footer.rights": "版权所有",
        "map.title": "录音地图",
        "recordings.title": "录音"
    },
    ja: {
        "nav.home": "ホーム",
        "nav.map": "地図",
        "nav.recordings": "録音",
        "nav.people": "人々",
        "nav.admin": "管理",
        "footer.rights": "全著作権所有",
        "map.title": "録音地図",
        "recordings.title": "録音"
    }
};

let currentLang = localStorage.getItem('language') || 'es';

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

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    applyTranslations(lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
    }
    applyTranslations(currentLang);
});
