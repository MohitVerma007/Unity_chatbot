const { Router } = require("express");
const { config } = require("dotenv");
config();


// const configureUploader = require('../middlewares/uploader'); // Import the uploader
// const upload = configureUploader('uploads/profile'); // Define the path only once



const {
  getUsers,
  register,
  login,
  protected,
  logout,
  updateUser,
  getUserById,
  deleteUserById,
} = require("../controllers/auth");
const {
  validationMiddleware,
} = require("../middlewares/validations-middleware");
const { registerValidation, loginValidation } = require("../validators/auth");
const { userAuth } = require("../middlewares/auth-middleware");
const router = Router();

router.get("/get-users", getUsers);
router.get("/get-user/:userId", getUserById);
router.patch("/update-profile/:userId", updateUser);
router.get("/protected", userAuth, protected);
router.post("/register", registerValidation, validationMiddleware, register);
router.post("/login", loginValidation, validationMiddleware, login);
router.get("/logout", logout);
router.delete("/delete-user/:id", deleteUserById)

module.exports = router;
