const Product = require("../../models/product.model");

module.exports.index = async (req, res) => {
  const products = await Product.find({
    status: 'active',
    deleted: false
  });

  const newProduct = products.map((item) => {
    item.newPrice = (item.price * (100 - item.discountPercentage) / 100).toFixed();
    return item;
  })
  console.log(newProduct);

  res.render("client/pages/products/index.pug", {
    pageTitle: "Sản Phẩm",
    products: newProduct,
  });
}