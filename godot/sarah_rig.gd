extends Node2D
## Native Sprite2D / AtlasTexture hierarchy derived from dist/sarah-dynamic-v81.js.
## Parent-child transforms preserve the face while animating hair, tail and fins.
const ATLAS: Texture2D = preload("res://dist/assets/sarah-parts-v81.webp")
const ARMS: Texture2D = preload("res://dist/assets/sarah-arms-refined-v81.webp")
const BODY_CROPS := [
    [0.0078125,0.0185546875,0.234375,0.212890625],
    [0.2578125,0.0107421875,0.234375,0.2275390625],
    [0.5078125,0.044921875,0.234375,0.16015625],
    [0.7578125,0.013671875,0.234375,0.2216796875],
    [0.0078125,0.30859375,0.234375,0.1318359375],
    [0.2578125,0.3173828125,0.234375,0.115234375],
    [0.51171875,0.296875,0.2265625,0.1552734375],
    [0.7578125,0.306640625,0.234375,0.1357421875],
    [0.0078125,0.56640625,0.234375,0.1171875],
    [0.2578125,0.544921875,0.234375,0.16015625],
    [0.5078125,0.56640625,0.234375,0.1171875],
    [0.7578125,0.5634765625,0.234375,0.123046875],
    [0.0078125,0.7783203125,0.234375,0.1923828125],
    [0.2578125,0.7744140625,0.234375,0.201171875],
    [0.5078125,0.822265625,0.234375,0.10546875],
    [0.7578125,0.7998046875,0.234375,0.150390625]
]
const ARM_CROPS := [
    [0.015625,0.201171875,0.46875,0.59765625],
    [0.515625,0.193359375,0.46875,0.611328125]
]
var back_hair: Node2D
var hair_strand: Node2D
var tail_base: Node2D
var tail_tip: Node2D
var fin_upper: Node2D
var fin_lower: Node2D
var side_fin: Node2D
var torso: Node2D
var head_joint: Node2D
var front_hair: Node2D
var near_arm: Node2D
var far_arm: Node2D
var velocity_value := Vector2.ZERO
var facing_value := 1.0
var boosting := false
var leaping := false
var alpha_value := 1.0
var clock := 0.0
var reduced_motion := false

func _joint(name: String, parent: Node2D, where: Vector2) -> Node2D:
    var node := Node2D.new()
    node.name = name
    node.position = where
    parent.add_child(node)
    return node

func _part(index: int, parent: Node2D, x: float, y: float, w: float, h: float, arm: bool = false) -> Sprite2D:
    var texture: Texture2D = ARMS if arm else ATLAS
    var crop: Array = ARM_CROPS[index] if arm else BODY_CROPS[index]
    var region := Rect2(float(crop[0]) * float(texture.get_width()),
        float(crop[1]) * float(texture.get_height()),
        float(crop[2]) * float(texture.get_width()),
        float(crop[3]) * float(texture.get_height()))
    var atlas := AtlasTexture.new()
    atlas.atlas = texture
    atlas.region = region
    var sprite := Sprite2D.new()
    sprite.texture = atlas
    sprite.centered = false
    sprite.position = Vector2(x,y)
    sprite.scale = Vector2(w / region.size.x, h / region.size.y)
    sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
    parent.add_child(sprite)
    return sprite

func _ready() -> void:
    # Draw order is intentionally far to near, matching the HTML 8.1 rig.
    back_hair = _joint("BackHair", self, Vector2(49, -23))
    _part(2, back_hair, -105, -46, 116, 77)
    hair_strand = _joint("BackHairStrand", back_hair, Vector2.ZERO)
    _part(15, hair_strand, -109, -18, 109, 28)

    tail_base = _joint("TailBase", self, Vector2(13, 30))
    tail_tip = _joint("TailTip", tail_base, Vector2(-62, -1))
    _part(11, tail_tip, -42, -13, 50, 29)
    var fins := _joint("FinSockets", tail_tip, Vector2(-34, -2))
    fin_lower = _joint("LowerFin", fins, Vector2.ZERO)
    _part(13, fin_lower, -37, -7, 46, 38)
    fin_upper = _joint("UpperFin", fins, Vector2.ZERO)
    _part(12, fin_upper, -40, -49, 49, 57)
    _part(10, tail_base, -70, -24, 78, 51)

    side_fin = _joint("SideFin", self, Vector2(5, 45))
    _part(14, side_fin, -36, -6, 43, 20)

    torso = _joint("Torso", self, Vector2(12, 24))
    far_arm = _joint("FarArm", torso, Vector2(49, -26))
    _part(1, far_arm, 28, -12, 66, 43, true)
    _part(0, torso, -7, -42, 75, 69)

    head_joint = _joint("HeadNeck", torso, Vector2(44, -29))
    _part(1, head_joint, -34, -69, 67, 73)
    front_hair = _joint("FrontHair", torso, Vector2(34, -50))
    _part(3, front_hair, -27, -4, 33, 49)

    near_arm = _joint("NearArm", torso, Vector2(10, -31))
    _part(0, near_arm, 30, -13, 70, 45, true)

func set_motion(velocity: Vector2, direction: float, is_boosting: bool, is_leaping: bool, opacity: float) -> void:
    velocity_value = velocity
    facing_value = direction
    boosting = is_boosting
    leaping = is_leaping
    alpha_value = opacity

func _process(delta: float) -> void:
    clock += delta
    var intensity := clampf(velocity_value.length() / 420.0, 0.2, 2.0)
    var amplitude := 0.0 if reduced_motion else (0.09 + 0.13 * intensity)
    if boosting:
        amplitude *= 0.28
    if leaping:
        amplitude *= 0.36
    var follow := 1.0 - exp(-delta * 12.0)
    var swim_phase := clock * (4.4 + intensity * 1.3)
    scale.x = lerpf(scale.x, facing_value, follow)
    # Rigid face: head and hair only rotate via parent joints.
    tail_base.rotation = lerpf(tail_base.rotation, sin(swim_phase) * amplitude, follow)
    tail_tip.rotation = lerpf(tail_tip.rotation, sin(swim_phase - 0.8) * amplitude * 1.55, follow)
    fin_upper.rotation = sin(swim_phase * 1.45 - 1.0) * amplitude * 1.5
    fin_lower.rotation = sin(swim_phase * 1.40 + 1.0) * amplitude * 1.65
    side_fin.rotation = sin(swim_phase * 1.2) * amplitude * 1.2
    back_hair.rotation = sin(swim_phase * 0.6) * amplitude * 0.7
    hair_strand.rotation = sin(swim_phase * 0.74) * amplitude * 1.1
    front_hair.rotation = sin(swim_phase * 0.68) * amplitude * 0.75
    torso.rotation = lerpf(torso.rotation, -velocity_value.y / 1400.0 * 0.12, follow)
    head_joint.rotation = sin(swim_phase * 0.5) * amplitude * 0.25
    near_arm.rotation = sin(swim_phase * 0.77 + 0.7) * amplitude * 1.2 + (-0.21 if boosting else 0.0)
    far_arm.rotation = sin(swim_phase * 0.77 - 1.2) * amplitude * 1.2 + (0.2 if boosting else 0.0)
    self_modulate.a = alpha_value
