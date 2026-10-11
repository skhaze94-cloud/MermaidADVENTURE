extends Node2D
## Original HTML collision rectangles, now rendered by native Sprite2D with
## directional relief materials. Geometry remains owned by HighlandData.
const Highland = preload("res://godot/highland_data.gd")
const Art = preload("res://godot/environment_art.gd")
var materials: Array[ShaderMaterial] = []
const RELIEF_SHADER: Shader = preload("res://godot/shaders/reef_rock_relief.gdshader")
var sprites: Array[Sprite2D] = []
var positions: Array[Rect2] = []
var camera_x := 0.0
var view_width := 1400.0

func _ready() -> void:
    z_index = -1
    positions = Highland.obstacles()
    for i in range(positions.size()):
        var r := positions[i]
        var overhead := r.position.y < 340.0
        var frame := (i % 2) if overhead else (2 + i % 2)
        var sprite := Sprite2D.new()
        sprite.name = "ReliefReef_%02d" % i
        sprite.texture = Art.rock(frame)
        sprite.centered = false
        sprite.flip_v = overhead
        sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
        var material := ShaderMaterial.new()
        material.shader = RELIEF_SHADER
        material.set_shader_parameter("ceiling_rock", 1.0 if overhead else 0.0)
        var region: Rect2 = Art.ROCK_REGIONS[frame]
        var tex_size := Vector2(Art.ROCKS.get_width(), Art.ROCKS.get_height())
        material.set_shader_parameter("atlas_bounds", Vector4(region.position.x / tex_size.x, region.position.y / tex_size.y, region.end.x / tex_size.x, region.end.y / tex_size.y))
        sprite.material = material
        materials.append(material)
        sprite.scale = Vector2((r.size.x + 44.0) / sprite.texture.get_width(), (r.size.y + 50.0) / sprite.texture.get_height())
        add_child(sprite)
        sprites.append(sprite)
    get_viewport().size_changed.connect(_resize)
    _resize()

func _resize() -> void:
    view_width = get_viewport_rect().size.x
    set_camera(camera_x, visible)

func set_camera(next_x: float, show_rocks: bool) -> void:
    camera_x = next_x
    visible = show_rocks
    if not show_rocks:
        return
    for i in range(sprites.size()):
        var r := positions[i]
        var sx := r.position.x - camera_x - 22.0
        var sprite := sprites[i]
        sprite.position = Vector2(sx, r.position.y - 25.0)
        sprite.visible = sx > -350.0 and sx < view_width + 350.0

func set_quality(high: bool) -> void:
    for material in materials:
        material.set_shader_parameter("high_quality", high)
