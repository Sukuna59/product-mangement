const Product = require("../../models/product.model")
const filterStatusHelpers = require("../../helpers/filter-status")
const sreachHelpers = require("../../helpers/sreach")
const paginationHelpers = require("../../helpers/pagination")

const systemConfig = require("../../config/system")

// [GET] /admin/products
module.exports.index = async (req, res) => {

  let find = {
    deleted: false
  };

  // filterStatus
  let filterStatus = filterStatusHelpers(req.query);
  if (req.query.status) {
    find.status = req.query.status;
  }
  // End filterStatus 

  // Sreach
  let objectSreach = sreachHelpers(req.query);
  if (objectSreach.regex) {
    find.title = objectSreach.regex;
  }
  // End sreach

  // Pagination
  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitItem: 4,
    },
    req.query,
    countProducts
  )
  // End pagination

  const products = await Product.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

  res.render("admin/pages/products/index", {
    pageTitle: "trang Sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSreach.keyword,
    pagination: objectPagination
  });
}

// [PATCH] /admin/product/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });

  req.flash('success', 'Đã cập nhập trạng thái thành công');
  res.redirect('back');
}

// [PATCH] /admin/product/change-status/:status/:id
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash('success', `Đã cập nhập trạng thái ${ids.length} sản phẩm`);
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      req.flash('success', `Đã cập nhập trạng thái ${ids.length} sản phẩm`);
      break;
    case "delete-all":
      await Product.updateMany({ _id: { $in: ids } },
        {
          deleted: true,
          deletedAt: new Date()
        });
      req.flash('success', `Đã xoá ${ids.length} sản phẩm`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({ _id: id }, { position: position });
      }
      req.flash('success', `Đã thay đổi vị trí ${ids.length} sản phẩm`);
      break;
    default:
      break;
  }
  res.redirect('back');
}

// [DELETE] /admin/product/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;

  // await Product.deleteOne({ _id: id });
  await Product.updateOne({ _id: id },
    {
      deleted: true,
      deletedAt: new Date()
    });
  req.flash('success', `Đã xoá thành công sản phẩm`);
  res.redirect('back');
}

module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    pageTitle: "tạo mới sản phẩm"
  });
}

module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.sock = parseInt(req.body.sock);

  if (req.body.position == "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  req.body.thumbnail = `/uploads/${req.file.filename}`;

  const product = new Product(req.body);
  product.save();

  req.flash("success", "Thêm mới sản phẩm thành công!");

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};
