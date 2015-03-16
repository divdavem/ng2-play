import {Compiler, Viewport, ViewContainer, ProtoView, ChangeDetection, onChange, onDestroy} from 'angular2/angular2';
import {EventManager} from 'angular2/src/core/events/event_manager';
import {Reflector} from 'angular2/src/reflection/reflection';
import {ProtoElementInjector} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';

@Viewport({
    selector: '[insert]',
    lifecycle: [onChange, onDestroy],
    bind: {
        'component': 'insert',
        'componentProperties': 'with-properties'
    }
})
export class InsertComponent {
    viewContainer: ViewContainer;
    compiler: Compiler;
    eventManager: EventManager;
    reflector: Reflector;
    directiveMetaDataReader: DirectiveMetadataReader;
    changeDetection: ChangeDetection;

    component = null;
    componentProperties = null;
    _compiling = null;
    _view = null;

    constructor(viewContainer: ViewContainer, compiler: Compiler, eventManager: EventManager, reflector: Reflector, directiveMetaDataReader: DirectiveMetadataReader, changeDetection: ChangeDetection) {
        if (viewContainer.defaultProtoView.isTemplateElement) {
            throw new Error('The insert directive should not be used on a template element. Use it with *insert="..."')
        }
        this.viewContainer = viewContainer;
        this.compiler = compiler;
        this.eventManager = eventManager;
        this.reflector = reflector;
        this.directiveMetaDataReader = directiveMetaDataReader;
        this.changeDetection = changeDetection;
    }

    onDestroy () {
        this._compiling = null;
    }

    onChange (changes) {
        var component = this.component;
        if (!! changes.component) {
            var compiling = this._compiling = {};
            this.viewContainer.clear();
            this._view = null;
            this._componentDirective = null;
            if (component) {
                // cf bootstrap in https://github.com/angular/angular/blob/master/modules/angular2/src/core/application.js#L61
                this.compiler.compile(component).then((protoView) => {
                    if (compiling !== this._compiling) {
                        // the component has changed while compiling
                        return;
                    }
                    var defaultProtoView = this.viewContainer.defaultProtoView;
                    var wrappingProtoView = new ProtoView(defaultProtoView.element, this.changeDetection.createProtoChangeDetector('root'), defaultProtoView.shadowDomStrategy);
                    var binder = wrappingProtoView.bindElement(new ProtoElementInjector(null, 0, [component], true));
                    this._componentDirective = binder.componentDirective = this.directiveMetaDataReader.read(component);
                    binder.nestedProtoView = protoView;
                    wrappingProtoView.rootBindingOffset = 1;

                    var hostElementInjector = this.viewContainer.hostElementInjector;
                    var newView = this._view = wrappingProtoView.instantiate(hostElementInjector, this.eventManager, this.reflector);
                    this.viewContainer.insert(newView);
                    newView.hydrate(this.viewContainer.appInjector, hostElementInjector, {});
                    this._refreshProperties();
                });
                return;
            }
        }
        if (!! changes.componentProperties) {
            this._refreshProperties();
        }
    }

    _refreshProperties () {
        var componentProperties = this.componentProperties;
        if (this.component && componentProperties) {
            var bind = this._componentDirective.annotation.bind;
            var context = this._view.componentChildViews[0].context;
            for (var property in componentProperties) {
                // Currently it only supports bindings with the same name (bind[property] == property)
                // for full support, see https://github.com/angular/angular/blob/master/modules/angular2/src/core/compiler/pipeline/element_binder_builder.js#L230
                // The compiler should probably build a setProperty method to easily set any property of a component.
                if (componentProperties.hasOwnProperty(property)) {
                    if (!bind || bind[property] != property) {
                        throw new Error("InsertComponent: no binding or unsupported binding for property " + property);
                    }
                    context[property] = componentProperties[property];
                }
            }
        }
    }
}

