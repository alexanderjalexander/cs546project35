import { Router } from 'express';
const router = Router();
import dmData from '../data/dms.js'; 
import userData from '../data/users.js'; 

router.route('/')
  .get(async (req, res) => {
    try {
      const dmList = await dmData.getByUserId(req.session.user._id);
      await Promise.all(dmList.map( async (el) => {
        const actor1 = await userData.getUserById(el.actor1.toString());
        const actor2 = await userData.getUserById(el.actor2.toString());
        if (actor1.username !== req.session.user.username){
          el.otherUser = actor1.username
        } else{
          el.otherUser = actor2.username
        }
      }));
      return res.render('dms', {
        dmlist: dmList,
        title: "My Direct messages",
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to retrieve direct messages.' });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    try {
      const dm = await dmData.getById(req.params.id);
      for(const element of dm.messages){
        const sender = await userData.getUserById(element.sender.toString());
        element.sender = sender.username;
        element.timestamp = element.timestamp.toDateString()
      };
      if (dm) {
        res.render('dm', {
          ...dm
        });
      } else {
        res.status(404).json({ error: 'Direct message not found.' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve direct message.' });
    }
  });

  router.post('/api/dms/send', async (req, res) => {
    try {
        const { senderId, recipientId, message } = req.body;
        const result = await dmData.writeMsg(senderId, recipientId, message);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});


export default router;
