tinymce.PluginManager.add('footnotes', function(editor) {

    function replaceTmpl(str, data) {
        var result = str;
        for (var key in data) {
            result = result.replace('{'+ key +'}',data[key]);
        }
        return result;
    }

    function showDialog() {
        var selectedNode = editor.selection.getNode(), name = '',
            isFootNotes = selectedNode.tagName == 'SPAN' && editor.dom.getAttrib(selectedNode, 'class') === 'fnoteWrap';

        var selectIndex = (function(){
            if (selectedNode.className == 'fnoteWrap') {
                var num = selectedNode.childNodes[0].firstChild.nodeValue.replace(/[^0-9]/g,'');
                return num;
            }
            else {
                return selectedNode.childNodes[0];
            }
        }());

        if (isFootNotes) {
            name = selectedNode.name || decodeURIComponent(selectedNode.childNodes[0].getAttribute('data-content')) || '';
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
                value : name
            },
            {
                type: 'button',
                name: 'link',
                text: 'Insert link',
                onclick: function( e ) {
                    var textareaId = jQuery('.mce-multiline').attr('id');
                    wpActiveEditor = true;
                    wpLink.open( textareaId );
                    return false;
                }
            }],
            onSubmit: function(e) {
                var newfootnoteContent = e.data.name,
                    fixFootnoteContent = (function () {
                        return encodeURIComponent(newfootnoteContent);
                    }()),
                    htmlTemplate = '<span class="fnoteWrap" id="#wk_ft{FN}" contenteditable="false"><button type="button" class="fnoteBtn" data-content="'+fixFootnoteContent+'">{FN}</button></span>&nbsp;',
                    totalFootNote = editor.getDoc().querySelectorAll('.fnoteBtn'),
                    totalCount = totalFootNote.length,
                    html;

                function findNextFD($node)
                {
                    function nextInDOM(_selector, $node) {
                        var next = getNext($node);

                        while(next.length !== 0) {
                            var found = searchFor(_selector, next);
                            if(found !== null) {
                                return found;
                            }
                            next = getNext(next);
                        }
                        return next;
                    }
                    function getNext($node) {
                        if($node.nextAll().find('.fnoteBtn').length > 0) {
                            if ($node.next().hasClass('fnoteBtn')) {
                                return $node.next().children().children();
                            }
                            else {
                                return $node.nextAll().find('.fnoteBtn');
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
                        if (!$node) {return false};
                        if($node) {
                            return $node;
                        }
                        else {
                            var found = null;
                            $node.children().each(function() {
                                if ($node)
                                    found = searchFor(_selector, $(this));
                            });
                            return found;
                        }
                        return null;
                    }
                    var currentClassNot_NextClass = nextInDOM('.fnoteBtn', $node);
                    return currentClassNot_NextClass;
                }

                var nextFD = findNextFD($(editor.selection.getRng().endContainer));

                if(nextFD.length) {
                    nextFD = nextFD[0];
                    var foundIdx;
                    for(foundIdx = 0; foundIdx < totalCount; foundIdx++) {
                        if(nextFD == totalFootNote[foundIdx]) {
                            break;
                        }
                    }
                    if (selectIndex < totalCount) {
                        // modify
                        html = replaceTmpl(htmlTemplate,{FN : $(totalFootNote[selectIndex-1]).html()});
                    }
                    else {
                        // anywhere add
                        html = replaceTmpl(htmlTemplate,{FN : $(totalFootNote[foundIdx]).html()});
                        editor.selection.collapse(0);
                    }

                } else {
                    // last add
                    html = replaceTmpl(htmlTemplate,{FN : totalCount + 1});
                    editor.selection.collapse(0);
                }

                editor.execCommand('mceInsertContent', false, html);

                // index realignment
                $(editor.getDoc()).find('.fnoteBtn').each(function(idx){
                    $(this).text((idx+1));
                    $(this).parent().attr('id','#wk_ft' + (idx +1));
                });
            }
        });
    }
    editor.addCommand('mceFootnotes', showDialog);
    editor.addButton("footnotes", {
        title : 'footnote',
        image : tinyMCE.baseURL + '/plugins/footnotes/img/footnotes.png',
        onclick: showDialog,
        stateSelector: 'span.fnoteWrap'
    });
});
