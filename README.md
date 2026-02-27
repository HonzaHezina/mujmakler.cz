# MujMakler.cz – demo statický web (vanilla HTML/CSS/JS)

Tahle složka obsahuje **pevnou kostru webu realitky s více makléři** ve stylu a informační struktuře podobné MujMakler.cz
(podle zadání: lead-gen, důvěra, nábor makléřů).

## Jak to spustit
Nejjednodušší:
- otevři `index.html` v prohlížeči

Doporučené (kvůli routování, PDF a konzistentnímu načítání souborů):
```bash
cd mujmakler_site
python -m http.server 8000
# otevři http://127.0.0.1:8000
```

## Co je hotové
- Domů (`index.html`) – hero + vyhledávání, CTA, výhody, proces, vybrané nemovitosti, reference, tým, nábor, kontakt
- Nemovitosti (`nemovitosti.html`) – Prodej / Pronájem / Prodáno, vyhledávání, karty
- Detail nemovitosti (`nemovitost.html?id=p1`) – galerie, parametry, půdorys, mapa, PDF, makléř, formulář „Mám zájem“
- Makléři (`makleri.html`) – profily, filtry, seřazení, CTA na kariéru
- Služby (`sluzby.html`) – pro prodávající / pro kupující
- Ocenění zdarma (`oceneni-zdarma.html`) – landing + formulář + postup + FAQ
- Jak pracujeme (`jak-pracujeme.html`) – 7 kroků procesu
- Reference (`reference.html`)
- Kariéra (`kariera.html`) – provizní model, podpora, form
- Kontakt (`kontakt.html`)
- Právní stránky (`gdpr.html`, `obchodni-podminky.html`, `aml.html`, `cookies.html`) – placeholdery
- Poradna (`poradna.html`) – strategický prvek (blog/lead magnet)

## Kde upravit data (nemovitosti / makléři / reference)
Všechny demo data jsou v:
- `assets/js/site-data.js`

Tady přidáš/změníš:
- `properties` (nemovitosti)
- `brokers` (makléři)
- `testimonials` (reference)
- `contact` / `trust` (kontakty a důvěryhodnost)

## Design
- čistý minimalistický styl (světlé pozadí, výrazná CTA barva)
- responzivní hlavička (desktop menu + mobilní hamburger)
- bez frameworků, pouze HTML/CSS/JS

## Poznámka
Formuláře jsou demo – pouze ukazují toast „Díky!“, nic nikam neposílají.
Pro napojení na backend stačí v `assets/js/app.js` upravit `handleForms()` (fetch na API / n8n webhook apod.).
