extends Node2D
## Level 1 2.5D compositor: opaque painted world + separately shaded garden planes.
## Uses original repository artwork, never generates ghost copies of the same backdrop.
const BACKGROUND: Texture2D = preload("res://dist/assets/highlands.webp")
const GARDENS: Texture2D = preload("res://dist/assets/reef-garden-v75.webp")
const PAINTED_SHADER: Shader = preload("res://godot/shaders/painted_depth.gdshader")
const REEF_SHADER: Shader = preload("res://godot/shaders/reef_material.gdshader")
const LEVEL_WIDTH := 20748.0
const WATER_LINE := 280.0
var background: TextureRect
var background_material: ShaderMaterial
var far_gardens: Node2D
var middle_gardens: Node2D
var far_entries: Array[Dictionary] = []
var middle_entries: Array[Dictionary] = []
var screen_size := Vector2(1400, 960)
var camera_x := 0.0
var grotto := false
var reduced_motion := false
var tone := 0.0

func _ready() -> void:
    z_index = -3
    screen_size = get_viewport_rect().size
    background = TextureRect.new()
    background.name = "SingleOpaquePaintedBackdrop"
    background.texture = BACKGROUND
    background.stretch_mode = TextureRect.STRETCH_SCALE
    background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    background.mouse_filter = Control.MOUSE_FILTER_IGNORE
    background_material = ShaderMaterial.new()
    background_material.shader = PAINTED_SHADER
    background.material = background_material
    add_child(background)
    far_gardens = Node2D.new()
    far_gardens.name = "FarReefPlane_0_58Parallax"
    add_child(far_gardens)
    middle_gardens = Node2D.new()
    middle_gardens.name = "MidReefPlane_0_83Parallax"
    add_child(middle_gardens)
    _make_plane(far_gardens, far_entries, 25, 775.0, 0.58, 0.22, Color("#77bfc8"), 0.48)
    _make_plane(middle_gardens, middle_entries, 33, 590.0, 0.83, 0.13, Color("#6bcab8"), 0.67)
    get_viewport().size_changed.connect(_resize)
    _resize()
    set_camera(0.0, false, false)

func _make_plane(parent: Node2D, entries: Array[Dictionary], count: int,
        spacing: float, factor: float, fog: float, colour: Color, opacity: float) -> void:
    var material := ShaderMaterial.new()
    material.shader = REEF_SHADER
    material.set_shader_parameter("water_tint", colour)
    material.set_shader_parameter("distance_fog", fog)
    for i in range(count):
        # Hand-aligned gentle distribution instead of stacked transparent scenery.
        var column := i % 4
        var row := (i * 5 + 2) % 3
        var atlas := AtlasTexture.new()
        atlas.atlas = GARDENS
        var cell_size := Vector2(GARDENS.get_width() / 4.0, GARDENS.get_height() / 3.0)
        atlas.region = Rect2(Vector2(column, row) * cell_size, cell_size)
        var sprite := Sprite2D.new()
        sprite.name = "Garden_%02d" % i
        sprite.texture = atlas
        sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
        sprite.material = material
        var width := (178.0 + float(i % 5) * 31.0) * (0.78 if factor < 0.7 else 1.0)
        var height := (205.0 + float(i % 4) * 28.0) * (0.78 if factor < 0.7 else 1.0)
        sprite.scale = Vector2(width / maxf(1.0, cell_size.x), height / maxf(1.0, cell_size.y))
        sprite.modulate.a = opacity
        sprite.flip_h = i % 3 == 1
        parent.add_child(sprite)
        var source_world := 520.0 + float(i) * spacing + float((i * 47) % 103)
        entries.append({"sprite": sprite, "source_x": source_world,
            "base_y": 875.0 - float(i % 4) * 18.0,
            "factor": factor, "phase": float(i) * 0.73})

func _resize() -> void:
    screen_size = get_viewport_rect().size
    background.position = Vector2(-18.0, -10.0)
    background.size = screen_size + Vector2(36.0, 26.0)
    background_material.set_shader_parameter("surface_y", clampf(WATER_LINE / maxf(screen_size.y, 1.0), 0.0, 0.7))
    set_camera(camera_x, grotto, reduced_motion)

func set_camera(world_camera: float, is_grotto: bool, reduce_motion: bool) -> void:
    camera_x = world_camera
    grotto = is_grotto
    reduced_motion = reduce_motion
    background_material.set_shader_parameter("camera_progress",
        clampf(camera_x / maxf(1.0, LEVEL_WIDTH - screen_size.x), 0.0, 1.0))
    background_material.set_shader_parameter("grotto_mix", 1.0 if grotto else 0.0)
    background_material.set_shader_parameter("motion_enabled", 0.0 if reduced_motion else 1.0)
    # One depth-perceived image parallax. No duplicate backdrop layers.
    background.position.x = -18.0 - camera_x / LEVEL_WIDTH * 26.0
    for entry in far_entries:
        _position_entry(entry)
    for entry in middle_entries:
        _position_entry(entry)

func _position_entry(entry: Dictionary) -> void:
    var sprite: Sprite2D = entry["sprite"]
    var x := float(entry["source_x"])
    var factor := float(entry["factor"])
    var screen_x := (x - camera_x) * factor + screen_size.x * 0.5 * (1.0 - factor)
    sprite.position = Vector2(screen_x, float(entry["base_y"]))
    sprite.visible = screen_x > -300.0 and screen_x < screen_size.x + 300.0
