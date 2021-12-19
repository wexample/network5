import Component from '../../../src/Wex/BaseBundle/Resources/js/class/Component';

export default class extends Component {
  mounted() {
    this.el.innerHTML = `<span class="success">✓</span>${this.el.innerHTML}`;
  }
}
