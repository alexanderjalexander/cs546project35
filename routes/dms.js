import { Router } from 'express';
const router = Router();
import * as dmData from '../data/dmData.js'; 

router.route('/directmsgs')
  .get(async (req, res) => {
    try {
      const dmList = await dmData.getAllDMs();
      res.json(dmList);
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve direct messages.' });
    }
  });

router.route('/directmsgs/:id')
  .get(async (req, res) => {
    try {
      const dm = await dmData.getDMById(req.params.id);
      if (dm) {
        res.json(dm);
      } else {
        res.status(404).json({ error: 'Direct message not found.' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve direct message.' });
    }
  });

export default router;
