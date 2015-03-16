import {Component, Template} from 'angular2/angular2';
import {InsertComponent} from './insertComponent'

@Component({
    selector: 'main'
})
@Template({
    inline:
`<div>
Component module:<br><input #componentmodule type="text" value="hello"><br><br>
Component properties:<br><textarea #componentproperties>{"name":"world"}</textarea><br><br>
<button (click)="loadComponent(componentmodule.value, componentproperties.value)">Display</button><br><br>
</div>
<div style="border:1px solid black; padding: 10px;">
    <div *insert="myDynamicComponent with-properties myDynamicComponentProperties"></div>
</div>
`,
    directives: [InsertComponent]
})
class Main {
    myDynamicComponent;
    myDynamicComponentProperties;
    currentLoad = null;

    loadComponent(componentModule, componentProperties) {
        this.myDynamicComponent = null;
        this.myDynamicComponentProperties = null;
        var currentLoad = this.currentLoad = {};
        System.import(componentModule).then((componentModuleRef) => {
            if (currentLoad !== this.currentLoad) { return; }
            this.myDynamicComponent = componentModuleRef.default;
            this.myDynamicComponentProperties = JSON.parse(componentProperties);
        }).catch(console.error.bind(console));
    }
}

export default Main;
