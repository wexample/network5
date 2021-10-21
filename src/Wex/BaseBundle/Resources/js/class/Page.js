
export default class {
    static getPageLevelMixins() {
        return {};
    }

    constructor(app, data) {
        this.app = app;

        if (data.main) {
            this.app.pageMain = this;
        }



        this.init(data);
    }

    loadData(data) {
        // No action for now.
    }

    init(data) {
        this.loadData(data);

        this.app.mixin.invokeUntilComplete('init', 'page', [data]);
    }
}
