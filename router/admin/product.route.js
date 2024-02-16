const express = require("express");
const route = express.Router();
const multer = require('multer');
const storageMulter = require("../../helpers/storageMulter");
const upload = multer({ storage: storageMulter() });

const controller = require("../../controllers/admin/product.control");
const validates = require("../../validates/admin/products.validate")

route.get("/", controller.index);

route.patch("/change-status/:status/:id", controller.changeStatus);

route.patch("/change-multi", controller.changeMulti);

route.delete("/delete/:id", controller.deleteItem);

route.get("/create", controller.create);

route.post("/create", upload.single("thumbnail"), validates.create, controller.createPost
);

route.get("/edit/:id", controller.edit);

route.patch("/edit/:id", upload.single("thumbnail"), validates.create, controller.editPatch);


module.exports = route;