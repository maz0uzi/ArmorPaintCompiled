
let plugin = plugin_create();
let h1 = zui_handle_create();

plugin_notify_on_ui(plugin, function() {
	if (zui_panel(h1, "Converter")) {
		zui_row([1 / 2, 1 / 2]);
		if (zui_button(".arm to .json")) {
			ui_files_show("arm", false, true, function(path) {
				let b = data_get_blob(path);
				let parsed = armpack_decode(b);
				let out = sys_string_to_buffer(JSON.stringify(parsed, function(key, value) {
					if (value.constructor.name === "Float32Array") {
						let ar = Array.from(value);
						ar.unshift(0); // Annotate array type
						return ar;
					}
					else if (value.constructor.name === "Uint32Array") {
						let ar = Array.from(value);
						ar.unshift(1);
						return ar;
					}
					else if (value.constructor.name === "Int16Array") {
						let ar = Array.from(value);
						ar.unshift(2);
						return ar;
					}
					return value;
				}, "	"));
				krom_file_save_bytes(path.substr(0, path.length - 3) + "json", out);
			});
		}
		if (zui_button(".json to .arm")) {
			ui_files_show("json", false, true, function(path) {
				let b = data_get_blob(path);
				let parsed = json_parse(sys_buffer_to_string(b));
				function iterate(d) {
					for (const n of ReflectFields(d)) {
						let v = ReflectField(d, n);
						if (v.constructor.name === "Array") {
							if (v[0].constructor.name === "Number") {
								let ar = null;
								if (v[0] === 0) {
									ar = new Float32Array(v.length - 1);
								}
								else if (v[0] === 1) {
									ar = new Uint32Array(v.length - 1);
								}
								else if (v[0] === 2) {
									ar = new Int16Array(v.length - 1);
								}
								for (let i = 0; i < v.length - 1; ++i) {
									ar[i] = v[i + 1];
								}
								ReflectSetField(d, n, ar);
							}
							else {
								for (const e of v) {
									if (typeof e === 'object') {
										iterate(e);
									}
								}
							}
						}
						else if (typeof v === 'object') {
							iterate(v);
						}
					}
				}
				iterate(parsed);
				let out = armpack_encode(parsed);
				krom_file_save_bytes(path.substr(0, path.length - 4) + "arm", out, out.byteLength + 1);
			});
		}
	}
});
