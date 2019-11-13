export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) {

        const like = { id, title, author, img };
        this.likes.push(like);

        // Save the data in local storage
        this.saveData()

        return like;
    }

    deleteLike(id) {

        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);

        // Save the data in local storage
        this.saveData();
    }

    isLiked(id) {

        return this.likes.findIndex(el => el.id === id) !== -1;

    }

    getNumOfLikes() {

        return this.likes.length;
    }

    saveData() {

        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        if (storage) this.likes = storage;
    }

}