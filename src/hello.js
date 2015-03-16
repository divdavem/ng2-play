import {Component, Template} from 'angular2/angular2';

@Component({
    bind: {
        "name": "name"
    }
})
@Template({
    inline: 'Hello {{name}} !'
})
class Hello {}

export default Hello;
