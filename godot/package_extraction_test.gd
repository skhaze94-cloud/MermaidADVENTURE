extends SceneTree
## Follow Godot 4.4.1 ProjectDialog's ZIP extraction sequence exactly:
## only explicit directory entries create folders, using nonrecursive make_dir.
func _initialize() -> void:
    var args := OS.get_cmdline_user_args()
    if args.size() != 4:
        push_error("Expected OLD_ZIP OLD_DEST NEW_ZIP NEW_DEST")
        quit(1)
        return
    var old_failed := extract(args[0],args[1])
    var new_failed := extract(args[2],args[3])
    print("PACKAGE EXTRACTION: old failed files=",old_failed," new failed files=",new_failed)
    if old_failed > 0 and new_failed == 0:
        print("GODOT PACKAGE EXTRACTION TEST PASSED")
        quit(0)
    else:
        push_error("Package extraction regression")
        quit(1)
func extract(archive: String, destination: String) -> int:
    var reader := ZIPReader.new()
    if reader.open(archive) != OK:
        return -1
    var files := reader.get_files()
    var zip_root := ""
    for name in files:
        if name.get_file() == "project.godot":
            zip_root = name.get_base_dir()
            break
    DirAccess.make_dir_recursive_absolute(destination)
    var failed := 0
    for name in files:
        var relative: String = name.trim_prefix(zip_root)
        var path: String = destination.path_join(relative)
        if relative.is_empty():
            continue
        if relative.ends_with("/"):
            DirAccess.make_dir_absolute(path)
        else:
            var f := FileAccess.open(path,FileAccess.WRITE)
            if f:
                f.store_buffer(reader.read_file(name))
            else:
                failed += 1
    reader.close()
    return failed
