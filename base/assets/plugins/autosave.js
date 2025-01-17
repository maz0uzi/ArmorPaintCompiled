
let plugin = plugin_create();

let h1 = zui_handle_create();
let h2 = zui_handle_create();
zui_handle_set_value(h2, 5.0);
let timer = 0.0;

plugin_notify_on_ui(plugin, function() {
	if (zui_panel(h1, "Auto Save")) {
		zui_slider(h2, "min", 1, 15, false, 1);
	}
});

plugin_notify_on_update(plugin, function() {
	if (project_filepath_get() == "") {
		return;
	}
	timer += 1 / 60;
	if (timer >= zui_handle_get_value(h2) * 60) {
		timer = 0.0;
		project_save();
	}
});
