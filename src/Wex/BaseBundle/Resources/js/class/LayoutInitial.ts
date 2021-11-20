import Layout from './Layout';
import App from './App';

export default class extends Layout {
  public id: string = 'layout-initial';

  constructor(app: App) {
    super(app);

    this.renderData = app.layoutRenderData;
  }
}
