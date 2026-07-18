const Category = require('../models/categoryModel');

// POST /categories
exports.createCategory = async (req, res) => {
  try {
    const { name, icon_url } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.findByName(name);
    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, icon_url });
    return res.status(201).json(category);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

// GET /categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// GET /categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json(category);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch category' });
  }
};

// PUT /categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon_url } = req.body;

    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }
//
    if (name) {
      const duplicate = await Category.findByName(name);
      if (duplicate && duplicate.id !== existing.id) {
        return res.status(409).json({ message: 'Category name already exists' });
      }
    }

    const updated = await Category.update(req.params.id, {
      name: name ?? existing.name,
      icon_url: icon_url ?? existing.icon_url,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update category' });
  }
};

// DELETE /categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.remove(req.params.id);
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.statusCode === 409) {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};