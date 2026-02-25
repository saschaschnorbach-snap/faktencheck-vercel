// Vercel Serverless Function - Stories API
// Supports: Vercel KV (production) or fallback to default stories

const DEFAULT_STORIES = [
    {
        id: 1,
        headline: "Ampel-Koalition einigt sich auf Kompromiss beim Bürgergeld",
        source: "Tagesschau",
        content: "Nach wochenlangen Verhandlungen haben sich SPD, Grüne und FDP auf einen Kompromiss beim Bürgergeld geeinigt. Der Vermittlungsausschuss von Bundestag und Bundesrat hat heute eine Einigung erzielt. Die Regelsätze werden zum 1. Januar angehoben, gleichzeitig werden die Sanktionsmöglichkeiten erweitert.",
        isTrue: true,
        explanation: "Diese Meldung stammt von einer seriösen öffentlich-rechtlichen Quelle und enthält konkrete, überprüfbare Details: beteiligte Parteien, den Vermittlungsausschuss als Institution und ein konkretes Datum. Bei politischen Nachrichten solltest du immer auf offizielle Quellen und die Nennung von Institutionen achten.",
        tricks: [],
        active: true
    },
    {
        id: 2,
        headline: "SKANDAL! Geheime Dokumente beweisen massiven Wahlbetrug bei der Bundestagswahl!",
        source: "freiheit-deutschland.net",
        content: "Ein mutiger Whistleblower hat uns exklusiv Dokumente zugespielt, die beweisen: Die letzte Bundestagswahl wurde manipuliert! Hunderttausende Stimmen wurden gefälscht. Die Mainstream-Medien und die Regierung vertuschen dies! TEILE DIESEN BEITRAG bevor er gelöscht wird!!!",
        isTrue: false,
        explanation: "Diese Meldung zeigt klassische Merkmale von Desinformation: 1) Emotionale Großschreibung und Panikmache, 2) Anonyme Quellen ohne überprüfbare Details, 3) Verschwörungsnarrative ('Mainstream-Medien vertuschen'), 4) Dringlichkeitsappell zum Teilen, 5) Unbekannte/unseriöse Webseite. Deutsche Wahlen werden von unabhängigen Wahlbeobachtern überwacht.",
        tricks: ["Panikmache", "Verschwörungstheorie", "Unseriöse Quelle"],
        active: true
    },
    {
        id: 3,
        headline: "Bundesverfassungsgericht kippt Nachtragshaushalt der Ampel-Regierung",
        source: "Süddeutsche Zeitung",
        content: "Das Bundesverfassungsgericht in Karlsruhe hat Teile des Nachtragshaushalts der Bundesregierung für verfassungswidrig erklärt. Die Richter bemängelten, dass 60 Milliarden Euro aus dem Corona-Sonderfonds ohne ausreichende Begründung für Klimaschutzmaßnahmen umgewidmet wurden.",
        isTrue: true,
        explanation: "Diese Nachricht enthält präzise Angaben: eine konkrete Institution (Bundesverfassungsgericht), einen Ort (Karlsruhe), einen genauen Betrag und eine rechtliche Begründung. Solche Details sind typisch für seriösen Journalismus. Die Meldung kann leicht durch offizielle Pressemitteilungen des Gerichts verifiziert werden.",
        tricks: [],
        active: true
    },
    {
        id: 4,
        headline: "Habeck: 'Deutsche sollen weniger duschen und kalt essen, um das Klima zu retten'",
        source: "patriot-news24.de",
        content: "In einem geheimen internen Treffen soll Wirtschaftsminister Habeck gesagt haben, dass Deutsche auf warmes Essen und regelmäßiges Duschen verzichten sollen. Ein Insider, der anonym bleiben möchte, berichtet exklusiv: 'Er meint es wirklich ernst!' Die Grünen wollen uns alles verbieten!",
        isTrue: false,
        explanation: "Typisches Fake-Zitat mit Warnzeichen: 1) 'Geheimes Treffen' - nicht verifizierbar, 2) Anonymer 'Insider' als einzige Quelle, 3) Übertriebene, emotionale Darstellung, 4) Unseriöse Quelle, 5) Keine offiziellen Statements oder Videobeweise. Echte Politiker-Zitate werden von mehreren Medien bestätigt.",
        tricks: ["Anonyme Quellen", "Emotionale Sprache", "Unseriöse Quelle"],
        active: true
    },
    {
        id: 5,
        headline: "EU-Parlament stimmt für Verbot von Verbrennungsmotoren ab 2035",
        source: "Reuters",
        content: "Das Europäische Parlament hat mit großer Mehrheit für das Aus des Verbrennungsmotors bei Neuwagen ab 2035 gestimmt. Die Abgeordneten folgten damit einem Vorschlag der EU-Kommission. Ausnahmen sollen für E-Fuels gelten, wenn diese klimaneutral hergestellt werden.",
        isTrue: true,
        explanation: "Diese Meldung stammt von einer renommierten internationalen Nachrichtenagentur (Reuters). Sie enthält konkrete Details: Institution (EU-Parlament), Datum (2035), und eine wichtige Ausnahme (E-Fuels). Nachrichtenagenturen wie Reuters, dpa oder AFP sind für ihre faktenbasierte Berichterstattung bekannt.",
        tricks: [],
        active: true
    },
    {
        id: 6,
        headline: "EILMELDUNG: Regierung plant heimlich 10 Millionen Migranten pro Jahr aufzunehmen!",
        source: "wahrheit-aktuell.com",
        content: "Aus geheimen Regierungsdokumenten geht hervor: Die Ampel plant, jährlich 10 Millionen Migranten nach Deutschland zu holen! Die Bevölkerung soll ausgetauscht werden. Diese Information wird von allen Medien unterdrückt! Wacht endlich auf!!!",
        isTrue: false,
        explanation: "Klassische Desinformation mit Verschwörungsnarrativen: 1) Unrealistische Zahlen (10 Mio. wären 12% der Bevölkerung PRO JAHR), 2) 'Geheime Dokumente' ohne jeglichen Beweis, 3) Verschwörungstheorie vom 'Bevölkerungsaustausch', 4) Behauptung der Medienunterdrückung, 5) Emotionale Aufrufe. Solche extremen Behauptungen ohne Belege sind fast immer falsch.",
        tricks: ["Verschwörungstheorie", "Panikmache", "Fehlende Quellen"],
        active: true
    },
    {
        id: 7,
        headline: "Bund und Länder einigen sich auf neue Corona-Maßnahmen für den Herbst",
        source: "ZDF heute",
        content: "Bei der Ministerpräsidentenkonferenz haben sich Bundeskanzler und die Regierungschefs der Länder auf einen gemeinsamen Kurs für den Herbst verständigt. Die Maskenpflicht in Innenräumen soll ab Oktober gelten, Impfangebote werden ausgeweitet. Schulschließungen sind nicht vorgesehen.",
        isTrue: true,
        explanation: "Diese Meldung stammt vom öffentlich-rechtlichen Rundfunk und nennt konkrete Institutionen (Ministerpräsidentenkonferenz), Zeiträume (Oktober, Herbst) und spezifische Maßnahmen. Beschlüsse solcher Konferenzen werden immer auch in offiziellen Pressemitteilungen veröffentlicht.",
        tricks: [],
        active: true
    },
    {
        id: 8,
        headline: "Putin droht: Wenn Deutschland Sanktionen nicht aufhebt, wird Gas komplett abgedreht!",
        source: "breaking-politik.de",
        content: "In einer dramatischen Rede soll Putin heute gedroht haben, dass kein einziger Kubikmeter Gas mehr nach Deutschland fließen wird, wenn die Sanktionen nicht sofort aufgehoben werden! Aber die deutsche Regierung ignoriert diese Warnung. Unser Land steuert auf eine Katastrophe zu!!!",
        isTrue: false,
        explanation: "Warnzeichen für Manipulation: 1) Keine Quellenangabe für die 'Rede' (kein Video, kein Transkript), 2) Emotionale, dramatische Sprache, 3) Panikmache ('Katastrophe'), 4) Unseriöse Quelle ohne Impressum, 5) Wichtige Reden von Staatsoberhäuptern werden immer von mehreren seriösen Medien zeitgleich berichtet.",
        tricks: ["Fehlende Quellen", "Panikmache", "Emotionale Sprache"],
        active: true
    },
    {
        id: 9,
        headline: "Bundesarbeitsminister kündigt Rentenpaket II an: Rentenniveau soll bei 48 Prozent stabilisiert werden",
        source: "Handelsblatt",
        content: "Bundesarbeitsminister Hubertus Heil hat die Eckpunkte des Rentenpakets II vorgestellt. Das Rentenniveau soll dauerhaft bei mindestens 48 Prozent des Durchschnittslohns stabilisiert werden. Finanziert werden soll dies unter anderem durch Investitionen am Kapitalmarkt. Die Opposition kritisiert die Pläne als unzureichend.",
        isTrue: true,
        explanation: "Seriöse Wirtschaftsberichterstattung: 1) Nennung des zuständigen Ministers mit Namen, 2) Konkrete Zahlen (48 Prozent), 3) Erklärung der Finanzierung, 4) Auch kritische Stimmen werden erwähnt. Die Quelle (Handelsblatt) ist eine renommierte Wirtschaftszeitung.",
        tricks: [],
        active: true
    },
    {
        id: 10,
        headline: "Enthüllt: Geheime Millionen-Spenden aus Russland an deutsche Parteien!",
        source: "enthuellung-jetzt.net",
        content: "Nach monatelangen Recherchen können wir exklusiv enthüllen: ALLE großen deutschen Parteien haben heimlich Millionen von russischen Oligarchen erhalten! Die Beweise sind erdrückend, aber die Lügenpresse verschweigt dies. Nur wir trauen uns, die Wahrheit zu sagen!!!",
        isTrue: false,
        explanation: "Typische Falschmeldung: 1) 'Exklusive Enthüllung' ohne jegliche Beweise, 2) Pauschale Anschuldigungen gegen ALLE Parteien (unrealistisch), 3) Diffamierung seriöser Medien als 'Lügenpresse', 4) Selbstdarstellung als einzige 'wahre' Quelle, 5) Parteispenden in Deutschland sind gesetzlich geregelt und müssen ab bestimmten Beträgen öffentlich gemacht werden.",
        tricks: ["Fehlende Quellen", "Verschwörungstheorie", "Emotionale Sprache"],
        active: true
    }
];

let kvStore = null;

async function getKV() {
    if (kvStore) return kvStore;
    
    try {
        const { kv } = await import('@vercel/kv');
        kvStore = kv;
        return kv;
    } catch {
        return null;
    }
}

async function getStories() {
    const kv = await getKV();
    
    if (kv) {
        try {
            const stories = await kv.get('stories');
            if (stories && Array.isArray(stories)) {
                return stories;
            }
        } catch (e) {
            console.log('KV read error, using defaults:', e.message);
        }
    }
    
    return DEFAULT_STORIES;
}

async function saveStories(stories) {
    const kv = await getKV();
    
    if (kv) {
        await kv.set('stories', stories);
        return true;
    }
    
    return false;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        if (req.method === 'GET') {
            const stories = await getStories();
            const activeStories = stories.filter(s => s.active !== false);
            return res.status(200).json({ 
                stories: activeStories,
                total: stories.length,
                active: activeStories.length
            });
        }
        
        if (req.method === 'POST') {
            const authHeader = req.headers.authorization;
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            
            if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            const newStory = req.body;
            
            if (!newStory.headline || !newStory.source || !newStory.content) {
                return res.status(400).json({ error: 'Missing required fields: headline, source, content' });
            }
            
            const stories = await getStories();
            const maxId = Math.max(...stories.map(s => s.id), 0);
            
            const story = {
                id: maxId + 1,
                headline: newStory.headline,
                source: newStory.source,
                content: newStory.content,
                isTrue: newStory.isTrue === true,
                explanation: newStory.explanation || '',
                tricks: newStory.tricks || [],
                active: newStory.active !== false
            };
            
            stories.push(story);
            const saved = await saveStories(stories);
            
            return res.status(201).json({ 
                story, 
                saved,
                message: saved ? 'Story created and saved' : 'Story created (not persisted - configure Vercel KV for persistence)'
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
