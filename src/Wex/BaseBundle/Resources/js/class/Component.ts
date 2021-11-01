import AppChild from "./AppChild";
import ComponentRenderDataInterface from "../interfaces/ComponentRenderDataInterface";
import {findPreviousNode as DomFindPreviousNode} from "../helpers/Dom";

export default abstract class Component extends AppChild {
    el: HTMLElement
    elContext: HTMLElement

    public static INIT_MODE_CLASS: string = 'class';

    public static INIT_MODE_PARENT: string = 'parent';

    public static INIT_MODE_PREVIOUS: string = 'previous';

    protected constructor(elContext, renderData: ComponentRenderDataInterface) {
        super(renderData);

        this.elContext = elContext;
        let elPlaceholder = this.elContext.querySelector('.' + renderData.id) as HTMLElement;
        let removePlaceHolder = true;

        switch (renderData.initMode) {
            case Component.INIT_MODE_CLASS:
                this.el = elPlaceholder;
                removePlaceHolder = false;
                break;
            case Component.INIT_MODE_PARENT:
                this.el = elPlaceholder.parentElement;
                break;
            case Component.INIT_MODE_PREVIOUS:
                this.el = DomFindPreviousNode(elPlaceholder);
                break;
        }

        if (removePlaceHolder) {
            // Remove placeholder tag as it may interact with CSS or JS selectors.
            elPlaceholder.parentNode.removeChild(elPlaceholder);
        }
    }


    public init(renderData: ComponentRenderDataInterface) {
        // To override...
    }
}
