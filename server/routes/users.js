const router = require('express').Router();
const User = require('../models/User');

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : err.code === 11000 ? 409 : 500;
    res.status(status).json({ message: err.code === 11000 ? 'Email already exists' : err.message });
  }
};

router.get('/', handle(async (req, res) => res.json(await User.find().sort({ createdAt: -1 }))));

router.get('/:id', handle(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

router.post('/', handle(async (req, res) => res.status(201).json(await User.create(req.body))));

router.put('/:id', handle(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

router.delete('/:id', handle(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
}));

module.exports = router;
