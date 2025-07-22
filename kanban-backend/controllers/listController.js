const List = require('../models/List');
const Board = require('../models/Board');

exports.createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ message: 'Title and boardId are required' });
    }

    // Verify the board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has permission to add lists to this board
    if (!board.administrators.includes(req.user._id) && 
        !board.permissions.edit.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this board' });
    }

    const list = new List({
      title,
      board: boardId,
      createdBy: req.user._id,
      order: await List.countDocuments({ board: boardId })
    });

    await list.save();
    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Failed to create list', error: error.message });
  }
};

exports.getListsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    console.log('Fetching lists for board:', boardId, 'User:', req.user._id);

    // Verify the board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      console.log('Board not found:', boardId);
      return res.status(404).json({ message: 'Board not found' });
    }

    console.log('Board found:', board.name, 'Visibility:', board.visibility);
    console.log('Board administrators:', board.administrators);
    console.log('Board permissions:', board.permissions);

    // Check if user has permission to view this board
    const canView = board.canView(req.user._id);
    console.log('User can view board:', canView);
    
    if (!canView) {
      return res.status(403).json({ message: 'Not authorized to view this board' });
    }

    const lists = await List.find({ board: boardId })
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    console.log('Lists found:', lists.length);
    res.status(200).json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Failed to fetch lists', error: error.message });
  }
};

exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;

    const list = await List.findById(id);
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

    if (title) list.title = title;
    if (order !== undefined) list.order = order;

    await list.save();
    res.status(200).json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Failed to update list' });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await List.findById(id);
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

    await List.findByIdAndDelete(id);
    res.status(200).json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Failed to delete list' });
  }
};
