const express = require('express');
const router = express.Router();

router.get("/", (req, res) =>{
    res.send("user list");
  })
  
router.get("/new", (req, res) =>{
    res.render("users/new", {firstName: "Test"})
  })

router.post("/", (req, res) =>{
    res.send("create user");
})

router
.route("/:id", (router
.get("/:id", (req, res) => {
    console.log(req.user);
    res.send("show user id " + req.params.id);
})
.put("/:id", (req, res) => {
    res.send("update user id " + req.params.id);
})
.delete("/:id", (req, res) => {
    res.send("delete user id " + req.params.id);
})
)
)

const users = [{name: "Victor"}, {name: "Stefan"}];
router.param("id", (req, res, next, id) =>{
    req.user = users[id];
    next();
})



module.exports = router;