# footNotes
TinyMCE Editor 4.x footNotes plugin, optimized for WordPress (5.3).

## Principle
The content inserted in the textbox is inserted into the html of the editor. The equivalent HTML of a footnote containing the string `"This is a footnote!"`:

````
<sup id="#wk_ft1" class="fnote" contenteditable="false" data-tippy-content="This is a footnote!">1</sup>
````

## Usage

In your theme's `functions.php`, add the following:
```php
// Add footNotes plugin to TinyMCE in WordPress
function theme_mce_plugins( $plugins ) {
    $plugins['footnotes'] = get_template_directory_uri() . '/js/footnotes/plugin.js';
    return $plugins;
}
add_filter( 'mce_external_plugins', 'awake_mce_plugins' );

// Add plugin button to the beginning of the toolbar
function theme_tinymce_buttons( $buttons ) {
    array_unshift( $buttons, 'footnotes' );
    return $buttons;
}
add_filter( 'mce_buttons_2', 'awake_tinymce_buttons' );
```

In your theme's .js file, add the following:
```js
// Decode the content of all footnotes
$('[data-tippy-content]').each(function () {
    $(this).attr("data-tippy-content", decodeURIComponent($(this).data("tippy-content")));
});

tippy('[data-tippy-content]', {
    interactive: true,
});
```

### Requirements
- [jQuery](https://jquery.com/download/)
- [Tippy.js](https://github.com/atomiks/tippyjs)
