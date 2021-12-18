document.addEventListener("DOMContentLoaded", function(event) {
    var editorCode = document.getElementById('editor-code');
    var editorContent = document.getElementById('editor-content');
    var selector = document.getElementById('selector');
    editorCode.innerHTML = Prism.highlight(editorContent.value, Prism.languages.javascript);

    $('#editor-content').bind('input propertychange', function() {
        editorCode.innerHTML = Prism.highlight(this.value, Prism.languages.javascript);
    });
});

