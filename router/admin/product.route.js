const express = require("express");
const route = express.Router();

const controller = require("../../controllers/admin/product.control");

route.get("/", controller.index);

module.exports = route;