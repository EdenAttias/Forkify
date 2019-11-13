import axios from 'axios';
import { key } from '../confing';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {

            //const res = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            //console.log(res);

        } catch (error) {
            alert('Somthing went wrong');
        }
    }

    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    };

    calcServings() {
        this.servings = 4;
    };

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce',
            'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz',
            'tps', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort,'kg','g'];

        const newIngredients = this.ingredients.map(el => {
            
            // 1) Uniform units.
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2) Remove ().
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // Parse ingredient into count.
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2))

            let objIng
            if (unitIndex > -1) {

                let count;
                const arrayCount = arrIng.slice(0, unitIndex);

                if (arrayCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            } else {
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type){
        const newServing = type === 'dec'? this.servings - 1 : this.servings + 1;

        //Update Ingredients
        this.ingredients.forEach(ing =>{
            ing.count *= (newServing / this.servings)
        });

        this.servings = newServing;
    }
}