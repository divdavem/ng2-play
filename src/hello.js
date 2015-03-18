import {Component, Template} from 'angular2/angular2';
import {Switch, SwitchWhen, SwitchDefault, Foreach} from 'angular2/angular2';

@Component({
    selector: 'hello'
})
@Template({
    inline: `
<input type="text" (input)="onInput($event)" placeholder="Type something here"><br>
<ul [switch]="getSwitchValue()">
    <li *switch-when="'empty'">No suggestion</li>
    <li *switch-when="'waiting'">Loading suggestions...</li>
    <template [switch-default]>
      <li *foreach="#suggestion in list">{{suggestion}}</li>
    </template>
</ul>
`,
    directives: [Switch, SwitchWhen, SwitchDefault, Foreach]
})
export class Hello {
    constructor() {
      this.list = null;
    }
    onInput($event) {
      var value = $event.target.value;
      if (value) {
        var promise = this.list = new Promise((resolve) => {
          resolve(["Suggestion 1 for " + value, "Suggestion 2 for " + value]);
        });
        promise.then((resolvedList) => {
          if (this.list != promise) {
            return;
          }
          this.list = resolvedList;
        });
      } else {
        this.list = null;
      }
    }
    getSwitchValue() {
      if (!this.list || this.list.length == 0) {
        return "empty";
      } else if (this.list.then) {
        return "waiting";
      } else {
        return "results";
      }
    }
}
