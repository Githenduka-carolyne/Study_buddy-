import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get top hosts
router.get('/top', async (req, res) => {
    try {
        const queryStr = `
            SELECT 
                u.id,
                u.name,
                u.profile_picture,
                COUNT(DISTINCT a.id) as activities_hosted,
                COUNT(DISTINCT am.user_id) as total_participants
            FROM users u
            LEFT JOIN activities a ON u.id = a.created_by
            LEFT JOIN activity_members am ON a.id = am.activity_id
            GROUP BY u.id, u.name, u.profile_picture
            ORDER BY activities_hosted DESC, total_participants DESC
            LIMIT 10
        `;
        const result = await prisma.$queryRaw(queryStr);
        res.json(result);
    } catch (error) {
        console.error('Error fetching top hosts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get host profile
router.get('/:id', async (req, res) => {
    try {
        const hostId = req.params.id;
        const queryStr = `
            SELECT 
                u.*,
                COUNT(DISTINCT a.id) as activities_hosted,
                COUNT(DISTINCT am.user_id) as total_participants,
                AVG(ar.rating) as average_rating
            FROM users u
            LEFT JOIN activities a ON u.id = a.created_by
            LEFT JOIN activity_members am ON a.id = am.activity_id
            LEFT JOIN activity_ratings ar ON a.id = ar.activity_id
            WHERE u.id = $1
            GROUP BY u.id
        `;
        const result = await prisma.$queryRaw(queryStr, [hostId]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Host not found' });
        }
        
        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching host profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get host's activities
router.get('/:id/activities', async (req, res) => {
    try {
        const hostId = req.params.id;
        const queryStr = `
            SELECT 
                a.*,
                COUNT(DISTINCT am.user_id) as participant_count,
                AVG(ar.rating) as average_rating
            FROM activities a
            LEFT JOIN activity_members am ON a.id = am.activity_id
            LEFT JOIN activity_ratings ar ON a.id = ar.activity_id
            WHERE a.created_by = $1
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `;
        const result = await prisma.$queryRaw(queryStr, [hostId]);
        res.json(result);
    } catch (error) {
        console.error('Error fetching host activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;