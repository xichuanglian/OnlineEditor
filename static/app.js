$(document).ready(function() {
    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/clouds");
    editor.getSession().setMode("ace/mode/java");

    $.get("targetFile", function(result) {
        editor.setValue(result);
        editor.gotoLine(0);

        editor.on("change", function(e) {
            console.dir(e);
        });
    });

    $("#saveButton").click(function() {
        $("#success-alert").addClass('hidden');
        $("#error-alert").addClass('hidden');
        var fileContent = editor.getValue();
        $.post("targetFile", {fileContent: fileContent}, function(result) {
            if (result == 0) {
                $("#success-alert").removeClass('hidden');
            } else {
                $("#error-alert").removeClass('hidden');
            }
            setTimeout(function() {
                $("#success-alert").addClass('hidden');
                $("#error-alert").addClass('hidden');
            }, 6000);
        });
    });
});