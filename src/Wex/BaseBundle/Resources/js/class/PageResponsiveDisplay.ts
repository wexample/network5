import App from "./App";
import Page from "./Page";

export default class {
    protected readonly app: App;
    protected readonly page: Page;

    constructor(page, renderData) {
        this.page = page;
        this.app = this.page.app;

        this.init(renderData);
    }

    init(renderData: any) {
        // To override...
    }
}
