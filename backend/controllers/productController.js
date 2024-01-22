const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../middleware/asyncHandler');

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-rating,price';
  req.query.fields = 'name,price,rating,short_description,brand';
  next();
};

// ROUTE HANDLERS

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  // EXECUTE QUERY
  const features = new APIFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// @desc    Fetch a product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Public
exports.createProduct = asyncHandler(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

// @desc    Update a product
// @route   PATCH /api/products/:id
// @access  Public
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'sucess',
    data: {
      product,
    },
  });
});

// @desc    Delete a product
// @route   Delete /api/products/:id
// @access  Public
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

// @desc    Get product stats
// @route   GET /api/products/product-stats
// @access  Public
exports.getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { rating: { $gte: 4.2 } },
    },
    {
      $group: {
        _id: { $toUpper: '$category' },
        numProducts: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
