#!/usr/bin/env python3
"""
parse_litematic.py — Convert a Litematica .litematic schematic into Claude-friendly outputs.

Produces:
  <stem>_for_claude.md  — structured markdown summary to paste into a Claude conversation
  <stem>_full.json      — complete block/palette data, grouped by block type, for lookups

Design choices (noted because the spec asked):
  - We use absolute schematic coordinates (region origin + local) everywhere, so JSON queries
    like "what's at X,Y,Z" map to in-game coordinates the user sees in Litematica.
  - Air is omitted from the JSON. The markdown notes this.
  - ASCII silhouettes are capped at 80x80; larger builds are downsampled with an
    "any non-air in this NxN cell" rule, and the scale is reported.
  - Layer profile is sampled if there are more than 256 Y layers (every Nth layer kept),
    to keep the markdown under ~200 KB.
  - Wall/floor/symmetry detection is heuristic; we report assumptions inline.
"""

import argparse
import json
import math
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path

# Hard caps to keep the markdown output context-friendly (~200 KB target).
ASCII_MAX = 80
LAYER_PROFILE_MAX = 256
TOP_BLOCKS_PER_LAYER = 5
JSON_SOFT_LIMIT_BYTES = 50 * 1024 * 1024


def die(msg: str, code: int = 1):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


def load_schematic(path: Path):
    try:
        from litemapy import Schematic
    except ImportError as e:
        die(f"litemapy not installed: {e}. Run: pip install litemapy nbtlib")
    try:
        return Schematic.load(str(path))
    except Exception as e:
        die(f"failed to parse {path.name}: {type(e).__name__}: {e}")


def collect(schem):
    """
    Walk every region and gather:
      - palette: id -> count
      - props_seen: id -> set of frozenset(props.items())
      - blocks_by_type: id -> list of (x, y, z, props_index)
      - properties_table: list of dicts, indexed by props_index (deduped per id+props)
      - per-region summaries
      - per-Y layer counters
      - bounding box
    Coordinates are absolute (region origin + local).
    """
    palette_counts = Counter()
    props_seen = defaultdict(dict)        # id -> {frozenset(props): index_into_properties_table}
    blocks_by_type = defaultdict(list)    # id -> [[x, y, z, props_index], ...]
    properties_table = []                 # list of {"id":..., "properties": {...}}
    layer_counts = defaultdict(Counter)   # y -> Counter(block_id)
    region_summaries = []
    occupancy_xz_by_y = defaultdict(set)  # y -> set of (x, z) for any non-air block

    total_blocks = 0
    total_non_air = 0

    bbox = {"min_x": None, "min_y": None, "min_z": None,
            "max_x": None, "max_y": None, "max_z": None}

    def expand(x, y, z):
        if bbox["min_x"] is None or x < bbox["min_x"]: bbox["min_x"] = x
        if bbox["min_y"] is None or y < bbox["min_y"]: bbox["min_y"] = y
        if bbox["min_z"] is None or z < bbox["min_z"]: bbox["min_z"] = z
        if bbox["max_x"] is None or x > bbox["max_x"]: bbox["max_x"] = x
        if bbox["max_y"] is None or y > bbox["max_y"]: bbox["max_y"] = y
        if bbox["max_z"] is None or z > bbox["max_z"]: bbox["max_z"] = z

    for region_name, region in schem.regions.items():
        rx, ry, rz = region.x, region.y, region.z
        rw, rh, rl = abs(region.width), abs(region.height), abs(region.length)
        region_palette = Counter()
        region_volume = region.volume()

        # Iterate via the public block_positions() generator, which yields local coords
        # valid for both positive and negative-extent regions.
        for lx, ly, lz in region.block_positions():
            ax = rx + lx
            ay = ry + ly
            az = rz + lz
            block = region[lx, ly, lz]
            bid = block.id
            palette_counts[bid] += 1
            region_palette[bid] += 1
            total_blocks += 1
            expand(ax, ay, az)

            if bid == "minecraft:air" or bid == "minecraft:cave_air" or bid == "minecraft:void_air":
                continue

            total_non_air += 1
            occupancy_xz_by_y[ay].add((ax, az))
            layer_counts[ay][bid] += 1

            # Dedupe (id, properties) -> index. BlockState.properties is a method in litemapy 0.11.
            props = dict(block.properties())
            key = frozenset(props.items())
            id_props = props_seen[bid]
            if key in id_props:
                pidx = id_props[key]
            else:
                pidx = len(properties_table)
                properties_table.append({"id": bid, "properties": props})
                id_props[key] = pidx

            blocks_by_type[bid].append([ax, ay, az, pidx])

        # Top dominant blocks for this region (excluding air)
        non_air_pal = Counter({k: v for k, v in region_palette.items()
                               if k not in ("minecraft:air", "minecraft:cave_air", "minecraft:void_air")})
        dominant = non_air_pal.most_common(5)
        region_summaries.append({
            "name": region_name,
            "position": {"x": rx, "y": ry, "z": rz},
            "size": {"width": region.width, "height": region.height, "length": region.length},
            "abs_dims": {"w": rw, "h": rh, "l": rl},
            "volume": region_volume,
            "block_count": sum(non_air_pal.values()),
            "dominant_blocks": [{"id": b, "count": c} for b, c in dominant],
            "tile_entities": len(region.tile_entities),
            "entities": len(region.entities),
        })

    return {
        "palette_counts": palette_counts,
        "blocks_by_type": blocks_by_type,
        "properties_table": properties_table,
        "layer_counts": layer_counts,
        "region_summaries": region_summaries,
        "occupancy_xz_by_y": occupancy_xz_by_y,
        "bbox": bbox,
        "total_blocks": total_blocks,
        "total_non_air": total_non_air,
    }


def make_silhouette(occupancy: set, x_range, z_range, scale=1):
    """
    Build a 2D ASCII silhouette ('#' = any non-air in this cell, '.' = none).
    occupancy: set of (x, z)
    x_range, z_range: ranges of absolute coords to cover
    scale: grouping factor (1 = native, >1 = downsample)
    """
    xs = list(x_range)
    zs = list(z_range)
    if not xs or not zs:
        return "(empty)"
    width = math.ceil(len(xs) / scale)
    length = math.ceil(len(zs) / scale)
    grid = [["."] * width for _ in range(length)]
    x0, z0 = xs[0], zs[0]
    for (ax, az) in occupancy:
        if ax < xs[0] or ax > xs[-1] or az < zs[0] or az > zs[-1]:
            continue
        gx = (ax - x0) // scale
        gz = (az - z0) // scale
        grid[gz][gx] = "#"
    # Z increases southward in Minecraft; print so first row = lowest z (north top).
    return "\n".join("".join(row) for row in grid)


def silhouettes_for(occupancy_xz_by_y, bbox):
    """Pick three Y levels (bottom quarter, middle, top quarter) and render silhouettes."""
    if bbox["min_y"] is None:
        return []
    ys_with_blocks = sorted(occupancy_xz_by_y.keys())
    if not ys_with_blocks:
        return []
    y_lo = ys_with_blocks[len(ys_with_blocks) // 4]
    y_mid = ys_with_blocks[len(ys_with_blocks) // 2]
    y_hi = ys_with_blocks[(3 * len(ys_with_blocks)) // 4]
    chosen = [("bottom-quarter", y_lo), ("middle", y_mid), ("top-quarter", y_hi)]

    x_span = bbox["max_x"] - bbox["min_x"] + 1
    z_span = bbox["max_z"] - bbox["min_z"] + 1
    scale = max(1, math.ceil(max(x_span, z_span) / ASCII_MAX))

    out = []
    for label, y in chosen:
        occ = occupancy_xz_by_y[y]
        ascii_grid = make_silhouette(
            occ,
            range(bbox["min_x"], bbox["max_x"] + 1),
            range(bbox["min_z"], bbox["max_z"] + 1),
            scale=scale,
        )
        out.append({"label": label, "y": y, "scale": scale, "grid": ascii_grid,
                    "non_air_at_y": len(occ)})
    return out


def detect_features(layer_counts, occupancy_xz_by_y, bbox):
    """
    Cheap heuristics:
      - Floors: Y levels where one block type covers >= 60% of the layer's footprint
                AND >= 50 cells.
      - Walls: per Y, find the longest run of consecutive non-air cells along x and z;
               report Ys where that run is >= 8 (suggests wall-like structure).
      - Symmetry: compare middle-Y silhouette to its x-flip and z-flip; report match %.
    """
    floors = []
    for y, counter in layer_counts.items():
        total = sum(counter.values())
        if total < 50:
            continue
        top_id, top_count = counter.most_common(1)[0]
        if top_count / total >= 0.6:
            floors.append({"y": y, "block": top_id, "count": top_count, "share": top_count / total})

    walls = []
    for y, occ in occupancy_xz_by_y.items():
        if not occ:
            continue
        # Group by row (z) and column (x); find longest consecutive run in either axis.
        by_z = defaultdict(set)
        by_x = defaultdict(set)
        for (x, z) in occ:
            by_z[z].add(x)
            by_x[x].add(z)
        longest = 0
        for z, xs in by_z.items():
            xs_sorted = sorted(xs)
            run = 1
            for a, b in zip(xs_sorted, xs_sorted[1:]):
                run = run + 1 if b == a + 1 else 1
                if run > longest:
                    longest = run
        for x, zs in by_x.items():
            zs_sorted = sorted(zs)
            run = 1
            for a, b in zip(zs_sorted, zs_sorted[1:]):
                run = run + 1 if b == a + 1 else 1
                if run > longest:
                    longest = run
        if longest >= 8:
            walls.append({"y": y, "longest_run": longest})

    # Symmetry: pick the densest Y layer.
    sym = None
    if occupancy_xz_by_y:
        best_y = max(occupancy_xz_by_y, key=lambda y: len(occupancy_xz_by_y[y]))
        occ = occupancy_xz_by_y[best_y]
        if occ and bbox["min_x"] is not None:
            xmin, xmax = bbox["min_x"], bbox["max_x"]
            zmin, zmax = bbox["min_z"], bbox["max_z"]
            x_flip = {(xmax - (x - xmin), z) for (x, z) in occ}
            z_flip = {(x, zmax - (z - zmin)) for (x, z) in occ}
            x_match = len(occ & x_flip) / len(occ) if occ else 0.0
            z_match = len(occ & z_flip) / len(occ) if occ else 0.0
            sym = {"sample_y": best_y, "x_axis_match": x_match, "z_axis_match": z_match}

    # Sort and trim
    floors.sort(key=lambda d: d["y"])
    walls.sort(key=lambda d: d["y"])
    return {"floors": floors[:32], "walls": walls[:32], "symmetry": sym}


def fmt_int(n: int) -> str:
    return f"{n:,}"


def build_summary_text(schem, data, features, silhouettes, mc_version):
    bbox = data["bbox"]
    if bbox["min_x"] is None:
        return "Schematic has no blocks."
    width = bbox["max_x"] - bbox["min_x"] + 1
    height = bbox["max_y"] - bbox["min_y"] + 1
    length = bbox["max_z"] - bbox["min_z"] + 1
    volume = width * height * length
    fill_pct = 100.0 * data["total_non_air"] / volume if volume else 0.0

    lines = []
    lines.append(f"Schematic:        {schem.name or '(unnamed)'}")
    lines.append(f"Author:           {schem.author or '(unknown)'}")
    lines.append(f"Description:      {schem.description or '(none)'}")
    lines.append(f"Regions:          {len(data['region_summaries'])}")
    lines.append(f"MC data version:  {mc_version}")
    lines.append(f"Bounding box:     "
                 f"({bbox['min_x']},{bbox['min_y']},{bbox['min_z']}) -> "
                 f"({bbox['max_x']},{bbox['max_y']},{bbox['max_z']})")
    lines.append(f"Dimensions:       {width} W x {height} H x {length} L  "
                 f"(volume {fmt_int(volume)})")
    lines.append(f"Total cells:      {fmt_int(data['total_blocks'])}")
    lines.append(f"Non-air blocks:   {fmt_int(data['total_non_air'])}  "
                 f"({fill_pct:.2f}% fill)")
    lines.append(f"Air blocks:       {fmt_int(data['total_blocks'] - data['total_non_air'])}")
    lines.append(f"Unique block IDs: {len(data['palette_counts'])}")
    return "\n".join(lines)


def write_markdown(out_path: Path, schem, data, features, silhouettes,
                   mc_version, json_path: Path):
    bbox = data["bbox"]
    width = bbox["max_x"] - bbox["min_x"] + 1 if bbox["min_x"] is not None else 0
    height = bbox["max_y"] - bbox["min_y"] + 1 if bbox["min_x"] is not None else 0
    length = bbox["max_z"] - bbox["min_z"] + 1 if bbox["min_x"] is not None else 0
    volume = width * height * length
    fill_pct = 100.0 * data["total_non_air"] / volume if volume else 0.0

    md = []
    md.append(f"# Litematica schematic: {schem.name or '(unnamed)'}\n")
    md.append("## Metadata\n")
    md.append(f"- **Name**: {schem.name or '(unnamed)'}")
    md.append(f"- **Author**: {schem.author or '(unknown)'}")
    md.append(f"- **Description**: {schem.description or '(none)'}")
    md.append(f"- **Regions**: {len(data['region_summaries'])}")
    md.append(f"- **Minecraft data version**: {mc_version}\n")

    md.append("## Geometry\n")
    md.append(f"- **Bounding box**: ({bbox['min_x']}, {bbox['min_y']}, {bbox['min_z']}) "
              f"to ({bbox['max_x']}, {bbox['max_y']}, {bbox['max_z']})")
    md.append(f"- **Dimensions (W x H x L)**: {width} x {height} x {length}")
    md.append(f"- **Total volume**: {fmt_int(volume)} cells")
    md.append(f"- **Total cells iterated**: {fmt_int(data['total_blocks'])}")
    md.append(f"- **Non-air blocks**: {fmt_int(data['total_non_air'])} ({fill_pct:.2f}% fill)")
    md.append(f"- **Air blocks**: {fmt_int(data['total_blocks'] - data['total_non_air'])}\n")

    md.append("## Block palette (all block types, sorted by count)\n")
    md.append("| Block ID | Count | % of total cells |")
    md.append("|---|---:|---:|")
    total = data["total_blocks"] or 1
    for bid, count in data["palette_counts"].most_common():
        md.append(f"| `{bid}` | {fmt_int(count)} | {100.0 * count / total:.2f}% |")
    md.append("")

    md.append("## Per-region summary\n")
    for r in data["region_summaries"]:
        md.append(f"### Region: `{r['name']}`")
        md.append(f"- Position: ({r['position']['x']}, {r['position']['y']}, {r['position']['z']})")
        md.append(f"- Size (signed): {r['size']['width']} x {r['size']['height']} x {r['size']['length']}")
        md.append(f"- Size (absolute): {r['abs_dims']['w']} x {r['abs_dims']['h']} x {r['abs_dims']['l']}")
        md.append(f"- Volume: {fmt_int(r['volume'])}")
        md.append(f"- Non-air blocks: {fmt_int(r['block_count'])}")
        md.append(f"- Tile entities: {r['tile_entities']}, entities: {r['entities']}")
        if r["dominant_blocks"]:
            md.append("- Dominant non-air blocks:")
            for d in r["dominant_blocks"]:
                md.append(f"  - `{d['id']}` x {fmt_int(d['count'])}")
        md.append("")

    md.append("## Layer profile (per-Y, non-air count and top blocks)\n")
    layer_counts = data["layer_counts"]
    ys = sorted(layer_counts.keys())
    sampled_note = ""
    if len(ys) > LAYER_PROFILE_MAX:
        step = math.ceil(len(ys) / LAYER_PROFILE_MAX)
        ys = ys[::step]
        sampled_note = f" (sampled every {step} Y levels to fit context)"
    md.append(f"_{len(ys)} layers shown{sampled_note}. Top {TOP_BLOCKS_PER_LAYER} blocks per layer._\n")
    md.append("| Y | Non-air | Top blocks |")
    md.append("|---:|---:|---|")
    for y in ys:
        c = layer_counts[y]
        total_y = sum(c.values())
        top = ", ".join(f"`{b}` x{fmt_int(n)}" for b, n in c.most_common(TOP_BLOCKS_PER_LAYER))
        md.append(f"| {y} | {fmt_int(total_y)} | {top} |")
    md.append("")

    md.append("## ASCII top-down silhouettes\n")
    md.append("Legend: `#` = any non-air block at this (x, z, y) cell, `.` = air. "
              "Rows are ordered by Z (lowest Z at top of grid), columns by X (lowest X on the left).\n")
    if not silhouettes:
        md.append("_No non-air blocks; nothing to render._\n")
    for s in silhouettes:
        scale_note = "1:1" if s["scale"] == 1 else f"1 cell = {s['scale']}x{s['scale']} blocks (downsampled)"
        md.append(f"### Y = {s['y']} ({s['label']}) — {fmt_int(s['non_air_at_y'])} non-air blocks — {scale_note}")
        md.append("```")
        md.append(s["grid"])
        md.append("```")
    md.append("")

    md.append("## Detected structural features (heuristic)\n")
    md.append("_Heuristics (for transparency): a **floor** is a Y level with >= 50 non-air cells "
              "where one block type covers >= 60% of the footprint. A **wall** is a Y level with "
              "a consecutive run of non-air cells of length >= 8 along the X or Z axis. "
              "**Symmetry** is computed at the densest Y layer by flipping the silhouette and "
              "measuring the fraction of cells that line up._\n")
    if features["floors"]:
        md.append("### Floor-like layers")
        md.append("| Y | Dominant block | Count | Share |")
        md.append("|---:|---|---:|---:|")
        for f in features["floors"]:
            md.append(f"| {f['y']} | `{f['block']}` | {fmt_int(f['count'])} | {f['share']*100:.1f}% |")
        md.append("")
    else:
        md.append("- No floor-like layers detected.\n")

    if features["walls"]:
        md.append("### Wall-like layers (longest contiguous run >= 8)")
        md.append("| Y | Longest run |")
        md.append("|---:|---:|")
        for w in features["walls"]:
            md.append(f"| {w['y']} | {w['longest_run']} |")
        md.append("")
    else:
        md.append("- No obvious walls detected.\n")

    if features["symmetry"]:
        s = features["symmetry"]
        md.append("### Symmetry (sample layer)")
        md.append(f"- Sample Y: {s['sample_y']}")
        md.append(f"- X-axis flip match: {s['x_axis_match']*100:.1f}%")
        md.append(f"- Z-axis flip match: {s['z_axis_match']*100:.1f}%")
        verdict = []
        if s["x_axis_match"] >= 0.9: verdict.append("strong X-axis symmetry")
        if s["z_axis_match"] >= 0.9: verdict.append("strong Z-axis symmetry")
        if not verdict: verdict.append("no strong axial symmetry")
        md.append(f"- Verdict: {', '.join(verdict)}.\n")

    md.append("## Notes for Claude\n")
    md.append(f"- The companion JSON is at `{json_path.name}`. Attach it when you need:")
    md.append("  - Lookups for a specific (x, y, z) coordinate.")
    md.append("  - Exhaustive listings of a particular block type (e.g. all chests, all redstone components).")
    md.append("  - Block-state property values (facing, waterlogged, half, etc.).")
    md.append("- JSON structure:")
    md.append("  - `metadata`: schematic name, author, dimensions, regions, MC version.")
    md.append("  - `palette`: `{ block_id: {count, percentage, properties_seen} }`.")
    md.append("  - `blocks_by_type`: `{ block_id: [[x, y, z, props_index], ...] }` — coordinates absolute.")
    md.append("  - `properties_table`: deduped property dicts; `props_index` references this list.")
    md.append("- **Air is omitted from the JSON** to keep it compact; treat any (x, y, z) absent from "
              "`blocks_by_type` as air.")
    md.append("- Coordinates in both files are absolute schematic coordinates (region origin + local).")
    md.append("- ASCII silhouettes may be downsampled — see the per-grid scale annotation.")

    out_path.write_text("\n".join(md), encoding="utf-8")


def write_json(out_path: Path, schem, data, mc_version, dry_run_size_check=True):
    bbox = data["bbox"]
    width = bbox["max_x"] - bbox["min_x"] + 1 if bbox["min_x"] is not None else 0
    height = bbox["max_y"] - bbox["min_y"] + 1 if bbox["min_x"] is not None else 0
    length = bbox["max_z"] - bbox["min_z"] + 1 if bbox["min_x"] is not None else 0

    total = data["total_blocks"] or 1
    palette = {}
    for bid, count in data["palette_counts"].items():
        if bid in ("minecraft:air", "minecraft:cave_air", "minecraft:void_air"):
            continue
        # properties_seen: distinct property dicts observed for this block id
        seen = []
        for entry in data["properties_table"]:
            if entry["id"] == bid:
                seen.append(entry["properties"])
        palette[bid] = {
            "count": count,
            "percentage": round(100.0 * count / total, 4),
            "properties_seen": seen,
        }

    payload = {
        "metadata": {
            "name": schem.name,
            "author": schem.author,
            "description": schem.description,
            "minecraft_data_version": mc_version,
            "dimensions": {"width": width, "height": height, "length": length},
            "bounding_box": bbox,
            "regions": data["region_summaries"],
            "total_cells": data["total_blocks"],
            "non_air_blocks": data["total_non_air"],
            "note": "Air blocks are omitted from blocks_by_type.",
        },
        "palette": palette,
        "blocks_by_type": data["blocks_by_type"],
        "properties_table": data["properties_table"],
    }

    encoded = json.dumps(payload, separators=(",", ":"))
    size = len(encoded.encode("utf-8"))
    if dry_run_size_check and size > JSON_SOFT_LIMIT_BYTES:
        print(f"warning: JSON is {size / 1_000_000:.1f} MB (> 50 MB soft limit). "
              f"Writing anyway to {out_path.name}.", file=sys.stderr)
    out_path.write_text(encoded, encoding="utf-8")
    return size


def main():
    parser = argparse.ArgumentParser(
        description="Parse a Litematica .litematic file into Claude-friendly markdown + a "
                    "complete JSON dump grouped by block type.",
    )
    parser.add_argument("path", help="Path to the .litematic file")
    args = parser.parse_args()

    path = Path(args.path)
    if not path.exists():
        die(f"file not found: {path}")
    if path.suffix.lower() != ".litematic":
        die(f"expected a .litematic file, got: {path.suffix or '(no extension)'}")

    schem = load_schematic(path)
    raw_version = getattr(schem, "mc_version", None)
    try:
        mc_version = int(raw_version) if raw_version is not None else "unknown"
    except (TypeError, ValueError):
        mc_version = str(raw_version)

    data = collect(schem)
    features = detect_features(data["layer_counts"], data["occupancy_xz_by_y"], data["bbox"])
    silhouettes = silhouettes_for(data["occupancy_xz_by_y"], data["bbox"])

    stem = path.stem
    md_path = path.with_name(f"{stem}_for_claude.md")
    json_path = path.with_name(f"{stem}_full.json")

    write_markdown(md_path, schem, data, features, silhouettes, mc_version, json_path)
    json_size = write_json(json_path, schem, data, mc_version)

    summary = build_summary_text(schem, data, features, silhouettes, mc_version)
    print(summary)
    print()
    print(f"Markdown for Claude: {md_path}")
    print(f"Full JSON dump:      {json_path}  ({json_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
