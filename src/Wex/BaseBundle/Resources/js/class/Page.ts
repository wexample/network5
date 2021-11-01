import App from "./App";
import PageResponsiveDisplay from "./PageResponsiveDisplay";
import PageRenderDataInterface from "../interfaces/PageRenderDataInterface";

export default class {
    public readonly app: App;
    protected readonly isLayoutPage: boolean;
    protected readonly name: string;
    private readonly onChangeResponsiveSizeProxy: Function;
    protected readonly responsiveDisplays: any = [];
    protected responsiveDisplayCurrent: PageResponsiveDisplay;
    public vars: any;

    constructor(app: App, renderData: PageRenderDataInterface) {
        this.app = app;
        this.isLayoutPage = renderData.isLayoutPage;
        this.name = renderData.name;

        this.loadRenderData(renderData);

        if (this.isLayoutPage) {
            this.app.layoutPage = this;
        }

        this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);

        this.app
            .getService('events')
            .listen(
                'responsive-change-size',
                this.onChangeResponsiveSizeProxy
            );

        this.updateCurrentResponsiveDisplay();

        this.init(renderData);
    }

    init(pageRenderData: any) {
        // To override...
    }

    exit() {
        // To override...
    }

    destroy() {
        this.app
            .getService('events')
            .forget(
                'responsive-change-size',
                this.onChangeResponsiveSizeProxy
            );

        this.exit();
    }

    loadRenderData(renderData: PageRenderDataInterface) {
        this.vars = renderData.vars;
    }

    updateCurrentResponsiveDisplay() {
        let responsiveMixin = this.app.getService('responsive');
        let previous = responsiveMixin.responsiveSizePrevious;
        let current = responsiveMixin.responsiveSizeCurrent;

        if (previous !== current) {
            if (this.responsiveDisplays[current] === undefined) {
                let display = this.app.getBundleClassDefinition(
                    'page',
                    `${this.name}-${current}`
                );

                this.responsiveDisplays[current] = display ? (new display(this)) : null;
            }

            if (this.responsiveDisplays[previous]) {
                this.responsiveDisplays[previous].onResponsiveExit();
            }

            if (this.responsiveDisplays[current]) {
                this.responsiveDisplays[current].onResponsiveEnter();
            }

            this.responsiveDisplayCurrent = this.responsiveDisplays[current];
        }
    }

    onChangeResponsiveSize() {
        this.updateCurrentResponsiveDisplay();
    }
}
