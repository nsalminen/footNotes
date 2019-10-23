tinymce.PluginManager.add('footnotes', function (editor) {

    function replaceTmpl(str, data) {
        var result = str;
        for (var key in data) {
            result = result.replace('{' + key + '}', data[key]);
        }
        return result;
    }

    function showDialog() {
        var selectedNode = editor.selection.getNode(), name = '',
            isFootNotes = selectedNode.tagName == 'SUP' && editor.dom.getAttrib(selectedNode, 'class') === 'fnote';

        var selectIndex = (function () {
            if (selectedNode.className == 'fnote') {
                var num = selectedNode.nodeValue.replace(/[^0-9]/g, '');
                return num;
            }
            else {
                return selectedNode;
            }
        }());

        if (isFootNotes) {
            name = selectedNode.name || decodeURIComponent(selectedNode.getAttribute('data-content')) || '';
        }

        editor.windowManager.open({
            title: "Insert content",
            id: 'footnote-dialog',
            body: [{
                type: 'textbox',
                name: 'name',
                multiline: true,
                minWidth: 520,
                minHeight: 100,
                value: name
            },
                {
                    type: 'button',
                    name: 'link',
                    text: 'Insert link',
                    onclick: function (e) {
                        var textareaId = jQuery('.mce-multiline').attr('id');
                        wpActiveEditor = true;
                        wpLink.open(textareaId);
                        return false;
                    }
                }],
            onSubmit: function (e) {
                var newfootnoteContent = e.data.name,
                    fixFootnoteContent = (function () {
                        return encodeURIComponent(newfootnoteContent);
                    }()),
                    htmlTemplate = '<sup class="fnote" id="#wk_ft{FN}" contenteditable="false" data-tippy-content="' + fixFootnoteContent + '">{FN}</button></sup>',
                    totalFootNote = editor.getDoc().querySelectorAll('.fnote'),
                    totalCount = totalFootNote.length,
                    html;

                function findNextFD($node) {
                    function nextInDOM(_selector, $node) {
                        var next = getNext($node);

                        while (next.length !== 0) {
                            var found = searchFor(_selector, next);
                            if (found !== null) {
                                return found;
                            }
                            next = getNext(next);
                        }
                        return next;
                    }

                    function getNext($node) {
                        if ($node.nextAll().find('.fnote').length > 0) {
                            if ($node.next().hasClass('fnote')) {
                                return $node.next().children().children();
                            }
                            else {
                                return $node.nextAll().find('.fnote');
                            }

                        }
                        else {
                            if ($node.prop('nodeName') == 'BODY') {
                                return [];
                            }
                            return getNext($node.parent());
                        }
                    }

                    function searchFor(_selector, $node) {
                        if (!$node) {
                            return false
                        }
                        ;
                        if ($node) {
                            return $node;
                        }
                        else {
                            var found = null;
                            $node.children().each(function () {
                                if ($node)
                                    found = searchFor(_selector, $(this));
                            });
                            return found;
                        }
                        return null;
                    }

                    var currentClassNot_NextClass = nextInDOM('.fnote', $node);
                    return currentClassNot_NextClass;
                }

                var nextFD = findNextFD($(editor.selection.getRng().endContainer));

                if (nextFD.length) {
                    nextFD = nextFD[0];
                    var foundIdx;
                    for (foundIdx = 0; foundIdx < totalCount; foundIdx++) {
                        if (nextFD == totalFootNote[foundIdx]) {
                            break;
                        }
                    }
                    if (selectIndex < totalCount) {
                        // modify
                        html = replaceTmpl(htmlTemplate, {FN: $(totalFootNote[selectIndex - 1]).html()});
                    }
                    else {
                        // anywhere add
                        html = replaceTmpl(htmlTemplate, {FN: $(totalFootNote[foundIdx]).html()});
                        editor.selection.collapse(0);
                    }

                } else {
                    // last add
                    html = replaceTmpl(htmlTemplate, {FN: totalCount + 1});
                    editor.selection.collapse(0);
                }

                editor.execCommand('mceInsertContent', false, html);

                // index realignment
                $(editor.getDoc()).find('.fnote').each(function (idx) {
                    $(this).text((idx + 1));
                    $(this).attr('id', '#wk_ft' + (idx + 1));
                });
            }
        });
    }

    editor.addCommand('mceFootnotes', showDialog);
    editor.addButton("footnotes", {
        title: 'footnote',
        icon: 'insert-tweet is-dashicon dashicons dashicons-admin-comments',
        onPostRender: function () {
            jQuery('.is-dashicon').css('font-family', 'dashicons');
        },
        onclick: showDialog,
        stateSelector: 'sup.fnote'
    });
});
