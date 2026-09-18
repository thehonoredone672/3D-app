import sys
import open3d as o3d

MIN_POINTS = 4


def main():
    if len(sys.argv) != 3:
        print("Usage: mesh_from_points.py <input_points.ply> <output.glb>", file=sys.stderr)
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]

    pcd = o3d.io.read_point_cloud(input_path)
    if len(pcd.points) < MIN_POINTS:
        print(f"Too few reconstructed points ({len(pcd.points)}) to build a surface", file=sys.stderr)
        sys.exit(2)

    pcd.estimate_normals()
    pcd.orient_normals_consistent_tangent_plane(k=min(10, len(pcd.points) - 1))

    mesh, _densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=8)
    mesh.remove_degenerate_triangles()
    mesh.remove_duplicated_vertices()

    if len(mesh.triangles) == 0:
        print("Poisson reconstruction produced no surface from this point cloud", file=sys.stderr)
        sys.exit(3)

    # COLMAP's reconstruction coordinate system is arbitrary in both scale
    # and position. Center and scale the real geometry to a viewer-friendly
    # size - this repositions the mesh, it does not alter its shape.
    mesh.translate(-mesh.get_center())
    extent = mesh.get_max_bound() - mesh.get_min_bound()
    max_dim = max(extent) if max(extent) > 0 else 1.0
    mesh.scale(8.0 / max_dim, center=(0, 0, 0))

    ok = o3d.io.write_triangle_mesh(output_path, mesh)
    if not ok:
        print("Failed to write output mesh", file=sys.stderr)
        sys.exit(4)


if __name__ == "__main__":
    main()
