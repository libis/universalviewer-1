import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import "../../../node_modules/@google/model-viewer/dist/model-viewer-legacy";
import { AnnotationBody, Canvas, IExternalResource } from "manifesto.js";
import { sanitize } from "../../Utils";
import { BaseEvents } from "../uv-shared-module/BaseEvents";
import { CenterPanel } from "../uv-shared-module/CenterPanel";
import { Events } from "../../extensions/uv-model-viewer-extension/Events";

export class ModelViewerCenterPanel extends CenterPanel {
  $modelViewer: JQuery;
  $spinner: JQuery;

  constructor($element: JQuery) {
    super($element);
  }

  create(): void {
    this.setConfig("modelViewerCenterPanel");

    super.create();

    const that = this;

    this.component.subscribe(
      BaseEvents.OPEN_EXTERNAL_RESOURCE,
      (resources: IExternalResource[]) => {
        that.openMedia(resources);
      }
    );

    this.title = this.extension.helper.getLabel();

    this.$spinner = $('<div class="spinner"></div>');
    this.$content.prepend(this.$spinner);

    this.$modelViewer = $(
      `<model-viewer 
        ${this.config.options.autoRotateEnabled ? 'auto-rotate' : ''} 
        ${this.config.options.interactionPromptEnabled ? 'interaction-prompt' : 'interaction-prompt="none"'}
        camera-controls 
        style="background-color: unset;"></model-viewer>`
    );

    this.$content.prepend(this.$modelViewer);

    this.$modelViewer[0].addEventListener("load", () => {
      this.$content.removeClass("loading");
      this.$spinner.hide();
    });

    this.$modelViewer[0].addEventListener("camera-change", (obj) => {
      this.component.publish(Events.CAMERA_CHANGE, obj);
    });

    this.component.publish(BaseEvents.MEDIA_CHANGE);
  }

  async openMedia(resources: IExternalResource[]) {
    this.$spinner.show();
    await this.extension.getExternalResources(resources);

    let mediaUri: string | null = null;
    let canvas: Canvas = this.extension.helper.getCurrentCanvas();
    const formats: AnnotationBody[] | null = this.extension.getMediaFormats(
      canvas
    );

    if (formats && formats.length) {
      mediaUri = formats[0].id;
    } else {
      mediaUri = canvas.id;
    }

    this.$modelViewer.attr("src", mediaUri);

    // todo: look for choice of usdz, if found, add ar attribute or hide ar button using --ar-button-display
    // use choice for this? https://github.com/edsilv/biiif/issues/13#issuecomment-383504734
    // mediaUri = mediaUri.substr(0, mediaUri.lastIndexOf(".")) + ".usdz";
    // this.$modelViewer.attr("ios-src", mediaUri);

    this.component.publish(BaseEvents.MEDIA_CHANGE);
  }

  resize() {
    super.resize();

    this.$spinner.css(
      "top",
      this.$content.height() / 2 - this.$spinner.height() / 2
    );
    this.$spinner.css(
      "left",
      this.$content.width() / 2 - this.$spinner.width() / 2
    );

    if (this.title) {
      this.$title.text(sanitize(this.title));
    }

    if (this.$modelViewer) {
      this.$modelViewer.width(this.$content.width());
      this.$modelViewer.height(this.$content.height());
    }
  }
}
