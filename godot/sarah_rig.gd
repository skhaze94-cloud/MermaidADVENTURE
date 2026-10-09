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
var hero_light: PointLight2D
var velocity_value := Vector2.ZERO
var facing_value := 1.0
var boosting := false
var leaping := false
var alpha_value := 1.0
var clock := 0.0
var reduced_motion := false
# Blend weights are state, not extra textures or allocations per frame.
var swim_blend := 0.0
var boost_blend := 0.0
var leap_blend := 0.0
var turn_kick := 0.0
var hit_kick := 0.0
var smoothed_speed := 0.0
var animation_mode := "idle"
var last_facing := 1.0

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

    # A real Godot 2D light subtly lifts Sarah away from deep blue scenery.
    # This is an independent light, not a blurry duplicate of her painted face.
    hero_light = PointLight2D.new()
    hero_light.name = "MermaidSoftKeyLight"
    hero_light.texture = _radial_texture()
    hero_light.texture_scale = 2.4
    hero_light.color = Color("#8ef8dc")
    hero_light.energy = 0.24
    hero_light.position = Vector2(21.0, -12.0)
    add_child(hero_light)

func _radial_texture() -> Texture2D:
    var image := Image.create(96, 96, false, Image.FORMAT_RGBA8)
    image.fill(Color.TRANSPARENT)
    for y in range(96):
        for x in range(96):
            var u := (float(x) - 47.5) / 47.5
            var v := (float(y) - 47.5) / 47.5
            var d := sqrt(u * u + v * v)
            if d < 1.0:
                image.set_pixel(x, y, Color(1.0, 1.0, 1.0,
                    pow(maxf(0.0, 1.0 - d), 2.1) * 0.74))
    return ImageTexture.create_from_image(image)

func set_motion(velocity: Vector2, direction: float, is_boosting: bool, is_leaping: bool, opacity: float) -> void:
    velocity_value = velocity
    facing_value = -1.0 if direction < 0.0 else 1.0
    if facing_value != last_facing:
        # Quick turn recoil without mirroring through an ugly zero-width pose.
        turn_kick = -0.22 * facing_value
        last_facing = facing_value
    boosting = is_boosting
    leaping = is_leaping
    alpha_value = opacity

func play_impact() -> void:
    hit_kick = 1.0

func _process(delta: float) -> void:
    var dt := minf(delta, 0.05)
    clock += dt
    var ease := 1.0 - exp(-dt * 9.0)
    var fast_ease := 1.0 - exp(-dt * 16.0)
    var speed := velocity_value.length()
    smoothed_speed = lerpf(smoothed_speed, speed, ease)
    var swim_target := clampf(smoothed_speed / 310.0, 0.0, 1.0)
    swim_blend = lerpf(swim_blend, swim_target, ease)
    boost_blend = lerpf(boost_blend, 1.0 if boosting else 0.0, fast_ease)
    leap_blend = lerpf(leap_blend, 1.0 if leaping else 0.0, ease)
    turn_kick = lerpf(turn_kick, 0.0, fast_ease)
    hit_kick = lerpf(hit_kick, 0.0, 1.0 - exp(-dt * 12.0))
    animation_mode = "boost" if boost_blend > 0.6 else ("leap" if leap_blend > 0.6 else ("swim" if swim_blend > 0.22 else "idle"))
    var swim_phase := clock * (2.9 + 3.0 * swim_blend + 2.0 * boost_blend)
    var slow_phase := clock * 1.6
    var amount := (0.045 + 0.15 * swim_blend) * (1.0 - boost_blend * 0.65) * (1.0 - leap_blend * 0.62)
    if reduced_motion:
        amount = 0.0
    # All motion is local to joints; collision location and face stay stable.
    scale.x = facing_value
    var tail_angle := sin(swim_phase) * amount + turn_kick * 0.8
    var tail_tip_angle := sin(swim_phase - 0.91) * amount * 1.55 + turn_kick * 0.9
    tail_base.rotation = lerpf(tail_base.rotation, tail_angle, ease)
    tail_tip.rotation = lerpf(tail_tip.rotation, tail_tip_angle, ease)
    fin_upper.rotation = lerpf(fin_upper.rotation, sin(swim_phase * 1.23 - 0.95) * amount * 1.60, fast_ease)
    fin_lower.rotation = lerpf(fin_lower.rotation, sin(swim_phase * 1.32 + 1.16) * amount * 1.75, fast_ease)
    side_fin.rotation = lerpf(side_fin.rotation, sin(swim_phase * 0.91) * amount + turn_kick * 0.27, ease)
    var current := 0.0 if reduced_motion else sin(slow_phase) * 0.035
    back_hair.rotation = lerpf(back_hair.rotation, current + turn_kick * 0.5 + swim_blend * 0.018, ease)
    hair_strand.rotation = lerpf(hair_strand.rotation, -current * 1.6 + turn_kick * 0.85, ease)
    front_hair.rotation = lerpf(front_hair.rotation, -current * 0.6 - turn_kick * 0.25, ease)
    var rise := 0.0 if reduced_motion else sin(slow_phase * 1.2) * 1.6
    torso.position = Vector2(12.0, 24.0 + rise * (1.0 - boost_blend))
    torso.rotation = lerpf(torso.rotation, -velocity_value.y / 1400.0 * 0.12 + turn_kick * 0.18, ease)
    head_joint.rotation = lerpf(head_joint.rotation, -torso.rotation * 0.3, ease)
    var arm_sweep := 0.0 if reduced_motion else sin(swim_phase * 0.74 + 0.65) * amount
    near_arm.rotation = lerpf(near_arm.rotation,
        arm_sweep * 1.2 - 0.26 * boost_blend - 0.13 * leap_blend + hit_kick * 0.14, fast_ease)
    far_arm.rotation = lerpf(far_arm.rotation,
        -arm_sweep + 0.21 * boost_blend + 0.12 * leap_blend - hit_kick * 0.12, fast_ease)
    self_modulate.a = alpha_value
    if is_instance_valid(hero_light):
        var target_energy := 0.0 if reduced_motion else (0.24 + 0.24 * boost_blend)
        hero_light.energy = lerpf(hero_light.energy, target_energy, ease)
        hero_light.color = Color("#b6f8ff") if boost_blend > 0.4 else Color("#8ef8dc")
