import sys
import trimesh


def main():
    if len(sys.argv) != 3:
        print("Usage: convert_mesh.py <input_mesh> <output.glb>", file=sys.stderr)
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]
    mesh = trimesh.load(input_path)
    mesh.export(output_path)


if __name__ == "__main__":
    main()
