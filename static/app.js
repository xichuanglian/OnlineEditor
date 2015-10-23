$(document).ready(function() {
    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/clouds");
    editor.getSession().setMode("ace/mode/java");

    var tmpLog = "";
    var toUpload = "";
    var uploadTimer = null;

    uploadLog = function() {
        if (tmpLog.length > 0) {
            toUpload = toUpload + tmpLog;
            tmpLog = "";
            $.post("eventLog", {log: toUpload}, function(result) {
                if (result == 0) {
                    toUpload = "";
                } else {
                    setTimeout(uploadTrigger, 5000);
                }
            });
        }
    };

    uploadTrigger = function() {
        if (uploadTimer != null) {
            clearTimeout(uploadTimer);
        }
        uploadLog();
        uploadTimer = setTimeout(uploadTrigger, 30000);
    };

    $.get("targetFile", function(result) {
        var e = {
            action: "open",
            timestamp: Date.now()
        };
        tmpLog += JSON.stringify(e) + "\n";

        editor.setValue(result);
        editor.gotoLine(0);

        editor.on("change", function(e) {
            e.timestamp = Date.now();
            tmpLog += JSON.stringify(e) + "\n";
        });

        editor.on("copy", function(text) {
            var e = {
                action: "copy",
                text: text,
                lead: editor.getSession().selection.getSelectionLead(),
                anchor: editor.getSession().selection.getSelectionAnchor(),
                timestamp: Date.now()
            };
            tmpLog += JSON.stringify(e) + "\n";
        });

        editor.on("paste", function(text) {
            var e = {
                action: "paste",
                text: text.text,
                timestamp: Date.now()
            };
            tmpLog += JSON.stringify(e) + "\n";
        });

        editor.on("focus", function() {
            var e = {
                action: "focus",
                cursor: editor.getSession().selection.getCursor(),
                timestamp: Date.now()
            };
            tmpLog += JSON.stringify(e) + "\n";
        });

        editor.on("blur", function() {
            var e = {
                action: "blur",
                timestamp: Date.now()
            };
            tmpLog += JSON.stringify(e) + "\n";
        });

        editor.getSession().selection.on("changeCursor", function() {
            var e = {
                action: "changeCursor",
                cursor: editor.getSession().selection.getCursor(),
                timestamp: Date.now()
            };
            tmpLog += JSON.stringify(e) + "\n";
        });

        editor.commands.addCommand({
            name: 'save',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                saveFile();
            },
            readOnly: false
        });

        $("#saveButton").prop('disabled', false);
        uploadTrigger();
    });

    var saving = false;
    var alertTimer = null;
    saveFile = function() {
        var e = {
            action: "save",
            timestamp: Date.now()
        };
        tmpLog += JSON.stringify(e) + "\n";
        if (!saving) {
            saving = true;
            $("#saveButton").prop('disabled', true);
            clearTimeout(alertTimer);
            $("#success-alert").addClass('hidden');
            $("#error-alert").addClass('hidden');
            var fileContent = editor.getValue();
            $.post("targetFile", {fileContent: fileContent}, function(result) {
                if (result == 0) {
                    $("#success-alert").removeClass('hidden');
                } else {
                    $("#error-alert").removeClass('hidden');
                }
                saving = false;
                $("#saveButton").prop('disabled', false);
                alertTimer = setTimeout(function() {
                    $("#success-alert").addClass('hidden');
                    $("#error-alert").addClass('hidden');
                }, 6000);
            });
            uploadTrigger();
        }
    };

    $("#saveButton").click(function() {
        saveFile();
    });
});