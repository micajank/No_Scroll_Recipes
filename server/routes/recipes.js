const express = require("express");
const router = express.Router();
const db = require("../models/index");
const cors = require ('cors');

router.use(cors());

router.get("/", (req, res) => {
    console.log(req.query.tags + "🙄")
    let searchParams = req.query.tags ? 
    { tags: { $all: req.query.tags.split(',').map(tag=>tag.toLowerCase().trim()) } } : 
    {} 

    console.log( searchParams + "🥶" )
    db.Recipe.find( searchParams )
    .populate("userId", "name")
    .then(recipes => {
        res.send(recipes)
    }).catch(err=>res.send({ message: "Error in getting all recipes", err }));
});

router.get("/about", (req, res) => {
    
    res.send("This route will render an about page");
})

router.get("/:id", (req, res) => {
    db.Recipe.findById(req.params.id)
    .then(recipe=>res.send(recipe))
    .catch(err=>res.send({message: 'error in getting one recipe', err}));
})

router.post("/", (req, res) => {
    // console.log(req.body)
    // Remove any keys that have no value

//     req.body.tags = req.body.tags.split(',').map(tag=>tag.toLowerCase().trim());
//     req.body.directions = req.body.directions.split(',').map(direction=>direction.trim());
//     req.body.ingredients = req.body.ingredients.split(',').map(ingredient=>ingredient.toLowerCase().trim());

    // let newRecipe = Object.keys(req.body).forEach((key) => (req.body[key] == '') && delete req.body[key]);
    let newRecipe = req.body;
    newRecipe.tags = req.body.tags.split(',').map(tag=>tag.toLowerCase().trim());
    newRecipe.directions = req.body.directions.split(',').map(direction=>direction.trim());
    newRecipe.ingredients = req.body.ingredients.split(',').map(ingredient=>ingredient.toLowerCase().trim());

    //need to pass user to new recipes (here or front end???)
    console.log(newRecipe);
    db.Recipe.create({
        title: newRecipe.title,
        alt: newRecipe.alt,
        userId: newRecipe.userId,
        image: newRecipe.image,
        servings: newRecipe.servings,
        description: newRecipe.description,
        directions: newRecipe.directions,
        ingredients: newRecipe.ingredients,
        date: newRecipe.date,
        tags: newRecipe.tags
    })
    .then(recipe => {
        console.log("Recipe", recipe)
        db.User.findByIdAndUpdate(recipe.userId,
            {$addToSet: { userRecipes: recipe._id }},
            {safe: true}
        )
        .then((updated)=>res.send(recipe))
        .catch(err=>res.send({ message: 'Error in adding userRecipe to user', err}));
    })
    .catch(err=>res.send({ message: 'Error in creating one recipe', err}));
})

// we will need to decide which part of the recipe schema to update - title, ingredients, etc
// will be similar to process of how recipe ingredients are created - however that is sent back

router.put("/:id", (req, res) => {
    req.body.servings = parseInt(req.body.servings)
    req.body.tags = req.body.tags.split(',').map(tag=>tag.toLowerCase().trim());
    req.body.directions = req.body.directions.split(',').map(direction=>direction.trim());
    req.body.ingredients = req.body.ingredients.split(',').map(ingredient=>ingredient.toLowerCase().trim());
    db.Recipe.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        alt: req.body.alt,
        userId: newRecipe.userId,
        image: req.body.image,
        servings: req.body.servings,
        description: req.body.description,
        directions: req.body.directions,
        ingredients: req.body.ingredients,
        tags: req.body.tags
    }, (err, recipe) => res.send( recipe ))
    // .then(recipe => )
})

router.delete('/:id', (req, res) => {
    db.Recipe.findByIdAndDelete(req.params.id)
    .then(recipe => res.redirect('/'))
    .catch(err=> res.send({ message: 'error in deleting item', err}));
})


module.exports = router;