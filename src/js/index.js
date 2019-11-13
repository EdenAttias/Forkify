import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import *  as searchView from './views/searchView'
import *  as recipeView from './views/recipeView'
import *  as listView from './views/listView'
import *  as likesView from './views/likesView'
import { elements, renderLoader, clearLoader } from './views/base'

/**App global State
* - Search object.
* - Current recipe object.
* - Shopping list object.
* - Liked recipes.
*/
/******************************************************** */

const state = {};
//window.state = state;

/**
 * SEARCH CONTROLLER.
 */
const controlSearch = async () => {
    //1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Preper UI for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResult();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something went wrong with the search');
            clearLoader();
        }

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        //console.log(goToPage);
    }
});

/******************************************************** */

/**
 * RECIPE CONTROLLER.
 */

const controlRecipe = async () => {
    // Get ID from URL
    const id = window.location.hash.replace('#', '');
    //console.log(id);

    if (id) {

        //HighLight Selected Item
        if (state.search) { searchView.highLightSelected(id); }


        // Prepare UI for changes.
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Create new Recipe obj.
        state.recipe = new Recipe(id);
        try {
            // Get recipe data.
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calcTime && calcServings.
            state.recipe.calcServings();
            state.recipe.calcTime();

            // Render recipe
            //console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(
                state.recipe, state.likes.isLiked(id));
        } catch (error) {
            alert('Error processing recipe');
            console.log(error)
        }

    }
};

/******************************************************** */

/**
 * LIST CONTROLLER.
 */

const controlList = () => {

    // Create a new list if needed
    if (!state.list) {
        state.list = new List();
        console.log(state.list);
    }
    // Add ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};


/******************************************************** */

/**
 * LIKES CONTROLLER.
 */


const controlLike = () => {

    if (!state.likes) {
        state.likes = new Likes();
    }
    const currentId = state.recipe.id;

    if (!state.likes.isLiked(currentId)) {
        // Add like state

        const newLike = state.likes.addLike(
            currentId, state.recipe.title,
            state.recipe.author, state.recipe.img
        );

        // Toggle like button
        console.log('tets');
        likesView.toggleLikeButton(true);

        // Add like to UI
        likesView.renderLike(newLike);

        // Change recipe status to liked

    } else {
        // Remove like state

        state.likes.deleteLike(currentId);

        // Toggle like button

        likesView.toggleLikeButton(false);

        // Remove like to UI
        likesView.deleteLike(currentId);

        // Change recipe status to unliked

    }

    likesView.toggleLikesMenu(state.likes.getNumOfLikes());
};



/********************************************************/



// Handle delete and update list item events

elements.shopping.addEventListener('click', e => {

    const id = e.target.closest('.shopping__item').dataset.itemid;
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {

        state.list.deleteItem(id);
        listView.deleteItem(id);

    } else if (e.target.matches('.shopping__count-value')) {

        const val = parseFloat(e.target.value, 10);
        if (val > 0) {
            state.list.updateCount(id, val);
        }
    }
});

/******************************************************** */

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load',controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Recipe button Clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {

            state.recipe.updateServings('dec');
            recipeView.updateServingIng(state.recipe);

        }

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {

        state.recipe.updateServings('inc');
        recipeView.updateServingIng(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //console.log('Tets');
        controlLike();
    }
    //console.log(state.recipe);
});

//Restore Likes when the page loads

window.addEventListener('load', () => {

    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikesMenu(state.likes.getNumOfLikes());

    state.likes.likes.forEach(like => likesView.renderLike(like));

});


