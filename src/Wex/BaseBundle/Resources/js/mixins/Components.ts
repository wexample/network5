import MixinInterface from "../interfaces/MixinInterface";
import MixinsAppService from "../class/MixinsAppService";
import AppService from "../class/AppService";
import PageRenderDataInterface from "../interfaces/PageRenderDataInterface";
import Page from "../class/Page";

const mixin: MixinInterface = {
    name: 'components',

    hooks: {
        page: {
            loadPageRenderData(page:Page, data: PageRenderDataInterface, registry: any) {
                // Wait for page loading.
                if (registry.MixinPage !== MixinsAppService.LOAD_STATUS_COMPLETE) {
                    return MixinsAppService.LOAD_STATUS_WAIT;
                }

                this.app.getService('components').initAll(
                    page.el,
                    'page',
                    page.name
                );

                return MixinsAppService.LOAD_STATUS_COMPLETE;
            },
        },
    },

    service: class extends AppService {
        initAll(
            elContext: HTMLElement,
            initContextType: string,
            initContextName: string
        ) {
            // TODO
            console.log(elContext);
            console.log(initContextType);
            console.log(initContextName);
        }
    }
};

export default mixin;
