extends "res://godot/sarah_ribbon_mesh.gd"
## Continuous painted arm: shoulder sleeve stays fixed, elbow and wrist skin smoothly.
func skin(elbow_angle: float, wrist_angle: float) -> void:
    var points := rest.duplicate()
    var left := rest[0].x
    var length := rest[8].x-left # configure() uses eight columns.
    var elbow := Vector2(left+length*0.46,0.0)
    var wrist := elbow + Vector2(length*0.34,0.0).rotated(elbow_angle)
    for i in range(points.size()):
        var u := (rest[i].x-left)/length
        var bend := smoothstep(0.38,0.54,u)
        var p := rest[i].lerp(elbow+(rest[i]-elbow).rotated(elbow_angle),bend)
        var finger := smoothstep(0.74,0.86,u)
        points[i] = p.lerp(wrist+(p-wrist).rotated(wrist_angle),finger)
    polygon = points
    mesh_updates += 1
