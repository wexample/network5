import App from "./App";

export default class {
    public static classContext: 'page'
    protected readonly isLayoutPage: boolean;
    protected readonly app: App;

    constructor(app, pageRenderData) {
        this.app = app;
        this.isLayoutPage = pageRenderData.isLayoutPage;

        if (this.isLayoutPage) {
            this.app.layoutPage = this;
        }

        this.init(pageRenderData);
    }

    init(pageRenderData: any) {
        // To override...
    }

    onChangeResponsiveSize(current: string, previous?: string) {
        // To override...
    }
}
