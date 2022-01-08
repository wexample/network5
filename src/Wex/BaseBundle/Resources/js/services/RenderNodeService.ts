import AbstractRenderNodeService from './AbstractRenderNodeService';
import RenderNodeUsage from '../class/RenderNodeUsage';
import Animation from '../class/RenderNodeUsage/Animation';
import ColorScheme from '../class/RenderNodeUsage/ColorScheme';
import Initial from '../class/RenderNodeUsage/Initial';
import Responsive from '../class/RenderNodeUsage/Responsive';
import Shape from '../class/RenderNodeUsage/Shape';

export default class RenderNodeService extends AbstractRenderNodeService {
  public usages: { [key: string]: RenderNodeUsage } = {};

  constructor(props) {
    super(props);

    [Animation, ColorScheme, Initial, Responsive, Shape].forEach(
      (definition: any) => {
        let usage = new definition(this.app);

        this.usages[usage.name] = usage;
      }
    );
  }
}
