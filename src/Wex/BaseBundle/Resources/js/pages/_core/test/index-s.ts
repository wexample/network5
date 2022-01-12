import PageResponsiveDisplay from "../../../class/PageResponsiveDisplay";

export default class extends PageResponsiveDisplay {
  async onResponsiveEnter() {
    // To override.
    this.page.vars.hasDisplayLoaded = 's';
    console.log('SMALL' + this.page.name);
  }

  async onResponsiveExit() {
    // To override.
    this.page.vars.hasDisplayLoaded = false;
  }
}
