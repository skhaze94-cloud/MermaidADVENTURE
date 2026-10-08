extends Node2D
## Original HTML collision rectangles, now rendered by native Sprite2D with
## directional relief materials. Geometry remains owned by HighlandData.
const Highland = preload("res://godot/highland_data.gd")
const REEF: Texture2D = preload("res://dist/assets/barrier-reef.webp")
const RELIEF_SHADER: Shader = preload("res://godot/shaders/reef_rock_relief.gdshader")
var sprites: Array[Sprite2D] = []
var positions: Array[Rect2] = []
var camera_x := 0.0
var view_width := 1400.0

func _ready() -> void:
    z_index = -1
    positions = Highland.obstacles()
    var sea_floor_material := ShaderMaterial.new()
    sea_floor_material.shader = RELIEF_SHADER
    sea_floor_material.set_shader_parameter("ceiling_rock", 0.0)
    var overhead_material := ShaderMaterial.new()
    overhead_material.shader = RELIEF_SHADER
    overhead_material.set_shader_parameter("ceiling_rock", 1.0)
    for i in range(positions.size()):
        var r := positions[i]
        var sprite := Sprite2D.new()
        sprite.name = "ReliefReef_%02d" % i
        sprite.texture = REEF
        sprite.centered = false
        sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
        sprite.material = overhead_material if r.position.y < 340.0 else sea_floor_material
        sprite.scale = Vector2((r.size.x + 44.0) / float(REEF.get_width()),
            (r.size.y + 50.0) / float(REEF.get_height()))
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
