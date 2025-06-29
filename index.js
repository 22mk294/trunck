const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

/**
 * ✅ Créer un utilisateur avec rôle
 * ccc
 */
app.post('/createUser', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ uid: userRecord.uid, message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * ✅ Lister tous les utilisateurs
 */
app.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Modifier le rôle d'un utilisateur
 */
app.patch('/users/:uid', async (req, res) => {
  const uid = req.params.uid;
  const { role } = req.body;
  try {
    await db.collection('users').doc(uid).update({ role });
    res.json({ message: `Rôle mis à jour pour ${uid}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * ✅ Supprimer un utilisateur
 */
app.delete('/users/:uid', async (req, res) => {
  const uid = req.params.uid;
  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    res.json({ message: `Utilisateur ${uid} supprimé.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
