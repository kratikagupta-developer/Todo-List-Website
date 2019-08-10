//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admit-kratika:Test123@cluster0-h4hpw.mongodb.net/todolistDB", { useNewUrlParser: true })

//schema
const itemschema = {
    item: String
}

//model initializer
const Item = mongoose.model(
    "Item", itemschema
);

const item1 = new Item({
    item: "Welcome to todo list"
})

const item2 = new Item({
    item: "Hit the  + button to add new item."
})

const item3 = new Item({
    item: " Hit this to delete an item."
})
const defaultitems = [item1, item2, item3]

const listschema = {
    name: String,
    items: [itemschema]
}
const List = mongoose.model("List", listschema)

const workItems = [];

app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultitems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successful")
                }
            });
            res.redirect("/");
        } else {
            console.log(foundItems)
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })



});

app.post("/", function(req, res) {

    const newitem = req.body.newItem;
    const listname = req.body.list;
    console.log(req.body)
    const item = new Item({
        item: newitem
    });

    if (listname === "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({ name: listname }, function(err, foundlist) {

            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/" + listname);


        })
    }

});

app.post("/delete", function(req, res) {
    const checkeddelete = req.body.checkbox
    const listname = req.body.listname
    console.log("in delete")
    if (listname === "Today") {
        Item.findByIdAndRemove(checkeddelete, function(err) {
            if (!err) {
                console.log("deleted checked Item")
            } else {
                console.log(err)
            }
        })
        res.redirect("/")

    } else {
        List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: checkeddelete } } }, function(err, foundlist) {
            if (!err) {
                res.redirect("/" + listname)
            }

        })
    }

})
app.get("/work", function(req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/:Customelistname", function(req, res) {
    const Customelistnam = _.capitalize(req.params.Customelistname)
    console.log(Customelistnam)
    List.findOne({ name: Customelistnam }, function(err, foundlist) {
        if (!err) {
            if (!foundlist) {
                //Create a new list
                const list = new List({
                    name: Customelistnam,
                    items: defaultitems
                });
                list.save()
                res.redirect("/" + Customelistnam)
                console.log("Does Not exist in Database")
            } else {
                //Show existing list
                res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items })
                console.log("List already exist in Database")
            }
        }

    })

})

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000 || process.env.PORT, function() {
    console.log("Server started");
});