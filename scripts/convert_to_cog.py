#!/usr/bin/env python3
"""
Convert GeoTIFFs downloaded from Google Drive to Cloud-Optimized GeoTIFFs.
Uses rasterio (already installed) — no GDAL CLI required.

Usage (from project root):
    python scripts/convert_to_cog.py path/to/bauru_webgis

The converted COGs are placed directly in public/cogs/.
"""

import os
import sys
import tempfile

import rasterio
from rasterio.enums import Resampling
from rasterio.shutil import copy as rio_copy


import numpy as np


def target_dtype(filename):
    """
    geotiff.js only supports float32 (not float64).
    Force NDVI and LST to float32, LULC to int16.
    """
    stem = os.path.splitext(filename.lower())[0]
    if stem.startswith('lulc'):
        return 'int16', Resampling.nearest
    return 'float32', Resampling.average


def to_cog(src_path, dst_path):
    filename = os.path.basename(src_path)
    dtype, resamp = target_dtype(filename)

    with rasterio.open(src_path) as src:
        data = src.read().astype(dtype)

        profile = src.profile.copy()
        profile.update(
            driver='GTiff',
            dtype=dtype,
            compress='DEFLATE',
            predictor=2,
            tiled=True,
            blockxsize=256,
            blockysize=256,
        )

        fd, tmp = tempfile.mkstemp(suffix='.tif')
        os.close(fd)
        try:
            with rasterio.open(tmp, 'w', **profile) as ds:
                ds.write(data)
                ds.build_overviews([2, 4, 8], resamp)
                ds.update_tags(ns='rio_overview', resampling=resamp.name)
            with rasterio.open(tmp) as tmp_src:
                rio_copy(tmp_src, dst_path,
                         copy_src_overviews=True,
                         compress='DEFLATE', predictor=2,
                         tiled=True, blockxsize=256, blockysize=256)
        finally:
            os.unlink(tmp)


def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/convert_to_cog.py <input_folder>')
        sys.exit(1)

    input_dir = sys.argv[1]
    if not os.path.isdir(input_dir):
        print(f'Error: folder not found: {input_dir}')
        sys.exit(1)

    root = os.path.dirname(__file__)
    output_dir = os.path.normpath(os.path.join(root, '..', 'public', 'cogs'))
    os.makedirs(output_dir, exist_ok=True)

    tifs = [f for f in os.listdir(input_dir) if f.lower().endswith('.tif')]
    if not tifs:
        print(f'No .tif files found in {input_dir}')
        sys.exit(1)

    print(f'Input:  {input_dir}')
    print(f'Output: {output_dir}')
    print()

    for name in sorted(tifs):
        src_path = os.path.join(input_dir, name)
        dst_path = os.path.join(output_dir, name)
        dtype, _ = target_dtype(name)
        to_cog(src_path, dst_path)
        size_kb = os.path.getsize(dst_path) // 1024
        print(f'  OK  {name}  [{dtype}]  ({size_kb} KB)')

    print(f'\nDone — {len(tifs)} COG(s) written to public/cogs/')


if __name__ == '__main__':
    main()
