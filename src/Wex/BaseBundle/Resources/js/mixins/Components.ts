import MixinInterface from "../interfaces/MixinInterface";
import MixinsAppService from "../class/MixinsAppService";
import AppService from "../class/AppService";
import PageRenderDataInterface from "../interfaces/PageRenderDataInterface";
import Page from "../class/Page";
import ComponentRenderDataInterface from "../interfaces/ComponentRenderDataInterface";

const mixin: MixinInterface = {
    name: 'components',

    hooks: {
        page: {
            loadPageRenderData(page: Page, registry: any) {
                // Wait for page loading.
                if (registry.MixinPages !== MixinsAppService.LOAD_STATUS_COMPLETE) {
                    return MixinsAppService.LOAD_STATUS_WAIT;
                }

                let componentsService = this.app.getService('components');
                page.renderData.components.forEach((componentData: ComponentRenderDataInterface) => {
                    componentsService.create(
                        page.el,
                        componentData
                    );
                });

                return MixinsAppService.LOAD_STATUS_COMPLETE;
            },
        },
    },

    service: class extends AppService {
        create(
            elContext: HTMLElement,
            renderData: ComponentRenderDataInterface
        ) {
            let classDefinition =
                this.app.getBundleClassDefinition(
                    'component',
                    renderData.name
                );

            let component = new classDefinition(elContext, renderData);
            component.init(renderData);
        }
    }
};

export default mixin;
