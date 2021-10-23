export default class {
    constructor(app, pageData) {
        this.app = app;

        this.isLayoutPage = pageData.isLayoutPage;
        this.app.layoutPage = this;
    }
}
