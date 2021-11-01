import App from "./App";
import PageResponsiveDisplay from "./PageResponsiveDisplay";
import PageRenderDataInterface from "../interfaces/PageRenderDataInterface";
import AppChild from "./AppChild";

export default class extends AppChild {
    public readonly el: HTMLElement;
    public readonly isLayoutPage: boolean;
    public readonly name: string;
    protected readonly onChangeResponsiveSizeProxy: Function;
    protected readonly responsiveDisplays: any = [];
    public responsiveDisplayCurrent: PageResponsiveDisplay;
    public vars: any;

    constructor(app: App, renderData: PageRenderDataInterface) {
        super(app);

        this.isLayoutPage = renderData.isLayoutPage;
        this.name = renderData.name;

        if (this.isLayoutPage) {
            this.app.layoutPage = this;
            this.el = this.app.elLayout;
        }

        this.loadRenderData(renderData);

        this.onChangeResponsiveSizeProxy = this.onChangeResponsiveSize.bind(this);

        this.app
            .getService('events')
            .listen(
                'responsive-change-size',
                this.onChangeResponsiveSizeProxy
            );

        this.updateCurrentResponsiveDisplay();
    }

    init(pageRenderData: PageRenderDataInterface) {
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
        this.vars = {...this.vars, ...renderData.vars};

        this
            .app
            .getService('mixins')
            .invokeUntilComplete(
                'loadPageRenderData',
                'page',
                [this, renderData]
            );
    }

    updateCurrentResponsiveDisplay() {
        let responsiveMixin = this.app.getService('responsive');
        let previous = responsiveMixin.responsiveSizePrevious;
        let current = responsiveMixin.responsiveSizeCurrent;
        let displays = this.responsiveDisplays;

        if (previous !== current) {
            if (displays[current] === undefined) {
                let display = this.app.getBundleClassDefinition(
                    'page',
                    `${this.name}-${current}`
                );

                displays[current] = display ? (new display(this)) : null;

                if (displays[current]) {
                    displays[current].init();
                }
            }

            if (displays[previous]) {
                displays[previous].onResponsiveExit();
            }

            if (displays[current]) {
                displays[current].onResponsiveEnter();
            }

            this.responsiveDisplayCurrent = displays[current];
        }
    }

    onChangeResponsiveSize() {
        this.updateCurrentResponsiveDisplay();
    }
}
