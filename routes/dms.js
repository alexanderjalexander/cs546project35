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
        id: req.session.user._id,
        title: "My Direct messages",
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to retrieve direct messages.' });
    }
  })
    .post(async (req, res) => {
  try {
    let { senderId, recipientId, message } = req.body;
    recipientId=await userData.getUserByUsername(recipientId);
    // Validate inputs
    if (!senderId || !recipientId || !message) {
      return res.status(400).json({ success: false, error: 'Missing senderId, recipientId, or message' });
    }

    // Attempt to find an existing DM between the two users
    const existingDMs = await dmData.getByUserId(senderId);
    let dm = existingDMs.find(dm => (dm.actor1.toString() === recipientId || dm.actor2.toString() === recipientId));
    let created = false;
    if (!dm) {
      // If no existing conversation, create a new one
      dm = await dmData.create(senderId, recipientId);
      created = true;
    }

    // Add the new message to the conversation
    const updatedDM = await dmData.writeMsg(dm._id.toString(), senderId, message);

    return res.json({ success: true, created, message: 'Message sent successfully', data: updatedDM });
  } catch (error) {
    console.error('Failed to send message:', error);
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});;

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
        return res.render('dm', {
          ...dm,
          id: req.params.id,
          senderId: req.session.user._id
        });
      } else {
        return res.status(404).json({ error: 'Direct message not found.' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to retrieve direct message.' });
    }
  })
    .post(async (req, res) => {
      try {
        let { dmId, senderId, message } = req.body;
        if ( dmId.trim() === '' || senderId.trim() === '' || message.trim() === '') {
          return res.status(400).json({ success: false, error: 'Bad senderId, recipientId, or message' });
        }
        const updatedDM = await dmData.writeMsg(dmId, senderId, message);
        return res.json({ success: true, message: 'Message sent successfully', data: updatedDM });
      } catch (e) {
        console.error('Failed to send message:', e);
        return res.status(500).json({ success: false, error: 'Failed to send message' });
      }
    });


export default router;
