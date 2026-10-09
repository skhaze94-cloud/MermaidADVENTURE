extends Node2D
## Sparse close-plane foreground silhouettes. The outer edges provide depth cues
## without painting over Sarah, the HUD or the original gameplay targets.
const FLORA: Texture2D = preload("res://dist/assets/flora-layer.webp")
const GARDENS: Texture2D = preload("res://dist/assets/reef-garden-v75.webp")
const REEF_SHADER: Shader = preload("res://godot/shaders/reef_material.gdshader")
var entries: Array[Dictionary] = []
var camera_x := 0.0
var screen_size := Vector2(1400, 960)
var reduced_motion := false
var active := true
var last_camera := -999999.0
var sway_clock := 0.0
var sway_accumulator := 0.0
var placement_updates := 0

func _ready() -> void:
    z_index = 2
    screen_size = get_viewport_rect().size
    var material := ShaderMaterial.new()
    material.shader = REEF_SHADER
    material.set_shader_parameter("water_tint", Color("#1b535b"))
    material.set_shader_parameter("distance_fog", 0.06)
    material.set_shader_parameter("relief", 0.17)
    for i in range(18):
        var sprite := Sprite2D.new()
        sprite.name = "Foreground_%02d" % i
        sprite.texture = FLORA if i % 3 != 0 else _atlas_crop(i)
        sprite.scale = Vector2(0.17 + float(i % 3) * 0.035, 0.15 + float(i % 4) * 0.018)
        sprite.material = material
        sprite.modulate.a = 0.22 + float(i % 3) * 0.025
        sprite.flip_h = i % 2 == 0
        add_child(sprite)
        entries.append({"sprite": sprite, "x": 290.0 + float(i) * 1170.0, "phase": float(i) * 0.77})
    get_viewport().size_changed.connect(_update_size)
    _update_size()

func _atlas_crop(i: int) -> AtlasTexture:
    var crop := AtlasTexture.new()
    crop.atlas = GARDENS
    var cw := GARDENS.get_width() / 4.0
    var ch := GARDENS.get_height() / 3.0
    crop.region = Rect2(Vector2(float(i % 4) * cw, float((i / 4) % 3) * ch), Vector2(cw, ch))
    return crop

func _update_size() -> void:
    screen_size = get_viewport_rect().size
    last_camera = -999999.0
    set_camera(camera_x, active, reduced_motion)

func _process(dt: float) -> void:
    if not active or reduced_motion:
        return
    sway_clock += minf(dt, 0.05)
    sway_accumulator += minf(dt, 0.05)
    if sway_accumulator < 1.0 / 24.0:
        return
    sway_accumulator = 0.0
    for entry in entries:
        var sprite: Sprite2D = entry["sprite"]
        if sprite.visible:
            sprite.rotation = sin(sway_clock * 0.7 + float(entry["phase"])) * 0.017

func set_camera(world_camera: float, enabled: bool, reduce_motion: bool) -> void:
    camera_x = world_camera
    active = enabled
    reduced_motion = reduce_motion
    visible = active
    if not active:
        return
    if absf(camera_x - last_camera) < 2.0:
        return
    last_camera = camera_x
    placement_updates += 1
    for entry in entries:
        var sprite: Sprite2D = entry["sprite"]
        var world_x := float(entry["x"])
        var factor := 1.13
        var sx := (world_x - camera_x) * factor + screen_size.x * 0.5 * (1.0 - factor)
        sprite.position = Vector2(sx, screen_size.y - 46.0)
        sprite.visible = sx > -160.0 and sx < screen_size.x + 160.0
        if reduced_motion:
            sprite.rotation = 0.0
