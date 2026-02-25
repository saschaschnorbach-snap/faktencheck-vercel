// Vercel Serverless Function - Single Story API
// PUT /api/stories/:id - Update story
// DELETE /api/stories/:id - Delete story

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
            console.log('KV read error:', e.message);
        }
    }
    
    return null;
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.query;
    const storyId = parseInt(id, 10);
    
    if (isNaN(storyId)) {
        return res.status(400).json({ error: 'Invalid story ID' });
    }
    
    try {
        const stories = await getStories();
        
        if (!stories) {
            return res.status(503).json({ 
                error: 'Storage not available', 
                message: 'Configure Vercel KV for story management'
            });
        }
        
        const storyIndex = stories.findIndex(s => s.id === storyId);
        
        if (storyIndex === -1) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        if (req.method === 'GET') {
            return res.status(200).json({ story: stories[storyIndex] });
        }
        
        if (req.method === 'PUT') {
            const updates = req.body;
            
            stories[storyIndex] = {
                ...stories[storyIndex],
                headline: updates.headline ?? stories[storyIndex].headline,
                source: updates.source ?? stories[storyIndex].source,
                content: updates.content ?? stories[storyIndex].content,
                isTrue: updates.isTrue ?? stories[storyIndex].isTrue,
                explanation: updates.explanation ?? stories[storyIndex].explanation,
                tricks: updates.tricks ?? stories[storyIndex].tricks,
                active: updates.active ?? stories[storyIndex].active
            };
            
            await saveStories(stories);
            
            return res.status(200).json({ 
                story: stories[storyIndex],
                message: 'Story updated'
            });
        }
        
        if (req.method === 'DELETE') {
            const deletedStory = stories.splice(storyIndex, 1)[0];
            await saveStories(stories);
            
            return res.status(200).json({ 
                story: deletedStory,
                message: 'Story deleted'
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
