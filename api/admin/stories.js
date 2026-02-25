// Vercel Serverless Function - Admin Stories API
// Returns ALL stories including inactive ones

const DEFAULT_STORIES = [
    {
        id: 1,
        headline: "Ampel-Koalition einigt sich auf Kompromiss beim Bürgergeld",
        source: "Tagesschau",
        content: "Nach wochenlangen Verhandlungen haben sich SPD, Grüne und FDP auf einen Kompromiss beim Bürgergeld geeinigt.",
        isTrue: true,
        explanation: "Diese Meldung stammt von einer seriösen öffentlich-rechtlichen Quelle.",
        tricks: [],
        active: true
    },
    {
        id: 2,
        headline: "SKANDAL! Geheime Dokumente beweisen massiven Wahlbetrug!",
        source: "freiheit-deutschland.net",
        content: "Ein mutiger Whistleblower hat uns exklusiv Dokumente zugespielt...",
        isTrue: false,
        explanation: "Klassische Merkmale von Desinformation: Panikmache, anonyme Quellen.",
        tricks: ["Panikmache", "Verschwörungstheorie"],
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
                return { stories, persisted: true };
            }
        } catch (e) {
            console.log('KV read error:', e.message);
        }
    }
    
    return { stories: DEFAULT_STORIES, persisted: false };
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        if (req.method === 'GET') {
            const { stories, persisted } = await getStories();
            
            return res.status(200).json({ 
                stories,
                total: stories.length,
                active: stories.filter(s => s.active !== false).length,
                persisted,
                message: persisted 
                    ? 'Stories loaded from Vercel KV' 
                    : 'Using default stories (configure Vercel KV for persistence)'
            });
        }
        
        if (req.method === 'POST') {
            const { action, stories: newStories } = req.body;
            
            if (action === 'import' && Array.isArray(newStories)) {
                const saved = await saveStories(newStories);
                return res.status(200).json({
                    success: saved,
                    count: newStories.length,
                    message: saved ? 'Stories imported' : 'Import failed - KV not available'
                });
            }
            
            if (action === 'reset') {
                const saved = await saveStories(DEFAULT_STORIES);
                return res.status(200).json({
                    success: saved,
                    message: saved ? 'Stories reset to defaults' : 'Reset failed - KV not available'
                });
            }
            
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
