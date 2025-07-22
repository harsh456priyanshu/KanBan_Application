// controllers/teamController.js
const Team = require('../models/Team');
const User = require('../models/User');

exports.createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;
    const team = new Team({
      name,
      members,
      createdBy: req.user._id,
    });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    console.error("Error creating team:", err);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({ createdBy: req.user._id }).populate('members', 'name email');
    res.status(200).json(teams);
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};
