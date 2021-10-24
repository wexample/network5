import App from "./App";

export default class {
    private readonly isLayoutPage: boolean;
    private readonly app: App;

    constructor(app, pageData) {
        this.app = app;
        this.isLayoutPage = pageData.isLayoutPage;

        if (this.isLayoutPage) {
            this.app.layoutPage = this;
        }
    }
}
