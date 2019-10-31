function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


function init() {
    document.getElementById('json-file').addEventListener('change', handleFileSelect, false);
}

function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0]);

}

function handleFileLoad(event) {
    try {
        var all = JSON.parse(event.target.result);
        app.flds = all.fields;
        app.old = all.old;
    } catch (e) {
        console.log(e.message);
        alert('Input file error');
    }

    // document.getElementById('fileContent').textContent = ;
}


function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

var app = new Vue({
    el: '#app',
    data: {
        code: '',
        theme: 'bootstrap',
        method: 'get',
        old: '',
        flds: [],
        typ: [
            'row',
            'input',
            'textaera',
            'select',
            'submit'
        ],
        raw: {
            type: 'input',
            name: '',
            label: '',
            size: 12,
            id: '',
            options: ''
        }
    },
    mounted() {
        // sematicui
        this.initSemanticui();

    }, computed: {
        siz: function () {
            if (theme == 'semanticui') {
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            }
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
    }, methods: {

        makeLabel: function (field, inp) {

            var out = '';
            if (field.id.trim() == '') {
                field.id = field.name;
            }

            out += `\t\t <div class="col-md-${field.size} mt-3">\n`;

            out += `\t\t\t <label for="${field.id}"> \n`;
            out += `\t\t\t\t {{__('${field.label}')}} \n`;
            out += `\t\t\t </label> \n`;

            out += inp;
            out += `\t\t </div>\n`;
            return out;
        },
        generateForm: function () {
            var out = '';
            var hasRowBefore = false;
            // make method
            var method = 'get';
            var extMethod = '';
            if (this.method != 'get') {
                method = 'post';
                if (this.method != 'post') {
                    extMethod = `@method('${this.method.toUpperCase()}')`;
                }
            }
            // make class
            var formClass = '';
            var generalClass = '';
            var rowClass = '';
            if (this.theme == 'bootstrap') {
                generalClass = 'form-control';
                rowClass = 'form-group row';
            }

            // make form html
            out += `<form method="${method}" action=""> \n`;
            out += `\t @csrf \n`;
            out += `\t ${extMethod} \n`;
            for (const i in this.flds) {
                var field = this.flds[i];
                switch (field.type) {
                    case "row":
                        if (hasRowBefore) {
                            out += `\t </div>\n`;
                        } else {
                            hasRowBefore = true;
                        }
                        out += `\t <div class="${rowClass}">\n`;
                        break;
                    case 'input':
                        var old = '';
                        if (this.old.trim() !== '') {
                            old = ',' + this.old.replace('#name', field.name);
                        }
                        if (this.theme == 'bootstrap') {
                            var genClass = generalClass + ` @error('${field.name}') is-invalid @enderror`;
                        } else {
                            var genClass = generalClass;
                        }
                        var inp = `\t\t\t <input name="${field.name}" type="${field.option}" class="${genClass}" placeholder="{{__('${field.label}')}}" value="{{old('${field.name}'${old})}}" /> \n`;
                        out += this.makeLabel(field, inp);
                        break;
                    case 'textaera':
                        var old = '';
                        if (this.old.trim() !== '') {
                            old = ',' + this.old.replace('#name', field.name);
                        }
                        if (this.theme == 'bootstrap') {
                            var genClass = generalClass + ` @error('${field.name}') is-invalid @enderror`;
                        } else {
                            var genClass = generalClass;
                        }
                        var inp = `\t\t\t <textarea name="${field.name}" class="${genClass}" placeholder="{{__('${field.label}')}}" >{{old('${field.name}'${old})}}</textarea> \n`;
                        out += this.makeLabel(field, inp);
                        break;
                    case 'select':
                        var old = '';

                        if (this.theme == 'bootstrap') {
                            var genClass = generalClass + ` @error('${field.name}') is-invalid @enderror`;
                        } else {
                            var genClass = generalClass;
                        }
                        var inp = `\t\t\t <select name="${field.name}" id="${field.id}" class="${genClass}" > \n`;
                        try {
                            var ops = field.option.split(':');
                            var rs = ops[0];
                            var r = ops[1];
                            var key = ops[2];
                            var title = ops[3];
                        } catch (e) {
                            alert('invalide options for ' + field.name);
                        }

                        if (this.old.trim() !== '') {
                            old = ',' + this.old.replace('#name', field.name);
                            old = ` @if (old('${field.name}'${old}) == ${r}->${key} ) selected @endif`;
                        } else {
                            old = ` @if (old('${field.name}') == ${r}->${key} ) selected @endif`;
                        }
                        inp += `\t\t\t\t @foreach(${rs} as ${r} ) \n`;
                        inp += `\t\t\t\t\t <option value="{{ ${r}->${key} }}" ${old} > {{${r}->${title}}} </option> \n`;
                        inp += `\t\t\t\t @endforeach \n`;
                        inp += '\t\t\t </select>';

                        out += this.makeLabel(field, inp);
                        break;
                    case 'submit':
                        out += `\t\t <div class="col-md-${field.size}">\n`;

                        out += `\t\t\t <label> &nbsp; </label> \n`;
                        var genClass = 'btn btn-primary mt-2';
                        out += `\t\t\t <input name="${field.name}" type="submit" class="${genClass}" value="{{__('${field.label}')}}" /> \n`;
                        out += `\t\t </div>\n`;
                        break;
                }
            }

            if (hasRowBefore) {
                out += `\t </div> \n`;
            }

            out += `</form>`;

            $("#code").text(out);
            document.querySelectorAll('#code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        },
        addField: function () {
            this.flds.push(clone(this.raw));
            this.initSemanticui();
        },
        initSemanticui: function () {
            setTimeout(function () {
                $('.ui.dropdown').dropdown();
            }, 200);
        }, removeField: function (i) {
            var fls = [];
            for (const k in this.flds) {
                let itm = this.flds[k];
                if (i != k) {
                    fls.push(itm);
                }
            }
            this.flds = fls;

        }, saveJson: function () {
            var all = {
                fields: this.flds,
                old: this.old
            };
            downloadObjectAsJson(all, '4xmen-laravel-form-builder-export');
        }, loadJson: function () {
            init();
            $("#json-file").click();
        }, clearAll: function () {
            this.flds = [];
            this.old = '';
        }
    }
});

