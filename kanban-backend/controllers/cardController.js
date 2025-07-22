const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');

exports.createCard = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, priority } = req.body;
    const { listId } = req.params;

    if (!title || !listId) {
      return res.status(400).json({ message: 'Title and listId are required' });
    }

    // Verify the list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Verify the board exists and user has access
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has permission to add cards to this board
    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    const card = new Card({
      title,
      description: description || '',
      dueDate: dueDate || null,
      list: listId,
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
      createdBy: req.user._id,
      order: await Card.countDocuments({ list: listId })
    });

    await card.save();
    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Failed to create card', error: error.message });
  }
};

exports.getCardsByList = async (req, res) => {
  try {
    const { listId } = req.params;

    // Verify the list exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Verify the board exists and user has access
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has permission to view this board
    if (!board.canView(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this board' });
    }

    const cards = await Card.find({ list: listId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Failed to fetch cards' });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, assignedTo, priority, labels } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Verify the list exists
    const list = await List.findById(card.list);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Verify the board exists and user has access
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has permission to edit this board
    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    // Update card fields
    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (assignedTo !== undefined) card.assignedTo = assignedTo;
    if (priority !== undefined) card.priority = priority;
    if (labels !== undefined) card.labels = labels;

    await card.save();
    res.status(200).json(card);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ message: 'Failed to update card' });
  }
};

exports.moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { newListId, newOrder } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Verify the new list exists
    const newList = await List.findById(newListId);
    if (!newList) {
      return res.status(404).json({ message: 'New list not found' });
    }

    // Verify the board exists and user has access
    const board = await Board.findById(newList.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has permission to edit this board
    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    // Update card's list and order
    card.list = newListId;
    if (newOrder !== undefined) card.order = newOrder;

    await card.save();
    res.status(200).json(card);
  } catch (error) {
    console.error('Error moving card:', error);
    res.status(500).json({ message: 'Failed to move card' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Verify the list exists
    const list = await List.findById(card.list);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Verify the board exists and user has access
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has permission to edit this board
    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    await Card.findByIdAndDelete(id);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Failed to delete card' });
  }
};

exports.deleteCardAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Verify user has permission to edit this card
    const list = await List.findById(card.list);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    // Find and remove the attachment
    const attachmentIndex = card.attachments.findIndex(att => att._id.toString() === attachmentId);
    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove the attachment from the array
    card.attachments.splice(attachmentIndex, 1);
    await card.save();

    res.status(200).json({ 
      message: 'Attachment deleted successfully',
      card: card
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Failed to delete attachment', error: error.message });
  }
};

exports.uploadCardAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Verify user has permission to edit this card
    const list = await List.findById(card.list);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create attachment object with metadata
    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `${process.env.BASE_URL}/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    if (!card.attachments) card.attachments = [];
    card.attachments.push(attachment);
    await card.save();

    // Populate the uploaded by user info for response
    await card.populate('attachments.uploadedBy', 'name email');

    res.status(200).json({ 
      message: 'File uploaded successfully', 
      attachment: attachment,
      card: card
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 5 files allowed.' });
    }
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
