extends CanvasLayer
const Controls = preload("res://godot/control_layout.gd")
## Godot v0.4: native, scale-aware illustrated HUD. Gameplay never paints over UI.
## Draws from one immutable snapshot every rendered frame; no gameplay state stored here.
var canvas: Control
var info: Dictionary = {}
var redraw_count := 0
var skipped_redraws := 0
var game_size := Vector2(1400, 960)
var ui_scale := 1.0
var safe_frame := Rect2(0, 0, 1400, 960)
var portrait := false
const DISPLAY_FONT: FontFile = preload("res://dist/fonts/treasure-display.ttf")
var panel_style: StyleBoxFlat
var chip_style: StyleBoxFlat
var warning_style: StyleBoxFlat
const INK := Color("#e9fff8")
const PALE := Color("#acdcd9")
const GOLD := Color("#fce2a0")
const TEAL := Color("#67eddf")
const CORAL := Color("#ff94ae")

func _ready() -> void:
    layer = 6
    canvas = Control.new()
    canvas.name = "CrispGameplayHUD"
    canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(canvas)
    canvas.draw.connect(_draw_hud)
    panel_style = _panel(Color(0.014, 0.095, 0.15, 0.83), Color(0.38, 0.82, 0.82, 0.25), 16)
    chip_style = _panel(Color(0.024, 0.16, 0.21, 0.79), Color(0.47, 0.88, 0.84, 0.25), 14)
    warning_style = _panel(Color(0.11, 0.11, 0.19, 0.88), Color(1.0, 0.69, 0.48, 0.65), 14)
    get_viewport().size_changed.connect(_resize)
    _resize()

func _panel(fill: Color, outline: Color, radius: int) -> StyleBoxFlat:
    var p := StyleBoxFlat.new()
    p.bg_color = fill
    p.border_color = outline
    p.set_border_width_all(1)
    p.set_corner_radius_all(radius)
    p.anti_aliasing = true
    return p

func _resize() -> void:
    var window_size := Vector2(get_viewport().get_window().size)
    var safe_pixels := Rect2()
    if OS.get_name() in ["Android", "iOS"]:
        var screen_safe := Rect2(DisplayServer.get_display_safe_area())
        screen_safe.position -= Vector2(DisplayServer.window_get_position())
        safe_pixels = screen_safe
    configure_layout(get_viewport().get_visible_rect().size, window_size, safe_pixels)

func configure_layout(viewport_size: Vector2, window_size: Vector2, safe_pixels := Rect2()) -> void:
    safe_frame = Controls.safe_frame(viewport_size, window_size, safe_pixels)
    ui_scale = Controls.ui_scale(viewport_size, window_size)
    game_size = safe_frame.size / ui_scale
    portrait = window_size.y > window_size.x
    canvas.position = safe_frame.position
    canvas.scale = Vector2.ONE * ui_scale
    canvas.size = game_size
    canvas.queue_redraw()

func to_ui(point: Vector2) -> Vector2:
    return (point - safe_frame.position) / ui_scale

func to_game(rect: Rect2) -> Rect2:
    return Rect2(safe_frame.position + rect.position * ui_scale, rect.size * ui_scale)

func update_hud(next_info: Dictionary) -> void:
    # The gameplay publishes a snapshot every frame, but we only redraw
    # when an actual visible HUD value changes. Energy/progress use a 1%
    # threshold to avoid wasting vector drawing on 120Hz displays.
    var changed := info.is_empty()
    if not changed:
        changed = int(next_info.get("health", 0)) != int(info.get("health", 0))
        changed = changed or int(next_info.get("score", 0)) != int(info.get("score", 0))
        changed = changed or int(next_info.get("pearls", 0)) != int(info.get("pearls", 0))
        changed = changed or int(float(next_info.get("energy", 0.0)) * 100.0) != int(float(info.get("energy", 0.0)) * 100.0)
        changed = changed or int(float(next_info.get("progress", 0.0)) * 400.0) != int(float(info.get("progress", 0.0)) * 400.0)
        changed = changed or String(next_info.get("message", "")) != String(info.get("message", ""))
        changed = changed or (float(next_info.get("message_time", 0.0)) > 0.0) != (float(info.get("message_time", 0.0)) > 0.0)
        changed = changed or bool(next_info.get("boss_active", false)) != bool(info.get("boss_active", false))
        changed = changed or int(float(next_info.get("boss_health", 0.0)) * 100.0) != int(float(info.get("boss_health", 0.0)) * 100.0)
        changed = changed or bool(next_info.get("boss_vulnerable", false)) != bool(info.get("boss_vulnerable", false))
        changed = changed or bool(next_info.get("bubble", false)) != bool(info.get("bubble", false))
        changed = changed or bool(next_info.get("paused", false)) != bool(info.get("paused", false))
        changed = changed or bool(next_info.get("victory", false)) != bool(info.get("victory", false))
    changed = changed or next_info.get("pressed", []) != info.get("pressed", [])
    changed = changed or next_info.get("pad", Vector2.ZERO) != info.get("pad", Vector2.ZERO)
    changed = changed or next_info.get("boss_phase", "") != info.get("boss_phase", "")
    changed = changed or next_info.get("waterfall", "") != info.get("waterfall", "")
    changed = changed or int(float(next_info.get("fall_progress", 0.0)) * 100) != int(float(info.get("fall_progress", 0.0)) * 100)
    info = next_info
    if changed:
        redraw_count += 1
        if is_instance_valid(canvas):
            canvas.queue_redraw()
    else:
        skipped_redraws += 1

func _text(at: Vector2, label: String, size: int = 20, tint: Color = INK,
        alignment: HorizontalAlignment = HORIZONTAL_ALIGNMENT_LEFT, width: float = -1.0) -> void:
    var font: Font = DISPLAY_FONT if label == "HIGHLAND GOLD" or label == "HIGHLAND COMPLETE!" else ThemeDB.fallback_font
    canvas.draw_string(font, at, label, alignment, width, size, tint)

func _backed(rect: Rect2, style: StyleBox) -> void:
    canvas.draw_style_box(style, rect)

func _heart(center: Vector2, radius: float, full: bool) -> void:
    var c := CORAL if full else Color("#435a68")
    var r := radius
    canvas.draw_circle(center + Vector2(-r * 0.43, -r * 0.12), r * 0.51, c)
    canvas.draw_circle(center + Vector2(r * 0.43, -r * 0.12), r * 0.51, c)
    canvas.draw_colored_polygon(PackedVector2Array([
        center + Vector2(-r * 0.91, 0), center + Vector2(r * 0.91, 0),
        center + Vector2(0, r * 0.98)]), c)
    if full:
        canvas.draw_circle(center + Vector2(-r * 0.37, -r * 0.22), r * 0.18, Color(1.0, 1.0, 1.0, 0.64))

func _bead(center: Vector2, radius: float = 9.0) -> void:
    canvas.draw_circle(center, radius + 2.0, Color(0.22, 0.70, 0.79, 0.35))
    canvas.draw_circle(center, radius, Color("#dbfbff"))
    canvas.draw_circle(center + Vector2(-radius * 0.3, -radius * 0.32), radius * 0.29, Color.WHITE)

func _bar(rect: Rect2, percentage: float, tint: Color) -> void:
    _backed(rect, chip_style)
    var inner := rect.grow(-4.0)
    var v := clampf(percentage, 0.0, 1.0)
    if v > 0.001:
        # Avoid allocating a new StyleBox every frame for HUD fill.
        canvas.draw_rect(Rect2(inner.position, Vector2(inner.size.x * v, inner.size.y)), tint)
    canvas.draw_line(inner.position + Vector2(1, 1), inner.position + Vector2(inner.size.x * v - 1, 1),
        Color(1, 1, 1, 0.15), 1.0)

func _draw_hud() -> void:
    var w := game_size.x
    var h := game_size.y
    if w < 320 or h < 240:
        return
    var compact := w < 1060
    var left_width := 250.0 if compact else 320.0
    var right_width := 215.0 if compact else 275.0
    var margin := 15.0
    _backed(Rect2(margin, margin, left_width, 86), panel_style)
    canvas.draw_line(Vector2(margin + 17, margin + 19), Vector2(margin + 17, margin + 69),
        Color("#81f4df"), 3)
    var falling := not String(info.get("waterfall", "")).is_empty()
    _text(Vector2(margin + 29, 49), "THE WATERFALL" if falling else "HIGHLAND GOLD", 23 if not compact else 19, GOLD)
    _text(Vector2(margin + 29, 76), "SECRET GROTTO DESCENT" if falling else "CARLO'S COLD KINGDOM", 13 if not compact else 11, PALE)
    var right_x := w - right_width - margin - (82.0 if bool(info.get("touch", false)) else 0.0)
    _backed(Rect2(right_x, margin, right_width, 86), panel_style)
    _bead(Vector2(right_x + 22, 38), 9)
    _text(Vector2(right_x + 44, 45), "PEARLS  " + str(info.get("pearls", 0)), 18, INK)
    _text(Vector2(right_x + 17, 80), "SCORE  " + str(info.get("score", 0)), 20, GOLD)
    # Health and energy sit in a second, quieter ribbon: responsive, no giant hints.
    var line_y := 113.0
    var left_card := Rect2(margin, line_y, 180, 53)
    _backed(left_card, chip_style)
    for i in range(5):
        _heart(Vector2(margin + 22 + float(i) * 30.0, line_y + 29), 10, i < int(info.get("health", 5)))
    var boost_left := margin + 191.0
    _backed(Rect2(boost_left, line_y, 168, 53), chip_style)
    _text(Vector2(boost_left + 12, line_y + 18), "MERMAID BOOST", 12, PALE)
    _bar(Rect2(boost_left + 9, line_y + 24, 149, 17), float(info.get("energy", 1.0)), TEAL)
    if bool(info.get("bubble", false)) and w >= 800:
        _backed(Rect2(boost_left + 179, line_y, 161, 53), chip_style)
        canvas.draw_arc(Vector2(boost_left + 202, line_y + 27), 11, 0, TAU, 24, Color("#a4e8ff"), 3)
        _text(Vector2(boost_left + 220, line_y + 33), "BUBBLE READY", 12, INK)
    # Thin route ruler across the bottom, discreet but readable.
    var bottom := h - 15.0
    var route_width := maxf(70.0, w - 42.0)
    _bar(Rect2(21, bottom - 12, route_width, 11), float(info.get("fall_progress" if falling else "progress", 0.0)), GOLD)
    var checkpoint_fraction := 0.78
    canvas.draw_circle(Vector2(25.0 + (route_width - 10.0) * checkpoint_fraction, bottom - 6.7), 4.0,
        Color(1, 1, 1, 0.42))
    var caption := String(info.get("message", ""))
    if float(info.get("message_time", 0.0)) > 0.0 and not caption.is_empty() and not (bool(info.get("boss_active", false)) and h < 580):
        var width := minf(w - 35.0, 750.0)
        var top := 272.0 if bool(info.get("boss_active", false)) else (192.0 if h >= 580 else 170.0)
        var rect := Rect2((w - width) * 0.5, top, width, 47)
        _backed(rect, chip_style)
        var clipped := caption
        if clipped.length() > 72:
            clipped = clipped.substr(0, 69) + "..."
        _text(rect.position + Vector2(15, 31), clipped, 17, INK)
    if bool(info.get("boss_active", false)):
        var bw := minf(w - 40.0, 385.0)
        var bx := (w - bw) / 2.0
        var boss_top := 188.0
        _backed(Rect2(bx, boss_top, bw, 67), warning_style)
        _text(Vector2(bx + 16, boss_top + 25), "CARLO THE CRAB", 17, GOLD)
        _bar(Rect2(bx + 16, boss_top + 34, bw - 32, 17), float(info.get("boss_health", 1.0)),
            Color("#7ffec4") if bool(info.get("boss_vulnerable", false)) else Color("#ffac94"))
    if bool(info.get("touch", false)) and not portrait:
        _draw_touch_ui(w, h)
    if bool(info.get("paused", false)) or bool(info.get("victory", false)):
        _draw_modal(w, h, bool(info.get("victory", false)))
    if portrait:
        canvas.draw_rect(Rect2(0, 0, w, h), Color(0.01, 0.04, 0.08, 0.9))
        _text(Vector2(0, h * 0.46), "ROTATE TO LANDSCAPE", 26, GOLD, HORIZONTAL_ALIGNMENT_CENTER, w)
        _text(Vector2(0, h * 0.46 + 40), "Your adventure is paused", 18, PALE, HORIZONTAL_ALIGNMENT_CENTER, w)

func _draw_touch_ui(w: float, h: float) -> void:
    var size := Vector2(w, h)
    var pad := Controls.pad_rect(size)
    _backed(pad, chip_style)
    var center := pad.get_center()
    canvas.draw_circle(center, 57, Color(0.32, 0.85, 0.82, 0.16))
    var direction := Vector2(info.get("pad", Vector2.ZERO))
    canvas.draw_circle(center + direction * 42, 25, TEAL if direction != Vector2.ZERO else PALE)
    _text(pad.position + Vector2(10, 20), "SWIM", 12, PALE)
    var positions := {}
    for action in ["boost", "jump", "bubble", "pause"]:
        positions[action] = Controls.rect(action, size)
    var labels := {"left": "LEFT", "right": "RIGHT", "up": "UP", "down": "DOWN",
        "boost": "BOOST", "jump": "JUMP", "bubble": "BUBBLE", "pause": "II"}
    for action in positions:
        if action == "bubble" and not bool(info.get("bubble", false)):
            continue
        var rect: Rect2 = positions[action]
        _backed(rect, warning_style if action in info.get("pressed", []) else chip_style)
        _text(rect.position + Vector2(rect.size.x * 0.5, rect.size.y * 0.56), labels[action],
            19, INK, HORIZONTAL_ALIGNMENT_CENTER, rect.size.x)

func _draw_modal(w: float, h: float, victory: bool) -> void:
    canvas.draw_rect(Rect2(0, 0, w, h), Color(0.005, 0.03, 0.07, 0.79))
    var width := minf(570.0, w - 34.0)
    var height := 274.0
    var rect := Rect2((w - width) / 2.0, (h - height) / 2.0, width, height)
    _backed(rect, panel_style)
    var title := "HIGHLAND COMPLETE!" if victory else "ADVENTURE PAUSED"
    _text(rect.position + Vector2(23, 66), title, 31 if width > 420 else 21, GOLD)
    _text(rect.position + Vector2(25, 116), "SCORE   " + str(info.get("score", 0))
        + "       PEARLS   " + str(info.get("pearls", 0)), 21, INK)
    _text(rect.position + Vector2(25, 172),
        "ENTER: replay" if victory else "P / ESC / START: resume", 18, PALE)
    for action in (["restart"] if victory else ["resume", "restart"]):
        var button := Controls.rect(action, Vector2(w, h))
        _backed(button, chip_style)
        _text(button.position + Vector2(0, 36), "REPLAY" if victory else action.to_upper(), 20, INK,
            HORIZONTAL_ALIGNMENT_CENTER, button.size.x)
